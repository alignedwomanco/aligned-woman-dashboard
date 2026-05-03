import React from "react";
import { Lock } from "lucide-react";

const PHASES = [
  { letter: "L", name: "LIBERATION", caption: "I do not have to live in survival mode anymore." },
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
        <p className="font-body font-light italic text-[11px] text-awburg-core/55">
          Each phase unlocks once the previous phase is complete.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PHASES.map((phase) => (
          <div
            key={phase.letter}
            className="bg-paper rounded-lg border border-awburg-core/8 p-4 flex gap-3 items-start"
          >
            <span className="font-display italic text-awrose-core/60 text-[40px] leading-none flex-shrink-0">
              {phase.letter}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-body font-bold text-[9px] tracking-eyebrow text-awburg-core/55 uppercase">
                  {phase.name}
                </p>
                <Lock className="w-3 h-3 text-awburg-core/40 flex-shrink-0" />
              </div>
              <p className="font-display italic text-awburg-core/70 text-[12px] leading-snug">
                {phase.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}