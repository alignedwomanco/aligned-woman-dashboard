import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import TabHeader from "@/components/adminpanel/TabHeader";
import AuditAnswersView from "@/components/audit/AuditAnswersView";

// ────────────────────────────────────────────────────────────────
// Audits · Laura reads every Alignment Audit here and releases each
// woman's blueprint. Everything goes through auditFlow's admin actions,
// which check the role on the server, so nothing writes to AuditResponse
// from the browser.
//   Save draft       keeps the blueprint; she can't see it yet.
//   Release          shows it in her profile and emails her (first time).
//   Mark call done   after the one-hour call.
// ────────────────────────────────────────────────────────────────

const STATUS = {
  purchased: { label: "Not started", bg: "#F2ECEA", fg: "#6B5B60" },
  in_progress: { label: "In progress", bg: "#FDF5F3", fg: "#A86460" },
  submitted: { label: "Blueprint due", bg: "#4A0E2E", fg: "#FFFFFF" },
  diagnostic_ready: { label: "Blueprint sent", bg: "#E8F1EA", fg: "#2F5D3A" },
  complete: { label: "Complete", bg: "#EDEDED", fg: "#555" },
};
const FILTERS = [
  { key: "due", label: "Blueprint due" },
  { key: "open", label: "Still answering" },
  { key: "sent", label: "Sent" },
  { key: "all", label: "All" },
];
const PILL = "inline-flex items-center rounded-full px-3 py-1 font-body text-[10.5px] font-semibold tracking-eyebrow uppercase";
const BTN_PRIMARY = "inline-flex items-center justify-center rounded-full bg-awburg-core hover:bg-awburg-dark text-paper font-body font-bold text-[11px] tracking-eyebrow uppercase min-h-[44px] px-6 transition-colors disabled:opacity-50";
const BTN_SECONDARY = "inline-flex items-center justify-center rounded-full border-[1.5px] border-awrose-core text-awburg-core font-body font-bold text-[11px] tracking-eyebrow uppercase min-h-[44px] px-6 transition-colors hover:bg-awrose-wash disabled:opacity-50";

function when(iso, time = false) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const o = { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Johannesburg" };
  if (time) Object.assign(o, { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleString("en-GB", o);
}

async function call(payload) {
  const r = await base44.functions.invoke("auditFlow", payload);
  const data = r?.data ?? r;
  if (data?.error) throw new Error(data.error);
  return data;
}

function Detail({ id, onBack, onChanged }) {
  const [audit, setAudit] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    call({ action: "admin_get", id })
      .then((d) => { setAudit(d.audit); setDraft(d.audit?.diagnostic || ""); })
      .catch(() => setErr("Couldn't load this Audit."));
  }, [id]);

  const run = async (action, extra = {}) => {
    setBusy(action); setMsg(""); setErr("");
    try {
      const d = await call({ action, id, ...extra });
      setAudit(d.audit);
      onChanged();
      if (action === "admin_save") setMsg("Draft saved. She can't see it yet.");
      if (action === "admin_release") setMsg(d.emailed ? "Released. She's been emailed." : "Released. It's in her profile now.");
      if (action === "admin_complete") setMsg("Marked complete.");
    } catch (e) {
      const code = e?.message || "";
      setErr(code === "not_submitted" ? "She hasn't submitted her answers yet." : code === "diagnostic_required" ? "Write or link the blueprint first." : "That didn't save. Try again.");
    } finally {
      setBusy("");
    }
  };

  if (err && !audit) return <p className="font-body text-sm text-awburg-core">{err}</p>;
  if (!audit) return <div className="h-40 rounded-2xl bg-awrose-wash animate-pulse" />;

  const st = STATUS[audit.status] || STATUS.purchased;
  const submitted = ["submitted", "diagnostic_ready", "complete"].includes(audit.status);
  const released = audit.status === "diagnostic_ready" || audit.status === "complete";

  return (
    <div>
      <button type="button" onClick={onBack} className="font-body text-[13px] text-awburg-core underline underline-offset-4 mb-6 min-h-[44px]">← All Audits</button>
      <div className="rounded-2xl bg-white border border-awburg-core/10 p-6 md:p-8 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[28px] text-awburg-core leading-tight">{audit.name || audit.email}</h2>
            {audit.name && <p className="font-body text-[13px] text-awburg-core/70 mt-1">{audit.email}</p>}
          </div>
          <span className={PILL} style={{ background: st.bg, color: st.fg }}>{st.label}</span>
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 font-body text-[13px]">
          <div><dt className="text-awburg-core/60">Track</dt><dd className="text-awburg-core font-semibold">{audit.track === "career" ? "I have a career" : audit.track === "business" ? "I run a business" : "Not chosen yet"}</dd></div>
          <div><dt className="text-awburg-core/60">Bought</dt><dd className="text-awburg-core font-semibold">{when(audit.purchased_at || audit.created_date)}</dd></div>
          <div><dt className="text-awburg-core/60">Submitted</dt><dd className="text-awburg-core font-semibold">{submitted ? when(audit.submitted_at) : `${audit.progress_percent || 0}% done`}</dd></div>
          <div><dt className="text-awburg-core/60">Blueprint due</dt><dd className="text-awburg-core font-semibold">{when(audit.due_at, true) || "Not yet"}</dd></div>
        </dl>
        {audit.spp_snapshot?.primary && (
          <p className="font-body text-[13px] text-awburg-core/80 mt-4">
            Starting Point Profile: <strong>{String(audit.spp_snapshot.primary).replace(/_/g, " ")}</strong>
            {audit.spp_snapshot.secondary ? <>, secondary <strong>{String(audit.spp_snapshot.secondary).replace(/_/g, " ")}</strong></> : null}
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-awburg-core/10 p-6 md:p-8 mb-6">
        <h3 className="font-display text-[22px] text-awburg-core mb-2">Her blueprint</h3>
        <p className="font-body text-[13px] text-awburg-core/70 mb-4">
          Write it here, or paste a link to a PDF or Google Doc (start the link with https://). Save a draft as often as you like. She only sees it once you release it.
        </p>
        <label htmlFor="blueprint-text" className="sr-only">Her blueprint</label>
        <textarea
          id="blueprint-text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={14}
          className="w-full bg-paper border border-awburg-core/15 focus:border-awrose-core rounded-md p-4 font-body text-[14px] leading-relaxed text-awburg-core outline-none"
        />
        <div className="flex flex-wrap gap-3 mt-4">
          <button type="button" className={BTN_SECONDARY} disabled={!!busy} onClick={() => run("admin_save", { diagnostic: draft })}>
            {busy === "admin_save" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            disabled={!!busy || !submitted || !draft.trim()}
            onClick={() => {
              if (released || window.confirm("Release this blueprint? It appears in her profile and she gets an email straight away.")) {
                run("admin_release", { diagnostic: draft });
              }
            }}
          >
            {busy === "admin_release" ? "Releasing…" : released ? "Update released blueprint" : "Release to her"}
          </button>
          {audit.status === "diagnostic_ready" && (
            <button type="button" className={BTN_SECONDARY} disabled={!!busy} onClick={() => run("admin_complete")}>
              {busy === "admin_complete" ? "Saving…" : "Mark call done"}
            </button>
          )}
        </div>
        {!submitted && <p className="font-body text-[13px] text-awburg-core/70 mt-3">You can release it once she has submitted her answers.</p>}
        {released && <p className="font-body text-[13px] text-awburg-core/70 mt-3">Released {when(audit.released_at, true)}. Updating it changes what she sees; she isn't emailed again.</p>}
        {msg && <p role="status" className="font-body text-[13px] text-[#2F5D3A] mt-3">{msg}</p>}
        {err && <p role="alert" className="font-body text-[13px] text-awburg-core mt-3">{err}</p>}
      </div>

      <div className="rounded-2xl bg-white border border-awburg-core/10 p-6 md:p-8">
        <h3 className="font-display text-[22px] text-awburg-core mb-1">Her answers</h3>
        <p className="font-body text-[13px] text-awburg-core/70 mb-6">
          {submitted ? "Locked when she submitted." : "She's still answering, so these can change."} Questions she skipped are left out.
        </p>
        <AuditAnswersView track={audit.track} answers={audit.answers} />
      </div>
    </div>
  );
}

export default function AuditsTab() {
  const [audits, setAudits] = useState(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("due");
  const [openId, setOpenId] = useState(null);

  const load = () => {
    call({ action: "admin_list" })
      .then((d) => setAudits(d.audits || []))
      .catch(() => { setError(true); setAudits([]); });
  };
  useEffect(load, []);

  const dueCount = (audits || []).filter((a) => a.status === "submitted").length;
  const shown = useMemo(() => {
    const list = audits || [];
    if (filter === "due") return list.filter((a) => a.status === "submitted").sort((a, b) => String(a.due_at).localeCompare(String(b.due_at)));
    if (filter === "open") return list.filter((a) => a.status === "purchased" || a.status === "in_progress");
    if (filter === "sent") return list.filter((a) => a.status === "diagnostic_ready" || a.status === "complete");
    return list;
  }, [audits, filter]);

  if (openId) return <Detail id={openId} onBack={() => { setOpenId(null); load(); }} onChanged={load} />;

  return (
    <div>
      <TabHeader title="Alignment Audits" subtitle={audits ? (dueCount ? `${dueCount} blueprint${dueCount === 1 ? "" : "s"} due` : "No blueprints due") : "Loading…"} />
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`rounded-full px-4 min-h-[40px] font-body text-[12px] font-semibold border ${filter === f.key ? "bg-awburg-core text-paper border-awburg-core" : "bg-white text-awburg-core border-awburg-core/20"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {error && <p className="font-body text-sm text-awburg-core mb-4">Couldn't load the Audits. Refresh to try again.</p>}
      {!audits ? (
        <div className="h-40 rounded-2xl bg-awrose-wash animate-pulse" />
      ) : shown.length === 0 ? (
        <p className="font-body text-sm text-awburg-core/70">Nothing here.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((a) => {
            const st = STATUS[a.status] || STATUS.purchased;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(a.id)}
                  className="w-full text-left rounded-2xl bg-white border border-awburg-core/10 hover:border-awrose-core p-5 flex flex-wrap items-center justify-between gap-4 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-body font-semibold text-[15px] text-awburg-core truncate">{a.name || a.email}</p>
                    <p className="font-body text-[12.5px] text-awburg-core/65 mt-0.5">
                      {a.track === "career" ? "Career" : a.track === "business" ? "Business" : "No track yet"}
                      {" · "}
                      {a.status === "submitted" ? `Due ${when(a.due_at, true)}` : a.status === "in_progress" ? `${a.progress_percent}% done` : a.released_at ? `Sent ${when(a.released_at)}` : `Bought ${when(a.purchased_at)}`}
                      {a.has_draft && a.status === "submitted" ? " · Draft saved" : ""}
                    </p>
                  </div>
                  <span className={PILL} style={{ background: st.bg, color: st.fg }}>{st.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
