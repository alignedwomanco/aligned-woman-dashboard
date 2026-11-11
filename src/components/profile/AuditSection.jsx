import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AuditAnswersView from "@/components/audit/AuditAnswersView";

// ────────────────────────────────────────────────────────────────
// Her Alignment Audit, as a section of My Profile (/Profile?tab=audit).
// Reads her audit through auditFlow "get", which only ever returns her
// own, and only includes Laura's blueprint once it has been released.
//   none            → what the Audit is, and where to buy it
//   purchased       → start it
//   in_progress     → how far she is, and continue
//   submitted       → when the blueprint is due, plus her answers
//   diagnostic_ready / complete → the blueprint, plus her answers
// ────────────────────────────────────────────────────────────────

const SERIF = "'Libre Baskerville', Georgia, serif";
const BTN = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 48, padding: "0 28px",
  borderRadius: 100, background: "#C4847A", color: "#26030F", textDecoration: "none",
  fontFamily: "Montserrat, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
};

function fmt(iso, withTime = false) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const opts = { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Johannesburg" };
  if (withTime) Object.assign(opts, { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleString("en-GB", opts);
}

function Card({ eyebrow, title, children }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid rgba(74,14,46,0.12)", borderRadius: 20, padding: "32px 28px", marginBottom: 24 }}>
      {eyebrow && <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A86460" }}>{eyebrow}</p>}
      {title && <h2 style={{ margin: "0 0 14px", fontFamily: SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.2, color: "#4A0E2E" }}>{title}</h2>}
      <div style={{ fontSize: 15, lineHeight: 1.65, color: "#4A3C42" }}>{children}</div>
    </div>
  );
}

export default function AuditSection() {
  const [audit, setAudit] = useState(undefined); // undefined = loading
  const [error, setError] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    let cancelled = false;
    base44.functions.invoke("auditFlow", { action: "get" })
      .then((r) => { if (!cancelled) setAudit((r?.data ?? r)?.audit || null); })
      .catch(() => { if (!cancelled) { setError(true); setAudit(null); } });
    return () => { cancelled = true; };
  }, []);

  if (audit === undefined) {
    return <div style={{ height: 180, borderRadius: 20, background: "#F5DDD9", opacity: 0.5 }} />;
  }
  if (error) {
    return <Card title="We couldn't load your Audit.">Refresh the page to try again.</Card>;
  }

  if (!audit) {
    return (
      <Card eyebrow="The Alignment Audit" title="An honest read on your work and your life.">
        <p style={{ margin: "0 0 20px" }}>You answer my questions in your own time. Within seven working days I send you a blueprint written about you, then we go through it together on a one-hour call.</p>
        <a href="/alignment-audit" style={BTN}>See the Alignment Audit</a>
      </Card>
    );
  }

  const status = audit.status;
  const submitted = ["submitted", "diagnostic_ready", "complete"].includes(status);
  const released = status === "diagnostic_ready" || status === "complete";
  const diag = String(audit.diagnostic || "").trim();
  const isLink = /^https?:\/\//.test(diag);

  return (
    <>
      {status === "purchased" && (
        <Card eyebrow="Your Alignment Audit" title="Ready when you are.">
          <p style={{ margin: "0 0 20px" }}>Set aside about 90 minutes. Your answers save as you go, so you can stop and come back.</p>
          <Link to="/Audit" style={BTN}>Start my Audit</Link>
        </Card>
      )}

      {status === "in_progress" && (
        <Card eyebrow="Your Alignment Audit" title={`You're ${audit.progress_percent || 0}% of the way through.`}>
          <div role="progressbar" aria-valuenow={audit.progress_percent || 0} aria-valuemin={0} aria-valuemax={100} aria-label="Audit progress" style={{ height: 8, borderRadius: 100, background: "#F5DDD9", overflow: "hidden", margin: "4px 0 20px" }}>
            <div style={{ width: `${audit.progress_percent || 0}%`, height: "100%", background: "#4A0E2E" }} />
          </div>
          <p style={{ margin: "0 0 20px" }}>Pick up exactly where you left off, on any device.</p>
          <Link to="/Audit" style={BTN}>Continue my Audit</Link>
        </Card>
      )}

      {status === "submitted" && (
        <Card eyebrow="Your Alignment Audit" title="Your Audit is with me.">
          <p style={{ margin: 0 }}>
            You submitted it on {fmt(audit.submitted_at)}.{" "}
            {audit.due_at ? <>Your blueprint arrives by <strong style={{ color: "#4A0E2E" }}>{fmt(audit.due_at)}</strong>. I'll email you when it's here.</> : "I'll email you when your blueprint is ready."}
          </p>
        </Card>
      )}

      {released && (
        <Card eyebrow="Your blueprint" title="Written for you.">
          {audit.released_at && <p style={{ margin: "0 0 18px", fontSize: 13, color: "#8A7A76" }}>Released on {fmt(audit.released_at)}</p>}
          {isLink ? (
            <a href={diag} target="_blank" rel="noopener noreferrer" style={BTN}>Read your blueprint</a>
          ) : (
            <div style={{ whiteSpace: "pre-wrap", fontSize: 16, lineHeight: 1.75, color: "#1A0E12" }}>{diag}</div>
          )}
          {status === "diagnostic_ready" && (
            <p style={{ margin: "24px 0 0", fontSize: 14, color: "#5A4A50" }}>Next, we go through it together on our one-hour call.</p>
          )}
        </Card>
      )}

      {submitted && (
        <Card eyebrow="Your answers" title="Everything you told me.">
          <p style={{ margin: "0 0 16px" }}>Your answers are locked now, so you can read them back exactly as I read them. Only you and I can see them.</p>
          <button
            type="button"
            onClick={() => setShowAnswers((s) => !s)}
            aria-expanded={showAnswers}
            style={{ ...BTN, background: "transparent", color: "#4A0E2E", border: "1px solid #4A0E2E", cursor: "pointer" }}
          >
            {showAnswers ? "Hide my answers" : "Read my answers"}
          </button>
          {showAnswers && (
            <div style={{ marginTop: 32 }}>
              <AuditAnswersView track={audit.track} answers={audit.answers} />
            </div>
          )}
        </Card>
      )}
    </>
  );
}
