import React from "react";
import { ArrowRight } from "lucide-react";

// Free lead-magnet workbook nudge. Visual twin of the "Find your pattern"
// card so the two read as a matching pair wherever both appear. Links to the
// public Your Money Story tool. Shown on every dashboard state.
export default function MoneyStoryCard() {
  return (
    <section
      className="rounded-xl border border-awburg-core/8 p-6 md:p-8 overflow-hidden relative"
      style={{
        minHeight: 180,
        background:
          "linear-gradient(135deg, var(--aw-burg-dark) 0%, var(--aw-burg-core) 55%, var(--aw-burg-mid) 100%)",
      }}
    >
      <h3 className="relative font-display text-paper text-[26px] md:text-[30px] leading-tight mb-3">
        Learn how to finally own your <span className="italic text-awrose-light">money story</span>.
      </h3>
      <p className="relative font-body font-light text-white text-sm leading-relaxed mb-5 max-w-lg">
        The ceiling you keep hitting with money is older than you think. Find out where your money story started, then write yourself a new one.
      </p>
      <button
        onClick={() => (window.location.href = "/YourMoneyStory")}
        className="relative font-body font-bold text-[11px] tracking-eyebrow text-paper hover:text-awrose-light uppercase inline-flex items-center gap-2 transition-colors"
      >
        START NOW <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </section>
  );
}