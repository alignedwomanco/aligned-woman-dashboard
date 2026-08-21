import React, { useState } from "react";
import LandingFooter from "@/components/home/LandingFooter";
import { ArrowRight, Mail, Star, Building2, Handshake, Newspaper, HelpCircle } from "lucide-react";
import ExpertApplicationModal from "@/components/contact/ExpertApplicationModal";

const BASK = "'Libre Baskerville', Georgia, serif";
const MONT = "Montserrat, sans-serif";
const Hairline = "#4A0E2E";

const CONTACT_PATHS = [
  {
    type: "apply_expert",
    title: "Apply as an Expert",
    description: "Join our network of certified practitioners and coaches seeking new opportunities to support others.",
    icon: Star,
    action: "modal",
    featured: true,
  },
  {
    type: "corporate_di",
    title: "Corporate D&I",
    description: "Bring embodied leadership practices to your organisation.",
    icon: Building2,
    action: "modal",
  },
  {
    type: "brand_collab",
    title: "Brand Collaboration",
    description: "Partnership and collaboration opportunities with aligned brands and platforms.",
    icon: Handshake,
    action: "modal",
  },
  {
    type: "press",
    title: "Press & Media",
    description: "Media inquiries and press resources for The Aligned Woman Co.",
    icon: Newspaper,
    action: "modal",
  },
  {
    type: "general",
    title: "General Enquiry",
    description: "Any other questions or support needs we can help with.",
    icon: HelpCircle,
    action: "modal",
  },
];

const Eyebrow = ({ children, style }) => (
  <p style={{ fontFamily: MONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "#A86460", margin: 0, ...style }}>
    {children}
  </p>
);

export default function Contact() {
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const handleCardClick = (path) => {
    if (path.type === "apply_expert") {
      setShowExpertModal(true);
    } else {
      setSelectedType(path.type);
    }
  };

  const closeModal = () => {
    setShowExpertModal(false);
    setSelectedType(null);
  };

  return (
    <div className="overflow-x-hidden" style={{ background: "#FAF5F3", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(160deg,#FAF5F3,#F5DDD9)", padding: "clamp(104px,12vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 28 }}>The Aligned Woman Co.</Eyebrow>
          <h1 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(3.2rem,7vw,5rem)", lineHeight: 1.05, color: "#4A0E2E", margin: "0 0 24px" }}>
            Let's start a <em style={{ color: "#A86460", fontStyle: "italic" }}>conversation.</em>
          </h1>
          <div style={{ width: 48, height: 1.5, background: Hairline, margin: "0 auto 36px", opacity: 0.4 }} />
          <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 17, lineHeight: 1.7, color: "#3A2A28", maxWidth: 560, margin: "0 auto" }}>
            Choose the door that fits where you are. We read everything, and we respond within 48 hours.
          </p>
        </div>
      </section>

      {/* ── CONTACT PATHS ── */}
      <section style={{ background: "#FAF5F3", padding: "clamp(96px,11vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64, maxWidth: 640, margin: "0 auto 64px" }}>
            <Eyebrow style={{ marginBottom: 22 }}>How can we help</Eyebrow>
            <h2 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.2rem,4.5vw,3.2rem)", lineHeight: 1.05, color: "#4A0E2E", margin: 0 }}>
              Find your way <em style={{ color: "#A86460", fontStyle: "italic" }}>in.</em>
            </h2>
          </div>

          {/* Cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {CONTACT_PATHS.map((path) => {
              const Icon = path.icon;
              const isFeatured = path.featured;
              return (
                <div
                  key={path.type}
                  onClick={() => handleCardClick(path)}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: isFeatured ? 40 : 32,
                    border: "1px solid rgba(74,14,46,0.08)",
                    cursor: path.action === "modal" ? "pointer" : "default",
                    transition: "border-color 0.2s ease",
                    gridColumn: isFeatured ? "span 2" : "span 1",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(74,14,46,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(74,14,46,0.08)"; }}
                >
                  <Icon style={{ width: 26, height: 26, color: "#C4847A", marginBottom: 20 }} />
                  <h3 style={{ fontFamily: BASK, fontWeight: 400, fontSize: isFeatured ? 24 : 19, color: "#4A0E2E", marginBottom: 12 }}>
                    {path.title}
                  </h3>
                  <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 14, lineHeight: 1.7, color: "#3A2A28", marginBottom: 24, maxWidth: 480 }}>
                    {path.description}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(path);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: MONT,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#fff",
                      background: "#C4847A",
                      padding: "13px 28px",
                      borderRadius: 100,
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#A86460")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#C4847A")}
                  >
                    {path.type === "apply_expert" ? "Apply now →" : "Start here →"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ background: "linear-gradient(160deg,#FAF5F3,#F5DDD9)", padding: "clamp(96px,11vw,112px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 24 }}>The Aligned Woman Co.</Eyebrow>
          <h2 style={{ fontFamily: BASK, fontWeight: 400, fontSize: "clamp(2.2rem,5vw,3.2rem)", lineHeight: 1.05, color: "#4A0E2E", margin: "0 0 20px" }}>
            Stay in the <em style={{ color: "#A86460", fontStyle: "italic" }}>loop.</em>
          </h2>
          <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: "#3A2A28", maxWidth: 520, margin: "0 auto 36px" }}>
            Join our newsletter for insights, resources and expert collaborations. We respect your inbox. Unsubscribe any time.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.querySelector('input[name="email"]').value;
              console.log("Newsletter signup:", email);
              // TODO: Wire to backend newsletter service
            }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}
          >
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              style={{
                flex: "1 1 280px",
                maxWidth: 360,
                padding: "13px 22px",
                borderRadius: 100,
                border: "1px solid rgba(74,14,46,0.12)",
                background: "#fff",
                fontFamily: MONT,
                fontWeight: 300,
                fontSize: 14,
                color: "#3A2A28",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#C4847A"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(74,14,46,0.12)"; }}
            />
            <button
              type="submit"
              style={{
                fontFamily: MONT,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#fff",
                background: "#C4847A",
                padding: "13px 28px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#A86460")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#C4847A")}
            >
              Subscribe →
            </button>
          </form>
        </div>
      </section>

      <LandingFooter />

      {/* Expert Application Modal */}
      {showExpertModal && <ExpertApplicationModal onClose={closeModal} />}

      {/* Generic Contact Form Modal */}
      {selectedType && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(74,14,46,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "#FAF5F3",
              borderRadius: 10,
              padding: 40,
              maxWidth: 520,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
              border: "1px solid rgba(74,14,46,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 8,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4A0E2E" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <Eyebrow style={{ marginBottom: 14 }}>{CONTACT_PATHS.find(p => p.type === selectedType)?.title}</Eyebrow>
            <h3 style={{ fontFamily: BASK, fontWeight: 400, fontSize: 26, color: "#4A0E2E", marginBottom: 8 }}>
              Tell us a little <em style={{ color: "#A86460", fontStyle: "italic" }}>more.</em>
            </h3>
            <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 14, lineHeight: 1.7, color: "#3A2A28", marginBottom: 28 }}>
              {CONTACT_PATHS.find(p => p.type === selectedType)?.description}
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                // Submit to ContactSubmission entity
                window.location.href = `/ContactForm?type=${selectedType}`;
              }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label style={{ fontFamily: MONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A86460", marginBottom: 8, display: "block" }}>
                  First name
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(74,14,46,0.12)",
                    background: "#fff",
                    fontFamily: MONT,
                    fontWeight: 300,
                    fontSize: 14,
                    color: "#3A2A28",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: MONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A86460", marginBottom: 8, display: "block" }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(74,14,46,0.12)",
                    background: "#fff",
                    fontFamily: MONT,
                    fontWeight: 300,
                    fontSize: 14,
                    color: "#3A2A28",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: MONT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A86460", marginBottom: 8, display: "block" }}>
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(74,14,46,0.12)",
                    background: "#fff",
                    fontFamily: MONT,
                    fontWeight: 300,
                    fontSize: 14,
                    color: "#3A2A28",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  fontFamily: MONT,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: "#C4847A",
                  padding: "14px 30px",
                  borderRadius: 100,
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  marginTop: 8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#A86460")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#C4847A")}
              >
                Submit →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}