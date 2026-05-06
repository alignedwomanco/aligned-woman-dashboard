import { useState, useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════════
   THE CLARITY SPRINT — Landing Page
   Design: Aligned Woman Co editorial system
   Fonts : DM Serif Display + Montserrat (Google Fonts)
   ════════════════════════════════════════════════════════════════ */

const C = {
  burgDark:   "#1A0510",
  burgCore:   "#4A0E2E",
  burgMid:    "#6B1642",
  burgBright: "#8C2057",
  rose:       "#C4847A",
  roseDeep:   "#A86460",
  roseLight:  "#E8B4AE",
  rosePale:   "#F5DDD9",
  roseWash:   "#FDF5F3",
  offWhite:   "#FAF5F3",
  white:      "#FFFFFF",
  warmGrey:   "#C8B8B4",
  midGrey:    "#8A7A76",
  darkGrey:   "#3A2A28",
};

const PORTRAIT = "https://ucarecdn.com/2d3cf5ee-edac-4e39-b9b1-c7b5a3c5d8a7/-/preview/800x1066/";
const LOGO = "https://app.alignedwomanco.com/logo.png";

/* ── Reveal on scroll ────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {}, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 700ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms, transform 700ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Icon SVGs ───────────────────────────────────────────── */
const ICONS = {
  check: <><path d="M4 12l5 5L20 6" /></>,
  close: <><path d="M6 6l12 12M18 6L6 18" /></>,
  plus:  <><path d="M12 5v14M5 12h14" /></>,
  minus: <><path d="M5 12h14" /></>,
  awareness: <><circle cx="18" cy="18" r="3"/><circle cx="18" cy="18" r="7"/><circle cx="18" cy="18" r="12"/></>,
  time: <><circle cx="18" cy="19" r="12"/><path d="M18 13v6l4 3"/><path d="M14 6h8"/></>,
  alive: <><path d="M8 28l5-10 5 6 4-8 6 12"/></>,
};

function Icon({ name, size = 24, stroke = 1.5, color = "currentColor" }) {
  const vb = ["check","close","plus","minus"].includes(name) ? "0 0 24 24" : "0 0 36 36";
  return (
    <svg width={size} height={size} viewBox={vb} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

/* ── Ornament ────────────────────────────────────────────── */
function Ornament({ onDark = false, width = 180 }) {
  const s = onDark ? "rgba(196,132,122,0.55)" : "rgba(74,14,46,0.35)";
  const d = onDark ? C.rose : C.burgCore;
  return (
    <svg width={width} height="14" viewBox="0 0 180 14" fill="none" style={{ display: "block", margin: "0 auto" }}>
      <line x1="0" y1="7" x2="78" y2="7" stroke={s} strokeWidth="0.75" />
      <circle cx="90" cy="7" r="2.5" fill={d} />
      <line x1="102" y1="7" x2="180" y2="7" stroke={s} strokeWidth="0.75" />
    </svg>
  );
}

/* ── Section wrapper ─────────────────────────────────────── */
function Section({ tone = "light", children, id, padY = "normal", style = {} }) {
  const bg = {
    light:     { background: C.offWhite, color: C.darkGrey },
    dark:      { background: C.burgDark, color: "rgba(255,255,255,0.78)" },
    editorial: { background: "linear-gradient(160deg, #0E0208 0%, #1A0510 35%, #4A0E2E 65%, #1A0510 100%)", color: "rgba(255,255,255,0.78)" },
    rose:      { background: `linear-gradient(135deg, #FAF5F3 0%, #F5DDD9 100%)`, color: C.darkGrey },
  }[tone];
  const pad = padY === "tight" ? "64px" : padY === "loose" ? "128px" : "96px";
  return (
    <section id={id} style={{ ...bg, padding: `${pad} 24px`, position: "relative", ...style }}>
      {children}
    </section>
  );
}

/* ── Pill button ─────────────────────────────────────────── */
function Btn({ children, href = "#book", dark = false, style: sx = {} }) {
  const [h, setH] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
        textTransform: "uppercase",
        padding: "18px 40px", borderRadius: 100,
        border: "none", cursor: "pointer", textDecoration: "none",
        background: h ? C.roseDeep : C.rose,
        color: "#fff",
        transition: "background 180ms cubic-bezier(0.2,0.7,0.2,1), transform 180ms",
        ...sx,
      }}
    >
      {children}
    </a>
  );
}

/* ── Shared text styles ──────────────────────────────────── */
const font = {
  display: "'DM Serif Display', Georgia, serif",
  sans: "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
};

const eyebrow = {
  fontFamily: font.sans, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.28em", textTransform: "uppercase",
  color: C.rose, lineHeight: 1.4, margin: 0,
};

const h2Style = (color = C.burgCore) => ({
  fontFamily: font.display, fontWeight: 400,
  fontSize: "clamp(36px, 4.8vw, 60px)", lineHeight: 1.0,
  letterSpacing: "-0.01em", color, margin: "24px 0 0",
});

const bodyP = {
  fontFamily: font.sans, fontSize: 15, fontWeight: 300,
  lineHeight: 1.88, color: C.darkGrey, margin: "0 0 24px",
};

const em = (color = C.rose) => ({ fontStyle: "italic", color });

/* ════════════════════════════════════════════════════════════
   SECTIONS
   ════════════════════════════════════════════════════════════ */

/* ── 1. HERO ─────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      background: "linear-gradient(160deg, #0E0208 0%, #1A0510 35%, #3D0B27 70%, #1A0510 100%)",
      minHeight: "100vh", padding: "160px 24px 96px",
      position: "relative", display: "flex", flexDirection: "column",
      justifyContent: "center", overflow: "hidden",
    }}>
      {/* Hairline texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 8px)",
        pointerEvents: "none",
      }} />
      {/* Nav */}
      <header style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "28px clamp(24px, 5vw, 80px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: font.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
          The Aligned Woman Co.
        </span>
        <span style={{ fontFamily: font.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
          Laura Jane Thomas &nbsp;·&nbsp; PCC
        </span>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", position: "relative" }}>
        <Reveal>
          <p style={{ ...eyebrow, color: C.rose, marginBottom: 40 }}>
            A limited engagement for women starting out, building, or repositioning what's next.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h1 style={{
            fontFamily: font.display, fontWeight: 400,
            fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 1.0,
            letterSpacing: "-0.02em", color: C.white, margin: 0,
            maxWidth: 980, marginInline: "auto",
          }}>
            You don't need another<br/>
            motivational quote.<br/>
            <i style={em()}>You need a plan.</i>
          </h1>
        </Reveal>
        <Reveal delay={240} style={{ marginTop: 40 }}>
          <p style={{
            fontFamily: font.display, fontStyle: "italic",
            fontSize: "clamp(18px, 1.8vw, 24px)",
            color: "rgba(255,255,255,0.72)", lineHeight: 1.45,
            margin: 0, maxWidth: 640, marginInline: "auto",
          }}>
            4 weeks. 4 strategic coaching calls.<br/>
            1 clear direction forward, so you can stop spinning and start moving.
          </p>
        </Reveal>
        <Reveal delay={360} style={{ marginTop: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <Btn>Book your Clarity Sprint &nbsp;·&nbsp; R12,500 →</Btn>
          <p style={{
            fontFamily: font.sans, fontSize: 11, fontWeight: 400,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)", margin: 0,
          }}>
            Limited to 3 women per month &nbsp;·&nbsp; Online &nbsp;·&nbsp; Starts within 7 days
          </p>
        </Reveal>
        <Reveal delay={480} style={{ marginTop: 32 }}>
          <p style={{
            fontFamily: font.display, fontStyle: "italic",
            fontSize: "clamp(14px, 1.4vw, 17px)",
            color: "rgba(255,200,180,0.60)", lineHeight: 1.5,
            margin: 0, maxWidth: 560, marginInline: "auto",
          }}>
            Usually I work at senior advisory rates. The Clarity Sprint is calibrated for women earlier in their journey, because that is where I actually love spending my time.
          </p>
        </Reveal>
        <Reveal delay={600} style={{ marginTop: 60, display: "flex", justifyContent: "center" }}>
          <Ornament onDark width={220} />
        </Reveal>
      </div>
    </section>
  );
}

/* ── 2. THE PROBLEM ──────────────────────────────────────── */
function Problem() {
  const pp = { fontFamily: font.sans, fontSize: 18, fontWeight: 300, lineHeight: 1.7, color: C.darkGrey, textAlign: "center", margin: "0 0 32px", textWrap: "pretty" };
  return (
    <Section tone="light">
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Reveal><p style={{ ...eyebrow, textAlign: "center" }}>Section 01 — Where you are</p></Reveal>
        <Reveal delay={120}>
          <h2 style={{ ...h2Style(), textAlign: "center", marginBottom: 64 }}>
            Let's be honest about <i style={em()}>where you are</i> right now.
          </h2>
        </Reveal>
        <Reveal delay={200}><p style={pp}>You wake up and the first thing you feel isn't excitement.<br/><i style={{ fontStyle: "italic", color: C.burgCore, fontWeight: 400 }}>It's heaviness.</i></p></Reveal>
        <Reveal delay={120}><p style={pp}>You've built something. A career. A business. A life that looks good from the outside.</p></Reveal>
        <Reveal delay={120}><p style={{ ...pp, color: C.burgMid, fontWeight: 500 }}>But inside, you're running on empty.</p></Reveal>
        <Reveal delay={120}><p style={pp}>You're making decisions from a place of exhaustion, not clarity, and the question that keeps circling your mind at 2am is always the same.</p></Reveal>

        {/* Pull quote */}
        <Reveal delay={160} style={{ margin: "72px 0" }}>
          <div style={{ borderTop: "1px solid rgba(74,14,46,0.12)", borderBottom: "1px solid rgba(74,14,46,0.12)", padding: "48px 24px", textAlign: "center" }}>
            <p style={{ fontFamily: font.display, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: 1.1, color: C.burgCore, margin: 0, letterSpacing: "-0.01em" }}>
              "What am I actually<br/>doing with my life?"
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}><p style={pp}>Maybe your business has stalled, and you cannot figure out why. Maybe you are stuck in a role that is slowly draining you. Maybe you have been so busy holding everything together for everyone else that you have completely lost sight of what you want.</p></Reveal>
        <Reveal delay={120}><p style={pp}>You've Googled, journaled, cried, had the late-night conversations with friends who mean well but cannot give you what you actually need.</p></Reveal>
        <Reveal delay={120}><p style={{ ...pp, fontWeight: 500, color: C.burgMid }}>And you are still stuck!</p></Reveal>

        {/* Callout */}
        <Reveal delay={160} style={{ marginTop: 72 }}>
          <div style={{ background: C.white, border: "1px solid rgba(74,14,46,0.1)", borderLeft: `2px solid ${C.burgCore}`, padding: "40px 48px", textAlign: "center" }}>
            <p style={{ fontFamily: font.display, fontWeight: 400, fontSize: "clamp(22px, 2.6vw, 32px)", lineHeight: 1.3, color: C.burgCore, margin: 0, letterSpacing: "-0.01em" }}>
              Being stuck isn't a mindset problem.<br/>
              <i style={em()}>It is so much deeper than that.</i>
            </p>
            <p style={{ ...bodyP, textAlign: "center", marginTop: 24, marginBottom: 0, maxWidth: 580, marginInline: "auto" }}>
              You don't need more inspiration and information. (Yes, get off ChatGPT.) What you need is someone who has been where you are, who understands the real pressure you are under, and who can help you work with the mind, body, and subconscious blocks holding you back.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── 3. THE STORY ────────────────────────────────────────── */
function Story() {
  return (
    <Section tone="editorial">
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "380px 1fr", gap: 96, alignItems: "center" }} className="story-grid">
        <Reveal>
          <div style={{ aspectRatio: "3 / 4", borderRadius: 6, overflow: "hidden", position: "relative", border: "1px solid rgba(196,132,122,0.2)" }}>
            <img
              src="https://media.base44.com/images/public/69e1e7f05d39205bc001ea00/16e609620_Facetune_17-04-2026-20-07-04.jpg"
              alt="Laura Jane Thomas"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        </Reveal>
        <div>
          <Reveal><p style={eyebrow}>The story</p></Reveal>
          <Reveal delay={100}>
            <h2 style={{ ...h2Style(C.white), marginBottom: 40 }}>
              I know what <i style={em()}>'stuck'</i> feels like.<br/>I lived it.
            </h2>
          </Reveal>
          {[
            "At 33, I was on top of the world. I had built and run a successful marketing agency for over a decade. I was consulting for global brands, travelling internationally, chairing organisations, and hitting goals I once thought were impossible.",
            "By 36, I was in full-blown burnout. Hormones depleted. Cortisol through the floor. My nervous system was constantly on alert. My doctor could not understand how I was still functioning.",
            "On paper, I was thriving. Behind the scenes, my exhausted was exhausted.",
            "So I shut everything down. I spent a year and thousands of rands on doctors, therapists, functional medicine specialists, and nervous system work. And I rebuilt. Not just my health, but my entire understanding of what it means to succeed without self-destructing.",
            "That journey became The Aligned Woman Co. and The A.L.I.V.E. Method.",
          ].map((t, i) => (
            <Reveal key={i} delay={120 + i * 80}>
              <p style={{ fontFamily: font.sans, fontSize: 16, fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,0.78)", margin: "0 0 24px", maxWidth: 580 }}>{t}</p>
            </Reveal>
          ))}
          <Reveal delay={500}>
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid rgba(196,132,122,0.2)", maxWidth: 580 }}>
              <p style={{ fontFamily: font.display, fontSize: 22, fontStyle: "italic", color: C.white, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                I'm Laura Jane Thomas.
              </p>
              <p style={{ fontFamily: font.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: C.roseLight, margin: 0 }}>
                Senior Strategist &nbsp;·&nbsp; Former Agency Owner<br/>Brand Advisor &nbsp;·&nbsp; Speaker
              </p>
            </div>
          </Reveal>
          <Reveal delay={600} style={{ marginTop: 32 }}>
            <p style={{ fontFamily: font.sans, fontSize: 16, fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,0.78)", margin: 0, maxWidth: 580 }}>
              Now I help women like you find clarity, build a real plan, and move forward, <i style={em()}>without burning out in the process.</i>
            </p>
          </Reveal>
          <Reveal delay={700} style={{ marginTop: 48 }}>
            <Btn>Book your Clarity Sprint →</Btn>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ── 4. OFFER INTRO ──────────────────────────────────────── */
function OfferIntro() {
  return (
    <Section tone="light" padY="tight">
      <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", paddingTop: 32 }}>
        <Reveal><p style={eyebrow}>The Offer</p></Reveal>
        <Reveal delay={120}>
          <h2 style={{ ...h2Style(), fontSize: "clamp(40px, 6vw, 72px)", letterSpacing: "-0.02em", margin: "24px 0 28px" }}>
            Introducing<br/><i style={em()}>The Clarity Sprint.</i>
          </h2>
        </Reveal>
        <Reveal delay={220}>
          <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: "clamp(20px, 2.2vw, 26px)", lineHeight: 1.4, color: C.burgMid, margin: "0 0 40px", maxWidth: 700, marginInline: "auto" }}>
            A 4-week, high-touch coaching engagement designed to take you from stuck and overwhelmed to clear, focused, and moving forward with intention.
          </p>
        </Reveal>
        <Reveal delay={320}>
          <p style={{ fontFamily: font.sans, fontSize: 16, fontWeight: 300, lineHeight: 1.8, color: C.darkGrey, margin: 0, maxWidth: 620, marginInline: "auto" }}>
            This is not therapy. It is not generic life coaching. It is strategic coaching from a senior practitioner who has built businesses, advised global brands, and rebuilt herself from burnout. You bring the situation. I bring the framework, the questions, and the plan.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── 5. A.L.I.V.E. TIMELINE ─────────────────────────────── */
function Timeline() {
  const weeks = [
    { num: "01", letter: "A", name: "Awareness", dur: "60 min",
      sub: "Where are you actually, and what is really going on?",
      desc: "Most women skip this step. They jump straight to action because action feels productive. But action without awareness is how you end up exhausted and going nowhere. In our first 60-minute call, we go beneath the surface. We map where you are right now across the areas that matter. Career, business, energy, relationships, identity.",
      leave: "A clear, written diagnostic of your current state and the specific misalignments that are keeping you stuck." },
    { num: "02", letter: "L", name: "Liberation", dur: "60 min",
      sub: "What is in your way, and how do we move it?",
      desc: "Now we work on what is holding you back. The beliefs you inherited. The patterns you keep repeating. The fears dressed up as practicality. We use NLP and strategic questioning to surface and dismantle the specific blocks keeping you stuck.",
      leave: "A written list of the specific blocks we worked on, plus the reframes and tools to manage them when they show up again." },
    { num: "03", letter: "I", name: "Intentional Action", dur: "60 min",
      sub: "What do you actually want, and what is the plan to get there?",
      desc: "This is the strategy week. By now you are clearer on where you are and what has been in the way. So we build the plan. We get specific about what you want next. Not the vague 'more freedom' version. The concrete version. Then we reverse-engineer it.",
      leave: "A written 30-day action plan with prioritised next steps, calibrated to your actual capacity." },
    { num: "04", letter: "V", name: "Vision + Embodiment", dur: "90 min",
      sub: "Who do you need to become, and how do you hold this once I am gone?",
      desc: "The final week is the longest call because it does the most work. We zoom out to the bigger vision. We anchor the plan inside who you are becoming, not just what you are doing. And we install the practices that will keep you on track when life gets loud again.",
      leave: "A written vision document, your personal alignment practices, and the structure to hold all of this without me in your inbox." },
  ];
  return (
    <Section tone="dark">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 80 }}>
          <p style={eyebrow}>The A.L.I.V.E. Method, week by week</p>
          <h2 style={{ ...h2Style(C.white) }}>
            Four weeks. <i style={em()}>One clear path forward.</i>
          </h2>
        </Reveal>
        <div style={{ position: "relative", maxWidth: 880, margin: "0 auto" }}>
          <div style={{ position: "absolute", left: 39, top: 12, bottom: 12, width: 1, background: "linear-gradient(180deg, rgba(196,132,122,0.05) 0%, rgba(196,132,122,0.45) 12%, rgba(196,132,122,0.45) 88%, rgba(196,132,122,0.05) 100%)" }} />
          {weeks.map((w, i) => (
            <Reveal key={w.num} delay={i * 120} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 40, marginBottom: i === weeks.length - 1 ? 0 : 56, position: "relative" }}>
              <div style={{ width: 80, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.burgDark, border: "1px solid rgba(196,132,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontStyle: "italic", fontSize: 28, color: C.rose, position: "relative", zIndex: 1 }}>
                  {w.letter}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "32px 40px", marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                  <h3 style={{ fontFamily: font.sans, fontSize: 13, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: C.white, margin: 0 }}>
                    Week {w.num.replace(/^0/, "")} — {w.name}
                  </h3>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, background: "rgba(196,132,122,0.1)", border: "1px solid rgba(196,132,122,0.25)", fontFamily: font.sans, fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: C.roseLight }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.rose }} />{w.dur}
                  </span>
                </div>
                <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 17, color: C.roseLight, margin: "0 0 16px", lineHeight: 1.4 }}>{w.sub}</p>
                <p style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", margin: "0 0 16px", maxWidth: 620 }}>{w.desc}</p>
                <p style={{ fontFamily: font.sans, fontSize: 13, fontWeight: 600, color: C.roseLight, margin: 0 }}>You leave with: <span style={{ fontWeight: 300, color: "rgba(255,255,255,0.6)" }}>{w.leave}</span></p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ── 6. TRANSITION ───────────────────────────────────────── */
function Transition() {
  return (
    <Section tone="light" padY="tight">
      <Reveal style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <Ornament width={140} />
        <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: "clamp(22px, 2.6vw, 32px)", lineHeight: 1.4, color: C.burgCore, margin: "40px 0 0", letterSpacing: "-0.01em" }}>
          Over four weeks, we work through The A.L.I.V.E. Method together. One stage per week. Each week builds on the last, so by the end you are not just clearer on what you want. You have a plan to actually go and get it.
        </p>
      </Reveal>
    </Section>
  );
}

/* ── 7. VALUE STACK ──────────────────────────────────────── */
function ValueStack() {
  const core = [
    { label: "4 Strategic Coaching Calls", value: "R20,000" },
    { label: "The A.L.I.V.E. Method Workbook", value: "R3,500" },
    { label: "Written Diagnostic and 30-Day Action Plan", value: "R7,500" },
    { label: "Voxer Access Between Sessions", value: "R5,000" },
    { label: "Vision and Alignment Document", value: "R4,000" },
  ];
  const bonuses = [
    { label: "Tailored Resource Pack", value: "R3,500" },
    { label: "30-Day Recalibration Call", value: "R3,500" },
    { label: "The Aligned Woman Blueprint (1 Year Access)", value: "R116,000" },
  ];
  return (
    <Section tone="editorial" id="book">
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={eyebrow}>The investment</p>
          <h2 style={{ ...h2Style(C.white), fontSize: "clamp(40px, 5.5vw, 68px)" }}>
            Let's <i style={em()}>add it all up.</i>
          </h2>
        </Reveal>

        {/* Core items */}
        <Reveal delay={120}>
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "40px 48px", marginBottom: 24 }}>
            <p style={{ ...eyebrow, fontSize: 9, marginBottom: 24 }}>The Core Engagement</p>
            {core.map((it, i) => (
              <div key={it.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "20px 0", borderBottom: i === core.length - 1 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(196,132,122,0.15)", border: "1px solid rgba(196,132,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="check" size={12} color={C.rose} stroke={2} />
                  </span>
                  <span style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.88)", lineHeight: 1.5 }}>{it.label}</span>
                </div>
                <span style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 22, color: C.roseLight, flexShrink: 0 }}>{it.value}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Bonuses */}
        <Reveal delay={200}>
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "40px 48px", marginBottom: 56 }}>
            <p style={{ ...eyebrow, fontSize: 9, marginBottom: 24 }}>Plus These Bonuses</p>
            {bonuses.map((it, i) => (
              <div key={it.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "20px 0", borderBottom: i === bonuses.length - 1 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(196,132,122,0.15)", border: "1px solid rgba(196,132,122,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="check" size={12} color={C.rose} stroke={2} />
                  </span>
                  <span style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.88)", lineHeight: 1.5 }}>{it.label}</span>
                </div>
                <span style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 22, color: C.roseLight, flexShrink: 0 }}>{it.value}</span>
              </div>
            ))}
            <div style={{ margin: "20px 0 0", paddingTop: 28, borderTop: `2px solid ${C.rose}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <span style={{ fontFamily: font.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: C.white }}>Total Value</span>
              <span style={{ fontFamily: font.display, fontStyle: "italic", fontSize: "clamp(32px, 4.5vw, 48px)", color: C.rose, lineHeight: 1, textDecoration: "line-through", textDecorationColor: "rgba(196,132,122,0.4)" }}>R163,000</span>
            </div>
          </div>
        </Reveal>

        {/* Price reveal */}
        <Reveal delay={300} style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: "clamp(20px, 2.4vw, 28px)", color: "rgba(255,255,255,0.6)", margin: "0 0 12px" }}>The Clarity Sprint is calibrated for women earlier in their journey, at</p>
          <p style={{ ...eyebrow, margin: "0 0 16px" }}>Your Investment</p>
          <p style={{ fontFamily: font.display, fontWeight: 400, fontSize: "clamp(72px, 12vw, 144px)", lineHeight: 0.9, letterSpacing: "-0.03em", color: C.white, margin: "0 0 24px" }}>
            R12,500
          </p>
          <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: "clamp(16px, 1.6vw, 20px)", color: "rgba(255,200,180,0.65)", margin: "0 0 56px", maxWidth: 560, marginInline: "auto", lineHeight: 1.5 }}>
            That is not a discount. It is a calibrated rate, because building businesses with women starting out is where I actually love spending my time.
          </p>
          <Btn style={{ fontSize: 11, padding: "22px 48px" }}>
            Yes, I'm ready · Book my Sprint →
          </Btn>
          <p style={{ fontFamily: font.sans, fontSize: 10, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: "20px 0 0" }}>
            Limited to 3 women per month
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── 8. TESTIMONIALS ─────────────────────────────────────── */
function Testimonials() {
  const items = [
    { quote: "I came to Laura overwhelmed and unclear about how to position my brand. Within a matter of weeks, she helped me articulate exactly what I do, who I do it for, and how to confidently show up as a leader. For the first time in my business, everything feels aligned.", name: "Tasha Berrings", role: "Founder, Clean Beauty Startup" },
    { quote: "Laura provides actionable support to help you thrive. You leave with valuable insights and practical techniques to help navigate and reconnect with what truly drives you, all while protecting your energy so you don't end up overworked and burnt out.", name: "Tharunisa Reddy", role: "Coaching Client" },
    { quote: "Working with Laura was like plugging my business into power. She pulled the strategy, story, and messaging out of me in a way that felt effortless. I now have a clear roadmap, a stronger offer, and marketing that finally makes sense and feels like me.", name: "Vanessa Rathbone", role: "Founder, Wellness Consultancy" },
    { quote: "Laura helped me connect to my core and feel more confident about what I do and the value I provide to others. She taught me to back myself, and to detach my sense of self-worth from how much I make. It set me free.", name: "Iris Smyth", role: "Coaching Client" },
  ];
  return (
    <Section tone="dark">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={eyebrow}>From the women I've worked with</p>
          <h2 style={{ ...h2Style(C.white) }}><i style={em()}>What changes</i> when the work is real.</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }} className="testimonial-grid">
          {items.map((t, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "40px 40px 36px", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: font.display, fontSize: 96, color: C.rose, opacity: 0.45, lineHeight: 0.6, marginBottom: 8, letterSpacing: "-0.05em" }}>"</div>
                <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 20, lineHeight: 1.45, color: C.white, margin: "0 0 32px", flex: 1, letterSpacing: "-0.005em" }}>{t.quote}</p>
                <div style={{ paddingTop: 20, borderTop: "1px solid rgba(196,132,122,0.18)" }}>
                  <p style={{ fontFamily: font.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.white, margin: "0 0 4px" }}>{t.name}</p>
                  <p style={{ fontFamily: font.sans, fontSize: 10, fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: 0 }}>{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={400} style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ fontFamily: font.sans, fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 640, marginInline: "auto", lineHeight: 1.7 }}>
            The Clarity Sprint sits inside a senior strategy practice that has worked with founders, CEOs, and senior teams across financial services, retail, luxury, wellness, marketing, and professional services.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── 9. WHO THIS IS FOR ──────────────────────────────────── */
function WhoFor() {
  const yes = [
    "You are starting out, building, or repositioning what's next, and you need clarity on what to actually do.",
    "You have done some of the inner work already and the work has stopped producing new insight without structure to act on.",
    "You are a high-functioning woman who looks fine on paper and knows something underneath is not working.",
    "You have tried coaching that did not stick, and you are willing to try a structured, time-bound format.",
    "You can commit to four 60 to 90 minute sessions over four weeks.",
    "You want senior strategic clarity, not motivational support.",
    "You are ready to make decisions and follow through.",
  ];
  const no = [
    "You are looking for a hype coach who will tell you everything you want to hear.",
    "You are in the middle of an active mental health crisis. This is strategic coaching, not therapy.",
    "You want unlimited access at this price point. Senior advisory is a separate engagement.",
    "You want to be told what to do without participating. This work is collaborative.",
    "You are not yet ready to make changes in your life.",
    "You are looking for the cheapest version of senior coaching. This is calibrated, not discounted.",
  ];
  return (
    <Section tone="light">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={eyebrow}>An honest fit check</p>
          <h2 style={h2Style()}>Is this <i style={em()}>for you?</i></h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="who-grid">
          <Reveal>
            <div style={{ background: C.white, border: "1px solid rgba(74,14,46,0.08)", borderTop: `2px solid ${C.burgCore}`, borderRadius: 6, padding: "40px 40px 32px", height: "100%" }}>
              <p style={{ ...eyebrow, letterSpacing: "0.24em" }}>Yes</p>
              <h3 style={{ fontFamily: font.display, fontWeight: 400, fontSize: 32, color: C.burgCore, margin: "12px 0 28px", letterSpacing: "-0.01em" }}>This is for you if...</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {yes.map((y, i) => (
                  <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: i === yes.length - 1 ? "none" : "1px solid rgba(74,14,46,0.06)" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(196,132,122,0.14)", border: "1px solid rgba(196,132,122,0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 3 }}>
                      <Icon name="check" size={12} color={C.burgCore} stroke={2} />
                    </span>
                    <span style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 400, lineHeight: 1.5, color: C.darkGrey }}>{y}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div style={{ background: "rgba(74,14,46,0.03)", border: "1px solid rgba(74,14,46,0.08)", borderTop: "2px solid rgba(74,14,46,0.3)", borderRadius: 6, padding: "40px 40px 32px", height: "100%" }}>
              <p style={{ ...eyebrow, color: C.midGrey, letterSpacing: "0.24em" }}>Not yet</p>
              <h3 style={{ fontFamily: font.display, fontWeight: 400, fontSize: 32, color: C.burgCore, margin: "12px 0 28px", letterSpacing: "-0.01em" }}>This is not for you if...</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {no.map((n, i) => (
                  <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: i === no.length - 1 ? "none" : "1px solid rgba(74,14,46,0.06)" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "transparent", border: "1px solid rgba(138,122,118,0.4)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 3 }}>
                      <Icon name="close" size={10} color={C.midGrey} stroke={2} />
                    </span>
                    <span style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 400, lineHeight: 1.5, color: C.midGrey }}>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ── 10. FAQ / OBJECTIONS ────────────────────────────────── */
function FAQ() {
  const faqs = [
    { q: "I have tried coaching before and it did not work for me.",
      a: "I understand. Most coaching does not work, and the reason is structural. Generic coaching is open-ended. You go in with a vague problem, you talk it through, you leave feeling slightly better, nothing changes in your life. The Clarity Sprint is structured differently. Four weeks. Four sessions with a defined methodology. Written diagnostics. A 30-day plan you walk away with. You are not paying for unlimited talking. You are paying for senior strategic clarity delivered in a format that produces an outcome." },
    { q: "R12,500 is a lot of money for me right now.",
      a: "It is. I know it is. And I am not going to tell you to put it on a credit card or trust the universe. If R12,500 is a stretch you cannot make right now, the right move is to wait until it is not a stretch, or start with my free resources at The Aligned Woman Co. If R12,500 is a stretch but a possible one, the cost of staying stuck for another six months is almost always higher than the cost of getting clear in four weeks." },
    { q: "I do not have time for another commitment.",
      a: "Then you are exactly the woman this is built for. Four sessions over four weeks. Three are 60 minutes. One is 90 minutes. Total time commitment is about five and a half hours over a month, plus the workbook (20 minutes a week). Time pressure is usually the symptom of strategic misalignment, not the reason to avoid working on it." },
    { q: "How do I know this will actually work for me?",
      a: "I cannot promise it will. Anyone who promises you a guaranteed outcome from coaching is either lying or has not done this work seriously. Every woman who has done The A.L.I.V.E. Method has left with more clarity than she came in with. Every Clarity Sprint client to date has walked away with a written 30-day plan she is still using. The methodology produces results because it is structured, not because of magic." },
    { q: "What if I want to keep working with you after the four weeks?",
      a: "You can. The Clarity Sprint is designed as a complete engagement, but many women move into the Senior Advisory after they finish. The Clarity Sprint fee is credited toward any Senior Advisory engagement booked within 60 days of the sprint closing. That is not a hook. It is a structural way to make the Clarity Sprint a genuine on-ramp rather than a trap." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <Section tone="dark">
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={eyebrow}>Honest answers</p>
          <h2 style={{ ...h2Style(C.white) }}><i style={em()}>Questions</i> you might have.</h2>
        </Reveal>
        <div>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 60}>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: i === faqs.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "28px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, textAlign: "left", color: "inherit" }}>
                    <span style={{ fontFamily: font.display, fontStyle: isOpen ? "italic" : "normal", fontSize: 22, color: C.white, letterSpacing: "-0.005em" }}>{f.q}</span>
                    <span style={{ width: 36, height: 36, borderRadius: "50%", background: isOpen ? C.rose : "transparent", border: `1px solid ${isOpen ? C.rose : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 240ms cubic-bezier(0.2,0.7,0.2,1)" }}>
                      <Icon name={isOpen ? "minus" : "plus"} size={14} color={isOpen ? C.white : "rgba(255,255,255,0.6)"} />
                    </span>
                  </button>
                  <div style={{ maxHeight: isOpen ? 400 : 0, overflow: "hidden", transition: "max-height 360ms cubic-bezier(0.2,0.7,0.2,1)" }}>
                    <p style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: "rgba(255,255,255,0.65)", margin: 0, padding: "0 56px 28px 0", maxWidth: 680 }}>{f.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ── 11. FINAL CTA ───────────────────────────────────────── */
function FinalCTA() {
  return (
    <Section tone="editorial" padY="loose">
      <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
        <Reveal><p style={eyebrow}>The decision</p></Reveal>
        <Reveal delay={100}>
          <h2 style={{ ...h2Style(C.white), fontSize: "clamp(40px, 5.5vw, 72px)", letterSpacing: "-0.02em", margin: "24px 0 32px" }}>
            You already know <i style={em()}>something needs to change.</i>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: "clamp(22px, 2.5vw, 28px)", lineHeight: 1.4, color: "rgba(255,255,255,0.78)", margin: "0 0 32px", maxWidth: 720, marginInline: "auto" }}>
            You do not have to be certain. You only have to be ready to begin.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div style={{ maxWidth: 640, margin: "0 auto 56px", padding: "32px 0", borderTop: "1px solid rgba(196,132,122,0.25)", borderBottom: "1px solid rgba(196,132,122,0.25)" }}>
            <p style={{ fontFamily: font.sans, fontSize: 15, fontWeight: 400, lineHeight: 1.7, color: "rgba(255,255,255,0.78)", margin: 0 }}>
              I'm only taking <i style={{ fontStyle: "italic", color: C.rose, fontFamily: font.display, fontSize: 18 }}>3 women</i> per month. Once those spots are filled, the next intake won't open until I've finished with this group.
            </p>
          </div>
        </Reveal>
        <Reveal delay={400}>
          <Btn href="/claritysprint-intake" style={{ fontSize: 11, padding: "24px 52px" }}>
            I'm ready · Book my Clarity Sprint →
          </Btn>
        </Reveal>
        <Reveal delay={500} style={{ marginTop: 32 }}>
          <p style={{ fontFamily: font.sans, fontSize: 12, fontWeight: 400, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: 0 }}>
            Questions? &nbsp;
            <a href="mailto:hello@laurajanethomas.biz" style={{ color: C.rose, borderBottom: "1px solid rgba(196,132,122,0.4)", paddingBottom: 1, textDecoration: "none" }}>hello@laurajanethomas.biz</a>
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── 12. PS FOOTER ───────────────────────────────────────── */
function PSFooter() {
  return (
    <Section tone="light" padY="tight">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Reveal>
          <div style={{ borderLeft: `2px solid ${C.rose}`, paddingLeft: 32, marginBottom: 40 }}>
            <p style={{ ...eyebrow, fontSize: 10, margin: "0 0 12px" }}>P.S.</p>
            <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 22, lineHeight: 1.4, color: C.burgCore, margin: 0, letterSpacing: "-0.005em" }}>
              If you have made it to the bottom of this page, I want to say something to you directly. I built the Clarity Sprint because I remember being where you are now. I remember the spinning. The Googling at midnight. The body that finally said no when I had been ignoring it for years.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div style={{ borderLeft: `2px solid ${C.burgCore}`, paddingLeft: 32 }}>
            <p style={{ ...eyebrow, fontSize: 10, color: C.burgCore, margin: "0 0 12px" }}>P.P.S.</p>
            <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 22, lineHeight: 1.4, color: C.burgCore, margin: 0, letterSpacing: "-0.005em" }}>
              If you are ready, I will be honoured to do this work with you. If you are not ready yet, I will be here when you are. Either way, I am glad you read this far.
            </p>
            <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 20, color: C.rose, marginTop: 16, marginBottom: 0 }}>Laura Jane Thomas</p>
          </div>
        </Reveal>
        <Reveal delay={240} style={{ marginTop: 80, paddingTop: 32, borderTop: "1px solid rgba(74,14,46,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <span style={{ fontFamily: font.sans, fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: C.midGrey }}>
            Laura Jane Thomas &nbsp;·&nbsp; The Aligned Woman Co.
          </span>
          <span style={{ fontFamily: font.sans, fontSize: 10, fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: C.midGrey }}>
            © 2026 &nbsp;·&nbsp; All rights reserved
          </span>
        </Reveal>
      </div>
    </Section>
  );
}

/* ── STICKY CTA ──────────────────────────────────────────── */
function StickyCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{
      position: "fixed", right: 24, bottom: 24, zIndex: 100,
      opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none",
      transform: show ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 320ms cubic-bezier(0.2,0.7,0.2,1), transform 320ms cubic-bezier(0.2,0.7,0.2,1)",
    }}>
      <Btn href="#book">Book the Sprint →</Btn>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   FULL PAGE
   ════════════════════════════════════════════════════════════ */
export default function ClaritySprintPage() {
  return (
    <>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #FAF5F3; overflow-x: hidden; }
        ::selection { background: #C4847A; color: #fff; }
        a { border-bottom: none !important; }
        a:hover { border-bottom: none !important; }
        @media (max-width: 900px) {
          .story-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .testimonial-grid { grid-template-columns: 1fr !important; }
          .who-grid { grid-template-columns: 1fr !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
      <Hero />
      <Problem />
      <Story />
      <OfferIntro />
      <Timeline />
      <Transition />
      <ValueStack />
      <Testimonials />
      <WhoFor />
      <FAQ />
      <FinalCTA />
      <PSFooter />
      <StickyCTA />
    </>
  );
}
