import React from "react";

export default function StatCard({ label, value, sub, color = "#6B1B3D" }) {
  return (
    <div className="rounded-xl p-6" style={{ background: "#fff", border: "1px solid rgba(107,27,61,0.1)", boxShadow: "0 2px 12px rgba(107,27,61,0.05)" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C4866C", marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 38, color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}