import React, { useState } from "react";

const VIDEO_ID = "AoWQvwZkFmU";
const EMBED_URL = `https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`;
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

export default function FounderQuoteSection() {
  const [embedError, setEmbedError] = useState(false);

  return (
    <section
      style={{
        background: "#6B1B3D",
        padding: "clamp(72px,10vw,120px) 24px",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>

        {/* Quote */}
        <blockquote
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(1.75rem, 4.5vw, 3.2rem)",
            lineHeight: 1.25,
            margin: "0 0 20px",
          }}
        >
          {/* Italic rose-gold part */}
          <span style={{ fontStyle: "italic", color: "#C4866C" }}>
            "I built this because
          </span>
          {/* Bold white part */}
          <span style={{ fontStyle: "italic", fontWeight: 700, color: "#ffffff" }}>
            {" "}I needed it myself."
          </span>
        </blockquote>

        {/* Founder credit */}
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(196,134,108,0.75)",
            marginBottom: "clamp(40px,6vw,64px)",
          }}
        >
          — Founder
        </p>

        {/* Video frame */}
        <div
          style={{
            position: "relative",
            maxWidth: 720,
            margin: "0 auto 20px",
            padding: 3,
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1.5px solid rgba(196,134,108,0.28)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {!embedError ? (
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <iframe
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: 8,
                  display: "block",
                }}
                src={EMBED_URL}
                title="The Aligned Woman — Founder Story"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onError={() => setEmbedError(true)}
              />
            </div>
          ) : (
            <div
              style={{
                paddingBottom: "56.25%",
                position: "relative",
                borderRadius: 8,
                overflow: "hidden",
                background: "rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <svg width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="rgba(196,132,122,0.8)">
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
                    borderRadius: 100,
                    textDecoration: "none",
                  }}
                >
                  Watch on YouTube →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Watch label */}
        <a
          href={WATCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(196,134,108,0.5)",
            textDecoration: "none",
          }}
        >
          Watch On AlignedWoman.Com • YouTube
        </a>

      </div>
    </section>
  );
}