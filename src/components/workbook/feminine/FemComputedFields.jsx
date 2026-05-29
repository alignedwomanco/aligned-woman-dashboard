import React from "react";

const MAROON = "#6B1B3D";
const CREAM = "#FAF7F4";

// ── Helpers ────────────────────────────────────────────────────────────────────
function computeEnergyData(answers, allSections) {
  const mascIds = Array.isArray(answers.s02_wounded_masc) ? answers.s02_wounded_masc : [];
  const femIds = Array.isArray(answers.s02_wounded_fem) ? answers.s02_wounded_fem : [];

  const s02 = allSections?.find(s => s.section_id === "s02_energy_honest");
  const mascField = s02?.fields?.find(f => f.field_id === "s02_wounded_masc");
  const femField = s02?.fields?.find(f => f.field_id === "s02_wounded_fem");

  const mascItems = (mascField?.items || []).filter(i => mascIds.includes(i.id));
  const femItems = (femField?.items || []).filter(i => femIds.includes(i.id));

  const mascHighCount = mascItems.filter(i => i.severity === "high").length;
  const femHighCount = femItems.filter(i => i.severity === "high").length;

  const catCount = {};
  [...mascItems, ...femItems].forEach(i => {
    catCount[i.category] = (catCount[i.category] || 0) + 1;
  });
  const topCategories = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);

  const masc = mascIds.length;
  const fem = femIds.length;
  let dominant = "mixed";
  if (masc > fem + 2) dominant = "masculine";
  else if (fem > masc + 2) dominant = "feminine";

  return { masc, fem, mascHighCount, femHighCount, topCategories, dominant, hasData: masc > 0 || fem > 0 };
}

// ── A. Energy Portrait ─────────────────────────────────────────────────────────
function EnergyPortrait({ field, answers, allSections }) {
  const { masc, fem, mascHighCount, femHighCount, topCategories, dominant, hasData } = computeEnergyData(answers, allSections);

  const total = masc + fem || 1;
  const mascPct = Math.round((masc / total) * 100);

  const narratives = {
    masculine: "Your business is running primarily on wounded masculine energy. You are getting results, but at a cost to your body, your relationships, and your joy. The structure is not the problem. The relentlessness is.",
    feminine: "Wounded feminine energy is the primary pattern here. You have the vision and the feeling, but the follow-through and the financial accountability are where things dissolve. Boundaries and money are the doorways.",
    mixed: "You are carrying both patterns in roughly equal measure. This is common among high-achieving women who know something is off but cannot name exactly what. Both energies need attention, and integration is the work.",
  };

  if (!hasData) {
    return (
      <div style={{ background: "#f5f0eb", border: `1px dashed rgba(107,27,61,0.2)`, borderRadius: 12, padding: "24px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#8a7a76", margin: 0 }}>
          Complete the diagnostic checklists above to see your energy portrait.
        </p>
      </div>
    );
  }

  const dominantLabel = dominant === "masculine" ? "Wounded Masculine Dominant" : dominant === "feminine" ? "Wounded Feminine Dominant" : "Mixed Energy Pattern";
  const dominantColor = dominant === "masculine" ? "#1e3a5f" : dominant === "feminine" ? "#6B1B3D" : "#5a3a2a";
  const dominantBg = dominant === "masculine" ? "#e8f0fb" : dominant === "feminine" ? "#f5e6ec" : "#f5ece6";

  return (
    <div style={{ background: "#f9f5f2", borderRadius: 14, padding: "24px 24px", border: `1px solid rgba(107,27,61,0.1)` }}>
      {field.label && (
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: `${MAROON}99`, margin: "0 0 16px" }}>
          {field.label}
        </p>
      )}

      {/* Dominant badge */}
      <div style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: 100, background: dominantBg, marginBottom: 20 }}>
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: dominantColor }}>
          {dominantLabel}
        </span>
      </div>

      {/* Split bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: "#1e3a5f" }}>Masculine ({masc})</span>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, color: MAROON }}>Feminine ({fem})</span>
        </div>
        <div style={{ height: 10, background: "#e8d8dc", borderRadius: 100, overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${mascPct}%`, background: "#1e3a5f", transition: "width 0.5s ease" }} />
          <div style={{ flex: 1, background: MAROON }} />
        </div>
      </div>

      {/* Severity counts */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, background: "#fef2f2", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 20, fontWeight: 700, color: "#dc2626", margin: "0 0 2px" }}>{mascHighCount + femHighCount}</p>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "#dc2626", margin: 0 }}>High severity</p>
        </div>
        {topCategories.length > 0 && (
          <div style={{ flex: 2, background: "rgba(107,27,61,0.05)", borderRadius: 8, padding: "10px 14px" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: `${MAROON}80`, margin: "0 0 6px" }}>Top affected areas</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {topCategories.map(c => (
                <span key={c} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "rgba(107,27,61,0.1)", color: MAROON }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Narrative */}
      <div style={{ borderTop: `1px solid rgba(107,27,61,0.1)`, paddingTop: 16 }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#3a2a28", lineHeight: 1.7, margin: 0 }}>
          {narratives[dominant]}
        </p>
      </div>
    </div>
  );
}

// ── B. Foundation Score ────────────────────────────────────────────────────────
function FoundationScore({ field, answers }) {
  const selected = Array.isArray(answers.s07_structures) ? answers.s07_structures : [];
  const count = selected.length;
  const total = 7;
  const pct = Math.round((count / total) * 100);

  const tier = count >= 5 ? "green" : count >= 3 ? "amber" : "red";
  const tierColors = { green: { bg: "#f0fdf4", text: "#16a34a", bar: "#16a34a" }, amber: { bg: "#fffbeb", text: "#d97706", bar: "#d97706" }, red: { bg: "#fef2f2", text: "#dc2626", bar: "#dc2626" } };
  const c = tierColors[tier];

  const feedbackMap = field.feedback || {
    green: "You have a strong structural foundation. The work now is about elevating the quality and intentionality of each structure.",
    amber: "You are partway there. The gaps in your foundation are costing you more than you realise — in energy, in trust, and in results.",
    red: "You are building on sand. Without these structures, your business is entirely dependent on your personal effort. That is not sustainable.",
  };

  return (
    <div style={{ background: c.bg, borderRadius: 12, padding: "22px 22px", border: `1px solid ${c.text}22` }}>
      {field.label && (
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: `${MAROON}80`, margin: "0 0 12px" }}>
          {field.label}
        </p>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 48, fontWeight: 700, color: c.text, lineHeight: 1 }}>{count}</span>
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#6b5550" }}>of {total} in place</span>
      </div>
      <div style={{ height: 6, background: `${c.text}22`, borderRadius: 100, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: c.bar, borderRadius: 100, transition: "width 0.5s ease" }} />
      </div>
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#3a2a28", lineHeight: 1.7, margin: 0 }}>
        {feedbackMap[tier]}
      </p>
    </div>
  );
}

// ── C. Reference Back ──────────────────────────────────────────────────────────
function ReferenceBack({ field, answers }) {
  const sourceField = field.source_field || "s01_feminine_leadership_def";
  const text = answers[sourceField];

  if (!text || !text.trim()) {
    return (
      <div style={{ padding: "20px 20px", border: "1.5px dashed rgba(107,27,61,0.2)", borderRadius: 10, background: "#f9f5f2" }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#a09090", fontStyle: "italic", margin: 0 }}>
          {field.empty_placeholder || "You will see your earlier answer here once you complete Part One."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {field.label && (
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: `${MAROON}80`, margin: "0 0 12px" }}>
          {field.label}
        </p>
      )}
      <div style={{ background: "#F5F0EB", borderLeft: `3px solid ${MAROON}`, borderRadius: "0 10px 10px 0", padding: "18px 20px" }}>
        <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, fontStyle: "italic", color: "#3a2a28", lineHeight: 1.65, margin: 0 }}>
          "{text}"
        </p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: `${MAROON}70`, margin: "10px 0 0" }}>
          Your words from Part One
        </p>
      </div>
    </div>
  );
}

// ── D. Closing Snapshot ────────────────────────────────────────────────────────
function Snapshot({ field, answers, allSections }) {
  const { masc, fem, dominant, topCategories } = computeEnergyData(answers, allSections);
  const energyScale = answers.s04_energy_scale;
  const intuitionScale = answers.s05_intuition_scale;
  const tankVal = answers.s06_tank;
  const structCount = (answers.s07_structures || []).length;
  const startingDef = answers.s01_feminine_leadership_def;

  const dominantLabel = dominant === "masculine" ? "Wounded Masculine Dominant" : dominant === "feminine" ? "Wounded Feminine Dominant" : "Mixed Energy Pattern";

  const vitalColor = (val) => {
    if (!val) return "#8a7a76";
    if (val >= 7) return "#16a34a";
    if (val >= 4) return "#d97706";
    return "#dc2626";
  };

  const foundationColor = structCount >= 5 ? "#16a34a" : structCount >= 3 ? "#d97706" : "#dc2626";

  return (
    <div style={{ background: MAROON, borderRadius: 16, padding: "36px 30px" }}>
      {/* Header */}
      <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(250,247,244,0.6)", margin: "0 0 10px" }}>
        Your Power Snapshot
      </p>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 30, fontStyle: "italic", color: CREAM, margin: "0 0 32px", lineHeight: 1.2 }}>
        Building From Feminine Power
      </h2>

      {/* Energy Portrait */}
      <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(250,247,244,0.15)" }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(250,247,244,0.55)", margin: "0 0 10px" }}>
          Energy Portrait
        </p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, fontWeight: 700, color: CREAM, margin: "0 0 6px" }}>{dominantLabel}</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(250,247,244,0.75)", margin: "0 0 10px" }}>
          {masc} masculine · {fem} feminine patterns identified
        </p>
        {topCategories.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {topCategories.map(c => (
              <span key={c} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "rgba(250,247,244,0.12)", color: CREAM }}>{c}</span>
            ))}
          </div>
        )}
      </div>

      {/* Three vitals */}
      <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(250,247,244,0.15)" }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(250,247,244,0.55)", margin: "0 0 14px" }}>
          Three Vitals
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { label: "Sales Energy", val: energyScale, max: 10 },
            { label: "Intuition Trust", val: intuitionScale, max: 10 },
            { label: "Energy Tank", val: tankVal, max: 10 },
          ].map(v => (
            <div key={v.label} style={{ background: "rgba(250,247,244,0.1)", borderRadius: 10, padding: "14px 14px", textAlign: "center" }}>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 32, fontWeight: 700, color: v.val ? CREAM : "rgba(250,247,244,0.3)", margin: "0 0 4px", lineHeight: 1 }}>
                {v.val || "–"}
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,247,244,0.6)", margin: "0 0 8px" }}>
                {v.label}
              </p>
              {v.val && (
                <div style={{ height: 3, background: "rgba(250,247,244,0.15)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(v.val / v.max) * 100}%`, height: "100%", background: vitalColor(v.val), borderRadius: 2 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Foundation */}
      <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid rgba(250,247,244,0.15)" }}>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(250,247,244,0.55)", margin: "0 0 10px" }}>
          Foundation Score
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 40, fontWeight: 700, color: CREAM, lineHeight: 1 }}>{structCount}</span>
          <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(250,247,244,0.7)" }}>of 7 structures in place</span>
        </div>
        <div style={{ height: 4, background: "rgba(250,247,244,0.15)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${(structCount / 7) * 100}%`, height: "100%", background: foundationColor, borderRadius: 2, transition: "width 0.5s" }} />
        </div>
      </div>

      {/* Starting definition */}
      {startingDef && (
        <div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(250,247,244,0.55)", margin: "0 0 10px" }}>
            Your Starting Definition
          </p>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 17, fontStyle: "italic", color: "rgba(250,247,244,0.85)", lineHeight: 1.65, margin: 0 }}>
            "{startingDef.length > 300 ? startingDef.slice(0, 300) + "…" : startingDef}"
          </p>
        </div>
      )}
    </div>
  );
}

const FemComputedFields = { EnergyPortrait, FoundationScore, ReferenceBack, Snapshot };
export default FemComputedFields;