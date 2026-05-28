import React from "react";

/**
 * MappedQuizField — checkbox_group with subtype="mapped_quiz"
 * Options may be objects { id, label } or plain strings.
 * Stores answers as { [optionId]: true } (same format as CheckboxGroupField).
 */
export default function MappedQuizField({ field, answers, onAnswerChange }) {
  const checked = answers[field.id] || {};

  const normalizedOptions = (field.options || []).map((opt, idx) => {
    if (typeof opt === "string") return { id: `opt_${idx}`, label: opt };
    return { id: opt.id || `opt_${idx}`, label: opt.label || opt.id };
  });

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    if (!next[id]) delete next[id];
    onAnswerChange(field.id, next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {field.label && (
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 600,
          fontSize: 15,
          color: "var(--aw-burg-core)",
          margin: 0,
        }}>
          {field.label}
        </p>
      )}
      {field.prompt && (
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 300,
          fontSize: 14,
          color: "var(--aw-mid-grey)",
          margin: 0,
        }}>
          {field.prompt}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {normalizedOptions.map(({ id, label }) => {
          const isChecked = !!checked[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 10,
                border: `1.5px solid ${isChecked ? "var(--aw-burg-core)" : "rgba(74,14,46,0.14)"}`,
                background: isChecked ? "var(--aw-rose-pale)" : "#fff",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 140ms ease",
              }}
            >
              {/* Checkbox indicator */}
              <div style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `2px solid ${isChecked ? "var(--aw-burg-core)" : "rgba(74,14,46,0.25)"}`,
                background: isChecked ? "var(--aw-burg-core)" : "transparent",
                flexShrink: 0,
                marginTop: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 140ms ease",
              }}>
                {isChecked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{
                fontFamily: "var(--aw-font-sans)",
                fontWeight: isChecked ? 500 : 400,
                fontSize: 14,
                lineHeight: 1.5,
                color: isChecked ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}