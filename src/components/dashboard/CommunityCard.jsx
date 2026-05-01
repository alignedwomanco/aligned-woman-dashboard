import React from "react";

export default function CommunityCard() {
  const items = [
    { text: "New post in Building Without Burnout", time: "12 MIN AGO" },
    { text: "Your circle has 5 new messages", time: "TODAY" },
    { text: "Reply from Mimi in Redefining Love & Boundaries", time: "2H AGO" },
  ];

  return (
    <div style={{ background: "white", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
      {/* Eyebrow */}
      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B1B3D", marginBottom: "16px", fontFamily: "Montserrat, sans-serif" }}>
        <span style={{ display: "inline-block", width: "12px", height: "1px", background: "#6B1B3D", marginRight: "8px" }} />
        COMMUNITY
      </p>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, i) => (
          <div key={i}>
            <p style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: 1.5, fontFamily: "Montserrat, sans-serif" }}>
              {item.text.split(" in ").map((part, j) => j === 1 ? (
                <span key={j} style={{ fontStyle: "italic", color: "#C4847A" }}> in {part}</span>
              ) : part)}
            </p>
            <p style={{ fontSize: "10px", color: "#aaa", marginTop: "4px", fontFamily: "Montserrat, sans-serif" }}>
              {item.time}
            </p>
          </div>
        ))}
      </div>

      {/* Link */}
      <a href="#" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B1B3D", textDecoration: "none", fontFamily: "Montserrat, sans-serif" }}>
        OPEN COMMUNITY →
      </a>
    </div>
  );
}