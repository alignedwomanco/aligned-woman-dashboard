import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Welcome -- a clean, branded entry page to email to members you have added.
 * It brands the welcome, then opens Base44's own sign-in (where the enabled
 * email/password, Microsoft, Apple and Facebook options appear), and returns
 * the member to the dashboard once they are signed in.
 */
export default function Welcome() {
  const [checking, setChecking] = useState(true);

  // If they are already signed in, do not make them sign in again.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed && active) {
          window.location.href = `${window.location.origin}/Dashboard`;
          return;
        }
      } catch (e) {
        // fall through to the welcome screen
      }
      if (active) setChecking(false);
    })();
    return () => { active = false; };
  }, []);

  const handleCreateAccount = () => {
    base44.auth.redirectToLogin(`${window.location.origin}/Dashboard`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF5F3",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--aw-font-sans, sans-serif)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#C4847A",
            marginBottom: 22,
          }}
        >
          The Aligned Woman Co.
        </p>

        <h1
          style={{
            fontFamily: "var(--aw-font-display, Georgia, serif)",
            fontSize: 42,
            lineHeight: 1.12,
            color: "#4A0E2E",
            margin: "0 0 18px",
          }}
        >
          Welcome to The Aligned{" "}
          <span style={{ fontStyle: "italic" }}>Woman</span> Blueprint
        </h1>

        <p
          style={{
            fontFamily: "var(--aw-font-sans, sans-serif)",
            fontSize: 16,
            lineHeight: 1.7,
            color: "#3A2A28",
            margin: "0 auto 34px",
            maxWidth: 430,
          }}
        >
          The education you should have been given. Sign in to step into your dashboard and begin.
        </p>

        {checking ? (
          <p style={{ fontFamily: "var(--aw-font-sans, sans-serif)", fontSize: 13, color: "#8A7A76" }}>
            One moment...
          </p>
        ) : (
          <>
            <button
              onClick={handleCreateAccount}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 42px",
                borderRadius: 100,
                background: "var(--aw-burg-core)",
                color: "var(--aw-white)",
                border: "none",
                fontFamily: "var(--aw-font-sans, sans-serif)",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "opacity 180ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Create Your Account
            </button>

            <p
              style={{
                fontFamily: "var(--aw-font-sans, sans-serif)",
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--aw-mid-grey)",
                margin: "22px auto 0",
                maxWidth: 390,
              }}
            >
              On the next screen, scroll to the bottom and click <strong>"Need an account? Sign up"</strong> to create your account for the first time.
            </p>
          </>
        )}
      </div>
    </div>
  );
}