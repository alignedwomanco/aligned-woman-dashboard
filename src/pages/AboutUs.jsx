import React from "react";
import { Link } from "react-router-dom";
import LandingFooter from "@/components/home/LandingFooter";

const PRINCIPLES = [
  {
    num: "01",
    title: "Designed by practice",
    desc: "Everything we teach has been tested, lived, and refined. We don't teach theory for theory's sake. We teach what actually creates change, and we show our work.",
  },
  {
    num: "02",
    title: "Anchored in lived human experience",
    desc: "We centre the real, complex, often contradictory experience of being a woman navigating modern life. Our curriculum is shaped by evidence, and by the women in the room.",
  },
  {
    num: "03",
    title: "Responsible by design",
    desc: "We are not a therapy service. We are an education platform. We are clear about our scope, careful with our language, and deliberate about signposting professional support where needed.",
  },
];

const COMMITMENTS = [
  {
    num: "01",
    title: "We use education as a tool for long-term change",
    desc: "We believe the most sustainable path to equity and inclusion is through systemic, embodied education, not one-off training or performative gestures. We build for depth, not optics.",
  },
  {
    num: "02",
    title: "We centre dignity, not deficit-based narratives",
    desc: "We don't build programmes around what women lack. We build around what women carry — and what becomes possible when they're given the right conditions to lead.",
  },
  {
    num: "03",
    title: "We design education that is accessible and resourced",
    desc: "Inclusion requires investment. We are committed to building pricing structures, scholarship models, and content delivery methods that widen access over time.",
  },
  {
    num: "04",
    title: "We hold ourselves publicly to a listening commitment",
    desc: "We will not claim to have all the answers. We commit to asking better questions — of our community, our contributors, and ourselves — and to updating our practice accordingly.",
  },
  {
    num: "05",
    title: "We hold space for and encourage courageous conversations",
    desc: "Inclusion requires the courage to name what is uncomfortable. We create space for honest dialogue — about identity, power, and the systems we all navigate.",
  },
  {
    num: "06",
    title: "We will never stop interrogating our own blind spots",
    desc: "This is ongoing work. We commit to regular review of our curriculum, our language, our partnerships, and our internal culture — and to naming what we find.",
  },
];

export default function AboutUs() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section style={{ background: "#3A0D22", padding: "clamp(100px,14vw,160px) clamp(24px,6vw,80px) clamp(64px,10vw,100px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,8vw,100px)", alignItems: "start" }} className="about-hero-grid">
          {/* Left */}
          <div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(196,134,108,0.65)", marginBottom: 20 }}>
              The Aligned Woman
            </p>
            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3rem,7vw,5.5rem)", lineHeight: 1.05, color: "#fff", marginBottom: 32 }}>
              <span style={{ fontStyle: "italic", fontWeight: 400 }}>About</span>{" "}
              <span style={{ fontWeight: 700, fontStyle: "normal" }}>us.</span>
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,0.65)", maxWidth: 440 }}>
              The Aligned Woman is an expert-led education platform built for women navigating the complexity of modern life. We exist to close the gap between what women have been taught and what they actually need to thrive — personally, professionally, and physiologically.
            </p>
          </div>

          {/* Right */}
          <div style={{ paddingTop: "clamp(0px,4vw,60px)" }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,0.55)", marginBottom: 28 }}>
              The Aligned Woman Blueprint is a structured, expert-led programme that gives women the internal frameworks, body literacy, financial fluency, and emotional sovereignty that formal education never provided.
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "rgba(255,255,255,0.55)" }}>
              We are not a wellness app. We are not a coaching platform. We are an education company, rigorous, evidence-informed, and built around the lived reality of women's lives.
            </p>
          </div>
        </div>
      </section>

      {/* ── TO CORRECT A LONG-STANDING GAP ── */}
      <section style={{ background: "#F5E6E0", padding: "clamp(72px,10vw,120px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,8vw,100px)", alignItems: "start" }} className="about-hero-grid">
          {/* Left */}
          <div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(168,107,108,0.65)", marginBottom: 24 }}>
              Why We Exist
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.8rem,6vw,4.5rem)", lineHeight: 1.1, color: "#3A0D22", fontStyle: "italic", fontWeight: 400 }}>
              To correct<br />a long-<br />standing<br />gap.
            </h2>
          </div>

          {/* Right */}
          <div style={{ paddingTop: "clamp(0px,3vw,48px)" }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 400, lineHeight: 1.85, color: "#4A2030", marginBottom: 24 }}>
              Women have been taught many things. But almost never the things that matter most, the internal frameworks, body literacy, financial fluency, and emotional sovereignty that make everything else possible.
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 400, lineHeight: 1.85, color: "#4A2030", marginBottom: 24 }}>
              Formal education was not designed with women's biology, psychology, or lived reality in mind. Women were given rules to follow — not tools to self-navigate.
            </p>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 700, lineHeight: 1.7, color: "#6B1B3D" }}>
              The Aligned Woman Blueprint was created to close this gap.
            </p>
          </div>
        </div>
      </section>

      {/* ── INCLUSION ── */}
      <section style={{ background: "#fff", padding: "clamp(72px,10vw,120px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(168,107,108,0.65)", marginBottom: 24 }}>
            Diversity, Equity &amp; Inclusion
          </p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem,5.5vw,4rem)", lineHeight: 1.15, color: "#2C2C2C", marginBottom: 20 }}>
            We believe{" "}
            <span style={{ fontStyle: "italic", color: "#A86B6C" }}>inclusion</span>
            <br />is a practice.
          </h2>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "#666", maxWidth: 680, margin: "0 auto 64px" }}>
            Not a statement. Not a checkbox. A continuous, active, and sometimes uncomfortable commitment to building something that genuinely centres all women — in all their complexity, diversity, and fullness.
          </p>

          {/* Principles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 48, textAlign: "left", maxWidth: 720, margin: "0 auto" }}>
            {PRINCIPLES.map((p) => (
              <div key={p.num} style={{ display: "flex", gap: 32, alignItems: "flex-start", borderTop: "1px solid rgba(107,27,61,0.1)", paddingTop: 36 }}>
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, color: "#C4866C", minWidth: 28, marginTop: 2 }}>{p.num}</span>
                <div>
                  <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 700, color: "#6B1B3D", marginBottom: 12, letterSpacing: "0.02em" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "#555" }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIX COMMITMENTS ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(72px,10vw,120px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(168,107,108,0.65)", marginBottom: 20 }}>
              Our Commitments
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.2rem,5vw,3.5rem)", lineHeight: 1.2, color: "#2C2C2C" }}>
              Six commitments<br />
              <span style={{ fontStyle: "italic", color: "#A86B6C" }}>we operate by.</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {COMMITMENTS.map((c, i) => (
              <div
                key={c.num}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr",
                  gap: 24,
                  padding: "32px 0",
                  borderTop: "1px solid rgba(107,27,61,0.1)",
                  borderBottom: i === COMMITMENTS.length - 1 ? "1px solid rgba(107,27,61,0.1)" : "none",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, color: "#C4866C", paddingTop: 2 }}>{c.num}</span>
                <div>
                  <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 700, color: "#6B1B3D", marginBottom: 10, letterSpacing: "0.02em" }}>
                    {c.title}
                  </h3>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "#555", margin: 0 }}>
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section style={{ background: "#3A0D22", padding: "clamp(72px,10vw,120px) clamp(24px,6vw,80px)", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(196,134,108,0.6)", marginBottom: 28 }}>
            The Aligned Woman
          </p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.2rem,5.5vw,3.8rem)", lineHeight: 1.2, color: "#fff", marginBottom: 48 }}>
            This is education designed<br />
            for dignity, agency<br />
            &amp;{" "}
            <span style={{ fontStyle: "italic", color: "#C4866C" }}>long-term empowerment.</span>
          </h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/blueprint"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#C4866C",
                padding: "14px 32px",
                borderRadius: 100,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View the Blueprint
            </a>
            <a
              href="/Contact"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                background: "transparent",
                padding: "14px 32px",
                borderRadius: 100,
                textDecoration: "none",
                display: "inline-block",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />

      <style>{`
        @media (max-width: 767px) {
          .about-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}