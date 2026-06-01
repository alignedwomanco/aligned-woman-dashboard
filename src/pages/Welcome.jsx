import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Welcome -- a clean, branded entry page showing the two-step sign-up flow.
 * Educates users about the process, then opens Base44's sign-in flow.
 */
export default function Welcome() {
  const [checking, setChecking] = useState(true);

  // If they are already signed in, redirect to dashboard.
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
    base44.auth.redirectToLogin(`${window.location.origin}/Dashboard`, { mode: "signup" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF5F3",
        padding: "60px 24px",
        fontFamily: "var(--aw-font-sans, sans-serif)",
      }}
    >
      {/* Header Section */}
      <div style={{ maxWidth: 820, width: "100%", textAlign: "center", marginBottom: 80 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#C4847A",
            marginBottom: 28,
            margin: 0,
          }}
        >
          ◆ THE ALIGNED WOMAN CO.
        </p>

        <h1
          style={{
            fontFamily: "var(--aw-font-display, Georgia, serif)",
            fontSize: "clamp(36px, 6vw, 56px)",
            lineHeight: 1.15,
            color: "#4A0E2E",
            marginBottom: 18,
            margin: "32px 0 28px",
            fontWeight: 700,
          }}
        >
          Creating <span style={{ color: "#C4847A", fontStyle: "italic" }}>your</span> account
        </h1>

        <p
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            lineHeight: 1.7,
            color: "#3A2A28",
            maxWidth: 500,
            margin: "0 auto 32px",
          }}
        >
          You've been pre-approved for The Aligned Woman Blueprint. Setting up your login takes two short steps — here's exactly what to do the first time.
        </p>

        {/* Decorative divider */}
        <div style={{ height: 1, width: 60, background: "#3A2A28", margin: "0 auto 64px" }} />
      </div>

      {/* Two-Step Flow Section */}
      {!checking && (
        <div style={{ maxWidth: 1000, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, marginBottom: 80 }}>
          {/* Step 01 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#C4847A",
                  marginBottom: 4,
                }}
              >
                01 WELCOME SCREEN
              </p>
              <h3
                style={{
                  fontFamily: "var(--aw-font-display, Georgia, serif)",
                  fontSize: "clamp(18px, 4vw, 24px)",
                  color: "#4A0E2E",
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                Click "Create Your Account"
              </h3>
            </div>

            {/* Mockup */}
            <div
              style={{
                background: "white",
                border: "1px solid #F5DDD9",
                borderRadius: 16,
                padding: 28,
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#C4847A",
                  marginBottom: 14,
                  margin: "0 0 14px",
                }}
              >
                THE ALIGNED WOMAN CO.
              </p>
              <h4
                style={{
                  fontFamily: "var(--aw-font-display, Georgia, serif)",
                  fontSize: 20,
                  color: "#4A0E2E",
                  margin: "0 0 6px",
                  fontWeight: 700,
                }}
              >
                Welcome to The Aligned <span style={{ fontStyle: "italic" }}>Woman</span> Blueprint
              </h4>
              <p
                style={{
                  fontSize: 12,
                  color: "#3A2A28",
                  margin: "0 0 20px",
                  lineHeight: 1.6,
                }}
              >
                The education you should have been given. Sign in to step into your dashboard to begin.
              </p>
              <button
                onClick={handleCreateAccount}
                style={{
                  padding: "12px 28px",
                  borderRadius: 100,
                  background: "#4A0E2E",
                  color: "white",
                  border: "2px dashed #C4847A",
                  fontFamily: "var(--aw-font-sans, sans-serif)",
                  fontWeight: 700,
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 180ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#6B1642";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#4A0E2E";
                }}
              >
                Create Your Account
              </button>
            </div>

            <p
              style={{
                fontSize: 13,
                color: "#3A2A28",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              From the welcome screen, select <strong>Create Your Account</strong>. This takes you to the sign-in page shown in step two.
            </p>

            <div style={{ fontSize: 32, color: "#C4847A" }}>→</div>
          </div>

          {/* Step 02 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#C4847A",
                  marginBottom: 4,
                }}
              >
                02 SIGN-IN SCREEN
              </p>
              <h3
                style={{
                  fontFamily: "var(--aw-font-display, Georgia, serif)",
                  fontSize: "clamp(18px, 4vw, 24px)",
                  color: "#4A0E2E",
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                Scroll down & choose "Sign up"
              </h3>
            </div>

            {/* Mockup */}
            <div
              style={{
                background: "white",
                border: "1px solid #F5DDD9",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                position: "relative",
              }}
            >
              {/* Phone frame */}
              <div
                style={{
                  background: "linear-gradient(to right, #666, #999)",
                  borderRadius: 12,
                  padding: 10,
                  aspectRatio: "9/16",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: 8,
                    padding: 20,
                    textAlign: "center",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Logo area */}
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#6E1D40" }}>AW</div>

                  {/* Login form */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#4A0E2E", margin: 0 }}>
                      Welcome to The Aligned Woman Co
                    </p>
                    <p style={{ fontSize: 10, color: "#666", margin: 0 }}>
                      Sign in to continue
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                      <button
                        style={{
                          padding: "10px",
                          borderRadius: 6,
                          background: "#F0F0F0",
                          border: "none",
                          fontSize: 10,
                          cursor: "pointer",
                          transition: "opacity 180ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        Continue with Google
                      </button>
                      <button
                        style={{
                          padding: "10px",
                          borderRadius: 6,
                          background: "#F0F0F0",
                          border: "none",
                          fontSize: 10,
                          cursor: "pointer",
                          transition: "opacity 180ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        Continue with Microsoft
                      </button>
                      <button
                        style={{
                          padding: "10px",
                          borderRadius: 6,
                          background: "#F0F0F0",
                          border: "none",
                          fontSize: 10,
                          cursor: "pointer",
                          transition: "opacity 180ms",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        Continue with Facebook
                      </button>
                    </div>

                    <div style={{ marginTop: 20, position: "relative" }}>
                      <div
                        style={{
                          background: "white",
                          border: "1px solid #C4847A",
                          borderRadius: 12,
                          padding: 10,
                          position: "absolute",
                          bottom: -60,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "85%",
                          zIndex: 10,
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#4A0E2E",
                            margin: "0 0 4px",
                          }}
                        >
                          Don't use these sign-in options
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            color: "#C4847A",
                            fontWeight: 700,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            margin: 0,
                          }}
                        >
                          You're already pre-approved
                        </p>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="your@email.com"
                      style={{
                        padding: "10px",
                        borderRadius: 6,
                        border: "1px solid #E0E0E0",
                        fontSize: 10,
                        marginTop: 60,
                      }}
                      disabled
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      style={{
                        padding: "10px",
                        borderRadius: 6,
                        border: "1px solid #E0E0E0",
                        fontSize: 10,
                      }}
                      disabled
                    />

                    <button
                      style={{
                        padding: "10px",
                        borderRadius: 6,
                        background: "#4A0E2E",
                        color: "white",
                        border: "none",
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginTop: 12,
                      }}
                    >
                      Sign in
                    </button>

                    <div style={{ display: "flex", gap: 6, justifyContent: "center", fontSize: 9, color: "#666" }}>
                      <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                        Forgot password?
                      </button>
                      <span>|</span>
                      <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer" }}>
                        Need an account? <strong>Sign up</strong>
                      </button>
                    </div>
                  </div>

                  <div />
                </div>
              </div>

              {/* Black border accent on right */}
              <div
                style={{
                  position: "absolute",
                  right: 30,
                  top: 20,
                  bottom: 20,
                  width: 4,
                  background: "black",
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Final CTA Section */}
      {!checking && (
        <div
          style={{
            maxWidth: 800,
            width: "100%",
            textAlign: "center",
            paddingTop: 60,
            borderTop: "1px solid #E8B4AE",
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: "#3A2A28",
              lineHeight: 1.7,
              margin: "0 0 28px",
            }}
          >
            Scroll to the very bottom and click <strong>Need an account? Sign up</strong>
          </p>

          <button
            onClick={handleCreateAccount}
            style={{
              padding: "16px 40px",
              borderRadius: 100,
              background: "#4A0E2E",
              color: "white",
              border: "none",
              fontFamily: "var(--aw-font-sans, sans-serif)",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 180ms ease",
              marginBottom: 24,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#6B1642")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#4A0E2E")}
          >
            Start Here
          </button>

          <p
            style={{
              fontSize: 13,
              color: "#3A2A28",
              lineHeight: 1.7,
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            Create your account here with the email you were approved under
          </p>
        </div>
      )}

      {checking && (
        <p style={{ fontFamily: "var(--aw-font-sans, sans-serif)", fontSize: 13, color: "#8A7A76" }}>
          One moment...
        </p>
      )}
    </div>
  );
}