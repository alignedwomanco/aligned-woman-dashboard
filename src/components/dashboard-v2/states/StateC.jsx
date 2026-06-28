import React, { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getArchetype } from "@/data/archetypes";

const KEY_MAP = {
  performer: "performer",
  over_functioner: "overFunctioner",
  delegator: "delegator",
  overrider: "overrider",
  reactor: "reactor",
};

export default function StateC({ user, profile, onCheckout }) {
  const [bestOpen, setBestOpen] = useState(true);
  const [worstOpen, setWorstOpen] = useState(false);

  const archetypeDbKey = profile?.computed_archetype_key;
  const archetypeDataKey = KEY_MAP[archetypeDbKey] || "performer";
  const arch = getArchetype(archetypeDataKey);
  const archetypeLabel = arch?.name || "The Performer";

  return (
    <div className="space-y-6">

      {/* Intake / Archetype card */}
      <section className="bg-awrose-pale rounded-xl p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-deep mr-2 align-middle" />
          YOUR DIAGNOSIS · YOUR INTAKE
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6 items-start">
          <div>
            <h2 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-4">
              The reasons you<br />
              <span className="italic text-awrose-core">showed up</span>:
            </h2>

            {/* At Your Best - collapsible */}
            <button
              onClick={() => setBestOpen(!bestOpen)}
              className="w-full flex items-center justify-between py-3 border-b border-awburg-core/8"
            >
              <span className="font-body font-bold text-[10px] tracking-[0.24em] text-awburg-core uppercase">AT YOUR BEST</span>
              <ChevronDown
                className="w-4 h-4 text-awburg-core/50 transition-transform duration-200"
                style={{ transform: bestOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {bestOpen && (
              <p className="font-body font-light text-awburg-core/80 text-sm leading-relaxed py-3">
                {arch?.atBest || ""}
              </p>
            )}

            {/* At Your Worst - collapsible */}
            <button
              onClick={() => setWorstOpen(!worstOpen)}
              className="w-full flex items-center justify-between py-3 border-b border-awburg-core/8"
            >
              <span className="font-body font-bold text-[10px] tracking-[0.24em] text-awburg-core uppercase">AT YOUR WORST</span>
              <ChevronDown
                className="w-4 h-4 text-awburg-core/50 transition-transform duration-200"
                style={{ transform: worstOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {worstOpen && (
              <p className="font-body font-light text-awburg-core/80 text-sm leading-relaxed py-3">
                {arch?.atWorst || ""}
              </p>
            )}

            <div className="flex gap-4 items-center mt-5">
              <button onClick={() => window.location.href = "/StartingPointProfile"} className="inline-flex items-center gap-2 bg-awburg-core hover:bg-awburg-dark text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200">
                EDIT MY ANSWERS <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => window.location.href = "/StartingPointProfile"} className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/60 hover:text-awburg-core uppercase transition-colors border border-awburg-core/20 rounded-full py-3 px-5">
                RETAKE THE QUIZ
              </button>
            </div>
          </div>

          {/* Archetype video card */}
          <div
            style={{
              width: "100%",
              aspectRatio: "9 / 16",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              background: "#3D0B27",
            }}
          >
            <video
              src={arch?.videoUrl}
              muted
              playsInline
              autoPlay
              loop
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(20,4,12,0.9) 0%, rgba(20,4,12,0.6) 30%, transparent 60%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "absolute", left: 16, right: 16, bottom: 18 }}>
              <p
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "18px",
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                  marginBottom: "8px",
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                {archetypeLabel}
              </p>
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "10px",
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 300,
                  textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                }}
              >
                {arch?.atBest ? arch.atBest.split(". ").slice(0, 2).join(". ") + "." : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pattern explanation - dynamic */}
      <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
          WHAT THIS MEANS
        </p>
        <h3 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-5">
          The pattern, <span className="italic text-awrose-core">named</span>.
        </h3>
        <div className="space-y-4 max-w-2xl">
          {arch?.fullDescription ? (
            <>
              <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
                {arch.fullDescription}
              </p>
              <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
                The Aligned Woman Blueprint Course addresses this through two pillars. Your primary work begins in{" "}
                <span className="font-medium text-awburg-core">{arch.primaryPillar}</span>,{" "}
                {arch.primaryPillarNote} Your secondary work sits in{" "}
                <span className="font-medium text-awburg-core">{arch.secondaryPillar}</span>,{" "}
                {arch.secondaryPillarNote}
              </p>
              <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed italic">
                {arch.foundation}
              </p>
            </>
          ) : (
            <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
              Your pattern has been identified. Sign up to explore the full diagnostic.
            </p>
          )}
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
          <iframe
            src="https://drive.google.com/file/d/1pEjiiWfD6H5mYkj4otMjAK897h35yKv6/preview"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>


      </section>

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