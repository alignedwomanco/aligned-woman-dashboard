import React, { useState } from "react";

const VIDEO_ID = "AoWQvwZkFmU";
const EMBED_URL = `https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`;
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

export default function FounderQuoteSection() {
  const [embedError, setEmbedError] = useState(false);

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
        {!embedError ? (
          <div className="relative mx-auto mb-6 w-full max-w-2xl" style={{ paddingBottom: "56.25%", height: 0 }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={EMBED_URL}
              title="The Aligned Woman — Founder Story"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ border: "2px solid rgba(196,134,108,0.3)", borderRadius: 4 }}
              onError={() => setEmbedError(true)}
            />
          </div>
        ) : (
          /* Fallback if embed is blocked */
          <div
            className="relative mx-auto mb-6 w-full max-w-2xl flex flex-col items-center justify-center gap-4"
            style={{ paddingBottom: "56.25%", height: 0 }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: "rgba(0,0,0,0.35)", border: "2px solid rgba(196,134,108,0.3)", borderRadius: 4 }}>
              <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="rgba(196,132,122,0.8)">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <a
                href={WATCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "rgb(196,132,122)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  padding: "14px 32px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Watch on YouTube →
              </a>
            </div>
          </div>
        )}

        <p className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: "rgba(196,134,108,0.6)" }}>
          <a href={WATCH_URL} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
            Watch On AlignedWoman.Com • YouTube
          </a>
        </p>
      </div>
    </section>
  );
}