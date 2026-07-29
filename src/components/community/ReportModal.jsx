import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

// ────────────────────────────────────────────────────────────────
// ReportModal · reachable from any post and any member.
//
// This was missing from the design handoff entirely. On a group where
// women discuss their bodies, a report path is a launch requirement, not
// a later addition, so it is built here in the community visual language
// rather than sent back to be drawn.
//
// Report rows are admin read only, set in the entity RLS. A reporter
// cannot see other reports and the reported member is never told.
// ────────────────────────────────────────────────────────────────

const REASONS = [
  { value: "harassment", label: "Harassment or abuse" },
  { value: "safety_concern", label: "I am worried about someone's safety" },
  { value: "misinformation", label: "Medical misinformation" },
  { value: "spam", label: "Spam or advertising" },
  { value: "off_topic", label: "Off topic for this group" },
  { value: "other", label: "Something else" },
];

export default function ReportModal({ open, onClose, targetType, targetId, targetPreview, groupId }) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async () => {
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await base44.entities.Report.create({
        target_type: targetType,
        target_id: targetId,
        target_preview: (targetPreview || "").slice(0, 500),
        group_id: groupId || "",
        reason,
        detail,
        status: "open",
      });
      setDone(true);
    } catch (e) {
      setError("We could not send that just now. Please try again, or email hello@alignedwomanco.com.");
    } finally {
      setSending(false);
    }
  };

  const close = () => {
    setReason("");
    setDetail("");
    setDone(false);
    setError("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Report"
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(26,5,16,0.62)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "rgba(255,255,255,0.94)",
          borderRadius: 24,
          padding: "32px 30px",
          boxShadow: "0 22px 52px rgba(43,18,32,0.28)",
          maxHeight: "88vh",
          overflowY: "auto",
        }}
      >
        {done ? (
          <>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: 24, color: "#4A0E2E", margin: "0 0 10px" }}>
              Thank you for telling us.
            </h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 12.5, color: "#2B1220", opacity: 0.82, lineHeight: 1.75, margin: "0 0 22px" }}>
              We read every report. Nobody is told that you reported them.
            </p>
            <button type="button" onClick={close} className="btn ghost" style={btnGhost}>
              Close
            </button>
          </>
        ) : (
          <>
            <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400, fontSize: 24, color: "#4A0E2E", margin: "0 0 8px" }}>
              {targetType === "member" ? "Report this member" : "Report this post"}
            </h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 12.5, color: "#92707D", lineHeight: 1.7, margin: "0 0 22px" }}>
              This goes to us, not to the group. Nobody is told that you reported them.
            </p>

            <fieldset style={{ border: "none", padding: 0, margin: "0 0 18px" }}>
              <legend style={label}>What is wrong?</legend>
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 12,
                    cursor: "pointer",
                    background: reason === r.value ? "rgba(196,132,122,0.16)" : "transparent",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 12.5,
                    color: "#2B1220",
                  }}
                >
                  <input
                    type="radio"
                    name="aw-report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => { setReason(r.value); setError(""); }}
                    style={{ accentColor: "#A86460" }}
                  />
                  {r.label}
                </label>
              ))}
            </fieldset>

            <label htmlFor="aw-report-detail" style={label}>Anything else we should know?</label>
            <textarea
              id="aw-report-detail"
              rows={4}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Optional"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(74,14,46,0.18)",
                borderRadius: 14,
                padding: "12px 14px",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 12.5,
                color: "#2B1220",
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
                marginBottom: 16,
              }}
            />

            {error && (
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11.5, fontWeight: 500, color: "#A86460", margin: "0 0 14px" }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={submit} disabled={sending} style={btnRose}>
                {sending ? "Sending..." : "Send report"}
              </button>
              <button type="button" onClick={close} style={btnPlain}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const label = {
  display: "block",
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 700,
  fontSize: 10.5,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#4A0E2E",
  marginBottom: 8,
};

const btnRose = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#C4847A",
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "12px 22px",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 44,
};

const btnGhost = {
  display: "inline-flex",
  alignItems: "center",
  background: "transparent",
  color: "#4A0E2E",
  border: "1.5px solid rgba(74,14,46,0.35)",
  borderRadius: 999,
  padding: "12px 22px",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 44,
};

const btnPlain = {
  background: "none",
  border: "none",
  padding: 0,
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 11.5,
  fontWeight: 600,
  color: "#92707D",
  cursor: "pointer",
};
