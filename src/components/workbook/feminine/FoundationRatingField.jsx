import { useState } from "react";

const OPTIONS = [
  { label: "Not in place", val: 0, color: "#dc2626", bg: "#fef2f2" },
  { label: "Started but inconsistent", val: 0.5, color: "#d97706", bg: "#fffbeb" },
  { label: "Solid and working", val: 1, color: "#16a34a", bg: "#f0fdf4" },
];

export default function FoundationRatingField({ field, value, onChange }) {
  // value: { itemId: 0 | 0.5 | 1 }
  const ratings = (typeof value === "object" && !Array.isArray(value) && value !== null) ? value : {};
  const [priority, setPriority] = useState(null);
  const [actionText, setActionText] = useState("");

  const setRating = (itemId, val) => {
    onChange({ ...ratings, [itemId]: val });
  };

  const items = field.items || [];

  // Items not yet rated solid (gaps)
  const gapItems = items.filter(item => ratings[item.id] !== 1);

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

      {/* 3-state rating cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {items.map(item => {
          const current = ratings[item.id];
          return (
            <div key={item.id} style={{
              border: "1px solid var(--aw-border-rose)", borderRadius: "var(--aw-radius-md)",
              padding: "16px 18px", background: "var(--aw-white)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 14, color: "var(--aw-dark-grey)", lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {item.text}
                </p>
                {item.category && (
                  <span style={{
                    fontFamily: "var(--aw-font-sans)", fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: "var(--aw-radius-pill)",
                    background: "var(--aw-rose-pale)", color: "var(--aw-burg-core)",
                    flexShrink: 0,
                  }}>
                    {item.category}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {OPTIONS.map(opt => {
                  const selected = current === opt.val;
                  return (
                    <button
                      key={opt.val}
                      onClick={() => setRating(item.id, opt.val)}
                      style={{
                        padding: "6px 14px", borderRadius: "var(--aw-radius-pill)",
                        border: selected ? `1.5px solid var(--aw-burg-core)` : "1px solid var(--aw-border-rose)",
                        background: selected ? "var(--aw-burg-core)" : "var(--aw-off-white)",
                        color: selected ? "#fff" : "var(--aw-mid-grey)",
                        fontFamily: "var(--aw-font-sans)", fontWeight: selected ? 700 : 400,
                        fontSize: 12, cursor: "pointer", transition: "all 150ms ease",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gap section */}
      {gapItems.length > 0 && (
        <div style={{ border: "1px solid var(--aw-border-rose)", borderRadius: "var(--aw-radius-md)", padding: "20px 22px", background: "var(--aw-rose-wash)" }}>
          <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--aw-burg-core)", margin: "0 0 14px" }}>
            Your Gaps — Select Your Priority
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {gapItems.map(item => {
              const isSelected = priority === item.id;
              const rating = ratings[item.id];
              const isStarted = rating === 0.5;
              return (
                <button
                  key={item.id}
                  onClick={() => setPriority(isSelected ? null : item.id)}
                  style={{
                    textAlign: "left", padding: "12px 16px",
                    borderRadius: "var(--aw-radius-md)",
                    border: isSelected ? "1.5px solid var(--aw-burg-core)" : "1px solid var(--aw-border-rose)",
                    background: isSelected ? "var(--aw-rose-pale)" : "var(--aw-white)",
                    cursor: "pointer", transition: "all 150ms ease",
                    display: "flex", alignItems: "center", gap: 12,
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    border: isSelected ? "2px solid var(--aw-burg-core)" : "1px solid var(--aw-border-rose)",
                    background: isSelected ? "var(--aw-burg-core)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isSelected && <span style={{ color: "#fff", fontSize: 8, lineHeight: 1 }}>●</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--aw-font-sans)", fontSize: 13, color: "var(--aw-dark-grey)", lineHeight: 1.5, margin: "0 0 3px" }}>
                      {item.text}
                    </p>
                    <span style={{
                      fontFamily: "var(--aw-font-sans)", fontSize: 9, fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: isStarted ? "#d97706" : rating === 0 ? "#dc2626" : "var(--aw-mid-grey)",
                    }}>
                      {isStarted ? "Started but inconsistent" : rating === 0 ? "Not in place" : "Not yet rated"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {priority && (
            <div>
              <label style={{
                display: "block", fontFamily: "var(--aw-font-display)", fontStyle: "italic",
                fontSize: 17, fontWeight: 400, color: "var(--aw-burg-core)", marginBottom: 8, lineHeight: 1.3,
              }}>
                What is the specific first step you will take, and what has stopped you from doing it until now?
              </label>
              <textarea
                value={actionText}
                onChange={e => setActionText(e.target.value)}
                placeholder="Be specific..."
                rows={4}
                style={{
                  width: "100%", padding: "14px 16px",
                  borderRadius: "var(--aw-radius-md)",
                  border: "1px solid var(--aw-border-rose)",
                  background: "var(--aw-white)",
                  fontFamily: "var(--aw-font-sans)", fontSize: 15,
                  color: "var(--aw-dark-grey)", lineHeight: 1.65,
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "var(--aw-burg-core)"}
                onBlur={e => e.target.style.borderColor = "var(--aw-border-rose)"}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}