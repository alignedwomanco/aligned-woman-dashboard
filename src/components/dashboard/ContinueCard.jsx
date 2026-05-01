import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ContinueCard({ module, expert, completedPages, totalPages, onContinue }) {
  if (!module) return null;

  const progress = totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0;

  return (
    <div style={{ background: "white", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
      {/* Eyebrow */}
      <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B1B3D", marginBottom: "12px", fontFamily: "Montserrat, sans-serif" }}>
        <span style={{ display: "inline-block", width: "12px", height: "1px", background: "#6B1B3D", marginRight: "8px" }} />
        CONTINUE WHERE YOU LEFT OFF
      </p>

      <div className="flex items-start justify-between">
        {/* Left */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "20px", color: "#1a1a1a", marginBottom: "12px", fontWeight: 400 }}>
            {module?.title || "Module"}
          </h3>

          {expert && (
            <div className="flex items-center gap-2 mb-6">
              <Avatar className="w-8 h-8">
                <AvatarImage src={expert.profile_picture} />
                <AvatarFallback style={{ backgroundColor: "#6B1B3D", color: "white", fontSize: "10px" }}>
                  {expert.name?.[0] || "E"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a1a", fontFamily: "Montserrat, sans-serif" }}>
                  {expert.name || "Expert"}
                </p>
                <p style={{ fontSize: "10px", color: "#888", fontFamily: "Montserrat, sans-serif" }}>
                  {expert.title || "Expert"}
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={onContinue}
            style={{
              background: "#6B1B3D",
              color: "white",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: "Montserrat, sans-serif",
              padding: "10px 24px",
            }}
          >
            CONTINUE <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
          <button style={{ background: "none", border: "none", fontSize: "11px", color: "#6B1B3D", cursor: "pointer", marginTop: "8px", fontFamily: "Montserrat, sans-serif", fontWeight: 600, textDecoration: "underline" }}>
            MODULE OVERVIEW
          </button>
        </div>

        {/* Right: Progress pill */}
        <div style={{
          background: "#FAF5F3",
          borderRadius: "100px",
          padding: "10px 16px",
          textAlign: "center",
          minWidth: "140px",
          marginLeft: "16px",
        }}>
          <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B1B3D", marginBottom: "4px", fontFamily: "Montserrat, sans-serif" }}>
            WORKBOOK
          </p>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", fontFamily: "Montserrat, sans-serif" }}>
            PAGE {completedPages} OF {totalPages}
          </p>
          <p style={{ fontSize: "10px", color: "#888", fontFamily: "Montserrat, sans-serif" }}>
            {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}