import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Lock, Loader2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import useWorkbookUnlock from "@/hooks/useWorkbookUnlock";
import WorkbookSidebar from "@/components/workbook/WorkbookSidebar";
import WorkbookTopBar from "@/components/workbook/WorkbookTopBar";
import WorkbookBottomBar from "@/components/workbook/WorkbookBottomBar";
import WorkbookSectionContent from "@/components/workbook/WorkbookSectionContent";
import WorkbookCelebration from "@/components/workbook/WorkbookCelebration";

// ── No-ID picker: shown when /Workbook has no ?id= param ──────────────────────
function WorkbookPicker() {
  const { data: workbooks, isLoading } = useQuery({
    queryKey: ["publishedWorkbooks"],
    queryFn: () => base44.entities.Workbook.filter({ status: "published" }),
  });

  useEffect(() => {
    if (workbooks?.length === 1) {
      window.location.replace(`/Workbook?id=${workbooks[0].id}`);
    }
  }, [workbooks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FAF5F3" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4A0E2E" }} />
      </div>
    );
  }

  // Single workbook: redirect is handled above; show spinner while navigating
  if (workbooks?.length === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FAF5F3" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4A0E2E" }} />
      </div>
    );
  }

  // No workbooks
  if (!workbooks?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ background: "#FAF5F3" }}>
        <BookOpen className="w-12 h-12 mb-4" style={{ color: "#C4847A" }} />
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "#4A0E2E", marginBottom: 8 }}>
          No workbooks available
        </h2>
        <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#8A7A76", marginBottom: 24 }}>
          No workbooks are currently available.
        </p>
        <Link
          to="/Dashboard"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#fff", background: "#C4847A", padding: "12px 28px", borderRadius: 100,
            textDecoration: "none", fontFamily: "var(--aw-font-sans)" }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Multiple workbooks — show picker
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16" style={{ background: "#FAF5F3" }}>
      <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 32, color: "#4A0E2E", marginBottom: 8, textAlign: "center" }}>
        Your Workbooks
      </h2>
      <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#8A7A76", marginBottom: 40 }}>
        Choose a workbook to open.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 480 }}>
        {workbooks.map(wb => (
          <a
            key={wb.id}
            href={`/Workbook?id=${wb.id}`}
            style={{
              display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
              background: "#fff", borderRadius: 12, border: "1px solid rgba(74,14,46,0.08)",
              textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.15s",
            }}
          >
            {wb.cover_image_url ? (
              <img src={wb.cover_image_url} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 8, background: "linear-gradient(135deg,#C4847A,#4A0E2E)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookOpen style={{ width: 24, height: 24, color: "#fff" }} />
              </div>
            )}
            <div>
              <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 15, color: "#1a1a1a", margin: 0 }}>{wb.title}</p>
              {wb.subtitle && <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 12, color: "#8A7A76", margin: "2px 0 0" }}>{wb.subtitle}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Main Workbook Viewer ───────────────────────────────────────────────────────
export default function WorkbookViewer() {
  const params = new URLSearchParams(window.location.search);
  const workbookId = params.get("id") || null;

  // No ID in URL — delegate to picker
  if (!workbookId) {
    return <WorkbookPicker />;
  }

  return <WorkbookViewerInner workbookId={workbookId} />;
}

function WorkbookViewerInner({ workbookId }) {
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
  const initialSectionId = useRef(null);
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

  // Auth: load user for display (admin check is now inside the hook)
  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  // Unlock check (hook now handles admin bypass internally)
  const { isUnlocked, isLoading: isCheckingUnlock } = useWorkbookUnlock(workbook);

  // Load existing WorkbookResponse
  useEffect(() => {
    base44.entities.WorkbookResponse.filter({ workbook_id: workbookId }, "-created_date", 1)
      .then(responses => {
        if (responses?.length > 0) {
          setResponseId(responses[0].id);
          setAnswers(responses[0].answers || {});
          setIsComplete(responses[0].is_complete || false);
          setCompletedAt(responses[0].completed_at || null);
          initialSectionId.current = responses[0].last_section_id || null;
        }
      }).catch(() => {}).finally(() => setResponseLoaded(true));
  }, [workbookId]);

  // Autosave answers only (last_section_id is saved separately in jumpTo)
  const persistData = useCallback((updated) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (responseId) {
        await base44.entities.WorkbookResponse.update(responseId, { answers: updated });
      } else {
        const created = await base44.entities.WorkbookResponse.create({ workbook_id: workbookId, answers: updated });
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

  // Resume on reload
  useEffect(() => {
    if (!sections.length || !initialSectionId.current) return;
    const idx = sections.findIndex(s => s.id === initialSectionId.current);
    if (idx > 0) setActiveSection(idx);
    initialSectionId.current = null;
  }, [sections]);

  // Progress calculation
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

  // Section navigation — persists last_section_id on every section change
  const jumpTo = useCallback((idx) => {
    setActiveSection(idx);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    const sectionId = sections[idx]?.id;
    if (sectionId) {
      // Persist last_section_id independently of field autosave
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (responseId) {
          await base44.entities.WorkbookResponse.update(responseId, { last_section_id: sectionId });
        } else {
          const created = await base44.entities.WorkbookResponse.create({ workbook_id: workbookId, answers: {}, last_section_id: sectionId });
          setResponseId(created.id);
        }
        setLastSaved(new Date());
      }, 800);
    }
  }, [sections, responseId, workbookId]);

  // Keyboard navigation
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

  // ── Loading state ──
  // Wait for: workbook query + response load + unlock check (only once workbook is known)
  const stillLoading = isLoading || !responseLoaded || (!!workbook && isCheckingUnlock);
  if (stillLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FAF5F3" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4A0E2E" }} />
      </div>
    );
  }

  // ── Workbook not found ──
  if (!workbook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ background: "var(--aw-off-white)" }}>
        <BookOpen className="w-12 h-12 mb-4" style={{ color: "#C4847A" }} />
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "#4A0E2E", marginBottom: 8 }}>Workbook not found</h2>
        <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#8A7A76", marginBottom: 24 }}>
          This workbook does not exist or has been removed.
        </p>
        <Link
          to="/Dashboard"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#fff", background: "#C4847A", padding: "12px 28px", borderRadius: 100,
            textDecoration: "none", fontFamily: "var(--aw-font-sans)" }}
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // ── Completion handlers ──
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

  // ── Locked ──
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

  const lastSectionIdx = sections.length - 1;

  return (
    <div className="wb-shell" style={{ minHeight: "100vh", background: "var(--aw-off-white)" }}>
      {showCelebration && (
        <WorkbookCelebration
          onBackToWorkbook={() => {
            setShowCelebration(false);
            jumpTo(lastSectionIdx);
          }}
        />
      )}

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

      <div className="wb-main-col flex flex-col min-h-screen">
        <WorkbookTopBar
          sections={sections}
          activeSection={activeSection}
          progressPct={progressPct}
          lastSaved={lastSaved}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

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

        <WorkbookBottomBar
          sections={sections}
          activeSection={activeSection}
          onPrev={() => jumpTo(Math.max(0, activeSection - 1))}
          onNext={() => jumpTo(Math.min(sections.length - 1, activeSection + 1))}
        />
      </div>

      <style>{`
        @media (min-width: 1025px) { .wb-main-col { margin-left: 320px; } }
        @media (max-width: 720px) { .wb-page { padding: 32px 22px 60px !important; } }
        .wb-section-inactive { display: none; }
        .wb-section-active   { display: block; }
        @media print {
          .wb-section-inactive { display: block !important; }
          .wb-section-active   { display: block !important; }
          .wb-section-block + .wb-section-block { break-before: page; }
          .wb-sidebar-desktop, .wb-scrim, .wb-topbar, .wb-bottombar,
          [data-wb-topbar], [data-wb-bottombar] { display: none !important; }
          [data-field-type="cta_row"] { display: none !important; }
          .wb-main-col { margin-left: 0 !important; min-height: auto !important; }
          .wb-shell { min-height: auto !important; background: white !important; }
          .wb-page { max-width: 100% !important; padding: 40px 32px !important; margin: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}