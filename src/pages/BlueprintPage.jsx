import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, Star, Sparkles } from "lucide-react";
import PricingSection from "@/components/blueprint/PricingSection";

const ALIVE_PHASES = [
  {
    letter: "A",
    title: "Awareness",
    color: "#7C3AED",
    bg: "#F5F3FF",
    modules: ["Nervous System Regulation", "Cycle Syncing & Hormones", "Subconscious Pattern Recognition", "Somatic Embodiment Intro"],
  },
  {
    letter: "L",
    title: "Liberation",
    color: "#B45309",
    bg: "#FFFBEB",
    modules: ["Trauma-Informed Healing", "Shadow Work", "Relationship Patterns", "Financial Wound Healing"],
  },
  {
    letter: "I",
    title: "Intention",
    color: "#0369A1",
    bg: "#F0F9FF",
    modules: ["Values Alignment", "Purpose Mapping", "Vision Board Mastery", "Decision-Making Frameworks"],
  },
  {
    letter: "V",
    title: "Vision",
    color: "#059669",
    bg: "#ECFDF5",
    modules: ["Life Architecture", "Business & Career Design", "Relationships by Design", "Legacy Planning"],
  },
  {
    letter: "E",
    title: "Embodiment",
    color: "#BE185D",
    bg: "#FDF2F8",
    modules: ["Identity Integration", "Embodied Leadership", "Wealth Embodiment", "Sustainable Success Rituals"],
  },
];

const PROGRAMME_FEATURES = [
  "24/7 access to the learning portal",
  "Weekly live group coaching calls",
  "5 expert panel sessions per phase",
  "Private member community",
  "Personalised workbooks per module",
  "Human Design & Astrology integration",
  "LaurAI — your AI alignment coach",
  "Lifetime access to recordings",
];

export default function BlueprintPage() {
  const [activePhase, setActivePhase] = useState(0);
  const [affiliateCode, setAffiliateCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aff = params.get("aff");
    if (aff) {
      setAffiliateCode(aff);
      sessionStorage.setItem("aff", aff);
    } else {
      const stored = sessionStorage.getItem("aff");
      if (stored) setAffiliateCode(stored);
    }
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-28 px-4 text-center" style={{ background: "linear-gradient(160deg,#1A0510 0%,#6E1D40 60%,#943A59 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-rose-300" />
            <span className="text-white/90 text-sm font-medium">Now Enrolling — Cohort 6</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            The Aligned Woman<br />
            <span style={{ color: "#E8B4AE" }}>Blueprint™</span>
          </h1>
          <p className="text-white/80 text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            A 6-month transformational immersion for women who are done playing small and ready to step fully into their most aligned, purposeful, and powerful lives.
          </p>
          <a
            href="#pricing"
            className="group inline-flex items-center gap-2 bg-white text-[#6E1D40] font-bold px-10 py-4 rounded-full text-lg hover:bg-rose-50 transition-all hover:shadow-2xl hover:-translate-y-1"
          >
            Enrol Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>What You Get</p>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Everything You Need to Transform
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {PROGRAMME_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "#FAF5F3" }}>
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#6E1D40" }} />
                <span className="text-gray-800 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programme Structure — ALIVE Phases */}
      <section className="py-24 px-4" style={{ background: "#FAF5F3" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>Programme Structure</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Five Phases. One Transformation.
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Each phase is 6 weeks of deep, curated content with live expert panels.</p>
          </div>

          {/* Phase Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {ALIVE_PHASES.map((phase, i) => (
              <button
                key={phase.letter}
                onClick={() => setActivePhase(i)}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all"
                style={{
                  background: i === activePhase ? phase.color : "#fff",
                  color: i === activePhase ? "#fff" : phase.color,
                  border: `2px solid ${phase.color}`,
                  boxShadow: i === activePhase ? `0 4px 20px ${phase.color}40` : "none",
                }}
              >
                <span className="text-lg">{phase.letter}</span> {phase.title}
              </button>
            ))}
          </div>

          {/* Phase Detail */}
          {ALIVE_PHASES.map((phase, i) => (
            i === activePhase && (
              <div
                key={phase.letter}
                className="rounded-3xl p-8 md:p-12"
                style={{ background: phase.bg, border: `1px solid ${phase.color}20` }}
              >
                <div className="flex items-start gap-6 mb-8">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 shadow-lg"
                    style={{ background: phase.color }}
                  >
                    {phase.letter}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-2" style={{ color: "#3A2A28", fontFamily: "'DM Serif Display', Georgia, serif" }}>
                      Phase {i + 1}: {phase.title}
                    </h3>
                    <p className="text-gray-500">6 weeks · Expert panels · Live coaching · Personal workbook</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {phase.modules.map((mod) => (
                    <div key={mod} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: phase.color }} />
                      <span className="text-gray-800 font-medium text-sm">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Expert Panels */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>Expert Panels</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Guidance from the Best
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Each phase includes live sessions with world-class experts in women's health, psychology, business, and spirituality.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { phase: "Awareness", experts: ["Somatic Coach", "Hormone Specialist", "Neuroscientist"], icon: "🧠" },
              { phase: "Liberation", experts: ["Trauma Therapist", "Shadow Work Guide", "Relationship Coach"], icon: "🦋" },
              { phase: "Vision", experts: ["Business Strategist", "Financial Coach", "Life Architect"], icon: "🔭" },
            ].map((panel) => (
              <div key={panel.phase} className="rounded-2xl p-7" style={{ background: "linear-gradient(135deg,#F5E8EE,#FDF5F3)" }}>
                <div className="text-4xl mb-4">{panel.icon}</div>
                <h3 className="font-bold text-lg mb-4" style={{ color: "#6E1D40" }}>Phase: {panel.phase}</h3>
                <div className="space-y-2">
                  {panel.experts.map((e) => (
                    <div key={e} className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#C4847A" }} />
                      {e}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4" style={{ background: "#FAF5F3" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
            What Graduates Say
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { quote: "The Blueprint was the investment that changed everything. I went from burnout to building a business I love in 6 months.", name: "Anné P." },
              { quote: "I finally feel at home in my own body. The ALIVE method gave me language for what I always knew deep inside.", name: "Thandi M." },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 text-left shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#C4847A" }} />)}
                </div>
                <p className="text-gray-700 italic leading-relaxed mb-4">"{t.quote}"</p>
                <div className="font-bold text-sm" style={{ color: "#6E1D40" }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection affiliateCode={affiliateCode} />
    </div>
  );
}