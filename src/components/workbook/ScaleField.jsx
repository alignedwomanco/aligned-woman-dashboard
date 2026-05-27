import React from "react";

/**
 * Scale field — renders a row of selectable numbered buttons (scale_min → scale_max)
 * with anchor text below each. Saves the selected number to answers[field.id].
 */
export default function ScaleField({ field, answers, onAnswerChange }) {
  const min = field.scale_min ?? 1;
  const max = field.scale_max ?? 5;
  const anchors = field.anchors || {};
  const selected = answers[field.id] ?? null;
  const steps = [];
  for (let i = min; i <= max; i++) steps.push(i);

  return (
    <div style={{ marginBottom: 4 }}>
      {field.state_label && (
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--aw-rose-core)",
          margin: "0 0 6px",
        }}>
          {field.state_label}
        </p>
      )}
      {field.prompt && (
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 500,
          fontSize: 15,
          lineHeight: 1.65,
          color: "var(--aw-burg-core)",
          margin: "0 0 18px",
        }}>
          {field.prompt}
        </p>
      )}

      {/* Button row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
        gap: 8,
      }}>
        {steps.map((n) => {
          const isSelected = selected === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onAnswerChange?.(field.id, n)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "14px 6px 12px",
                borderRadius: 12,
                border: isSelected
                  ? "2px solid var(--aw-burg-core)"
                  : "1.5px solid rgba(74,14,46,0.14)",
                background: isSelected
                  ? "var(--aw-rose-pale)"
                  : "var(--aw-white)",
                cursor: "pointer",
                transition: "all 160ms ease",
                boxShadow: isSelected
                  ? "0 0 0 3px rgba(74,14,46,0.08)"
                  : "none",
              }}
            >
              {/* Number */}
              <span style={{
                fontFamily: "var(--aw-font-display)",
                fontWeight: 400,
                fontSize: 26,
                lineHeight: 1,
                color: isSelected ? "var(--aw-burg-core)" : "var(--aw-rose-deep)",
                transition: "color 160ms ease",
              }}>
                {n}
              </span>
              {/* Anchor text */}
              {anchors[String(n)] && (
                <span style={{
                  fontFamily: "var(--aw-font-sans)",
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: 10,
                  lineHeight: 1.45,
                  color: isSelected ? "var(--aw-burg-core)" : "var(--aw-mid-grey)",
                  textAlign: "center",
                  transition: "color 160ms ease, font-weight 160ms ease",
                }}>
                  {anchors[String(n)]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}