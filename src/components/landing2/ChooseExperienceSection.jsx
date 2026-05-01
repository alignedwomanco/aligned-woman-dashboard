import React from "react";
import { Link } from "react-router-dom";

const EXPERIENCES = [
  {
    num: "01",
    label: "The Blueprint",
    heading: "Education",
    headingItalic: false,
    sub: "for unlearning",
    desc: "Evidence-informed learning designed to help women unlearn outdated narratives and rebuild from the inside out.",
    meta: "12 Weeks • Self-Paced",
    cta: "Read →",
    href: "/blueprint",
    dark: true,
  },
  {
    num: "02",
    label: "The Salon",
    heading: "Conversation",
    headingItalic: false,
    sub: "beyond the soundbite",
    desc: "Long-form dialogue with experts, authors and practitioners. No sound-bites. No guru-speak. Just the work.",
    meta: "Monthly • Live + Archive",
    cta: "Read →",
    href: "/blueprint",
    dark: false,
  },
  {
    num: "03",
    label: "The Gatherings",
    heading: "Experience",
    headingItalic: true,
    sub: "off the screen",
    desc: "Retreats, supper clubs and intimate workshops. Connection that only happens in person, in real time.",
    meta: "4+ A Year • Global",
    cta: "Coming Soon",
    href: null,
    dark: false,
  },
];

export default function ChooseExperienceSection() {
  return (
    <section id="experience" style={{ padding: "clamp(72px,8vw,128px) clamp(28px,5vw,80px)", background: "rgb(245,232,230)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 32 }}>
          <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#A86B6C" }}>
            Choose Your Aligned Experience
          </span>
          <div style={{ width: 36, height: 1, background: "rgba(168,107,108,0.4)" }} />
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: "clamp(42px,7vw,72px)", letterSpacing: "-0.01em", lineHeight: 1.1, color: "rgb(44,44,44)", marginBottom: 12 }}>
            An expert-led education programme
          </h2>
          <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "clamp(36px,6vw,64px)", lineHeight: 1.2, color: "rgb(168,107,107)" }}>
            for women navigating modern life.
          </div>
          <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.8, color: "rgb(102,102,102)", margin: "20px auto 0", maxWidth: 700 }}>
            Three distinct rooms. One coherent philosophy. Pick where you need to start — or walk through all three.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: "clamp(20px,4vw,32px)", alignItems: "stretch" }}>
          {EXPERIENCES.map((exp) => (
            <div
              key={exp.num}
              style={{
                borderRadius: 8,
                background: exp.dark
                  ? "linear-gradient(135deg, rgb(107,27,61) 0%, rgb(139,46,77) 100%)"
                  : "rgba(255,255,255,0.7)",
                padding: "40px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 400,
                color: exp.dark ? "#fff" : "rgb(44,44,44)",
                boxShadow: exp.dark ? "none" : "0 2px 16px rgba(107,27,61,0.07)",
                border: exp.dark ? "none" : "1px solid rgba(107,27,61,0.1)",
              }}
            >
              <div>
                {/* Number + Label */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgb(196,132,122)" }}>{exp.num}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: exp.dark ? "rgba(255,255,255,0.6)" : "rgba(107,27,61,0.55)" }}>
                    {exp.label}
                  </span>
                </div>

                {/* Heading */}
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: exp.headingItalic ? 400 : 700, fontStyle: exp.headingItalic ? "italic" : "normal", fontSize: "clamp(32px,4vw,44px)", lineHeight: 1.1, color: exp.dark ? "#fff" : "rgb(44,44,44)", marginBottom: 6 }}>
                  {exp.heading}
                </div>

                {/* Sub */}
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "clamp(16px,2vw,20px)", color: exp.dark ? "rgb(196,132,122)" : "rgb(120,80,80)", marginBottom: 20 }}>
                  {exp.sub}
                </div>

                {/* Body */}
                <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.75, color: exp.dark ? "rgba(255,255,255,0.65)" : "rgba(44,44,44,0.7)", marginBottom: 28 }}>
                  {exp.desc}
                </p>
              </div>

              <div>
                {/* Meta */}
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: exp.dark ? "rgba(255,255,255,0.35)" : "rgba(107,27,61,0.4)", marginBottom: 12 }}>
                  {exp.meta}
                </p>

                {/* CTA */}
                {exp.href ? (
                  <Link to={exp.href} style={{ fontSize: 13, fontWeight: 600, color: exp.dark ? "rgb(196,132,122)" : "rgb(107,27,61)", textDecoration: "none" }}>
                    {exp.cta}
                  </Link>
                ) : (
                  <span style={{ fontSize: 13, fontStyle: "italic", color: exp.dark ? "rgba(196,132,122,0.7)" : "rgb(107,27,61)" }}>
                    {exp.cta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}