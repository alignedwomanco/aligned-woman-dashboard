import React, { useRef, useState } from "react";
import TickListField from "./TickListField";
import CtaRowField from "./CtaRowField";

/**
 * Renders a single field from the workbook schema.
 * Receives answers (object), onAnswerChange (callback), and sectionFields (all fields in section).
 * Optional: sections (all workbook sections) and onJumpToSection (callback) for cta_row navigation.
 * Optional: assets (array from schema.assets) for resolving content_block image references.
 */
export default function WorkbookFieldRenderer({ field, answers = {}, onAnswerChange, sectionFields = [], sections, onJumpToSection, assets = [] }) {
  switch (field.type) {
    case "content_block":
      return <ContentBlockField field={field} assets={assets} />;
    case "callout":
      return <CalloutField field={field} answers={answers} onAnswerChange={onAnswerChange} sectionFields={sectionFields} />;
    case "quote":
      return <QuoteField field={field} />;
    case "numbered_list":
      return <NumberedListField field={field} answers={answers} onAnswerChange={onAnswerChange} />;
    case "checkbox_group":
      return <CheckboxGroupField field={field} answers={answers} onAnswerChange={onAnswerChange} />;
    case "long_text":
    case "short_text":
      return <TextInputField field={field} answers={answers} onAnswerChange={onAnswerChange} />;
    case "grid":
      /* FIX 1: Route grid to StructuredListPlaceholder which supports
         columns with key, fixed_label, min_rows, max_rows, prefilled_examples */
      return <StructuredListPlaceholder field={field} answers={answers} onAnswerChange={onAnswerChange} />;
    case "structured_list":
      return <StructuredListPlaceholder field={field} answers={answers} onAnswerChange={onAnswerChange} />;
    case "tick_list":
      return <TickListField field={field} />;
    case "cta_row":
      return <CtaRowField field={field} sections={sections} onJumpToSection={onJumpToSection} />;
    default:
      return null;
  }
}

/* ─── Content Block ─── */

function ContentBlockField({ field, assets }) {
  const variant = field.variant || "body";

  /* FIX 2: Handle callout variant inside content_block */
  if (variant === "callout") {
    const paragraphs = (field.body || "").split("\n\n").filter(Boolean);
    return (
      <div style={{
        borderRadius: 12,
        padding: "16px 20px",
        backgroundColor: "#FDF5F3",
        border: "1px solid #E8C9C0",
      }}>
        {field.attribution && (
          <p style={{
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#C4847A",
            margin: "0 0 8px",
          }}>
            {field.attribution}
          </p>
        )}
        {paragraphs.map((p, i) => (
          <p key={i} style={{
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 300,
            fontSize: 14,
            lineHeight: 1.8,
            color: "#3a3a3a",
            margin: i < paragraphs.length - 1 ? "0 0 10px" : 0,
            whiteSpace: "pre-line",
          }}>
            {p}
          </p>
        ))}
      </div>
    );
  }

  /* FIX 3: Handle quote variant inside content_block */
  if (variant === "quote") {
    return (
      <blockquote style={{
        borderLeft: "4px solid #C4847A",
        paddingLeft: 20,
        paddingTop: 12,
        paddingBottom: 12,
        margin: "16px 0",
      }}>
        <p style={{
          fontFamily: "var(--aw-font-display, Georgia, serif)",
          fontWeight: 400,
          fontSize: 18,
          fontStyle: "italic",
          lineHeight: 1.6,
          color: "#4A0E2E",
          margin: 0,
        }}>
          "{field.body}"
        </p>
        {field.attribution && (
          <footer style={{
            marginTop: 8,
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#C4847A",
          }}>
            {field.attribution}
          </footer>
        )}
      </blockquote>
    );
  }

  if (variant === "image") {
    // Resolve asset_key to URL
    let imageUrl = field.image_url || "";
    if (field.asset_key && assets?.length) {
      const match = assets.find((a) => a.key === field.asset_key);
      if (match?.url) imageUrl = match.url;
    }

    if (!imageUrl) {
      return (
        <div className="flex items-center justify-center py-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-400">Image not available ({field.asset_key || "no key"})</p>
        </div>
      );
    }

    return (
      <figure className="my-2">
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <img
            src={imageUrl}
            alt={field.caption || ""}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
        {(field.caption || field.attribution) && (
          <figcaption className="mt-2.5 text-center">
            {field.caption && (
              <p style={{
                fontFamily: "var(--aw-font-sans)",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--aw-rose-core, #C4847A)",
                margin: 0,
              }}>
                {field.caption}
              </p>
            )}
            {field.attribution && (
              <p style={{
                fontFamily: "var(--aw-font-sans)",
                fontWeight: 300,
                fontSize: 11,
                fontStyle: "italic",
                color: "#8A7A76",
                margin: "4px 0 0",
              }}>
                {field.attribution}
              </p>
            )}
          </figcaption>
        )}
      </figure>
    );
  }

  if (variant === "subheading") {
    return (
      <h2 style={{
        fontFamily: "var(--aw-font-display, Georgia, serif)",
        fontWeight: 400,
        fontSize: "clamp(24px, 3.2vw, 34px)",
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
        color: "var(--aw-burg-core, #4A0E2E)",
        margin: "8px 0 4px",
        fontStyle: "italic",
      }}>
        {field.body}
      </h2>
    );
  }

  // variant === "body" (default)
  // Supports newlines as paragraph breaks
  const paragraphs = (field.body || "").split("\n\n").filter(Boolean);

  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            fontFamily: "var(--aw-font-sans, sans-serif)",
            fontWeight: 300,
            fontSize: 15,
            lineHeight: 1.85,
            color: "var(--aw-dark-grey, #3a3a3a)",
            margin: 0,
            whiteSpace: "pre-line",
          }}
        >
          {p}
        </p>
      ))}
    </div>
  );
}

/* ─── Condition evaluator ─── */

function getCheckedCount(fieldId, answers) {
  const val = answers[fieldId];
  if (!val || typeof val !== "object") return 0;
  return Object.values(val).filter(Boolean).length;
}

function evaluateComparison(a, comparison, b) {
  switch (comparison) {
    case "greater_than": return a > b;
    case "greater_than_or_equal_to": return a >= b;
    case "less_than": return a < b;
    case "less_than_or_equal_to": return a <= b;
    case "equal_to": return a === b;
    default: return false;
  }
}

function evaluateCondition(condition, answers) {
  if (!condition) return true;
  if (condition.type === "checkbox_count") {
    const countA = getCheckedCount(condition.field_id, answers);
    if (condition.value !== undefined && condition.value !== null) {
      return evaluateComparison(countA, condition.comparison, condition.value);
    }
    if (condition.compare_to_field_id) {
      const countB = getCheckedCount(condition.compare_to_field_id, answers);
      const minSide = condition.minimum_either_side || 0;
      if (countA < minSide || countB < minSide) return false;
      return evaluateComparison(countA, condition.comparison, countB);
    }
  }
  return true;
}

/* ─── Display-only fields ─── */

function CalloutField({ field, answers, onAnswerChange }) {
  if (!evaluateCondition(field.condition, answers)) return null;

  if (field.variant === "plain" || !field.variant) {
    return <PlainCallout field={field} answers={answers} onAnswerChange={onAnswerChange} />;
  }

  const variants = {
    soft: "bg-[#FDF5F3] border border-[#E8C9C0]",
    dark: "bg-[#4A0E2E] text-white border-transparent",
  };
  const boxClass = variants[field.variant] || variants.soft;
  const textColor = field.variant === "dark" ? "text-white/90" : "text-gray-600";
  const labelColor = field.variant === "dark" ? "text-[#4A0E2E]" : "text-[#4A0E2E]";
  const eyebrowColor = field.variant === "dark" ? "text-white/60" : "text-[#C4847A]";

  return (
    <div className={`rounded-xl px-5 py-4 ${boxClass}`}>
      {field.eyebrow && (
        <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${eyebrowColor}`}>
          {field.eyebrow}
        </p>
      )}
      {field.label && (
        <p className={`text-sm font-semibold mb-1.5 ${labelColor}`}>
          {field.label}
        </p>
      )}
      {field.body && (
        <p className={`text-sm leading-relaxed ${textColor}`}>
          {field.body}
        </p>
      )}
      {field.input && (
        <CalloutEmbeddedInput input={field.input} fieldId={field.id} answers={answers} onAnswerChange={onAnswerChange} variant={field.variant} />
      )}
    </div>
  );
}

function PlainCallout({ field, answers, onAnswerChange }) {
  const isCredits = field.style === "credits_small_caps";
  const isItalic = field.emphasis === "italic";
  const isItalicCentered = field.emphasis === "italic_centered";

  let bodyClass = "text-sm leading-relaxed text-gray-600";
  if (isCredits) {
    bodyClass = "text-xs uppercase tracking-widest text-gray-400 text-center";
  } else if (isItalicCentered) {
    bodyClass = "text-sm leading-relaxed text-gray-600 italic text-center";
  } else if (isItalic) {
    bodyClass = "text-sm leading-relaxed text-gray-600 italic";
  }

  return (
    <div>
      {field.eyebrow && (
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-[#C4847A]">
          {field.eyebrow}
        </p>
      )}
      {field.label && (
        <p className="text-base font-semibold text-[#4A0E2E] mb-1.5">
          {field.label}
        </p>
      )}
      {field.body && (
        <p className={bodyClass}>
          {field.body}
        </p>
      )}
      {field.input && (
        <CalloutEmbeddedInput input={field.input} fieldId={field.id} answers={answers} onAnswerChange={onAnswerChange} variant="plain" />
      )}
    </div>
  );
}

function CalloutEmbeddedInput({ input, fieldId, answers, onAnswerChange, variant }) {
  const val = answers[fieldId] || "";
  const inputClass = variant === "dark"
    ? "mt-3 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
    : "mt-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A]";

  if (input.type === "date_picker") {
    return (
      <input
        type="date"
        value={val}
        onChange={(e) => onAnswerChange?.(fieldId, e.target.value)}
        className={inputClass}
      />
    );
  }
  if (input.type === "short_text") {
    return (
      <input
        type="text"
        value={val}
        onChange={(e) => onAnswerChange?.(fieldId, e.target.value)}
        placeholder={input.placeholder || "Write here..."}
        className={inputClass}
      />
    );
  }
  return null;
}

function QuoteField({ field }) {
  return (
    <blockquote className="border-l-4 border-[#C4847A] pl-5 py-3 my-4">
      <p className="text-lg italic text-[#4A0E2E] leading-relaxed">
        "{field.body}"
      </p>
      {field.attribution && (
        <footer className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#C4847A]">
          {field.attribution}
        </footer>
      )}
    </blockquote>
  );
}

function NumberedListField({ field, answers, onAnswerChange }) {
  const isDisplayOnly = field.display_only === true;

  return (
    <div className="space-y-3">
      {field.label && (
        <p className="text-sm font-semibold text-[#4A0E2E]">{field.label}</p>
      )}
      {field.items?.map((item, idx) => {
        const hasFillableInput = !isDisplayOnly && item.field_type;
        const itemKey = `${field.id}_item_${idx}`;
        const itemVal = answers[itemKey] || "";

        if (isDisplayOnly || !hasFillableInput) {
          return (
            <div key={idx} className="flex gap-4 items-start bg-[#FDF5F3] rounded-xl px-5 py-4">
              <span className="text-2xl font-bold text-[#C4847A] leading-none flex-shrink-0">
                {item.number || String(idx + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">{item.body}</p>
            </div>
          );
        }

        return (
          <div key={idx} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <div className="flex gap-4 items-start">
              <span className="text-2xl font-bold text-[#C4847A] leading-none flex-shrink-0">
                {item.number || String(idx + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0 space-y-2">
                {item.label && (
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C4847A]">
                    {item.label}
                  </p>
                )}
                {(item.helper || item.body) && (
                  <p className="text-sm italic text-gray-500 leading-relaxed">
                    {item.helper || item.body}
                  </p>
                )}
                {item.field_type === "long_text" && (
                  <textarea
                    rows={item.rows || 3}
                    value={itemVal}
                    onChange={(e) => onAnswerChange?.(itemKey, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A] transition-all resize-y"
                    placeholder="Write here..."
                  />
                )}
                {item.field_type === "short_text" && (
                  <input
                    type="text"
                    value={itemVal}
                    onChange={(e) => onAnswerChange?.(itemKey, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A] transition-all"
                    placeholder="Write here..."
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Input fields ─── */

function CheckboxGroupField({ field, answers, onAnswerChange }) {
  const checked = answers[field.id] || {};

  // Support both formats:
  // Format A (existing): options = [{ id: "opt1", label: "Label" }]
  // Format B (new):      options = ["Label string", "Label string"]
  const normalizedOptions = (field.options || []).map((opt, idx) => {
    if (typeof opt === "string") {
      return { id: `opt_${idx}`, label: opt };
    }
    return opt;
  });

  const handleToggle = (optId) => {
    const updated = { ...checked, [optId]: !checked[optId] };
    onAnswerChange?.(field.id, updated);
  };

  return (
    <div className="space-y-2">
      {field.label && (
        <p className="text-sm font-semibold text-[#4A0E2E]">{field.label}</p>
      )}
      {field.prompt && (
        <p className="text-xs text-gray-400 italic mb-1">{field.prompt}</p>
      )}
      <div className="space-y-2">
        {normalizedOptions.map((opt) => (
          <label key={opt.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-[#C4847A] transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={!!checked[opt.id]}
              onChange={() => handleToggle(opt.id)}
              className="mt-0.5 accent-[#6E1D40] w-4 h-4 flex-shrink-0"
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function TextInputField({ field, answers, onAnswerChange }) {
  const isLong = field.type === "long_text";
  const val = answers[field.id] || "";

  return (
    <div className="space-y-1.5">
      {field.label && (
        <p className="text-sm font-semibold text-[#4A0E2E]">{field.label}</p>
      )}
      {(field.helper || field.prompt) && (
        <p className="text-xs text-gray-400 italic">{field.helper || field.prompt}</p>
      )}
      {isLong ? (
        <textarea
          rows={field.rows || field.min_rows || 4}
          value={val}
          onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A] transition-all resize-y"
          placeholder={field.placeholder || "Write here..."}
        />
      ) : (
        <input
          type="text"
          value={val}
          onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A] transition-all"
          placeholder={field.placeholder || "Write here..."}
        />
      )}
    </div>
  );
}

function StructuredListPlaceholder({ field, answers, onAnswerChange }) {
  const listAnswers = answers[field.id] || {};
  const minRows = field.min_rows || 3;

  const savedRowCount = (() => {
    const keys = Object.keys(listAnswers);
    if (!keys.length) return minRows;
    let maxIdx = -1;
    keys.forEach(k => {
      const idx = parseInt(k.split("_")[0], 10);
      if (!isNaN(idx) && idx > maxIdx) maxIdx = idx;
    });
    return Math.max(minRows, maxIdx + 1);
  })();

  const [extraRows, setExtraRows] = useState(0);
  const maxRows = field.max_rows || 20;
  const rowCount = Math.min(Math.max(savedRowCount, minRows) + extraRows, maxRows);
  const rows = Array.from({ length: rowCount });

  const handleCellChange = (rIdx, colId, value) => {
    const updated = { ...listAnswers, [`${rIdx}_${colId}`]: value };
    onAnswerChange?.(field.id, updated);
  };

  return (
    <div className="space-y-2">
      {field.label && (
        <p className="text-sm font-semibold text-[#4A0E2E]">{field.label}</p>
      )}
      {field.prompt && (
        <p className="text-xs text-gray-400 italic mb-1">{field.prompt}</p>
      )}

      {/* Prefilled examples (read-only reference rows) */}
      {field.prefilled_examples?.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Reference examples</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {field.columns?.map((col) => (
                    <th key={col.id || col.key} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-200">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {field.prefilled_examples.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-gray-100 bg-[#FDF5F3]/50">
                    {field.columns?.map((col) => (
                      <td key={col.id || col.key} className="px-3 py-2 text-sm text-gray-500 italic">
                        {row[col.key || col.id] || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editable rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {field.columns?.map((col) => (
                <th key={col.id || col.key} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-200">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((_, rIdx) => (
              <tr key={rIdx} className="border-b border-gray-100">
                {field.columns?.map((col) => {
                  const colKey = col.id || col.key;

                  // Fixed label column (e.g. row numbers or labels)
                  if (col.type === "fixed_label") {
                    return (
                      <td key={colKey} className="px-3 py-2 text-sm font-semibold text-[#C4847A]">
                        {col.values?.[rIdx] || ""}
                      </td>
                    );
                  }

                  return (
                    <td key={colKey} className="px-3 py-2">
                      <input
                        type="text"
                        value={listAnswers[`${rIdx}_${colKey}`] || ""}
                        onChange={(e) => handleCellChange(rIdx, colKey, e.target.value)}
                        placeholder="..."
                        className="w-full rounded border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A]"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(field.allow_add_rows !== false && rowCount < maxRows) && (
        <button
          type="button"
          onClick={() => setExtraRows(prev => prev + 1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 16px",
            borderRadius: 100,
            background: "transparent",
            color: "#4A0E2E",
            border: "1px solid rgba(74,14,46,0.22)",
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 600,
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 180ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(74,14,46,0.04)";
            e.currentTarget.style.borderColor = "rgba(74,14,46,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(74,14,46,0.22)";
          }}
        >
          + Add row
        </button>
      )}
    </div>
  );
}