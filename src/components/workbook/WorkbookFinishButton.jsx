import React from "react";

/**
 * Renders either the FINISH WORKBOOK button or a "Completed on ..." indicator
 * depending on the current completion state.
 */
export default function WorkbookFinishButton({ isComplete, completedAt, onFinish, onMarkInProgress }) {
  if (isComplete) {
    const formatted = completedAt
      ? new Date(completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : "—";

    return (
      <div className="mt-10" data-field-type="cta_row">
      <p style={{
        fontFamily: "var(--aw-font-sans)",
        fontSize: 13,
        color: "var(--aw-mid-grey)",
        marginBottom: 16,
        lineHeight: 1.6,
      }}>
        Your answers are automatically saved to your dashboard. You can return any time to continue or update them.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <span style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--aw-burg-core)",
        }}>
          Completed on {formatted}
        </span>
        <button
          onClick={onMarkInProgress}
          style={{
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 600,
            fontSize: 12,
            color: "#C4847A",
            background: "none",
            border: "none",
            textDecoration: "underline",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Mark as in progress
        </button>
      </div>
      </div>
    );
  }

  return (
    <div className="mt-10" data-field-type="cta_row">
      <p style={{
        fontFamily: "var(--aw-font-sans)",
        fontSize: 13,
        color: "var(--aw-mid-grey)",
        marginBottom: 16,
        lineHeight: 1.6,
      }}>
        Your answers are automatically saved to your dashboard. You can return any time to continue or update them.
      </p>
      <button
        onClick={onFinish}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 28px",
          borderRadius: 100,
          background: "#C4847A",
          color: "#FFFFFF",
          border: "none",
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "background 180ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#4A0E2E")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#C4847A")}
      >
        Finish Workbook
      </button>
    </div>
  );
}