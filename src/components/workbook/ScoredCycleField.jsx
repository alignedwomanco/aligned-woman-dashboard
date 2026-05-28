import React, { useMemo } from "react";

const FONT_SANS = "var(--aw-font-sans, 'Montserrat', sans-serif)";
const FONT_DISPLAY = "var(--aw-font-display, 'DM Serif Display', serif)";
const BURG = "var(--aw-burg-core, #4A0E2E)";
const ROSE = "var(--aw-rose-core, #C4847A)";
const DARK = "var(--aw-dark-grey, #3A2A2A)";

const MIN_FOR_RESULT = 2;

function getScoreColor(score) {
  if (score <= 3) return "#5A8C6A";
  if (score <= 8) return "#C49A3A";
  if (score <= 12) return "#B35A3A";
  return "#4A0E2E";
}

export default function ScoredCycleField({ field, answers, onAnswerChange }) {
  const fieldId = field.id || field.field_id;
  const options = field.options || [];
  const thresholds = field.scoring?.thresholds || [];

  const rawValue = answers?.[fieldId];
  const selectedIds = useMemo(() => {
    if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
      return Object.keys(rawValue).filter(k => rawValue[k]);
    }
    if (Array.isArray(rawValue)) return rawValue;
    return [];
  }, [rawValue]);

  const handleToggle = (optionId) => {
    const next = selectedIds.includes(optionId)
      ? selectedIds.filter(id => id !== optionId)
      : [...selectedIds, optionId];
    const obj = {};
    next.forEach(id => { obj[id] = true; });
    onAnswerChange(fieldId, obj);
  };

  const totalScore = useMemo(() => {
    return selectedIds.reduce((sum, id) => {
      const opt = options.find(o => (o.id || o.value) === id);
      return sum + (opt?.weight || 0);
    }, 0);
  }, [selectedIds, options]);

  const maxScore = useMemo(() => {
    return options.reduce((sum, opt) => sum + (opt.weight || 0), 0);
  }, [options]);

  const activeThreshold = useMemo(() => {
    if (!thresholds.length) return null;
    const sorted = [...thresholds].sort((a, b) => a.max - b.max);
    return sorted.find(t => totalScore <= t.max) || sorted[sorted.length - 1];
  }, [totalScore, thresholds]);

  const showResult = selectedIds.length >= MIN_FOR_RESULT;
  const scoreColor = getScoreColor(totalScore);
  const scorePct = maxScore > 0 ? Math.min((totalScore / maxScore) * 100, 100) : 0;

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

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map((opt) => {
          const optId = opt.id || opt.value;
          const isSelected = selectedIds.includes(optId);
          const weight = opt.weight || 0;

          return (
            <button
              key={optId}
              onClick={() => handleToggle(optId)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 16px",
                border: isSelected
                  ? `2px solid ${scoreColor}`
                  : "1.5px solid rgba(74,14,46,0.1)",
                borderRadius: 10,
                background: isSelected ? `${scoreColor}10` : "#fff",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: FONT_SANS,
                fontSize: 15,
                fontWeight: 300,
                color: DARK,
                lineHeight: 1.5,
                transition: "all 0.15s ease",
                width: "100%",
              }}
            >
              {/* Checkbox */}
              <span style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: isSelected ? `2px solid ${scoreColor}` : "1.5px solid rgba(74,14,46,0.2)",
                background: isSelected ? scoreColor : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}>
                {isSelected ? "✓" : ""}
              </span>

              <span style={{ flex: 1 }}>{opt.label}</span>

              {/* Weight badge */}
              {isSelected && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: 100,
                  background: scoreColor,
                  color: "#fff",
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  flexShrink: 0,
                }}>
                  +{weight}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Counter nudge */}
      {selectedIds.length > 0 && selectedIds.length < MIN_FOR_RESULT && (
        <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: ROSE, margin: "12px 0 0", textAlign: "center" }}>
          {MIN_FOR_RESULT - selectedIds.length} more selection{MIN_FOR_RESULT - selectedIds.length !== 1 ? "s" : ""} to see your result
        </p>
      )}

      {/* Result card */}
      {showResult && (
        <div style={{
          marginTop: 24,
          borderRadius: 14,
          overflow: "hidden",
          border: `2px solid ${scoreColor}40`,
          background: "#fff",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 24px",
            background: `${scoreColor}10`,
            borderBottom: `1px solid ${scoreColor}30`,
          }}>
            <p style={{
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: scoreColor,
              margin: "0 0 4px",
            }}>
              Your Score
            </p>
            <p style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 400,
              fontSize: 22,
              color: BURG,
              margin: 0,
              lineHeight: 1.2,
            }}>
              {activeThreshold?.label || `Score: ${totalScore}`}
              <span style={{ fontSize: 15, color: DARK, fontWeight: 300, marginLeft: 10 }}>
                ({totalScore} / {maxScore})
              </span>
            </p>
          </div>

          {/* Score bar */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ height: 12, background: "rgba(74,14,46,0.06)", borderRadius: 100, overflow: "hidden", marginBottom: 8 }}>
              <div style={{
                height: "100%",
                width: `${scorePct}%`,
                background: `linear-gradient(to right, #5A8C6A, #C49A3A, #B35A3A, #4A0E2E)`,
                borderRadius: 100,
                transition: "width 0.4s ease",
                minWidth: scorePct > 0 ? 12 : 0,
              }} />
            </div>

            {/* Threshold zone labels */}
            {thresholds.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                {[...thresholds].sort((a, b) => a.max - b.max).map((t, i) => (
                  <span key={i} style={{
                    fontFamily: FONT_SANS,
                    fontSize: 10,
                    fontWeight: activeThreshold?.label === t.label ? 700 : 400,
                    color: activeThreshold?.label === t.label ? scoreColor : "rgba(74,14,46,0.4)",
                    textAlign: "center",
                  }}>
                    {t.label}
                  </span>
                ))}
              </div>
            )}

            {/* Message */}
            {activeThreshold?.message && (
              <p style={{
                fontFamily: FONT_SANS,
                fontWeight: 300,
                fontSize: 15,
                lineHeight: 1.85,
                color: DARK,
                margin: 0,
              }}>
                {activeThreshold.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}