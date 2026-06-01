import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import WorkbookSidebar from "@/components/workbook/WorkbookSidebar";
import WorkbookTopBar from "@/components/workbook/WorkbookTopBar";
import WorkbookBottomBar from "@/components/workbook/WorkbookBottomBar";
import WorkbookCelebration from "@/components/workbook/WorkbookCelebration";
import FemFieldRenderer from "@/components/workbook/feminine/FemFieldRenderer";
import FemComputedFields from "@/components/workbook/feminine/FemComputedFields";
import FoundationRatingField from "@/components/workbook/feminine/FoundationRatingField";

const WORKBOOK_ID = "6a1958f44abcf0360979ef18";

export default function FeminineWorkbook() {
  const [workbook, setWorkbook] = useState(null);
  const [expert, setExpert] = useState(null);
  const [answers, setAnswers] = useState({});
  const [responseId, setResponseId] = useState(null);
  const [responseLoaded, setResponseLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const saveTimer = useRef(null);
  const initialSectionIdRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    Promise.all([
      base44.entities.Workbook.filter({ id: WORKBOOK_ID }, null, 1).then(r => r[0] || null),
      base44.entities.WorkbookResponse.filter({ workbook_id: WORKBOOK_ID }, "-created_date", 1),
    ]).then(([wb, responses]) => {
      setWorkbook(wb);
      if (wb?.expert_id) {
        base44.entities.Expert.filter({ id: wb.expert_id }).then(r => setExpert(r[0] || null));
      }
      if (responses.length > 0) {
        const r = responses[0];
        setResponseId(r.id);
        setAnswers(r.answers || {});
        setIsComplete(r.is_complete || false);
        initialSectionIdRef.current = r.last_section_id || null;
      }
    }).catch(() => {}).finally(() => {
      setResponseLoaded(true);
      setIsLoading(false);
    });
  }, []);

  const wbCourseId = workbook?.course_id || null;

  const { data: allModules = [] } = useQuery({
    queryKey: ["femAllModules", wbCourseId],
    queryFn: () => base44.entities.CourseModule.filter({ courseId: wbCourseId }, "order", 500),
    enabled: !!wbCourseId,
  });

  const { data: allSections = [] } = useQuery({
    queryKey: ["femAllSections", wbCourseId],
    queryFn: () => base44.entities.CourseSection.filter({ courseId: wbCourseId }, "order", 500),
    enabled: !!wbCourseId,
  });

  const { data: allPages = [] } = useQuery({
    queryKey: ["femAllPages", wbCourseId],
    queryFn: async () => {
      const results = await Promise.all(
        allModules.map((m) => base44.entities.CoursePage.filter({ moduleId: m.id }, "order", 500))
      );
      return results.flat();
    },
    enabled: allModules.length > 0,
  });



  const sections = useMemo(() => workbook?.schema?.sections || [], [workbook]);

  useEffect(() => {
    if (!sections.length || !initialSectionIdRef.current) return;
    const idx = sections.findIndex(s => s.section_id === initialSectionIdRef.current);
    if (idx > 0) setActiveSection(idx);
    initialSectionIdRef.current = null;
  }, [sections]);

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

  const jumpTo = useCallback(async (idx) => {
    setActiveSection(idx);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    const sId = sections[idx]?.section_id;
    if (sId) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (responseId) {
          await base44.entities.WorkbookResponse.update(responseId, { last_section_id: sId });
        } else {
          const created = await base44.entities.WorkbookResponse.create({ workbook_id: WORKBOOK_ID, answers: {}, last_section_id: sId });
          setResponseId(created.id);
        }
        setLastSaved(new Date());
      }, 800);
    }
  }, [sections, responseId]);

  const progressPct = useMemo(() => {
    const fillable = sections.filter(s => s.fields?.some(f => !f.type?.startsWith("content_block") && !f.type?.startsWith("computed")));
    if (!fillable.length) return 0;
    const answered = fillable.filter(s =>
      s.fields?.some(f => {
        const v = answers[f.field_id];
        if (v === undefined || v === null) return false;
        if (typeof v === "string") return v.trim() !== "";
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "number") return true;
        if (typeof v === "object") return Object.keys(v).length > 0;
        return true;
      })
    );
    return Math.round((answered.length / fillable.length) * 100);
  }, [sections, answers]);

  const handleComplete = async () => {
    const now = new Date().toISOString();
    const mascIds = answers.s02_wounded_masc || [];
    const femIds = answers.s02_wounded_fem || [];
    const allMascItems = sections.find(s => s.section_id === "s02_energy_honest")?.fields?.find(f => f.field_id === "s02_wounded_masc")?.items || [];
    const allFemItems = sections.find(s => s.section_id === "s02_energy_honest")?.fields?.find(f => f.field_id === "s02_wounded_fem")?.items || [];
    const catCount = {};
    [...allMascItems.filter(i => mascIds.includes(i.id)), ...allFemItems.filter(i => femIds.includes(i.id))].forEach(i => {
      catCount[i.category] = (catCount[i.category] || 0) + 1;
    });
    const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
    const structRatings = (typeof answers.s07_structures === "object" && !Array.isArray(answers.s07_structures) && answers.s07_structures !== null) ? answers.s07_structures : {};
    const structCount = Object.values(structRatings).reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0);
    const scores = {
      energy_dominant: mascIds.length > femIds.length + 2 ? "masculine" : femIds.length > mascIds.length + 2 ? "feminine" : "mixed",
      energy_masculine_count: mascIds.length,
      energy_feminine_count: femIds.length,
      top_categories: topCats,
      vitals: {
        sales_energy: answers.s04_energy_scale || null,
        intuition_trust: answers.s05_intuition_scale || null,
        energy_tank: answers.s06_tank || null,
      },
      foundation_score: structCount,
      foundation_total: 7,
    };
    const payload = { is_complete: true, completed_at: now, computed_scores: scores };
    if (responseId) {
      await base44.entities.WorkbookResponse.update(responseId, payload);
    } else {
      const created = await base44.entities.WorkbookResponse.create({ workbook_id: WORKBOOK_ID, answers, ...payload });
      setResponseId(created.id);
    }
    setIsComplete(true);
    setShowCelebration(true);
  };

  const sectionsWithNumbers = useMemo(() => sections.map((s, i) => ({ ...s, section_number: i })), [sections]);

  const lastSectionIdx = sections.length - 1;

  if (isLoading || !responseLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--aw-off-white)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--aw-burg-core)" }} />
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6" style={{ background: "var(--aw-off-white)" }}>
        <BookOpen className="w-12 h-12 mb-4" style={{ color: "var(--aw-rose-core)" }} />
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontSize: 28, color: "var(--aw-burg-core)", marginBottom: 8 }}>Workbook not found</h2>
        <Link to="/Dashboard" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--aw-burg-core)", textDecoration: "none", fontFamily: "var(--aw-font-sans)" }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (showCelebration) {
    return (
      <WorkbookCelebration
        onBackToWorkbook={() => { setShowCelebration(false); jumpTo(lastSectionIdx); }}
        closingText={workbook.closing_text}
        onContinueBlueprint={() => window.location.href = "/Dashboard"}
      />
    );
  }

  return (
    <div className="wb-shell" style={{ minHeight: "100vh", background: "var(--aw-off-white)" }}>
      <WorkbookSidebar
        workbook={workbook}
        expert={expert}
        user={user}
        sections={sectionsWithNumbers}
        activeSection={activeSection}
        answers={answers}
        onJumpTo={jumpTo}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        unlockedSections={sectionsWithNumbers.map((_, i) => i)}
        onContinueNext={() => window.location.href = "/Dashboard"}
      />

      <div className="wb-main-col flex flex-col min-h-screen">
        <WorkbookTopBar
          sections={sectionsWithNumbers}
          activeSection={activeSection}
          progressPct={progressPct}
          lastSaved={lastSaved}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        <div className="flex-1">
          {sectionsWithNumbers.map((section, idx) => (
            <div
              key={section.section_id}
              className={`wb-section-block ${idx === activeSection ? "wb-section-active" : "wb-section-inactive"}`}
            >
              <div className="wb-page" style={{ maxWidth: 720, margin: "0 auto", padding: "56px 40px 80px" }}>
                <FemSectionContent
                  section={section}
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                  allSections={sections}
                  isLastSection={idx === lastSectionIdx}
                  isComplete={isComplete}
                  onComplete={handleComplete}
                  onContinueBlueprint={() => window.location.href = "/Dashboard"}
                />
              </div>
            </div>
          ))}
        </div>

        <WorkbookBottomBar
          sections={sectionsWithNumbers}
          activeSection={activeSection}
          activeStep={0}
          totalSteps={0}
          onPrev={() => jumpTo(Math.max(0, activeSection - 1))}
          onNext={() => {
            if (activeSection === lastSectionIdx) {
              handleComplete();
            } else {
              jumpTo(Math.min(lastSectionIdx, activeSection + 1));
            }
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

function FemSectionContent({ section, answers, onAnswerChange, allSections, isLastSection, isComplete, onComplete, onContinueBlueprint }) {
  return (
    <div>
      {section.part_label && (
        <p style={{
          fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10,
          letterSpacing: "0.28em", textTransform: "uppercase",
          color: "var(--aw-rose-core)", marginBottom: 10,
        }}>
          {section.part_label}
        </p>
      )}
      <h1 style={{
        fontFamily: "var(--aw-font-display)", fontWeight: 400,
        fontSize: "clamp(28px, 4vw, 40px)", fontStyle: "italic",
        lineHeight: 1.1, letterSpacing: "-0.01em",
        color: "var(--aw-burg-core)", margin: "0 0 10px",
      }}>
        {section.heading}
      </h1>
      {section.theme_line && (
        <p style={{
          fontFamily: "var(--aw-font-display)", fontSize: 18,
          fontStyle: "italic", color: "var(--aw-rose-deep)",
          margin: "0 0 24px",
        }}>
          {section.theme_line}
        </p>
      )}
      {section.intro_text && (
        <p style={{
          fontFamily: "var(--aw-font-sans)", fontSize: 15, color: "var(--aw-dark-grey)",
          lineHeight: 1.75, margin: "0 0 36px",
          paddingBottom: 28, borderBottom: "1px solid var(--aw-border-light)",
        }}>
          {section.intro_text}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {section.fields?.map(field => (
          <FemField
            key={field.field_id}
            field={field}
            answers={answers}
            onAnswerChange={onAnswerChange}
            allSections={allSections}
          />
        ))}
      </div>

      {isLastSection && !isComplete && (
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--aw-border-light)", textAlign: "center" }}>
          <button
            onClick={onComplete}
            className="wb-btn wb-btn--primary"
            style={{ fontSize: 11 }}
          >
            Mark Complete
          </button>
        </div>
      )}
      {isLastSection && isComplete && (
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--aw-border-light)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 13, color: "var(--aw-rose-core)", fontWeight: 600, marginBottom: 20 }}>
            ✓ Workbook Complete
          </p>
          {onContinueBlueprint && (
            <button
              onClick={onContinueBlueprint}
              className="wb-btn wb-btn--primary"
              style={{ fontSize: 11 }}
            >
              Continue the Blueprint
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const SUPPRESSED_ATTRIBUTIONS = ["THE ASSIGNMENT"];

function FemField({ field, answers, onAnswerChange, allSections }) {
  const value = answers[field.field_id];

  if (field.type === "content_block" && field.variant === "callout") {
    const attr = (field.attribution || "").toUpperCase();
    if (SUPPRESSED_ATTRIBUTIONS.some(s => attr.includes(s))) return null;
  }

  if (field.type === "computed_energy_portrait") {
    return <FemComputedFields.EnergyPortrait field={field} answers={answers} allSections={allSections} />;
  }
  if (field.type === "computed_foundation_score") {
    return <FemComputedFields.FoundationScore field={field} answers={answers} allSections={allSections} />;
  }
  if (field.type === "foundation_rating") {
    return (
      <FoundationRatingField
        field={field}
        value={value}
        onChange={(val) => onAnswerChange(field.field_id, val)}
      />
    );
  }
  if (field.type === "reference_back") {
    return <FemComputedFields.ReferenceBack field={field} answers={answers} />;
  }
  if (field.type === "computed_snapshot") {
    return <FemComputedFields.Snapshot field={field} answers={answers} allSections={allSections} />;
  }

  return (
    <FemFieldRenderer
      field={field}
      value={value}
      answers={answers}
      onChange={(val) => onAnswerChange(field.field_id, val)}
    />
  );
}