import React from "react";

export default function RealityCheckSection() {
  return (
    <section style={{ padding: "clamp(60px,10vw,120px) clamp(20px,5vw,60px)", background: "rgb(0,0,0)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 32 }}>
          <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#A86B6C" }}>
            The Reality Check
          </span>
          <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: "clamp(42px,7vw,72px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 48, color: "#fff", letterSpacing: "-0.01em", textAlign: "center" }}>
          Women are not <span style={{ fontStyle: "italic", fontWeight: 400 }}>failing</span>.<br />
          <span style={{ color: "rgb(196,132,122)", fontStyle: "italic", fontWeight: 400 }}>The system is</span>.
        </h2>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 32, marginBottom: 48 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "40px 32px", background: "rgba(255,255,255,0.02)", textAlign: "left" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(196,132,122,0.6)", marginBottom: 16 }}>The Myth</p>
            <p style={{ fontSize: "clamp(18px,3vw,28px)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.4, color: "#fff", marginBottom: 24 }}>
              "You're burning out because you're not working hard enough."
            </p>
            <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
              Women are told burnout is a personal failure. A sign they need more discipline, more resilience, or more willpower.
            </p>
          </div>

          <div style={{ border: "1px solid rgba(196,132,122,0.4)", borderRadius: 8, padding: "40px 32px", background: "rgba(107,27,61,0.2)", textAlign: "left" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgb(196,132,122)", marginBottom: 16 }}>The Truth</p>
            <p style={{ fontSize: "clamp(18px,3vw,28px)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.4, color: "#fff", marginBottom: 24 }}>
              It's not failure. It's misalignment.
            </p>
            <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>
              Life looks fine on paper but feels wrong in your body. You were never given tools to thrive inside systems that demand everything and give very little back.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <a
            href="/blueprint"
            style={{
              background: "rgb(196,132,122)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "16px 40px",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            What Women Are Really Navigating →
          </a>
        </div>
      </div>
    </section>
  );
}