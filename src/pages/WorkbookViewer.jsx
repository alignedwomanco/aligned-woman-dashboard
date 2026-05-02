import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Lock, Loader2 } from "lucide-react";
import useWorkbookUnlock from "@/hooks/useWorkbookUnlock";
import WorkbookSidebar from "@/components/workbook/WorkbookSidebar";
import WorkbookTopBar from "@/components/workbook/WorkbookTopBar";
import WorkbookBottomBar from "@/components/workbook/WorkbookBottomBar";
import WorkbookSectionContent from "@/components/workbook/WorkbookSectionContent";
import WorkbookCelebration from "@/components/workbook/WorkbookCelebration";


export default function WorkbookViewer() {
  const params = new URLSearchParams(window.location.search);
  const workbookId = params.get("id") || "69f33599d88c56b89b9545a8";

  const [activeSection, setActiveSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [responseId, setResponseId] = useState(null);
  const [responseLoaded, setResponseLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [completedAt, setCompletedAt] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const initialSectionId = useRef(null); // stores last_section_id from loaded response
  const saveTimer = useRef(null);
  const contentRef = useRef(null);

  // Fetch workbook
  const { data: workbook, isLoading } = useQuery({
    queryKey: ["workbook", workbookId],
    queryFn: async () => {
      const items = await base44.entities.Workbook.filter({ id: workbookId });
      return items[0] || null;
    },
    enabled: !!workbookId,
    initialData: undefined,
  });

  // Fetch expert
  const { data: expert } = useQuery({
    queryKey: ["workbookExpert", workbook?.expert_id],
    queryFn: async () => {
      const items = await base44.entities.Expert.filter({ id: workbook.expert_id });
      return items[0] || null;
    },
    enabled: !!workbook?.expert_id,
  });

  // Admin bypass
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckDone, setAdminCheckDone] = useState(false);
  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.role === "admin" || u?.role === "owner" || u?.role === "master_admin") setIsAdmin(true);
    }).catch(() => {}).finally(() => setAdminCheckDone(true));
  }, []);

  // Unlock check
  const { isUnlocked: rawUnlocked, isLoading: isCheckingUnlock } = useWorkbookUnlock(workbook);
  const isUnlocked = isAdmin || rawUnlocked;

  // Load existing WorkbookResponse
  useEffect(() => {
    if (!workbookId) return;
    base44.entities.WorkbookResponse.filter({ workbook_id: workbookId }, "-created_date", 1)
      .then(responses => {
        if (responses?.length > 0) {
          setResponseId(responses[0].id);
          setAnswers(responses[0].answers || {});
          setIsComplete(responses[0].is_complete || false);
          setCompletedAt(responses[0].completed_at || null);
          // Store last_section_id for resume — will be resolved once sections are available
          initialSectionId.current = responses[0].last_section_id || null;
        }
      }).catch(() => {}).finally(() => setResponseLoaded(true));
  }, [workbookId]);

  // Autosave answers (and optionally last_section_id)
  const persistData = useCallback((updated, extraFields = {}) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const payload = { answers: updated, ...extraFields };
      if (responseId) {
        await base44.entities.WorkbookResponse.update(responseId, payload);
      } else {
        const created = await base44.entities.WorkbookResponse.create({ workbook_id: workbookId, ...payload });
        setResponseId(created.id);
      }
      setLastSaved(new Date());
    }, 800);
  }, [responseId, workbookId]);

  const handleAnswerChange = useCallback((fieldId, value) => {
    setAnswers(prev => {
      const updated = { ...prev, [fieldId]: value };
      persistData(updated);
      return updated;
    });
  }, [persistData]);

  // Sections
  const sections = useMemo(() => {
    if (!workbook?.schema?.sections) return [];
    return workbook.schema.sections;
  }, [workbook]);

  // Resume on reload: once sections are available, resolve initialSectionId to an index
  useEffect(() => {
    if (!sections.length || !initialSectionId.current) return;
    const idx = sections.findIndex(s => s.id === initialSectionId.current);
    if (idx > 0) setActiveSection(idx);
    initialSectionId.current = null; // consume once
  }, [sections]);

  // Progress calculation: count all atomic fillable fields across all sections
  const progressPct = useMemo(() => {
    if (!sections.length) return 0;
    let total = 0;
    let filled = 0;
    sections.forEach(section => {
      section.fields?.forEach(field => {
        if (field.type === "checkbox_group") {
          const optCount = field.options?.length || 0;
          total += optCount;
          const checked = answers[field.id];
          if (checked && typeof checked === "object") {
            filled += Object.values(checked).filter(Boolean).length;
          }
        } else if (field.type === "grid") {
          const cells = (field.rows?.length || 0) * (field.columns?.length || 0);
          total += cells;
          const g = answers[field.id];
          if (g && typeof g === "object") {
            filled += Object.values(g).filter(v => v !== "" && v !== undefined && v !== null).length;
          }
        } else if (field.type === "structured_list") {
          const rows = field.min_rows || 3;
          const cols = field.columns?.length || 1;
          total += rows * cols;
          const l = answers[field.id];
          if (l && typeof l === "object") {
            filled += Object.values(l).filter(v => typeof v === "string" ? v.trim() !== "" : !!v).length;
          }
        } else if (field.type === "numbered_list" && !field.display_only) {
          const items = field.items?.filter(i => i.field_type) || [];
          total += items.length;
          items.forEach((_, idx) => {
            const key = `${field.id}_item_${idx}`;
            const v = answers[key];
            if (v && typeof v === "string" && v.trim() !== "") filled++;
          });
        } else if (field.type === "long_text" || field.type === "short_text") {
          total += 1;
          const v = answers[field.id];
          if (v && typeof v === "string" && v.trim() !== "") filled++;
        } else if (field.type === "callout" && field.input) {
          total += 1;
          const v = answers[field.id];
          if (v && typeof v === "string" && v.trim() !== "") filled++;
        }
      });
    });
    if (total === 0) return 0;
    return Math.round((filled / total) * 100);
  }, [sections, answers]);

  // Section navigation — also persists last_section_id
  const jumpTo = useCallback((idx) => {
    setActiveSection(idx);
    setDrawerOpen(false);
    // Persist last_section_id along with current answers
    const sectionId = sections[idx]?.id;
    if (sectionId) {
      setAnswers(prev => {
        persistData(prev, { last_section_id: sectionId });
        return prev;
      });
    }
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [sections, persistData]);

  // Keyboard navigation — delegates to jumpTo which handles setActiveSection + persist
  const activeSectionRef = useRef(0);
  activeSectionRef.current = activeSection;

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(activeSectionRef.current + 1, sections.length - 1);
        if (next !== activeSectionRef.current) jumpTo(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const next = Math.max(activeSectionRef.current - 1, 0);
        if (next !== activeSectionRef.current) jumpTo(next);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [sections.length, jumpTo]);

  // If no workbook ID in URL, show error immediately
  if (!workbookId) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FAF5F3", color: "var(--aw-mid-grey)" }}>
        <p>No workbook selected. Please go back and choose a workbook.</p>
      </div>
    );
  }

  // Loading — wait for workbook, then also for unlock/admin/response checks
  const stillLoading = isLoading || !adminCheckDone || !responseLoaded || (!!workbook && isCheckingUnlock);
  if (stillLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FAF5F3" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4A0E2E" }} />
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--aw-off-white)", color: "var(--aw-mid-grey)" }}>
        <p>Workbook not found.</p>
      </div>
    );
  }

  // Completion flow handlers
  const handleFinishWorkbook = async () => {
    const now = new Date().toISOString();
    if (responseId) {
      await base44.entities.WorkbookResponse.update(responseId, { is_complete: true, completed_at: now });
    }
    setIsComplete(true);
    setCompletedAt(now);
    setShowCelebration(true);
  };

  const handleMarkInProgress = async () => {
    if (responseId) {
      await base44.entities.WorkbookResponse.update(responseId, { is_complete: false, completed_at: null });
    }
    setIsComplete(false);
    setCompletedAt(null);
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ background: "var(--aw-off-white)" }}>
        <Lock className="w-12 h-12 mb-4" style={{ color: "var(--aw-rose-core)" }} />
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "var(--aw-burg-core)", marginBottom: 8 }}>Workbook Locked</h2>
        <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "var(--aw-mid-grey)" }}>
          Complete all modules for this course to unlock this workbook.
        </p>
      </div>
    );
  }

  // Determine if a section is the last section (summary)
  const lastSectionIdx = sections.length - 1;

  return (
    <div className="wb-shell" style={{ minHeight: "100vh", background: "var(--aw-off-white)" }}>
      {/* Celebration overlay */}
      {showCelebration && (
        <WorkbookCelebration
          onBackToWorkbook={() => {
            setShowCelebration(false);
            jumpTo(lastSectionIdx);
          }}
        />
      )}

      {/* Sidebar */}
      <WorkbookSidebar
        workbook={workbook}
        expert={expert}
        user={user}
        sections={sections}
        activeSection={activeSection}
        answers={answers}
        onJumpTo={jumpTo}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Main column — offset by sidebar width on desktop */}
      <div className="wb-main-col flex flex-col min-h-screen">
        {/* Top bar */}
        <WorkbookTopBar
          sections={sections}
          activeSection={activeSection}
          progressPct={progressPct}
          lastSaved={lastSaved}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        {/* Content area — all sections in DOM; only active visible on screen */}
        <div className="flex-1" ref={contentRef}>
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className={`wb-section-block ${idx === activeSection ? "wb-section-active" : "wb-section-inactive"}`}
            >
              <div className="wb-page" style={{ maxWidth: 720, margin: "0 auto", padding: "56px 40px 80px" }}>
                <WorkbookSectionContent
                  section={section}
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                  sections={sections}
                  onJumpToSection={jumpTo}
                  isLastSection={idx === lastSectionIdx}
                  isComplete={isComplete}
                  completedAt={completedAt}
                  onFinish={handleFinishWorkbook}
                  onMarkInProgress={handleMarkInProgress}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <WorkbookBottomBar
          sections={sections}
          activeSection={activeSection}
          onPrev={() => jumpTo(Math.max(0, activeSection - 1))}
          onNext={() => jumpTo(Math.min(sections.length - 1, activeSection + 1))}
        />
      </div>

      {/* Responsive layout + Print styles */}
      <style>{`
        @media (min-width: 1025px) {
          .wb-main-col { margin-left: 320px; }
        }
        @media (max-width: 720px) {
          .wb-page { padding: 32px 22px 60px !important; }
        }

        /* Screen: only active section visible */
        .wb-section-inactive { display: none; }
        .wb-section-active   { display: block; }

        /* ── Print styles ── */
        @media print {
          /* Show all sections */
          .wb-section-inactive { display: block !important; }
          .wb-section-active   { display: block !important; }

          /* Page break before each section (except the first) */
          .wb-section-block + .wb-section-block { break-before: page; }

          /* Hide interactive chrome */
          .wb-sidebar-desktop,
          .wb-scrim,
          .wb-topbar,
          .wb-bottombar,
          [data-wb-topbar],
          [data-wb-bottombar] { display: none !important; }

          /* Hide cta_row buttons (START NOW / DOWNLOAD PDF) */
          [data-field-type="cta_row"] { display: none !important; }

          /* Remove fixed/sticky positioning, sidebar offset */
          .wb-main-col {
            margin-left: 0 !important;
            min-height: auto !important;
          }
          .wb-shell {
            min-height: auto !important;
            background: white !important;
          }

          /* Reset page padding for clean print */
          .wb-page {
            max-width: 100% !important;
            padding: 40px 32px !important;
            margin: 0 !important;
          }

          /* Ensure brand typography prints */
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}