import React, { useMemo } from "react";

/**
 * Renders a cta_row field: horizontal row of pill buttons.
 * Stacks vertically at ≤480px.
 *
 * Schema shape:
 * {
 *   id, type: "cta_row",
 *   layout: "centered" | "start",
 *   buttons: [
 *     { label, style: "primary"|"secondary", action: { type, target?, value? } }
 *   ]
 * }
 *
 * Supported actions:
 *   { type: "navigate", target: "section", value: "<section_id>" }
 *   { type: "print" }
 */
export default function CtaRowField({ field, sections, onJumpToSection }) {
  const layout = field.layout || "centered";
  const justifyClass = layout === "start" ? "justify-start" : "justify-center";

  const handleAction = (action) => {
    if (!action) return;
    if (action.type === "print") {
      window.print();
      return;
    }
    if (action.type === "navigate" && action.target === "section" && action.value) {
      // Find section index by id
      if (sections && onJumpToSection) {
        const idx = sections.findIndex((s) => s.id === action.value);
        if (idx >= 0) onJumpToSection(idx);
      }
      return;
    }
  };

  // Unique ID for scoped responsive styles
  const scopeId = useMemo(() => `cta-${field.id}`, [field.id]);

  const btnBase = {
    fontFamily: "var(--aw-font-sans)",
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    padding: "14px 28px",
    borderRadius: 100,
    cursor: "pointer",
    lineHeight: 1,
    whiteSpace: "nowrap",
    transition: "all 180ms ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const styles = {
    primary: {
      ...btnBase,
      background: "#C4847A",
      color: "#FFFFFF",
      border: "1px solid #C4847A",
    },
    secondary: {
      ...btnBase,
      background: "transparent",
      color: "#4A0E2E",
      border: "1px solid rgba(74,14,46,0.22)",
    },
  };

  return (
    <>
      <div id={scopeId} className={`flex flex-wrap ${justifyClass}`} style={{ gap: 12 }}>
        {field.buttons?.map((btn, idx) => (
          <button
            key={idx}
            style={styles[btn.style] || styles.primary}
            onClick={() => handleAction(btn.action)}
            onMouseEnter={(e) => {
              if (btn.style === "primary") {
                e.currentTarget.style.background = "#4A0E2E";
                e.currentTarget.style.borderColor = "#4A0E2E";
              } else {
                e.currentTarget.style.background = "var(--aw-rose-wash)";
                e.currentTarget.style.borderColor = "rgba(196,132,122,0.25)";
              }
            }}
            onMouseLeave={(e) => {
              if (btn.style === "primary") {
                e.currentTarget.style.background = "#C4847A";
                e.currentTarget.style.borderColor = "#C4847A";
              } else {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(74,14,46,0.22)";
              }
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
      {/* Stack vertically at ≤480px */}
      <style>{`
        @media (max-width: 480px) {
          #${scopeId} { flex-direction: column; }
          #${scopeId} button { width: 100%; }
        }
      `}</style>
    </>
  );
}