import React from "react";
import { Link } from "react-router-dom";

const EXPERIENCES = [
  {
    num: "01",
    label: "The Blueprint",
    heading: "Education",
    sub: "for unlearning",
    desc: "A 12-week self-paced programme designed to give you the foundational knowledge no one ever taught you — about your body, mind, money, and identity.",
    meta: "12 Weeks • Self-Paced",
    cta: "Read →",
    href: "/blueprint",
    soon: false,
  },
  {
    num: "02",
    label: "The Salon",
    heading: "Conversation",
    sub: "beyond the soundbite",
    desc: "Monthly live conversations with leading women and experts — exploring the ideas that shape how we live, lead, and relate. Available live and in archive.",
    meta: "Monthly • Live + Archive",
    cta: "Read →",
    href: "/blueprint",
    soon: false,
  },
  {
    num: "03",
    label: "The Gatherings",
    heading: "Experience",
    sub: "off the screen",
    desc: "In-person events, retreats, and gatherings held globally. Designed for women ready to meet their community in real life and create lasting transformation.",
    meta: "4+ A Year • Global",
    cta: "Coming Soon",
    href: null,
    soon: true,
  },
];

export default function ChooseExperienceSection() {
  return (
    <section id="experience" className="py-28 px-4" style={{ background: "#F5E6E0" }}>
      <div className="max-w-7xl mx-auto">
        {/* Label */}
        <p className="text-center text-xs font-bold tracking-[0.3em] uppercase mb-8" style={{ color: "#6B1B3D" }}>
          Choose Your Aligned Experience
        </p>

        {/* Headline */}
        <div className="text-center mb-6">
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1.15 }}>
            <span className="font-bold" style={{ color: "#6B1B3D" }}>An expert-led education programme</span>
            <br />
            <span className="italic font-normal" style={{ color: "#C4866C" }}>for women navigating modern life.</span>
          </h2>
        </div>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16 leading-relaxed">
          Three distinct rooms. One coherent philosophy. Pick where you need to start — or walk through all three.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {EXPERIENCES.map((exp) => (
            <div
              key={exp.num}
              className="p-8 flex flex-col"
              style={{ background: "#fdf6f2", border: "1px solid rgba(107,27,61,0.12)" }}
            >
              <span className="font-bold text-sm mb-4" style={{ color: "#C4866C" }}>{exp.num}</span>
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: "#6B1B3D" }}>
                {exp.label}
              </p>
              <h3 className="font-bold mb-1" style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "2rem", color: "#1a0510", lineHeight: 1.1 }}>
                {exp.heading}
              </h3>
              <p className="italic mb-5 text-lg" style={{ color: "#C4866C", fontFamily: "'DM Serif Display', Georgia, serif" }}>
                {exp.sub}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-6">{exp.desc}</p>
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#6B1B3D" }}>
                {exp.meta}
              </p>
              {exp.soon ? (
                <span className="text-sm font-semibold" style={{ color: "#C4866C" }}>{exp.cta}</span>
              ) : (
                <Link to={exp.href} className="text-sm font-bold hover:underline" style={{ color: "#6B1B3D" }}>
                  {exp.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Full-width CTA */}
        <div className="text-center">
          <Link
            to="/blueprint"
            className="inline-block w-full md:w-auto px-12 py-5 font-bold text-sm tracking-[0.2em] uppercase text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "#6B1B3D", display: "block" }}
          >
            Sign Up For The Aligned Woman Blueprint →
          </Link>
        </div>
      </div>
    </section>
  );
}