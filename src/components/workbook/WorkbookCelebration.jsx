import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function WorkbookCelebration({ onBackToWorkbook, closingText }) {
  const navigate = useNavigate();

  // Resume point for "Continue the Blueprint": last active module in CourseProgress.
  const { data: courseProgress = [] } = useQuery({
    queryKey: ["wcCourseProgress"],
    queryFn: () => base44.entities.CourseProgress.filter({}),
  });

  const resumeModule = useMemo(() => {
    const active = (courseProgress || [])
      .filter((p) => p.moduleId && (p.status === "in_progress" || p.status === "completed"))
      .sort((a, b) => {
        const ad = a.updated_date || a.created_date || "";
        const bd = b.updated_date || b.created_date || "";
        return bd.localeCompare(ad);
      });
    return active[0] || null;
  }, [courseProgress]);

  const handleContinueBlueprint = () => {
    if (resumeModule?.moduleId) {
      const cid = resumeModule.courseId ? `&courseId=${resumeModule.courseId}` : "";
      window.location.href = `/ModulePlayer?moduleId=${resumeModule.moduleId}${cid}`;
    } else {
      navigate("/Dashboard");
    }
  };

  const bodyText = closingText?.trim()
    ? closingText.trim()
    : "Return to this workbook anytime. The same questions, asked at different points in your life, reveal different answers. What you wrote today is a snapshot. What you notice next month is the growth.";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ background: "#FAF5F3" }}
    >
      <div style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
        {/* Eyebrow */}
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#C4847A",
          marginBottom: 16,
        }}>
          Integration Practice Complete
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "var(--aw-font-display)",
          fontWeight: 400,
          fontSize: 48,
          lineHeight: 1.05,
          color: "#4A0E2E",
          margin: "0 0 24px",
        }}>
          You have done the{" "}
          <span style={{ fontStyle: "italic", color: "#C4847A" }}>work</span>.
        </h1>

        {/* Body */}
        <p style={{
          fontFamily: "var(--aw-font-sans)",
          fontWeight: 400,
          fontSize: 16,
          lineHeight: 1.7,
          color: "#3A2A28",
          margin: "0 auto 32px",
          maxWidth: 540,
        }}>
          {bodyText}
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handleContinueBlueprint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: 100,
              background: "#4A0E2E",
              color: "#FFFFFF",
              border: "none",
              fontFamily: "var(--aw-font-sans)",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "opacity 180ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Continue the Blueprint
          </button>

          <button
            onClick={() => navigate("/Dashboard")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: 100,
              background: "transparent",
              color: "#4A0E2E",
              border: "1px solid #4A0E2E",
              fontFamily: "var(--aw-font-sans)",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 180ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(74,14,46,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Return to Dashboard
          </button>

          <button
            onClick={onBackToWorkbook}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 28px",
              borderRadius: 100,
              background: "transparent",
              color: "#4A0E2E",
              border: "1px solid #4A0E2E",
              fontFamily: "var(--aw-font-sans)",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 180ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(74,14,46,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Back to Integration Practice
          </button>
        </div>
      </div>
    </div>
  );
}