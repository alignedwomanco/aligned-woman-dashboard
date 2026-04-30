import React from "react";
import { Link } from "react-router-dom";

const EXPERIENCES = [
  {
    num: "01",
    label: "The Blueprint",
    heading: "Education",
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
    sub: "off the screen",
    desc: "Retreats, supper clubs and intimate workshops. Connection that only happens in person, in real time.",
    meta: "4+ A Year • Global",
    cta: "Coming Soon",
    href: null,
    dark: false,
    italic: true,
  },
];

export default function ChooseExperienceSection() {
  return (
    <section id="experience" style={{ background: "#F5E6E0", padding: "clamp(72px,8vw,128px) clamp(20px,5vw,60px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Label */}
        <p style={{
          textAlign: "center",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(107,27,61,0.55)",
          marginBottom: 32,
        }}>
          Choose Your Aligned Experience
        </p>

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(32px,5vw,58px)",
            color: "#3a0d22",
            lineHeight: 1.15,
          }}>
            An expert-led education programme
          </div>
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(28px,4.5vw,52px)",
            color: "#C4847A",
            lineHeight: 1.2,
            marginTop: 4,
          }}>
            for women navigating modern life.
          </div>
        </div>

        {/* Subtitle */}
        <p style={{
          textAlign: "center",
          fontSize: 14,
          fontWeight: 300,
          lineHeight: 1.8,
          color: "#666",
          maxWidth: 600,
          margin: "0 auto",
          marginBottom: "clamp(36px,5vw,56px)",
        }}>
          Three distinct rooms. One coherent philosophy. Pick where you need to start — or walk through all three.
        </p>

        {/* Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "clamp(16px,3vw,28px)",
          alignItems: "stretch",
        }}>
          {EXPERIENCES.map((exp) => (
            <div
              key={exp.num}
              style={{
                borderRadius: 8,
                background: exp.dark ? "#6B1B3D" : "#fdf6f2",
                border: exp.dark ? "none" : "1px solid rgba(107,27,61,0.1)",
                borderTop: exp.dark ? "3px solid #C4847A" : "3px solid rgba(107,27,61,0.18)",
                padding: "36px 32px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {/* Number + Label row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#C4847A" }}>{exp.num}</span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: exp.dark ? "rgba(255,255,255,0.7)" : "rgba(107,27,61,0.6)",
                }}>
                  {exp.label}
                </span>
              </div>

              {/* Heading */}
              <div style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontWeight: exp.italic ? 400 : 700,
                fontStyle: exp.italic ? "italic" : "normal",
                fontSize: "clamp(28px,3.5vw,40px)",
                color: exp.dark ? "#fff" : "#3a0d22",
                lineHeight: 1.1,
                marginBottom: 6,
              }}>
                {exp.heading}
              </div>

              {/* Sub */}
              <div style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(15px,2vw,19px)",
                color: exp.dark ? "#C4847A" : "#7a4a4a",
                marginBottom: 20,
              }}>
                {exp.sub}
              </div>

              {/* Body */}
              <p style={{
                fontSize: 14,
                fontWeight: 300,
                lineHeight: 1.75,
                color: exp.dark ? "rgba(255,255,255,0.65)" : "#555",
                flex: 1,
                marginBottom: 24,
              }}>
                {exp.desc}
              </p>

              {/* Meta */}
              <p style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: exp.dark ? "rgba(255,255,255,0.4)" : "rgba(107,27,61,0.45)",
                marginBottom: 14,
              }}>
                {exp.meta}
              </p>

              {/* CTA */}
              {exp.href ? (
                <Link to={exp.href} style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: exp.dark ? "#C4847A" : "#6B1B3D",
                  textDecoration: "none",
                }}>
                  {exp.cta}
                </Link>
              ) : (
                <span style={{
                  fontSize: 13,
                  fontStyle: "italic",
                  color: exp.dark ? "rgba(196,132,122,0.7)" : "#6B1B3D",
                }}>
                  {exp.cta}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}