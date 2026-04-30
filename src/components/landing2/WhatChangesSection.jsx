import React, { useState } from "react";

const DOMAINS = [
  {
    num: "01",
    title: "Mindset & Behaviour",
    outcomes: [
      "Identify and rewire subconscious limiting beliefs",
      "Build a daily practice that supports clarity and confidence",
      "Understand the root of self-sabotage — and end it",
      "Move from reactive to intentional leadership of your own life",
    ],
  },
  {
    num: "02",
    title: "Nervous System",
    outcomes: [
      "Understand your unique stress response patterns",
      "Learn regulation techniques that actually work for women",
      "Break cycles of anxiety, freeze, and overwhelm",
      "Build a nervous system that can hold more success",
    ],
  },
  {
    num: "03",
    title: "Health & Hormones",
    outcomes: [
      "Sync your energy and ambition to your natural cycle",
      "Understand how hormones shape your mood, focus, and drive",
      "Stop fighting your body — start working with it",
      "Build sustainable energy without burnout",
    ],
  },
  {
    num: "04",
    title: "Money",
    outcomes: [
      "Heal your relationship with money at the root",
      "Build financial confidence and earning capacity",
      "Learn wealth frameworks built for women",
      "Create a financial strategy aligned to your values",
    ],
  },
  {
    num: "05",
    title: "Leadership & Authority",
    outcomes: [
      "Claim your voice without apology",
      "Lead in rooms that weren't designed for you",
      "Build presence and credibility that opens doors",
      "Navigate power dynamics with clarity and strategy",
    ],
  },
  {
    num: "06",
    title: "Relationships",
    outcomes: [
      "Understand your attachment patterns and how to shift them",
      "Set boundaries from a place of self-worth",
      "Build relationships that support your growth",
      "End cycles of people-pleasing and over-giving",
    ],
  },
  {
    num: "07",
    title: "Identity & Visibility",
    outcomes: [
      "Define who you are outside of roles and expectations",
      "Build a personal identity that is fully your own",
      "Show up visibly and consistently in your life and work",
      "Own your story — and let it become your power",
    ],
  },
];

export default function WhatChangesSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-28 px-4" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto">
        {/* Label */}
        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-6" style={{ color: "#C4866C" }}>
          What Changes
        </p>

        {/* Headline */}
        <div className="mb-16">
          <h2 className="font-bold uppercase leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.2rem, 5vw, 4rem)", color: "#fff" }}>
            Not what you will learn.
          </h2>
          <h2 className="italic leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.2rem, 5vw, 4rem)", color: "#C4866C" }}>
            What you will become.
          </h2>
        </div>

        {/* Two-col layout */}
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Accordion */}
          <div className="border-t" style={{ borderColor: "rgba(196,134,108,0.2)" }}>
            {DOMAINS.map((d, i) => (
              <button
                key={d.num}
                onClick={() => setActive(i)}
                className="w-full flex items-center justify-between py-5 px-2 text-left border-b transition-all group"
                style={{ borderColor: "rgba(196,134,108,0.2)", background: i === active ? "rgba(196,134,108,0.07)" : "transparent" }}
              >
                <div className="flex items-center gap-5">
                  <span className="text-xs font-bold" style={{ color: "#C4866C" }}>{d.num}</span>
                  <span className="font-semibold text-sm tracking-wide" style={{ color: i === active ? "#fff" : "rgba(255,255,255,0.55)" }}>
                    {d.title}
                  </span>
                </div>
                <span style={{ color: "#C4866C", fontSize: "1.2rem" }}>{i === active ? "↓" : "→"}</span>
              </button>
            ))}
          </div>

          {/* Right: Detail panel */}
          <div className="p-10 flex flex-col justify-center" style={{ background: "#3a0d22", minHeight: "320px" }}>
            <p className="text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{ color: "#C4866C" }}>
              {DOMAINS[active].num} — {DOMAINS[active].title}
            </p>
            <h3 className="text-white font-bold text-xl mb-8" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              What shifts when you do this work:
            </h3>
            <div className="space-y-4">
              {DOMAINS[active].outcomes.map((o, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: "#C4866C" }}>0{i + 1}</span>
                  <p className="text-white/70 text-sm leading-relaxed">{o}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="text-center mt-20">
          <p className="italic text-white/40 max-w-xl mx-auto" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.3rem" }}>
            "You were meant to rewrite the rules. On your own terms."
          </p>
        </div>
      </div>
    </section>
  );
}