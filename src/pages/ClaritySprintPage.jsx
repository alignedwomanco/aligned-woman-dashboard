import React, { useState, useEffect, useRef } from "react";

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 700ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms, transform 700ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  burgDark: "#1A0510",
  burgCore: "#4A0E2E",
  burgMid: "#6B1642",
  burgBright: "#8C2057",
  rose: "#C4847A",
  roseDeep: "#A86460",
  roseLight: "#E8B4AE",
  rosePale: "#F5DDD9",
  offWhite: "#FAF5F3",
  darkGrey: "#3A2A28",
  midGrey: "#8A7A76",
  white: "#FFFFFF",
};

const editorialGradient = "linear-gradient(160deg, #0E0208 0%, #1A0510 35%, #4A0E2E 65%, #1A0510 100%)";

const hairlineOverlay = {
  backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 8px)`,
};

// ─── Shared primitives ────────────────────────────────────────────────────────
function Eyebrow({ children, light = false }) {
  return (
    <p style={{
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color: C.rose,
      marginBottom: 20,
      opacity: light ? 0.9 : 1,
    }}>{children}</p>
  );
}

function CTAButton({ children, href = "/claritysprint-intake", small = false }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 700,
        fontSize: small ? 10 : 10,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: C.white,
        background: C.rose,
        padding: small ? "12px 28px" : "18px 40px",
        borderRadius: 100,
        textDecoration: "none",
        transition: "background 200ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.roseDeep)}
      onMouseLeave={(e) => (e.currentTarget.style.background = C.rose)}
    >
      {children}
    </a>
  );
}

function Ornament({ light = false }) {
  const col = light ? C.rose : C.rose;
  return (
    <svg width="120" height="16" viewBox="0 0 120 16" fill="none" style={{ margin: "0 auto", display: "block" }}>
      <line x1="0" y1="8" x2="50" y2="8" stroke={col} strokeWidth="0.75" opacity="0.5" />
      <circle cx="60" cy="8" r="3" fill={col} opacity="0.7" />
      <line x1="70" y1="8" x2="120" y2="8" stroke={col} strokeWidth="0.75" opacity="0.5" />
    </svg>
  );
}

// ─── Section 1: HERO ─────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{
      minHeight: "100vh",
      background: editorialGradient,
      ...hairlineOverlay,
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      {/* Nav */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 40px",
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
          The Aligned Woman Co.
        </span>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }}>
          Laura Jane Thomas · PCC
        </span>
      </nav>

      {/* Hero content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "60px 24px 80px",
        maxWidth: 1100,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <Reveal>
          <Eyebrow>For the South African woman who's done everything 'right' — and still feels lost</Eyebrow>
        </Reveal>
        <Reveal delay={100}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(48px, 8vw, 96px)",
            color: C.white,
            lineHeight: 1.05,
            margin: "0 0 28px",
            maxWidth: 900,
          }}>
            You don't need another<br />
            motivational quote.
            <br />
            <em style={{ color: C.rose }}>You need a plan.</em>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontStyle: "italic",
            fontSize: "clamp(18px, 2.5vw, 24px)",
            color: "rgba(255,255,255,0.72)",
            marginBottom: 44,
          }}>
            4 weeks. 4 strategic coaching calls. One clear direction forward.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <CTAButton>Book your Clarity Sprint · R12,500 →</CTAButton>
          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginTop: 20,
          }}>
            Only 3 spots available · Online · Starts within 7 days
          </p>
        </Reveal>
        <Reveal delay={400}>
          <div style={{ marginTop: 56 }}>
            <Ornament />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section 2: THE PROBLEM ───────────────────────────────────────────────────
function ProblemSection() {
  return (
    <section style={{ background: C.offWhite, padding: "120px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <Reveal><Eyebrow>Section 01 — Where you are</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: C.burgCore,
            marginBottom: 48,
            lineHeight: 1.1,
          }}>
            Let's be honest about{" "}
            <em style={{ color: C.rose }}>where you are</em> right now.
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 18, color: C.darkGrey, lineHeight: 1.8, marginBottom: 20 }}>
            You wake up and the first thing you feel isn't excitement. It's{" "}
            <em style={{ color: C.burgCore }}>heaviness.</em>
          </p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 18, color: C.darkGrey, lineHeight: 1.8, marginBottom: 20 }}>
            You've built something. A career. A business. A life that looks good from the outside.
          </p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 18, color: C.darkGrey, lineHeight: 1.8, marginBottom: 48 }}>
            But inside?{" "}
            <strong style={{ color: C.burgMid, fontWeight: 600 }}>You're running on empty.</strong>
          </p>
        </Reveal>

        <Reveal delay={160}>
          <blockquote style={{
            borderTop: `1px solid ${C.burgCore}22`,
            borderBottom: `1px solid ${C.burgCore}22`,
            padding: "40px 0",
            margin: "0 0 48px",
          }}>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: "italic",
              fontSize: "clamp(32px, 4vw, 56px)",
              color: C.burgCore,
              lineHeight: 1.15,
              margin: 0,
            }}>
              "What am I actually doing<br />with my life?"
            </p>
          </blockquote>
        </Reveal>

        <Reveal delay={200}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 18, color: C.darkGrey, lineHeight: 1.8, marginBottom: 20 }}>
            Maybe your business has stalled. Maybe you're stuck in a role that's draining you.
          </p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 18, color: C.darkGrey, lineHeight: 1.8, marginBottom: 48 }}>
            You've Googled. You've journaled. You've had the wine-fuelled conversations with friends who mean well — but can't give you what you actually need.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div style={{
            background: C.white,
            borderLeft: `2px solid ${C.burgCore}`,
            borderRadius: 8,
            padding: "32px 40px",
            textAlign: "left",
          }}>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(22px, 3vw, 32px)",
              color: C.burgCore,
              margin: 0,
              lineHeight: 1.3,
            }}>
              Being stuck isn't a mindset problem. It's a{" "}
              <em style={{ color: C.rose }}>strategy problem.</em>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section 3: THE STORY ─────────────────────────────────────────────────────
function StorySection() {
  return (
    <section style={{
      background: editorialGradient,
      ...hairlineOverlay,
      padding: "120px 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 64,
          alignItems: "center",
        }}>
          {/* Portrait */}
          <Reveal>
            <div style={{
              aspectRatio: "3/4",
              borderRadius: 12,
              overflow: "hidden",
              background: `linear-gradient(135deg, ${C.burgMid}, ${C.burgDark})`,
              position: "relative",
            }}>
              <img
                src="https://ucarecdn.com/1778062253011_image.png/"
                alt="Laura Jane Thomas"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.style.display = "flex";
                  e.target.parentElement.style.alignItems = "center";
                  e.target.parentElement.style.justifyContent = "center";
                }}
              />
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(26,5,16,0.8), transparent)",
                padding: "32px 24px 24px",
              }}>
                <p style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 20, color: C.white, margin: 0 }}>
                  Laura Jane Thomas
                </p>
              </div>
            </div>
          </Reveal>

          {/* Text */}
          <div>
            <Reveal><Eyebrow>The story</Eyebrow></Reveal>
            <Reveal delay={80}>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontWeight: 400,
                fontSize: "clamp(36px, 4vw, 52px)",
                color: C.white,
                lineHeight: 1.1,
                marginBottom: 36,
              }}>
                I know what <em style={{ color: C.rose }}>'stuck'</em> feels like.<br />I lived it.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 16, color: "rgba(255,255,255,0.78)", lineHeight: 1.8, marginBottom: 20 }}>
                At 33, I was on top of the world. I'd built and run a successful marketing agency for over a decade. Consulting for global brands. Travelling internationally. Chairing organisations.
              </p>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 16, color: "rgba(255,255,255,0.78)", lineHeight: 1.8, marginBottom: 20 }}>
                By 36, I was in full-blown burnout. Hormones depleted. Cortisol through the floor. My doctor couldn't understand how I was still functioning.
              </p>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 16, color: "rgba(255,255,255,0.78)", lineHeight: 1.8, marginBottom: 36 }}>
                So I shut everything down. Spent a year rebuilding. Studied stress physiology, hormonal health, identity formation. And built The Aligned Woman Co. and the Alive Method.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ borderTop: `1px solid ${C.rose}33`, paddingTop: 28, marginBottom: 24 }} />
              <p style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 22, color: C.white, marginBottom: 10 }}>
                I'm Laura Jane Thomas.
              </p>
              <p style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C.roseLight,
                marginBottom: 32,
              }}>
                PCC-Certified Coach · Former Agency Owner · Brand Strategist · Speaker
              </p>
              <CTAButton>Book your Clarity Sprint →</CTAButton>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 4: OFFER INTRO ───────────────────────────────────────────────────
function OfferIntroSection() {
  return (
    <section style={{ background: C.offWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <Reveal><Eyebrow>The Offer</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: C.burgCore,
            marginBottom: 20,
            lineHeight: 1.1,
          }}>
            Introducing{" "}
            <em style={{ color: C.rose }}>The Clarity Sprint.</em>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontStyle: "italic",
            fontSize: "clamp(20px, 2.5vw, 26px)",
            color: C.burgMid,
            marginBottom: 24,
            lineHeight: 1.5,
          }}>
            4 weeks to get unstuck, find your direction, and build a 90-day plan you can actually execute.
          </p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 17, color: C.darkGrey, lineHeight: 1.8 }}>
            This isn't therapy. It isn't a course you'll never finish. It's 4 weeks of focused, private, 1-on-1 coaching with me.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section 5: TIMELINE ─────────────────────────────────────────────────────
const WEEKS = [
  { num: "01", title: "The Audit", badge: "90 min", body: "We pull everything apart. Where you are, what's working, what's draining you, and what you've been avoiding." },
  { num: "02", title: "The Uncover", badge: "60 min", body: "We recalibrate your values and identify where life and business have drifted out of alignment." },
  { num: "03", title: "The Strategy", badge: "60 min", body: "We map out 2-3 realistic paths forward, stress-test each one, and turn the best direction into a concrete 90-day action plan." },
  { num: "04", title: "The Momentum", badge: "60 min", body: "The plan meets reality. We refine, troubleshoot, and set your 90-day priorities." },
];

function TimelineSection() {
  return (
    <section style={{ background: C.burgDark, ...hairlineOverlay, padding: "120px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Reveal><Eyebrow>What we do, week by week</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(40px, 5vw, 64px)",
            color: C.white,
            marginBottom: 72,
            lineHeight: 1.05,
          }}>
            Four weeks.<br />
            <em style={{ color: C.rose }}>One direction.</em>
          </h2>
        </Reveal>
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute",
            left: 39,
            top: 80,
            bottom: 80,
            width: 1,
            background: `linear-gradient(to bottom, ${C.rose}00, ${C.rose}70, ${C.rose}00)`,
          }} />
          {WEEKS.map((wk, i) => (
            <Reveal key={wk.num} delay={i * 100}>
              <div style={{ display: "flex", gap: 32, marginBottom: 40 }}>
                {/* Node */}
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: `1px solid ${C.rose}55`,
                  background: C.burgDark,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  zIndex: 1,
                }}>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 24, color: C.rose }}>
                    {wk.num}
                  </span>
                </div>
                {/* Card */}
                <div style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 22,
                      color: C.white,
                      fontWeight: 400,
                    }}>
                      Week {wk.num} — {wk.title}
                    </span>
                    <span style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: C.rose,
                      background: `${C.rose}18`,
                      border: `1px solid ${C.rose}40`,
                      borderRadius: 100,
                      padding: "4px 12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.rose, flexShrink: 0 }} />
                      {wk.badge}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: 0 }}>
                    {wk.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: TRANSITION ────────────────────────────────────────────────────
function TransitionSection() {
  return (
    <section style={{ background: C.offWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <Ornament />
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontStyle: "italic",
            fontSize: "clamp(22px, 3vw, 32px)",
            color: C.burgCore,
            lineHeight: 1.5,
            marginTop: 36,
          }}>
            But I didn't stop there. I wanted to make sure every woman who joins the Clarity Sprint has everything she needs — not just during our 4 weeks, but for the months that follow.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section 7: BONUSES ───────────────────────────────────────────────────────
const BONUSES = [
  {
    num: "01",
    title: "The Unstuck Workbook",
    value: "R2,500",
    desc: "A companion workbook designed to support the 4-week process with structured reflection prompts and frameworks.",
    icon: "📓",
  },
  {
    num: "02",
    title: "90-Day Momentum Planner",
    value: "R1,500",
    desc: "A beautifully designed planning tool to execute your 90-day strategy with clarity and accountability.",
    icon: "🗓",
  },
  {
    num: "03",
    title: "The Aligned Woman Blueprint",
    value: "R12,000+",
    desc: "Full access to the platform: courses, tools, community, and resources for the months following your sprint.",
    icon: "✦",
  },
];

function BonusesSection() {
  return (
    <section style={{ background: C.offWhite, padding: "0 24px 120px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal><Eyebrow>What's also included</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: C.burgCore,
            marginBottom: 56,
            lineHeight: 1.1,
          }}>
            Three bonuses.<br />
            <em style={{ color: C.rose }}>Yours when you book.</em>
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {BONUSES.map((b, i) => (
            <Reveal key={b.num} delay={i * 100}>
              <div style={{
                background: C.white,
                border: `1px solid ${C.burgCore}14`,
                borderRadius: 16,
                padding: "36px 28px 28px",
                position: "relative",
              }}>
                {/* Free badge */}
                <div style={{
                  position: "absolute",
                  top: -12,
                  right: 20,
                  background: C.rose,
                  color: C.white,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  padding: "5px 14px",
                  borderRadius: 100,
                }}>
                  Free
                </div>
                {/* Icon */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: `${C.rose}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: 20,
                }}>
                  {b.icon}
                </div>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: C.rose, marginBottom: 8 }}>
                  Bonus {b.num}
                </p>
                <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.burgCore, marginBottom: 12, lineHeight: 1.2 }}>
                  {b.title}
                </p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 14, color: C.midGrey, lineHeight: 1.7, marginBottom: 20 }}>
                  {b.desc}
                </p>
                <div style={{ borderTop: `1px solid ${C.burgCore}10`, paddingTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: 14, color: C.midGrey, textDecoration: "line-through" }}>
                    {b.value}
                  </span>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 13, color: C.rose }}>
                    Yours Free
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 8: VALUE STACK ───────────────────────────────────────────────────
const VALUE_ITEMS = [
  { label: "1x 90-Min Deep Dive Audit Call", value: "R5,000" },
  { label: "3x 60-Min Strategic Coaching Calls", value: "R9,000" },
  { label: "The Unstuck Workbook", value: "R2,500" },
  { label: "90-Day Momentum Planner", value: "R1,500" },
  { label: "The Aligned Woman Blueprint", value: "R12,000+" },
];

function ValueStackSection() {
  return (
    <section id="book" style={{ background: editorialGradient, ...hairlineOverlay, padding: "120px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Reveal><Eyebrow>The investment</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(40px, 5vw, 64px)",
            color: C.white,
            marginBottom: 56,
            lineHeight: 1.05,
          }}>
            Let's add it all up. <em style={{ color: C.rose }}>add it all up.</em>
          </h2>
        </Reveal>

        {/* Value list card */}
        <Reveal delay={120}>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "8px 32px 0",
            marginBottom: 48,
          }}>
            {VALUE_ITEMS.map((item, i) => (
              <div key={item.label} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 0",
                borderBottom: i < VALUE_ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                gap: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="9" fill={`${C.rose}22`} />
                    <path d="M5 9.5L7.5 12L13 6.5" stroke={C.rose} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.78)" }}>
                    {item.label}
                  </span>
                </div>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 15, color: C.roseLight, flexShrink: 0 }}>
                  {item.value}
                </span>
              </div>
            ))}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px 0",
              borderTop: `2px solid ${C.rose}55`,
              marginTop: 8,
            }}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: C.white }}>
                Total Value
              </span>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: C.white }}>R30,000+</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 28, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
            But you're not paying R30,000.
          </p>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 24, color: "rgba(255,255,255,0.4)", marginBottom: 48 }}>
            You're not even paying R20,000.
          </p>
          <Eyebrow>Your Investment</Eyebrow>
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(72px, 12vw, 144px)",
            color: C.white,
            lineHeight: 1,
            marginBottom: 20,
          }}>
            R12,500
          </p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 44 }}>
            Less than R3,200 per week for a month that could change the entire direction of your life.
          </p>
          <CTAButton>Yes, I'm ready · Book my Sprint →</CTAButton>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 20 }}>
            Only 3 spots available this round
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section 9: IF ALL THIS DID ───────────────────────────────────────────────
const IF_ITEMS = [
  "If the Clarity Sprint only helped you stop going in circles and make one clear decision — would it be worth R12,500?",
  "If it only gave you a 90-day plan so you could wake up knowing exactly what to focus on — would it be worth R12,500?",
  "If it only helped you stop building someone else's version of success — would it be worth R12,500?",
];

function IfSection() {
  return (
    <section style={{ background: C.offWhite, padding: "120px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal><Eyebrow>A question worth asking</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: C.burgCore,
            marginBottom: 56,
            lineHeight: 1.1,
          }}>
            If all the Clarity Sprint did was <em style={{ color: C.rose }}>this...</em>
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 64 }}>
          {IF_ITEMS.map((q, i) => (
            <Reveal key={i} delay={i * 100}>
              <div style={{
                background: `linear-gradient(160deg, ${C.white} 0%, ${C.rosePale}55 100%)`,
                border: `1px solid ${C.burgCore}10`,
                borderRadius: 16,
                padding: "40px 32px 32px",
              }}>
                <p style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontStyle: "italic",
                  fontSize: "clamp(64px, 8vw, 80px)",
                  color: `${C.rose}25`,
                  lineHeight: 1,
                  marginBottom: 16,
                }}>
                  {`0${i + 1}`}
                </p>
                <p style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontStyle: "italic",
                  fontSize: 20,
                  color: C.burgCore,
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {q}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div style={{ textAlign: "center" }}>
            <Ornament />
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: "italic",
              fontSize: "clamp(24px, 3vw, 36px)",
              color: C.burgCore,
              marginTop: 36,
            }}>
              It does all of that.{" "}
              <em style={{ color: C.rose }}>And more.</em>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section 10: TESTIMONIALS ─────────────────────────────────────────────────
const TESTIMONIALS = [
  { quote: "Before Laura, I knew what I didn't want. After 4 weeks, I knew exactly what I did. That's not a small thing.", name: "Susan", role: "Coaching Client" },
  { quote: "I came in with a business that was making money and making me miserable. I left with a plan to change both.", name: "Coaching Client", role: "Founder" },
  { quote: "The ROI on the Clarity Sprint was immediate. I made one decision in week two that recovered the entire investment within 30 days.", name: "Sarah Arnot", role: "Coaching Client" },
  { quote: "I expected a cheerleader. I got a strategist. The difference was everything.", name: "Career Client", role: "Executive" },
];

function TestimonialsSection() {
  return (
    <section style={{ background: C.burgDark, ...hairlineOverlay, padding: "120px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal><Eyebrow>From the women I've worked with</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: C.white,
            marginBottom: 56,
            lineHeight: 1.1,
          }}>
            <em style={{ color: C.rose }}>What changes</em> when the work is real.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: "32px 28px 28px",
              }}>
                <p style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 96,
                  color: `${C.rose}73`,
                  lineHeight: 0.8,
                  marginBottom: 20,
                }}>
                  &ldquo;
                </p>
                <p style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontStyle: "italic",
                  fontSize: 20,
                  color: C.white,
                  lineHeight: 1.6,
                  marginBottom: 28,
                }}>
                  {t.quote}
                </p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: C.white, margin: 0 }}>
                    {t.name}
                  </p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 11: WHO THIS IS FOR ─────────────────────────────────────────────
const YES_ITEMS = [
  "You're a high-achieving woman who's been running on empty",
  "You want direction, not just motivation",
  "You're willing to do the strategic work between calls",
  "You're ready to make a decision and commit to a direction",
  "You're done with vague goals and circular thinking",
  "You want written deliverables, not just conversation",
  "You're ready for honest, direct feedback",
];

const NO_ITEMS = [
  "You're looking for a therapist or support group",
  "You want to be talked into a decision you've already made",
  "You're not willing to do any work between calls",
  "You're in acute crisis and need emergency support",
  "You want a gentle cheerleader, not a strategist",
  "You're not ready to be honest about what isn't working",
];

function FitCheckSection() {
  return (
    <section style={{ background: C.offWhite, padding: "120px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal><Eyebrow>An honest fit check</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: C.burgCore,
            marginBottom: 56,
            lineHeight: 1.1,
          }}>
            Is this <em style={{ color: C.rose }}>for you?</em>
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* Yes */}
          <Reveal>
            <div style={{
              background: C.white,
              borderRadius: 16,
              borderTop: `2px solid ${C.burgCore}`,
              padding: "36px 32px",
            }}>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.burgCore, marginBottom: 28 }}>
                Yes — This is for you if...
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {YES_ITEMS.map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: `${C.rose}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 7L9 1" stroke={C.rose} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 15, color: C.darkGrey, lineHeight: 1.6 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* No */}
          <Reveal delay={100}>
            <div style={{
              background: `${C.burgCore}08`,
              borderRadius: 16,
              borderTop: `2px solid ${C.burgCore}30`,
              padding: "36px 32px",
            }}>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.midGrey, marginBottom: 28 }}>
                Not yet — This is not for you if...
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {NO_ITEMS.map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: `${C.burgCore}14`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2L8 8M8 2L2 8" stroke={C.midGrey} strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 15, color: C.midGrey, lineHeight: 1.6 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Section 12: FAQ ─────────────────────────────────────────────────────────
const FAQS = [
  { q: "Is this therapy?", a: "No. This is strategic coaching. We're not processing the past — we're building the future. If what you need is therapeutic support, I'll say so." },
  { q: "Can I pay in instalments?", a: "Yes. A two-instalment payment option is available. Email me before booking and we'll sort it out." },
  { q: "What if I'm not sure this is right for me?", a: "Book a 20-minute discovery call. No pressure, no pitch. Just a conversation to see if it's the right fit." },
  { q: "How long have you been coaching?", a: "I've been working with women in strategy and leadership for over a decade. The Clarity Sprint format is the distillation of everything I've learned about what actually moves people forward." },
  { q: "What if I've tried coaching before and it didn't work?", a: "Most coaching fails because it's structurally broken. The Clarity Sprint uses a defined methodology with written outputs at every stage. It's not a conversation — it's a process." },
];

function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <section style={{ background: C.burgDark, ...hairlineOverlay, padding: "120px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Reveal><Eyebrow>Honest answers</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 56px)",
            color: C.white,
            marginBottom: 56,
            lineHeight: 1.1,
          }}>
            <em style={{ color: C.rose }}>Questions</em> you might have.
          </h2>
        </Reveal>
        <div>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 60}>
                <div style={{
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  padding: "24px 0",
                }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      gap: 20,
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.white, lineHeight: 1.3 }}>
                      {faq.q}
                    </span>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: isOpen ? C.rose : "rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 200ms ease",
                    }}>
                      <span style={{ color: C.white, fontSize: 18, lineHeight: 1, userSelect: "none" }}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </div>
                  </button>
                  {isOpen && (
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, margin: "18px 0 0" }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Section 13: FINAL CTA ────────────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section style={{ background: editorialGradient, ...hairlineOverlay, padding: "140px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <Reveal><Eyebrow>The decision</Eyebrow></Reveal>
        <Reveal delay={80}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 5vw, 60px)",
            color: C.white,
            marginBottom: 24,
            lineHeight: 1.1,
          }}>
            You already know{" "}
            <em style={{ color: C.rose }}>something needs to change.</em>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 18, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, marginBottom: 48 }}>
            You've known for a while. The question is how much longer you're willing to wait.
          </p>
          <div style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: "28px 36px",
            marginBottom: 44,
            textAlign: "left",
          }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.8, margin: 0 }}>
              I'm only taking{" "}
              <em style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.rose, fontStyle: "italic" }}>
                3 women
              </em>
              {" "}for this round. Once those spots are filled, the next availability is the following month.
            </p>
          </div>
          <CTAButton>I'm ready · Book my Clarity Sprint →</CTAButton>
          <p style={{ marginTop: 28 }}>
            <a
              href="mailto:hello@laurajanethomas.biz"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: 14, color: C.rose, textDecoration: "none" }}
            >
              Questions? hello@laurajanethomas.biz
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section 14: PS FOOTER ────────────────────────────────────────────────────
function PSFooter() {
  return (
    <section style={{ background: C.offWhite, padding: "80px 24px 60px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <Reveal>
          <div style={{
            borderLeft: `2px solid ${C.rose}`,
            paddingLeft: 24,
            marginBottom: 32,
          }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 16, color: C.darkGrey, lineHeight: 1.8, margin: 0 }}>
              <strong style={{ fontWeight: 600 }}>P.S.</strong> If you've read this far, you're not 'just browsing.' That's your gut telling you what your head is still debating. Trust it.
            </p>
          </div>
          <div style={{
            borderLeft: `2px solid ${C.burgCore}`,
            paddingLeft: 24,
            marginBottom: 56,
          }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 16, color: C.darkGrey, lineHeight: 1.8, margin: 0 }}>
              <strong style={{ fontWeight: 600 }}>P.P.S.</strong> Over R30,000 in value for R12,500. But only for the first 3 women who book.
            </p>
          </div>
        </Reveal>

        {/* Footer bar */}
        <div style={{
          borderTop: `1px solid ${C.burgCore}15`,
          paddingTop: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 16, color: C.burgCore }}>
            Laura Jane Thomas · The Aligned Woman Co.
          </span>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: 12, color: C.midGrey }}>
            &copy; 2026 · All rights reserved
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Sticky CTA ───────────────────────────────────────────────────────────────
function StickyButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <div style={{
      position: "fixed",
      bottom: 28,
      right: 28,
      zIndex: 100,
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 300ms ease, transform 300ms ease",
      pointerEvents: show ? "auto" : "none",
    }}>
      <CTAButton href="/claritysprint-intake" small>Book the Sprint →</CTAButton>
    </div>
  );
}

// ─── Page Assembly ────────────────────────────────────────────────────────────
export default function ClaritySprintPage() {
  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Montserrat:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @media (max-width: 640px) {
          .clarity-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ fontFamily: "'Montserrat', sans-serif", overflowX: "hidden" }}>
        <HeroSection />
        <ProblemSection />
        <StorySection />
        <OfferIntroSection />
        <TimelineSection />
        <TransitionSection />
        <BonusesSection />
        <ValueStackSection />
        <IfSection />
        <TestimonialsSection />
        <FitCheckSection />
        <FAQSection />
        <FinalCTASection />
        <PSFooter />
        <StickyButton />
      </div>
    </>
  );
}