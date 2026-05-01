import React, { useEffect, useRef, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

export default function BlueprintPage() {
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aff = params.get("aff");
    if (aff) {
      sessionStorage.setItem("aff", aff);
    }
  }, []);

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
    return () => {
      if (el) el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Fetch experts and categories
  const { data: experts = [] } = useQuery({
    queryKey: ["experts"],
    queryFn: () => base44.entities.Expert.filter({ isPublished: true }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["expertCategories"],
    queryFn: () => base44.entities.ExpertCategory.list(),
  });

  // Group experts by category
  const expertsByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach((cat) => {
      grouped[cat.id] = { ...cat, experts: [] };
    });
    experts.forEach((expert) => {
      if (expert.category_id && grouped[expert.category_id]) {
        grouped[expert.category_id].experts.push(expert);
      }
    });
    return Object.values(grouped).filter((cat) => cat.experts.length > 0);
  }, [experts, categories]);

  const gradientX = `${mousePos.x * 100}%`;
  const gradientY = `${mousePos.y * 100}%`;

  return (
    <div className="overflow-x-hidden">
      {/* SECTION 1: PROMO BANNER */}
      <div
        style={{
          background: "#1a0a10",
          borderBottom: "1px solid rgba(196,132,122,0.15)",
          padding: "10px 16px",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.75)",
            fontFamily: "Montserrat, sans-serif",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#E05C2A",
              flexShrink: 0,
            }}
          />
          Founding Price R3,997 · Doors Open 1 May 2026 · Price Rises At Launch
        </span>
      </div>

      {/* SECTION 2: HERO */}
      <section
        ref={sectionRef}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh", paddingBottom: 48 }}
      >
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c1af736e30d6ce22780c4/19e69afb3_laptop-computer-girl-woman-home-technology-female-2025-01-29-14-44-55-utc.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(155deg, rgba(8,1,5,0.94) 0%, rgba(26,5,16,0.90) 40%, rgba(45,8,25,0.88) 70%, rgba(14,2,8,0.94) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(55% 45% at ${gradientX} ${gradientY}, rgba(196,132,122,0.22) 0%, rgba(26,5,16,0.06) 55%, transparent 100%)`,
            transition: "background 0.1s",
          }}
        />

        <div
          className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center"
          style={{ paddingTop: "clamp(80px, 12vw, 120px)" }}
        >
          {/* Eyebrow badge */}
          <div style={{ marginBottom: 24 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(232,180,174,0.9)",
                background: "rgba(196,132,122,0.1)",
                border: "1px solid rgba(196,132,122,0.25)",
                borderRadius: "100px",
                padding: "10px 20px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <span style={{ color: "rgba(196,132,122,0.8)", fontSize: 10 }}>
                ●
              </span>
              The Education Women Should Have Been Given
            </span>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "rgba(255,255,255,0.6)",
              marginBottom: 28,
              lineHeight: 1.5,
            }}
          >
            "You have achieved everything you were supposed to want. And you are
            still not okay."
          </p>

          {/* Main headline */}
          <div style={{ lineHeight: 0.95, marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(48px, 8vw, 80px)",
                color: "#fff",
                lineHeight: 0.95,
              }}
            >
              THE ALIGNED
            </div>
            <div
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontWeight: 400,
                fontStyle: "italic",
                fontSize: "clamp(60px, 10vw, 100px)",
                color: "#C4847A",
                lineHeight: 0.95,
              }}
            >
              Woman
            </div>
            <div
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: "clamp(48px, 8vw, 80px)",
                color: "#fff",
                lineHeight: 0.95,
              }}
            >
              BLUEPRINT
            </div>
          </div>

          {/* Est line */}
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              letterSpacing: "0.3em",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            blueprint™ · est. 2026
          </p>

          {/* Topic pills */}
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "0.06em",
              marginBottom: 12,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Psychology · Money · Health · Identity · Leadership
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 32,
              fontFamily: "Montserrat, sans-serif",
              lineHeight: 1.6,
            }}
          >
            The only programme of its kind. 14 globally recognised specialists.
            One sequenced system.
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              marginBottom: 32,
              overflow: "hidden",
            }}
          >
            {[
              { num: "14", label: "SPECIALISTS" },
              { num: "7", label: "LIFE DOMAINS" },
              { num: "R116,200", label: "PRIVATE VALUE", strikethrough: true, isRose: true },
              { num: "R3,997", label: "YOUR INVESTMENT", highlight: true },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  padding: "24px 16px",
                  textAlign: "center",
                  borderLeft:
                    i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  background: stat.highlight
                    ? "rgba(196,132,122,0.08)"
                    : "transparent",
                }}
              >
                <div
                  style={{
                    fontFamily: stat.isRose
                      ? "'DM Serif Display', Georgia, serif"
                      : "Montserrat, sans-serif",
                    fontStyle: stat.isRose ? "italic" : "normal",
                    fontWeight: stat.isRose ? 400 : 800,
                    fontSize: stat.highlight
                      ? "clamp(28px, 5vw, 48px)"
                      : "clamp(28px, 4vw, 44px)",
                    color: stat.isRose ? "#C4847A" : "#fff",
                    textDecoration: stat.strikethrough
                      ? "line-through"
                      : "none",
                    textDecorationColor: "rgba(196,132,122,0.6)",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {stat.num}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div
            className="flex flex-row items-center justify-center flex-wrap"
            style={{ gap: 12, marginBottom: 16 }}
          >
            <button
              style={{
                background: "rgb(196,132,122)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "16px 36px",
                borderRadius: "100px",
                boxShadow: "rgba(196,132,122,0.3) 0px 8px 32px",
                border: "none",
                cursor: "pointer",
                display: "inline-block",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Begin Your Blueprint +
            </button>
            <button
              onClick={() =>
                document.getElementById("experts")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                padding: "15px 36px",
                borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Explore The Programme
            </button>
          </div>

          {/* Fine print */}
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "Montserrat, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            30-day completion guarantee · No credit card required to begin
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div
            className="w-6 h-9 border-2 border-white/40 rounded-full flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* SECTION 3: SCROLLING MARQUEE */}
      <div style={{ background: "#0d0205", padding: "16px 0", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            gap: 48,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            "Psychology",
            "Money & Wealth",
            "Nervous System",
            "Identity",
            "Leadership",
            "Relationships",
            "Decision-Making",
          ].map((t, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#fff",
                fontFamily: "Montserrat, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {t} <span style={{ opacity: 0.5 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* SECTION 4: VIDEO + EXPERT INTRO */}
      <section style={{ background: "#0d0205", padding: "clamp(72px, 8vw, 128px) 0 0 0" }}>
        {/* Video placeholder */}
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            paddingBottom: "clamp(72px, 8vw, 128px)",
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
          }}
        >
          <div
            style={{
              width: "100%",
              paddingBottom: "56.25%",
              position: "relative",
              background: "rgba(196,132,122,0.1)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(196,132,122,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 32, color: "#C4847A" }}>▶</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert intro + grid */}
      <section style={{ background: "#f3e2e2", padding: "clamp(72px, 8vw, 128px) clamp(24px, 5vw, 80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#C4847A",
              marginBottom: 16,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Our Specialists
          </p>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              color: "#6B1B3D",
              marginBottom: 12,
            }}
          >
            14 World-Class Experts
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#888",
              marginBottom: 48,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Teach the education you were never given.
          </p>
        </div>
      </section>

      {/* SECTION 6: MEET OUR EXPERTS - Live Data */}
      <section id="experts" style={{ background: "#FAF5F3", padding: "clamp(72px, 8vw, 128px) clamp(24px, 5vw, 80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(32px, 5vw, 56px)",
                color: "#6B1B3D",
                marginBottom: 12,
              }}
            >
              Meet Our Experts
            </h2>
          </div>

          {expertsByCategory.length > 0 ? (
            expertsByCategory.map((category) => (
              <div key={category.id} style={{ marginBottom: 64 }}>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#6B1B3D",
                    marginBottom: 32,
                    fontFamily: "Montserrat, sans-serif",
                    textTransform: "capitalize",
                  }}
                >
                  {category.name}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 32,
                  }}
                >
                  {category.experts.map((expert) => (
                    <div
                      key={expert.id}
                      style={{
                        textAlign: "center",
                        padding: 24,
                        borderRadius: 16,
                        background: "#fff",
                        border: "1px solid rgba(107,27,61,0.08)",
                      }}
                    >
                      <div
                        style={{
                          width: 140,
                          height: 140,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#C4847A,#6B1B3D)",
                          margin: "0 auto 16px",
                          overflow: "hidden",
                          boxShadow: "0 8px 24px rgba(107,27,61,0.1)",
                        }}
                      >
                        {expert.profile_picture ? (
                          <img
                            src={expert.profile_picture}
                            alt={expert.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: 48,
                            }}
                          >
                            {expert.name?.[0]}
                          </div>
                        )}
                      </div>
                      <h4
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#1a1a1a",
                          marginBottom: 6,
                          fontFamily: "Montserrat, sans-serif",
                        }}
                      >
                        {expert.name}
                      </h4>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#888",
                          marginBottom: 12,
                          fontFamily: "Montserrat, sans-serif",
                        }}
                      >
                        {expert.title || "Expert"}
                      </p>
                      {expert.bio && (
                        <p
                          style={{
                            fontSize: 14,
                            color: "#666",
                            lineHeight: 1.5,
                            fontFamily: "Montserrat, sans-serif",
                          }}
                        >
                          {expert.bio.substring(0, 100)}
                          {expert.bio.length > 100 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#888", fontFamily: "Montserrat, sans-serif" }}>
              Experts coming soon...
            </p>
          )}
        </div>
      </section>

      {/* SECTION 7-15: Placeholder sections */}
      <PlaceholderSection title="What You Will Learn" bgColor="#0d0205" textColor="#fff" />
      <PlaceholderSection title="Course Framework" bgColor="#FAF5F3" textColor="#1a1a1a" />
      <PlaceholderSection title="Who This Is For" bgColor="#F5E6E0" textColor="#1a1a1a" />
      <PlaceholderSection title="What You Will Learn in Detail" bgColor="#FAF5F3" textColor="#1a1a1a" />
      <PlaceholderSection title="Why Different" bgColor="#0d0205" textColor="#fff" />
      <PlaceholderSection title="Our Intention" bgColor="#F5E6E0" textColor="#1a1a1a" />
      <PlaceholderSection title="Investment" bgColor="#6B1B3D" textColor="#fff" />
      <PlaceholderSection title="Frequently Asked Questions" bgColor="#FAF5F3" textColor="#1a1a1a" />
      <PlaceholderSection title="Ready to Transform" bgColor="#C4847A" textColor="#fff" />
    </div>
  );
}

function PlaceholderSection({ title, bgColor, textColor }) {
  return (
    <section style={{ background: bgColor, padding: "clamp(72px, 8vw, 128px) clamp(24px, 5vw, 80px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            color: textColor,
            marginBottom: 24,
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: 16, color: textColor, opacity: 0.7, fontFamily: "Montserrat, sans-serif" }}>
          Content coming soon...
        </p>
      </div>
    </section>
  );
}