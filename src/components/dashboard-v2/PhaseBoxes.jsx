import React from "react";
import { Lock, CheckCircle2 } from "lucide-react";

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
 * PhaseBoxes — renders the "What's Upcoming" grid of phase cards.
 *
 * Props:
 *   allPhasesData  — array from useContinueModule (phasesWithStatus)
 *   currentSection — the current section object (to exclude from upcoming)
 */
export default function PhaseBoxes({ allPhasesData = [], currentSection = null }) {
  const nonWelcomePhases = allPhasesData.filter((p) => {
    const title = (p.section?.title || "").toLowerCase();
    return p.section?.order !== 0 && !title.includes("welcome");
  });

  const currentPhaseIdx = nonWelcomePhases.findIndex((p) => p.isCurrent);
  const upcomingPhases = nonWelcomePhases.filter((_, idx) => idx > currentPhaseIdx);

  if (!upcomingPhases.length) return null;

  return (
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
  );
}