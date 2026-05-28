import React, { useMemo } from "react";

const FONT_SANS = "var(--aw-font-sans, 'Montserrat', sans-serif)";
const FONT_DISPLAY = "var(--aw-font-display, 'DM Serif Display', serif)";
const BURG = "var(--aw-burg-core, #4A0E2E)";
const ROSE = "var(--aw-rose-core, #C4847A)";
const DARK = "var(--aw-dark-grey, #3A2A2A)";

const STAGE_COLORS = ["#5A8C6A", "#8A9C3A", "#C49A3A", "#B35A3A", "#4A0E2E"];

function getFooterMessage(stageIndex) {
  if (stageIndex <= 1) return "Naming where you are is the first act of self-honesty. You have capacity to build from here.";
  if (stageIndex === 2) return "You are in the zone where intervention makes the most difference.";
  return "Your body is asking you to stop. Go gently.";
}

export default function BurnoutStageField({ field, answers, onAnswerChange }) {
  const fieldId = field.id || field.field_id;
  const options = field.options || [];

  const rawValue = answers?.[fieldId];
  const selectedId = useMemo(() => {
    if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
      return Object.keys(rawValue).find(k => rawValue[k]) || null;
    }
    return null;
  }, [rawValue]);

  const handleSelect = (optionId) => {
    if (selectedId === optionId) {
      onAnswerChange(fieldId, {});
    } else {
      onAnswerChange(fieldId, { [optionId]: true });
    }
  };

  const selectedIndex = selectedId ? options.findIndex(o => (o.id || o.value) === selectedId) : -1;
  const stageColor = selectedIndex >= 0 ? STAGE_COLORS[Math.min(selectedIndex, STAGE_COLORS.length - 1)] : BURG;
  const footerMessage = selectedIndex >= 0 ? getFooterMessage(selectedIndex) : null;

  return (
    <div>
      {field.label && (
        <p style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 15, color: BURG, margin: "0 0 4px" }}>
          {field.label}
        </p>
      )}
      {field.prompt && (
        <p style={{ fontFamily: FONT_SANS, fontWeight: 400, fontSize: 14, fontStyle: "italic", color: ROSE, margin: "0 0 16px" }}>
          {field.prompt}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt, idx) => {
          const optId = opt.id || opt.value;
          const isSelected = selectedId === optId;
          const color = STAGE_COLORS[Math.min(idx, STAGE_COLORS.length - 1)];
          const dotCount = idx + 1;

          return (
            <button
              key={optId}
              onClick={() => handleSelect(optId)}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "14px 16px",
                border: isSelected ? `2px solid ${color}` : "1.5px solid rgba(74,14,46,0.1)",
                borderRadius: 12,
                background: isSelected ? `${color}0D` : "#fff",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                width: "100%",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Numbered circle */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                  background: isSelected ? color : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_SANS,
                  fontWeight: 700,
                  fontSize: 13,
                  color: isSelected ? "#fff" : color,
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}>
                  {idx + 1}
                </div>

                {/* Stage name */}
                <span style={{
                  flex: 1,
                  fontFamily: FONT_SANS,
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: 15,
                  color: isSelected ? BURG : DARK,
                  lineHeight: 1.4,
                }}>
                  {opt.label}
                </span>

                {/* Severity dots */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: i < dotCount ? color : "rgba(74,14,46,0.12)",
                      transition: "background 0.15s ease",
                    }} />
                  ))}
                </div>
              </div>

              {/* Description (expanded when selected) */}
              {isSelected && opt.description && (
                <p style={{
                  fontFamily: FONT_SANS,
                  fontWeight: 300,
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: DARK,
                  margin: "12px 0 0 44px",
                }}>
                  {opt.description}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Contextual footer */}
      {footerMessage && (
        <div style={{
          marginTop: 16,
          padding: "14px 18px",
          borderRadius: 10,
          background: `${stageColor}0D`,
          border: `1px solid ${stageColor}30`,
        }}>
          <p style={{
            fontFamily: FONT_SANS,
            fontWeight: 400,
            fontSize: 14,
            fontStyle: "italic",
            color: stageColor,
            margin: 0,
            lineHeight: 1.6,
          }}>
            {footerMessage}
          </p>
        </div>
      )}
    </div>
  );
}