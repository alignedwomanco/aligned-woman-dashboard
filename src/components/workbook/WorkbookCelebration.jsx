import React from "react";
import { useNavigate } from "react-router-dom";

export default function WorkbookCelebration({ onBackToWorkbook }) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ background: "#FAF5F3" }}
    >
      <div style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
        {/* Eyebrow */}
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#C4847A",
          marginBottom: 16,
        }}>
          Workbook Complete
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "var(--aw-font-display)",
          fontWeight: 400,
          fontSize: 48,
          lineHeight: 1.05,
          color: "#4A0E2E",
          margin: "0 0 24px",
        }}>
          You have done the{" "}
          <span style={{ fontStyle: "italic", color: "#C4847A" }}>work</span>.
        </h1>

        {/* Body */}
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 400,
          fontSize: 16,
          lineHeight: 1.7,
          color: "#3A2A28",
          margin: "0 auto 32px",
          maxWidth: 540,
        }}>
          Body literacy is built through repetition. Return to this workbook in three months
          and update what has shifted. The same questions, asked at different points in your
          life, reveal different answers.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => navigate("/Dashboard")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: 100,
              background: "#4A0E2E",
              color: "#FFFFFF",
              border: "none",
              fontFamily: "var(--aw-font-sans)",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "opacity 180ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Return to Dashboard
          </button>

          <button
            onClick={onBackToWorkbook}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: 100,
              background: "transparent",
              color: "#4A0E2E",
              border: "1px solid #4A0E2E",
              fontFamily: "var(--aw-font-sans)",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 180ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(74,14,46,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Back to Workbook
          </button>
        </div>
      </div>
    </div>
  );
}