import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function HeroSection({ onWaitlist }) {
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    const el = sectionRef.current;
    if (el) el.addEventListener("mousemove", handleMouseMove);
    return () => { if (el) el.removeEventListener("mousemove", handleMouseMove); };
  }, []);

  const scrollToExplore = () => {
    document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
  };

  const gradientX = `${mousePos.x * 100}%`;
  const gradientY = `${mousePos.y * 100}%`;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1800&q=80&fit=crop')" }}
      />

      {/* Base dark maroon overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(50, 8, 25, 0.82)" }}
      />

      {/* Mouse-tracking radial light gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse 55% 55% at ${gradientX} ${gradientY}, rgba(180, 60, 80, 0.28) 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto w-full">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-14 px-5 py-2 rounded-full text-xs font-semibold tracking-[0.22em] uppercase"
          style={{
            border: "1px solid rgba(196,134,108,0.45)",
            color: "#C4866C",
            background: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(8px)",
          }}
        >
          ✦ The Education Women Should Have Been Given
        </div>

        {/* Headline */}
        <div className="mb-10 leading-none">
          <div
            className="text-white font-bold uppercase tracking-[0.05em] leading-none"
            style={{ fontSize: "clamp(2.6rem, 7vw, 5.5rem)", fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            The Aligned
          </div>
          <div
            className="italic font-bold leading-none"
            style={{
              fontSize: "clamp(3rem, 8.5vw, 6.8rem)",
              fontFamily: "'DM Serif Display', Georgia, serif",
              color: "#C4866C",
            }}
          >
            Woman
          </div>
          <div
            className="text-white font-bold uppercase tracking-[0.1em] leading-none mt-1"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Co.
          </div>
        </div>

        {/* Sub copy */}
        <p
          className="text-white/75 mb-3 max-w-xl leading-relaxed"
          style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)" }}
        >
          Join a global community of women doing the inner and outer work,
          <br className="hidden sm:block" />
          with access to programmes, events, and tools designed for real life.
        </p>
        <p
          className="mb-10 text-sm"
          style={{ color: "#C4866C" }}
        >
          Learn about our flagship course, The Aligned Woman Blueprint
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <Link
            to="/blueprint"
            className="w-full inline-flex items-center justify-center px-8 py-4 font-bold text-xs tracking-[0.2em] uppercase rounded-full transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "#C4866C", color: "#fff" }}
          >
            Begin Your Blueprint +
          </Link>
          <button
            onClick={scrollToExplore}
            className="w-full inline-flex items-center justify-center px-8 py-3.5 font-bold text-xs tracking-[0.2em] uppercase rounded-full border text-white transition-all hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.35)" }}
          >
            Explore The Programme
          </button>
        </div>
      </div>

      {/* Scroll mouse indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div
          className="w-6 h-9 rounded-full border-2 flex items-start justify-center pt-1.5"
          style={{ borderColor: "rgba(255,255,255,0.4)" }}
        >
          <div
            className="w-1 h-2 rounded-full animate-bounce"
            style={{ background: "rgba(255,255,255,0.5)" }}
          />
        </div>
      </div>
    </section>
  );
}