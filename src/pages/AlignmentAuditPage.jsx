import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BUY_URL, PRICE, SPRINT_PRICE, PARTS_TOTAL, TURNAROUND, TURNAROUND_SHORT,
  LOGO, PORTRAIT, HERO_IMAGE, HERO_ALT, PROBLEM_IMAGE,
  STEPS, ACTS, AI_KNOWS, ITEMS, TESTIMONIALS, FAQ, FOR_YOU, NOT_FOR_YOU, FOOTER,
} from "@/data/alignmentAuditPage";

/* ════════════════════════════════════════════════════════════════
   THE ALIGNMENT AUDIT: public sales page (/alignment-audit)
   Anyone can view and buy. No login. Buying goes to the Stripe
   payment link in src/data/alignmentAuditPage.js; handlePaymentWebhook
   grants alignment_audit_paid when the link carries metadata
   product=alignment_audit. The questionnaire itself is /Audit.

   Built from the design "Alignment Audit - Desktop" (11 November 2026),
   which is one page that reflows for a phone. The page carries its own
   header and footer, so App.jsx routes it without the site Layout, the
   same way as /claritysprint.

   Settings and every line of copy that is a list live in the data file.
   Sections, in order: header, hero, price strip, the problem, about
   Laura, the offer, the chapters, your AI script, what you get,
   testimonials, price box, FAQ, is this for you, close, footer, and a
   buy bar that sticks to the bottom of a phone screen.
   ════════════════════════════════════════════════════════════════ */

// The page palette, from the design. Used nowhere else.
const C = {
  burg: "#4A0E2E",
  burgMid: "#6B1642",
  ink: "#080105",
  body: "#3E3036",
  muted: "#8A7A76",
  rose: "#C4847A",
  roseLight: "#E8B4AE",
  ivory: "#F5F1EC",
  sand: "#EEE7DF",
  sandDeep: "#E3DACF",
};
const SERIF = "'Baskervville', 'Baskerville Display PT', Baskerville, 'Times New Roman', Georgia, serif";
const SANS = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
const PAD_X = "clamp(20px,6vw,80px)";
const PAD = `clamp(64px,9vw,112px) ${PAD_X}`;
// Placeholder line widths in the chat illustration.
const WIDTHS = ["82%", "58%", "70%", "46%", "88%", "64%", "76%", "52%", "66%", "40%", "80%", "60%"];

/* ── Shared styles ── */
const eyebrow = (color = C.burgMid) => ({ fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color });
const h2 = (color = C.ink) => ({ fontFamily: SERIF, fontSize: "clamp(30px,1.8vw + 24px,50px)", lineHeight: 1.12, color, textWrap: "balance" });
const pull = (color = C.burg) => ({ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(22px,1vw + 18px,26px)", lineHeight: 1.4, color, textWrap: "pretty" });
const em = (color = C.burg) => ({ fontStyle: "italic", color });
const rule = { width: 40, height: 1, background: C.rose };
const tint = (alpha) => ({ position: "absolute", inset: 0, background: `rgba(74,14,46,${alpha})`, pointerEvents: "none" });
const cover = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" };

const plusIcon = (open, dark) => ({
  width: 32, height: 32, borderRadius: "50%",
  border: `1px solid ${dark ? "rgba(245,241,236,0.3)" : "rgba(74,14,46,0.2)"}`,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 20, fontWeight: 300, lineHeight: 1, color: dark ? C.ivory : C.burg,
  transition: "transform 320ms cubic-bezier(0.2,0.7,0.2,1)", transform: `rotate(${open ? 45 : 0}deg)`,
});
const actTab = (on) => ({
  minWidth: 0, minHeight: 56, padding: "8px 6px", borderRadius: 8, border: 0, fontFamily: SANS, textAlign: "center",
  transition: "background 180ms,color 180ms", background: on ? C.burg : "transparent", color: on ? C.ivory : C.burg,
});
const trackTab = (on) => ({
  flex: 1, height: 44, borderRadius: 100, border: 0, fontFamily: SANS, fontWeight: 600, fontSize: 11,
  letterSpacing: "0.12em", textTransform: "uppercase", transition: "background 180ms,color 180ms",
  background: on ? C.burg : "transparent", color: on ? C.ivory : C.burg,
});

/* ── Small pieces ── */
// The buy button. "tone" is burg (on a light section) or rose (on a dark one).
function Buy({ tone = "burg", style, innerRef }) {
  return (
    <a ref={innerRef} href={BUY_URL} className={`aa-buy aa-buy-${tone}`} style={{ marginLeft: "auto", marginRight: "auto", ...style }}>
      Get my Alignment Audit <span className="aa-arrow" aria-hidden="true">→</span>
    </a>
  );
}

function Tick({ color }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 3 }}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

function Cross({ color }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 3 }}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/* ── Page ── */
export default function AlignmentAuditPage() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  // Tablet and below: the hero copy sits over the image, starting at the top
  // of the page, instead of beside it.
  const [overlayHero, setOverlayHero] = useState(() => typeof window !== "undefined" && window.innerWidth < 1024);
  const [tab, setTab] = useState(0);
  // The open chapter in each act. One at a time per act.
  const [openCh, setOpenCh] = useState({ you: 1, work: 6, next: 8 });
  const [track, setTrack] = useState("business");
  const [aiList, setAiList] = useState(false);
  const [faq, setFaq] = useState(-1);
  const [tIndex, setTIndex] = useState(0);
  const [expanded, setExpanded] = useState({});
  // For the buy bar on a phone: shown once the hero button has scrolled
  // away, hidden again while the price box or the closing card is on screen.
  const [heroOut, setHeroOut] = useState(false);
  const [priceIn, setPriceIn] = useState(false);
  const [closeIn, setCloseIn] = useState(false);

  const heroBtn = useRef(null);
  const priceBox = useRef(null);
  const closeCard = useRef(null);
  const tRow = useRef(null);

  useEffect(() => {
    const id = "aw-audit-fonts-2";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Baskervville:ital,wght@0,400..700;1,400..700&family=Montserrat:wght@400;600&display=swap";
      document.head.appendChild(l);
    }
    document.title = "The Alignment Audit | The Aligned Woman Co.";
  }, []);

  useEffect(() => {
    const onResize = () => {
      setMobile(window.innerWidth < 768);
      setOverlayHero(window.innerWidth < 1024);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.target === heroBtn.current) setHeroOut(!e.isIntersecting && e.boundingClientRect.top < 0);
      else if (e.target === priceBox.current) setPriceIn(e.isIntersecting);
      else if (e.target === closeCard.current) setCloseIn(e.isIntersecting);
    }), { threshold: 0.05 });
    [heroBtn, priceBox, closeCard].forEach((r) => { if (r.current) io.observe(r.current); });
    return () => io.disconnect();
  }, [mobile]);

  const act = ACTS[tab] || ACTS[0];
  const total = TESTIMONIALS.length;
  const shown = Math.min(tIndex + 1, total);
  const stickyVisible = mobile && heroOut && !priceIn && !closeIn;

  // One testimonial card plus the gap, for the arrows and the counter.
  const cardStep = () => {
    const row = tRow.current;
    if (!row || !row.firstElementChild) return 1;
    return row.firstElementChild.getBoundingClientRect().width + 12;
  };
  const scrollT = (i) => { if (tRow.current) tRow.current.scrollTo({ left: i * cardStep(), behavior: "smooth" }); };
  const onTScroll = (e) => {
    const i = Math.round(e.currentTarget.scrollLeft / cardStep());
    if (i !== tIndex) setTIndex(i);
  };

  return (
    <div className="aa2" style={{ minHeight: "100vh", background: C.ivory, color: C.body, overflowX: "clip", fontFamily: SANS, fontWeight: 400, fontSize: 17, lineHeight: 1.6 }}>
      <style>{`
        .aa2 p { margin: 0; }
        .aa2 h1, .aa2 h2, .aa2 h3 { margin: 0; font-weight: 400; }
        .aa2 a { color: ${C.burgMid}; border: 0; text-decoration: none; }
        .aa2 a:hover { color: ${C.burg}; }
        .aa2 button { font: inherit; cursor: pointer; }
        .aa2 a:focus-visible, .aa2 button:focus-visible { outline: 2px solid ${C.rose}; outline-offset: 3px; }
        .aa2 .aa-buy {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          width: 100%; height: 68px; border-radius: 100px; box-sizing: border-box;
          font-weight: 600; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 180ms;
          animation: aa-buy-pulse 2.8s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) { .aa2 .aa-buy { animation: none; } }
        .aa2 .aa-buy-burg, .aa2 .aa-buy-burg:hover { color: ${C.ivory}; }
        .aa2 .aa-buy-burg { background: ${C.burg}; }
        .aa2 .aa-buy-burg:hover { background: ${C.burgMid}; }
        .aa2 .aa-buy-rose, .aa2 .aa-buy-rose:hover { color: ${C.ink}; }
        .aa2 .aa-buy-rose { background: ${C.rose}; }
        .aa2 .aa-buy-rose:hover { background: ${C.roseLight}; }
        .aa2 .aa-arrow { display: inline-block; animation: aa-nudge 2.4s ease-in-out infinite; }
        .aa2 .aa-pill {
          display: inline-flex; align-items: center; justify-content: center; border-radius: 100px;
          font-weight: 600; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 180ms, color 180ms;
        }
        .aa2 .aa-pill-line { height: 40px; padding: 0 18px; border: 1.5px solid ${C.burg}; color: ${C.burg}; }
        .aa2 .aa-pill-line:hover { background: ${C.burg}; color: ${C.ivory}; }
        .aa2 .aa-pill-solid, .aa2 .aa-pill-solid:hover { color: ${C.ivory}; }
        .aa2 .aa-pill-solid { flex: none; height: 48px; padding: 0 20px; background: ${C.burg}; }
        .aa2 .aa-pill-solid:hover { background: ${C.burgMid}; }
        .aa2 .aa-circ {
          width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid ${C.burg};
          background: none; color: ${C.burg}; font-size: 18px; transition: background 180ms, color 180ms;
        }
        .aa2 .aa-circ:hover { background: ${C.burg}; color: ${C.ivory}; }
        .aa2 .aa-foot-link { display: inline-block; padding: 7px 0; font-size: 15px; color: ${C.ivory}; }
        .aa2 .aa-foot-link:hover { color: ${C.roseLight}; }
        .aa2 .aa-row { scrollbar-width: none; }
        .aa2 .aa-row::-webkit-scrollbar { height: 0; width: 0; }
        @keyframes aa-nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
        @keyframes aa-buy-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196,132,122,0.5); transform: scale(1); }
          60% { box-shadow: 0 0 0 14px rgba(196,132,122,0); transform: scale(1.015); }
        }
        @keyframes aa-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        /* Tablet and phone: every block of copy is centred. */
        @media (max-width: 1023px) {
          .aa2, .aa2 * { text-align: center !important; }
          .aa2 [style*="flex-direction: column"] { align-items: center !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .aa2 *, .aa2 *::before, .aa2 *::after { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(245,241,236,0.96)", borderBottom: "1px solid rgba(74,14,46,0.08)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${PAD_X}` }}>
        <Link to="/" aria-label="The Aligned Woman Co. home" style={{ display: "flex", alignItems: "center", height: 48 }}>
          <img src={LOGO} alt="The Aligned Woman Co." style={{ height: 26, width: "auto", display: "block" }} />
        </Link>
        <a href={BUY_URL} className="aa-pill aa-pill-line">Get my Audit</a>
      </header>

      {/* 1. Hero */}
      {overlayHero ? (
        <section style={{ position: "relative", minHeight: "calc(100svh - 60px)", display: "flex", flexDirection: "column", justifyContent: "flex-start", background: C.burg }}>
          <img src={HERO_IMAGE} alt={HERO_ALT} style={cover} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,5,16,0.78) 0%, rgba(74,14,46,0.3) 38%, rgba(74,14,46,0.55) 60%, rgba(26,5,16,0.94) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", padding: "40px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 32 }}>
            <p style={{ ...eyebrow(C.roseLight), lineHeight: 1.7, maxWidth: "22em", textWrap: "balance" }}>The Alignment Audit · For ambitious women ready for what's next</p>
            <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(36px,10vw,42px)", lineHeight: 1.1, letterSpacing: "-0.01em", color: C.ivory, maxWidth: "9em", textWrap: "balance" }}>
              You know it's time to change. <em style={{ fontStyle: "italic", fontWeight: 700, color: C.roseLight }}>Now find out how.</em>
            </h1>
          </div>
          <div style={{ position: "relative", padding: "28px 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: C.ivory, maxWidth: "30em", textWrap: "pretty" }}>Answer my questions in your own time. Within {TURNAROUND} I send you a blueprint, written by me, about you: what's draining you, what you actually want, and the one move I'd make next.</p>
            <p style={{ marginTop: -6, fontSize: 16, lineHeight: 1.6, color: C.ivory, maxWidth: "30em", textWrap: "pretty" }}>We go through your blueprint together for an hour. Then I set up your ChatGPT or Claude to know who you are, so the work carries on after we're done.</p>
            <Buy tone="rose" innerRef={heroBtn} style={{ marginTop: 4 }} />
            <p style={{ marginTop: -6, fontSize: 14, color: C.ivory }}>{PRICE}, paid once. Written by me, not generated.</p>
          </div>
        </section>
      ) : (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))", alignItems: "stretch", minHeight: "calc(100vh - 60px)" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: `clamp(40px,6vw,96px) ${PAD_X} clamp(48px,6vw,96px)`, maxWidth: 640, justifySelf: "end", width: "100%", boxSizing: "border-box" }}>
            <p style={{ ...eyebrow(), lineHeight: 1.7, textWrap: "balance" }}>The Alignment Audit · For ambitious women ready for what's next</p>
            <h1 style={{ fontFamily: SERIF, fontSize: "clamp(38px,2.6vw + 28px,62px)", lineHeight: 1.08, letterSpacing: "-0.01em", color: C.ink, marginTop: 20, textWrap: "pretty" }}>
              You know it's time to change. <em style={em()}>Now find out how.</em>
            </h1>
            <p style={{ marginTop: 22, maxWidth: "34em", textWrap: "pretty" }}>Answer my questions in your own time. Within {TURNAROUND} I send you a blueprint, written by me, about you: what's draining you, what you actually want, and the one move I'd make next. We go through it together for an hour. Then I set up your ChatGPT or Claude to know who you are, so the work carries on after we're done.</p>
            <Buy innerRef={heroBtn} style={{ marginTop: 28, maxWidth: 420 }} />
            <p style={{ marginTop: 14, fontSize: 14, color: C.body, textAlign: "center" }}>{PRICE}, paid once. Written by me, not generated.</p>
          </div>
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", minHeight: "100%", background: C.sand }}>
            <img src={HERO_IMAGE} alt={HERO_ALT} style={cover} />
            <div style={tint(0.12)} />
          </div>
        </section>
      )}

      {/* 2. Price strip */}
      <section style={{ background: C.burg, color: C.ivory, padding: `28px ${PAD_X}`, textAlign: "center" }}>
        <p style={{ maxWidth: "40em", margin: "0 auto", fontSize: 16, lineHeight: 1.6, textWrap: "balance" }}>My Clarity Sprint is over {SPRINT_PRICE}. The Alignment Audit is the same diagnostic thinking, on its own, for {PRICE}. If you go on to the Sprint, the full fee comes off.</p>
      </section>

      {/* 3. The problem */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))", alignItems: "stretch" }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", minHeight: "100%", background: C.sand }}>
          {PROBLEM_IMAGE && <img src={PROBLEM_IMAGE} alt="" loading="lazy" style={cover} />}
          <div style={tint(0.12)} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", textAlign: "left", padding: PAD, maxWidth: 640, width: "100%", boxSizing: "border-box" }}>
          <h2 style={h2()}>You can't read the label <em style={em()}>from inside the jar.</em></h2>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 18, textAlign: "left", maxWidth: "34em" }}>
            <p>You know something has to change. You can feel it every Monday. What you can't see is how.</p>
            <p>Maybe you built something real and it's stalled. Maybe you're good at your job and you've outgrown it. Either way, you've done the reading. You took the free quiz. You asked ChatGPT at midnight. You can name your pattern, and you're still making the same call you made last year. <em style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "1.05em", color: C.burg }}>(Yes, close the tab.)</em></p>
            <p>More information won't fix that. You're too close to your own life to see it, which is why every answer you find feels true for about a day.</p>
          </div>
          <div style={{ ...rule, margin: "44px 0 22px" }} />
          <p style={{ ...pull(), maxWidth: "28em" }}>ChatGPT gives you the most likely answer. Your friends give you the kindest one. The Alignment Audit gives you the honest one, from someone who's built the thing.</p>
          <Buy style={{ marginTop: 40, maxWidth: 420 }} />
        </div>
      </section>

      {/* 4. About Laura */}
      <section style={{ background: C.sand, padding: PAD }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "clamp(32px,5vw,80px)", alignItems: "center" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: 4, overflow: "hidden", background: C.sandDeep }}>
            <img src={PORTRAIT} alt="Laura Jane Thomas, founder of The Aligned Woman Co." loading="lazy" style={cover} />
            <div style={tint(0.14)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "34em" }}>
            <h2 style={h2()}>I've sat on <em style={em()}>both sides of this.</em></h2>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              <p>I built and ran my own multi-seven-figure, award-winning marketing agency for over a decade. I also learned what it costs to build something while running yourself into the ground. My body called it before I did.</p>
              <p>So when I read your answers, you're not getting theory or a framework borrowed from the internet. You're getting someone who has made these decisions with real money on the line, and who knows a plan only works if the person carrying it can sustain it.</p>
              <p>I'm a certified NLP and Time Line Therapy practitioner, a certified director, a speaker and an author.</p>
            </div>
            <div style={{ ...rule, margin: "32px 0 18px" }} />
            <p style={pull()}>Operator experience, without the burnout most business advice runs on.</p>
          </div>
        </div>
      </section>

      {/* 5. The offer */}
      <section style={{ padding: PAD }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ maxWidth: "34em" }}>
            <p style={eyebrow()}>The offer</p>
            <h2 style={{ ...h2(), marginTop: 16 }}>Introducing <em style={em()}>The Alignment Audit.</em></h2>
            <p style={{ marginTop: 20 }}>This isn't a personality test or a course. It's a diagnosis, and I write it.</p>
          </div>
          <ol style={{ listStyle: "none", margin: "48px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))", gap: 0 }}>
            {STEPS.map((s, i) => (
              <li key={s.k} style={{ position: "relative", display: "grid", gridTemplateColumns: "28px 1fr", columnGap: 16, paddingBottom: 32, minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ flex: "none", width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${C.burg}`, color: C.burg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 12, background: C.ivory }}>{i + 1}</span>
                  <span style={{ flex: 1, width: 1, background: C.rose, marginTop: 6, minHeight: 24 }} />
                </div>
                <div style={{ paddingRight: 16, paddingTop: 3 }}>
                  <p style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.3, color: C.burg }}>{s.k}</p>
                  <p style={{ marginTop: 6, fontSize: 16, textWrap: "pretty" }}>{s.t}</p>
                </div>
              </li>
            ))}
          </ol>
          <p style={{ ...pull(), marginTop: 8 }}>You answer. I do the thinking.</p>
        </div>
      </section>

      {/* 6. The chapters */}
      <section style={{ background: C.sand, padding: "clamp(64px,9vw,112px) 0" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: `0 ${PAD_X}` }}>
          <div style={{ maxWidth: "34em" }}>
            <p style={eyebrow()}>What we cover</p>
            <h2 style={{ ...h2(), marginTop: 16 }}>Eleven chapters. <em style={em()}>One clear picture of you.</em></h2>
            <p style={{ marginTop: 20, textWrap: "pretty" }}>We start with you, because your business or career is run by a person, and that person is usually the part nobody looks at. Then your work. Then what's next. Every answer feeds your blueprint.</p>
          </div>
        </div>
        <div role="tablist" aria-label="Acts" style={{ position: "sticky", top: 60, zIndex: 30, background: C.sand, marginTop: 40, padding: `12px ${PAD_X}`, borderBottom: "1px solid rgba(74,14,46,0.08)" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 3, background: C.ivory, border: "1px solid rgba(74,14,46,0.15)", borderRadius: 10, padding: 3, boxSizing: "border-box" }}>
            {ACTS.map((a, i) => (
              <button key={a.id} type="button" role="tab" aria-selected={i === tab} aria-label={a.label} onClick={() => setTab(i)} style={actTab(i === tab)}>
                <span style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, opacity: 0.7 }}>{a.act}</span>
                <span style={{ display: "block", marginTop: 4, fontFamily: SERIF, fontSize: 17, lineHeight: 1.2, textTransform: "none", letterSpacing: 0 }}>{a.short}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: `24px ${PAD_X} 0` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {act.chapters.map((ch) => {
              const open = openCh[act.id] === ch.n;
              return (
                <div key={ch.n} style={{ background: C.ivory, border: "1px solid rgba(74,14,46,0.08)", borderRadius: 10 }}>
                  <button type="button" aria-expanded={open} onClick={() => setOpenCh((p) => ({ ...p, [act.id]: open ? null : ch.n }))} style={{ width: "100%", display: "grid", gridTemplateColumns: "40px 1fr 32px", columnGap: 12, alignItems: "start", textAlign: "left", background: "none", border: 0, padding: "20px 18px", color: "inherit", minHeight: 48 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, color: C.rose, fontVariantNumeric: "lining-nums" }}>{String(ch.n).padStart(2, "0")}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 600, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: C.burgMid, lineHeight: 1.5 }}>{ch.name}</span>
                        {ch.heart && <span style={{ display: "inline-block", background: C.roseLight, color: C.ink, fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 100 }}>The heart of the Audit</span>}
                      </span>
                      <span style={{ display: "block", marginTop: 8, fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1.4, color: C.burg, textWrap: "pretty" }}>{ch.back}</span>
                    </span>
                    <span aria-hidden="true" style={plusIcon(open)}>+</span>
                  </button>
                  {open && (
                    <div style={{ padding: "0 18px 22px 70px" }}>
                      <p style={eyebrow()}>What we look at</p>
                      <p style={{ marginTop: 8, fontSize: 16, maxWidth: "34em", textWrap: "pretty" }}>{ch.look}</p>
                    </div>
                  )}
                </div>
              );
            })}
            {act.track && (
              <div style={{ background: C.ivory, border: "1px solid rgba(74,14,46,0.08)", borderRadius: 10, padding: "22px 18px" }}>
                <p style={eyebrow()}>Your track</p>
                <div role="tablist" aria-label="Your track" style={{ display: "flex", gap: 3, marginTop: 14, background: C.sand, borderRadius: 100, padding: 3, maxWidth: 420 }}>
                  <button type="button" role="tab" aria-selected={track === "business"} onClick={() => setTrack("business")} style={trackTab(track === "business")}>I run a business</button>
                  <button type="button" role="tab" aria-selected={track === "career"} onClick={() => setTrack("career")} style={trackTab(track === "career")}>I have a career</button>
                </div>
                <p style={{ marginTop: 18, fontSize: 16, maxWidth: "34em", textWrap: "pretty" }}>
                  <strong style={{ fontWeight: 600, color: C.ink }}>{track === "business" ? "I run a business:" : "I have a career:"}</strong> {act.track[track]}
                </p>
                <p style={{ marginTop: 14, fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1.4, color: C.burg, maxWidth: "30em", textWrap: "pretty" }}>
                  <span style={{ ...eyebrow(), fontStyle: "normal", fontFamily: SANS, marginRight: 10 }}>You get back</span>{act.track.back}
                </p>
              </div>
            )}
          </div>
          <p style={{ ...pull(), marginTop: 40, maxWidth: "28em" }}>Then I put it all together: your pattern, named, and the one move I'd make next.</p>
        </div>
      </section>

      {/* 7. Your AI script */}
      <section style={{ background: C.burg, color: C.ivory, padding: PAD }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "clamp(40px,5vw,80px)", alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "34em" }}>
            <p style={eyebrow(C.roseLight)}>After the call</p>
            <h2 style={{ ...h2(C.ivory), marginTop: 16 }}>Our call ends. <em style={em(C.roseLight)}>The work doesn't.</em></h2>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 18, color: C.ivory }}>
              <p>Right now, your AI knows nothing about you. Ask it what to do next and it gives you the average answer, the one written for everyone.</p>
              <p>After our call, I turn your blueprint into custom instructions for your ChatGPT or Claude. You paste them in once. From then on, every conversation starts from you.</p>
            </div>
            <div style={{ marginTop: 40 }}>
              <div style={{ borderTop: "1px solid rgba(245,241,236,0.14)", borderBottom: "1px solid rgba(245,241,236,0.14)" }}>
                <button type="button" aria-expanded={aiList} onClick={() => setAiList((x) => !x)} style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 32px", gap: 16, alignItems: "center", textAlign: "left", background: "none", border: 0, padding: "18px 0", minHeight: 56, color: C.ivory }}>
                  <span style={eyebrow(C.roseLight)}>What your AI will know</span>
                  <span aria-hidden="true" style={plusIcon(aiList, true)}>+</span>
                </button>
                {aiList && (
                  <ul style={{ listStyle: "none", margin: 0, padding: "0 0 10px", display: "flex", flexDirection: "column" }}>
                    {AI_KNOWS.map((k) => (
                      <li key={k.key} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 14, padding: "12px 0", fontSize: 16, color: C.ivory }}>
                        <Tick color={C.roseLight} />
                        <span>{k.a}{k.em && <em style={{ fontStyle: "italic", fontFamily: SERIF, fontSize: "1.08em" }}>{k.em}</em>}{k.b || ""}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          {/* Chat illustration */}
          <div role="img" aria-label="Illustration of a chat window with custom instructions" style={{ background: C.ivory, color: C.body, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(232,180,174,0.3)", maxWidth: 520, width: "100%", justifySelf: "center" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(74,14,46,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={eyebrow()}>Custom instructions</span>
              <span style={{ fontSize: 12, color: C.muted }}>Written by Laura</span>
            </div>
            <div style={{ padding: "6px 18px 10px", display: "flex", flexDirection: "column" }}>
              {AI_KNOWS.map((k, i) => (
                <div key={k.key} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 14, alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(74,14,46,0.06)" }}>
                  <span style={{ fontWeight: 600, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: C.burg }}>{k.key}</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ display: "block", height: 8, borderRadius: 4, background: "rgba(74,14,46,0.14)", width: WIDTHS[i * 2] }} />
                    <span style={{ display: "block", height: 8, borderRadius: 4, background: "rgba(74,14,46,0.09)", width: WIDTHS[i * 2 + 1] }} />
                  </span>
                </div>
              ))}
            </div>
            <div style={{ background: C.sand, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: C.ivory, borderRadius: "10px 10px 10px 2px", padding: "12px 14px", fontSize: 14, lineHeight: 1.5, color: C.body }}>Before I answer, what do you think? You said you'd ask yourself first.</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44, borderRadius: 100, background: C.ivory, border: "1px solid rgba(74,14,46,0.1)", padding: "0 8px 0 16px", fontSize: 14, color: C.muted }}>
                Message
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: C.burg, color: C.ivory, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>↑</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 620, margin: "clamp(48px,6vw,72px) auto 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ ...rule, marginBottom: 18 }} />
          <p style={pull(C.ivory)}>Most people use AI to think for them. Yours will be set up to make you think for yourself.</p>
          <p style={{ marginTop: 20, fontSize: 14, lineHeight: 1.6, color: C.roseLight, maxWidth: "34em" }}>Your AI isn't me and it won't replace a coach. What it will do is keep you pointed in the direction we chose, every day, long after our hour is up.</p>
        </div>
      </section>

      {/* 8. What you get */}
      <section style={{ padding: PAD }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ maxWidth: "34em" }}>
            <p style={eyebrow()}>What you get</p>
            <h2 style={{ ...h2(), marginTop: 16 }}>What you get inside <em style={em()}>The Alignment Audit.</em></h2>
          </div>
          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 3 }}>
            {ITEMS.map((it) => (
              <div key={it.name} style={{ background: C.sand, borderRadius: 10, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <h3 style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.25, color: C.burg }}>{it.name}</h3>
                  <span style={{ flex: "none", fontWeight: 600, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: C.burgMid, fontVariantNumeric: "lining-nums" }}>{it.value}</span>
                </div>
                <p style={{ fontSize: 16, textWrap: "pretty" }}>{it.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 3, background: C.ink, color: C.ivory, borderRadius: 10, padding: "28px 22px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 20, alignItems: "start" }}>
            <div>
              <span style={{ display: "inline-block", background: C.roseLight, color: C.ink, fontWeight: 600, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 100 }}>Bonus</span>
              <h3 style={{ fontFamily: SERIF, fontSize: "clamp(24px,1vw + 18px,30px)", lineHeight: 1.25, color: C.ivory, marginTop: 16, textWrap: "balance" }}>Your full fee, credited to the Clarity Sprint.</h3>
            </div>
            <p style={{ fontSize: 16, color: C.ivory, maxWidth: "34em", textWrap: "pretty" }}>If your blueprint shows you need one-to-one work, book the Sprint within 12 months and the full {PRICE} comes off a programme that's over {SPRINT_PRICE}. Your answers carry straight into our first session.</p>
          </div>
          <Buy style={{ marginTop: 40, maxWidth: 420 }} />
        </div>
      </section>

      {/* 9. Testimonials */}
      <section style={{ background: C.sand, padding: "clamp(64px,9vw,112px) 0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: `0 ${PAD_X}`, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "end", gap: 20 }}>
          <div style={{ maxWidth: "34em" }}>
            <h2 style={h2()}>What people say after working with me.</h2>
            <p style={{ marginTop: 12 }}>From women I've worked with.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span aria-live="polite" style={{ fontSize: 14, color: C.body, fontVariantNumeric: "lining-nums" }}>{shown} of {total}</span>
            <button type="button" className="aa-circ" aria-label="Previous" onClick={() => scrollT(Math.max(0, tIndex - 1))}>←</button>
            <button type="button" className="aa-circ" aria-label="Next" onClick={() => scrollT(Math.min(total - 1, tIndex + 1))}>→</button>
          </div>
        </div>
        <div ref={tRow} className="aa-row" onScroll={onTScroll} style={{ marginTop: 36, display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", padding: `0 ${PAD_X}`, scrollPadding: `0 ${PAD_X}`, alignItems: "stretch" }}>
          {TESTIMONIALS.map((t, i) => {
            const long = t.q.length > 230;
            const ex = !!expanded[i];
            return (
              <figure key={t.who} style={{ flex: "0 0 min(85%,352px)", scrollSnapAlign: "start", margin: 0, background: C.ivory, border: "1px solid rgba(74,14,46,0.08)", borderRadius: 10, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box" }}>
                <h3 style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.3, color: C.burg, textWrap: "pretty" }}>{t.h}</h3>
                <blockquote style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: C.body, textWrap: "pretty", flex: 1, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden", WebkitLineClamp: long && !ex ? 4 : 99 }}>{t.q}</blockquote>
                {long && (
                  <button type="button" onClick={() => setExpanded((p) => ({ ...p, [i]: !ex }))} style={{ alignSelf: "flex-start", background: "none", border: 0, padding: "12px 0", color: C.burgMid, fontWeight: 600, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>{ex ? "Read less" : "Read more"}</button>
                )}
                <figcaption style={{ fontSize: 14, color: C.body }}>
                  <span style={{ fontWeight: 600, color: C.ink }}>{t.who}</span>
                  {t.co && <span style={{ color: C.muted }}> | {t.co}</span>}
                </figcaption>
              </figure>
            );
          })}
        </div>
        <div style={{ maxWidth: 1120, margin: "20px auto 0", padding: `0 ${PAD_X}` }}>
          <div style={{ height: 1, background: "rgba(74,14,46,0.1)", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, height: 1, background: C.burg, width: `${(shown / Math.max(total, 1)) * 100}%`, transition: "width 320ms cubic-bezier(0.2,0.7,0.2,1)" }} />
          </div>
        </div>
      </section>

      {/* 10. Price box */}
      <section style={{ background: C.sand, padding: `0 ${PAD_X} clamp(64px,9vw,112px)` }}>
        <div ref={priceBox} id="buy" style={{ maxWidth: 560, margin: "0 auto", background: C.ivory, border: `1px solid ${C.burg}`, borderRadius: 10, padding: "clamp(32px,5vw,48px) clamp(22px,4vw,40px)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box" }}>
          <p style={{ fontSize: 16, maxWidth: "34em", textWrap: "pretty" }}>One-to-one, my Clarity Sprint is over {SPRINT_PRICE}. At my standard rates, the Audit's parts come to <s style={{ color: C.muted, textDecorationColor: C.rose }}>{PARTS_TOTAL}</s>.</p>
          <p style={{ marginTop: 28, fontFamily: SERIF, fontSize: "clamp(64px,5vw + 20px,80px)", lineHeight: 1, color: C.ink, fontVariantNumeric: "lining-nums", letterSpacing: "-0.02em" }}>{PRICE}</p>
          <p style={{ ...eyebrow(), marginTop: 8 }}>Paid once</p>
          <p style={{ marginTop: 22, fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1.45, color: C.burg, maxWidth: "28em", textWrap: "pretty" }}>Less than one hour of my advisory time, for a blueprint I write for you, an hour with me and your AI script.</p>
          <Buy style={{ marginTop: 28 }} />
          <p style={{ marginTop: 14, fontSize: 14 }}>Online. Your blueprint within {TURNAROUND}.</p>
        </div>
      </section>

      {/* 11. FAQ */}
      <section style={{ padding: PAD }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={h2()}>What you might be thinking right now.</h2>
          <div style={{ marginTop: 36, borderTop: "1px solid rgba(74,14,46,0.12)" }}>
            {FAQ.map((f, i) => {
              const open = faq === i;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid rgba(74,14,46,0.12)" }}>
                  <button type="button" aria-expanded={open} onClick={() => setFaq(open ? -1 : i)} style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 32px", gap: 16, alignItems: "center", textAlign: "left", background: "none", border: 0, padding: "20px 0", minHeight: 56 }}>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, lineHeight: 1.35, color: C.burg, textWrap: "pretty" }}>{f.q}</span>
                    <span aria-hidden="true" style={plusIcon(open)}>+</span>
                  </button>
                  {open && <p style={{ padding: "0 48px 22px 0", fontSize: 16, maxWidth: "34em", textWrap: "pretty" }}>{f.a}</p>}
                </div>
              );
            })}
          </div>
          <p style={{ ...pull(), marginTop: 44, maxWidth: "28em" }}>If you've read this far and you're still here, you already know what you're going to do.</p>
          <Buy style={{ marginTop: 32, maxWidth: 420 }} />
        </div>
      </section>

      {/* 12. Is this for you */}
      <section style={{ background: C.burg, color: C.ivory, padding: PAD }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h2 style={h2(C.ivory)}>Is this the right offer for you?</h2>
          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 3 }}>
            <div style={{ background: C.ivory, color: C.body, borderRadius: 10, padding: "28px 24px" }}>
              <p style={eyebrow()}>This is for you if</p>
              <ul style={{ listStyle: "none", margin: "18px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {FOR_YOU.map((x) => (
                  <li key={x} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 14, fontSize: 16, textWrap: "pretty" }}><Tick color={C.burg} /><span>{x}</span></li>
                ))}
              </ul>
            </div>
            <div style={{ background: C.ivory, color: C.body, borderRadius: 10, padding: "28px 24px" }}>
              <p style={eyebrow()}>This isn't for you if</p>
              <ul style={{ listStyle: "none", margin: "18px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {NOT_FOR_YOU.map((x) => (
                  <li key={x} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 14, fontSize: 16, textWrap: "pretty" }}><Cross color={C.rose} /><span>{x}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <p style={{ ...pull(C.ivory), marginTop: 40, maxWidth: "28em" }}>If you've read both columns and you're still here, you already know which one applies to you.</p>
          <Buy tone="rose" style={{ marginTop: 32, maxWidth: 420 }} />
        </div>
      </section>

      {/* 13. Close */}
      <section style={{ padding: PAD }}>
        <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p style={eyebrow()}>Let's begin</p>
          <h2 style={{ ...h2(), marginTop: 16, textWrap: "wrap" }}>This is the moment.</h2>
          <p style={{ marginTop: 20, maxWidth: "34em", textWrap: "pretty" }}>You know what the Audit is, what it costs and what you walk away with. The only question left is whether you want the honest version.</p>
          <p style={{ ...pull(), marginTop: 24 }}>You don't need another opinion. You need an accurate one.</p>
          <div ref={closeCard} style={{ marginTop: 40, width: "100%", background: C.sand, borderRadius: 10, padding: "clamp(28px,4vw,40px) clamp(22px,4vw,36px)", textAlign: "left", boxSizing: "border-box" }}>
            <h3 style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.25, color: C.burg }}>Get your Alignment Audit.</h3>
            <p style={{ marginTop: 12, fontSize: 16, textWrap: "pretty" }}>{PRICE}, paid once. Your blueprint within {TURNAROUND}. One hour with me to go through it. Your AI script after the call. Full fee credited to the Clarity Sprint.</p>
            <Buy style={{ marginTop: 24 }} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: C.ink, color: C.ivory, padding: `clamp(56px,7vw,80px) ${PAD_X} 40px` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 40 }}>
          <div style={{ maxWidth: 300 }}>
            <img src={LOGO} alt="The Aligned Woman Co." style={{ height: 28, width: "auto", display: "block", filter: "brightness(0) invert(1)" }} />
            <p style={{ marginTop: 18, fontSize: 14, color: "rgba(245,241,236,0.7)" }}>Built for women. Grounded in evidence. Verified at every step.</p>
          </div>
          {FOOTER.map((col) => (
            <div key={col.title}>
              <p style={eyebrow(C.roseLight)}>{col.title}</p>
              <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0, display: "flex", flexDirection: "column" }}>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith("/") ? (
                      <Link to={href} className="aa-foot-link">{label}</Link>
                    ) : (
                      <a href={href} className="aa-foot-link">{label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1120, margin: "48px auto 0", paddingTop: 20, borderTop: "1px solid rgba(245,241,236,0.12)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, fontSize: 13, color: "rgba(245,241,236,0.6)" }}>
          <span>© {new Date().getFullYear()} The Aligned Woman Co. All rights reserved.</span>
          <span>Designed for women. Built with intention.</span>
        </div>
      </footer>

      {/* Buy bar that sticks to the bottom of a phone screen */}
      {stickyVisible && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50, background: C.ivory, borderTop: "1px solid rgba(74,14,46,0.12)", padding: "10px 20px calc(10px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, animation: "aa-slide-up 320ms cubic-bezier(0.2,0.7,0.2,1)" }}>
          <span style={{ fontSize: 14, lineHeight: 1.3, color: C.body, fontVariantNumeric: "lining-nums" }}><strong style={{ fontWeight: 600, color: C.ink }}>{PRICE}</strong> · Blueprint in {TURNAROUND_SHORT}</span>
          <a href={BUY_URL} className="aa-pill aa-pill-solid">Get my Audit</a>
        </div>
      )}
    </div>
  );
}