import React from "react";

export default function FounderQuoteSection() {
  return (
    <section className="py-28 px-4" style={{ background: "#6B1B3D" }}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Quote */}
        <blockquote
          className="italic mb-6 leading-tight"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "rgba(255,255,255,0.85)" }}
        >
          "I built this because{" "}
          <span className="text-white font-bold not-italic">I needed it myself.</span>"
        </blockquote>

        <p className="font-bold tracking-[0.2em] uppercase text-sm mb-16" style={{ color: "#C4866C" }}>
          – Founder
        </p>

        {/* Video embed */}
        <div className="relative mx-auto mb-6 w-full max-w-2xl" style={{ paddingBottom: "56.25%", height: 0 }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/AoWQvwZkFmU"
            title="The Aligned Woman — Founder Story"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: "2px solid rgba(196,134,108,0.3)" }}
          />
        </div>

        <p className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: "rgba(196,134,108,0.6)" }}>
          Watch On AlignedWoman.Com • YouTube
        </p>
      </div>
    </section>
  );
}