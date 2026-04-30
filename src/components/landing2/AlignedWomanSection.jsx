import React from "react";

export default function AlignedWomanSection() {
  return (
    <section
      className="relative py-36 px-4 flex items-center justify-center"
      style={{ background: "#3a0d22", minHeight: "70vh" }}
    >
      {/* Faded portrait overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&q=80&fit=crop&crop=face')" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold tracking-[0.35em] uppercase mb-10 text-white/60">
          — WHO SHE IS —
        </p>

        <h2
          className="text-white uppercase font-bold mb-12"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.2rem, 6vw, 4.5rem)", letterSpacing: "0.06em" }}
        >
          WHAT IS AN ALIGNED WOMAN?
        </h2>

        <div className="text-white/80 leading-relaxed space-y-6" style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", fontFamily: "Montserrat, sans-serif" }}>
          <p className="font-bold text-white">
            An aligned woman is not someone who has it all figured out.
          </p>

          <p>
            She is a woman who is learning to listen to herself again.
          </p>

          <p>
            An aligned woman understands that clarity does not come from doing more, but from becoming more honest about what no longer fits. She recognises when her body is tired, when her nervous system is overloaded, and when her life is out of sync with her values.
          </p>

          <p>
            She makes decisions with awareness, intention, and self-respect.<br />
            She allows her seasons to change.<br />
            She leads, works, loves, and rests in ways that honour her biology, emotions, and lived reality.
          </p>

          <p className="font-bold text-white">
            An aligned woman is not perfect or polished.
          </p>
          <p className="font-bold text-white">
            She is present, grounded, and willing to choose herself without guilt.
          </p>
        </div>
      </div>
    </section>
  );
}