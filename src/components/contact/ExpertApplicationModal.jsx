import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, CheckCircle } from "lucide-react";

const EXPERTISE_OPTIONS = [
  "Somatic Therapy",
  "Nutrition & Hormones",
  "Business Coaching",
  "Money Mindset",
  "Cycle Syncing",
  "Leadership Development",
  "Mental Health",
  "Relationship Coaching",
  "Spiritual Guidance",
  "Movement & Dance",
  "Creative Expression",
  "Other",
];

export default function ExpertApplicationModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    company: "",
    expertise: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.ContactSubmission.create({
        type: "apply_expert",
        first_name: formData.name,
        last_name: formData.surname,
        email: formData.email,
        country: "",
        message: formData.message,
        extra_field_label: "Expertise",
        extra_field_value: formData.expertise,
        status: "new",
      });

      // Send automated email reply
      try {
        await base44.functions.invoke("sendContactFormEmail", {
          submissionId: "",
          recipientEmail: formData.email,
          submissionType: "apply_expert",
          firstName: formData.name,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the submission if email fails
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(61,15,39,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #6B1B3D 0%, #8B2E4D 100%)",
          borderRadius: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 20px 60px rgba(107,27,61,0.3)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
          }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        {submitted ? (
          <div style={{ padding: "clamp(40px,6vw,60px) 32px", textAlign: "center", color: "#fff" }}>
            <div style={{ width: 80, height: 80, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle style={{ width: 40, height: 40 }} />
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem,5vw,2.8rem)", marginBottom: 16, fontStyle: "italic" }}>
              Application Sent!
            </h2>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15, fontWeight: 300, lineHeight: 1.7, opacity: 0.9, marginBottom: 32 }}>
              Thank you for your interest in joining our network. We'll review your application and be in touch within 5-7 business days.
            </p>
            <button
              onClick={onClose}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#6B1B3D",
                background: "#fff",
                padding: "14px 32px",
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div style={{ padding: "clamp(32px,5vw,48px) 32px 24px", color: "#fff" }}>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(2rem,5vw,2.8rem)", marginBottom: 12, fontStyle: "italic" }}>
                Apply as Expert
              </h2>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, fontWeight: 300, lineHeight: 1.7, opacity: 0.9 }}>
                Join our network of certified practitioners and coaches. Tell us about your expertise and how you'd like to contribute.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "clamp(24px,5vw,40px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#3D0F27", marginBottom: 6 }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
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
                  <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#3D0F27", marginBottom: 6 }}>
                    Surname *
                  </label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#3D0F27", marginBottom: 6 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
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
                  <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#3D0F27", marginBottom: 6 }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#3D0F27", marginBottom: 6 }}>
                  Company / Practice Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #E0C5C9",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    outline: "none",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6B1B3D"}
                  onBlur={(e) => e.target.style.borderColor = "#E0C5C9"}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#3D0F27", marginBottom: 6 }}>
                  Area of Expertise *
                </label>
                <select
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #E0C5C9",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 14,
                    outline: "none",
                    background: "#fff",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6B1B3D"}
                  onBlur={(e) => e.target.style.borderColor = "#E0C5C9"}
                >
                  <option value="">Select your expertise</option>
                  {EXPERTISE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color: "#3D0F27", marginBottom: 6 }}>
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
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
                  padding: "14px 32px",
                  borderRadius: 100,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Send style={{ width: 16, height: 16 }} />
                {loading ? "Sending..." : "Submit Application"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}