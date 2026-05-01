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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Background Image */}
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c1af736e30d6ce22780c4/19e69afb3_laptop-computer-girl-woman-home-technology-female-2025-01-29-14-44-55-utc.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(155deg, rgba(8,1,5,0.92) 0%, rgba(26,5,16,0.88) 40%, rgba(45,8,25,0.85) 70%, rgba(14,2,8,0.92) 100%)" }}
      />

      {/* Mouse-tracking radial light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(55% 45% at ${gradientX} ${gradientY}, rgba(196,132,122,0.25) 0%, rgba(26,5,16,0.08) 55%, transparent 100%)`,
          transition: "background 0.1s",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12 lg:py-16 pt-24 md:pt-28 text-center w-full">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2"
          style={{
            background: "rgba(196,132,122,0.1)",
            border: "1px solid rgba(196,132,122,0.25)",
            borderRadius: "100px",
            padding: "10px 20px",
            marginBottom: 8,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgb(196,132,122)", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgb(232,180,174)" }}>
            The Education Women Should Have Been Given
          </span>
        </div>

        {/* Logo Image */}
        <div style={{ marginBottom: 2, marginTop: "-4%" }}>
          <img
            src="https://media.base44.com/images/public/695980c2c3913565a9515787/4fce16830_Untitleddesign1.png"
            alt="The Aligned Woman Co."
            style={{ width: "clamp(340px, 58vw, 640px)", height: "auto", margin: "0 auto", display: "block" }}
          />
        </div>

        {/* Sub copy */}
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.85, color: "rgba(255,255,255,0.8)" }}>
            Join a global community of women doing the inner and outer work,<br />
            with access to programmes, events, and tools designed for real life.
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: "clamp(13px, 1.5vw, 16px)", fontWeight: 500, lineHeight: 1.85, color: "rgba(255,255,255,0.8)" }}>
            Learn about our flagship course, The Aligned Woman Blueprint
          </p>
        </div>

        {/* CTAs — side by side */}
        <div className="flex flex-row items-center justify-center flex-wrap gap-2" style={{ marginBottom: 24 }}>
          <Link
            to="/blueprint"
            style={{
              background: "rgb(196,132,122)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "19px 44px",
              borderRadius: "100px",
              boxShadow: "rgba(196,132,122,0.28) 0px 8px 32px",
              textDecoration: "none",
              display: "inline-block",
              transition: "background 0.2s",
              minWidth: 220,
              textAlign: "center",
            }}
          >
            Begin Your Blueprint +
          </Link>
          <button
            onClick={scrollToExplore}
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.55)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              padding: "18px 44px",
              borderRadius: "100px",
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
              minWidth: 220,
            }}
          >
            Explore The Programme
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-9 border-2 border-white/40 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}