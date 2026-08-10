import React from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// Home hero · rebuilt to the August 2026 landing design.
//
// Replaces the full bleed dark photographic hero with the light,
// centred, type led treatment. It ends at its natural height rather
// than filling the viewport, so the section below is visible on load
// and the page reads as a document rather than a splash screen.
// ────────────────────────────────────────────────────────────────

const SAND = "#FAF5F3";
const BURG = "#4A0E2E";
const ROSE = "#C4847A";
const INK = "#0E0208";
const BODY = "rgba(42,10,28,0.82)";

// The design specifies Baskerville Display PT. Baskervville is the
// Google Fonts release of the same Baskerville revival and is what the
// platform loads, in index.html. DM Serif Display stays as the fallback
// so a font load failure lands on the platform face rather than on a
// browser default.
const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

export default function HeroSection() {
  return (
    <section
      style={{
        background: SAND,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
      className="aw-hero"
    >
      <style>{`
        .aw-hero { padding: 110px 80px 96px; }
        .aw-hero .eyebrow {
          margin: 0 0 28px;
          font-family: ${sans};
          font-weight: 700;
          font-size: 10.5px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: ${BURG};
        }
        .aw-hero h1 {
          margin: 0;
          font-family: ${serif};
          font-weight: 400;
          font-size: 62px;
          line-height: 1.08;
          color: ${BURG};
          max-width: 920px;
        }
        .aw-hero h1 em { font-style: italic; color: ${ROSE}; }
        .aw-hero .kicker {
          margin: 26px 0 0;
          font-family: ${serif};
          font-style: italic;
          font-size: 34px;
          line-height: 1.2;
          color: ${ROSE};
        }
        .aw-hero .lede {
          margin: 38px 0 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 15.5px;
          line-height: 1.85;
          color: ${BODY};
          max-width: 640px;
        }
        .aw-hero .lede + .lede { margin-top: 18px; }
        .aw-hero .actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .aw-hero .btn {
          display: inline-block;
          border-radius: 100px;
          font-family: ${sans};
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
          text-decoration: none;
          transition: background 320ms cubic-bezier(0.2,0.7,0.2,1),
                      color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      border-color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      transform 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-hero .btn:active { transform: scale(0.96); }
        .aw-hero .btn.solid {
          background: ${ROSE};
          color: ${INK};
          padding: 17px 32px;
          border: 1.5px solid ${ROSE};
        }
        .aw-hero .btn.solid:hover { background: #A86460; border-color: #A86460; color: #fff; }
        .aw-hero .btn.outline {
          border: 1.5px solid ${BURG};
          color: ${BURG};
          padding: 16px 30px;
          background: transparent;
        }
        .aw-hero .btn.outline:hover { background: ${BURG}; color: #fff; }
        .aw-hero *:focus-visible { outline: 2px solid #A86460; outline-offset: 3px; }

        @media (max-width: 980px) {
          .aw-hero { padding: 78px 40px 64px; }
          .aw-hero h1 { font-size: 46px; line-height: 1.12; }
          .aw-hero .kicker { font-size: 28px; }
        }
        @media (max-width: 700px) {
          .aw-hero { padding: 64px 24px 56px; }
          .aw-hero .eyebrow { margin-bottom: 20px; font-size: 9.5px; letter-spacing: 0.3em; }
          .aw-hero h1 { font-size: 36px; line-height: 1.14; }
          .aw-hero .kicker { margin-top: 20px; font-size: 23px; line-height: 1.25; }
          .aw-hero .lede { margin-top: 26px; font-size: 14px; }
          .aw-hero .lede + .lede { margin-top: 14px; }
          .aw-hero .actions {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            margin-top: 32px;
            width: 100%;
            max-width: 320px;
          }
          .aw-hero .btn { display: block; text-align: center; }
          .aw-hero .btn.solid { padding: 17px 24px; }
          .aw-hero .btn.outline { padding: 16px 24px; }
        }
      `}</style>

      <p className="eyebrow">The Aligned Woman Co.</p>

      <h1>
        Women have been given <em>fragmented answers</em> to deeply interconnected problems.
      </h1>

      <p className="kicker">We built the system that connects them.</p>

      <p className="lede">
        The Aligned Woman Co. is a trusted ecosystem designed to help women understand themselves more deeply and consciously shape the lives around them.
      </p>

      <p className="lede">
        Through diagnostics, community, verified practitioners, events and personalised guidance, we help women understand what is happening within them and discover what to do next.
      </p>

      <div className="actions">
        <Link to="/StartingPointProfile" className="btn solid">
          Take the Starting Point Profile
        </Link>
        {/* The Community itself sits behind login, so this goes to
            registration. Hormone Health is free to registered members, so
            the promise is honoured as soon as she signs up. */}
        <Link to="/register" className="btn outline">
          Join the community
        </Link>
      </div>
    </section>
  );
}
