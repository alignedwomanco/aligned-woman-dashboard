import React from "react";
import { Link } from "react-router-dom";

const LIST_ITEMS = [
  "How to understand our nervous systems and why we react the way we do",
  "How to regulate stress and avoid burnout — sustainably",
  "How to sync our work, rest, and ambition with our hormonal cycles",
  "How to build financial confidence and wealth from the inside out",
  "How to lead, love, and live with clear identity and authentic authority",
];

export default function BlueprintIntroSection() {
  return (
    <section className="py-28 px-4" style={{ background: "#F5E6E0" }}>
      <div className="max-w-5xl mx-auto">
        {/* Headline */}
        <h2 className="mb-4 leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}>
          <span className="font-bold" style={{ color: "#6B1B3D" }}>Welcome to </span>
          <span className="italic font-normal" style={{ color: "#C4866C" }}>the 2.0 version </span>
          <span className="font-bold" style={{ color: "#6B1B3D" }}>of yourself.</span>
        </h2>

        <p className="italic text-xl mb-10 leading-relaxed" style={{ color: "#C4866C", fontFamily: "'DM Serif Display', Georgia, serif" }}>
          The missing manual for modern women's lives.
        </p>

        <p className="text-gray-700 leading-relaxed mb-10 max-w-3xl" style={{ fontSize: "1.05rem" }}>
          Women have been taught many things. But almost never the things that matter most. The internal frameworks, the body literacy, the financial fluency, the emotional sovereignty — the knowledge that makes everything else possible. We were given rules to follow, not tools to self-navigate.
        </p>

        {/* Numbered list */}
        <div className="space-y-5 mb-12">
          {LIST_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-5">
              <span className="font-bold text-sm flex-shrink-0 mt-0.5" style={{ color: "#C4866C", minWidth: "2rem" }}>
                0{i + 1}
              </span>
              <p className="text-gray-800 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>

        <p className="italic text-gray-600 mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "1.1rem" }}>
          Internal literacy is the foundation of external success. Without it, we build on sand.
        </p>

        <p className="font-bold mb-10" style={{ color: "#6B1B3D" }}>
          The Aligned Woman Blueprint™ was created to close this gap.
        </p>

        <Link
          to="/blueprint"
          className="inline-block px-10 py-4 font-bold text-sm tracking-[0.2em] uppercase text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: "#6B1B3D" }}
        >
          Sign Up
        </Link>
      </div>
    </section>
  );
}