import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function BlueprintPage() {
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [affiliateCode, setAffiliateCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aff = params.get("aff");
    if (aff) { setAffiliateCode(aff); sessionStorage.setItem("aff", aff); }
    else { const stored = sessionStorage.getItem("aff"); if (stored) setAffiliateCode(stored); }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    };
    const el = sectionRef.current;
    if (el) el.addEventListener("mousemove", handleMouseMove);
    return () => { if (el) el.removeEventListener("mousemove", handleMouseMove); };
  }, []);

  const gradientX = `${mousePos.x * 100}%`;
  const gradientY = `${mousePos.y * 100}%`;

  return (
    <div className="overflow-x-hidden">

      {/* ── 1. PROMO BANNER ── */}
      <div style={{
        background: "#0d0205",
        borderBottom: "1px solid rgba(196,132,122,0.15)",
        padding: "10px 16px",
        textAlign: "center",
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
          fontFamily: "Montserrat, sans-serif",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#E05C2A", flexShrink: 0 }} />
          Founding Price R3,997 · Doors Open 1 May 2026 · Price Rises At Launch
        </span>
      </div>

      {/* ── 2. HERO ── */}
      <section
        ref={sectionRef}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh", paddingBottom: 48 }}
      >
        {/* Background image (same as home) */}
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c1af736e30d6ce22780c4/19e69afb3_laptop-computer-girl-woman-home-technology-female-2025-01-29-14-44-55-utc.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(155deg, rgba(8,1,5,0.94) 0%, rgba(26,5,16,0.90) 40%, rgba(45,8,25,0.88) 70%, rgba(14,2,8,0.94) 100%)" }} />
        {/* Mouse radial */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(55% 45% at ${gradientX} ${gradientY}, rgba(196,132,122,0.22) 0%, rgba(26,5,16,0.06) 55%, transparent 100%)`, transition: "background 0.1s" }} />

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center" style={{ paddingTop: "clamp(80px, 12vw, 120px)" }}>

          {/* a) Eyebrow badge */}
          <div style={{ marginBottom: 24 }}>
            <span style={{
              fontSize: 14, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase",
              color: "rgba(232,180,174,0.9)", background: "rgba(196,132,122,0.1)",
              border: "1px solid rgba(196,132,122,0.25)", borderRadius: "100px",
              padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: "Montserrat, sans-serif",
            }}>
              <span style={{ color: "rgba(196,132,122,0.8)", fontSize: 10 }}>●</span>
              The Education Women Should Have Been Given
            </span>
          </div>

          {/* b) Italic tagline */}
          <p style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "rgba(255,255,255,0.6)",
            marginBottom: 28,
            lineHeight: 1.5,
          }}>
            "You have achieved everything you were supposed to want. And you are still not okay."
          </p>

          {/* c) Main headline */}
          <div style={{ lineHeight: 0.95, marginBottom: 16 }}>
            <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, textTransform: "uppercase", fontSize: "clamp(48px, 8vw, 80px)", color: "#fff", lineHeight: 0.95 }}>
              THE ALIGNED
            </div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontStyle: "italic", fontSize: "clamp(60px, 10vw, 100px)", color: "#C4847A", lineHeight: 0.95 }}>
              Woman
            </div>
            <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 900, textTransform: "uppercase", fontSize: "clamp(48px, 8vw, 80px)", color: "#fff", lineHeight: 0.95 }}>
              BLUEPRINT
            </div>
          </div>

          {/* d) Est line */}
          <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 20 }}>
            blueprint™ · est. 2026
          </p>

          {/* e) Topic pills */}
          <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "0.06em", marginBottom: 12, fontFamily: "Montserrat, sans-serif" }}>
            Psychology · Money · Health · Identity · Leadership
          </p>

          {/* f) Description */}
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 32, fontFamily: "Montserrat, sans-serif", lineHeight: 1.6 }}>
            The only programme of its kind. 14 globally recognised specialists. One sequenced system.
          </p>

          {/* g) Stats row */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "stretch",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
            marginBottom: 32, overflow: "hidden",
          }}>
            {[
              { num: "14", label: "SPECIALISTS", serif: false, strike: false, large: false },
              { num: "7", label: "LIFE DOMAINS", serif: false, strike: false, large: false },
              { num: "R116,200", label: "PRIVATE VALUE", serif: true, strike: true, large: false },
              { num: "R3,997", label: "YOUR INVESTMENT", serif: false, strike: false, large: true },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  flex: 1, padding: "24px 16px", textAlign: "center",
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  background: stat.large ? "rgba(196,132,122,0.08)" : "transparent",
                }}
              >
                <div style={{
                  fontFamily: stat.serif ? "'DM Serif Display', Georgia, serif" : "Montserrat, sans-serif",
                  fontStyle: stat.serif ? "italic" : "normal",
                  fontWeight: stat.serif ? 400 : 800,
                  fontSize: stat.large ? "clamp(28px, 5vw, 48px)" : "clamp(28px, 4vw, 44px)",
                  color: stat.serif ? "#C4847A" : "#fff",
                  textDecoration: stat.strike ? "line-through" : "none",
                  textDecorationColor: "rgba(196,132,122,0.6)",
                  lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {stat.num}
                </div>
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
                  fontFamily: "Montserrat, sans-serif",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* h) CTA buttons */}
          <div className="flex flex-row items-center justify-center flex-wrap" style={{ gap: 12, marginBottom: 16 }}>
            <Link
              to="#investment"
              style={{
                background: "rgb(196,132,122)", color: "#fff", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase", padding: "16px 36px",
                borderRadius: "100px", boxShadow: "rgba(196,132,122,0.3) 0px 8px 32px",
                textDecoration: "none", display: "inline-block", fontFamily: "Montserrat, sans-serif",
              }}
            >
              Begin Your Blueprint +
            </Link>
            <button
              onClick={() => document.getElementById("experts")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 500,
                letterSpacing: "0.16em", textTransform: "uppercase", padding: "15px 36px",
                borderRadius: "100px", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Explore The Programme
            </button>
          </div>

          {/* i) Fine print */}
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.05em" }}>
            30-day completion guarantee · No credit card required to begin
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-9 border-2 border-white/40 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── 3. SCROLLING BANNER (placeholder) ── */}
      <div style={{ background: "#C4847A", padding: "16px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap" }}>
          {["Psychology", "Money & Wealth", "Nervous System", "Identity", "Leadership", "Relationships", "Health & Hormones"].map((t, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff", fontFamily: "Montserrat, sans-serif", whiteSpace: "nowrap" }}>
              {t} <span style={{ opacity: 0.5 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── 4. EXPERTS (placeholder) ── */}
      <section id="experts" style={{ background: "#FAF5F3", padding: "clamp(64px,8vw,120px) clamp(24px,5vw,80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4847A", marginBottom: 16, fontFamily: "Montserrat, sans-serif" }}>Our Specialists</p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(32px, 5vw, 56px)", color: "#6B1B3D", marginBottom: 12 }}>
            14 World-Class Experts
          </h2>
          <p style={{ fontSize: 16, color: "#888", marginBottom: 48, fontFamily: "Montserrat, sans-serif" }}>Expert profiles coming soon.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid rgba(107,27,61,0.08)" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#C4847A,#6B1B3D)", margin: "0 auto 12px" }} />
                <div style={{ height: 12, background: "#F5E6E0", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 10, background: "#F5E6E0", borderRadius: 6, width: "60%", margin: "0 auto" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. COURSE FRAMEWORK (placeholder) ── */}
      <section style={{ background: "#0d0205", padding: "clamp(64px,8vw,120px) clamp(24px,5vw,80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4847A", marginBottom: 16, fontFamily: "Montserrat, sans-serif" }}>Programme Structure</p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(32px, 5vw, 56px)", color: "#fff", marginBottom: 12 }}>
            Seven Domains. One System.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 48, fontFamily: "Montserrat, sans-serif" }}>Full course framework coming soon.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
            {["Mindset & Behaviour", "Nervous System", "Health & Hormones", "Money", "Leadership & Authority", "Relationships", "Identity & Visibility"].map((d, i) => (
              <div key={i} style={{ padding: "28px 24px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "left" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(196,132,122,0.6)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif", marginBottom: 10 }}>0{i + 1}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "Montserrat, sans-serif" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. WHO THIS IS FOR (placeholder) ── */}
      <section style={{ background: "#F5E6E0", padding: "clamp(64px,8vw,120px) clamp(24px,5vw,80px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4847A", marginBottom: 16, fontFamily: "Montserrat, sans-serif" }}>Is This For You?</p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(32px, 5vw, 56px)", color: "#6B1B3D", marginBottom: 24 }}>
            This programme is for the woman who…
          </h2>
          <div style={{ display: "grid", gap: 12, textAlign: "left", maxWidth: 640, margin: "0 auto" }}>
            {[
              "Has achieved everything she was supposed to want, but still feels empty",
              "Is burning out and doesn't know why",
              "Wants to understand her body, her patterns, and her power",
              "Is ready to stop performing and start living authentically",
              "Knows she is capable of more — she just needs the right tools",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#C4847A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>✓</span>
                </span>
                <p style={{ fontSize: 15, color: "#3A2A28", lineHeight: 1.6, fontFamily: "Montserrat, sans-serif" }}>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. INVESTMENT (placeholder) ── */}
      <section id="investment" style={{ background: "#6B1B3D", padding: "clamp(64px,8vw,120px) clamp(24px,5vw,80px)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(196,132,122,0.8)", marginBottom: 16, fontFamily: "Montserrat, sans-serif" }}>Your Investment</p>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(32px, 5vw, 52px)", color: "#fff", marginBottom: 12 }}>
            Founding Member Price
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 32, fontFamily: "Montserrat, sans-serif" }}>
            Full pricing details and payment plans coming soon.
          </p>
          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(196,132,122,0.3)", borderRadius: 16, padding: "40px 32px", marginBottom: 24 }}>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "clamp(48px, 8vw, 80px)", color: "#C4847A", lineHeight: 1, marginBottom: 8 }}>R3,997</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif", marginBottom: 24 }}>Founding Member Price</p>
            <Link to="#" style={{
              display: "inline-block", background: "#C4847A", color: "#fff",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              padding: "16px 40px", borderRadius: "100px", textDecoration: "none",
              fontFamily: "Montserrat, sans-serif",
            }}>
              Secure Your Place +
            </Link>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Montserrat, sans-serif" }}>30-day completion guarantee · Secure checkout</p>
        </div>
      </section>

      {/* ── 8. FAQ (placeholder) ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(64px,8vw,120px) clamp(24px,5vw,80px)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4847A", marginBottom: 16, fontFamily: "Montserrat, sans-serif" }}>Questions</p>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(32px, 5vw, 52px)", color: "#6B1B3D" }}>Frequently Asked</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              ["Who is this programme for?", "Women who are ready to do the inner and outer work — regardless of where they are starting from."],
              ["How long is the programme?", "The full Blueprint spans 7 domains over 12 weeks, with lifetime access to all content and recordings."],
              ["What if I can't attend live sessions?", "All sessions are recorded and available in your portal within 24 hours."],
              ["Is there a payment plan?", "Yes. Full payment plan details will be available at launch."],
              ["What is the 30-day guarantee?", "Complete the first module in full. If you don't feel it was worth it, we'll refund you — no questions asked."],
            ].map(([q, a], i) => (
              <FaqItem key={i} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.08)", borderRadius: 8, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "20px 24px", display: "flex", justifyContent: "space-between",
          alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "#3A2A28", fontFamily: "Montserrat, sans-serif" }}>{q}</span>
        <span style={{ fontSize: 20, color: "#C4847A", flexShrink: 0, marginLeft: 16, transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 24px 20px", fontSize: 14, color: "#6b7280", lineHeight: 1.7, fontFamily: "Montserrat, sans-serif" }}>{a}</div>
      )}
    </div>
  );
}