import React from "react";

export default function FemFieldRenderer({ field, value, onChange }) {
  const { type, variant } = field;

  // ── Content Blocks ──────────────────────────────────────────────────────────
  if (type === "content_block") {
    if (variant === "subheading") {
      return (
        <h3 style={{
          fontFamily: "var(--aw-font-display)", fontWeight: 400,
          fontSize: 22, color: "var(--aw-burg-core)", margin: 0, lineHeight: 1.3,
        }}>
          {field.body}
        </h3>
      );
    }
    if (variant === "body") {
      return (
        <p style={{
          fontFamily: "var(--aw-font-sans)", fontSize: 15,
          color: "var(--aw-dark-grey)", lineHeight: 1.75, margin: 0, whiteSpace: "pre-line",
        }}>
          {field.body}
        </p>
      );
    }
    if (variant === "callout") {
      return (
        <div style={{
          border: "1px solid var(--aw-border-rose)",
          borderRadius: "var(--aw-radius-md)",
          padding: "20px 24px",
          background: "var(--aw-rose-wash)",
        }}>
          {field.attribution && (
            <p style={{
              fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 9,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--aw-burg-core)", margin: "0 0 10px",
            }}>
              {field.attribution}
            </p>
          )}
          <p style={{
            fontFamily: "var(--aw-font-sans)", fontSize: 15,
            color: "var(--aw-dark-grey)", lineHeight: 1.7, margin: 0,
          }}>
            {field.body}
          </p>
        </div>
      );
    }
    if (variant === "quote") {
      return (
        <div style={{
          borderLeft: "3px solid var(--aw-rose-core)",
          paddingLeft: 24,
          margin: "8px 0",
        }}>
          <p style={{
            fontFamily: "var(--aw-font-display)", fontSize: 22, fontStyle: "italic",
            color: "var(--aw-burg-core)", lineHeight: 1.55, margin: "0 0 10px",
          }}>
            "{field.body}"
          </p>
          {field.attribution && (
            <p style={{
              fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 9,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--aw-rose-deep)", margin: 0,
            }}>
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
          <label style={{
            display: "block", fontFamily: "var(--aw-font-display)", fontStyle: "italic",
            fontSize: 20, fontWeight: 400, color: "var(--aw-burg-core)", marginBottom: 6, lineHeight: 1.2,
          }}>
            {field.label}
          </label>
        )}
        {field.prompt && (
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "var(--aw-mid-grey)", lineHeight: 1.65, margin: "0 0 12px" }}>
            {field.prompt}
          </p>
        )}
        <textarea
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          rows={field.min_rows || 4}
          style={{
            width: "100%", padding: "14px 16px",
            borderRadius: "var(--aw-radius-md)",
            border: "1px solid var(--aw-border-rose)",
            background: "var(--aw-white)",
            fontFamily: "var(--aw-font-sans)", fontSize: 15,
            color: "var(--aw-dark-grey)", lineHeight: 1.65,
            resize: "vertical", outline: "none",
            transition: "border-color 180ms ease", boxSizing: "border-box",
          }}
          onFocus={e => e.target.style.borderColor = "var(--aw-burg-core)"}
          onBlur={e => e.target.style.borderColor = "var(--aw-border-rose)"}
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
          <label style={{
            display: "block", fontFamily: "var(--aw-font-display)", fontStyle: "italic",
            fontSize: 20, fontWeight: 400, color: "var(--aw-burg-core)", marginBottom: 6, lineHeight: 1.2,
          }}>
            {field.label}
          </label>
        )}
        {field.prompt && (
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "var(--aw-mid-grey)", lineHeight: 1.65, margin: "0 0 16px" }}>
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
                style={{
                  width: 40, height: 40, borderRadius: "var(--aw-radius-sm)",
                  border: selected ? "1.5px solid var(--aw-burg-core)" : "1px solid var(--aw-border-rose)",
                  background: selected ? "var(--aw-burg-core)" : "var(--aw-white)",
                  color: selected ? "var(--aw-white)" : "var(--aw-burg-core)",
                  fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", transition: "all 180ms ease", flexShrink: 0,
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
        {field.anchors && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--aw-font-sans)", fontSize: 11, color: "var(--aw-mid-grey)" }}>{field.anchors[min]}</span>
            <span style={{ fontFamily: "var(--aw-font-sans)", fontSize: 11, color: "var(--aw-mid-grey)" }}>{field.anchors[max]}</span>
          </div>
        )}
        {feedback && (
          <div style={{ background: severityBg[feedback.severity] || "var(--aw-rose-wash)", border: `1px solid ${severityColor[feedback.severity] || "#ccc"}33`, borderRadius: "var(--aw-radius-md)", padding: "12px 16px" }}>
            <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: severityColor[feedback.severity] || "var(--aw-mid-grey)", margin: "0 0 4px" }}>
              {feedback.label}
            </p>
            <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, margin: 0 }}>
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
          <label style={{
            display: "block", fontFamily: "var(--aw-font-display)", fontStyle: "italic",
            fontSize: 20, fontWeight: 400, color: "var(--aw-burg-core)", marginBottom: 6, lineHeight: 1.2,
          }}>
            {field.label}
          </label>
        )}
        {field.prompt && (
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "var(--aw-mid-grey)", lineHeight: 1.65, margin: "0 0 14px" }}>
            {field.prompt}
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {field.items?.map(item => {
            const isChecked = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  textAlign: "left", padding: "14px 16px",
                  borderRadius: "var(--aw-radius-md)",
                  border: isChecked ? "1.5px solid var(--aw-burg-core)" : "1px solid var(--aw-border-rose)",
                  background: isChecked ? "var(--aw-rose-wash)" : "var(--aw-white)",
                  cursor: "pointer", transition: "all 180ms ease",
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: isChecked ? "2px solid var(--aw-burg-core)" : "1px solid var(--aw-border-rose)",
                  background: isChecked ? "var(--aw-burg-core)" : "transparent",
                  flexShrink: 0, marginTop: 2,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isChecked && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, margin: "0 0 6px" }}>
                    {item.text}
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{
                      fontFamily: "var(--aw-font-sans)", fontSize: 9, fontWeight: 700,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      padding: "2px 8px", borderRadius: "var(--aw-radius-pill)",
                      background: "var(--aw-rose-pale)", color: "var(--aw-burg-core)",
                    }}>
                      {item.category}
                    </span>
                    {item.severity && (
                      <span style={{
                        fontFamily: "var(--aw-font-sans)", fontSize: 9, fontWeight: 700,
                        letterSpacing: "0.18em", textTransform: "uppercase",
                        padding: "2px 8px", borderRadius: "var(--aw-radius-pill)",
                        background: sevBg[item.severity] || "#f9f9f9",
                        color: sevText[item.severity] || "#666",
                      }}>
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
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 11, color: "var(--aw-rose-deep)", marginTop: 10, fontStyle: "italic" }}>
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
          <label style={{
            display: "block", fontFamily: "var(--aw-font-display)", fontStyle: "italic",
            fontSize: 20, fontWeight: 400, color: "var(--aw-burg-core)", marginBottom: 12, lineHeight: 1.2,
          }}>
            {field.label}
          </label>
        )}
        {field.prompt && (
          <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "var(--aw-mid-grey)", lineHeight: 1.65, margin: "0 0 14px" }}>
            {field.prompt}
          </p>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--aw-font-sans)" }}>
            <thead>
              <tr>
                {cols.map(col => (
                  <th key={col.id || col} style={{
                    padding: "10px 12px", background: "var(--aw-rose-pale)",
                    color: "var(--aw-burg-core)", fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    textAlign: "left", border: "1px solid var(--aw-border-rose)",
                  }}>
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
                        <td key={colId} style={{ padding: 4, border: "1px solid var(--aw-border-light)", verticalAlign: "top" }}>
                          <input
                            type="text"
                            value={gridVal[cellKey] || ""}
                            onChange={e => updateCell(rowId, colId, e.target.value)}
                            style={{
                              width: "100%", padding: "8px 10px", border: "none",
                              background: "var(--aw-white)", fontFamily: "var(--aw-font-sans)",
                              fontSize: 14, color: "var(--aw-dark-grey)",
                              outline: "none", boxSizing: "border-box",
                            }}
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