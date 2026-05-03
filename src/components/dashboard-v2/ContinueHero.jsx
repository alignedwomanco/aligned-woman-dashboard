import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

const PHASE_CONFIG = {
  awareness: {
    letter: "A",
    name: "AWARENESS",
    quote: "My body is not working against me. It is speaking to me.",
    number: 1,
    ctaLabel: "CONTINUE AWARENESS",
  },
  liberation: {
    letter: "L",
    name: "LIBERATION",
    quote: "I do not have to live in survival mode anymore.",
    number: 2,
    ctaLabel: "CONTINUE LIBERATION",
  },
  intentional_action: {
    letter: "I",
    name: "INTENTIONAL ACTION",
    quote: "I think differently, so I choose differently.",
    number: 3,
    ctaLabel: "CONTINUE INTENTIONAL ACTION",
  },
  vision: {
    letter: "V",
    name: "VISION",
    quote: "What do I actually want?",
    number: 4,
    ctaLabel: "CONTINUE VISION",
  },
  embodiment: {
    letter: "E",
    name: "EMBODIMENT",
    quote: "This is who I am now.",
    number: 5,
    ctaLabel: "CONTINUE EMBODIMENT",
  },
};

const TOTAL_PHASES = 5;

export default function ContinueHero({
  module,
  expert,
  completedPages,
  totalPages,
  moduleIndex,
  totalModules,
  nextPageId,
  eyebrowOverride,
  titleOverride,
  currentPhase = "awareness",
}) {
  const completed = completedPages || 0;
  const total = totalPages || 0;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const phaseKey = (currentPhase || "awareness").toLowerCase().replace(/ /g, "_");
  const phase = PHASE_CONFIG[phaseKey] || PHASE_CONFIG.awareness;

  const phaseNumber = String(phase.number).padStart(2, "0");
  const eyebrow = eyebrowOverride || `CURRENT PHASE · ${phaseNumber} OF ${TOTAL_PHASES}`;
  const title = titleOverride || module?.title || phase.ctaLabel.replace("CONTINUE ", "").replace("BEGIN ", "");

  const playerUrl = module?.id
    ? `${createPageUrl("ModulePlayer")}?moduleId=${module.id}${nextPageId ? `&pageId=${nextPageId}` : ""}`
    : "#";

  const completedModules = moduleIndex ? moduleIndex - 1 : 0;
  const totalModulesCount = totalModules || 4;

  return (
    <div className="bg-paper rounded-xl border border-awburg-core/8 overflow-hidden mb-6">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">

        {/* LEFT - Phase letter */}
        <div className="flex items-center justify-center p-6 border-r border-awburg-core/8">
          <span
            className="font-display italic text-awrose-deep select-none leading-none"
            style={{ fontSize: "clamp(80px, 10vw, 140px)" }}
          >
            {phase.letter}
          </span>
        </div>

        {/* MIDDLE - Text content */}
        <div className="px-6 py-7 flex flex-col justify-center">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-2">
            <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
            {eyebrow}
          </p>

          <p className="font-body font-bold text-base tracking-eyebrow text-awburg-core uppercase mb-1">
            {phase.name}
          </p>

          <p className="font-display italic text-awburg-core text-lg leading-snug mb-4 max-w-sm">
            &ldquo;{phase.quote}&rdquo;
          </p>

          {expert && (
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-full bg-awburg-core flex items-center justify-center overflow-hidden flex-shrink-0">
                {expert.profile_picture ? (
                  <img src={expert.profile_picture} alt={expert.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-paper text-[10px] font-medium">{expert.name?.[0]}</span>
                )}
              </div>
              <p className="font-body text-sm text-awburg-core/75">{expert.name}</p>
            </div>
          )}

          <div>
            <Link
              to={playerUrl}
              className="inline-flex items-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-colors"
            >
              {titleOverride ? titleOverride.toUpperCase() : phase.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={module?.id ? `${createPageUrl("ModulePlayer")}?moduleId=${module.id}` : "#"}
              className="block font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 hover:text-awburg-core uppercase mt-3 transition-colors"
            >
              MODULE OVERVIEW +
            </Link>
          </div>
        </div>

        {/* RIGHT - Progress widgets */}
        <div className="px-5 py-7 border-l border-awburg-core/8 flex flex-col justify-center gap-5">

          {/* Modules complete */}
          <div>
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core uppercase mb-1">
              MODULES COMPLETE
            </p>
            <div className="w-8 h-px bg-awrose-core mb-2" />
            <p className="font-display text-awburg-core text-2xl leading-none">
              {completedModules} / {totalModulesCount}
            </p>
          </div>

          {/* Workbook progress */}
          {total > 0 && (
            <div>
              <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core uppercase mb-2">
                WORKBOOK
              </p>
              <p className="font-body text-[11px] text-awburg-core/70 mb-1.5">
                PAGE {completed} OF {total} · {progressPercent}%
              </p>
              <div className="w-full h-1 bg-awburg-core/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-awburg-core rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}