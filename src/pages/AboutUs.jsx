import React from "react";
import { Heart, Star, Globe, ArrowRight } from "lucide-react";

const TEAM = [
  {
    name: "Lauren Everet",
    role: "Founder & CEO",
    bio: "Lauren is a women's empowerment coach, entrepreneur, and the visionary behind The Aligned Woman Blueprint™. After her own journey through burnout, grief, and rebuilding, she created a framework to help women find their deepest alignment.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Dr. Priya Nair",
    role: "Head of Curriculum & Wellness",
    bio: "Priya brings 15 years of integrative medicine and psychology to The Aligned Woman. She designed the somatic and cycle-syncing modules at the heart of the ALIVE Method.",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Simone Dlamini",
    role: "Community Director",
    bio: "Simone's passion for creating safe, transformational spaces for women has shaped our community culture. She leads the member experience and ensures every woman feels seen and supported.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=500&fit=crop&crop=face",
  },
];

const VALUES = [
  { icon: "🌸", title: "Whole-Woman Approach", desc: "We honour the full spectrum of a woman's being — body, mind, soul, and circumstance." },
  { icon: "🔥", title: "Radical Honesty", desc: "We believe truth is the greatest act of love. We tell it — to ourselves and to you." },
  { icon: "💫", title: "Embodied Wisdom", desc: "Knowledge alone doesn't transform. Integration into lived experience is where the magic happens." },
  { icon: "🌍", title: "Inclusive Excellence", desc: "We build spaces where women of all backgrounds, cultures, and seasons of life are celebrated." },
];

export default function AboutUs() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="py-28 px-4 text-center" style={{ background: "linear-gradient(160deg,#1A0510 0%,#6E1D40 60%,#C4847A 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4 text-rose-300">Our Story</p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Built by Women,<br />
            <span style={{ color: "#E8B4AE" }}>for Women</span>
          </h1>
          <p className="text-white/80 text-xl leading-relaxed">
            The Aligned Woman was born from a single question: <em>"What would life look like if I was truly aligned?"</em>
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>Our Mission</p>
              <h2 className="text-4xl font-bold mb-6" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
                A World Where Every Woman Lives in Full Alignment
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We exist to equip women with the tools, knowledge, community, and guidance to live lives of deep meaning, embodied success, and joyful purpose.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Too many brilliant, capable women are living half-lives — achieving externally while feeling empty within. The Aligned Woman Blueprint™ bridges that gap, giving you a complete operating system for the life you were born to lead.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=700&fit=crop"
                alt="Women together"
                className="rounded-3xl shadow-2xl w-full object-cover"
                style={{ height: "480px" }}
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5">
                <div className="text-3xl font-bold" style={{ color: "#6E1D40" }}>500+</div>
                <div className="text-sm text-gray-500">Lives Transformed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4" style={{ background: "#FAF5F3" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>What We Stand For</p>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-7 flex gap-5 shadow-sm hover:shadow-md transition-all">
                <div className="text-4xl flex-shrink-0">{v.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#6E1D40" }}>{v.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#C4847A" }}>The Team</p>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              The Hearts Behind the Mission
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {TEAM.map((member) => (
              <div key={member.name} className="group text-center">
                <div className="relative mx-auto mb-6 w-48 h-64 rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#6E1D40]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "#6E1D40" }}>{member.name}</h3>
                <p className="text-sm font-semibold mb-3" style={{ color: "#C4847A" }}>{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Impact */}
      <section className="py-20 px-4" style={{ background: "linear-gradient(135deg,#6E1D40,#943A59)" }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>A Global Sisterhood</h2>
          <p className="text-white/75 text-lg mb-8 max-w-2xl mx-auto">
            Women from over 30 countries have found their alignment through this programme. Our community spans South Africa, the UK, Australia, the US, and beyond.
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            {["🇿🇦 South Africa", "🇬🇧 United Kingdom", "🇺🇸 United States", "🇦🇺 Australia", "🇮🇳 India"].map((c) => (
              <span key={c} className="bg-white/15 px-5 py-2.5 rounded-full text-sm font-medium">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "#6E1D40", fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Ready to Begin?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">Join thousands of women who have already found their alignment.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/blueprint"
              className="group inline-flex items-center gap-2 text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#6E1D40,#C4847A)" }}
            >
              View the Programme <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}