import React from "react";

const MAROON = "#6B1B3D";
const CREAM = "#FAF7F4";

export default function FemFieldRenderer({ field, value, onChange }) {
  const { type, variant } = field;

  // ── Content Blocks ──────────────────────────────────────────────────────────
  if (type === "content_block") {
    if (variant === "subheading") {
      return (
        <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontWeight: 700, color: MAROON, margin: 0, lineHeight: 1.3 }}>
          {field.body}
        </h3>
      );
    }
    if (variant === "body") {
      return (
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 16, color: "#4a3a35", lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>
          {field.body}
        </p>
      );
    }
    if (variant === "callout") {
      return (
        <div style={{ background: "#F5F0EB", borderLeft: `3px solid ${MAROON}`, borderRadius: "0 8px 8px 0", padding: "18px 20px" }}>
          {field.attribution && (
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: `${MAROON}99`, margin: "0 0 8px" }}>
              {field.attribution}
            </p>
          )}
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#3a2a28", lineHeight: 1.7, margin: 0 }}>
            {field.body}
          </p>
        </div>
      );
    }
    if (variant === "quote") {
      return (
        <div style={{ background: MAROON, borderRadius: 12, padding: "28px 28px 22px" }}>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontStyle: "italic", color: CREAM, lineHeight: 1.55, margin: "0 0 14px" }}>
            "{field.body}"
          </p>
          {field.attribution && (
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(250,247,244,0.65)", margin: 0 }}>
              — {field.attribution}
            </p>
          )}
        </div>
      );
    }
    return null;
  }

  // ── Long Text ────────────────────────────────────────────────────────────────
  if (type === "long_text") {
    return (
      <div>
        {field.label && (
          <label style={{ display: "block", fontFamily: "Cormorant Garamond, serif", fontSize: 18, fontWeight: 700, color: MAROON, marginBottom: 6 }}>
            {field.label}
          </label>
        )}
        {field.prompt && (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#7a6a66", lineHeight: 1.65, margin: "0 0 12px" }}>
            {field.prompt}
          </p>
        )}
        <textarea
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          rows={field.min_rows || 4}
          style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: `1px solid rgba(107,27,61,0.18)`, background: "#FFFDFB", fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#2a1a18", lineHeight: 1.65, resize: "vertical", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = MAROON}
          onBlur={e => e.target.style.borderColor = "rgba(107,27,61,0.18)"}
        />
      </div>
    );
  }

  // ── Scale ────────────────────────────────────────────────────────────────────
  if (type === "scale") {
    const min = field.scale_min || 1;
    const max = field.scale_max || 10;
    const nums = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    const cf = field.conditional_feedback || {};
    // Find matching feedback: exact key, then closest key <= value
    let feedback = null;
    if (value !== undefined && value !== null) {
      const keys = Object.keys(cf).map(Number).sort((a, b) => a - b);
      let matchKey = null;
      for (const k of keys) { if (k <= value) matchKey = k; }
      if (matchKey !== null) feedback = cf[matchKey];
    }
    const severityColor = { red: "#dc2626", amber: "#d97706", green: "#16a34a" };
    const severityBg = { red: "#fef2f2", amber: "#fffbeb", green: "#f0fdf4" };

    return (
      <div>
        {field.label && (
          <label style={{ display: "block", fontFamily: "Cormorant Garamond, serif", fontSize: 18, fontWeight: 700, color: MAROON, marginBottom: 6 }}>
            {field.label}
          </label>
        )}
        {field.prompt && (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#7a6a66", lineHeight: 1.65, margin: "0 0 16px" }}>
            {field.prompt}
          </p>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {nums.map(n => {
            const selected = value === n;
            return (
              <button
                key={n}
                onClick={() => onChange(n)}
                style={{ width: 40, height: 40, borderRadius: 8, border: `1.5px solid ${selected ? MAROON : "rgba(107,27,61,0.2)"}`, background: selected ? MAROON : "#FFFDFB", color: selected ? "#fff" : MAROON, fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
              >
                {n}
              </button>
            );
          })}
        </div>
        {field.anchors && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "#8a7a76" }}>{field.anchors[min]}</span>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "#8a7a76" }}>{field.anchors[max]}</span>
          </div>
        )}
        {feedback && (
          <div style={{ background: severityBg[feedback.severity] || "#f9f9f9", border: `1px solid ${severityColor[feedback.severity] || "#ccc"}33`, borderRadius: 8, padding: "12px 16px" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: severityColor[feedback.severity] || "#666", margin: "0 0 4px" }}>
              {feedback.label}
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#3a2a28", lineHeight: 1.6, margin: 0 }}>
              {feedback.msg}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Diagnostic Checklist ─────────────────────────────────────────────────────
  if (type === "diagnostic_checklist") {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (id) => {
      if (selected.includes(id)) onChange(selected.filter(x => x !== id));
      else onChange([...selected, id]);
    };
    const sevBg = { high: "#fef2f2", medium: "#fffbeb", low: "#f0fdf4" };
    const sevText = { high: "#dc2626", medium: "#d97706", low: "#16a34a" };

    return (
      <div>
        {field.label && (
          <label style={{ display: "block", fontFamily: "Cormorant Garamond, serif", fontSize: 18, fontWeight: 700, color: MAROON, marginBottom: 6 }}>
            {field.label}
          </label>
        )}
        {field.prompt && (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#7a6a66", lineHeight: 1.65, margin: "0 0 14px" }}>
            {field.prompt}
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {field.items?.map(item => {
            const isChecked = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{ textAlign: "left", padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${isChecked ? MAROON : "rgba(107,27,61,0.15)"}`, background: isChecked ? "rgba(107,27,61,0.05)" : "#FFFDFB", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isChecked ? MAROON : "rgba(107,27,61,0.3)"}`, background: isChecked ? MAROON : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isChecked && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#2a1a18", lineHeight: 1.6, margin: "0 0 6px" }}>
                    {item.text}
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 100, background: "rgba(107,27,61,0.07)", color: MAROON }}>
                      {item.category}
                    </span>
                    {item.severity && (
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 100, background: sevBg[item.severity] || "#f9f9f9", color: sevText[item.severity] || "#666" }}>
                        {item.severity}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: `${MAROON}99`, marginTop: 10 }}>
            {selected.length} pattern{selected.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    );
  }

  // ── Grid ─────────────────────────────────────────────────────────────────────
  if (type === "grid") {
    const cols = field.columns || [];
    const rows = field.rows || Array.from({ length: field.num_rows || 3 }, (_, i) => `row_${i}`);
    const gridVal = value || {};
    const updateCell = (rowId, colId, v) => {
      onChange({ ...gridVal, [`${rowId}_${colId}`]: v });
    };

    return (
      <div>
        {field.label && (
          <label style={{ display: "block", fontFamily: "Cormorant Garamond, serif", fontSize: 18, fontWeight: 700, color: MAROON, marginBottom: 12 }}>
            {field.label}
          </label>
        )}
        {field.prompt && (
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#7a6a66", lineHeight: 1.65, margin: "0 0 14px" }}>
            {field.prompt}
          </p>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "DM Sans, sans-serif" }}>
            <thead>
              <tr>
                {cols.map(col => (
                  <th key={col.id || col} style={{ padding: "10px 12px", background: "rgba(107,27,61,0.06)", color: MAROON, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "left", border: `1px solid rgba(107,27,61,0.12)` }}>
                    {col.label || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const rowId = row.id || `row_${ri}`;
                return (
                  <tr key={rowId}>
                    {cols.map(col => {
                      const colId = col.id || col;
                      const cellKey = `${rowId}_${colId}`;
                      return (
                        <td key={colId} style={{ padding: 6, border: `1px solid rgba(107,27,61,0.1)`, verticalAlign: "top" }}>
                          <input
                            type="text"
                            value={gridVal[cellKey] || ""}
                            onChange={e => updateCell(rowId, colId, e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "none", background: "#FFFDFB", fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#2a1a18", outline: "none", boxSizing: "border-box" }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}