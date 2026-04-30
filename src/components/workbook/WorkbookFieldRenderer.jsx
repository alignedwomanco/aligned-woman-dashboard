import React, { useRef } from "react";
import TickListField from "./TickListField";
import CtaRowField from "./CtaRowField";

/**
 * Renders a single field from the workbook schema.
 * Receives answers (object), onAnswerChange (callback), and sectionFields (all fields in section).
 * Optional: sections (all workbook sections) and onJumpToSection (callback) for cta_row navigation.
 */
export default function WorkbookFieldRenderer({ field, answers = {}, onAnswerChange, sectionFields = [], sections, onJumpToSection }) {
  switch (field.type) {
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
      return <GridPlaceholder field={field} answers={answers} onAnswerChange={onAnswerChange} />;
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
  if (!condition) return true; // no condition = always show
  if (condition.type === "checkbox_count") {
    const countA = getCheckedCount(condition.field_id, answers);

    // Field-to-literal comparison: { field_id, comparison, value }
    if (condition.value !== undefined && condition.value !== null) {
      return evaluateComparison(countA, condition.comparison, condition.value);
    }

    // Field-to-field comparison: { field_id, comparison, compare_to_field_id, minimum_either_side? }
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
  // Bug 2 fix: evaluate condition before rendering
  if (!evaluateCondition(field.condition, answers)) return null;

  // Plain variant: unstyled flowing prose
  if (field.variant === "plain" || !field.variant) {
    return <PlainCallout field={field} answers={answers} onAnswerChange={onAnswerChange} />;
  }

  // Soft and dark variants: boxed treatment
  const variants = {
    soft: "bg-[#FDF5F3] border border-[#E8C9C0]",
    dark: "bg-[#4A0E2E] text-white border-transparent",
  };
  const boxClass = variants[field.variant] || variants.soft;
  const textColor = field.variant === "dark" ? "text-white/90" : "text-gray-600";
  const labelColor = field.variant === "dark" ? "text-white" : "text-[#4A0E2E]";
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

  // Body text classes
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
        placeholder={input.placeholder || "Write here…"}
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
          — {field.attribution}
        </footer>
      )}
    </blockquote>
  );
}

/* Bug 1 fix: numbered_list supports both display_only and fillable items */
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
          // Display-only: serif numbered prose, no inputs
          return (
            <div key={idx} className="flex gap-4 items-start bg-[#FDF5F3] rounded-xl px-5 py-4">
              <span className="text-2xl font-bold text-[#C4847A] leading-none flex-shrink-0">
                {item.number || String(idx + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">{item.body}</p>
            </div>
          );
        }

        // Fillable item with field_type
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
                    placeholder="Write here…"
                  />
                )}
                {item.field_type === "short_text" && (
                  <input
                    type="text"
                    value={itemVal}
                    onChange={(e) => onAnswerChange?.(itemKey, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A] transition-all"
                    placeholder="Write here…"
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

  const handleToggle = (optId) => {
    const updated = { ...checked, [optId]: !checked[optId] };
    onAnswerChange?.(field.id, updated);
  };

  return (
    <div className="space-y-2">
      {field.label && (
        <p className="text-sm font-semibold text-[#4A0E2E]">{field.label}</p>
      )}
      <div className="space-y-2">
        {field.options?.map((opt) => (
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
      {field.helper && (
        <p className="text-xs text-gray-400 italic">{field.helper}</p>
      )}
      {isLong ? (
        <textarea
          rows={field.rows || 4}
          value={val}
          onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A] transition-all resize-y"
          placeholder="Write here…"
        />
      ) : (
        <input
          type="text"
          value={val}
          onChange={(e) => onAnswerChange?.(field.id, e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A] transition-all"
          placeholder="Write here…"
        />
      )}
    </div>
  );
}

function GridPlaceholder({ field, answers, onAnswerChange }) {
  const gridAnswers = answers[field.id] || {};

  const handleCellChange = (rowId, colId, value) => {
    const updated = { ...gridAnswers, [`${rowId}_${colId}`]: value };
    onAnswerChange?.(field.id, updated);
  };

  return (
    <div className="space-y-2">
      {field.label && (
        <p className="text-sm font-semibold text-[#4A0E2E]">{field.label}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-200" />
              {field.columns?.map((col) => (
                <th key={col.id} className="text-center px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-200">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {field.rows?.map((row) => (
              <tr key={row.id} className="border-b border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-700">{row.label}</td>
                {field.columns?.map((col) => (
                  <td key={col.id} className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min={field.cell_options?.min}
                      max={field.cell_options?.max}
                      value={gridAnswers[`${row.id}_${col.id}`] || ""}
                      onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                      placeholder={field.cell_options?.placeholder || "—"}
                      className="w-14 text-center rounded border border-gray-200 bg-white py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StructuredListPlaceholder({ field, answers, onAnswerChange }) {
  const listAnswers = answers[field.id] || {};
  const rowCount = field.min_rows || 3;
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {field.columns?.map((col) => (
                <th key={col.id} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-200">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((_, rIdx) => (
              <tr key={rIdx} className="border-b border-gray-100">
                {field.columns?.map((col) => (
                  <td key={col.id} className="px-3 py-2">
                    <input
                      type="text"
                      value={listAnswers[`${rIdx}_${col.id}`] || ""}
                      onChange={(e) => handleCellChange(rIdx, col.id, e.target.value)}
                      placeholder="…"
                      className="w-full rounded border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}