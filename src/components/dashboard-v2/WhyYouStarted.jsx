import React from "react";

export default function WhyYouStarted({ concerns, archetype, onViewIntake }) {
  const tags = concerns?.length > 0 ? concerns : ["Burnout", "Hormone disruption", "Disconnection from purpose"];
  const archetypeName = archetype || "The Reckoning Woman";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 md:p-6 mb-6 shadow-sm">
      <p className="text-[10px] tracking-[0.2em] text-[#C77B85] font-medium uppercase mb-4">
        WHY YOU STARTED · YOUR INTAKE
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side */}
        <div className="flex-1">
          <h3 className="text-2xl text-[#2A1218] mb-4 leading-snug" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            The reasons you <em>showed up:</em>
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full border border-[#C77B85]/30 text-sm text-[#5C1A2E]"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-[#2A1218] italic mb-4">
            On hard weeks, come back here. This is your north star.
          </p>
        </div>

        {/* Right: Archetype panel */}
        <div className="flex-shrink-0 w-full md:w-48">
          <div className="bg-gradient-to-br from-[#3D0F1F] to-[#5C1A2E] rounded-xl p-5 text-center aspect-square flex flex-col items-center justify-center">
            <p className="text-[10px] tracking-[0.15em] text-white/60 uppercase mb-2">You are</p>
            <p className="text-lg text-white italic leading-snug" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {archetypeName}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onViewIntake}
        className="text-[10px] tracking-[0.15em] text-[#5C1A2E] hover:text-[#3D0F1F] font-medium uppercase transition-colors mt-2"
      >
        VIEW FULL INTAKE →
      </button>
    </div>
  );
}