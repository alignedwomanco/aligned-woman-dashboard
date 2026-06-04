import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
const BURG = "#4A0E2E";
const ROSE_CORE = "#C4847A";
const ROSE_DEEP = "#A86460";
const OFF_WHITE = "#FAF5F3";
const DARK_GREY = "#3A2A28";
const MID_GREY = "#8A7A76";
const BURG_DEEP = "#1A0510";
const SCREENSHOT = "https://media.base44.com/images/public/69f46886a412ee042303f1af/b65a4139a_Dontusethesesign-inoptionsYourealreadypre-approved.png";

export default function Welcome() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed && active) {
          window.location.href = `${window.location.origin}/Dashboard`;
          return;
        }
      } catch (e) {}
      if (active) setChecking(false);
    })();
    return () => { active = false; };
  }, []);

  const handleSignUp = () => {
    base44.auth.redirectToLogin(`${window.location.origin}/Dashboard`, { mode: "signup" });
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: OFF_WHITE, fontFamily: SANS }}>
        <p style={{ fontSize: 13, color: MID_GREY }}>One moment...</p>
      </div>
    );
  }

  return (
    <div style={{ background: OFF_WHITE, minHeight: "100vh", fontFamily: SANS }}>
      <div style={{
        maxWidth: 780,
        margin: "0 auto",
        padding: "clamp(48px, 7vw, 96px) clamp(22px, 5vw, 48px) clamp(72px, 9vw, 120px)",
      }}>

        {/* ── INTRO BLOCK ── */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
          <p style={{
            fontFamily: SANS, fontWeight: 700, fontSize: 10,
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: ROSE_DEEP, margin: "0 0 clamp(20px, 4vw, 32px)",
            display: "inline-flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: ROSE_DEEP, flexShrink: 0, display: "inline-block" }} />
            The Aligned Woman Co.
          </p>

          <h1 style={{
            fontFamily: SERIF, fontWeight: 400,
            fontSize: "clamp(36px, 7vw, 76px)", lineHeight: 1.1,
            color: BURG, margin: "0 0 clamp(16px, 3vw, 24px)",
          }}>
            Creating <em>your</em> account
          </h1>

          <p style={{
            fontFamily: SANS, fontWeight: 300,
            fontSize: "clamp(14px, 2.2vw, 16px)", lineHeight: 1.75,
            color: DARK_GREY, maxWidth: 520,
            margin: "0 auto clamp(24px, 4vw, 40px)",
          }}>
            You've been pre-approved for The Aligned Woman Blueprint. Here's exactly what to do on the sign-in screen the first time.
          </p>

          {/* Rose hairline rule */}
          <div style={{ height: 1, background: ROSE_CORE, width: "100%" }} />
        </div>

        {/* ── STEP BLOCK ── */}
        <div style={{ marginBottom: "clamp(24px, 4vw, 36px)" }}>
          <p style={{
            fontFamily: SERIF, fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(44px, 8vw, 68px)", lineHeight: 1,
            color: BURG, margin: "0 0 4px",
            opacity: 0.15,
          }}>
            01
          </p>
          <p style={{
            fontFamily: SANS, fontWeight: 600, fontSize: 10,
            letterSpacing: "0.26em", textTransform: "uppercase",
            color: ROSE_DEEP, margin: "0 0 8px",
          }}>
            Sign-in screen
          </p>
          <h2 style={{
            fontFamily: SERIF, fontWeight: 400,
            fontSize: "clamp(20px, 4vw, 30px)", lineHeight: 1.25,
            color: BURG, margin: "0 0 10px",
          }}>
            Scroll down &amp; choose "Sign up"
          </h2>
          <p style={{
            fontFamily: SANS, fontWeight: 300, fontSize: 13,
            color: DARK_GREY, lineHeight: 1.65, margin: 0,
          }}>
            Do not use Sign in on your first time visiting this page.
          </p>
        </div>

        {/* ── ANNOTATED SCREENSHOT ── */}
        <div style={{ maxWidth: 480, margin: "0 auto clamp(48px, 7vw, 72px)" }}>
          <img
            src={SCREENSHOT}
            alt="The Aligned Woman sign-in screen showing the Need an account? Sign up link at the bottom"
            style={{
              width: "100%", display: "block",
              borderRadius: 8,
              border: "1px solid rgba(74,14,46,0.1)",
              boxShadow: "0 8px 32px rgba(8,1,5,0.10)",
            }}
          />
        </div>

        {/* ── FOOTNOTE ── */}
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <p style={{
            fontFamily: SANS, fontWeight: 300,
            fontSize: "clamp(13px, 2vw, 15px)", lineHeight: 1.8,
            color: DARK_GREY, margin: "0 0 28px",
          }}>
            Scroll to the very bottom and click{" "}
            <strong style={{ fontWeight: 700 }}>Need an account? Sign up</strong>.
            Create your account with the email you were approved under, and you should have access.
            If this does not work, email{" "}
            <a
              href="mailto:hello@alignedwomanco.com"
              style={{ color: ROSE_CORE, fontWeight: 500, textDecoration: "none" }}
            >
              hello@alignedwomanco.com
            </a>
            {" "}for assistance.
          </p>

          <button
            onClick={handleSignUp}
            style={{
              background: ROSE_CORE, color: BURG, border: "none",
              borderRadius: 100, padding: "16px 44px",
              fontFamily: SANS, fontWeight: 700,
              fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
              cursor: "pointer", minHeight: 50,
              transition: "background 180ms ease, color 180ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = BURG;
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ROSE_CORE;
              e.currentTarget.style.color = BURG;
            }}
          >
            Sign up now
          </button>
        </div>

      </div>
    </div>
  );
}