import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { createPageUrl } from "@/utils";
import PhaseIndicator from "@/components/dashboard-v2/PhaseIndicator";
import PhaseBoxes from "@/components/dashboard-v2/PhaseBoxes";
import WorkbooksSection from "@/components/dashboard-v2/WorkbooksSection";

const ARCHETYPES = [
  "The Performer",
  "The Over-Functioner",
  "The Delegator",
  "The Overrider",
  "The Reactor",
];

export default function StateANoQuiz({ user, profile, workbookData, continueData }) {
  const navigate = useNavigate();

  const allPhases = continueData?.allPhasesData || [];
  const currentSection = continueData?.currentSection || null;
  const completedModules = continueData?.completedModulesInSection ?? 0;
  const totalModules = continueData?.totalModulesInSection ?? 0;
  const phaseIndex = continueData?.phaseIndex ?? 1;
  const totalSections = continueData?.totalSections ?? 0;
  const courseId = continueData?.courseId || null;

  const continueUrl = continueData?.module
    ? createPageUrl("ModulePlayer") + `?moduleId=${continueData.module.id}&courseId=${courseId}`
    : courseId
      ? createPageUrl("CourseDetail") + `?courseId=${courseId}`
      : createPageUrl("Classroom");

  return (
    <div className="space-y-6">
      {/* Quiz card */}
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
            <li key={name} className="flex items-center justify-between bg-awrose-wash rounded-lg px-4 py-3">
              <span className="font-display italic text-awburg-core text-base">{name}</span>
              <Lock className="w-3.5 h-3.5 text-awburg-core/40" />
            </li>
          ))}
        </ul>
        <button onClick={() => window.location.href = "/StartingPointProfile"} className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep hover:shadow-md text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200">
          TAKE THE QUIZ <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Phase Indicator */}
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
          <button onClick={() => navigate(continueUrl)} className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200 flex-shrink-0">
            CONTINUE YOUR PHASE <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Phase boxes: real data, clickable */}
      <PhaseBoxes allPhasesData={allPhases} courseId={courseId} />

      {/* Workbooks */}
      <WorkbooksSection workbooks={workbookData} phaseIndex={phaseIndex} />
    </div>
  );
}