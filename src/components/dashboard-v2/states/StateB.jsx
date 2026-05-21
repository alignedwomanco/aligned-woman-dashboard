import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import PhaseIndicator from "@/components/dashboard-v2/PhaseIndicator";
import WorkbooksSection from "@/components/dashboard-v2/WorkbooksSection";

const BLUEPRINT_COURSE_ID = "69f4885c4fadbeea6d28a9be";

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

export default function StateB({ user, profile, workbookData = [], continueData }) {
  const navigate = useNavigate();

  const allPhases = continueData?.allPhasesData || [];
  const currentSection = continueData?.currentSection || null;
  const completedModules = continueData?.completedModulesInSection ?? 0;
  const totalModules = continueData?.totalModulesInSection ?? 0;
  const phaseIndex = continueData?.phaseIndex ?? 1;
  const totalSections = continueData?.totalSections ?? 0;
  const courseId = continueData?.courseId || BLUEPRINT_COURSE_ID;

  const nonWelcomePhases = allPhases.filter(p => {
    const title = (p.section?.title || "").toLowerCase();
    return p.section?.order !== 0 && !title.includes("welcome");
  });
  const currentPhaseIdx = nonWelcomePhases.findIndex(p => p.isCurrent);
  const upcomingPhases = nonWelcomePhases.filter((p, idx) => idx > currentPhaseIdx);

  const continueUrl = continueData?.module
    ? createPageUrl("ModulePlayer") + `?moduleId=${continueData.module.id}&courseId=${courseId}`
    : `${createPageUrl("CourseDetail")}?courseId=${courseId}`;

  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <section className="bg-awrose-pale rounded-xl p-8 md:p-10">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-deep mr-2 align-middle" />
          WELCOME TO THE BLUEPRINT
        </p>
        <h2 className="font-display text-awburg-core text-[34px] md:text-[44px] leading-tight mb-6">
          Five phases.<br />
          Fourteen practitioners.<br />
          <span className="italic text-awrose-core">Your</span> pace.
        </h2>
        <p className="font-body font-light text-awburg-core/80 text-base leading-relaxed max-w-xl mb-8">
          The Blueprint is not a course you finish. It is a practice you return to. Each phase opens when the one before it has settled. You set the pace.
        </p>
        <Link
          to={`${createPageUrl("CourseDetail")}?courseId=${courseId}`}
          className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep hover:shadow-md text-paper text-xs font-bold tracking-eyebrow uppercase py-4 px-8 rounded-full transition-all duration-200"
        >
          BEGIN PHASE 1: AWARENESS
          <ArrowRight className="w-4 h-4" />
        </Link>
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
              {continueData?.module?.title || "Begin Awareness"}
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

      {/* Optional quiz nudge */}
      <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-3">
          OPTIONAL · TWO MINUTES
        </p>
        <h3 className="font-display text-awburg-core text-[26px] md:text-[30px] leading-tight mb-3">
          Find your <span className="italic text-awrose-core">pattern</span>.
        </h3>
        <p className="font-body font-light text-awburg-core/75 text-sm leading-relaxed mb-5 max-w-lg">
          A short diagnostic. It will not change what you have access to. It will sharpen what you notice in the work.
        </p>
        <Link
          to="/quiz"
          className="font-body font-bold text-[11px] tracking-eyebrow text-awburg-core hover:underline uppercase inline-flex items-center gap-2 transition-colors"
        >
          TAKE THE QUIZ
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
    </div>
  );
}