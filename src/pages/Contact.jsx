import React, { useState } from "react";
import { Link } from "react-router-dom";
import LandingFooter from "@/components/home/LandingFooter";
import { ArrowRight, Mail, Star, Building2, Handshake, Newspaper, HelpCircle } from "lucide-react";
import ExpertApplicationModal from "@/components/contact/ExpertApplicationModal";

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
    description: "Media inquiries and press resources for The Aligned Woman.",
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
    <div className="overflow-x-hidden" style={{ background: "#FFF9F5", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #3D0F27 0%, #5A1633 100%)", padding: "clamp(80px,12vw,140px) clamp(24px,6vw,80px) clamp(80px,12vw,140px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 100, padding: "8px 18px", marginBottom: 32 }}>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>Let's Start a Conversation</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.5rem,6vw,4rem)", lineHeight: 1.15, color: "#fff", marginBottom: 12, fontStyle: "italic" }}>
            Let's start a <span style={{ color: "#C4847A" }}>conversation.</span>
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", maxWidth: 550, margin: "0 auto" }}>
            Choose the door that fits where you are. Messaged, could like to connect, we're here to support your journey.
          </p>
        </div>
      </section>

      {/* Contact Paths Directory */}
      <section style={{ background: "#FDF5F3", padding: "clamp(80px,12vw,120px) clamp(24px,6vw,80px)" }}>
         <div style={{ maxWidth: 1200, margin: "0 auto" }}>
           {/* Section header */}
           <div style={{ marginBottom: 60, maxWidth: 800 }}>
             <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
               <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8A7A76" }}>How Can We Help</span>
             </div>
             <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem,5vw,3.5rem)", lineHeight: 1.15, color: "#3D0F27", marginBottom: 16, fontStyle: "italic" }}>
               Find your way in.
             </h2>
             <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "#8A7A76" }}>
               Each category is built by our expert network. We're committed to respond within 48 hours.
             </p>
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
                     borderRadius: 16,
                     padding: isFeatured ? 40 : 32,
                     border: "1px solid rgba(74,14,46,0.1)",
                     cursor: path.action === "modal" ? "pointer" : "default",
                     transition: "all 0.3s ease",
                     gridColumn: isFeatured ? "span 2" : "span 1",
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = "rgba(74,14,46,0.2)";
                     e.currentTarget.style.background = "rgba(245,221,217,0.4)";
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = "rgba(74,14,46,0.1)";
                     e.currentTarget.style.background = "#fff";
                   }}
                 >
                   <Icon style={{ width: 28, height: 28, color: "#C4847A", marginBottom: 20 }} />
                   <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: isFeatured ? 26 : 20, color: "#3D0F27", marginBottom: 12, fontStyle: "italic" }}>
                     {path.title}
                   </h3>
                   <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "#666", marginBottom: 24 }}>
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
                       fontFamily: "Montserrat, sans-serif",
                       fontSize: 10,
                       fontWeight: 700,
                       letterSpacing: "0.15em",
                       textTransform: "uppercase",
                       color: "#fff",
                       background: "#4A0E2E",
                       padding: "12px 28px",
                       borderRadius: 100,
                       border: "none",
                       cursor: "pointer",
                       transition: "all 0.2s",
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
                     onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                   >
                     {path.type === "apply_expert" ? "Apply Now" : "Start Here"} <ArrowRight style={{ width: 13, height: 13 }} />
                   </button>
                 </div>
               );
             })}
           </div>
         </div>
       </section>

      {/* Newsletter Signup */}
      <section style={{ background: "linear-gradient(135deg, #3D0F27 0%, #5A1633 100%)", padding: "clamp(80px,12vw,120px) clamp(24px,6vw,80px)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem,5vw,3rem)", color: "#fff", marginBottom: 12, fontStyle: "italic" }}>
            Stay in the <span style={{ color: "#C4847A" }}>loop.</span>
          </h2>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 36 }}>
            Join our newsletter for insights, resources and expert collaborations. The Aligned Woman.
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
                maxWidth: 380,
                padding: "12px 20px",
                borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.08)",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 14,
                color: "#fff",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(196,132,122,0.4)";
                e.target.style.background = "rgba(255,255,255,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.2)";
                e.target.style.background = "rgba(255,255,255,0.08)";
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#fff",
                background: "rgba(196,132,122,0.7)",
                padding: "12px 28px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(196,132,122,0.85)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(196,132,122,0.7)"}
            >
              Subscribe
            </button>
          </form>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 300, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", marginTop: 20 }}>
            We respect your inbox. Unsubscribe any time.
          </p>
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
            background: "rgba(26,5,16,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 40,
              maxWidth: 520,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: "#3D0F27", marginBottom: 8, fontStyle: "italic" }}>
              {CONTACT_PATHS.find(p => p.type === selectedType)?.title}
            </h3>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#666", marginBottom: 24 }}>
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
                <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", marginBottom: 6, display: "block" }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(74,14,46,0.2)",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", marginBottom: 6, display: "block" }}>
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
                    border: "1px solid rgba(74,14,46,0.2)",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", marginBottom: 6, display: "block" }}>
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
                    border: "1px solid rgba(74,14,46,0.2)",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: "#4A0E2E",
                  padding: "14px 32px",
                  borderRadius: 100,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  marginTop: 8,
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}