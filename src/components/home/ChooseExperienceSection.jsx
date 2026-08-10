import React, { useState } from "react";

// ────────────────────────────────────────────────────────────────
// Body. Beliefs. Belonging. · the sacred geometry composition.
//
// The diagram opens quiet: only the three principle names, the three
// satellites and Inner life. The supporting terms are hidden until a
// circle is hovered, so the eye lands on the structure first and the
// detail is something she chooses to look at rather than a wall of
// twenty words.
//
// Hover does not exist on touch, so each circle is also a real button,
// and below 700px all three groups are revealed by default. Nobody on a
// phone should have to discover that a shape is tappable.
//
// Two things move on their own: the glow behind Inner life breathes,
// and the outer ring turns slowly. Both stop under reduced motion.
//
// BACKGROUND IMAGE: the design specifies a blurred photograph behind
// this section. Drop a URL into BG_IMAGE and it takes over.
// ────────────────────────────────────────────────────────────────

const BG_IMAGE = "";

const INK = "#080105";
const SAND = "#FAF5F3";
const ROSE_SOFT = "#E8B4AE";
const ROSE_PALE = "#EFCFC8";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

// Each principle name has two positions. At rest it sits in the middle
// of its own circle, so the diagram reads as three named shapes. When
// the circle is opened the name travels to its heading position and the
// terms fill the space it left.
const PRINCIPLES = {
  body: {
    label: "Body",
    cx: 500, cy: 350,
    restX: 500, restY: 362,
    // The Beliefs and Belonging arcs both cross the centre line at y=417,
    // and the Inner life ring starts at 413. Eight terms at the old 232
    // start and 25 spacing ran to 407, which put Nature on top of them.
    // Sitting the list closer under the heading clears all three.
    titleX: 500, titleY: 172, listY: 212, listX: 500, gap: 23,
    terms: ["Nervous system", "Sleep", "Hormones", "Nutrition", "Movement", "Energy", "Recovery", "Nature"],
  },
  beliefs: {
    label: "Beliefs",
    cx: 335, cy: 655,
    restX: 300, restY: 667,
    titleX: 236, titleY: 628, listY: 668, listX: 262, gap: 25,
    terms: ["Subconscious patterns", "Self-worth", "Identity", "Conditioning", "Reflection", "Meditation", "Meaning"],
  },
  belonging: {
    label: "Belonging",
    cx: 665, cy: 655,
    // 750 rather than the circle centre. The Beliefs arc passes through
    // x=625 at this height, and Belonging is a wide word, so centring it
    // on its own circle puts the B straight through that line.
    restX: 750, restY: 667,
    titleX: 768, titleY: 628, listY: 668, listX: 742, gap: 25,
    terms: ["Community", "Relationships", "Support", "Connection", "Trust"],
  },
};

export default function ChooseExperienceSection() {
  const [active, setActive] = useState(null);

  const isOn = (key) => active === key;

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
        .aw-bbb h2 em {
          /* index.css carries a universal * { font-family: Montserrat }
             rule, which matches this em directly and beats the family
             inherited from the h2. Restating it here is what keeps the
             italic clause in the serif. */
          font-family: ${serif};
          font-style: italic;
          color: ${ROSE_SOFT};
        }
        .aw-bbb .sub {
          margin: 16px 0 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(250,245,243,0.8);
        }
        .aw-bbb .hint {
          margin: 28px 0 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 11.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(250,245,243,0.42);
        }
        .aw-bbb svg { display: block; width: 100%; max-width: 740px; margin: 40px auto 0; overflow: visible; }

        /* Continuous motion */
        @keyframes awBreathe { 0%, 100% { transform: scale(1); opacity: 0.75; } 50% { transform: scale(1.07); opacity: 1; } }
        @keyframes awTurn { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .aw-bbb .breathe {
          transform-box: fill-box; transform-origin: center;
          animation: awBreathe 6s ease-in-out infinite;
        }
        .aw-bbb .turn {
          transform-box: view-box; transform-origin: 500px 560px;
          animation: awTurn 120s linear infinite;
        }
        .aw-bbb .turn-slow {
          transform-box: view-box; transform-origin: 500px 560px;
          animation: awTurn 180s linear infinite reverse;
        }

        /* Reveal on hover. The group fades and lifts a few units, so it
           arrives rather than blinking on. */
        .aw-bbb .terms {
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 520ms cubic-bezier(0.2,0.7,0.2,1), transform 520ms cubic-bezier(0.2,0.7,0.2,1);
          pointer-events: none;
        }
        .aw-bbb .terms.on { opacity: 1; transform: translateY(0); }

        .aw-bbb .ring {
          transition: stroke 420ms cubic-bezier(0.2,0.7,0.2,1), fill 420ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-bbb .principle-title {
          transform: translate(0px, 0px);
          transition: fill 420ms cubic-bezier(0.2,0.7,0.2,1),
                      transform 520ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-bbb .principle-title.on { transform: translate(var(--dx), var(--dy)); }
        .aw-bbb .hit { cursor: pointer; outline: none; }
        .aw-bbb .hit:focus-visible .ring { stroke: ${ROSE_SOFT}; }

        @media (prefers-reduced-motion: reduce) {
          .aw-bbb .breathe, .aw-bbb .turn, .aw-bbb .turn-slow { animation: none; }
          .aw-bbb .terms, .aw-bbb .principle-title { transition: none; }
        }

        @media (max-width: 980px) {
          .aw-bbb { padding: 104px 40px 96px; }
          .aw-bbb h2 { font-size: 38px; }
        }
        @media (max-width: 700px) {
          .aw-bbb { padding: 72px 16px; }
          .aw-bbb h2 { font-size: 30px; line-height: 1.15; }
          .aw-bbb .sub { margin-top: 12px; font-size: 13.5px; line-height: 1.75; }
          /* No hover on touch, so nothing stays hidden and the names sit
             in their heading positions from the start. */
          .aw-bbb .terms { opacity: 1; transform: none; }
          .aw-bbb .principle-title { transform: translate(var(--dx), var(--dy)); }
          .aw-bbb .hint { display: none; }
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
        <p className="hint">Hover a circle to look closer</p>

        <svg viewBox="0 0 1000 1120" role="img" aria-label="Body, Beliefs and Belonging meeting at your inner life">
          <defs>
            <radialGradient id="aw-sg-ctr">
              <stop offset="0%" stopColor={ROSE_PALE} stopOpacity="0.45" />
              <stop offset="55%" stopColor="#C4847A" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#C4847A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="aw-sg-node">
              <stop offset="0%" stopColor="#C4847A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C4847A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer rings, turning against each other so the movement reads
              as rotation rather than drift. Dashes make the turn visible;
              a plain circle would look static however fast it spun. */}
          <g className="turn">
            <circle
              cx="500" cy="560" r="490"
              fill="none" stroke="rgba(250,245,243,0.24)" strokeWidth="5"
              strokeDasharray="3 30" strokeLinecap="round"
            />
          </g>
          <g className="turn-slow">
            <circle
              cx="500" cy="560" r="440"
              fill="none" stroke="rgba(250,245,243,0.15)" strokeWidth="4"
              strokeDasharray="2 22" strokeLinecap="round"
            />
          </g>

          {/* Spokes to the satellites */}
          <line x1="500" y1="553" x2="180" y2="288" stroke="rgba(250,245,243,0.15)" strokeWidth="2" />
          <line x1="500" y1="553" x2="820" y2="288" stroke="rgba(250,245,243,0.15)" strokeWidth="2" />
          <line x1="500" y1="693" x2="500" y2="932" stroke="rgba(250,245,243,0.15)" strokeWidth="2" />

          {/* The three principles */}
          {Object.entries(PRINCIPLES).map(([key, p]) => (
            <g
              key={key}
              className="hit"
              tabIndex={0}
              role="button"
              aria-expanded={isOn(key)}
              aria-label={`${p.label}: ${p.terms.join(", ")}`}
              onMouseEnter={() => setActive(key)}
              onMouseLeave={() => setActive((cur) => (cur === key ? null : cur))}
              onFocus={() => setActive(key)}
              onBlur={() => setActive((cur) => (cur === key ? null : cur))}
              onClick={() => setActive((cur) => (cur === key ? null : key))}
            >
              <circle
                className="ring"
                cx={p.cx} cy={p.cy} r="290"
                fill={isOn(key) ? "rgba(232,180,174,0.07)" : "rgba(250,245,243,0.025)"}
                stroke={isOn(key) ? "rgba(232,180,174,0.9)" : "rgba(250,245,243,0.55)"}
                strokeWidth="2.5"
              />
              <text
                className={isOn(key) ? "principle-title on" : "principle-title"}
                x={p.restX} y={p.restY}
                textAnchor="middle"
                style={{
                  font: `400 40px ${serif}`,
                  fill: isOn(key) ? ROSE_PALE : SAND,
                  // The travel distance is held as custom properties so the
                  // mobile media query can apply it without JS, where the
                  // terms are always shown and the name must always be up.
                  "--dx": `${p.titleX - p.restX}px`,
                  "--dy": `${p.titleY - p.restY}px`,
                }}
              >
                {p.label}
              </text>
              <g
                className={isOn(key) ? "terms on" : "terms"}
                textAnchor="middle"
                style={{ font: `300 15px ${sans}`, fill: "rgba(250,245,243,0.78)" }}
              >
                {p.terms.map((t, i) => (
                  <text key={t} x={p.listX} y={p.listY + i * p.gap}>{t}</text>
                ))}
              </g>
            </g>
          ))}

          {/* Where the three meet. The glow breathes continuously. */}
          <g className="breathe">
            <circle cx="500" cy="553" r="210" fill="url(#aw-sg-ctr)" />
          </g>
          <circle cx="500" cy="553" r="140" fill="none" stroke="rgba(250,245,243,0.7)" strokeWidth="2.5" />
          <text x="500" y="563" textAnchor="middle" style={{ font: `italic 400 30px ${serif}`, fill: ROSE_PALE }}>
            Inner life
          </text>

          {/* Satellites, always visible */}
          <circle cx="150" cy="262" r="120" fill="url(#aw-sg-node)" />
          <circle cx="850" cy="262" r="120" fill="url(#aw-sg-node)" />
          <circle cx="500" cy="1012" r="120" fill="url(#aw-sg-node)" />
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
