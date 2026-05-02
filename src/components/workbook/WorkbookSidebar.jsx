import React from "react";
import { X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * WorkbookSidebar — 320px rail (desktop) / slide-in drawer (mobile).
 * Props: workbook, expert, user, sections, activeSection, answers, onJumpTo, isOpen, onClose
 */
export default function WorkbookSidebar({
  workbook, expert, user, sections, activeSection, answers, onJumpTo, isOpen, onClose
}) {
  const navigate = useNavigate();
  // Check if section has any non-empty answer
  const isSectionCompleted = (section) => {
    if (!section?.fields) return false;
    return section.fields.some(f => {
      const v = answers[f.id];
      if (v === undefined || v === null) return false;
      if (typeof v === "string") return v.trim() !== "";
      if (typeof v === "object") return Object.keys(v).length > 0 && Object.values(v).some(Boolean);
      return true;
    });
  };

  const getNumberDisplay = (section, idx) => {
    if (idx === 0) return "—";
    if (idx === sections.length - 1) return "✦";
    return String(section.section_number || idx).padStart(2, "0");
  };

  const titleWords = (workbook?.title || "").split(" ");
  // Italicize the second word in rose
  const renderTitle = () => {
    if (titleWords.length < 2) return <span>{workbook?.title}</span>;
    return (
      <>
        {titleWords[0]}{" "}
        <span className="italic" style={{ color: "var(--aw-rose-core)" }}>{titleWords[1]}</span>
        {titleWords.length > 2 && ` ${titleWords.slice(2).join(" ")}`}
      </>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: "var(--aw-white)" }}>
      {/* Brand head */}
      <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--aw-border-light)" }}
           className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
               style={{ background: "var(--aw-burg-core)" }}>
            AW
          </div>
          <div>
            <span style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--aw-burg-core)" }}>
              The Aligned
            </span>
            <br />
            <span style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", fontSize: 13, color: "var(--aw-rose-core)" }}>
              Woman Co.
            </span>
          </div>
        </div>
        {/* Close button — only shows on mobile via parent */}
        <button
          onClick={onClose}
          className="wb-mobile-only p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          style={{ display: "none" }}
          data-mobile-close
        >
          <X className="w-4 h-4" style={{ color: "var(--aw-mid-grey)" }} />
        </button>
      </div>

      {/* Workbook meta */}
      <div style={{ padding: "28px 28px 20px" }}>
        <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--aw-rose-core)", marginBottom: 8 }}>
          Workbook
        </p>
        <h2 style={{ fontFamily: "var(--aw-font-display)", fontWeight: 400, fontSize: 26, lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--aw-burg-core)", margin: 0 }}>
          {renderTitle()}
        </h2>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: "18px 14px 28px" }}>
        <div className="flex flex-col" style={{ gap: 1 }}>
          {sections.map((section, idx) => {
            const isCurrent = idx === activeSection;
            const isCompleted = !isCurrent && isSectionCompleted(section);
            const num = getNumberDisplay(section, idx);

            return (
              <button
                key={section.id}
                onClick={() => onJumpTo(idx)}
                className={`wb-nav-item ${isCurrent ? "wb-nav-current" : ""} w-full text-left flex items-center gap-3`}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--aw-radius-sm)",
                  background: isCurrent ? "var(--aw-rose-wash)" : "transparent",
                }}
              >
                {/* Dot / marker */}
                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 16, height: 16 }}>
                  {isCompleted ? (
                    <div className="rounded-full flex items-center justify-center" style={{ width: 16, height: 16, background: "var(--aw-rose-core)" }}>
                      <Check className="text-white" style={{ width: 9, height: 9 }} strokeWidth={3} />
                    </div>
                  ) : isCurrent ? (
                    <div className="wb-dot-current rounded-full" style={{ width: 16, height: 16, background: "var(--aw-burg-core)" }} />
                  ) : (
                    <div className="rounded-full" style={{ width: 16, height: 16, border: "1px solid rgba(74,14,46,0.22)" }} />
                  )}
                </div>

                {/* Number */}
                <span
                  className="flex-shrink-0"
                  style={{
                    fontFamily: "var(--aw-font-sans)",
                    fontWeight: 700,
                    fontSize: 9,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: isCurrent ? "var(--aw-rose-core)" : "var(--aw-mid-grey)",
                    width: 18,
                    textAlign: "center",
                  }}
                >
                  {num}
                </span>

                {/* Label */}
                <span style={{
                  fontFamily: "var(--aw-font-sans)",
                  fontWeight: isCurrent ? 600 : 400,
                  fontSize: 13,
                  lineHeight: 1.35,
                  letterSpacing: "0.005em",
                  color: isCurrent ? "var(--aw-burg-core)" : "var(--aw-dark-grey)",
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {section.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Back to Dashboard — below last section, visually demoted */}
        <div style={{ padding: "0 14px" }}>
          <div style={{ height: 1, background: "rgba(74,14,46,0.08)", margin: "12px 0" }} />
          <button
            onClick={() => navigate("/Dashboard")}
            className="wb-nav-item w-full text-left flex items-center gap-3"
            style={{
              padding: "10px 14px",
              borderRadius: "var(--aw-radius-sm)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background-color 180ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--aw-rose-wash)";
              e.currentTarget.querySelector("[data-back-arrow]").style.color = "#4A0E2E";
              e.currentTarget.querySelector("[data-back-label]").style.color = "#4A0E2E";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.querySelector("[data-back-arrow]").style.color = "#8A7A76";
              e.currentTarget.querySelector("[data-back-label]").style.color = "#8A7A76";
            }}
          >
            {/* Empty indicator column */}
            <div className="flex-shrink-0" style={{ width: 16, height: 16 }} />
            {/* Arrow */}
            <span
              data-back-arrow
              className="flex-shrink-0"
              style={{
                fontFamily: "var(--aw-font-sans)",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "#8A7A76",
                width: 18,
                textAlign: "center",
                transition: "color 180ms ease",
              }}
            >
              ←
            </span>
            {/* Label */}
            <span
              data-back-label
              style={{
                fontFamily: "var(--aw-font-sans)",
                fontWeight: 400,
                fontSize: 13,
                lineHeight: 1.35,
                letterSpacing: "0.005em",
                color: "#8A7A76",
                transition: "color 180ms ease",
              }}
            >
              Back to Dashboard
            </span>
          </button>
        </div>
      </nav>

      {/* Practitioner tile — sticky bottom */}
      <div style={{ padding: "18px 28px 22px", borderTop: "1px solid var(--aw-border-light)" }}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
               style={{ width: 34, height: 34, background: "var(--aw-grad-rose)" }}>
            {expert?.profile_picture ? (
              <img src={expert.profile_picture} alt={expert?.name} className="w-full h-full rounded-full object-cover" />
            ) : expert?.name ? (
              <span style={{ fontFamily: "var(--aw-font-display)", fontStyle: "italic", fontSize: 15, color: "var(--aw-white)" }}>
                {expert.name[0]}
              </span>
            ) : null}
          </div>
          {expert && (
            <div className="min-w-0">
              <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 600, fontSize: 12, lineHeight: 1.2, color: "var(--aw-burg-core)", margin: 0 }}
                 className="truncate">
                {expert.name}
              </p>
              {expert.title && (
                <p style={{ fontFamily: "var(--aw-font-sans)", fontWeight: 700, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--aw-mid-grey)", margin: 0 }}>
                  {expert.title}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible ≥1025px */}
      <aside className="wb-sidebar-desktop hidden" style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: 320, zIndex: 40,
        borderRight: "1px solid var(--aw-border-light)",
        overflow: "hidden",
      }}>
        {sidebarContent}
      </aside>

      {/* Mobile drawer — only ≤1024px */}
      {isOpen && (
        <>
          <div
            className="wb-scrim fixed inset-0 z-50"
            style={{ background: "rgba(8,1,5,0.4)" }}
            onClick={onClose}
          />
          <aside
            className="fixed top-0 left-0 bottom-0 z-50 overflow-hidden"
            style={{
              width: 320,
              maxWidth: "86vw",
              boxShadow: "var(--aw-shadow-lg)",
            }}
          >
            {/* Override close button visibility in mobile */}
            <style>{`
              .wb-scrim + aside [data-mobile-close] { display: flex !important; }
            `}</style>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* CSS to show desktop sidebar only above 1024px */}
      <style>{`
        @media (min-width: 1025px) {
          .wb-sidebar-desktop { display: block !important; }
        }
      `}</style>
    </>
  );
}