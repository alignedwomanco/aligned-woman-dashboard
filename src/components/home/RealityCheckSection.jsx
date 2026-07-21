import React from "react";

export default function RealityCheckSection() {
  return (
    <section style={{ padding: "clamp(60px,10vw,120px) clamp(20px,5vw,60px)", background: "#F7F2EF" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 3fr", gap: "clamp(32px,5vw,80px)", alignItems: "start" }} className="why-exist-grid">
        {/* Left column */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "#4D1D2E", marginBottom: 24 }}>
            Why We Exist
          </p>
          <h2 style={{ fontSize: "clamp(38px,5vw,64px)", fontWeight: 700, lineHeight: 1.1, color: "#000000", letterSpacing: "-0.01em" }}>
            Women are not <span style={{ color: "#4D1D2E", fontStyle: "italic" }}>failing.</span><br />
            The <span style={{ color: "#4D1D2E", fontStyle: "italic" }}>system is.</span>
          </h2>
        </div>

        {/* Right column */}
        <div>
          <p style={{ fontSize: 19, fontWeight: 400, lineHeight: 1.7, color: "#66605E", marginBottom: 28, fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Women were taught to achieve inside systems that were never designed for them, and almost nothing about how to run their own minds, bodies, money, and lives. The result shows up everywhere: burnout treated as a discipline problem, financial anxiety treated as a maths problem, exhaustion treated as a personal failure.
          </p>
          <p style={{ fontSize: 19, fontWeight: 400, lineHeight: 1.7, color: "#66605E", marginBottom: 40, fontFamily: "'DM Serif Display', Georgia, serif" }}>
            We exist to close that gap. The Aligned Woman Co. is the infrastructure women should have been given: the diagnostics, the education, the professionals, and the community, built as one system instead of a hundred scattered fixes.
          </p>
          <a
            href="/about-us"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#4D1D2E",
              textDecoration: "none",
              borderBottom: "1px solid #4D1D2E",
              paddingBottom: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Read Our Full Story →
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .why-exist-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}