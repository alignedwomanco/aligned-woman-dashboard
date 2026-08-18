import React from "react";

const IPAD_MOCKUP =
  "https://media.base44.com/images/public/69f46886a412ee042303f1af/98ad67734_aw-ipad-money-story-transparent.png";

const PLUM = "#3B1B27";
const INK = "#2D2424";
const CREAM = "#FAF5F3";

// Free lead-magnet workbook nudge. Desktop renders the cream "WORKBOOK" card
// with the iPad mockup bleeding out of the bottom-right corner; mobile keeps a
// compact, overlay-free version of the same card. Links to the public Your
// Money Story tool. Shown on every dashboard state.
export default function MoneyStoryCard() {
  return (
    <section
      className="relative rounded-[28px] overflow-hidden w-full"
      style={{
        background: CREAM,
        boxShadow: "0 24px 60px rgba(8,1,5,0.16)",
        minHeight: 300,
      }}
    >
      <div className="relative z-10 flex flex-col gap-5 p-8 sm:p-10 md:p-12 lg:p-14 max-w-full md:max-w-[58%]">
        <span
          className="font-body font-bold text-[11px] sm:text-[12px] uppercase"
          style={{ color: PLUM, letterSpacing: "0.28em" }}
        >
          WORKBOOK
        </span>
        <h3
          className="font-display leading-[1.08] text-[32px] sm:text-[36px] md:text-[40px] lg:text-[46px]"
          style={{ color: PLUM }}
        >
          Your Money Story
        </h3>
        <p
          className="font-body leading-relaxed text-[15px] md:text-[16px] max-w-[420px]"
          style={{ color: INK }}
        >
          The beliefs you inherited about money are running quietly underneath
          every decision. Meet them on paper.
        </p>
        <button
          onClick={() => (window.location.href = "/YourMoneyStory")}
          className="mt-1 inline-flex items-center justify-center rounded-full px-7 py-3 font-body font-bold text-[12px] uppercase text-white transition-opacity hover:opacity-90 w-fit"
          style={{ background: PLUM, letterSpacing: "0.22em" }}
        >
          BEGIN
        </button>
      </div>

      {/* iPad mockup, bleeding out of the bottom-right corner. Desktop only. */}
      <img
        src={IPAD_MOCKUP}
        alt="Your Money Story workbook on iPad"
        aria-hidden="true"
        className="hidden md:block absolute pointer-events-none select-none"
        style={{
          right: "-5%",
          bottom: "-9%",
          width: "54%",
          maxWidth: 460,
          transform: "rotate(-6deg)",
        }}
      />
    </section>
  );
}