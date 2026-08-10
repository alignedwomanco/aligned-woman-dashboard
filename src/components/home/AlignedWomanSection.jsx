import React, { useState } from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// Your path to alignment · rebuilt to the August 2026 landing design.
// Replaces the "Who she is" block.
//
// An accordion of the five ways into the ecosystem. Built as buttons
// with real state rather than <details>, because the design animates the
// open and close and native details snaps.
//
// The first item is open on load, as drawn, so the pattern is obvious
// without anyone having to click to discover it.
// ────────────────────────────────────────────────────────────────

const SAND = "#FAF5F3";
const BURG = "#4A0E2E";
const ROSE = "#C4847A";
const INK = "#0E0208";

// Events and retreats carry their own colour, an olive that appears
// nowhere else on the page. Deliberate: the gatherings are a different
// kind of offer from the digital ones, and the shift in colour is what
// says so before the copy does.
const OLIVE = "#314323";
const OLIVE_HOVER = "#25331A";
const OLIVE_TEXT = "#E8E0CB";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

const PATHS = [
  {
    id: "profile",
    title: "Start with the Starting Point Profile",
    body: "Discover the patterns influencing the way you are currently operating and receive personalised guidance based on your results.",
    actions: [{ label: "Start here", to: "/StartingPointProfile", kind: "solid" }],
  },
  {
    id: "practitioner",
    title: "Find an AW Verified practitioner",
    body: "Connect with a trusted specialist whose work aligns with your needs, or apply to become part of our growing network of practitioners and experts.",
    // The Directory sits behind login, so this goes to registration
    // rather than a route that would bounce her to a sign in screen.
    actions: [
      { label: "Search the directory", to: "/register", kind: "solid" },
      { label: "Apply to the AW Standard", to: "/theawstandard", kind: "outline" },
    ],
    note: "Account required. Takes under a minute to register. No credit card required.",
  },
  {
    id: "education",
    title: "Learn through expert-led education",
    body: "Begin with The Aligned Woman Blueprint, our flagship programme, or apply to host and share your own expertise within the ecosystem.",
    actions: [{ label: "Start here", to: "/blueprint", kind: "solid" }],
  },
  {
    id: "community",
    title: "Join the community",
    body: "Become part of private groups, specialist discussions, live sessions and event communities designed around genuine connection rather than performance.",
    actions: [{ label: "Start here", to: "/register", kind: "solid" }],
  },
  {
    id: "events",
    title: "Attend events and retreats",
    body: "Experience the work in practice through carefully designed gatherings built around body, beliefs and belonging.",
    // No public events page exists yet, so this captures interest.
    actions: [{ label: "Find out more", to: "/Contact", kind: "olive" }],
  },
];

export default function AlignedWomanSection() {
  const [open, setOpen] = useState("profile");

  return (
    <section className="aw-path" style={{ background: "#FFFFFF" }}>
      <style>{`
        .aw-path { padding: 96px 80px; }
        .aw-path .inner { max-width: 1160px; margin: 0 auto; }
        .aw-path .eyebrow {
          margin: 0 0 20px;
          font-family: ${sans};
          font-weight: 700;
          font-size: 9.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: ${BURG};
          text-align: center;
        }
        .aw-path h2 {
          margin: 0 auto;
          font-family: ${serif};
          font-weight: 400;
          font-size: 44px;
          line-height: 1.1;
          color: ${BURG};
          text-align: center;
          max-width: 880px;
        }
        .aw-path h2 em {
          font-family: ${serif};
          font-style: italic;
          color: ${ROSE};
        }
        .aw-path .lede {
          margin: 20px auto 0;
          font-family: ${sans};
          font-weight: 300;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(42,10,28,0.75);
          text-align: center;
          max-width: 640px;
        }
        .aw-path .list { max-width: 760px; margin: 56px auto 0; }

        .aw-path .row { border-top: 1px solid rgba(74,14,46,0.15); }
        .aw-path .row:last-child { border-bottom: 1px solid rgba(74,14,46,0.15); }
        .aw-path .head {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          width: 100%; padding: 24px 4px; background: none; border: none;
          cursor: pointer; text-align: left; font-family: inherit;
        }
        .aw-path .head h3 {
          margin: 0;
          font-family: ${serif};
          font-weight: 400;
          font-size: 24px;
          line-height: 1.3;
          color: ${BURG};
          transition: color 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-path .head:hover h3 { color: ${ROSE}; }
        .aw-path .sign {
          font-family: ${sans}; font-weight: 300; font-size: 22px; color: ${ROSE};
          flex-shrink: 0; line-height: 1;
          transition: transform 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-path .head[aria-expanded="true"] .sign { transform: rotate(45deg); }

        /* Grid rows animate from 0fr to 1fr, which gives a real height
           transition without measuring the content in JS. */
        .aw-path .panel {
          display: grid; grid-template-rows: 0fr;
          transition: grid-template-rows 380ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-path .panel.open { grid-template-rows: 1fr; }
        .aw-path .panel > .clip { overflow: hidden; }
        .aw-path .panel p.body {
          margin: 0; padding: 0 4px 18px;
          font-family: ${sans}; font-weight: 300; font-size: 14.5px; line-height: 1.85;
          color: rgba(42,10,28,0.75);
        }
        .aw-path .actions {
          padding: 0 4px 26px; display: flex; flex-direction: column;
          align-items: flex-start; gap: 12px;
        }
        .aw-path .actions .row-btns { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .aw-path .note {
          margin: 0; font-family: ${sans}; font-weight: 300; font-size: 12.5px;
          line-height: 1.7; color: rgba(42,10,28,0.6);
        }

        .aw-path .btn {
          display: inline-block; border-radius: 100px; text-decoration: none;
          font-family: ${sans}; font-weight: 700; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase; white-space: nowrap;
          transition: background 320ms cubic-bezier(0.2,0.7,0.2,1),
                      color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      border-color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      transform 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-path .btn:active { transform: scale(0.96); }
        .aw-path .btn.solid {
          background: ${ROSE}; color: ${INK}; padding: 15px 28px;
          border: 1.5px solid ${ROSE};
        }
        .aw-path .btn.solid:hover { background: #A86460; border-color: #A86460; color: #fff; }
        .aw-path .btn.outline {
          border: 1.5px solid ${BURG}; color: ${BURG}; padding: 14px 28px; background: transparent;
        }
        .aw-path .btn.outline:hover { background: ${BURG}; color: #fff; }
        .aw-path .btn.olive {
          background: ${OLIVE}; color: ${OLIVE_TEXT}; padding: 15px 28px;
          border: 1.5px solid ${OLIVE};
        }
        .aw-path .btn.olive:hover { background: ${OLIVE_HOVER}; border-color: ${OLIVE_HOVER}; color: #fff; }
        .aw-path *:focus-visible { outline: 2px solid #A86460; outline-offset: 3px; }

        @media (prefers-reduced-motion: reduce) {
          .aw-path .panel, .aw-path .sign, .aw-path .head h3 { transition: none; }
        }

        @media (max-width: 980px) {
          .aw-path { padding: 80px 40px; }
          .aw-path h2 { font-size: 34px; }
        }
        @media (max-width: 700px) {
          .aw-path { padding: 64px 24px; }
          .aw-path h2 { font-size: 27px; line-height: 1.2; }
          .aw-path .lede { font-size: 14px; }
          .aw-path .list { margin-top: 40px; }
          .aw-path .head { padding: 20px 2px; }
          .aw-path .head h3 { font-size: 19px; }
          .aw-path .actions .row-btns { width: 100%; flex-direction: column; align-items: stretch; }
          .aw-path .btn { display: block; text-align: center; }
        }
      `}</style>

      <div className="inner">
        <p className="eyebrow">Your path to alignment</p>
        <h2>
          There is no single path <em>to alignment.</em>
        </h2>
        <p className="lede">
          Every woman enters the ecosystem differently, but every path is designed to create deeper understanding, stronger connection and lasting change.
        </p>

        <div className="list">
          {PATHS.map((p) => {
            const isOpen = open === p.id;
            return (
              <div className="row" key={p.id}>
                <button
                  type="button"
                  className="head"
                  aria-expanded={isOpen}
                  aria-controls={`aw-path-${p.id}`}
                  onClick={() => setOpen(isOpen ? null : p.id)}
                >
                  <h3>{p.title}</h3>
                  <span className="sign" aria-hidden="true">+</span>
                </button>

                <div id={`aw-path-${p.id}`} className={isOpen ? "panel open" : "panel"} role="region">
                  <div className="clip">
                    <p className="body">{p.body}</p>
                    <div className="actions">
                      <div className="row-btns">
                        {p.actions.map((a) => (
                          <Link
                            key={a.label}
                            to={a.to}
                            className={`btn ${a.kind}`}
                            tabIndex={isOpen ? 0 : -1}
                          >
                            {a.label} &#8594;
                          </Link>
                        ))}
                      </div>
                      {p.note && <p className="note">{p.note}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}