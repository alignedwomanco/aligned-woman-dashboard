import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, CheckCircle, Send } from "lucide-react";

const FORM_CONFIGS = {
  apply_programme: {
    title: "Apply for Programme",
    extraFieldLabel: "What are you most hoping to gain?",
    extraFieldType: "select",
    extraFieldOptions: [
      "Greater self-awareness",
      "Better boundaries",
      "Career clarity",
      "Relationship support",
      "Embodied leadership",
      "Healing from burnout",
    ],
  },
  corporate_di: {
    title: "Corporate D&I Enquiry",
    extraFieldLabel: "Company Name",
    extraFieldType: "text",
  },
  brand_collab: {
    title: "Brand Collaboration",
    extraFieldLabel: "Collaboration Type",
    extraFieldType: "select",
    extraFieldOptions: [
      "Product partnership",
      "Content collaboration",
      "Event partnership",
      "Affiliate programme",
      "Sponsorship opportunity",
      "Other",
    ],
  },
  press: {
    title: "Press & Media",
    extraFieldLabel: "Outlet / Publication",
    extraFieldType: "text",
  },
  general: {
    title: "General Enquiry",
    extraFieldLabel: "Topic",
    extraFieldType: "select",
    extraFieldOptions: [
      "Technical support",
      "Billing question",
      "Course content question",
      "Community feedback",
      "Other",
    ],
  },
};

export default function ContactForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") || "general";
  const config = FORM_CONFIGS[type] || FORM_CONFIGS.general;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    message: "",
    extra_field_value: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to database
      await base44.entities.ContactSubmission.create({
        type,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        country: formData.country,
        message: formData.message,
        extra_field_label: config.extraFieldLabel,
        extra_field_value: formData.extra_field_value,
        status: "new",
      });

      // Send automated email reply
      try {
        await base44.functions.invoke("sendContactFormEmail", {
          submissionId: "",
          recipientEmail: formData.email,
          submissionType: type,
          firstName: formData.first_name,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the submission if email fails
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit form:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-20" style={{ background: "#FFF9F5", minHeight: "100vh" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "clamp(60px,10vw,100px) 24px", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, background: "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle style={{ width: 40, height: 40, color: "#2E7D32" }} />
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem,5vw,3rem)", color: "#3D0F27", marginBottom: 16, fontStyle: "italic" }}>
            Message Sent!
          </h1>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: "#666", marginBottom: 32 }}>
            Thank you for reaching out. We'll get back to you within 24-48 hours.
          </p>
          <button
            onClick={() => navigate("/Contact")}
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
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Contact
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20" style={{ background: "#FFF9F5", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{ background: "linear-gradient(135deg, #6B1B3D 0%, #8B2E4D 100%)", padding: "clamp(40px,8vw,60px) 24px 32px", textAlign: "center" }}>
        <button
          onClick={() => navigate("/Contact")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 100,
            padding: "8px 16px",
            marginBottom: 20,
            cursor: "pointer",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#fff",
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2.5rem,6vw,4rem)", color: "#fff", marginBottom: 12, fontStyle: "italic" }}>
          {config.title}
        </h1>
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>
          Fill in the form below and we'll be in touch soon.
        </p>
      </section>

      {/* Form */}
      <section style={{ padding: "clamp(40px,8vw,60px) 24px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 20, padding: "clamp(24px,5vw,40px)", boxShadow: "0 4px 20px rgba(107,27,61,0.08)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 600, color: "#3D0F27", marginBottom: 8 }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #E0C5C9",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    outline: "none",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6B1B3D"}
                  onBlur={(e) => e.target.style.borderColor = "#E0C5C9"}
                />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 600, color: "#3D0F27", marginBottom: 8 }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #E0C5C9",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    outline: "none",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6B1B3D"}
                  onBlur={(e) => e.target.style.borderColor = "#E0C5C9"}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 600, color: "#3D0F27", marginBottom: 8 }}>
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #E0C5C9",
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 14,
                  outline: "none",
                }}
                onFocus={(e) => e.target.style.borderColor = "#6B1B3D"}
                onBlur={(e) => e.target.style.borderColor = "#E0C5C9"}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 600, color: "#3D0F27", marginBottom: 8 }}>
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #E0C5C9",
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 14,
                  outline: "none",
                }}
                onFocus={(e) => e.target.style.borderColor = "#6B1B3D"}
                onBlur={(e) => e.target.style.borderColor = "#E0C5C9"}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 600, color: "#3D0F27", marginBottom: 8 }}>
                {config.extraFieldLabel} *
              </label>
              {config.extraFieldType === "select" ? (
                <select
                  value={formData.extra_field_value}
                  onChange={(e) => setFormData({ ...formData, extra_field_value: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #E0C5C9",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    outline: "none",
                    background: "#fff",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6B1B3D"}
                  onBlur={(e) => e.target.style.borderColor = "#E0C5C9"}
                >
                  <option value="">Select an option</option>
                  {config.extraFieldOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.extra_field_value}
                  onChange={(e) => setFormData({ ...formData, extra_field_value: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #E0C5C9",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    outline: "none",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6B1B3D"}
                  onBlur={(e) => e.target.style.borderColor = "#E0C5C9"}
                />
              )}
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 600, color: "#3D0F27", marginBottom: 8 }}>
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #E0C5C9",
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                }}
                onFocus={(e) => e.target.style.borderColor = "#6B1B3D"}
                onBlur={(e) => e.target.style.borderColor = "#E0C5C9"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#fff",
                background: loading ? "#A86B6B" : "linear-gradient(135deg, #6B1B3D 0%, #8B2E4D 100%)",
                padding: "16px 32px",
                borderRadius: 100,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => !loading && (e.target.style.opacity = 0.9)}
              onMouseLeave={(e) => e.target.style.opacity = loading ? 0.7 : 1}
            >
              <Send style={{ width: 16, height: 16 }} />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}