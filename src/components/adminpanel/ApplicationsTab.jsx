import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TabHeader from "@/components/adminpanel/TabHeader";
import { isReservedRoomSlug, slugifyRoom } from "@/lib/circle";

// ────────────────────────────────────────────────────────────────
// Applications · the admin screen the approval path never had.
//
// Lists every ExpertApplication with the full submission, and actions
// each one through approvePartnerApplication, which creates or links
// the Expert record, applies grants, creates the draft room when
// community hosting is granted, and sends the approval email. Nothing
// here writes to entities directly, so a retype into Experts is never
// needed again.
// ────────────────────────────────────────────────────────────────

const INTEREST_LABELS = {
  marketplace_profile: "Directory profile",
  affiliate: "Affiliate programme",
  host_course: "Host a course",
  host_community: "Host a community",
};

const FILTERS = [
  { key: "pending", label: "Waiting" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Declined" },
  { key: "all", label: "All" },
];

const PILL = "inline-flex items-center rounded-full px-3 py-1 font-body text-[10.5px] font-semibold tracking-eyebrow uppercase";
const BTN_PRIMARY = "inline-flex items-center justify-center rounded-full bg-awburg-core hover:bg-awburg-dark text-paper font-body font-bold text-[11px] tracking-eyebrow uppercase min-h-[44px] px-6 transition-colors disabled:opacity-50";
const BTN_SECONDARY = "inline-flex items-center justify-center rounded-full border-[1.5px] border-awrose-core text-awburg-core font-body font-bold text-[11px] tracking-eyebrow uppercase min-h-[44px] px-6 transition-colors hover:bg-awrose-wash disabled:opacity-50";
const INPUT = "w-full h-11 bg-paper border border-awburg-core/15 focus:border-awrose-core rounded-md px-3 font-body text-[13px] text-awburg-core outline-none";
const LABEL = "block font-body font-medium text-[11px] text-awburg-core mb-1.5";

function when(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ApplicationsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [openId, setOpenId] = useState(null);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => base44.entities.ExpertApplication.list("-created_date", 500),
  });

  const shown = useMemo(
    () => apps.filter((a) => filter === "all" || (a.status || "pending") === filter),
    [apps, filter],
  );
  const pendingCount = apps.filter((a) => (a.status || "pending") === "pending").length;
  const open = apps.find((a) => a.id === openId) || null;

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-applications"] });

  return (
    <div>
      <TabHeader
        title="Applications"
        subtitle={pendingCount ? `${pendingCount} waiting for a decision` : "Nothing waiting"}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 min-h-[40px] font-body text-[12px] font-semibold border transition-colors ${
              filter === f.key
                ? "bg-awburg-core text-paper border-awburg-core"
                : "bg-paper text-awburg-core border-awburg-core/15 hover:border-awburg-core/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="font-body text-[13px] text-awburg-mid">Loading applications...</p>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl bg-paper border border-awburg-core/10 p-8 text-center">
          <p className="font-display text-[22px] text-awburg-core mb-1">Nothing here.</p>
          <p className="font-body font-light text-[13px] text-awburg-mid">
            {filter === "pending" ? "Every application has been answered." : "No applications match this view."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {shown.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setOpenId(a.id)}
              className="text-left rounded-2xl bg-paper border border-awburg-core/10 hover:border-awburg-core/30 p-5 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-body font-semibold text-[14px] text-awburg-core">
                    {a.applicant_name}
                    {a.application_type === "business" && a.business_name ? (
                      <span className="font-normal text-awburg-mid"> · {a.business_name}</span>
                    ) : null}
                  </p>
                  <p className="font-body font-light text-[12px] text-awburg-mid">{a.email} · {when(a.created_date)}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(a.interested_in || []).map((k) => (
                      <span key={k} className={`${PILL} ${k === "host_community" ? "bg-awsage-wash text-awsage-core" : "bg-awrose-wash text-awburg-mid"}`}>
                        {INTEREST_LABELS[k] || k}
                      </span>
                    ))}
                  </div>
                </div>
                <StatusPill status={a.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      {open && <ApplicationDetail app={open} onClose={() => setOpenId(null)} onDone={() => { setOpenId(null); refresh(); }} />}
    </div>
  );
}

function StatusPill({ status }) {
  const s = status || "pending";
  const cls = s === "approved" ? "bg-awsage-wash text-awsage-core" : s === "rejected" ? "bg-off-white text-awburg-mid" : "bg-awrose-pale text-awburg-core";
  const label = s === "approved" ? "Approved" : s === "rejected" ? "Declined" : "Waiting";
  return <span className={`${PILL} ${cls}`}>{label}</span>;
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-deep mb-1">{label}</p>
      <p className="font-body font-light text-[13px] text-awburg-core leading-relaxed whitespace-pre-wrap break-words">{value}</p>
    </div>
  );
}

function ApplicationDetail({ app, onClose, onDone }) {
  const wantsCommunity = (app.interested_in || []).includes("host_community");
  const [mode, setMode] = useState("view");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [grants, setGrants] = useState({
    affiliate: (app.interested_in || []).includes("affiliate"),
    courseHost: false,
    communityHost: false,
  });
  const [roomName, setRoomName] = useState(app.community_name || "");
  const [roomSlug, setRoomSlug] = useState(slugifyRoom(app.community_name || ""));
  const [reason, setReason] = useState("");
  const isPending = (app.status || "pending") === "pending";

  const slugProblem = grants.communityHost
    ? !roomSlug || roomSlug.length < 3
      ? "The room needs an address of at least three characters."
      : isReservedRoomSlug(roomSlug)
        ? "That address is already a page on the platform. Choose another."
        : ""
    : "";

  const act = async (action) => {
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("approvePartnerApplication", {
        applicationId: app.id,
        action,
        grants,
        roomName: roomName.trim(),
        roomSlug: roomSlug.trim(),
        reason: reason.trim(),
      });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      onDone();
    } catch (e) {
      setError(e?.message === "slug_taken" ? "That address already belongs to another room." : e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Application"
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-awburg-dark/60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-paper p-6 md:p-8 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-deep mb-1">
              {app.application_type === "business" ? "Business application" : "Practitioner application"} · {when(app.created_date)}
            </p>
            <h2 className="font-display text-[26px] text-awburg-core leading-tight">
              {app.applicant_name}
              {app.business_name ? <span className="text-awburg-mid"> · {app.business_name}</span> : null}
            </h2>
            <p className="font-body font-light text-[12.5px] text-awburg-mid mt-1">{app.email}</p>
          </div>
          <StatusPill status={app.status} />
        </div>

        <div className="grid gap-5 mb-8">
          {app.logo_url ? <img src={app.logo_url} alt="" className="w-16 h-16 rounded-full object-cover border border-awburg-core/10" /> : null}
          <Row label="Headline" value={app.headline} />
          <Row label="About their work" value={app.bio} />
          <Row label="Areas" value={(app.category_interest || []).join(" · ")} />
          <Row label="Applying for" value={(app.interested_in || []).map((k) => INTEREST_LABELS[k] || k).join(" · ")} />
          <Row label="Links" value={[app.website_url, app.instagram_url, app.linkedin_url].filter(Boolean).join("\n")} />
          {wantsCommunity && (
            <div className="rounded-2xl border border-awsage-core/30 bg-awsage-wash/60 p-4 grid gap-4">
              <Row label="Community name" value={app.community_name} />
              <Row label="Who it is for" value={app.community_for} />
              <Row label="What women would talk about" value={app.community_topics} />
            </div>
          )}
          <Row label="Anything else" value={app.message} />
          {!isPending && (
            <Row
              label="Decision"
              value={`${app.status === "approved" ? "Approved" : "Declined"}${app.reviewed_by ? ` by ${app.reviewed_by}` : ""}${app.reviewed_at ? ` on ${when(app.reviewed_at)}` : ""}${app.review_notes ? `\n${app.review_notes}` : ""}${app.granted_community_host ? "\nCommunity hosting granted." : ""}${app.granted_affiliate ? "\nAffiliate access granted." : ""}`}
            />
          )}
        </div>

        {isPending && mode === "view" && (
          <div className="flex flex-wrap gap-3">
            <button type="button" className={BTN_PRIMARY} onClick={() => setMode("approve")}>Approve</button>
            <button type="button" className={BTN_SECONDARY} onClick={() => setMode("decline")}>Decline</button>
            <button type="button" className="font-body text-[12px] font-semibold text-awburg-mid px-3 min-h-[44px]" onClick={onClose}>Close</button>
          </div>
        )}

        {isPending && mode === "approve" && (
          <div className="rounded-2xl border border-awburg-core/10 bg-off-white p-5 grid gap-4">
            <p className="font-body font-semibold text-[14px] text-awburg-core">Approve with</p>
            <p className="font-body font-light text-[12.5px] text-awburg-mid">
              The directory listing is created in draft for them to finish. Each grant below is a separate decision.
            </p>
            <label className="flex items-start gap-3 font-body text-[13px] text-awburg-core cursor-pointer">
              <input type="checkbox" className="mt-1 accent-awburg-core" checked={grants.affiliate} onChange={(e) => setGrants((g) => ({ ...g, affiliate: e.target.checked }))} />
              <span>Affiliate programme</span>
            </label>
            <label className="flex items-start gap-3 font-body text-[13px] text-awburg-core cursor-pointer">
              <input type="checkbox" className="mt-1 accent-awburg-core" checked={grants.courseHost} onChange={(e) => setGrants((g) => ({ ...g, courseHost: e.target.checked }))} />
              <span>Host a course</span>
            </label>
            <label className="flex items-start gap-3 font-body text-[13px] text-awburg-core cursor-pointer">
              <input type="checkbox" className="mt-1 accent-awburg-core" checked={grants.communityHost} onChange={(e) => setGrants((g) => ({ ...g, communityHost: e.target.checked }))} />
              <span>
                Host a community
                <span className="block font-light text-[12px] text-awburg-mid">Creates the room in draft at the address below. It stays invisible until the host publishes it. If an unhosted room already lives at that address, it is handed to them instead.</span>
              </span>
            </label>
            {grants.communityHost && (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className={LABEL}>Room name</label>
                  <input className={INPUT} value={roomName} onChange={(e) => { setRoomName(e.target.value); if (!roomSlug || roomSlug === slugifyRoom(roomName)) setRoomSlug(slugifyRoom(e.target.value)); }} />
                </div>
                <div>
                  <label className={LABEL}>Address</label>
                  <div className="flex items-center gap-1">
                    <span className="font-body text-[12px] text-awburg-mid whitespace-nowrap">app.alignedwomanco.com/</span>
                    <input className={INPUT} value={roomSlug} onChange={(e) => setRoomSlug(slugifyRoom(e.target.value))} />
                  </div>
                  {slugProblem && <p className="font-body text-[11.5px] text-awrose-deep mt-1.5">{slugProblem}</p>}
                </div>
              </div>
            )}
            <div>
              <label className={LABEL}>Note to file (optional, not sent)</label>
              <input className={INPUT} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What was discussed, what was agreed" />
            </div>
            {error && <p className="font-body text-[12px] text-awrose-deep">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button type="button" className={BTN_PRIMARY} disabled={busy || !!slugProblem} onClick={() => act("approve")}>
                {busy ? "Approving..." : "Confirm approval"}
              </button>
              <button type="button" className="font-body text-[12px] font-semibold text-awburg-mid px-3 min-h-[44px]" onClick={() => setMode("view")} disabled={busy}>Back</button>
            </div>
          </div>
        )}

        {isPending && mode === "decline" && (
          <div className="rounded-2xl border border-awburg-core/10 bg-off-white p-5 grid gap-4">
            <p className="font-body font-semibold text-[14px] text-awburg-core">Decline with a reason</p>
            <p className="font-body font-light text-[12.5px] text-awburg-mid">
              The reason is included in the email to the applicant, word for word. Keep it kind.
            </p>
            <textarea className="w-full bg-paper border border-awburg-core/15 focus:border-awrose-core rounded-md p-3 font-body text-[13px] text-awburg-core outline-none resize-y" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
            {error && <p className="font-body text-[12px] text-awrose-deep">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button type="button" className={BTN_SECONDARY} disabled={busy} onClick={() => act("decline")}>
                {busy ? "Sending..." : "Confirm decline"}
              </button>
              <button type="button" className="font-body text-[12px] font-semibold text-awburg-mid px-3 min-h-[44px]" onClick={() => setMode("view")} disabled={busy}>Back</button>
            </div>
          </div>
        )}

        {!isPending && (
          <div className="flex gap-3">
            <button type="button" className={BTN_SECONDARY} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
