import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import PhaseIndicator from "@/components/dashboard-v2/PhaseIndicator";
import PhaseBoxes from "@/components/dashboard-v2/PhaseBoxes";
import WorkbooksSection from "@/components/dashboard-v2/WorkbooksSection";

export default function StateANoQuiz({ user, profile, workbookData, continueData }) {
  const navigate = useNavigate();

  const allPhases = continueData?.allPhasesData || [];
  const currentSection = continueData?.currentSection || null;
  const completedModules = continueData?.completedModulesInSection ?? 0;
  const totalModules = continueData?.totalModulesInSection ?? 0;
  const phaseIndex = continueData?.phaseIndex ?? 1;
  const totalSections = continueData?.totalSections ?? 0;
  const courseId = continueData?.courseId || null;

  // The whole course is finished. The continue action becomes a revisit that
  // starts again from the top of the course at Awareness.
  const isCourseComplete = continueData?.isCourseComplete === true;
  const restartModule = continueData?.restartModule || null;

  const continueUrl = continueData?.module
    ? createPageUrl("ModulePlayer") + `?moduleId=${continueData.module.id}&courseId=${courseId}`
    : isCourseComplete && restartModule
      ? createPageUrl("ModulePlayer") + `?moduleId=${restartModule.id}&courseId=${courseId}`
      : courseId
        ? createPageUrl("CourseDetail") + `?courseId=${courseId}`
        : createPageUrl("Classroom");

  // Welcome intro gate: until the Introduction is complete, the main action is
  // "Start here" and opens it. After that it reverts to the phase continue.
  const welcomeModule = continueData?.welcomeModule || null;
  const showWelcome = !!welcomeModule && continueData?.welcomeComplete === false;
  const welcomeExpertName = continueData?.welcomeExpertName || "";
  const primaryUrl = showWelcome && welcomeModule
    ? createPageUrl("ModulePlayer") + `?moduleId=${welcomeModule.id}&courseId=${courseId}`
    : continueUrl;

  return (
    <div className="space-y-6">
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
              {showWelcome
                ? "START HERE"
                : isCourseComplete
                ? "COURSE COMPLETE"
                : continueData?.module
                ? `MODULE ${String(continueData.moduleIndex).padStart(2, "0")} OF ${String(totalModules).padStart(2, "0")}`
                : "YOUR NEXT STEP"}
            </p>
            <p className="font-display text-awburg-core text-lg leading-snug">
              {showWelcome
                ? "Welcome to The Aligned Woman"
                : isCourseComplete
                ? "Revisit the course"
                : continueData?.module?.title || "Continue your phase"}
            </p>
            {showWelcome
              ? welcomeExpertName && (
                  <p className="font-body text-xs text-awburg-core/60 mt-1">with {welcomeExpertName}</p>
                )
              : isCourseComplete
              ? (
                  <p className="font-body text-xs text-awburg-core/60 mt-1">
                    You have completed all five phases. Begin again from Awareness.
                  </p>
                )
              : continueData?.expert?.name && (
                  <p className="font-body text-xs text-awburg-core/60 mt-1">with {continueData.expert.name}</p>
                )}
          </div>
          <button
            onClick={() => navigate(primaryUrl)}
            className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200 flex-shrink-0"
            style={isCourseComplete ? undefined : { animation: "continuePulse 2.5s ease-in-out infinite" }}
          >
            {showWelcome
              ? "START HERE"
              : isCourseComplete
              ? "REVISIT THE COURSE"
              : "CONTINUE YOUR PHASE"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
          <style>{`@keyframes continuePulse { 0%,100%{box-shadow:0 0 0 0 rgba(196,132,122,0.45)} 50%{box-shadow:0 0 0 8px rgba(196,132,122,0)} }`}</style>
        </div>
      </div>

      {/* Phase boxes: real data, clickable */}
      <PhaseBoxes allPhasesData={allPhases} courseId={courseId} />

      {/* Workbooks */}
      <WorkbooksSection workbooks={workbookData} phaseIndex={phaseIndex} />

      {/* Quiz nudge */}
      <section className="rounded-xl border border-awburg-core/8 p-6 md:p-8 overflow-hidden relative" style={{ minHeight: 180 }}>
        {/* Background video */}
        <video
          src="https://pub-e1032a6c8b9241cf9d03513d43a81f17.r2.dev/YourPattern.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
        />
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,2,6,0.55)", pointerEvents: "none" }} />
        <h3 className="relative font-display text-paper text-[26px] md:text-[30px] leading-tight mb-3">
          Find your <span className="italic text-awrose-light">pattern</span>.
        </h3>
        <p className="relative font-body font-light text-white text-sm leading-relaxed mb-5 max-w-lg">
          A short diagnostic. It will not change what you have access to. It will sharpen what you notice in the work.
        </p>
        <button onClick={() => window.location.href = "/StartingPointProfile"} className="relative font-body font-bold text-[11px] tracking-eyebrow text-paper hover:text-awrose-light uppercase inline-flex items-center gap-2 transition-colors">
          TAKE THE QUIZ <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
}