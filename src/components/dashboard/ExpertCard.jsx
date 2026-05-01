import React from "react";

export default function ExpertCard({ expert }) {
  if (!expert) return null;

  const names = (expert.name || "Expert").split(" ");
  const firstName = names[0];
  const lastName = names.slice(1).join(" ");

  return (
    <div style={{
      background: "white",
      border: "1px solid #f0f0f0",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      {/* Expert photo with overlay */}
      <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
        <img
          src={expert.profile_picture || "https://via.placeholder.com/400x300?text=Expert"}
          alt={expert.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
          padding: "16px",
        }}>
          <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", fontFamily: "Montserrat, sans-serif" }}>
            EXPERT . THIS WEEK
          </p>
        </div>
      </div>

      {/* Expert info */}
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "18px", fontWeight: 700, color: "#1a1a1a" }}>
            {firstName}
          </span>
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "18px", fontStyle: "italic", color: "#C4847A", marginLeft: "4px" }}>
            {lastName}
          </span>
        </div>
        
        {expert.title && (
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", marginBottom: "12px", fontFamily: "Montserrat, sans-serif" }}>
            {expert.title}
          </p>
        )}

        {expert.bio && (
          <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5, marginBottom: "12px", fontFamily: "Montserrat, sans-serif" }}>
            {expert.bio.substring(0, 100)}...
          </p>
        )}

        <a href="#" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B1B3D", textDecoration: "none", fontFamily: "Montserrat, sans-serif" }}>
          VIEW PROFILE →
        </a>
      </div>
    </div>
  );
}