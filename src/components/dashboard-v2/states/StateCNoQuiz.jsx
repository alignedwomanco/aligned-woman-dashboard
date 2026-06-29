import React from "react";
import { ArrowRight } from "lucide-react";
import MoneyStoryCard from "@/components/dashboard-v2/MoneyStoryCard";

export default function StateCNoQuiz({ user, profile, onCheckout }) {
  return (
    <div className="space-y-6">

      {/* Take the quiz prompt — replaces archetype diagnosis */}
      <section className="bg-awrose-pale rounded-xl p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-deep mr-2 align-middle" />
          YOUR STARTING POINT
        </p>
        <div className="max-w-2xl">
          <h2 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-4">
            Before you decide, <span className="italic text-awrose-core">find your pattern</span>.
          </h2>
          <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed mb-6">
            A short diagnostic that reveals how you show up — at your best and at your worst. It takes a few minutes, and it will name what you have always felt but never had language for.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => window.location.href = "/StartingPointProfile"}
              className="inline-flex items-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200"
            >
              TAKE THE DIAGNOSTIC <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 30-minute reset */}
      <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
          BEFORE YOU DECIDE · 30 MINUTES
        </p>
        <h3 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-4">
          Reset with <span className="italic text-awrose-core">Phoebe</span> for 30 minutes.
        </h3>
        <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed mb-6 max-w-xl">
          A free, unhurried half hour with one of our practitioners. No pitch, no pressure. The reset is the practice. You will know after it whether you want what comes next.
        </p>

        <div className="mb-6 max-w-2xl" style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "12px" }}>
          <video
            src="https://pub-92fd07e9117b4774bd919918a55b163b.r2.dev/Phoebe-Greenacre-Intro-Yin-stress-digest.mp4"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </section>

      <MoneyStoryCard />

      {/* Purchase CTA - dark editorial */}
      <section
        className="rounded-xl p-8 md:p-10"
        style={{
          background: "linear-gradient(160deg, #0E0208 0%, #1A0510 35%, #4A0E2E 65%, #1A0510 100%)",
          color: "#FAF5F3",
        }}
      >
        <p
          className="font-body font-bold text-[10px] tracking-eyebrow uppercase mb-6"
          style={{ color: "#E8B4AE" }}
        >
          <span className="inline-block w-5 h-px mr-3 align-middle" style={{ background: "#E8B4AE" }} />
          YOUR NEXT STEP · CHAPTER 02
        </p>
        <h3
          className="font-display text-[34px] md:text-[48px] leading-tight mb-5 max-w-xl"
          style={{ color: "#FAF5F3", fontWeight: 400 }}
        >
          Built for <span className="italic" style={{ color: "#E8B4AE" }}>exactly</span><br />
          this woman.
        </h3>
        <p
          className="font-body font-light text-sm md:text-base leading-relaxed mb-8 max-w-lg"
          style={{ color: "rgba(250,245,243,0.6)" }}
        >
          The internal architecture you were never given, taught in sequence, by practitioners who have done the work.
        </p>

        <div className="mb-8" style={{ width: 48, height: 1, background: "rgba(232,180,174,0.3)" }} />

        <div className="flex items-baseline gap-4 mb-8">
          <span
            className="font-display italic"
            style={{ fontSize: "clamp(40px, 5vw, 56px)", color: "#E8B4AE", lineHeight: 1, fontWeight: 400 }}
          >
            R3,997
          </span>
          <span
            className="font-body font-bold text-[10px] tracking-eyebrow uppercase"
            style={{ color: "rgba(250,245,243,0.45)" }}
          >
            ONE INVESTMENT · 1 YEAR ACCESS
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onCheckout}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-eyebrow uppercase py-4 px-8 rounded-full transition-all duration-200"
            style={{ background: "#C4847A", color: "#0E0208" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#E8B4AE"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#C4847A"; }}
          >
            BEGIN THE BLUEPRINT
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.location.href = "/blueprint"}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-eyebrow uppercase py-4 px-8 rounded-full transition-all duration-200"
            style={{ background: "transparent", border: "1px solid rgba(250,245,243,0.2)", color: "rgba(250,245,243,0.6)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(250,245,243,0.4)"; e.currentTarget.style.color = "#FAF5F3"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(250,245,243,0.2)"; e.currentTarget.style.color = "rgba(250,245,243,0.6)"; }}
          >
            LEARN MORE
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}