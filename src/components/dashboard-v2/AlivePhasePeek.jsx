import React from "react";
import { Lock } from "lucide-react";

const PHASES = [
  { letter: "L", name: "LIBERATION", caption: "I don't have to live in survival mode anymore." },
  { letter: "I", name: "INTENTIONAL ACTION", caption: "I think differently, so I choose differently." },
  { letter: "V", name: "VISION", caption: "What do I actually want?" },
  { letter: "E", name: "EMBODIMENT", caption: "This is who I am now." },
];

export default function AlivePhasePeek() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/55 uppercase">
          WHAT'S UPCOMING
        </p>
        <p className="font-body font-light italic text-[12px] text-awburg-core/45">
          Each phase unlocks once the previous phase is complete.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PHASES.map((phase) => (
          <div
            key={phase.letter}
            className="bg-paper rounded-xl border border-awburg-core/10 p-5 flex gap-3 items-start"
          >
            {/* Large italic phase letter */}
            <span className="font-display italic text-awrose-core/50 text-[52px] leading-none flex-shrink-0 select-none">
              {phase.letter}
            </span>

            {/* Name + lock + caption */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <p className="font-body font-bold text-[9px] tracking-eyebrow text-awrose-deep uppercase leading-tight">
                  {phase.name}
                </p>
                <Lock className="w-3 h-3 text-awrose-core/50 flex-shrink-0 mt-px" />
              </div>
              <p className="font-display italic text-awrose-deep/80 text-[13px] leading-snug">
                {phase.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}