import React from "react";

const PILLARS = [
  {
    num: "01",
    title: "Honest",
    desc: "We don't sell you a fantasy. We tell you the truth about what it takes, what it costs, and what becomes possible when you do the real work. Radical honesty is our first act of respect.",
  },
  {
    num: "02",
    title: "Evidence-Informed",
    desc: "Everything we teach is grounded in neuroscience, psychology, and lived human experience. We don't teach trends. We teach what actually works — and we show our evidence.",
  },
  {
    num: "03",
    title: "Embodied",
    desc: "Information alone doesn't transform. We teach for integration — so that what you learn becomes who you are. Not knowledge you store, but wisdom you live.",
  },
];

export default function EthosSection() {
  return (
    <section className="py-28 px-4" style={{ background: "#F6E6E0" }}>
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 32 }}>
          <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
          <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#A86B6C", margin: 0 }}>
            Our Ethos
          </p>
          <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
        </div>

        {/* Headline */}
        <h2 className="mb-20 max-w-4xl leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
          <span style={{ color: "#374151", fontWeight: 700 }}>This is education designed for </span>
          <span className="italic" style={{ color: "#A86B6C" }}>self-authority, agency </span>
          <span style={{ color: "#374151", fontWeight: 700 }}>and </span>
          <span className="italic" style={{ color: "#A86B6C" }}>long-term empowerment.</span>
        </h2>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-0 border-t" style={{ borderColor: "rgba(168,107,108,0.25)" }}>
          {PILLARS.map((p, i) => (
            <div
              key={p.num}
              className="py-10 pr-10"
              style={{
                borderRight: i < 2 ? "1px solid rgba(168,107,108,0.25)" : "none",
                paddingLeft: i === 0 ? 0 : "2.5rem",
              }}
            >
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-4" style={{ color: "#A86B6C" }}>
                {p.num} {p.title}
              </p>
              <p className="leading-relaxed text-sm" style={{ color: "#374151" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}