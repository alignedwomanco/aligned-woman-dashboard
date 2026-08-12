import React from "react";

// ────────────────────────────────────────────────────────────────
// Public "Retreats" landing page. Matches the brand system used
// across the home page: burgundy serif headings, rose accents,
// sand/white surfaces, Baskervville + Montserrat pairing.
// ────────────────────────────────────────────────────────────────

const BURG = "#4A0E2E";
const ROSE = "#C4847A";
const INK = "#0E0208";
const SAND = "#FAF5F3";
const OLIVE = "#314323";
const OLIVE_HOVER = "#25331A";
const OLIVE_TEXT = "#E8E0CB";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

export default function Retreats() {
  return (
    <section className="aw-retreats" style={{ background: "#FFFFFF" }}>
      <style>{`
        .aw-retreats { padding: 120px 80px; }
        .aw-retreats .inner { max-width: 1080px; margin: 0 auto; }
        .aw-retreats .eyebrow {
          margin: 0 0 20px;
          font-family: ${sans};
          font-weight: 700;
          font-size: 9.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${BURG};
          text-align: center;
        }
        .aw-retreats h1 {
          margin: 0 auto;
          font-family: ${serif};
          font-weight: 400;
          font-size: 48px;
          line-height: 1.1;
          color: ${BURG};
          text-align: center;
          max-width: 760px;
        }
        .aw-retreats h1 em {
          font-family: ${serif};
          font-style: italic;
          color: ${ROSE};
        }
        .aw-retreats .lede {
          margin: 24px auto 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 16px;
          line-height: 1.8;
          color: rgba(42,10,28,0.78);
          text-align: center;
          max-width: 640px;
        }
        .aw-retreats .pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin: 72px 0 0;
        }
        .aw-retreats .pillar {
          background: ${SAND};
          border-radius: 14px;
          padding: 40px 32px;
          text-align: center;
        }
        .aw-retreats .pillar .mark {
          font-family: ${serif};
          font-style: italic;
          font-size: 30px;
          color: ${ROSE};
          margin: 0 0 16px;
        }
        .aw-retreats .pillar h3 {
          margin: 0 0 12px;
          font-family: ${serif};
          font-weight: 400;
          font-size: 22px;
          color: ${BURG};
        }
        .aw-retreats .pillar p {
          margin: 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 14.5px;
          line-height: 1.7;
          color: rgba(42,10,28,0.75);
        }
        .aw-retreats .cta-wrap { text-align: center; margin: 64px 0 0; }
        .aw-retreats .btn {
          display: inline-block;
          border-radius: 100px;
          text-decoration: none;
          font-family: ${sans};
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
          background: ${OLIVE};
          color: ${OLIVE_TEXT};
          padding: 16px 32px;
          border: 1.5px solid ${OLIVE};
          transition: background 320ms cubic-bezier(0.2,0.7,0.2,1),
                      border-color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      color 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-retreats .btn:hover { background: ${OLIVE_HOVER}; border-color: ${OLIVE_HOVER}; color: #fff; }
        .aw-retreats .note {
          margin: 20px 0 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 12.5px;
          color: rgba(42,10,28,0.6);
          text-align: center;
        }
        .aw-retreats *:focus-visible { outline: 2px solid #A86460; outline-offset: 3px; }

        @media (max-width: 980px) {
          .aw-retreats { padding: 96px 40px; }
          .aw-retreats h1 { font-size: 36px; }
          .aw-retreats .pillars { grid-template-columns: 1fr; }
        }
        @media (max-width: 700px) {
          .aw-retreats { padding: 72px 24px; }
          .aw-retreats h1 { font-size: 28px; line-height: 1.2; }
          .aw-retreats .lede { font-size: 14.5px; }
          .aw-retreats .pillars { margin-top: 48px; gap: 20px; }
          .aw-retreats .pillar { padding: 32px 24px; }
        }
      `}</style>

      <div className="inner">
        <p className="eyebrow">Retreats &amp; Gatherings</p>
        <h1>Experience the work <em>in practice.</em></h1>
        <p className="lede">
          Carefully designed gatherings built around body, beliefs and belonging. An opportunity to move beyond the digital and into real, held spaces — with practitioners and women walking the same path.
        </p>

        <div className="pillars">
          <div className="pillar">
            <p className="mark">Body</p>
            <h3>Somatic practice</h3>
            <p>Guided movement, breath and nervous-system regulation to settle the body and reconnect with its signals.</p>
          </div>
          <div className="pillar">
            <p className="mark">Beliefs</p>
            <h3>Pattern work</h3>
            <p>Facilitated reflection on the inherited beliefs shaping how you operate, and the ones ready to be released.</p>
          </div>
          <div className="pillar">
            <p className="mark">Belonging</p>
            <h3>Shared space</h3>
            <p>Small-group circles designed for genuine connection — without performance, comparison or the need to arrive finished.</p>
          </div>
        </div>

        <div className="cta-wrap">
          <a className="btn" href="/Contact">Find out more &#8594;</a>
          <p className="note">Upcoming dates announced via the community. Register your interest and we'll be in touch.</p>
        </div>
      </div>
    </section>
  );
}