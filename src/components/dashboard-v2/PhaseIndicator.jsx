import React from "react";

export default function PhaseIndicator({ section, completedModules, totalModules, phaseIndex, totalPhases }) {
  if (!section) return null;

  // Derive display name: strip "Phase N - " prefix if present
  const rawName = section.title || section.name || "";
  const phaseName = rawName.replace(/^Phase\s*\d+\s*[-–—]\s*/i, "").trim();
  const letter = phaseName[0] || "?";
  const tagline = section.description || "";
  const completed = completedModules || 0;
  const total = totalModules || 0;
  const remaining = total - completed;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const currentPhaseNum = phaseIndex || 1;
  const totalPhaseNum = totalPhases || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        {/* Left: Large letter */}
        <div className="flex-shrink-0">
          <span
            className="text-7xl md:text-8xl italic text-[#C77B85] leading-none"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {letter}
          </span>
        </div>

        {/* Centre: Phase info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-[0.2em] text-[#6B6168] font-medium uppercase mb-1">
            CURRENT PHASE · {String(currentPhaseNum).padStart(2, "0")} OF {String(totalPhaseNum).padStart(2, "0")}
          </p>
          <h3 className="text-2xl text-[#2A1218] mb-1" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {phaseName === "VisionEmbodiment" ? "Vision & Embodiment" : phaseName}
          </h3>
          {tagline && <p className="text-sm text-[#6B6168] italic">"{tagline}"</p>}
        </div>

        {/* Right: Progress */}
        <div className="flex-shrink-0 md:text-right">
          <p className="text-[10px] tracking-[0.2em] text-[#6B6168] font-medium uppercase mb-1">
            MODULES COMPLETE
          </p>
          <p className="text-3xl text-[#2A1218] font-light mb-2">
            {completed} <span className="text-[#6B6168] text-lg">/ {total}</span>
          </p>
          <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-[#5C1A2E] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-[#6B6168]">{remaining} modules remaining in this phase</p>
        </div>
      </div>
    </div>
  );
}