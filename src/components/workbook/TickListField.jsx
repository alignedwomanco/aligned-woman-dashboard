import React from "react";
import { Check } from "lucide-react";

/**
 * Renders a tick_list field: vertical list of items, each with a rose check-circle + body text.
 * Display-only, no inputs.
 *
 * Schema shape:
 * { id, type: "tick_list", items: [{ body: "..." }, ...] }
 */
export default function TickListField({ field }) {
  if (!field.items?.length) return null;

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {field.items.map((item, idx) => (
        <div key={idx} className="flex items-start" style={{ gap: 14 }}>
          {/* Rose check circle */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 22,
              height: 22,
              background: "#C4847A",
              marginTop: 3,
            }}
          >
            <Check className="text-white" style={{ width: 9, height: 9 }} strokeWidth={3} />
          </div>
          {/* Body text */}
          <p
            style={{
              fontFamily: "var(--aw-font-sans)",
              fontSize: 15,
              lineHeight: 1.7,
              color: "#3A2A28",
              margin: 0,
            }}
          >
            {item.body}
          </p>
        </div>
      ))}
    </div>
  );
}