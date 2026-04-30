import React from "react";

export default function AdminCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#E8E0DC] p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color: "#C4866C",
      marginBottom: 16,
      fontFamily: "Montserrat, sans-serif",
    }}>
      {children}
    </p>
  );
}

export function StatCard({ label, value, icon: Icon, iconBg = "#FDF5F3", iconColor = "#6B1B3D" }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E0DC] p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div>
        <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: "#1a0510", lineHeight: 1 }}>
          {value}
        </p>
        <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2, fontFamily: "Montserrat, sans-serif", letterSpacing: "0.05em" }}>
          {label}
        </p>
      </div>
    </div>
  );
}