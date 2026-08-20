import React from "react";
import LandingFooter from "@/components/home/LandingFooter";

const PRINCIPLES = [
  {
    num: "01",
    title: "Designed by practice",
    desc: "Everything we teach has been tested, lived, and refined. We don't teach theory for theory's sake. We teach what actually creates change — and we show our work.",
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
    desc: "We believe the most sustainable path to equity and inclusion is through systemic, embodied education — not one-off training or performative gestures. We build for depth, not optics.",
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

const S = {
  eyebrow: {
    fontFamily: "Montserrat, sans-serif",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "#A86B6C",
  },
  body: {
    fontFamily: "Montserrat, sans-serif",
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.8,
    color: "#4A3040",
  },
};

export default function AboutUs() {
  return (
    <div style={{ background: "#FAF5F3", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(100px,14vw,140px) clamp(24px,6vw,80px) clamp(64px,10vw,80px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...S.eyebrow, marginBottom: 28 }}>The Aligned Woman</p>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3.5rem,8vw,6rem)", lineHeight: 1.05, color: "#2C1A2E", marginBottom: 24, fontWeight: 400 }}>
            About{" "}
            <span style={{ fontStyle: "italic", color: "#A86B6C" }}>us.</span>
          </h1>
          <div style={{ width: 40, height: 2, background: "#C4866C", margin: "0 auto 36px" }} />
          <p style={{ ...S.body, maxWidth: 520, margin: "0 auto 24px", textAlign: "center" }}>
            The Aligned Woman is an expert-led education platform built for women navigating the complexity of modern life. We exist to close the gap between what women have been taught and what they actually need to thrive. Personally, professionally, and physiologically.
          </p>
          <p style={{ ...S.body, maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            <strong>We are not a wellness app. We are not a coaching platform.</strong> We are an education company. Rigorous, evidence-informed, and built around the lived reality of women's lives.
          </p>
        </div>
      </section>

      {/* ── WHY WE EXIST ── */}
      <section style={{ background: "#F5E8E2", padding: "clamp(72px,10vw,120px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,8vw,100px)", alignItems: "start" }} className="au-grid">
          <div>
            <p style={{ ...S.eyebrow, marginBottom: 28 }}>Why We Exist</p>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.8rem,6vw,4.5rem)", lineHeight: 1.1, color: "#2C1A2E", fontStyle: "italic", fontWeight: 400 }}>
              To correct a long-standing gap.
            </h2>
          </div>
          <div style={{ paddingTop: "clamp(0px,3vw,52px)" }}>
            <p style={{ ...S.body, marginBottom: 24 }}>
              Women have been taught many things. But almost never the things that matter most, the internal frameworks, body literacy, financial fluency, and emotional sovereignty that make everything else possible.
            </p>
            <p style={{ ...S.body, marginBottom: 24 }}>
              Formal education was not designed with women's biology, psychology, or lived reality in mind. Women were given rules to follow, not tools to self-navigate.
            </p>
            <p style={{ ...S.body, fontWeight: 700, color: "#6B1B3D" }}>
              The Aligned Woman Blueprint™ was created to close this gap.
            </p>
          </div>
        </div>
      </section>

      {/* ── INCLUSION ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(72px,10vw,120px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...S.eyebrow, marginBottom: 28 }}>Diversity, Equity &amp; Inclusion</p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.4rem,5.5vw,4rem)", lineHeight: 1.15, color: "#2C1A2E", fontWeight: 400, marginBottom: 24 }}>
            We believe{" "}
            <span style={{ fontStyle: "italic", color: "#A86B6C" }}>inclusion</span>
            {" "}is a practice.
          </h2>
          <p style={{ ...S.body, maxWidth: 600, margin: "0 auto 72px", textAlign: "center", color: "#6A5060" }}>
            Not a statement. Not a checkbox. A continuous, active, and sometimes uncomfortable commitment to building something that genuinely centres all women, in all their complexity, diversity, and fullness.
          </p>

          {/* Principles */}
          <div style={{ textAlign: "left" }}>
            {PRINCIPLES.map((p) => (
              <div key={p.num} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: "24px 32px", padding: "36px 0", borderTop: "1px solid rgba(107,27,61,0.12)", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, color: "#C4866C", paddingTop: 2 }}>{p.num}</span>
                <div>
                  <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 700, color: "#2C1A2E", marginBottom: 10, letterSpacing: "0.02em" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 400, lineHeight: 1.85, color: "#6A5060", margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ height: 1, background: "rgba(107,27,61,0.12)" }} />
          </div>
        </div>
      </section>

      {/* ── SIX COMMITMENTS ── */}
      <section style={{ background: "#F5E8E2", padding: "clamp(72px,10vw,120px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ ...S.eyebrow, marginBottom: 20 }}>Our Commitments</p>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem,4.5vw,3rem)", lineHeight: 1.2, color: "#2C1A2E", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
              Six Commitments
            </h2>
            <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem,4.5vw,3rem)", lineHeight: 1.2, color: "#A86B6C", fontStyle: "italic", fontWeight: 400 }}>
              we operate by.
            </p>
          </div>

          <div>
            {COMMITMENTS.map((c, i) => (
              <div
                key={c.num}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr",
                  gap: "24px 32px",
                  padding: "32px 0",
                  borderTop: "1px solid rgba(107,27,61,0.12)",
                  borderBottom: i === COMMITMENTS.length - 1 ? "1px solid rgba(107,27,61,0.12)" : "none",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#C4866C", fontStyle: "italic", paddingTop: 2 }}>{c.num.replace("0", "0")}</span>
                <div>
                  <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 700, color: "#2C1A2E", marginBottom: 10 }}>
                    {c.title}
                  </h3>
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 400, lineHeight: 1.85, color: "#6A5060", margin: 0 }}>
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(80px,12vw,130px) clamp(24px,6vw,80px)", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ ...S.eyebrow, marginBottom: 32 }}>The Aligned Woman</p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.2rem,5vw,3.6rem)", lineHeight: 1.2, color: "#2C1A2E", fontWeight: 400, marginBottom: 48 }}>
            This is education designed for dignity, agency &amp;{" "}
            <em style={{ color: "#A86B6C" }}>long-term empowerment.</em>
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
                background: "#6B1B3D",
                padding: "14px 28px",
                borderRadius: 100,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              View the Blueprint +
            </a>
            <a
              href="/Contact"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#2C1A2E",
                background: "transparent",
                padding: "14px 28px",
                borderRadius: 100,
                textDecoration: "none",
                display: "inline-block",
                border: "1px solid rgba(44,26,46,0.25)",
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
          .au-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}