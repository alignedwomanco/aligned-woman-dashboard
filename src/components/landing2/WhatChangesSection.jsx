import React, { useState } from "react";

const DOMAINS = [
  {
    num: "01",
    title: "MINDSET & BEHAVIOUR",
    heading: "Your mind stops working against you.",
    outcomes: [
      "Identify and rewire subconscious limiting beliefs",
      "Build a daily practice that supports clarity and confidence",
      "Understand the root of self-sabotage — and end it",
      "Move from reactive to intentional leadership of your own life",
    ],
  },
  {
    num: "02",
    title: "NERVOUS SYSTEM",
    heading: "Your body becomes an asset, not an obstacle.",
    outcomes: [
      "Understand your unique stress response patterns",
      "Learn regulation techniques that actually work for women",
      "Break cycles of anxiety, freeze, and overwhelm",
      "Build a nervous system that can hold more success",
    ],
  },
  {
    num: "03",
    title: "HEALTH & HORMONES",
    heading: "You stop fighting your body and start working with it.",
    outcomes: [
      "Sync your energy and ambition to your natural cycle",
      "Understand how hormones shape your mood, focus, and drive",
      "Stop fighting your body — start working with it",
      "Build sustainable energy without burnout",
    ],
  },
  {
    num: "04",
    title: "MONEY",
    heading: "You build wealth without shame or scarcity.",
    outcomes: [
      "Heal your relationship with money at the root",
      "Build financial confidence and earning capacity",
      "Learn wealth frameworks built for women",
      "Create a financial strategy aligned to your values",
    ],
  },
  {
    num: "05",
    title: "LEADERSHIP & AUTHORITY",
    heading: "You claim your voice and your place.",
    outcomes: [
      "Claim your voice without apology",
      "Lead in rooms that weren't designed for you",
      "Build presence and credibility that opens doors",
      "Navigate power dynamics with clarity and strategy",
    ],
  },
  {
    num: "06",
    title: "RELATIONSHIPS",
    heading: "You stop shrinking to keep the peace.",
    outcomes: [
      "Understand your attachment patterns and how to shift them",
      "Set boundaries from a place of self-worth",
      "Build relationships that support your growth",
      "End cycles of people-pleasing and over-giving",
    ],
  },
  {
    num: "07",
    title: "IDENTITY & VISIBILITY",
    heading: "You become someone you actually recognise.",
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
  const domain = DOMAINS[active];

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
                className="w-full flex items-center justify-between py-5 px-4 text-left border-b transition-all"
                style={{
                  borderColor: "rgba(196,134,108,0.2)",
                  background: i === active ? "rgba(196,134,108,0.1)" : "transparent",
                }}
              >
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#C4866C", fontFamily: "Montserrat, sans-serif" }}>{d.num}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: i === active ? "#fff" : "rgba(255,255,255,0.5)", fontFamily: "Montserrat, sans-serif" }}>
                    — {d.title}
                  </span>
                </div>
                <span style={{ color: "#C4866C", fontSize: "1rem" }}>{i === active ? "↓" : "→"}</span>
              </button>
            ))}
          </div>

          {/* Right: Detail panel */}
          <div
            className="p-10 flex flex-col justify-center relative overflow-hidden"
            style={{ background: "#3a0d22", minHeight: "380px" }}
          >
            {/* Large watermark number */}
            <div
              style={{
                position: "absolute",
                right: -10,
                bottom: -20,
                fontSize: "clamp(100px, 14vw, 160px)",
                fontWeight: 900,
                color: "rgba(255,255,255,0.04)",
                fontFamily: "'DM Serif Display', Georgia, serif",
                lineHeight: 1,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {domain.num}
            </div>

            {/* Label */}
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#C4866C", marginBottom: 16, fontFamily: "Montserrat, sans-serif" }}>
              {domain.title}
            </p>

            {/* Heading */}
            <h3
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                color: "#fff",
                fontWeight: 400,
                fontStyle: "italic",
                lineHeight: 1.3,
                marginBottom: 28,
              }}
            >
              "{domain.heading}"
            </h3>

            {/* Sub-label */}
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(196,134,108,0.6)", marginBottom: 16, fontFamily: "Montserrat, sans-serif" }}>
              WHAT THIS MEANS IN PRACTICE
            </p>

            {/* Outcomes */}
            <div className="space-y-4 relative z-10">
              {domain.outcomes.map((o, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#C4866C", flexShrink: 0, marginTop: 2, fontFamily: "Montserrat, sans-serif" }}>0{i + 1}</span>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.7 }}>{o}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="text-center mt-20">
          <p
            className="italic mb-4"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)", color: "rgba(255,255,255,0.55)" }}
          >
            "You were meant to rewrite the rules. On your own terms."
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "Montserrat, sans-serif", maxWidth: 520, margin: "0 auto" }}>
            If you recognised yourself in any of these seven domains, the Blueprint was built for you.
          </p>
        </div>
      </div>
    </section>
  );
}