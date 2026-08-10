import React from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// Find an expert you can trust · rebuilt to the August 2026 landing
// design. Replaces the founder quote block.
//
// The section opens with a 2px burgundy rule rather than its own
// background, so it reads as a continuation of the cream page above it
// rather than a new panel.
//
// The mockup is the same hosted asset the dashboard uses for its
// verified practitioner card, so there is one copy of that image.
// ────────────────────────────────────────────────────────────────

const SAND = "#FAF5F3";
const BURG = "#4A0E2E";
const ROSE = "#C4847A";
const INK = "#0E0208";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

const MOCKUP =
  "https://media.base44.com/images/public/69f46886a412ee042303f1af/4c8c78821_awb-verified-two-up-v2.png";

const CHECKS = [
  "Qualifications and credentials",
  "Professional registration, where applicable",
  "Personal interview",
  "Ethical commitments",
  "Annual review",
];

export default function FounderQuoteSection() {
  return (
    <section className="aw-trust" style={{ background: SAND }}>
      <style>{`
        .aw-trust { padding: 0 80px 96px; }
        .aw-trust .inner {
          max-width: 1160px; margin: 0 auto;
          border-top: 2px solid ${BURG}; padding-top: 64px;
        }
        .aw-trust .head { text-align: center; margin-bottom: 56px; }
        .aw-trust .eyebrow {
          margin: 0 0 22px;
          font-family: ${sans}; font-weight: 700; font-size: 9.5px;
          letter-spacing: 0.32em; text-transform: uppercase; color: ${BURG};
        }
        .aw-trust h2 {
          margin: 0;
          font-family: ${serif}; font-weight: 400; font-size: 44px;
          line-height: 1.14; color: ${BURG};
        }
        .aw-trust h2 em {
          font-family: ${serif}; font-style: italic; color: ${ROSE};
        }

        .aw-trust .grid {
          display: grid; grid-template-columns: 1.05fr 1fr;
          gap: 64px; align-items: center;
        }
        .aw-trust .copy p {
          margin: 0;
          font-family: ${sans}; font-weight: 300; font-size: 15px; line-height: 1.85;
          color: rgba(42,10,28,0.8); max-width: 480px;
        }
        .aw-trust .copy p + p { margin-top: 16px; }

        .aw-trust .checks { margin-top: 22px; max-width: 480px; }
        .aw-trust .check {
          display: flex; align-items: center; gap: 14px; padding: 14px 0;
          border-top: 1px solid rgba(74,14,46,0.15);
        }
        .aw-trust .check:last-child { border-bottom: 1px solid rgba(74,14,46,0.15); }
        .aw-trust .tick { font-family: ${sans}; font-weight: 700; font-size: 13px; color: ${ROSE}; }
        .aw-trust .check span:last-child {
          font-family: ${sans}; font-weight: 500; font-size: 13.5px; color: #2A0A1C;
        }

        .aw-trust .shot { display: flex; align-items: center; justify-content: center; }
        /* Oversized and bled outward, then faded at the base so the phones
           dissolve into the page instead of stopping on a hard edge. */
        .aw-trust .shot img {
          width: 118%; max-width: 700px; margin: 0 -40px; display: block;
          -webkit-mask-image: linear-gradient(180deg, #000 86%, transparent 99%);
          mask-image: linear-gradient(180deg, #000 86%, transparent 99%);
        }

        .aw-trust .foot {
          max-width: 1160px; margin: 48px auto 0;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .aw-trust .foot .btns {
          display: flex; align-items: center; justify-content: center;
          gap: 16px; flex-wrap: wrap;
        }
        .aw-trust .note {
          margin: 0; font-family: ${sans}; font-weight: 300; font-size: 12.5px;
          line-height: 1.7; color: rgba(42,10,28,0.6); text-align: center;
        }

        .aw-trust .btn {
          display: inline-block; border-radius: 100px; text-decoration: none;
          font-family: ${sans}; font-weight: 700; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase; white-space: nowrap;
          transition: background 320ms cubic-bezier(0.2,0.7,0.2,1),
                      color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      border-color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      transform 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-trust .btn:active { transform: scale(0.96); }
        .aw-trust .btn.solid {
          background: ${ROSE}; color: ${INK}; padding: 16px 30px; border: 1.5px solid ${ROSE};
        }
        .aw-trust .btn.solid:hover { background: #A86460; border-color: #A86460; color: #fff; }
        .aw-trust .btn.outline {
          border: 1.5px solid ${BURG}; color: ${BURG}; padding: 15px 30px; background: transparent;
        }
        .aw-trust .btn.outline:hover { background: ${BURG}; color: #fff; }
        .aw-trust *:focus-visible { outline: 2px solid #A86460; outline-offset: 3px; }

        @media (max-width: 980px) {
          .aw-trust { padding: 0 40px 80px; }
          .aw-trust .inner { padding-top: 56px; }
          .aw-trust h2 { font-size: 34px; }
          .aw-trust .grid { grid-template-columns: 1fr; gap: 40px; }
          /* Copy first on a narrow screen. The mockup is supporting
             evidence, not the argument. */
          .aw-trust .shot { order: 2; }
          .aw-trust .copy { order: 1; }
          .aw-trust .copy p, .aw-trust .checks { max-width: none; }
          .aw-trust .shot img { width: 100%; margin: 0; }
        }
        @media (max-width: 700px) {
          .aw-trust { padding: 0 24px 64px; }
          .aw-trust .inner { padding-top: 48px; }
          .aw-trust .head { margin-bottom: 36px; }
          .aw-trust h2 { font-size: 27px; line-height: 1.2; }
          .aw-trust .copy p { font-size: 14px; }
          .aw-trust .foot .btns { width: 100%; flex-direction: column; align-items: stretch; }
          .aw-trust .btn { display: block; text-align: center; }
        }
      `}</style>

      <div className="inner">
        <div className="head">
          <p className="eyebrow">Credentialed practitioners &#183; Verified expertise</p>
          <h2>
            Find an expert <em>you can trust.</em>
          </h2>
        </div>

        <div className="grid">
          <div className="copy">
            <p>
              Search by specialty, location and how you want to meet. From health, hormones and mental health to money, career, business, law and creative work.
            </p>
            <p>
              We verify expertise rather than accepting self-reported credentials. Every professional on the platform is assessed against the AW Verified framework.
            </p>

            <div className="checks">
              {CHECKS.map((c) => (
                <div className="check" key={c}>
                  <span className="tick" aria-hidden="true">&#10003;</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="shot">
            <img src={MOCKUP} alt="The AW Verified directory and a practitioner profile shown on two phones" />
          </div>
        </div>
      </div>

      <div className="foot">
        <div className="btns">
          {/* The Directory is behind login, so this goes to registration
              rather than a route that would bounce her to a sign in page. */}
          <Link to="/register" className="btn solid">
            Search the directory &#8594;
          </Link>
          <Link to="/theawstandard" className="btn outline">
            Apply to the AW Standard
          </Link>
        </div>
        <p className="note">
          Account required. Takes under a minute to register. No credit card required.
        </p>
      </div>
    </section>
  );
}
