import React from "react";
import { ArrowLeft, ArrowRight, FileDown } from "lucide-react";

/**
 * WorkbookBottomBar — sticky bottom nav: Previous | counter | Next/Review/Save PDF
 */
export default function WorkbookBottomBar({
  sections, activeSection, onPrev, onNext
}) {
  const total = sections.length;
  const isFirst = activeSection === 0;
  const isLast = activeSection === total - 1;
  const isSecondToLast = activeSection === total - 2;

  // Next button label: "Review" before summary, "Save PDF" on summary
  const getNextLabel = () => {
    if (isLast) return "Save PDF";
    if (isSecondToLast) return "Review";
    return "Next";
  };

  const getNextIcon = () => {
    if (isLast) return <FileDown style={{ width: 14, height: 14 }} />;
    return <ArrowRight style={{ width: 14, height: 14 }} />;
  };

  const handleNextClick = () => {
    if (isLast) {
      window.print();
    } else {
      onNext();
    }
  };

  return (
    <div className="wb-bottombar sticky bottom-0 z-20" data-wb-bottombar style={{ borderTop: "1px solid var(--aw-border-light)" }}>
      <div className="wb-bottombar-inner" style={{ maxWidth: 720, margin: "0 auto", padding: "14px 40px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
        {/* Previous */}
        <div className="flex justify-start">
          <button
            className="wb-btn wb-btn--secondary"
            disabled={isFirst}
            onClick={onPrev}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span className="wb-btn-label">Previous</span>
          </button>
        </div>

        {/* Counter */}
        <div style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--aw-mid-grey)",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}>
          <strong style={{ fontWeight: 700, color: "var(--aw-burg-core)" }}>{activeSection + 1}</strong>
          {" / "}
          {total}
        </div>

        {/* Next / Review / Save PDF */}
        <div className="flex justify-end">
          <button
            className={`wb-btn ${isLast ? "wb-btn--secondary" : "wb-btn--primary"}`}
            onClick={handleNextClick}
          >
            <span className="wb-btn-label">{getNextLabel()}</span>
            {getNextIcon()}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .wb-bottombar-inner { padding: 12px 18px !important; }
        }
      `}</style>
    </div>
  );
}