import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2 } from "lucide-react";
import { createPageUrl } from "@/utils";

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

/**
 * Renders all course phases as clickable boxes with real completion status.
 *
 * Props:
 *   allPhasesData - array from useContinueModule (phasesWithStatus)
 *   courseId      - used for navigation links
 */
export default function PhaseBoxes({ allPhasesData = [], courseId }) {
  const navigate = useNavigate();
  if (allPhasesData.length === 0) return null;

  const handleClick = (phaseData) => {
    if (phaseData.isLocked) return;
    const url = `${createPageUrl("CourseDetail")}?courseId=${courseId}`;
    navigate(url);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core uppercase">
          YOUR PHASES
        </p>
        <p className="font-display italic text-awburg-core/60 text-sm">
          Each phase unlocks once the previous phase is complete.
        </p>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${allPhasesData.length}, minmax(0, 1fr))` }}>
        {allPhasesData.map((phaseData) => {
          const name = stripPhasePrefix(phaseData.section?.title);
          const letter = name?.[0]?.toUpperCase() || "?";
          const quote = getPhaseQuote(phaseData.section);
          const isComplete = phaseData.isComplete;
          const isCurrent = phaseData.isCurrent;
          const isLocked = phaseData.isLocked;
          const isClickable = !isLocked;

          return (
            <div
              key={phaseData.section?.id || name}
              onClick={isClickable ? () => handleClick(phaseData) : undefined}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : -1}
              onKeyDown={(e) => { if (isClickable && e.key === "Enter") handleClick(phaseData); }}
              className={[
                "relative rounded-xl border overflow-hidden p-4 transition-colors",
                isLocked
                  ? "border-awburg-core/8 opacity-60 cursor-not-allowed"
                  : isCurrent
                    ? "border-awrose-core/40 cursor-pointer"
                    : "border-awburg-core/8 cursor-pointer",
              ].join(" ")}
            >
              {/* Background video */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
              >
                <source src="https://pub-f81092ac00b24c449008a93f41d7542d.r2.dev/6102718_Smoky%20Smoke%20Plume%20Vapor_By_Via_Films_Artlist_HD.mp4" type="video/mp4" />
              </video>
              {/* Colour overlay */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "#C4847B", opacity: 0.82, zIndex: 1 }}
              />
              {/* Content */}
              <div className="relative" style={{ zIndex: 2 }}>
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="font-display italic leading-none text-white"
                    style={{ fontSize: 36 }}
                  >
                    {letter}
                  </span>
                  {isComplete && !isLocked ? (
                    <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0 mt-1" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-white/50 flex-shrink-0 mt-1" />
                  ) : null}
                </div>
                <p className="font-body font-bold text-[9px] tracking-eyebrow text-white uppercase mb-1">
                  {name.toUpperCase()}
                </p>
                <p className="font-display italic text-white/90 text-sm leading-snug">
                  {quote}
                </p>
                {isCurrent && (
                  <span className="inline-block mt-2 bg-awburg-core text-white font-body font-bold text-[8px] tracking-eyebrow uppercase rounded-full px-2 py-0.5">
                    CURRENT
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}