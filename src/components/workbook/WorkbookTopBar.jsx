import React from "react";
import { Menu } from "lucide-react";

/**
 * WorkbookTopBar — position text, saved indicator, progress pill, and progress bar.
 */
export default function WorkbookTopBar({
  sections, activeSection, progressPct, lastSaved, onOpenDrawer
}) {
  const section = sections[activeSection];
  const totalSections = sections.length;

  // Position text per spec
  const getPositionText = () => {
    if (activeSection === 0) return "Introduction";
    if (activeSection === totalSections - 1) return "Summary";
    const nn = String(section?.section_number || activeSection).padStart(2, "0");
    const totalNumbered = totalSections - 2; // exclude intro and summary
    return `Section ${nn} of ${String(totalNumbered).padStart(2, "0")} · ${section?.title || ""}`;
  };

  // Saved indicator text
  const savedText = lastSaved
    ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`
    : "Auto-saving";

  return (
    <div className="wb-topbar sticky top-0 z-30" style={{ borderBottom: "1px solid var(--aw-border-light)" }}>
      <div style={{ padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}
           className="wb-topbar-inner">
        {/* Left: hamburger (mobile only) + position text */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onOpenDrawer}
            className="wb-menu-btn flex-shrink-0 flex items-center justify-center"
            style={{
              width: 36, height: 36, borderRadius: "50%",
              border: "1px solid var(--aw-border-light)",
              background: "transparent",
              display: "none", // shown via media query
            }}
          >
            <Menu style={{ width: 16, height: 16, color: "var(--aw-burg-core)" }} />
          </button>
          <span className="truncate" style={{
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--aw-burg-core)",
          }}>
            {getPositionText()}
          </span>
        </div>

        {/* Right: saved indicator + progress pill */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Saved indicator — hidden ≤720px via CSS class */}
          <div className="wb-saved-indicator flex items-center gap-1.5">
            <span className="wb-save-dot" />
            <span style={{
              fontFamily: "var(--aw-font-sans)",
              fontWeight: 500,
              fontSize: 10,
              fontStyle: "italic",
              color: "var(--aw-mid-grey)",
            }}>
              {savedText}
            </span>
          </div>

          {/* Progress pill */}
          <span style={{
            fontFamily: "var(--aw-font-sans)",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--aw-rose-deep)",
            background: "var(--aw-rose-wash)",
            border: "1px solid var(--aw-border-rose)",
            padding: "6px 12px",
            borderRadius: "var(--aw-radius-pill)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}>
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Progress bar — full bleed under the top bar */}
      <div className="wb-progress-track" style={{ marginTop: -1 }}>
        <div className="wb-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Media query: show hamburger ≤1024px, reduce padding on mobile */}
      <style>{`
        @media (max-width: 1024px) {
          .wb-menu-btn { display: flex !important; }
        }
        @media (max-width: 720px) {
          .wb-topbar-inner { padding: 12px 18px !important; }
        }
      `}</style>
    </div>
  );
}