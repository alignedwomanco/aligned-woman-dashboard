import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronDown, Sparkles, Star, Heart, Globe } from "lucide-react";
import WaitlistModal from "@/components/landing/WaitlistModal";
import ExpertShowcase from "@/components/landing/ExpertShowcase";
import BlogSection from "@/components/landing/BlogSection";
import GeoPricingBanner from "@/components/landing/GeoPricingBanner";

const ALIVE_PHASES = [
  { letter: "A", title: "Awareness", color: "#7C3AED", desc: "Understand your patterns, your body, and your truth." },
  { letter: "L", title: "Liberation", color: "#B45309", desc: "Release what holds you back — stories, trauma, conditioning." },
  { letter: "I", title: "Intention", color: "#0369A1", desc: "Set aligned goals from a place of wholeness, not lack." },
  { letter: "V", title: "Vision", color: "#059669", desc: "Architect the life you are truly here to live." },
  { letter: "E", title: "Embodiment", color: "#BE185D", desc: "Live, breathe, and embody your aligned woman identity." },
];

export default function LandingPage() {
  const [showWaitlist, setShowWaitlist] = useState(false);
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
      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} affiliateCode={affiliateCode} />}

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg, #1A0510 0%, #6E1D40 40%, #943A59 75%, #C4847A 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-10" style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              background: "radial-gradient(circle, #E8B4AE, transparent)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: "translate(-50%, -50%)",
            }} />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-rose-300" />
            <span className="text-white/90 text-sm font-medium">The Aligned Woman Programme</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Become the Woman<br />
            <span style={{ color: "#E8B4AE" }}>You Were Born to Be</span>
          </h1>
          <p className="text-white/80 text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed">
            A transformative 6-month programme for women ready to align their inner world with their outer success — through the ALIVE Method™.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowWaitlist(true)}
              className="group inline-flex items-center gap-2 bg-white text-[#6E1D40] font-bold px-10 py-4 rounded-full text-lg hover:bg-rose-50 transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              Join the Waitlist
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="/blueprint"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-white/20 transition-all"
            >
              Explore Programme
            </a>
          </div>

          <div className="mt-16 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/50 mx-auto" />
          </div>
        </div>
      </section>

      {/* Programme Overview */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>Programme Overview</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Your Personal Operating System
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              The Aligned Woman Blueprint™ is more than a programme — it's a complete rewiring of how you live, lead, and love.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: "🧠", title: "Mind & Identity", desc: "Decode your subconscious patterns and rewrite your internal narrative with expert guidance." },
              { icon: "💫", title: "Body & Cycle", desc: "Harness your cyclical nature — hormones, energy, and intuition — as your greatest power." },
              { icon: "💰", title: "Wealth & Legacy", desc: "Build financial sovereignty and create a life of meaning, abundance, and purpose." },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl p-8 text-center border border-rose-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="text-5xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#6E1D40" }}>{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "500+", label: "Women Transformed" },
              { value: "20+", label: "Expert Mentors" },
              { value: "6", label: "Months of Support" },
              { value: "5", label: "ALIVE Phases" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl" style={{ background: "linear-gradient(135deg,#F5E8EE,#FDF5F3)" }}>
                <div className="text-3xl font-bold mb-1" style={{ color: "#6E1D40" }}>{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALIVE Method */}
      <section className="py-24 px-4" style={{ background: "#FAF5F3" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>The Framework</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              The ALIVE Method™
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Five phases. One complete transformation.</p>
          </div>

          <div className="space-y-4">
            {ALIVE_PHASES.map((phase, i) => (
              <div key={phase.letter} className="flex gap-6 items-start p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: phase.color }}
                >
                  {phase.letter}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold mb-1" style={{ color: "#3A2A28" }}>{phase.title}</h3>
                  <p className="text-gray-600">{phase.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center text-sm flex-shrink-0 mt-1" style={{ borderColor: phase.color, color: phase.color }}>
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experts */}
      <ExpertShowcase />

      {/* Social Proof */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Women Like You
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "This programme didn't just change my mindset — it changed who I am. I found my voice, my worth, and my next chapter.", name: "Sarah M.", location: "Cape Town, SA" },
              { quote: "For the first time in 20 years, I feel completely aligned. My business grew 3x and my marriage is stronger than ever.", name: "Priya K.", location: "London, UK" },
              { quote: "The ALIVE Method gave me a framework for life. I wake up every day knowing exactly who I am and where I'm going.", name: "Michelle T.", location: "Sydney, AU" },
            ].map((t) => (
              <div key={t.name} className="p-8 rounded-2xl border border-rose-100 hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#C4847A" }} />)}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <div className="font-bold" style={{ color: "#6E1D40" }}>{t.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {t.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <BlogSection />

      {/* Geo Pricing CTA */}
      <GeoPricingBanner onJoinClick={() => setShowWaitlist(true)} />

      {/* Final CTA */}
      <section className="py-24 px-4 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Your Aligned Life is Waiting
          </h2>
          <p className="text-gray-600 text-lg mb-10">
            Don't let another year pass where you feel out of alignment. The next cohort is forming now.
          </p>
          <button
            onClick={() => setShowWaitlist(true)}
            className="group inline-flex items-center gap-2 text-white font-bold px-12 py-5 rounded-full text-lg transition-all hover:shadow-2xl hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
          >
            Join the Waitlist <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}