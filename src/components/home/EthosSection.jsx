import React, { useState } from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// Our ecosystem · rebuilt to the August 2026 landing design.
// Replaces the ethos block.
//
// Six panels, four of which lead somewhere and two of which are not
// built yet. Rather than linking the unbuilt two to a placeholder page,
// they answer in place: click and a "coming soon" line appears inside
// the panel. Nothing is ever a dead link, and nobody is sent to a page
// that apologises for itself.
// ────────────────────────────────────────────────────────────────

const SAND = "#FAF5F3";
const BURG = "#4A0E2E";
const ROSE_SOFT = "#E8B4AE";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

const SEAL =
  "https://media.base44.com/images/public/69f46886a412ee042303f1af/c01141aed_aw-verified-seal.png";

const PANELS = [
  {
    key: "diagnostics",
    title: "Diagnostics",
    body: "Understand yourself more deeply.",
    to: "/StartingPointProfile",
    bg: "#4A0E2E",
    title_c: SAND,
    body_c: "rgba(250,245,243,0.8)",
  },
  {
    key: "community",
    title: "Community",
    body: "Build meaningful connections.",
    to: "/register",
    bg: "#E8B4AE",
    title_c: BURG,
    body_c: "rgba(74,14,46,0.85)",
  },
  {
    key: "practitioners",
    title: "Verified practitioners",
    body: "Find trusted support.",
    to: "/theawstandard",
    bg: SAND,
    title_c: BURG,
    body_c: "rgba(42,10,28,0.8)",
    border: "1px solid rgba(74,14,46,0.2)",
    seal: true,
    titleMax: 200,
  },
  {
    key: "events",
    title: "Events",
    body: "Experience transformation in real life.",
    soon: "Dates are being confirmed. The New Year Reset is first.",
    bg: "#4F5636",
    title_c: ROSE_SOFT,
    body_c: "rgba(232,180,174,0.9)",
  },
  {
    key: "retreats",
    title: "Retreats",
    body: "Create space for deeper integration.",
    soon: "In the making. You will hear about these first.",
    bg: "#2A2E1C",
    title_c: ROSE_SOFT,
    body_c: "rgba(232,180,174,0.85)",
  },
  {
    key: "education",
    title: "Education",
    body: "Learn practical tools you can apply every day.",
    to: "/blueprint",
    bg: "#B9BE96",
    title_c: BURG,
    body_c: "rgba(42,10,28,0.8)",
  },
];

export default function EthosSection() {
  const [revealed, setRevealed] = useState(null);

  return (
    <section className="aw-eco" style={{ background: SAND }}>
      <style>{`
        .aw-eco { padding: 96px 80px; }
        .aw-eco .inner { max-width: 1160px; margin: 0 auto; }
        .aw-eco .eyebrow {
          margin: 0 0 36px;
          font-family: ${sans}; font-weight: 700; font-size: 9.5px;
          letter-spacing: 0.32em; text-transform: uppercase; color: ${BURG};
        }
        .aw-eco .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

        .aw-eco .panel {
          position: relative; padding: 36px 34px; min-height: 210px;
          display: flex; flex-direction: column; box-sizing: border-box;
          text-align: left; text-decoration: none; border: none;
          font-family: inherit; width: 100%; cursor: pointer;
          transition: transform 320ms cubic-bezier(0.2,0.7,0.2,1),
                      box-shadow 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-eco .panel:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(42,10,28,0.14); }
        .aw-eco .panel:active { transform: translateY(0) scale(0.99); }
        .aw-eco .panel h3 {
          margin: 0; font-family: ${serif}; font-weight: 400; font-size: 27px; line-height: 1.15;
        }
        .aw-eco .panel .body {
          margin: auto 0 0; font-family: ${sans}; font-weight: 300;
          font-size: 13px; line-height: 1.7;
        }
        .aw-eco .panel .seal {
          position: absolute; top: 22px; right: 22px;
          width: 52px; height: 52px; object-fit: contain;
        }
        /* The coming soon line replaces the body copy in place, so the
           panel does not change height and the grid does not jump. */
        .aw-eco .soon {
          margin: auto 0 0; font-family: ${sans}; font-weight: 500;
          font-size: 12.5px; line-height: 1.7;
          opacity: 0; transform: translateY(4px);
          transition: opacity 320ms cubic-bezier(0.2,0.7,0.2,1),
                      transform 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-eco .soon.on { opacity: 1; transform: translateY(0); }
        .aw-eco .soon .tag {
          display: block; font-weight: 700; font-size: 9px;
          letter-spacing: 0.26em; text-transform: uppercase; margin-bottom: 6px;
        }
        .aw-eco *:focus-visible { outline: 2px solid ${BURG}; outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .aw-eco .panel, .aw-eco .soon { transition: none; }
        }

        @media (max-width: 980px) {
          .aw-eco { padding: 80px 40px; }
          .aw-eco .grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 700px) {
          .aw-eco { padding: 64px 24px; }
          .aw-eco .grid { grid-template-columns: 1fr; gap: 12px; }
          .aw-eco .panel { min-height: 168px; padding: 28px 26px; }
          .aw-eco .panel h3 { font-size: 24px; }
        }
      `}</style>

      <div className="inner">
        <p className="eyebrow">Our ecosystem</p>

        <div className="grid">
          {PANELS.map((p) => {
            const style = { background: p.bg, border: p.border || "none" };
            const inner = (
              <>
                {p.seal && <img className="seal" src={SEAL} alt="" aria-hidden="true" />}
                <h3 style={{ color: p.title_c, maxWidth: p.titleMax || "none" }}>{p.title}</h3>
                {p.soon && revealed === p.key ? (
                  <p className="soon on" style={{ color: p.body_c }}>
                    <span className="tag">Coming soon</span>
                    {p.soon}
                  </p>
                ) : (
                  <p className="body" style={{ color: p.body_c }}>{p.body}</p>
                )}
              </>
            );

            if (p.to) {
              return (
                <Link key={p.key} to={p.to} className="panel" style={style}>
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={p.key}
                type="button"
                className="panel"
                style={style}
                aria-expanded={revealed === p.key}
                onClick={() => setRevealed(revealed === p.key ? null : p.key)}
              >
                {inner}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
