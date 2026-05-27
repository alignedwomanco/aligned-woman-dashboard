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
            {arch?.videoUrl && (
              <video
                src={arch.videoUrl}
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
            )}
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
        <div className="flex gap-4 items-center mt-6">
          <button onClick={onCheckout} className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep hover:shadow-md text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200">
            BEGIN THE BLUEPRINT <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => window.location.href = "/BlueprintPage"} className="inline-flex items-center gap-2 bg-transparent border border-awburg-core text-awburg-core hover:bg-awburg-core hover:text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-5 rounded-full transition-all duration-200">
            LEARN MORE <ArrowRight className="w-3.5 h-3.5" />
          </button>
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

        <div className="mb-6 max-w-2xl">
          <iframe
            src="https://drive.google.com/file/d/1pEjiiWfD6H5mYkj4otMjAK897h35yKv6/preview"
            width="100%"
            style={{ aspectRatio: "16/9", borderRadius: "12px", border: "none" }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>

        <button className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep hover:shadow-md text-paper text-xs font-bold tracking-eyebrow uppercase py-3 px-6 rounded-full transition-all duration-200">
          BEGIN THE 30-MINUTE RESET
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Purchase CTA */}
      <section className="bg-awrose-pale rounded-xl p-8 md:p-10">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-deep mr-2 align-middle" />
          YOUR NEXT STEP
        </p>
        <h3 className="font-display text-awburg-core text-[28px] md:text-[36px] leading-tight mb-5 max-w-2xl">
          The Aligned Woman Blueprint was built for <span className="italic text-awrose-core">exactly this woman</span>.
        </h3>
        <p className="font-body font-bold text-[11px] tracking-eyebrow text-awburg-core/70 uppercase mb-6">
          R3,997 / ONE INVESTMENT · 1 YEAR ACCESS
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={onCheckout}
            className="inline-flex items-center gap-2 bg-awrose-core hover:bg-awrose-deep hover:shadow-md text-paper text-xs font-bold tracking-eyebrow uppercase py-4 px-8 rounded-full transition-all duration-200"
          >
            BEGIN THE BLUEPRINT
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.location.href = "/BlueprintPage"}
            className="inline-flex items-center gap-2 bg-transparent border border-awburg-core text-awburg-core hover:bg-awburg-core hover:text-paper text-xs font-bold tracking-eyebrow uppercase py-4 px-8 rounded-full transition-all duration-200"
          >
            LEARN MORE
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          {[
            
          ].map((line, i) => (
            <p
              key={i}
              className="font-body font-light text-awburg-core/75 text-sm leading-relaxed"
            >
              {line}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}