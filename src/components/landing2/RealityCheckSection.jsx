import React from "react";

export default function RealityCheckSection() {
  return (
    <section className="py-28 px-4" style={{ background: "#000" }}>
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <p className="text-center text-xs font-bold tracking-[0.3em] uppercase mb-12" style={{ color: "#C4866C" }}>
          — The Reality Check —
        </p>

        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="font-bold leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            <span className="text-white">Women are not </span>
            <span className="italic text-white">failing.</span>
          </h2>
          <h2 className="italic font-bold leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#C4866C" }}>
            The system is.
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-14">
          {/* Myth Card */}
          <div className="p-10" style={{ background: "#0a0a0a", border: "1px solid rgba(196,134,108,0.2)" }}>
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-6" style={{ color: "#C4866C" }}>The Myth</p>
            <blockquote className="text-white text-2xl leading-snug italic mb-6" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              "You're burning out because you're not working hard enough."
            </blockquote>
            <p className="text-white/50 leading-relaxed text-sm">
              We've been sold a lie. That exhaustion means laziness. That struggle means weakness. That needing support means inadequacy. None of it is true.
            </p>
          </div>

          {/* Truth Card */}
          <div className="p-10" style={{ background: "#3a0d22" }}>
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-6" style={{ color: "#C4866C" }}>The Truth</p>
            <h3 className="text-white text-2xl font-bold leading-snug mb-6" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              It's not failure. It's misalignment.
            </h3>
            <p className="text-white/60 leading-relaxed text-sm">
              You weren't taught how your nervous system works. How your hormones affect your decisions. How to build wealth from a place of wholeness. That's not your fault — it's a gap in your education. And we're here to close it.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/blueprint"
            className="inline-block px-10 py-4 font-bold text-sm tracking-[0.18em] uppercase transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "#C4866C", color: "#fff" }}
          >
            What Women Are Really Navigating →
          </a>
        </div>
      </div>
    </section>
  );
}