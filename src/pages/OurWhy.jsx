import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const EYEBROW = ({ children }) => (
  <p className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#C4847A] mb-4">{children}</p>
);

const ITALIC_SERIF = ({ children }) => (
  <span className="font-display italic">{children}</span>
);

export default function OurWhy() {
  return (
    <div className="bg-[#FAF5F3] pt-20 font-body">

      {/* HERO */}
      <section className="py-20 text-center max-w-2xl mx-auto px-6">
        <EYEBROW>Why this education has</EYEBROW>
        <h1 className="font-display text-4xl sm:text-5xl text-[#4A0E2E] leading-tight mb-6">
          Why this education has<br />
          <ITALIC_SERIF>never existed.</ITALIC_SERIF>
        </h1>
        <p className="text-[#6B4C55] text-base leading-relaxed max-w-xl mx-auto">
          Women have always been the most influential people in any ecosystem. Yet the education system has never been designed with the female brain, body, or lived experience at its centre.
        </p>
      </section>

      {/* STATS */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center mb-12">
          <EYEBROW>The numbers don't lie</EYEBROW>
          <h2 className="font-display text-3xl sm:text-4xl text-[#4A0E2E]">
            The numbers <ITALIC_SERIF>don't lie.</ITALIC_SERIF>
          </h2>
        </div>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { stat: "78%", desc: "of women report burnout as their primary reason for leaving high-performance careers — yet receive no systemic education on prevention." },
            { stat: "2x", desc: "Women are twice as likely to experience anxiety and depression — and half as likely to receive gender-informed treatment or support." },
            { stat: "$800B", desc: "lost annually in productivity due to unaddressed female health and hormonal issues in the workplace — with zero formal education on root causes." },
          ].map(({ stat, desc }) => (
            <div key={stat} className="text-left">
              <p className="font-display text-4xl text-[#C4847A] mb-2">{stat}</p>
              <p className="text-sm text-[#6B4C55] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Quote block */}
        <div className="max-w-3xl mx-auto px-6 mt-16">
          <div className="bg-[#4A0E2E] rounded-2xl p-8 text-center">
            <p className="text-white text-base sm:text-lg leading-relaxed font-body">
              Women weren't excluded from mainstream education because they weren't capable. They were excluded because the system was never designed to include them. It wasn't built around their bodies, their biology, their cycles, or their way of knowing. And that gap — that vast, deliberate gap — is exactly what we exist to close.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT'S TAUGHT / WHAT ISN'T */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <EYEBROW>The education gap</EYEBROW>
          <h2 className="font-display text-3xl sm:text-4xl text-[#4A0E2E]">
            What's taught.<br />
            <ITALIC_SERIF>What isn't.</ITALIC_SERIF>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#C4847A] font-bold mb-4">Traditional education teaches:</p>
            <ul className="space-y-3">
              {["Hard skills & technical knowledge", "Linear productivity systems", "Goal setting & KPI tracking", "Leadership modelled on male frameworks", "Stress management through willpower"].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#6B4C55]">
                  <span className="mt-1 w-4 h-4 flex-shrink-0 rounded-full border border-[#C4847A]/40 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C4847A]/40" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[#4A0E2E] font-bold mb-4">What women actually need:</p>
            <ul className="space-y-3">
              {[
                "Hormonal literacy & cycle intelligence",
                "Nervous system regulation & capacity building",
                "Identity evolution & archetype awareness",
                "Embodied leadership & feminine power",
                "Financial intelligence rooted in self-worth",
                "Nutritional science designed for female biology",
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#4A0E2E]">
                  <span className="mt-1 w-4 h-4 flex-shrink-0 rounded-full bg-[#C4847A]/20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C4847A]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-[#6B4C55] italic">
          This education system will never be offered in schools.<br />
          It has to exist beyond conventional training.
        </p>
      </section>

      {/* WHY AWB EXISTS */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <EYEBROW>Our reason for being</EYEBROW>
            <h2 className="font-display text-3xl sm:text-4xl text-[#4A0E2E]">
              Why The Aligned Woman<br />
              <ITALIC_SERIF>Blueprint™</ITALIC_SERIF> exists.
            </h2>
            <p className="mt-4 text-sm text-[#6B4C55] max-w-lg mx-auto">
              Because no single domain can address the full complexity of a woman's experience. She needs an integrated system.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E8B4AE]/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5DDD9]">
                  <th className="text-left p-4 text-[#4A0E2E] font-bold text-xs tracking-widest uppercase">What exists</th>
                  <th className="text-left p-4 text-[#4A0E2E] font-bold text-xs tracking-widest uppercase">What it delivers</th>
                  <th className="text-left p-4 text-[#4A0E2E] font-bold text-xs tracking-widest uppercase">What's missing</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Wellness Apps", "Symptom tracking, habit nudges", "Root cause education, integration"],
                  ["Business Coaching", "Strategy, sales, mindset", "Biology, identity, embodiment"],
                  ["Therapy / Psychology", "Mental health support", "Performance, leadership, ambition"],
                  ["Hormone Clinics", "Medical treatment", "Self-directed education, tools"],
                  ["Social Media", "Information overload", "Coherent, structured, safe to learn"],
                ].map(([what, delivers, missing]) => (
                  <tr key={what} className="border-t border-[#E8B4AE]/30">
                    <td className="p-4 text-[#4A0E2E] font-medium">{what}</td>
                    <td className="p-4 text-[#6B4C55]">{delivers}</td>
                    <td className="p-4 text-[#C4847A]">{missing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-center text-base font-bold text-[#4A0E2E]">
            All in one coherent, structured and safe to learn <br />
            <span className="font-display italic text-xl">Education.</span>
          </p>
        </div>
      </section>

      {/* BECAUSE WHEN WOMEN UNDERSTAND */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <EYEBROW>The ripple effect</EYEBROW>
          <h2 className="font-display text-3xl sm:text-4xl text-[#4A0E2E]">
            Because when women<br />
            understand <ITALIC_SERIF>how they work,</ITALIC_SERIF> everything changes.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "At home", value: "They lead with presence, not pressure." },
            { label: "Confidence", value: "Rooted in knowing, not performance." },
            { label: "Their own wellbeing", value: "Managed with intelligence, not willpower." },
            { label: "Money", value: "Earned and held with self-worth intact." },
            { label: "Leadership", value: "Embodied, not performed." },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#E8B4AE]/30">
              <div className="flex-shrink-0 w-24 text-xs text-[#C4847A] font-bold uppercase tracking-widest pt-0.5">{label}</div>
              <div className="text-sm text-[#4A0E2E]">{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-[#4A0E2E] py-24 text-center px-6">
        <p className="font-display text-3xl sm:text-4xl text-white leading-tight max-w-2xl mx-auto mb-8">
          Women don't need more <ITALIC_SERIF>motivation.</ITALIC_SERIF><br />
          They need the education<br />
          they were <ITALIC_SERIF>never given.</ITALIC_SERIF>
        </p>
        <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
          The Aligned Woman Blueprint is the first education system built entirely around the female brain, body, and lived experience.
        </p>
        <div className="flex justify-center">
          <Link
            to="/blueprint"
            className="inline-flex items-center justify-center px-12 py-4 rounded-full border border-white/30 text-white font-bold text-base tracking-widest uppercase hover:bg-white/10 transition-colors"
          >
            Learn More
          </Link>
        </div>

      </section>
    </div>
  );
}