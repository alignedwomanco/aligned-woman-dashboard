import React from "react";

/**
 * Renders a single field from the workbook schema.
 * Display-only types: callout, quote, numbered_list
 * Input types: rendered as styled placeholders for now.
 */
export default function WorkbookFieldRenderer({ field }) {
  switch (field.type) {
    case "callout":
      return <CalloutField field={field} />;
    case "quote":
      return <QuoteField field={field} />;
    case "numbered_list":
      return <NumberedListField field={field} />;
    case "checkbox_group":
      return <CheckboxGroupPlaceholder field={field} />;
    case "long_text":
    case "short_text":
      return <TextInputPlaceholder field={field} />;
    case "grid":
      return <GridPlaceholder field={field} />;
    case "structured_list":
      return <StructuredListPlaceholder field={field} />;
    default:
      return null;
  }
}

/* ─── Display-only fields ─── */

function CalloutField({ field }) {
  const variants = {
    plain: "bg-white border border-gray-200",
    soft: "bg-[#FDF5F3] border border-[#E8C9C0]",
    dark: "bg-[#4A0E2E] text-white border-transparent",
  };
  const variant = variants[field.variant] || variants.plain;
  const textColor = field.variant === "dark" ? "text-white/90" : "text-gray-600";
  const labelColor = field.variant === "dark" ? "text-white" : "text-[#4A0E2E]";
  const eyebrowColor = field.variant === "dark" ? "text-white/60" : "text-[#C4847A]";

  return (
    <div className={`rounded-xl px-5 py-4 ${variant}`}>
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
    </div>
  );
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

function NumberedListField({ field }) {
  return (
    <div className="space-y-3">
      {field.label && (
        <p className="text-sm font-semibold text-[#4A0E2E]">{field.label}</p>
      )}
      {field.items?.map((item, idx) => (
        <div key={idx} className="flex gap-4 items-start bg-[#FDF5F3] rounded-xl px-5 py-4">
          <span className="text-2xl font-bold text-[#C4847A] leading-none flex-shrink-0">
            {item.number || String(idx + 1).padStart(2, "0")}
          </span>
          <p className="text-sm text-gray-700 leading-relaxed">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Input placeholders ─── */

function CheckboxGroupPlaceholder({ field }) {
  return (
    <div className="space-y-2">
      {field.label && (
        <p className="text-sm font-semibold text-[#4A0E2E]">{field.label}</p>
      )}
      <div className="space-y-2">
        {field.options?.map((opt) => (
          <label key={opt.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-[#C4847A] transition-colors cursor-pointer">
            <input type="checkbox" className="mt-0.5 accent-[#6E1D40] w-4 h-4 flex-shrink-0" />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function TextInputPlaceholder({ field }) {
  const isLong = field.type === "long_text";
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
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A] transition-all resize-y"
          placeholder="Write here…"
        />
      ) : (
        <input
          type="text"
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C4847A]/40 focus:border-[#C4847A] transition-all"
          placeholder="Write here…"
        />
      )}
    </div>
  );
}

function GridPlaceholder({ field }) {
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

function StructuredListPlaceholder({ field }) {
  const rows = Array.from({ length: field.min_rows || 3 });
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