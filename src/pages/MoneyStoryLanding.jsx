import React from "react";
import { ArrowRight, Brain, Compass, PenLine, Heart } from "lucide-react";

const C = {
  maroon: "var(--aw-burg-core)",
  burgundy: "var(--aw-burg-mid)",
  rose: "var(--aw-rose-core)",
  pink: "var(--aw-off-white)",
  pink2: "var(--aw-rose-wash)",
  ink: "var(--aw-dark-grey)",
  line: "var(--aw-border-light)",
};
const serif = "var(--aw-font-display)";
const sans = "var(--aw-font-sans)";

const MOVEMENTS = [
  {
    icon: Brain,
    title: "Understand",
    body: "How your brain actually filters money, and why you see what you see. Real neuroscience, explained simply.",
  },
  {
    icon: Compass,
    title: "Uncover",
    body: "Where your particular money story began, and the pattern your mind adopted to keep you safe.",
  },
  {
    icon: PenLine,
    title: "Rewrite",
    body: "In your own words, the new agreement that makes familiar what once felt out of reach.",
  },
];

export default function MoneyStoryLanding() {
  return (
    <div style={{ minHeight: "100vh", background: C.pink, fontFamily: sans, color: C.ink }}>
      <style>{`
        .msl-it{font-style:italic;color:${C.rose}}
        .msl-hero{display:flex;flex-direction:column;align-items:center;text-align:center;padding:90px 24px 70px;max-width:820px;margin:0 auto}
        .msl-eyebrow{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:${C.rose};font-weight:700;margin-bottom:20px}
        .msl-h1{font-family:${serif};font-weight:500;font-size:clamp(36px,6vw,58px);line-height:1.08;color:${C.maroon};margin:0 0 24px;letter-spacing:.2px}
        .msl-sub{font-size:18px;line-height:1.7;color:${C.ink};max-width:620px;margin:0 auto 36px;opacity:.88}
        .msl-cta{display:inline-flex;align-items:center;gap:10px;background:${C.maroon};color:#fff;border:0;border-radius:999px;padding:18px 38px;font-size:15px;font-weight:600;letter-spacing:.01em;cursor:pointer;transition:background .18s,transform .18s;font-family:${sans}}
        .msl-cta:hover{background:${C.burgundy};transform:translateY(-2px)}
        .msl-fineprint{font-size:13.5px;color:${C.ink};opacity:.6;margin-top:18px}
        .msl-movements{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;max-width:1000px;margin:0 auto;padding:0 24px 80px}
        .msl-card{background:#fff;border:1px solid ${C.line};border-radius:18px;padding:32px 28px;transition:transform .2s,border-color .2s}
        .msl-card:hover{transform:translateY(-4px);border-color:${C.rose}}
        .msl-card-icon{width:48px;height:48px;border-radius:12px;background:${C.pink2};color:${C.maroon};display:grid;place-items:center;margin-bottom:18px}
        .msl-card-h{font-family:${serif};font-size:25px;color:${C.maroon};margin:0 0 10px}
        .msl-card-body{font-size:15px;line-height:1.65;color:${C.ink};opacity:.85;margin:0}
        .msl-promise{max-width:760px;margin:0 auto;padding:70px 24px;text-align:center}
        .msl-promise-h{font-family:${serif};font-size:32px;color:${C.maroon};margin:0 0 20px;line-height:1.2}
        .msl-promise-body{font-size:17px;line-height:1.75;color:${C.ink};opacity:.85;margin:0 0 14px}
        .msl-final{display:flex;flex-direction:column;align-items:center;text-align:center;padding:60px 24px 90px;max-width:700px;margin:0 auto}
        .msl-care{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:${C.ink};opacity:.65;margin-bottom:28px}
        @media(max-width:760px){
          .msl-movements{grid-template-columns:1fr}
          .msl-hero{padding:60px 20px 50px}
        }
      `}</style>

      {/* Hero */}
      <section className="msl-hero">
        <div className="msl-eyebrow">A Free Integration Workbook</div>
        <h1 className="msl-h1">
          Learn how to finally own your <span className="msl-it">money story</span>.
        </h1>
        <p className="msl-sub">
          The ceiling you keep hitting with money is older than you think. In roughly fifteen
          minutes, find out where your money story started, how your mind has been running it, and
          then write yourself a new one.
        </p>
        <button className="msl-cta" onClick={() => { window.location.href = "/YourMoneyStory"; }}>
          START NOW <ArrowRight className="w-4 h-4" />
        </button>
        <p className="msl-fineprint">Free. No account needed to begin. Just for you.</p>
      </section>

      {/* Three movements */}
      <section className="msl-movements">
        {MOVEMENTS.map((m, i) => (
          <div className="msl-card" key={i}>
            <div className="msl-card-icon">
              <m.icon className="w-5 h-5" />
            </div>
            <h3 className="msl-card-h">{m.title}</h3>
            <p className="msl-card-body">{m.body}</p>
          </div>
        ))}
      </section>

      {/* Promise */}
      <section className="msl-promise">
        <h2 className="msl-promise-h">You were never bad with money.</h2>
        <p className="msl-promise-body">
          You were handed a story, very young, and told it was yours. The good news, backed by how
          the brain actually works, is that a story can be rewritten. By the time we are done you
          will see the whole thing clearly, and you will have written your new money agreement in
          your own words.
        </p>
      </section>

      {/* Final CTA */}
      <section className="msl-final">
        <div className="msl-care">
          <Heart className="w-3.5 h-3.5" /> Gentle self-reflection. You set the pace.
        </div>
        <button className="msl-cta" onClick={() => { window.location.href = "/YourMoneyStory"; }}>
          BEGIN YOUR MONEY STORY <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}