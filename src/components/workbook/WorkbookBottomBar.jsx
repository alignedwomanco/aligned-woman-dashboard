import React from "react";
import { ArrowLeft, ArrowRight, FileDown } from "lucide-react";

/**
 * WorkbookBottomBar — sticky bottom nav: Previous | counter | Next/Review/Save PDF
 */
export default function WorkbookBottomBar({
  sections, activeSection, activeStep = 0, totalSteps = 0, onPrev, onNext, nextLocked
}) {
  const total = sections.length;
  const isFirstSection = activeSection === 0;
  const isLastSection = activeSection === total - 1;
  const hasFlow = totalSteps > 0;
  const isLastStep = !hasFlow || activeStep >= totalSteps - 1;
  const isFirstStep = !hasFlow || activeStep === 0;

  // Prev button: on first step of first section → disabled
  const prevDisabled = isFirstSection && isFirstStep;

  const getPrevLabel = () => {
    if (hasFlow && activeStep > 0) return "Previous";
    return "Previous Section";
  };

  const getNextLabel = () => {
    if (isLastSection && isLastStep) return "Print PDF";
    if (hasFlow && !isLastStep) return "Next";
    return "Next Section";
  };

  const getNextIcon = () => {
    if (isLastSection && isLastStep) return <FileDown style={{ width: 14, height: 14 }} />;
    return <ArrowRight style={{ width: 14, height: 14 }} />;
  };

  const handleNextClick = () => {
    if (isLastSection && isLastStep) {
      window.print();
    } else {
      onNext();
    }
  };

  const counterText = hasFlow
    ? `${activeSection + 1} / ${total}  ·  ${activeStep + 1} / ${totalSteps}`
    : `${activeSection + 1} / ${total}`;

  return (
    <div className="wb-bottombar sticky bottom-0 z-20" data-wb-bottombar style={{ borderTop: "1px solid var(--aw-border-light)" }}>
      <div className="wb-bottombar-inner" style={{ maxWidth: 720, margin: "0 auto", padding: "14px 40px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
        {/* Previous */}
        <div className="flex justify-start">
          <button
            className="wb-btn wb-btn--secondary"
            disabled={prevDisabled}
            onClick={onPrev}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span className="wb-btn-label">{getPrevLabel()}</span>
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
          {counterText}
        </div>

        {/* Next / Print PDF */}
        <div className="flex justify-end">
          <button
            className={`wb-btn ${isLastSection && isLastStep ? "wb-btn--secondary" : "wb-btn--primary"}`}
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
          .wb-bottombar .wb-btn { min-height: 44px; }
        }
      `}</style>
    </div>
  );
}