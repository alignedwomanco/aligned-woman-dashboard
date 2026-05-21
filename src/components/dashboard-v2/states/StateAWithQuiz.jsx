import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import PhaseIndicator from "@/components/dashboard-v2/PhaseIndicator";
import WorkbooksSection from "@/components/dashboard-v2/WorkbooksSection";

const ARCHETYPE_LABELS = {
  performer: "The Performer",
  over_functioner: "The Over-Functioner",
  outsourcer: "The Outsourcer",
  overrider: "The Overrider",
  reactor: "The Reactor",
};

const PHASE_QUOTES = {
  awareness: "My body is not working against me, it is speaking to me.",
  liberation: "I do not have to live in survival mode anymore.",
  intention: "I think differently, so I choose differently.",
  "intentional action": "I think differently, so I choose differently.",
  vision: "What do I actually want?",
  embodiment: "This is who I am now.",
  "vision & embodiment": "What do I actually want?",
};

function stripPhasePrefix(t) {
  return (t || "").replace(/^Phase\s+\d+\s*[-:]\s*/i, "").trim();
}

function getPhaseQuote(section) {
  if (!section?.title) return "";
  const key = stripPhasePrefix(section.title).toLowerCase();
  return PHASE_QUOTES[key] || section.description || "";
}

export default function StateAWithQuiz({ user, profile, workbookData, continueData }) {
  const navigate = useNavigate();
  const [diagnosticSession, setDiagnosticSession] = useState(null);
  const archetypeKey = profile?.computed_archetype_key;
  const archetypeLabel = ARCHETYPE_LABELS[archetypeKey] || "The Performer";

  useEffect(() => {
    base44.entities.DiagnosticSession
      .filter({ isComplete: true }, "-created_date", 1)
      .then((sessions) => setDiagnosticSession(sessions?.[0] || null))
      .catch(() => setDiagnosticSession(null));
  }, []);

  const concerns = diagnosticSession?.concerns?.slice(0, 4) || [];

  // Real course data from useContinueModule
  const allPhases = continueData?.allPhasesData || [];
  const currentSection = continueData?.currentSection || null;
  const completedModules = continueData?.completedModulesInSection ?? 0;
  const totalModules = continueData?.totalModulesInSection ?? 0;
  const phaseIndex = continueData?.phaseIndex ?? 1;
  const totalSections = continueData?.totalSections ?? 0;
  const courseId = continueData?.courseId || null;

  const nonWelcomePhases = allPhases.filter(p => {
    const title = (p.section?.title || "").toLowerCase();
    return p.section?.order !== 0 && !title.includes("welcome");
  });
  const currentPhaseIdx = nonWelcomePhases.findIndex(p => p.isCurrent);
  const upcomingPhases = nonWelcomePhases.filter((p, idx) => idx > currentPhaseIdx);

  const continueUrl = continueData?.module
    ? createPageUrl("ModulePlayer") + `?moduleId=${continueData.module.id}&courseId=${courseId}`
    : courseId
      ? createPageUrl("CourseDetail") + `?courseId=${courseId}`
      : createPageUrl("Classroom");

  return (
    <div className="space-y-6">
      {/* Intake / Archetype card */}
      <section className="bg-awrose-pale rounded-xl p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-deep mr-2 align-middle" />
          WHY YOU STARTED · YOUR INTAKE
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 items-start">
          <div>
            <h2 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-4">
              The reasons you<br />
              <span className="italic text-awrose-core">showed up</span>:
            </h2>

            {concerns.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {concerns.map((c, i) => (
                  <span
                    key={i}
                    className="font-body text-xs text-awburg-core/80 bg-paper border border-awburg-core/10 rounded-full px-3 py-1.5"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            <p className="font-display italic text-awrose-deep text-sm leading-relaxed mb-6 max-w-md">
              On hard weeks, come back here. This is your north star.
            </p>

            <div className="flex gap-4 items-center">
              <button className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core hover:text-awburg-dark uppercase inline-flex items-center gap-1 transition-colors">
                EDIT MY ANSWERS &rarr;
              </button>
              <button className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/60 hover:text-awburg-core uppercase transition-colors">
                RETAKE THE QUIZ
              </button>
            </div>
          </div>

          <div className="bg-awburg-core rounded-xl p-6 text-center">
            <p className="font-body font-light text-paper/70 text-sm mb-1">You are</p>
            <p className="font-display italic text-awrose-light text-2xl leading-tight">
              {archetypeLabel}
            </p>
          </div>
        </div>
      </section>

      {/* Pattern explanation */}
      <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
          REVISITING YOUR PATTERN
        </p>
        <h3 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-5">
          The pattern, <span className="italic text-awrose-core">named</span>.
        </h3>
        <div className="space-y-4 max-w-2xl">
          <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
            Identity is performance-dependent. Without the performing, you have no reliable sense of self. The achievements stack up, but the sense of who you are without them does not. The performance becomes the identity. When the performance pauses, even briefly, the floor disappears.
          </p>
          <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
            This is not a character flaw. It is a survival adaptation. Most high-functioning women learn early that being valued is conditional on being impressive. The pattern made sense. It also made you exhausted.
          </p>
        </div>
      </section>

      {/* Phase Indicator: real data */}
      <PhaseIndicator
        section={currentSection}
        completedModules={completedModules}
        totalModules={totalModules}
        phaseIndex={phaseIndex}
        totalPhases={totalSections}
      />

      {/* Continue button */}
      <div className="bg-paper rounded-xl border border-awburg-core/8 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/50 uppercase mb-1">
              {continueData?.module ? `MODULE ${String(continueData.moduleIndex).padStart(2, "0")} OF ${String(totalModules).padStart(2, "0")}` : "YOUR NEXT STEP"}
            </p>
            <p className="font-display text-awburg-core text-lg leading-snug">
              {continueData?.module?.title || "Continue your phase"}
            </p>
            {continueData?.expert?.name && (
              <p className="font-body text-xs text-awburg-core/60 mt-1">with {continueData.expert.name}</p>
            )}
          </div>
          <button
            onClick={() => navigate(continueUrl)}
            className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200 flex-shrink-0"
          >
            CONTINUE YOUR PHASE
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* What's Upcoming: real data */}
      {upcomingPhases.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core uppercase">
              WHAT&apos;S UPCOMING
            </p>
            <p className="font-display italic text-awburg-core/60 text-sm">
              Each phase unlocks once the previous phase is complete.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {upcomingPhases.map((phaseData) => {
              const name = stripPhasePrefix(phaseData.section?.title);
              const letter = name?.[0]?.toUpperCase() || "?";
              const quote = getPhaseQuote(phaseData.section);
              const isUnlocked = !phaseData.isLocked;
              return (
                <div
                  key={phaseData.section?.id || name}
                  className={`bg-paper rounded-xl border border-awburg-core/8 p-4 ${isUnlocked ? "" : "opacity-70"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-display italic text-awrose-deep leading-none" style={{ fontSize: 36 }}>{letter}</span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-awrose-core flex-shrink-0 mt-1" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-awburg-core/30 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="font-body font-bold text-[9px] tracking-eyebrow text-awrose-core uppercase mb-1">{name.toUpperCase()}</p>
                  <p className="font-display italic text-awburg-core/80 text-sm leading-snug">{quote}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Workbooks: real data */}
      <WorkbooksSection workbooks={workbookData} phaseIndex={phaseIndex} />
    </div>
  );
}