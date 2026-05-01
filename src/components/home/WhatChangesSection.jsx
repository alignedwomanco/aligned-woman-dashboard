import React, { useState } from "react";
import { motion } from "framer-motion";

const DOMAINS = [
  {
    num: "01",
    title: "MINDSET & BEHAVIOUR",
    transformation: "You stop reacting and start responding.",
    outcomes: [
      "Identify and rewire subconscious limiting beliefs holding you back",
      "Build a daily practice that supports clarity and confidence",
      "Understand the root of self-sabotage — and end it",
      "Move from reactive to intentional leadership of your own life",
    ],
  },
  {
    num: "02",
    title: "NERVOUS SYSTEM",
    transformation: "Your body becomes an asset, not an obstacle.",
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
    transformation: "You understand your body for the first time.",
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
    transformation: "Money stops feeling like a source of shame.",
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
    transformation: "You lead from who you are, not who you are performing.",
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
    transformation: "You become someone people trust before you speak.",
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
    transformation: "You stop editing yourself and start owning your presence.",
    outcomes: [
      "Define who you are outside of roles and expectations",
      "Build a personal identity that is fully your own",
      "Show up visibly and consistently in your life and work",
      "Own your story — and let it become your power",
    ],
  },
];

function DetailPane({ domain }) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, rgba(74,14,46,0.35), rgba(26,5,16,0.35))",
        borderRadius: 8,
        padding: 48,
        position: "relative",
        overflow: "hidden",
        minHeight: 420,
      }}
    >
      {/* Watermark number */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: 16,
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontStyle: "italic",
          fontSize: 180,
          color: "rgba(196,132,122,0.06)",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {domain.num}
      </div>

      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20, fontFamily: "Montserrat, sans-serif" }}>
        {domain.title}
      </p>

      <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "clamp(28px, 5vw, 40px)", color: "#fff", lineHeight: 1.25, marginBottom: 36 }}>
        "{domain.transformation}"
      </p>

      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20, fontFamily: "Montserrat, sans-serif" }}>
        WHAT THIS MEANS IN PRACTICE
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1 }}>
        {domain.outcomes.map((o, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#C4847A", flexShrink: 0, marginTop: 2, fontFamily: "Montserrat, sans-serif" }}>
              0{i + 1}
            </span>
            <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0, fontFamily: "Montserrat, sans-serif" }}>
              {o}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WhatChangesSection() {
  const [selected, setSelected] = useState(1);
  const [openMobile, setOpenMobile] = useState(1);

  return (
    <section style={{ background: "#080105", padding: "clamp(72px,10vw,120px) 24px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>

        {/* Headline block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: "clamp(48px,8vw,80px)" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
            <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#A86B6C", fontFamily: "Montserrat, sans-serif", margin: 0 }}>
              WHAT CHANGES
            </p>
            <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
          </div>

          <div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.03em", fontSize: "clamp(48px, 8vw, 72px)", color: "#fff", lineHeight: 1.05, margin: 0 }}>
              NOT WHAT YOU
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.03em", fontSize: "clamp(48px, 8vw, 72px)", color: "#fff", lineHeight: 1.05, margin: 0 }}>
              WILL LEARN.
            </p>
            <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "clamp(52px, 9vw, 88px)", color: "#C4847A", lineHeight: 1.05, margin: 0 }}>
              What you will become.
            </p>
          </div>
        </motion.div>

        {/* DESKTOP: side-by-side grid */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{ display: "none" }}
          className="wc-desktop"
        >
          <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.4fr", gap: 48 }}>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
              {DOMAINS.map((d, i) => {
                const active = selected === i;
                return (
                  <button
                    key={d.num}
                    onClick={() => setSelected(i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "22px 40px",
                      background: active ? "rgba(74,14,46,0.35)" : "transparent",
                      border: "none",
                      borderBottom: i < DOMAINS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      outline: active ? "1px solid rgba(196,132,122,0.2)" : "none",
                      outlineOffset: -1,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(196,132,122,0.04)"; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; } }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: active ? "#C4847A" : "rgba(255,255,255,0.3)", fontFamily: "Montserrat, sans-serif" }}>
                      {d.num} · {d.title}
                    </span>
                    <span style={{ color: active ? "#C4847A" : "rgba(255,255,255,0.15)", fontSize: 14, flexShrink: 0, marginLeft: 12 }}>→</span>
                  </button>
                );
              })}
            </div>
            <DetailPane domain={DOMAINS[selected]} />
          </div>
        </motion.div>

        {/* MOBILE: accordion */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="wc-mobile"
          style={{ display: "none" }}
        >
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
            {DOMAINS.map((d, i) => {
              const open = openMobile === i;
              return (
                <div key={d.num} style={{ borderBottom: i < DOMAINS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <button
                    onClick={() => setOpenMobile(open ? -1 : i)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", background: open ? "rgba(74,14,46,0.35)" : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: open ? "#C4847A" : "rgba(255,255,255,0.3)", fontFamily: "Montserrat, sans-serif" }}>
                      {d.num} · {d.title}
                    </span>
                    <span style={{ color: open ? "#C4847A" : "rgba(255,255,255,0.15)", fontSize: 14, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.25s", flexShrink: 0, marginLeft: 12 }}>→</span>
                  </button>
                  {open && (
                    <div style={{ padding: "0 8px 8px" }}>
                      <DetailPane domain={d} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Closing line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ marginTop: 64, textAlign: "center" }}
        >
          <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "clamp(18px, 3vw, 24px)", color: "rgba(255,255,255,0.65)", marginBottom: 12 }}>
            You were meant to rewrite the rules.{" "}
            <span style={{ color: "#C4847A" }}>On your own terms.</span>
          </p>
          <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.35)", fontFamily: "Montserrat, sans-serif", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
            If you recognised yourself in any of these seven domains, the Blueprint was built for you.
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .wc-desktop { display: block !important; }
          .wc-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .wc-mobile { display: block !important; }
          .wc-desktop { display: none !important; }
        }
      `}</style>
    </section>
  );
}