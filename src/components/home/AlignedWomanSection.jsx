import React from "react";

export default function AlignedWomanSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#3a0d22", minHeight: "80vh" }}
    >
      {/* Faded portrait overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&q=80&fit=crop&crop=face')",
          opacity: 0.18,
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-24">

        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 32 }}>
          <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#A86B6C",
            margin: 0,
          }}>
            WHO SHE IS
          </p>
          <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
        </div>

        {/* Big heading */}
        <h2 className="text-center mb-14 leading-none">
          <span
            style={{
              display: "block",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(40px, 7vw, 64px)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#ffffff",
            }}
          >
            WHAT IS AN
          </span>
          <span
            style={{
              display: "block",
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(40px, 7vw, 64px)",
              fontWeight: 400,
              fontStyle: "italic",
              textTransform: "none",
              letterSpacing: "0.01em",
              color: "#A96B6D",
            }}
          >
            Aligned Woman?
          </span>
        </h2>

        {/* Two-column body text */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-6 max-w-5xl mx-auto">

          {/* Left column */}
          <div className="space-y-5 text-center md:text-left">
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.6 }}>
              An aligned woman is not someone who has it all figured out.
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
              She is a woman who is learning to listen to herself again.
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
              An aligned woman understands that clarity does not come from doing more, but from becoming more honest about what no longer fits. She recognises when her body is tired, when her nervous system is overloaded, and when her life is out of sync with her values.
            </p>
          </div>

          {/* Right column */}
          <div className="space-y-5 text-center md:text-left">
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
              She makes decisions with awareness, intention, and self-respect.<br />
              She allows her seasons to change.<br />
              She leads, works, loves, and rests in ways that honour her biology, emotions, and lived reality.
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.6 }}>
              An aligned woman is not perfect or polished.
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.6 }}>
              She is present, grounded, and willing to choose herself without guilt.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}