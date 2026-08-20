import React from "react";
import LandingFooter from "@/components/home/LandingFooter";

const BASK = "'Libre Baskerville', Georgia, serif";
const MONT = "Montserrat, sans-serif";

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

const Eyebrow = ({ children, style }) => (
  <p style={{ fontFamily: MONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "#A86460", margin: 0, ...style }}>
    {children}
  </p>
);

const Hairline = "#4A0E2E";

export default function AboutUs() {
  return (
    <div style={{ background: "#FAF5F3", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(160deg,#FAF5F3,#F5DDD9)", padding: "clamp(104px,12vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 28 }}>The Aligned Woman Co.</Eyebrow>
          <h1 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(3.5rem,8vw,6rem)", lineHeight: 1.05, color: "#4A0E2E", marginBottom: 24, margin: 0 }}>
            About <em style={{ color: "#A86460", fontStyle: "italic" }}>us.</em>
          </h1>
          <div style={{ width: 48, height: 1.5, background: Hairline, margin: "0 auto 40px", opacity: 0.4 }} />
          <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 17, lineHeight: 1.7, color: "#3A2A28", maxWidth: 640, margin: "0 auto 28px" }}>
            The Aligned Woman Co. is an expert-led education platform built for women navigating the complexity of modern life. We exist to close the gap between what women have been taught and what they actually need to thrive — personally, professionally, and physiologically.
          </p>
          <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 17, lineHeight: 1.7, color: "#3A2A28", maxWidth: 640, margin: "0 auto" }}>
            We are not a wellness app. We are not a coaching platform. We are an education company — rigorous, evidence-informed, and built around the lived reality of women's lives.
          </p>
        </div>
      </section>

      {/* ── WHY WE EXIST ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(96px,11vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,8vw,100px)", alignItems: "start" }} className="au-grid">
          <div>
            <Eyebrow style={{ marginBottom: 28 }}>Why we exist</Eyebrow>
            <h2 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.6rem,5.5vw,4rem)", lineHeight: 1.05, color: "#4A0E2E", margin: 0 }}>
              To correct a long-standing <em style={{ color: "#A86460", fontStyle: "italic" }}>gap.</em>
            </h2>
          </div>
          <div style={{ paddingTop: "clamp(0px,3vw,48px)" }}>
            <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: "#3A2A28", maxWidth: 560, marginBottom: 22 }}>
              Women have been taught many things. But almost never the things that matter most — the internal frameworks, body literacy, financial fluency, and emotional sovereignty that make everything else possible.
            </p>
            <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: "#3A2A28", maxWidth: 560, marginBottom: 22 }}>
              Formal education was not designed with women's biology, psychology, or lived reality in mind. Women were given rules to follow, not tools to self-navigate.
            </p>
            <p style={{ fontFamily: MONT, fontWeight: 400, fontSize: 16, lineHeight: 1.7, color: "#4A0E2E", maxWidth: 560 }}>
              The Aligned Woman Blueprint™ was created to close this gap.
            </p>
          </div>
        </div>
      </section>

      {/* ── INCLUSION ── */}
      <section style={{ background: "linear-gradient(160deg,#FAF5F3,#F5DDD9)", padding: "clamp(96px,11vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 28 }}>Diversity, equity &amp; inclusion</Eyebrow>
          <h2 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.4rem,5vw,3.8rem)", lineHeight: 1.05, color: "#4A0E2E", margin: "0 0 24px" }}>
            We believe <em style={{ color: "#A86460", fontStyle: "italic" }}>inclusion</em> is a practice.
          </h2>
          <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: "#3A2A28", maxWidth: 640, margin: "0 auto 72px" }}>
            Not a statement. Not a checkbox. A continuous, active, and sometimes uncomfortable commitment to building something that genuinely centres all women — in all their complexity, diversity, and fullness.
          </p>

          {/* Principles — numbered editorial list */}
          <div style={{ textAlign: "left" }}>
            {PRINCIPLES.map((p) => (
              <div key={p.num} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: "24px 32px", padding: "34px 0", borderTop: `1px solid ${Hairline}14`, alignItems: "flex-start" }}>
                <span style={{ fontFamily: BASK, fontWeight: 400, fontStyle: "italic", fontSize: 20, color: "#A86460" }}>{p.num}</span>
                <div>
                  <h3 style={{ fontFamily: MONT, fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", color: "#4A0E2E", marginBottom: 10 }}>
                    {p.title}
                  </h3>
                  <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 15, lineHeight: 1.7, color: "#3A2A28", maxWidth: 560, margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ height: 1, background: `${Hairline}14` }} />
          </div>
        </div>
      </section>

      {/* ── SIX COMMITMENTS ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(96px,11vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <Eyebrow style={{ marginBottom: 22 }}>Our commitments</Eyebrow>
            <h2 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.05, color: "#4A0E2E", margin: 0 }}>
              Six commitments we <em style={{ color: "#A86460", fontStyle: "italic" }}>operate by.</em>
            </h2>
          </div>

          <div>
            {COMMITMENTS.map((c, i) => (
              <div
                key={c.num}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr",
                  gap: "24px 32px",
                  padding: "32px 0",
                  borderTop: `1px solid ${Hairline}14`,
                  borderBottom: i === COMMITMENTS.length - 1 ? `1px solid ${Hairline}14` : "none",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontFamily: BASK, fontWeight: 400, fontStyle: "italic", fontSize: 20, color: "#A86460" }}>{c.num}</span>
                <div>
                  <h3 style={{ fontFamily: MONT, fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", color: "#4A0E2E", marginBottom: 10 }}>
                    {c.title}
                  </h3>
                  <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 15, lineHeight: 1.7, color: "#3A2A28", maxWidth: 560, margin: 0 }}>
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section style={{ background: "linear-gradient(160deg,#FAF5F3,#F5DDD9)", padding: "clamp(100px,13vw,112px) clamp(24px,6vw,80px)", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Eyebrow style={{ marginBottom: 32 }}>The Aligned Woman Co.</Eyebrow>
          <h2 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.2rem,5vw,3.4rem)", lineHeight: 1.1, color: "#4A0E2E", margin: "0 0 48px" }}>
            This is education designed for dignity, agency &amp; <em style={{ color: "#A86460", fontStyle: "italic" }}>long-term empowerment.</em>
          </h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/blueprint"
              style={{
                fontFamily: MONT,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#C4847A",
                padding: "15px 30px",
                borderRadius: 100,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "background 200ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#A86460")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#C4847A")}
            >
              View the Blueprint →
            </a>
            <a
              href="/Contact"
              style={{
                fontFamily: MONT,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#4A0E2E",
                background: "transparent",
                padding: "13.5px 28.5px",
                borderRadius: 100,
                textDecoration: "none",
                display: "inline-block",
                border: "1.5px solid #4A0E2E",
              }}
            >
              Get in touch →
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