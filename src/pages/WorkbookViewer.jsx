import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import WorkbookSidebar from "@/components/workbook/WorkbookSidebar";
import WorkbookTopBar from "@/components/workbook/WorkbookTopBar";
import WorkbookBottomBar from "@/components/workbook/WorkbookBottomBar";
import WorkbookSectionContent from "@/components/workbook/WorkbookSectionContent";
import WorkbookCelebration from "@/components/workbook/WorkbookCelebration";

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

  if (workbooks?.length === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FAF5F3" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4A0E2E" }} />
      </div>
    );
  }

  if (!workbooks?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ background: "#FAF5F3" }}>
        <BookOpen className="w-12 h-12 mb-4" style={{ color: "#C4847A" }} />
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "#4A0E2E", marginBottom: 8 }}>
          No integration practices available
          </h2>
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#8A7A76", marginBottom: 24 }}>
            No integration practices are currently available.
          </p>
        <Link
          to="/Dashboard"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#4A0E2E", textDecoration: "none", fontFamily: "var(--aw-font-sans)" }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ background: "#FAF5F3" }}>
      <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 32, color: "#4A0E2E", marginBottom: 8, textAlign: "center" }}>
        Your Integration Practices
      </h2>
      <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#8A7A76", marginBottom: 40 }}>
        Choose an integration practice to open.
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

const FEMININE_WORKBOOK_ID = "6a1958f44abcf0360979ef18";

export default function WorkbookViewer() {
  const { search } = useLocation();
  const workbookId = new URLSearchParams(search).get("id") || null;

  if (workbookId === FEMININE_WORKBOOK_ID) {
    window.location.href = "/FeminineWorkbook";
    return null;
  }

  if (!workbookId) {
    return <WorkbookPicker />;
  }

  return <WorkbookViewerInner workbookId={workbookId} />;
}

function WorkbookViewerInner({ workbookId }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [responseId, setResponseId] = useState(null);
  const [responseLoaded, setResponseLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [completedAt, setCompletedAt] = useState(null);
  const [computedScores, setComputedScores] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const initialSectionId = useRef(null);
  const saveTimer = useRef(null);
  const contentRef = useRef(null);

  // Keep a synchronous mirror of responseId, plus a single in-flight create
  // promise. Both autosave paths route their creation through ensureResponseId
  // so that rapid edits can never create more than one WorkbookResponse row
  // for this user and workbook.
  const responseIdRef = useRef(null);
  const createPromiseRef = useRef(null);

  useEffect(() => {
    responseIdRef.current = responseId;
  }, [responseId]);

  const { data: workbook, isLoading: workbookLoading } = useQuery({
    queryKey: ["workbook", workbookId],
    queryFn: async () => {
      const items = await base44.entities.Workbook.filter({ id: workbookId });
      return items[0] || null;
    },
    enabled: !!workbookId,
    initialData: undefined,
  });

  const { data: expert } = useQuery({
    queryKey: ["workbookExpert", workbook?.expert_id],
    queryFn: () => base44.entities.Expert.filter({ id: workbook.expert_id }).then(r => r[0] || null),
    enabled: !!workbook?.expert_id,
  });

  const ensureResponseId = useCallback(async () => {
    if (responseIdRef.current) return responseIdRef.current;
    if (!createPromiseRef.current) {
      createPromiseRef.current = base44.entities.WorkbookResponse
        .create({ workbook_id: workbookId, answers: {} })
        .then((created) => {
          responseIdRef.current = created.id;
          setResponseId(created.id);
          return created.id;
        })
        .catch((err) => {
          // Allow a later save to retry creation if this attempt failed.
          createPromiseRef.current = null;
          throw err;
        });
    }
    return createPromiseRef.current;
  }, [workbookId]);

  const handleBackToDashboard = useCallback(() => {
    navigate("/Dashboard");
  }, [navigate]);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    base44.entities.WorkbookResponse.filter({ workbook_id: workbookId }, "-created_date", 1)
      .then(responses => {
        if (responses.length > 0) {
          responseIdRef.current = responses[0].id;
          setResponseId(responses[0].id);
          setAnswers(responses[0].answers || {});
          setIsComplete(responses[0].is_complete || false);
          setCompletedAt(responses[0].completed_at || null);
          setComputedScores(responses[0].computed_scores || null);
          initialSectionId.current = responses[0].last_section_id || null;
        }
      }).catch(() => {}).finally(() => setResponseLoaded(true));
  }, [workbookId]);

  const handleAnswerChange = useCallback((fieldId, value) => {
    setAnswers(prev => {
      const updated = { ...prev, [fieldId]: value };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const id = await ensureResponseId();
          await base44.entities.WorkbookResponse.update(id, { answers: updated });
          setLastSaved(new Date());
        } catch (e) {
          // Answers remain in local state; the next save attempt will retry.
        }
      }, 800);
      return updated;
    });
  }, [ensureResponseId]);

  const sections = useMemo(() => {
    if (!workbook?.schema?.sections) return [];
    return workbook.schema.sections;
  }, [workbook]);

  const progressiveDisclosure = workbook?.schema?.progressive_disclosure === true;

  const unlockedSections = useMemo(() => {
    if (!progressiveDisclosure) return sections.map((_, i) => i);
    const unlocked = [0];
    for (let i = 1; i < sections.length; i++) {
      const prev = sections[i - 1];
      const isComputedResults = prev.type === "computed_results";
      if (isComputedResults) {
        if (isComplete) unlocked.push(i);
      } else {
        const prevAnswered = prev.fields?.some(f => {
          const id = f.id || f.field_id;
          const v = answers[id];
          if (v === undefined || v === null) return false;
          if (typeof v === "string") return v.trim() !== "";
          if (typeof v === "number") return true;
          if (typeof v === "object") return Object.values(v).some(Boolean);
          return true;
        });
        if (prevAnswered) unlocked.push(i);
      }
    }
    return unlocked;
  }, [progressiveDisclosure, sections, answers, isComplete]);

  const assets = useMemo(() => {
    if (!workbook?.schema?.assets) return [];
    return workbook.schema.assets;
  }, [workbook]);

  useEffect(() => {
    if (!sections.length || !initialSectionId.current) return;
    const idx = sections.findIndex(s => s.id === initialSectionId.current);
    if (idx > 0) setActiveSection(idx);
    initialSectionId.current = null;
  }, [sections]);

  const progressPct = useMemo(() => {
    const fillable = sections.filter(s => s.display_only !== true);
    if (!fillable.length) return 0;
    const answered = fillable.filter(s =>
      s.fields?.some(f => {
        const v = answers[f.id];
        if (v === undefined || v === null) return false;
        if (typeof v === "string") return v.trim() !== "";
        if (typeof v === "object") return Object.keys(v).length > 0 && Object.values(v).some(Boolean);
        return true;
      })
    );
    return Math.round((answered.length / fillable.length) * 100);
  }, [sections, answers]);

  const jumpTo = useCallback((idx) => {
    setActiveSection(idx);
    setActiveStep(0);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    const sectionId = sections[idx]?.id || sections[idx]?.section_id;
    if (sectionId) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const id = await ensureResponseId();
          await base44.entities.WorkbookResponse.update(id, { last_section_id: sectionId });
          setLastSaved(new Date());
        } catch (e) {
          // Non-critical: section position will be saved on the next change.
        }
      }, 800);
    }
  }, [sections, ensureResponseId]);

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

  const stillLoading = workbookLoading || !responseLoaded;
  if (stillLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FAF5F3" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4A0E2E" }} />
      </div>
    );
  }

  if (workbook === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ background: "var(--aw-off-white)" }}>
        <BookOpen className="w-12 h-12 mb-4" style={{ color: "#C4847A" }} />
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "#4A0E2E", marginBottom: 8 }}>Integration Practice not found</h2>
        <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "#8A7A76", marginBottom: 24 }}>
          This integration practice does not exist or has been removed.
        </p>
        <Link
          to="/Dashboard"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#4A0E2E", textDecoration: "none", fontFamily: "var(--aw-font-sans)" }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleFinishWorkbook = async () => {
    const now = new Date().toISOString();
    try {
      const id = await ensureResponseId();
      await base44.entities.WorkbookResponse.update(id, {
        answers,
        is_complete: true,
        completed_at: now,
      });
    } catch (e) {
      // Local state still advances so the member sees their celebration.
    }
    setIsComplete(true);
    setCompletedAt(now);
    setShowCelebration(true);
  };

  const handleMarkInProgress = async () => {
    const id = responseIdRef.current;
    if (id) {
      try {
        await base44.entities.WorkbookResponse.update(id, { is_complete: false, completed_at: null });
      } catch (e) {
        // No-op: local state below reflects the change.
      }
    }
    setIsComplete(false);
    setCompletedAt(null);
  };

  const lastSectionIdx = sections.length - 1;

  return (
    <div className="wb-shell" style={{ minHeight: "100vh", background: "var(--aw-off-white)" }}>
      {showCelebration && (
        <WorkbookCelebration
          onContinueBlueprint={handleBackToDashboard}
          onBackToWorkbook={() => {
            setShowCelebration(false);
            jumpTo(lastSectionIdx);
          }}
          closingText={workbook.closing_text}
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
        unlockedSections={unlockedSections}
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
              key={section.id || section.section_id}
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
                 assets={assets}
                 computedScores={computedScores}
                 step={idx === activeSection ? activeStep : 0}
                 onStepChange={idx === activeSection ? setActiveStep : undefined}
                 />
              </div>
            </div>
          ))}
        </div>

        <WorkbookBottomBar
          sections={sections}
          activeSection={activeSection}
          activeStep={0}
          totalSteps={0}
          onPrev={() => jumpTo(Math.max(0, activeSection - 1))}
          onNext={() => {
            const nextIdx = activeSection + 1;
            if (nextIdx >= sections.length) return;
            jumpTo(nextIdx);
          }}
          nextLocked={progressiveDisclosure && !unlockedSections.includes(activeSection + 1)}
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