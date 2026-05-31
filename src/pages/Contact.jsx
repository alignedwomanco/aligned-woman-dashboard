import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import ExpertApplicationModal from "@/components/contact/ExpertApplicationModal";

const CONTACT_PATHS = [
  {
    type: "apply_expert",
    title: "Apply as Expert",
    description: "Join our network of certified practitioners and coaches",
    icon: "🌟",
    action: "modal",
  },
  {
    type: "corporate_di",
    title: "Corporate D&I",
    description: "Bring embodied leadership to your organisation",
    icon: "🏢",
    action: "form",
  },
  {
    type: "brand_collab",
    title: "Brand Collaboration",
    description: "Partnership and collaboration opportunities",
    icon: "🤝",
    action: "form",
  },
  {
    type: "press",
    title: "Press & Media",
    description: "Media inquiries and press resources",
    icon: "📰",
    action: "form",
  },
  {
    type: "general",
    title: "General Enquiry",
    description: "Any other questions or support needs",
    icon: "💬",
    action: "form",
  },
];

export default function Contact() {
  const [showExpertModal, setShowExpertModal] = useState(false);

  const handleCardClick = (path) => {
    if (path.action === "modal") {
      setShowExpertModal(true);
    }
    // Form paths navigate to ContactForm page
  };

  return (
    <div className="overflow-x-hidden" style={{ background: "#FFF9F5", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #6B1B3D 0%, #8B2E4D 100%)", padding: "clamp(80px,12vw,120px) clamp(24px,6vw,80px) clamp(60px,10vw,80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 100, padding: "8px 20px", marginBottom: 24 }}>
            <Sparkles style={{ width: 16, height: 16, color: "#F5B4C4" }} />
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>Get in Touch</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(3rem,7vw,5rem)", lineHeight: 1.1, color: "#fff", marginBottom: 20 }}>
            Contact Us
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", maxWidth: 600, margin: "0 auto" }}>
            Choose how you'd like to connect. We're here to support your journey.
          </p>
        </div>
      </section>

      {/* Contact Paths */}
      <section style={{ padding: "clamp(60px,10vw,100px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {CONTACT_PATHS.map((path) => (
              <div
                key={path.type}
                onClick={() => handleCardClick(path)}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 32,
                  cursor: path.action === "modal" ? "pointer" : "default",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  boxShadow: "0 2px 12px rgba(107,27,61,0.06)",
                }}
                onMouseEnter={(e) => {
                  if (path.action === "modal") {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(107,27,61,0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(107,27,61,0.06)";
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>{path.icon}</div>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#3D0F27", marginBottom: 12, fontStyle: "italic" }}>
                  {path.title}
                </h3>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "#666", marginBottom: 20 }}>
                  {path.description}
                </p>
                {path.action === "form" && (
                  <Link
                    to={`/ContactForm?type=${path.type}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#6B1B3D",
                      textDecoration: "none",
                    }}
                  >
                    Start Here <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                )}
                {path.action === "modal" && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#6B1B3D",
                    }}
                  >
                    Apply Now <ArrowRight style={{ width: 14, height: 14 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section style={{ background: "#F5E8E6", padding: "clamp(60px,10vw,100px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <Mail style={{ width: 40, height: 40, color: "#6B1B3D", marginBottom: 20, opacity: 0.7 }} />
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem,5vw,3rem)", color: "#3D0F27", marginBottom: 16, fontStyle: "italic" }}>
            Stay in the Loop
          </h2>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: "#555", marginBottom: 32 }}>
            Join our newsletter for insights, resources, and updates from The Aligned Woman.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              // TODO: Handle newsletter signup
              console.log("Newsletter signup:", formData.get("email"));
            }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}
          >
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              style={{
                flex: "1 1 300px",
                maxWidth: 400,
                padding: "14px 20px",
                borderRadius: 100,
                border: "1px solid rgba(107,27,61,0.2)",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#6B1B3D",
                padding: "14px 32px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.opacity = 0.9}
              onMouseLeave={(e) => e.target.style.opacity = 1}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Expert Application Modal */}
      {showExpertModal && <ExpertApplicationModal onClose={() => setShowExpertModal(false)} />}
    </div>
  );
}