import React from "react";
import { Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * First-load welcome overlay for a workbook.
 * Shows when no answers have been saved yet.
 */
export default function WorkbookWelcome({ workbook, expert, onBegin }) {
  const hasPdf = !!workbook?.blank_pdf_url;

  // Build a safe download filename
  const pdfFilename = workbook?.title
    ? workbook.title.replace(/\s+/g, "_").replace(/[^\w_]/g, "") + ".pdf"
    : "Workbook.pdf";

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = workbook.blank_pdf_url;
    a.download = pdfFilename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  // Split title to italicize second word in Rose Core
  const titleWords = (workbook?.title || "").split(" ");
  const titleParts = titleWords.length >= 2
    ? { before: titleWords[0], accent: titleWords[1], after: titleWords.slice(2).join(" ") }
    : { before: workbook?.title || "", accent: "", after: "" };

  return (
    <>
      {/* Backdrop — maroon-tinted dim */}
      <div className="fixed inset-0 z-[80] bg-[#4A0E2E]/60 backdrop-blur-[2px]" />

      {/* Overlay container */}
      <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Card — centered on desktop, full-page feel on mobile */}
        <div className="w-full max-w-[640px] bg-white rounded-2xl shadow-2xl
                        sm:my-8
                        max-sm:min-h-screen max-sm:rounded-none max-sm:shadow-none
                        flex flex-col">
          <div className="px-6 sm:px-10 py-8 sm:py-12 flex flex-col items-center text-center flex-1">

            {/* Eyebrow */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C4847A] mb-4">
              Workbook · Begin Here
            </p>

            {/* Title — DM Serif Display style, one word italic Rose Core */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#4A0E2E] mb-2 leading-tight"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {titleParts.before}{" "}
              {titleParts.accent && (
                <span className="italic text-[#C4847A]">{titleParts.accent}</span>
              )}
              {titleParts.after && ` ${titleParts.after}`}
            </h1>

            {/* Subtitle */}
            {workbook?.subtitle && (
              <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {workbook.subtitle}
              </p>
            )}

            {/* Expert attribution */}
            {expert && (
              <div className="flex items-center gap-3 mb-6">
                {expert.profile_picture && (
                  <img
                    src={expert.profile_picture}
                    alt={expert.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#F5E8EE]"
                  />
                )}
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#4A0E2E]">{expert.name}</p>
                  {expert.title && (
                    <p className="text-xs text-gray-500">{expert.title}</p>
                  )}
                </div>
              </div>
            )}

            {/* Welcome paragraph */}
            <p className="text-sm text-gray-600 leading-relaxed max-w-md mb-8"
               style={{ fontFamily: "'Montserrat', sans-serif" }}>
              This workbook is a companion to the Hormones module. It is designed to be returned to, not finished in one sitting. There is no rush, and there are no wrong answers. Begin when you are ready.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:min-w-[360px]">
              <Button
                onClick={onBegin}
                className="flex-1 bg-[#6E1D40] hover:bg-[#5A1633] text-white h-11 text-sm font-semibold rounded-lg"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Begin <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {hasPdf && (
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1 border-[#6E1D40] text-[#6E1D40] hover:bg-[#F5E8EE] h-11 text-sm font-semibold rounded-lg"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <Download className="w-4 h-4 mr-2" /> Download blank PDF
                </Button>
              )}
            </div>

            {/* Helper text */}
            {hasPdf && (
              <p className="text-xs text-gray-400 italic mt-4 max-w-sm"
                 style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Or download the workbook to fill in by hand. You can return anytime to start the digital version.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}