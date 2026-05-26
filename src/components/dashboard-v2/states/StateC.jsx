import React from "react";
import { ArrowRight } from "lucide-react";

const ARCHETYPE_LABELS = {
  performer: "The Performer",
  over_functioner: "The Over-Functioner",
  delegator: "The Delegator",
  overrider: "The Overrider",
  reactor: "The Reactor",
};

export default function StateC({ user, profile, onCheckout }) {
  const archetypeKey = profile?.computed_archetype_key;
  const archetypeLabel = ARCHETYPE_LABELS[archetypeKey] || "The Performer";
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();

  return (
    <div className="space-y-6">
      <section className="bg-awburg-core rounded-xl p-8 md:p-10 text-paper">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8 items-start">
          <div>
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-light uppercase mb-4">
              YOUR DIAGNOSIS · {today}
            </p>
            <h2 className="font-display text-paper text-[30px] md:text-[40px] leading-tight mb-5">
              Your identity is <span className="italic text-awrose-light">performance-dependent</span>.
            </h2>
            <p className="font-body font-light text-paper/85 text-sm md:text-base leading-relaxed max-w-xl">
              You have built a self that runs on output. That self is impressive. It is also tired. The pattern you carry has a name, and naming it changes what you can do about it.
            </p>
          </div>

          <div className="bg-awrose-pale rounded-xl p-6 text-center">
            <p className="font-body font-bold text-[9px] tracking-eyebrow text-awrose-deep uppercase mb-1">
              YOUR ARCHETYPE
            </p>
            <p className="font-display italic text-awburg-core text-2xl leading-tight">
              {archetypeLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper rounded-xl border border-awburg-core/8 p-6 md:p-8">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-core mr-2 align-middle" />
          WHAT THIS MEANS
        </p>
        <h3 className="font-display text-awburg-core text-[28px] md:text-[34px] leading-tight mb-5">
          The pattern, <span className="italic text-awrose-core">named</span>.
        </h3>
        <div className="space-y-4 max-w-2xl">
          <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
            The Performer learned early that love and safety follow output. So she learned to produce. The output became identity. The identity became cage.
          </p>
          <p className="font-body font-light text-awburg-core/80 text-sm md:text-base leading-relaxed">
            This is the most common pattern in high-functioning women. It is not weakness. It was the strategy that worked. It is also the reason you are exhausted at 35 and cannot remember the last time you wanted something for yourself, not for the version of yourself other people approve of.
          </p>
        </div>
      </section>

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

      <section className="bg-awrose-pale rounded-xl p-8 md:p-10">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-deep uppercase mb-4">
          <span className="inline-block w-3 h-px bg-awrose-deep mr-2 align-middle" />
          YOUR NEXT STEP
        </p>
        <h3 className="font-display text-awburg-core text-[28px] md:text-[36px] leading-tight mb-5 max-w-2xl">
          The Aligned Woman Blueprint was built for <span className="italic text-awrose-core">exactly this woman</span>.
        </h3>
        <p className="font-body font-bold text-[11px] tracking-eyebrow text-awburg-core/70 uppercase mb-6">
          R3,997 / ONE INVESTMENT · LIFETIME ACCESS
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
            "2,000+ women already inside",
            "14 globally credentialled specialists",
            "Featured on CNBC Africa & ENCA",
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