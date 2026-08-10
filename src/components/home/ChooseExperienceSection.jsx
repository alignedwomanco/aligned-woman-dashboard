import React from "react";

// ────────────────────────────────────────────────────────────────
// Body. Beliefs. Belonging. · rebuilt to the August 2026 landing
// design. Replaces the "Choose Your Aligned Experience" card grid.
//
// The three principles are drawn as one sacred geometry composition:
// three overlapping circles meeting at Inner life, with Regulation,
// Safety and Worth as satellites. It is a single inline SVG so it
// scales to any width without a raster asset, and the labels stay real
// text, which means they are selectable and readable by a screen
// reader rather than baked into a picture.
//
// BACKGROUND IMAGE: the design specifies a blurred photograph behind
// this section. That asset lives inside Claude Design and could not be
// fetched, so a brand gradient stands in. Drop a URL into BG_IMAGE and
// the photograph takes over, blur and all, with no other change.
// ────────────────────────────────────────────────────────────────

const BG_IMAGE = "";

const INK = "#080105";
const SAND = "#FAF5F3";
const ROSE_SOFT = "#E8B4AE";
const ROSE_PALE = "#EFCFC8";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

const BODY_TERMS = ["Nervous system", "Sleep", "Hormones", "Nutrition", "Movement", "Energy", "Recovery", "Nature"];
const BELIEF_TERMS = ["Subconscious patterns", "Self-worth", "Identity", "Conditioning", "Reflection", "Meditation", "Meaning"];
const BELONGING_TERMS = ["Community", "Relationships", "Support", "Connection", "Trust"];

export default function ChooseExperienceSection() {
  return (
    <section className="aw-bbb" style={{ position: "relative", overflow: "hidden", background: INK }}>
      <style>{`
        .aw-bbb { padding: 150px 80px 140px; }
        .aw-bbb .bg {
          position: absolute; top: -2%; left: -2%; width: 104%; height: 104%;
          filter: blur(14px);
        }
        .aw-bbb .bg img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .aw-bbb .inner { position: relative; max-width: 1160px; margin: 0 auto; text-align: center; }
        .aw-bbb h2 {
          margin: 0;
          font-family: ${serif};
          font-weight: 400;
          font-size: 48px;
          line-height: 1.1;
          color: ${SAND};
        }
        .aw-bbb h2 em { font-style: italic; color: ${ROSE_SOFT}; }
        .aw-bbb .sub {
          margin: 16px 0 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(250,245,243,0.8);
        }
        .aw-bbb svg { display: block; width: 100%; max-width: 740px; margin: 56px auto 0; overflow: visible; }

        @keyframes awBreathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.045); } }
        @keyframes awPulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.9; } }
        .aw-bbb .breathe { transform-box: fill-box; transform-origin: center; animation: awBreathe 12s ease-in-out infinite; }
        .aw-bbb .pulse-a { animation: awPulse 16s ease-in-out infinite; }
        .aw-bbb .pulse-b { animation: awPulse 18s ease-in-out infinite; animation-delay: -7s; }
        .aw-bbb .pulse-c { animation: awPulse 17s ease-in-out infinite; animation-delay: -11s; }

        /* Anyone who has asked their system to stop moving things gets a
           still composition rather than a breathing one. */
        @media (prefers-reduced-motion: reduce) {
          .aw-bbb .breathe, .aw-bbb .pulse-a, .aw-bbb .pulse-b, .aw-bbb .pulse-c { animation: none; }
        }

        @media (max-width: 980px) {
          .aw-bbb { padding: 104px 40px 96px; }
          .aw-bbb h2 { font-size: 38px; }
          .aw-bbb svg { margin-top: 44px; }
        }
        @media (max-width: 700px) {
          .aw-bbb { padding: 72px 16px; }
          .aw-bbb h2 { font-size: 30px; line-height: 1.15; }
          .aw-bbb .sub { margin-top: 12px; font-size: 13.5px; line-height: 1.75; }
          .aw-bbb svg { margin-top: 32px; }
        }
      `}</style>

      <div className="bg" aria-hidden="true">
        {BG_IMAGE ? (
          <img src={BG_IMAGE} alt="" />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(60% 50% at 50% 30%, rgba(196,132,122,0.30) 0%, rgba(74,14,46,0.22) 45%, rgba(8,1,5,0) 100%), linear-gradient(160deg, #1A0510 0%, #3A0B24 45%, #080105 100%)",
            }}
          />
        )}
      </div>

      <div className="inner">
        <h2>
          Body. Beliefs. <em>Belonging.</em>
        </h2>
        <p className="sub">Everything we create is built around three principles.</p>

        <svg viewBox="0 0 1000 1120" role="img" aria-label="Sacred geometry composition of Body, Beliefs and Belonging">
          <defs>
            <radialGradient id="aw-sg-ctr">
              <stop offset="0%" stopColor={ROSE_PALE} stopOpacity="0.4" />
              <stop offset="55%" stopColor="#C4847A" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#C4847A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="aw-sg-node">
              <stop offset="0%" stopColor="#C4847A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C4847A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer containing rings */}
          <circle cx="500" cy="560" r="490" fill="none" stroke="rgba(250,245,243,0.12)" strokeWidth="2" />
          <circle cx="500" cy="560" r="440" fill="none" stroke="rgba(250,245,243,0.07)" strokeWidth="2" />

          {/* Spokes out to the three satellites */}
          <line x1="500" y1="553" x2="180" y2="288" stroke="rgba(250,245,243,0.15)" strokeWidth="2" />
          <line x1="500" y1="553" x2="820" y2="288" stroke="rgba(250,245,243,0.15)" strokeWidth="2" />
          <line x1="500" y1="693" x2="500" y2="932" stroke="rgba(250,245,243,0.15)" strokeWidth="2" />

          {/* The three principles */}
          <circle cx="500" cy="350" r="290" fill="rgba(250,245,243,0.025)" stroke="rgba(250,245,243,0.55)" strokeWidth="2.5" />
          <circle cx="335" cy="655" r="290" fill="rgba(250,245,243,0.025)" stroke="rgba(250,245,243,0.55)" strokeWidth="2.5" />
          <circle cx="665" cy="655" r="290" fill="rgba(250,245,243,0.025)" stroke="rgba(250,245,243,0.55)" strokeWidth="2.5" />

          {/* Where the three meet */}
          <g className="breathe">
            <circle cx="500" cy="553" r="210" fill="url(#aw-sg-ctr)" />
          </g>
          <circle cx="500" cy="553" r="140" fill="none" stroke="rgba(250,245,243,0.7)" strokeWidth="2.5" />
          <text x="500" y="563" textAnchor="middle" style={{ font: `italic 400 30px ${serif}`, fill: ROSE_PALE }}>
            Inner life
          </text>

          {/* Body */}
          <text x="500" y="192" textAnchor="middle" style={{ font: `400 40px ${serif}`, fill: SAND }}>Body</text>
          <g textAnchor="middle" style={{ font: `300 15px ${sans}`, fill: "rgba(250,245,243,0.72)" }}>
            {BODY_TERMS.map((t, i) => (
              <text key={t} x="500" y={232 + i * 25}>{t}</text>
            ))}
          </g>

          {/* Beliefs */}
          <text x="262" y="628" textAnchor="middle" style={{ font: `400 40px ${serif}`, fill: SAND }}>Beliefs</text>
          <g textAnchor="middle" style={{ font: `300 15px ${sans}`, fill: "rgba(250,245,243,0.72)" }}>
            {BELIEF_TERMS.map((t, i) => (
              <text key={t} x="262" y={668 + i * 25}>{t}</text>
            ))}
          </g>

          {/* Belonging */}
          <text x="742" y="628" textAnchor="middle" style={{ font: `400 40px ${serif}`, fill: SAND }}>Belonging</text>
          <g textAnchor="middle" style={{ font: `300 15px ${sans}`, fill: "rgba(250,245,243,0.72)" }}>
            {BELONGING_TERMS.map((t, i) => (
              <text key={t} x="742" y={668 + i * 25}>{t}</text>
            ))}
          </g>

          {/* Satellites */}
          <g className="pulse-a"><circle cx="150" cy="262" r="120" fill="url(#aw-sg-node)" /></g>
          <g className="pulse-b"><circle cx="850" cy="262" r="120" fill="url(#aw-sg-node)" /></g>
          <g className="pulse-c"><circle cx="500" cy="1012" r="120" fill="url(#aw-sg-node)" /></g>
          <circle cx="150" cy="262" r="78" fill="none" stroke="rgba(250,245,243,0.4)" strokeWidth="2.5" />
          <circle cx="850" cy="262" r="78" fill="none" stroke="rgba(250,245,243,0.4)" strokeWidth="2.5" />
          <circle cx="500" cy="1012" r="78" fill="none" stroke="rgba(250,245,243,0.4)" strokeWidth="2.5" />
          <text x="150" y="269" textAnchor="middle" style={{ font: `400 20px ${serif}`, fill: ROSE_SOFT }}>Regulation</text>
          <text x="850" y="269" textAnchor="middle" style={{ font: `400 20px ${serif}`, fill: ROSE_SOFT }}>Safety</text>
          <text x="500" y="1019" textAnchor="middle" style={{ font: `400 20px ${serif}`, fill: ROSE_SOFT }}>Worth</text>
        </svg>
      </div>
    </section>
  );
}
