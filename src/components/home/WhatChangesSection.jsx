import React from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// New Year Reset · rebuilt to the August 2026 landing design.
// Replaces the "What changes" block.
//
// A photograph of the event under a heavy olive wash, so the copy stays
// the thing you read rather than the thing you read over.
//
// BACKGROUND IMAGE: drop the hosted URL into EVENT_IMAGE and the
// photograph takes over from the gradient. Nothing else changes.
// ────────────────────────────────────────────────────────────────

const EVENT_IMAGE =
  "https://media.base44.com/images/public/69f46886a412ee042303f1af/27e4dcbf7_Screenshot2026-08-10at121322.png";

const OLIVE = "#4F5636";
const OLIVE_DEEP = "#314323";
const OLIVE_TEXT = "#E8E0CB";
const SAND = "#FAF5F3";
const ROSE_SOFT = "#E8B4AE";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

export default function WhatChangesSection() {
  return (
    <section className="aw-reset" style={{ background: OLIVE }}>
      <style>{`
        .aw-reset { padding: 96px 80px; position: relative; overflow: hidden; }
        .aw-reset .bg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .aw-reset .bg img { width: 100%; height: 100%; object-fit: cover; display: block; }
        /* The wash is what makes the copy legible over a busy photograph.
           Without it the headline sits on grass and faces. */
        .aw-reset .wash { position: absolute; inset: 0; background: rgba(49,67,35,0.78); }

        .aw-reset .inner {
          position: relative; max-width: 900px; margin: 0 auto; text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .aw-reset h2 {
          margin: 0;
          font-family: ${serif}; font-weight: 400; font-size: 64px;
          line-height: 1.02; color: ${SAND};
        }
        .aw-reset h2 em {
          font-family: ${serif}; font-style: italic; color: ${ROSE_SOFT};
        }
        .aw-reset .where {
          margin: 22px 0 0;
          font-family: ${sans}; font-weight: 700; font-size: 11px;
          letter-spacing: 0.3em; text-transform: uppercase; color: ${ROSE_SOFT};
        }
        .aw-reset .kicker {
          margin: 32px 0 0;
          font-family: ${serif}; font-style: italic; font-size: 24px; line-height: 1.4;
          color: ${ROSE_SOFT}; max-width: 620px;
        }
        .aw-reset .body {
          margin: 20px 0 0;
          font-family: ${sans}; font-weight: 300; font-size: 14.5px; line-height: 1.85;
          color: rgba(250,245,243,0.85); max-width: 600px;
        }
        .aw-reset .cta {
          display: inline-block; margin-top: 36px;
          background: ${OLIVE_DEEP}; color: ${OLIVE_TEXT};
          border: 1.5px solid ${OLIVE_DEEP}; border-radius: 100px;
          font-family: ${sans}; font-weight: 700; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 17px 32px; white-space: nowrap; text-decoration: none;
          transition: background 320ms cubic-bezier(0.2,0.7,0.2,1),
                      border-color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      transform 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-reset .cta:hover { background: #25331A; border-color: #25331A; color: #fff; }
        .aw-reset .cta:active { transform: scale(0.96); }
        .aw-reset *:focus-visible { outline: 2px solid ${OLIVE_TEXT}; outline-offset: 3px; }

        @media (max-width: 980px) {
          .aw-reset { padding: 80px 40px; }
          .aw-reset h2 { font-size: 46px; }
          .aw-reset .kicker { font-size: 21px; }
        }
        @media (max-width: 700px) {
          .aw-reset { padding: 64px 24px; }
          .aw-reset h2 { font-size: 36px; line-height: 1.08; }
          .aw-reset .where { margin-top: 18px; font-size: 10px; letter-spacing: 0.26em; }
          .aw-reset .kicker { margin-top: 24px; font-size: 19px; }
          .aw-reset .body { font-size: 13.5px; }
          .aw-reset .cta { display: block; width: 100%; text-align: center; white-space: normal; }
        }
      `}</style>

      <div className="bg" aria-hidden="true">
        {EVENT_IMAGE ? (
          <img src={EVENT_IMAGE} alt="" />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(70% 60% at 50% 35%, rgba(232,224,203,0.16) 0%, rgba(79,86,54,0) 70%), linear-gradient(165deg, #5C6440 0%, #4F5636 50%, #314323 100%)",
            }}
          />
        )}
      </div>
      <div className="wash" aria-hidden="true" />

      <div className="inner">
        <h2>
          New Year <em>Reset</em>
        </h2>

        <p className="where">Cape Town | November 2026</p>

        <p className="kicker">
          A day of reflection, release, reconnection and intentional manifestation.
        </p>

        <p className="body">
          An intimate, guided experience designed to help women start the year deliberately and enter the next season of life with greater clarity and intention.
        </p>

        {/* No public events page exists yet, so this captures interest. */}
        <Link to="/Contact" className="cta">
          Register your interest
        </Link>
      </div>
    </section>
  );
}