import React from "react";

const MANIFESTO = [
  { text: "She has done the work — not just the external hustle, but the", bold: false },
  { text: "inner excavation.", bold: true },
  { text: "She knows her nervous system. She knows her cycle. She knows her worth — not because someone told her, but because she has ", bold: false },
  { text: "reclaimed the authority to define it herself.", bold: true },
  { text: "She is not trying to fit into a world that was not designed for her.", bold: false },
  { text: "She is redesigning her world.", bold: true },
  { text: "She moves with intention. She rests without guilt. She earns without apology. She loves without losing herself.", bold: false },
  { text: "She is not perfect. She is ", bold: false },
  { text: "aligned.", bold: true },
];

export default function AlignedWomanSection() {
  return (
    <section
      className="relative py-36 px-4 flex items-center justify-center"
      style={{ background: "#3a0d22", minHeight: "70vh" }}
    >
      {/* Faded portrait overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&q=80&fit=crop&crop=face')" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold tracking-[0.35em] uppercase mb-10 text-white/60">
          — Who She Is —
        </p>

        <h2
          className="text-white uppercase font-bold mb-12"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.2rem, 6vw, 4.5rem)", letterSpacing: "0.06em" }}
        >
          What Is An Aligned Woman?
        </h2>

        <div className="text-white/80 leading-relaxed space-y-4" style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>
          {MANIFESTO.map((item, i) => (
            <span key={i} className={item.bold ? "text-white font-bold" : ""}>{item.text} </span>
          ))}
        </div>
      </div>
    </section>
  );
}