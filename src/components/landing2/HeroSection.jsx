import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function HeroSection({ onWaitlist }) {
  const scrollToExplore = () => {
    document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ minHeight: "100vh" }}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1800&q=80&fit=crop')" }}
      />
      {/* Dark maroon overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(40, 5, 20, 0.72)" }} />

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-10 px-5 py-2 rounded-full text-xs font-bold tracking-[0.25em] uppercase"
          style={{ border: "1px solid rgba(196,134,108,0.5)", color: "#C4866C", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)" }}
        >
          ✦ The Education Women Should Have Been Given
        </div>

        {/* Headline */}
        <h1 className="text-white uppercase font-bold tracking-tight leading-none mb-2" style={{ fontSize: "clamp(2.8rem, 8vw, 6.5rem)", fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "0.04em" }}>
          THE ALIGNED
        </h1>
        <h1 className="italic font-bold leading-none mb-2" style={{ fontSize: "clamp(3rem, 9vw, 7rem)", fontFamily: "'DM Serif Display', Georgia, serif", color: "#C4866C" }}>
          Woman
        </h1>
        <h1 className="text-white uppercase font-bold tracking-widest leading-none mb-10" style={{ fontSize: "clamp(1.8rem, 5vw, 3.5rem)", fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "0.3em" }}>
          CO.
        </h1>

        {/* Sub copy */}
        <p className="text-white/75 mb-3 max-w-2xl leading-relaxed" style={{ fontSize: "clamp(0.95rem, 2vw, 1.15rem)" }}>
          Join a global community of women doing the inner and outer work, with access to programmes, events, and tools designed for real life.
        </p>
        <p className="mb-10 italic" style={{ color: "#C4866C", fontSize: "clamp(0.85rem, 1.6vw, 1rem)" }}>
          Learn about our flagship course, The Aligned Woman Blueprint
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            to="/blueprint"
            className="inline-block px-8 py-4 font-bold text-sm tracking-[0.18em] uppercase transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "#C4866C", color: "#fff", letterSpacing: "0.18em" }}
          >
            Begin Your Blueprint +
          </Link>
          <button
            onClick={scrollToExplore}
            className="inline-block px-8 py-4 font-bold text-sm tracking-[0.18em] uppercase border border-white/50 text-white transition-all hover:bg-white/10"
          >
            Explore The Programme
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/30 text-xs tracking-[0.2em] uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 text-white/30" />
      </div>
    </section>
  );
}