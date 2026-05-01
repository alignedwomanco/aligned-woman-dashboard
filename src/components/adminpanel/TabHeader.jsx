import React from "react";

export default function TabHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, color: "#6B1B3D", marginBottom: 4 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 15, color: "#888", fontWeight: 400 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}