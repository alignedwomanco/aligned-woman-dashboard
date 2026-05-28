import React, { useMemo } from "react";

/**
 * MappedQuizField
 *
 * Renders a checkbox_group where each option maps to a survival response
 * (fight / flight / freeze / fawn). Selected items show their response tag.
 * After 3+ selections, a pattern profile result card appears.
 *
 * Props:
 *   field       - schema field object with options[].maps_to and result_config
 *   answers     - current answers object
 *   onAnswerChange(fieldId, value) - callback to update answers
 */

/* ── Response metadata ────────────────────────────────── */
const RESPONSE_META = {
  fight:  { label: "Fight",  emoji: "🔥", color: "#B33A3A", bg: "rgba(179,58,58,0.08)",  border: "rgba(179,58,58,0.25)",  desc: "Moving toward threat to stop it or regain control" },
  flight: { label: "Flight", emoji: "💨", color: "#2B6EA8", bg: "rgba(43,110,168,0.08)",  border: "rgba(43,110,168,0.25)", desc: "Staying busy because slowing down does not feel safe" },
  freeze: { label: "Freeze", emoji: "🧊", color: "#5A6B7D", bg: "rgba(90,107,125,0.08)",  border: "rgba(90,107,125,0.25)", desc: "Shutting down when the system is overwhelmed" },
  fawn:   { label: "Fawn",   emoji: "🤝", color: "#C47A2A", bg: "rgba(196,122,42,0.08)",  border: "rgba(196,122,42,0.25)", desc: "Maintaining safety through pleasing and over-giving" },
};

/* ── Interpretation text based on dominant response ───── */
const INTERPRETATIONS = {
  fight: "Your strongest pattern is Fight. Under pressure, your system moves toward the threat: controlling, pushing through, reacting. This is not aggression. It is a nervous system that learned early that the only way to stay safe was to stay in charge. The work ahead is learning that you can let go of control without losing safety.",
  flight: "Your strongest pattern is Flight. Under pressure, your system moves: busyness, perfectionism, avoidance, constant motion. This is not productivity. It is a nervous system that cannot slow down because stillness does not feel safe. The work ahead is learning that you can stop without falling apart.",
  freeze: "Your strongest pattern is Freeze. Under pressure, your system shuts down: fog, numbness, paralysis, disconnection. This is not laziness. It is a nervous system that learned to conserve energy when everything else felt too dangerous. The work ahead is gentle reactivation, not pushing through, but slowly showing your system it is safe to come back online.",
  fawn: "Your strongest pattern is Fawn. Under pressure, your system accommodates: people-pleasing, boundary collapse, losing yourself in others' needs. This is not kindness. It is a nervous system that learned the only way to stay safe was to keep everyone else happy. The work ahead is learning that your needs are not negotiable, and that boundaries are not betrayal.",
};

/* ── Styles ────────────────────────────────────────────── */
const FONT_SANS = "var(--aw-font-sans, 'DM Sans', sans-serif)";
const FONT_DISPLAY = "var(--aw-font-display, 'Playfair Display', serif)";
const BURG = "var(--aw-burg-core, #4A0E2E)";
const ROSE = "var(--aw-rose-core, #C4847A)";
const DARK = "var(--aw-dark-grey, #3A2A2A)";

export default function MappedQuizField({ field, answers, onAnswerChange }) {
  const fieldId = field.id || field.field_id;
  const options = field.options || [];
  const resultConfig = field.result_config || {};
  const minForResult = resultConfig.min_selections_for_result || 3;

  // Current selections (handle both object and array format)
  const rawValue = answers?.[fieldId];
  const selectedIds = useMemo(() => {
    if (Array.isArray(rawValue)) return rawValue;
    if (rawValue && typeof rawValue === "object") return Object.keys(rawValue).filter(k => rawValue[k]);
    return [];
  }, [rawValue]);

  // Toggle handler
  const handleToggle = (optionId) => {
    let next;
    if (selectedIds.includes(optionId)) {
      next = selectedIds.filter(id => id !== optionId);
    } else {
      next = [...selectedIds, optionId];
    }
    // Store as object format to match Base44 workbook convention
    const obj = {};
    next.forEach(id => { obj[id] = true; });
    onAnswerChange(fieldId, obj);
  };

  // Tally responses
  const tally = useMemo(() => {
    const counts = { fight: 0, flight: 0, freeze: 0, fawn: 0 };
    selectedIds.forEach(id => {
      const opt = options.find(o => (o.id || o.value) === id);
      if (opt?.maps_to && counts.hasOwnProperty(opt.maps_to)) {
        counts[opt.maps_to]++;
      }
    });
    return counts;
  }, [selectedIds, options]);

  // Sorted results
  const sortedResults = useMemo(() => {
    return Object.entries(tally)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [tally]);

  const showResult = selectedIds.length >= minForResult && sortedResults.length > 0;
  const dominantKey = sortedResults.length > 0 ? sortedResults[0][0] : null;
  const dominantMeta = dominantKey ? RESPONSE_META[dominantKey] : null;

  return (
    <div>
      {/* Label */}
      {field.label && (
        <p style={{
          fontFamily: FONT_SANS,
          fontWeight: 700,
          fontSize: 15,
          color: BURG,
          margin: "0 0 4px",
        }}>
          {field.label}
        </p>
      )}

      {/* Prompt */}
      {field.prompt && (
        <p style={{
          fontFamily: FONT_SANS,
          fontWeight: 400,
          fontSize: 14,
          fontStyle: "italic",
          color: ROSE,
          margin: "0 0 16px",
        }}>
          {field.prompt}
        </p>
      )}

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map((opt) => {
          const optId = opt.id || opt.value;
          const isSelected = selectedIds.includes(optId);
          const mapsTo = opt.maps_to;
          const meta = mapsTo ? RESPONSE_META[mapsTo] : null;

          return (
            <button
              key={optId}
              onClick={() => handleToggle(optId)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 16px",
                border: isSelected && meta
                  ? `2px solid ${meta.border}`
                  : "1.5px solid rgba(74,14,46,0.1)",
                borderRadius: 10,
                background: isSelected && meta ? meta.bg : "#fff",
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
                border: isSelected && meta
                  ? `2px solid ${meta.color}`
                  : "1.5px solid rgba(74,14,46,0.2)",
                background: isSelected && meta ? meta.color : "transparent",
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

              {/* Label */}
              <span style={{ flex: 1 }}>{opt.label}</span>

              {/* Response tag (visible when selected) */}
              {isSelected && meta && (
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 10px",
                  borderRadius: 100,
                  background: meta.color,
                  color: "#fff",
                  fontFamily: FONT_SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}>
                  {meta.emoji} {meta.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection counter */}
      {selectedIds.length > 0 && selectedIds.length < minForResult && (
        <p style={{
          fontFamily: FONT_SANS,
          fontSize: 13,
          color: ROSE,
          margin: "12px 0 0",
          textAlign: "center",
        }}>
          {selectedIds.length} selected — {minForResult - selectedIds.length} more to see your pattern profile
        </p>
      )}

      {/* ── Result Card ──────────────────────────────────── */}
      {showResult && dominantMeta && (
        <div style={{
          marginTop: 24,
          borderRadius: 14,
          overflow: "hidden",
          border: `2px solid ${dominantMeta.border}`,
          background: "#fff",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 24px",
            background: dominantMeta.bg,
            borderBottom: `1px solid ${dominantMeta.border}`,
          }}>
            <p style={{
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: dominantMeta.color,
              margin: "0 0 4px",
            }}>
              Your Pattern Profile
            </p>
            <p style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 400,
              fontSize: 22,
              color: BURG,
              margin: 0,
              lineHeight: 1.2,
            }}>
              Primary: {dominantMeta.emoji} {dominantMeta.label}
              {sortedResults.length > 1 && (
                <span style={{ fontSize: 16, color: DARK, fontWeight: 300 }}>
                  {" "}with {RESPONSE_META[sortedResults[1][0]]?.label} secondary
                </span>
              )}
            </p>
          </div>

          {/* Tally bars */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {sortedResults.map(([key, count]) => {
                const meta = RESPONSE_META[key];
                const pct = (count / Math.max(selectedIds.length, 1)) * 100;
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{meta.emoji}</span>
                    <span style={{
                      fontFamily: FONT_SANS,
                      fontSize: 13,
                      fontWeight: 600,
                      color: meta.color,
                      width: 50,
                      flexShrink: 0,
                    }}>
                      {meta.label}
                    </span>
                    <div style={{ flex: 1, height: 8, background: "rgba(74,14,46,0.06)", borderRadius: 100 }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: meta.color,
                        borderRadius: 100,
                        transition: "width 0.4s ease",
                        minWidth: pct > 0 ? 8 : 0,
                      }} />
                    </div>
                    <span style={{
                      fontFamily: FONT_SANS,
                      fontSize: 13,
                      fontWeight: 700,
                      color: meta.color,
                      width: 20,
                      textAlign: "right",
                      flexShrink: 0,
                    }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Interpretation */}
            {dominantKey && INTERPRETATIONS[dominantKey] && (
              <p style={{
                fontFamily: FONT_SANS,
                fontWeight: 300,
                fontSize: 15,
                lineHeight: 1.85,
                color: DARK,
                margin: 0,
              }}>
                {INTERPRETATIONS[dominantKey]}
              </p>
            )}
          </div>

          {/* Footer note */}
          <div style={{
            padding: "14px 24px",
            background: "rgba(74,14,46,0.03)",
            borderTop: "1px solid rgba(74,14,46,0.06)",
          }}>
            <p style={{
              fontFamily: FONT_SANS,
              fontWeight: 400,
              fontSize: 13,
              fontStyle: "italic",
              color: ROSE,
              margin: 0,
              lineHeight: 1.6,
            }}>
              These are not flaws. They are strategies your nervous system learned to keep you safe. Recognising them is the first step toward choosing differently.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}