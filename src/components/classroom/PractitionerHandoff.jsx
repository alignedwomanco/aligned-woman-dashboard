import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

// Dismissible card shown when a learner moves into a module taught by a new
// practitioner. Two beats: close out the module she finished, then introduce
// the new guide. Non-blocking, tapping the scrim, the X, or Continue dismisses
// it and reveals the lesson underneath.
export default function PractitionerHandoff({
  previousModuleTitle,
  expert,
  moduleTitle,
  durationMinutes,
  onDismiss,
}) {
  if (!expert) return null;

  const initials = (expert.name || "")
    .split(" ")
    .map((n) => n[0])
    .join("");

  const bio = expert.bio
    ? expert.bio.length > 150
      ? `${expert.bio.slice(0, 150).trimEnd()}...`
      : expert.bio
    : "";

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4"
      style={{ paddingTop: "12vh" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        onClick={onDismiss}
        style={{ position: "absolute", inset: 0, background: "rgba(74,14,46,0.32)", backdropFilter: "blur(2px)" }}
      />
      <motion.div
        role="dialog"
        aria-label="New practitioner"
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          background: "#FAF5F3",
          borderRadius: "20px",
          padding: "28px 24px 24px",
          boxShadow: "0 24px 60px rgba(74,14,46,0.28)",
        }}
      >
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", padding: "4px", lineHeight: 0 }}
        >
          <X className="w-4 h-4" style={{ color: "#8A7A76" }} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "50%", background: "#C4847A", flexShrink: 0 }}>
            <Check className="w-3 h-3" style={{ color: "white" }} />
          </span>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.22em", color: "#C4847A", textTransform: "uppercase" }}>
            Module complete
          </span>
        </div>

        {previousModuleTitle && (
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "14px", fontWeight: 300, color: "#3A2A28", lineHeight: 1.6, marginBottom: "20px" }}>
            You've finished{" "}
            <span style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: "16px", color: "#4A0E2E" }}>
              {previousModuleTitle}
            </span>
            . Beautifully done.
          </p>
        )}

        <div style={{ height: "1px", background: "rgba(74,14,46,0.1)", marginBottom: "20px" }} />

        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.22em", color: "#8A7A76", textTransform: "uppercase", marginBottom: "14px" }}>
          Next, you're with
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: bio ? "14px" : "20px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#4A0E2E", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {expert.profile_picture ? (
              <img src={expert.profile_picture} alt={expert.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "18px", fontWeight: 700, color: "#FAF5F3" }}>{initials}</span>
            )}
          </div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#4A0E2E", lineHeight: 1.2, marginBottom: "3px" }}>{expert.name}</div>
            {expert.title && (
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 500, color: "#8A7A76", lineHeight: 1.4 }}>{expert.title}</div>
            )}
          </div>
        </div>

        {bio && (
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", fontWeight: 300, color: "#3A2A28", lineHeight: 1.65, marginBottom: "20px" }}>{bio}</p>
        )}

        {moduleTitle && (
          <div style={{ background: "rgba(74,14,46,0.05)", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px" }}>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", color: "#C4847A", textTransform: "uppercase", marginBottom: "4px" }}>
              Up next
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "15px", color: "#4A0E2E", lineHeight: 1.3 }}>{moduleTitle}</div>
            {durationMinutes && (
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 500, color: "#8A7A76", marginTop: "3px" }}>{durationMinutes} min</div>
            )}
          </div>
        )}

        <button
          onClick={onDismiss}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "100px",
            background: "#4A0E2E",
            color: "#FAF5F3",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}