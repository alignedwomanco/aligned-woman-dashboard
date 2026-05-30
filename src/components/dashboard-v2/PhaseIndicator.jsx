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
    <div className="relative rounded-xl mb-6 shadow-sm overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
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

      {/* Burgundy overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(74,14,46,0.88) 0%, rgba(44,6,26,0.92) 100%)", zIndex: 1 }} />

      {/* Content */}
      <div className="relative p-5 md:p-6" style={{ zIndex: 2 }}>
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        {/* Left: Large letter */}
        <div className="flex-shrink-0">
          <span
            className="text-7xl md:text-8xl italic text-[#E8B4AE] leading-none"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {letter}
          </span>
        </div>

        {/* Centre: Phase info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-[0.2em] text-white/55 font-medium uppercase mb-1">
            CURRENT PHASE · {String(currentPhaseNum).padStart(2, "0")} OF {String(totalPhaseNum).padStart(2, "0")}
          </p>
          <h3 className="text-2xl text-white mb-1" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {phaseName === "VisionEmbodiment" ? "Vision & Embodiment" : phaseName}
          </h3>
          {tagline && <p className="text-sm text-white/65 italic">"{tagline}"</p>}
        </div>

        {/* Right: Progress */}
        <div className="flex-shrink-0 md:text-right">
          <p className="text-[10px] tracking-[0.2em] text-white/55 font-medium uppercase mb-1">
            MODULES COMPLETE
          </p>
          <p className="text-3xl text-white font-light mb-2">
            {completed} <span className="text-white/55 text-lg">/ {total}</span>
          </p>
          <div className="w-40 h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: "#E8B4AE" }} />
          </div>
          <p className="text-xs text-white/55">{remaining} modules remaining in this phase</p>
        </div>
      </div>
      </div>
    </div>
  );
}