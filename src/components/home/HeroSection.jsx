import React from "react";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────────────────────
// Home hero · the August 2026 landing design, over a video.
//
// Adding a moving background inverts the section: the design's light
// treatment cannot survive over footage, so the type is now cream on a
// burgundy wash rather than burgundy on cream. Everything else, the
// scale, the spacing, the copy, is unchanged.
//
// Two things make the text legible rather than hoping it will be. The
// wash is a real burgundy gradient, heaviest in the middle third where
// the copy sits, so the contrast does not depend on which frame is
// playing. And the whole content block sits above it at z-index 1.
// ────────────────────────────────────────────────────────────────

const BURG = "#4A0E2E";
const ROSE = "#C4847A";
const ROSE_SOFT = "#E8B4AE";
const SAND = "#FAF5F3";
const INK = "#0E0208";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

const HERO_VIDEO = "https://pub-f81092ac00b24c449008a93f41d7542d.r2.dev/Untitled%205.mp4";

export default function HeroSection() {
  return (
    <section className="aw-hero">
      <style>{`
        .aw-hero {
          position: relative;
          overflow: hidden;
          padding: 110px 80px 96px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          /* The gradient sits under the video, so a slow connection or a
             blocked autoplay shows brand colour rather than black. */
          background: linear-gradient(160deg, #1A0510 0%, ${BURG} 45%, #2B0A1A 100%);
        }
        .aw-hero .bg { position: absolute; inset: 0; z-index: 0; }
        .aw-hero .bg video {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        /* Heaviest through the middle third, where the copy sits. */
        .aw-hero .wash {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background:
            linear-gradient(180deg, rgba(26,5,16,0.82) 0%, rgba(74,14,46,0.88) 40%, rgba(74,14,46,0.88) 62%, rgba(26,5,16,0.86) 100%),
            radial-gradient(80% 60% at 50% 45%, rgba(196,132,122,0.16) 0%, rgba(8,1,5,0) 75%);
        }
        .aw-hero .inner {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; width: 100%;
        }

        .aw-hero .eyebrow {
          margin: 0 0 28px;
          font-family: ${sans}; font-weight: 700; font-size: 10.5px;
          letter-spacing: 0.34em; text-transform: uppercase; color: ${ROSE_SOFT};
        }
        .aw-hero h1 {
          margin: 0;
          font-family: ${serif}; font-weight: 400; font-size: 62px;
          line-height: 1.08; color: ${SAND}; max-width: 920px;
          text-shadow: 0 2px 24px rgba(8,1,5,0.45);
        }
        .aw-hero h1 em {
          font-family: ${serif}; font-style: italic; color: ${ROSE_SOFT};
        }
        .aw-hero .kicker {
          margin: 26px 0 0;
          font-family: ${serif}; font-style: italic; font-size: 34px;
          line-height: 1.2; color: ${ROSE_SOFT};
          text-shadow: 0 2px 20px rgba(8,1,5,0.4);
        }
        .aw-hero .lede {
          margin: 38px 0 0;
          font-family: ${sans}; font-weight: 300; font-size: 15.5px; line-height: 1.85;
          color: rgba(250,245,243,0.86); max-width: 640px;
          text-shadow: 0 1px 14px rgba(8,1,5,0.5);
        }
        .aw-hero .lede + .lede { margin-top: 18px; }

        .aw-hero .actions {
          display: flex; align-items: center; gap: 16px; margin-top: 40px;
          flex-wrap: wrap; justify-content: center;
        }
        .aw-hero .btn {
          display: inline-block; border-radius: 100px; text-decoration: none;
          font-family: ${sans}; font-weight: 700; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase; white-space: nowrap;
          transition: background 320ms cubic-bezier(0.2,0.7,0.2,1),
                      color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      border-color 320ms cubic-bezier(0.2,0.7,0.2,1),
                      transform 320ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .aw-hero .btn:active { transform: scale(0.96); }
        .aw-hero .btn.solid {
          background: ${ROSE}; color: ${INK}; padding: 17px 32px; border: 1.5px solid ${ROSE};
        }
        .aw-hero .btn.solid:hover { background: ${ROSE_SOFT}; border-color: ${ROSE_SOFT}; }
        /* On footage a hairline outline disappears. This one carries a
           translucent fill so it holds its shape over any frame. */
        .aw-hero .btn.outline {
          border: 1.5px solid rgba(250,245,243,0.55); color: ${SAND};
          padding: 16px 30px; background: rgba(250,245,243,0.08);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        }
        .aw-hero .btn.outline:hover { background: rgba(250,245,243,0.2); border-color: ${SAND}; }
        .aw-hero *:focus-visible { outline: 2px solid ${ROSE_SOFT}; outline-offset: 3px; }

        /* A moving background is exactly what this setting is for. */
        @media (prefers-reduced-motion: reduce) {
          .aw-hero .bg { display: none; }
          .aw-hero .btn { transition: none; }
        }

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
          /* Footage cropped to a narrow column reads as noise, and it is
             the most expensive thing on the page for someone on data.
             The brand gradient does the work instead. */
          .aw-hero .bg { display: none; }
          .aw-hero .actions {
            flex-direction: column; align-items: stretch; gap: 12px;
            margin-top: 32px; width: 100%; max-width: 320px;
          }
          .aw-hero .btn { display: block; text-align: center; }
          .aw-hero .btn.solid { padding: 17px 24px; }
          .aw-hero .btn.outline { padding: 16px 24px; }
        }
      `}</style>

      <div className="bg" aria-hidden="true">
        <video
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        />
      </div>
      <div className="wash" aria-hidden="true" />

      <div className="inner">
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
          {/* The Community sits behind login, so this goes to registration.
              Hormone Health is free to registered members, so the promise
              is honoured as soon as she signs up. */}
          <Link to="/register" className="btn outline">
            Join the community
          </Link>
        </div>
      </div>
    </section>
  );
}
