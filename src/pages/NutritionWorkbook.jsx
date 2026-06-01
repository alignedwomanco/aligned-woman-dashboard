import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen, Download, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import WorkbookSidebar from "@/components/workbook/WorkbookSidebar";
import WorkbookTopBar from "@/components/workbook/WorkbookTopBar";
import WorkbookBottomBar from "@/components/workbook/WorkbookBottomBar";
import WorkbookSectionContent from "@/components/workbook/WorkbookSectionContent";
import WorkbookCelebration from "@/components/workbook/WorkbookCelebration";
import { getNextModuleForWorkbook, isFlowReady } from "@/lib/courseFlow";

const WORKBOOK_ID = "6a104ae93e4fc7402ba59f6e";

export default function NutritionWorkbook() {
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

  const { data: workbook, isLoading: workbookLoading } = useQuery({
    queryKey: ["workbook", WORKBOOK_ID],
    queryFn: async () => {
      const items = await base44.entities.Workbook.filter({ id: WORKBOOK_ID });
      return items[0] || null;
    },
    initialData: undefined,
  });

  const { data: expert } = useQuery({
    queryKey: ["workbookExpert", workbook?.expert_id],
    queryFn: () => base44.entities.Expert.filter({ id: workbook.expert_id }).then(r => r[0] || null),
    enabled: !!workbook?.expert_id,
  });

  const wbCourseId = workbook?.course_id || null;

  const { data: wbAllModules = [] } = useQuery({
    queryKey: ["wbAllCourseModules", wbCourseId],
    queryFn: () => base44.entities.CourseModule.filter({ courseId: wbCourseId }, "order", 500),
    enabled: !!wbCourseId,
  });

  const { data: wbAllSections = [] } = useQuery({
    queryKey: ["wbAllCourseSections", wbCourseId],
    queryFn: () => base44.entities.CourseSection.filter({ courseId: wbCourseId }, "order", 500),
    enabled: !!wbCourseId,
  });

  const { data: wbAllPages = [] } = useQuery({
    queryKey: ["wbAllCoursePages", wbCourseId],
    queryFn: async () => {
      const results = await Promise.all(
        wbAllModules.map((m) => base44.entities.CoursePage.filter({ moduleId: m.id }, "order", 500))
      );
      return results.flat();
    },
    enabled: wbAllModules.length > 0,
  });

  const flowReady = isFlowReady(wbAllSections, wbAllModules, wbAllPages);
  const wbNextModule = useMemo(
    () => (flowReady ? getNextModuleForWorkbook(workbook, wbAllSections, wbAllModules, wbAllPages) : null),
    [flowReady, workbook, wbAllSections, wbAllModules, wbAllPages]
  );

  const handleContinueBlueprint = useCallback(() => {
    if (!flowReady) return;
    if (wbNextModule) {
      const cid = wbCourseId ? `&courseId=${wbCourseId}` : "";
      window.location.href = `/ModulePlayer?moduleId=${wbNextModule.id}${cid}`;
    } else {
      window.location.href = "/Dashboard";
    }
  }, [flowReady, wbNextModule, wbCourseId]);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  useEffect(() => {
    base44.entities.WorkbookResponse.filter({ workbook_id: WORKBOOK_ID }, "-created_date", 1)
      .then(responses => {
        if (responses.length > 0) {
          setResponseId(responses[0].id);
          setAnswers(responses[0].answers || {});
          setIsComplete(responses[0].is_complete || false);
          setCompletedAt(responses[0].completed_at || null);
          setComputedScores(responses[0].computed_scores || null);
          initialSectionId.current = responses[0].last_section_id || null;
        }
      }).catch(() => {}).finally(() => setResponseLoaded(true));
  }, []);

  const handleAnswerChange = useCallback((fieldId, value) => {
    setAnswers(prev => {
      const updated = { ...prev, [fieldId]: value };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (responseId) {
          await base44.entities.WorkbookResponse.update(responseId, { answers: updated });
        } else {
          const created = await base44.entities.WorkbookResponse.create({ workbook_id: WORKBOOK_ID, answers: updated });
          setResponseId(created.id);
        }
        setLastSaved(new Date());
      }, 800);
      return updated;
    });
  }, [responseId]);

  const sections = useMemo(() => {
    if (!workbook?.schema?.sections) return [];
    return workbook.schema.sections;
  }, [workbook]);

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
        if (responseId) {
          await base44.entities.WorkbookResponse.update(responseId, { last_section_id: sectionId });
        } else {
          const created = await base44.entities.WorkbookResponse.create({ workbook_id: WORKBOOK_ID, answers: {}, last_section_id: sectionId });
          setResponseId(created.id);
        }
        setLastSaved(new Date());
      }, 800);
    }
  }, [sections, responseId]);

  const stillLoading = workbookLoading || !responseLoaded;
  if (stillLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--aw-off-white)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--aw-burg-core)" }} />
      </div>
    );
  }

  if (workbook === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ background: "var(--aw-off-white)" }}>
        <BookOpen className="w-12 h-12 mb-4" style={{ color: "var(--aw-rose-core)" }} />
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "var(--aw-burg-core)", marginBottom: 8 }}>Integration Practice not found</h2>
        <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "var(--aw-mid-grey)", marginBottom: 24 }}>
          This integration practice does not exist or has been removed.
        </p>
        <Link
          to="/Dashboard"
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--aw-burg-core)", textDecoration: "none", fontFamily: "var(--aw-font-sans)" }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

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

  const lastSectionIdx = sections.length - 1;

  const continueButton = flowReady ? (
    <button
      onClick={handleContinueBlueprint}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: "var(--aw-burg-core)", color: "#fff", border: "none", borderRadius: 100,
        padding: "14px 28px", cursor: "pointer", fontFamily: "var(--aw-font-sans)",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
      }}
    >
      Continue the Blueprint
      <ChevronRight className="w-3.5 h-3.5" />
    </button>
  ) : null;

  return (
    <div className="wb-shell" style={{ minHeight: "100vh", background: "var(--aw-off-white)" }}>
      {showCelebration && (
        <WorkbookCelebration
          onContinueBlueprint={flowReady ? handleContinueBlueprint : undefined}
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
        unlockedSections={sections.map((_, i) => i)}
        onContinueNext={flowReady ? handleContinueBlueprint : undefined}
      />

      <div className="wb-main-col flex flex-col min-h-screen">
        <WorkbookTopBar
          sections={sections}
          activeSection={activeSection}
          progressPct={progressPct}
          lastSaved={lastSaved}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        <div className="wb-page" style={{ maxWidth: 720, margin: "0 auto", padding: "32px 40px 0", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {expert?.profile_picture ? (
                <img src={expert.profile_picture} alt={expert.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
              ) : null}
              <div>
                {expert?.name && (
                  <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 14, color: "var(--aw-burg-core)", margin: 0 }}>
                    {expert.name}
                  </p>
                )}
                {expert?.title && (
                  <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 12, color: "var(--aw-mid-grey)", margin: 0 }}>
                    {expert.title}
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {workbook.blank_pdf_url && (
                <a
                  href={workbook.blank_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    border: "1px solid rgba(74,14,46,0.2)", borderRadius: 100,
                    padding: "12px 20px", textDecoration: "none",
                    fontFamily: "var(--aw-font-sans)", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--aw-burg-core)",
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
              )}
              {continueButton}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {sections.map((section, idx) => (
            <div
              key={section.id || section.section_id}
              className={`wb-section-block ${idx === activeSection ? "wb-section-active" : "wb-section-inactive"}`}
            >
              <div className="wb-page" style={{ maxWidth: 720, margin: "0 auto", padding: "32px 40px 80px" }}>
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
                  onContinueNext={flowReady ? handleContinueBlueprint : undefined}
                />

                {idx === lastSectionIdx && continueButton && (
                  <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid rgba(74,14,46,0.08)", textAlign: "center" }}>
                    {continueButton}
                  </div>
                )}
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
          nextLocked={false}
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
          .wb-main-col { margin-left: 0 !important; min-height: auto !important; }
          .wb-shell { min-height: auto !important; background: white !important; }
          .wb-page { max-width: 100% !important; padding: 40px 32px !important; margin: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}