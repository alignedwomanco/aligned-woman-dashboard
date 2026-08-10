import React from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// Literacy section · rebuilt to the August 2026 landing design.
//
// Replaces the two column "Why We Exist" block with the centred,
// type led statement. Same file and same position in Home.jsx, so the
// page order is unchanged.
//
// The reassurance line under the buttons is new and does real work:
// "Join the community" now goes to registration, and saying so before
// the click is what stops it reading as a bait and switch.
// ────────────────────────────────────────────────────────────────

const SAND = "#FAF5F3";
const BURG = "#4A0E2E";
const ROSE = "#C4847A";
const INK = "#0E0208";
const BODY = "rgba(42,10,28,0.80)";
const QUIET = "rgba(42,10,28,0.60)";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

export default function RealityCheckSection() {
  return (
    <section className="aw-literacy" style={{ background: SAND, textAlign: "center" }}>
      <style>{`
        .aw-literacy { padding: 110px 80px 96px; }
        .aw-literacy .inner {
          max-width: 880px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .aw-literacy h2 {
          margin: 0;
          font-family: ${serif};
          font-weight: 400;
          font-size: 46px;
          line-height: 1.18;
          color: ${BURG};
        }
        .aw-literacy h2 em {
          /* Restated because index.css has a universal font-family rule
             that matches this em directly, overriding what it would
             otherwise inherit from the h2. */
          font-family: ${serif};
          font-style: italic;
          color: ${ROSE};
        }
        .aw-literacy .lede {
          margin: 28px 0 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 16px;
          line-height: 1.9;
          color: ${BODY};
          max-width: 680px;
        }
        .aw-literacy .lede + .lede { margin-top: 16px; }
        .aw-literacy .actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .aw-literacy .btn {
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
        .aw-literacy .btn:active { transform: scale(0.96); }
        .aw-literacy .btn.solid {
          background: ${ROSE};
          color: ${INK};
          padding: 17px 32px;
          border: 1.5px solid ${ROSE};
        }
        .aw-literacy .btn.solid:hover { background: #A86460; border-color: #A86460; color: #fff; }
        .aw-literacy .btn.outline {
          border: 1px solid rgba(74,14,46,0.4);
          color: ${BURG};
          padding: 16px 30px;
          background: transparent;
        }
        .aw-literacy .btn.outline:hover { background: ${BURG}; border-color: ${BURG}; color: #fff; }
        .aw-literacy .reassure {
          margin: 14px 0 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 11.5px;
          line-height: 1.7;
          color: ${QUIET};
        }
        .aw-literacy .journey {
          margin: 28px 0 0;
          font-family: ${serif};
          font-style: italic;
          font-size: 26px;
          color: ${ROSE};
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transition: color 320ms cubic-bezier(0.2,0.7,0.2,1), gap 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-literacy .journey:hover { color: #A86460; gap: 18px; }
        .aw-literacy *:focus-visible { outline: 2px solid #A86460; outline-offset: 3px; }

        @media (max-width: 980px) {
          .aw-literacy { padding: 84px 40px 72px; }
          .aw-literacy h2 { font-size: 36px; line-height: 1.2; }
          .aw-literacy .journey { font-size: 24px; }
        }
        @media (max-width: 700px) {
          .aw-literacy { padding: 64px 24px; }
          .aw-literacy h2 { font-size: 28px; line-height: 1.25; }
          .aw-literacy .lede { margin-top: 22px; font-size: 14px; line-height: 1.85; }
          .aw-literacy .lede + .lede { margin-top: 14px; }
          .aw-literacy .actions {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            margin-top: 34px;
            width: 100%;
            max-width: 320px;
          }
          .aw-literacy .btn { display: block; text-align: center; }
          .aw-literacy .btn.solid { padding: 17px 24px; }
          .aw-literacy .btn.outline { padding: 16px 24px; }
          .aw-literacy .journey { font-size: 22px; }
        }
      `}</style>

      <div className="inner">
        <h2 className="[font-family:'Libre_Baskerville',_serif] font-bold">We help women develop the literacy to understand themselves and the wisdom to shape the lives around them.


        </h2>

        <p className="lede">
          A platform built on the knowledge of specialists across the world, events that move you, and retreats that reshape you from the inside out.
        </p>

        <p className="lede">
          Nothing we do is surface level. If you are looking for answers from verified sources, you are in the right place.
        </p>

        <div className="actions">
          <Link to="/StartingPointProfile" className="btn solid">
            Take the Starting Point Profile.
          </Link>
          <Link to="/register" className="btn outline">
            Join the community.
          </Link>
        </div>

        <p className="reassure">
          Account required. Takes under a minute to register. No credit card required.
        </p>

        <Link to="/StartingPointProfile" className="journey">
          Begin your journey.
          <span aria-hidden="true">&#8594;</span>
        </Link>
      </div>
    </section>);

}