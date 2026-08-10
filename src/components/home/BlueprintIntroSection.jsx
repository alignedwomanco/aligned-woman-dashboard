import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// The Aligned Woman Blueprint · rebuilt to the August 2026 landing
// design. Replaces the "Welcome to the 2.0 version of yourself" block.
//
// The film does not autoplay and carries no preload. It sits as a still
// panel until she asks for it, which keeps a 16:9 video off the critical
// path of a marketing page and avoids pulling megabytes on a phone
// connection for something most visitors will not watch.
// ────────────────────────────────────────────────────────────────

const ROSE = "#C4847A";
const ROSE_SOFT = "#E8B4AE";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

const VIDEO_URL = "https://pub-f81092ac00b24c449008a93f41d7542d.r2.dev/awbvideo.mp4";

const STATS = [
  { value: "14", label: "Specialists" },
  { value: "7", label: "Life domains" },
  { value: "R116,200", label: "Private value", serif: true },
  { value: "R3,997", label: "Your investment" },
];

export default function BlueprintIntroSection() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setPlaying(true);
    // The element only exists once playing is true, so the call waits a
    // frame for React to commit it.
    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
  };

  return (
    <section className="aw-bp">
      <style>{`
        .aw-bp {
          min-height: 100vh;
          background: radial-gradient(ellipse at 50% 40%, #3D0B27 0%, #1A0510 50%, #080105 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 160px 32px 96px; position: relative; overflow: hidden; text-align: center;
        }
        .aw-bp .flag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 100px;
          font-family: ${sans}; font-weight: 700; font-size: 9px;
          letter-spacing: 0.26em; text-transform: uppercase;
          background: rgba(196,132,122,0.08); color: ${ROSE_SOFT};
          border: 1px solid rgba(196,132,122,0.2); margin-bottom: 40px;
        }
        .aw-bp .flag i {
          width: 5px; height: 5px; border-radius: 50%; background: ${ROSE}; display: block;
        }

        .aw-bp h1 { margin: 0; position: relative; z-index: 2; }
        .aw-bp h1 .up {
          font-family: ${sans}; font-weight: 800;
          font-size: clamp(34px, 5vw, 76px); text-transform: uppercase;
          letter-spacing: -0.02em; color: #fff; display: block; line-height: 0.92;
        }
        .aw-bp h1 .woman {
          font-family: ${serif}; font-style: italic;
          font-size: clamp(42px, 6vw, 92px); color: ${ROSE};
          display: block; line-height: 0.92; letter-spacing: -0.02em; margin: 2px 0;
        }

        .aw-bp .grid {
          display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr);
          gap: 56px; align-items: center; max-width: 1180px; width: 100%;
          margin: 48px auto 0; text-align: left;
        }
        .aw-bp .kicker {
          margin: 0; max-width: 560px;
          font-family: ${serif}; font-style: italic;
          font-size: clamp(20px, 2vw, 27px); line-height: 1.4;
          color: rgba(232,180,174,0.85);
        }
        .aw-bp .body {
          margin: 24px 0 0; max-width: 540px;
          font-family: ${sans}; font-weight: 300; font-size: 14px; line-height: 1.85;
          color: rgba(255,255,255,0.62);
        }
        .aw-bp .body + .body { margin-top: 14px; }

        .aw-bp .film {
          position: relative; aspect-ratio: 16 / 9; width: 100%;
          background: rgba(26,5,16,0.55);
          border: 1px solid rgba(196,132,122,0.25);
          border-radius: 8px; overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.45);
        }
        .aw-bp .film video { width: 100%; height: 100%; display: block; object-fit: cover; }
        .aw-bp .film .poster {
          position: absolute; inset: 0; width: 100%; height: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 18px; background: none; border: none; cursor: pointer;
          font-family: inherit;
        }
        .aw-bp .film .disc {
          width: 68px; height: 68px; border-radius: 50%;
          background: rgba(196,132,122,0.15); border: 1.5px solid rgba(196,132,122,0.5);
          display: flex; align-items: center; justify-content: center;
          transition: background 320ms cubic-bezier(0.2,0.7,0.2,1),
                      transform 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-bp .film .poster:hover .disc {
          background: rgba(196,132,122,0.3); transform: scale(1.06);
        }
        .aw-bp .film .cap {
          font-family: ${sans}; font-weight: 700; font-size: 9px;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(232,180,174,0.6);
        }

        .aw-bp .stats { margin-top: 48px; display: flex; align-items: stretch; flex-wrap: wrap; justify-content: center; }
        .aw-bp .stat { padding: 0 36px; text-align: center; }
        .aw-bp .stat + .stat { border-left: 1px solid rgba(196,132,122,0.18); }
        .aw-bp .stat .v {
          font-family: ${sans}; font-weight: 700; font-size: 28px; color: #fff;
          line-height: 1; letter-spacing: -0.02em;
        }
        .aw-bp .stat .v.serif {
          font-family: ${serif}; font-style: italic; font-weight: 400;
          font-size: 32px; color: ${ROSE}; letter-spacing: -0.01em;
        }
        .aw-bp .stat .l {
          margin-top: 10px; font-family: ${sans}; font-weight: 700; font-size: 9px;
          letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.4);
        }

        .aw-bp .cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          margin-top: 48px; padding: 18px 32px; border-radius: 100px;
          font-family: ${sans}; font-weight: 700; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase;
          background: ${ROSE}; color: #fff; text-decoration: none; border: none;
          transition: background 320ms cubic-bezier(0.2,0.7,0.2,1),
                      transform 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-bp .cta:hover { background: #A86460; }
        .aw-bp .cta:active { transform: scale(0.96); }
        .aw-bp .fine {
          margin-top: 28px; font-family: ${sans}; font-weight: 400; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.35);
        }
        .aw-bp *:focus-visible { outline: 2px solid ${ROSE_SOFT}; outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .aw-bp .disc, .aw-bp .cta { transition: none; }
        }

        @media (max-width: 980px) {
          .aw-bp { padding: 104px 32px 80px; min-height: 0; }
          .aw-bp .grid { grid-template-columns: 1fr; gap: 40px; margin-top: 40px; }
          .aw-bp .kicker, .aw-bp .body { max-width: none; }
          .aw-bp .stat { padding: 0 24px; }
        }
        @media (max-width: 700px) {
          .aw-bp { padding: 72px 24px 64px; }
          .aw-bp .flag { margin-bottom: 28px; }
          .aw-bp .stats { gap: 28px 0; }
          /* Two per row on a phone. The vertical rules would fall in the
             wrong places once the row wraps, so they come off. */
          .aw-bp .stat { flex: 0 0 50%; padding: 0 12px; }
          .aw-bp .stat + .stat { border-left: none; }
          .aw-bp .cta { width: 100%; margin-top: 40px; }
        }
      `}</style>

      <span className="flag"><i aria-hidden="true" />The Flagship Course</span>

      <h1>
        <span className="up">The Aligned</span>
        <span className="woman">Woman</span>
        <span className="up">Blueprint</span>
      </h1>

      <div className="grid">
        <div>
          <p className="kicker">
            Everything you should have been taught and were not, in one sequenced course.
          </p>
          <p className="body">Not because you missed it. Because nobody taught it.</p>
          <p className="body">
            How your body works. How money works. How your patterns formed and what they cost you. Taught by a faculty most women would never get access to, whose time normally costs thousands, several of whom do not teach publicly at all.
          </p>
          <p className="body">
            Self-paced and online. You leave knowing how you operate, why, and what to do with it.
          </p>
        </div>

        <div className="film">
          {playing ? (
            <video
              ref={videoRef}
              src={VIDEO_URL}
              controls
              playsInline
              preload="auto"
            />
          ) : (
            <button type="button" className="poster" onClick={play} aria-label="Watch the film">
              <span className="disc" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24" fill={ROSE_SOFT}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="cap">Watch the film</span>
            </button>
          )}
        </div>
      </div>

      <div className="stats">
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <div className={s.serif ? "v serif" : "v"}>{s.value}</div>
            <div className="l">{s.label}</div>
          </div>
        ))}
      </div>

      {/* The design points this at #method, an anchor that does not exist
          on the home page. /blueprint is where what is inside actually
          lives, and it is the route to checkout. */}
      <Link to="/blueprint" className="cta">
        See what is inside &#8594;
      </Link>

      <div className="fine">No credit card required to begin</div>
    </section>
  );
}
