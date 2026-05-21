import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import PhaseIndicator from "@/components/dashboard-v2/PhaseIndicator";
import WorkbooksSection from "@/components/dashboard-v2/WorkbooksSection";

const ARCHETYPES = [
  "The Performer",
  "The Over-Functioner",
  "The Outsourcer",
  "The Overrider",
  "The Reactor",
];

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

export default function StateANoQuiz({ user, profile, workbookData, continueData }) {
  const navigate = useNavigate();

  // Pull real data from useContinueModule (passed via Dashboard)
  const allPhases = continueData?.allPhasesData || [];
  const currentSection = continueData?.currentSection || null;
  const completedModules = continueData?.completedModulesInSection ?? 0;
  const totalModules = continueData?.totalModulesInSection ?? 0;
  const phaseIndex = continueData?.phaseIndex ?? 1;
  const totalSections = continueData?.totalSections ?? 0;
  const courseId = continueData?.courseId || null;

  // Filter out the welcome section (order 0) for upcoming phases
  const nonWelcomePhases = allPhases.filter(p => {
    const title = (p.section?.title || "").toLowerCase();
    return p.section?.order !== 0 && !title.includes("welcome");
  });

  // Current phase is the one marked isCurrent; upcoming are after it
  const currentPhaseIdx = nonWelcomePhases.findIndex(p => p.isCurrent);
  const upcomingPhases = nonWelcomePhases.filter((p, idx) => idx > currentPhaseIdx);

  // Build the "Continue your phase" URL
  const continueUrl = continueData?.module
    ? createPageUrl("ModulePlayer") + `?moduleId=${continueData.module.id}&courseId=${courseId}`
    : courseId
      ? createPageUrl("CourseDetail") + `?courseId=${courseId}`
      : createPageUrl("Classroom");

  return (
    <div className="space-y-6">
      {/* Quiz / Archetype Card */}
      <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
          FIND YOUR PATTERN
        </p>
        <h2 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-4">
          The diagnostic is <span className="italic text-awrose-core">waiting</span> for you.
        </h2>
        <p className="font-body font-light text-awburg-core/75 text-sm md:text-base leading-relaxed mb-6 max-w-xl">
          Two minutes. Five questions. The result is a pattern you have probably already lived for years. Naming it is the first thing the work asks of you.
        </p>

        <ul className="space-y-2 mb-6 max-w-md">
          {ARCHETYPES.map((name) => (
            <li
              key={name}
              className="flex items-center justify-between bg-awrose-wash rounded-lg px-4 py-3"
            >
              <span className="font-display italic text-awburg-core text-base">{name}</span>
              <Lock className="w-3.5 h-3.5 text-awburg-core/40" />
            </li>
          ))}
        </ul>

        <Link
          to="/quiz"
          className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep hover:shadow-md text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200"
        >
          TAKE THE QUIZ
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Phase Indicator: wired to real course data */}
      <PhaseIndicator
        section={currentSection}
        completedModules={completedModules}
        totalModules={totalModules}
        phaseIndex={phaseIndex}
        totalPhases={totalSections}
      />

      {/* Continue Your Phase button */}
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

      {/* What's Upcoming: wired to real phase data */}
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
                    <span
                      className="font-display italic text-awrose-deep leading-none"
                      style={{ fontSize: 36 }}
                    >
                      {letter}
                    </span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-awrose-core flex-shrink-0 mt-1" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-awburg-core/30 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="font-body font-bold text-[9px] tracking-eyebrow text-awrose-core uppercase mb-1">
                    {name.toUpperCase()}
                  </p>
                  <p className="font-display italic text-awburg-core/80 text-sm leading-snug">
                    {quote}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Workbooks: wired to real data */}
      <WorkbooksSection
        workbooks={workbookData}
        phaseIndex={phaseIndex}
      />
    </div>
  );
}