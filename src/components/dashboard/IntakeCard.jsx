import React from "react";
import { Button } from "@/components/ui/button";

export default function IntakeCard({ diagnosticSession, onEdit, onRetake }) {
  const concerns = diagnosticSession?.concerns || [];
  const archetype = diagnosticSession?.primaryPhase ? `The ${diagnosticSession.primaryPhase} Woman` : null;

  return (
    <div style={{ background: "white", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
      {/* Eyebrow */}
      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B1B3D", marginBottom: "12px", fontFamily: "Montserrat, sans-serif" }}>
        <span style={{ display: "inline-block", width: "12px", height: "1px", background: "#6B1B3D", marginRight: "8px" }} />
        WHY YOU STARTED . YOUR INTAKE
      </p>

      <div className="flex items-start gap-6">
        {/* Left content */}
        <div style={{ flex: 1 }}>
          {/* Heading */}
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "24px", color: "#1a1a1a", marginBottom: "4px", fontWeight: 400 }}>
            The reasons you
          </h2>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "24px", color: "#C4847A", marginBottom: "16px", fontWeight: 400 }}>
            showed up:
          </h2>

          {/* Concern tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {concerns.slice(0, 4).map((concern) => (
              <span
                key={concern}
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#888",
                  border: "1px solid #e0e0e0",
                  borderRadius: "20px",
                  padding: "6px 12px",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                {concern}
              </span>
            ))}
          </div>

          {/* Italic quote */}
          <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: "14px", color: "#C4847A", marginBottom: "16px", lineHeight: 1.6 }}>
            On hard weeks, come back here. This is your north star.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onEdit}
              variant="outline"
              style={{
                borderRadius: "100px",
                borderColor: "#6B1B3D",
                color: "#6B1B3D",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              EDIT MY ANSWERS
            </Button>
            <button
              onClick={onRetake}
              style={{
                background: "none",
                border: "none",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#6B1B3D",
                cursor: "pointer",
                fontFamily: "Montserrat, sans-serif",
                textDecoration: "underline",
              }}
            >
              RETAKE THE QUIZ
            </button>
          </div>
        </div>

        {/* Right: Archetype badge */}
        {archetype && (
          <div style={{ textAlign: "center", minWidth: "120px" }}>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "conic-gradient(from 0deg, #6B1B3D 0%, #C4847A 50%, #6B1B3D 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textAlign: "center", color: "#6B1B3D", lineHeight: 1.3, fontFamily: "Montserrat, sans-serif" }}>
                  YOU ARE<br />{archetype}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}