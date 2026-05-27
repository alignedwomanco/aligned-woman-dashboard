import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { getArchetype } from "@/data/archetypes";
import PhaseIndicator from "@/components/dashboard-v2/PhaseIndicator";
import PhaseBoxes from "@/components/dashboard-v2/PhaseBoxes";
import WorkbooksSection from "@/components/dashboard-v2/WorkbooksSection";

const KEY_MAP = {
  performer: "performer",
  over_functioner: "overFunctioner",
  delegator: "delegator",
  overrider: "overrider",
  reactor: "reactor",
};

export default function StateAWithQuiz({ user, profile, workbookData, continueData }) {
  const navigate = useNavigate();
  const [diagnosticSession, setDiagnosticSession] = useState(null);
  const [bestOpen, setBestOpen] = useState(true);
  const [worstOpen, setWorstOpen] = useState(false);

  const archetypeDbKey = profile?.computed_archetype_key;
  const archetypeDataKey = KEY_MAP[archetypeDbKey] || "performer";
  const arch = getArchetype(archetypeDataKey);
  const archetypeLabel = arch?.name || "The Performer";

  useEffect(() => {
    base44.entities.DiagnosticSession
      .filter({ isComplete: true }, "-created_date", 1)
      .then((sessions) => setDiagnosticSession(sessions?.[0] || null))
      .catch(() => setDiagnosticSession(null));
  }, []);

  const concerns = diagnosticSession?.concerns?.slice(0, 4) || [];

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
      {/* Phase Indicator */}
      <PhaseIndicator section={currentSection} completedModules={completedModules} totalModules={totalModules} phaseIndex={phaseIndex} totalPhases={totalSections} />

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

      {/* Phase boxes */}
      <PhaseBoxes allPhasesData={allPhases} courseId={courseId} />

      {/* Workbooks */}
      <WorkbooksSection workbooks={workbookData} phaseIndex={phaseIndex} />

      {/* Intake / Archetype card */}
      <section className="bg-awrose-pale rounded-xl p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-deep mr-2 align-middle" />
          WHY YOU STARTED · YOUR INTAKE
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6 items-start">
          <div>
            <h2 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-4">
              The reasons you<br />
              <span className="italic text-awrose-core">showed up</span>:
            </h2>

            {/* At Your Best - collapsible */}
            <button
              onClick={() => setBestOpen(!bestOpen)}
              className="w-full flex items-center justify-between py-3 border-b border-awburg-core/8"
            >
              <span className="font-body font-bold text-[10px] tracking-[0.24em] text-awburg-core uppercase">AT YOUR BEST</span>
              <ChevronDown
                className="w-4 h-4 text-awburg-core/50 transition-transform duration-200"
                style={{ transform: bestOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {bestOpen && (
              <p className="font-body font-light text-awburg-core/80 text-sm leading-relaxed py-3">
                {arch?.atBest || ""}
              </p>
            )}

            {/* At Your Worst - collapsible */}
            <button
              onClick={() => setWorstOpen(!worstOpen)}
              className="w-full flex items-center justify-between py-3 border-b border-awburg-core/8"
            >
              <span className="font-body font-bold text-[10px] tracking-[0.24em] text-awburg-core uppercase">AT YOUR WORST</span>
              <ChevronDown
                className="w-4 h-4 text-awburg-core/50 transition-transform duration-200"
                style={{ transform: worstOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {worstOpen && (
              <p className="font-body font-light text-awburg-core/80 text-sm leading-relaxed py-3">
                {arch?.atWorst || ""}
              </p>
            )}

            <div className="flex gap-4 items-center mt-5">
              <button onClick={() => window.location.href = "/StartingPointProfile"} className="inline-flex items-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200">
                EDIT MY ANSWERS <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => window.location.href = "/StartingPointProfile"} className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/60 hover:text-awburg-core uppercase transition-colors border border-awburg-core/20 rounded-full py-3 px-5">
                RETAKE THE QUIZ
              </button>
            </div>
          </div>

          {/* Archetype video card */}
          <div
            style={{
              width: "100%",
              aspectRatio: "9 / 16",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              background: "#3D0B27",
            }}
          >
            {arch?.videoUrl && (
              <video
                src={arch.videoUrl}
                muted
                playsInline
                autoPlay
                loop
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
            {/* Bottom gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(20,4,12,0.9) 0%, rgba(20,4,12,0.6) 30%, transparent 60%)",
                pointerEvents: "none",
              }}
            />
            {/* Overlay text */}
            <div style={{ position: "absolute", left: 16, right: 16, bottom: 18 }}>
              <p
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                  marginBottom: "8px",
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                {archetypeLabel}
              </p>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "10px",
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 300,
                  textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                }}
              >
                {arch?.atBest ? arch.atBest.split(". ").slice(0, 2).join(". ") + "." : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pattern explanation - dynamic from archetype data */}
      <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
          REVISITING YOUR PATTERN
        </p>
        <h3 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-5">
          The pattern, <span className="italic text-awrose-core">named</span>.
        </h3>
        <div className="space-y-4 max-w-2xl">
          {(arch?.fullDescription || "").split("\n").filter(Boolean).length > 0 ? (
            <>
              <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
                {arch.fullDescription}
              </p>
              <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
                The Aligned Woman Blueprint Course addresses this through two pillars. Your primary work begins in{" "}
                <span className="font-medium text-awburg-core">{arch.primaryPillar}</span>,{" "}
                {arch.primaryPillarNote} Your secondary work sits in{" "}
                <span className="font-medium text-awburg-core">{arch.secondaryPillar}</span>,{" "}
                {arch.secondaryPillarNote}
              </p>
              <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed italic">
                {arch.foundation}
              </p>
            </>
          ) : (
            <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
              {arch?.mirrorLine || "Your pattern has been identified. Explore your course to understand it fully."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}