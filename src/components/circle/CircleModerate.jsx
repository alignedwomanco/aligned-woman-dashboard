import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { randomId, topicLabel } from "@/lib/circle";
import { BTN_PRIMARY, BTN_SECONDARY, BTN_TEXT, CARD, CHIP, CHIP_ON } from "@/components/circle/CircleShell";

// ────────────────────────────────────────────────────────────────
// Moderate · Section C, inside the room shell. Requests, reports,
// members, topics and insights, every action reachable with a thumb.
// The host only ever sees her own room; the function enforces it.
// ────────────────────────────────────────────────────────────────

const REASONS = {
  harassment: "Unkind or unsafe",
  misinformation: "Medical advice given as fact",
  safety_concern: "Shares something private",
  spam: "Spam or selling",
  off_topic: "Off topic",
  other: "Something else",
};

async function mod(groupId, action, extra = {}) {
  const res = await base44.functions.invoke("moderateCircle", { groupId, action, ...extra });
  const data = res?.data || res;
  if (data?.error) throw new Error(data.error);
  return data;
}

function when(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Consent({ ok, children }) {
  return (
    <span className={`inline-flex items-center gap-1 font-body text-[11px] ${ok ? "text-awsage-core" : "text-awrose-deep"}`}>
      <span aria-hidden="true">{ok ? "✓" : "✕"}</span>{children}
    </span>
  );
}

export default function CircleModerate({ group, onBack, onOpenPost, onPostAgain }) {
  const qc = useQueryClient();
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get("view") || "requests");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["circle-moderate", group.id],
    queryFn: () => mod(group.id, "overview"),
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["circle-moderate", group.id] });
    qc.invalidateQueries({ queryKey: ["circle-room", group.id] });
    qc.invalidateQueries({ queryKey: ["circle-group"] });
  };

  const run = async (id, action, extra) => {
    setBusyId(id);
    setError("");
    try {
      await mod(group.id, action, extra);
      refresh();
    } catch (e) {
      setError(e?.message || "That did not work. Try again.");
    } finally {
      setBusyId("");
    }
  };

  const tabs = [
    { key: "requests", label: "Requests", count: data?.requests?.length || 0 },
    { key: "reports", label: "Reports", count: (data?.reports || []).filter((r) => r.status === "open").length },
    { key: "announcements", label: "Announcements" },
    { key: "members", label: "Members" },
    { key: "topics", label: "Topics" },
    { key: "insights", label: "Insights" },
  ];

  return (
    <div className="px-[22px] pt-5 pb-12 md:max-w-[760px] md:mx-auto md:px-10 md:pt-8 flex flex-col gap-4">
      <button type="button" onClick={onBack} className="self-start font-body text-[12px] font-semibold text-awburg-core min-h-[44px] inline-flex items-center gap-1">
        <span aria-hidden="true">{"←"}</span> Back to the Circle
      </button>
      <h2 className="font-display text-[26px] leading-tight text-awburg-dark m-0">Moderate <em className="italic text-awburg-bright">the Circle</em></h2>

      <div className="flex gap-2 overflow-x-auto -mx-[22px] px-[22px] pb-1 md:flex-wrap md:mx-0 md:px-0" role="tablist">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={view === t.key} onClick={() => setView(t.key)} className={view === t.key ? CHIP_ON : CHIP}>
            {t.label}{t.count ? ` · ${t.count}` : ""}
          </button>
        ))}
      </div>

      {data?.room && (
        <div className={`${CARD} px-5 py-3 flex flex-wrap items-center justify-between gap-3`}>
          <p className="font-body text-[12.5px] text-awburg-dark">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${data.room.status === "published" ? "bg-awsage-core" : "bg-awrose-core"}`} aria-hidden="true" />
            {data.room.status === "published" ? "Live. Women can find the room and ask to join." : "In draft. Only you and The Aligned Woman Co. can see it."}
          </p>
          <button type="button" className={`${BTN_SECONDARY} w-auto min-h-[40px] px-4 text-[10px]`} disabled={busyId === "publish"} onClick={() => run("publish", data.room.status === "published" ? "unpublish" : "publish")}>
            {data.room.status === "published" ? "Take private" : "Publish"}
          </button>
        </div>
      )}

      {error && <p className="font-body text-[12.5px] text-awrose-deep">{error}</p>}
      {isLoading || !data ? (
        <p className="font-body font-light text-[13px] text-awburg-mid">Loading...</p>
      ) : view === "requests" ? (
        <Requests rows={data.requests} busyId={busyId} run={run} />
      ) : view === "reports" ? (
        <Reports rows={data.reports} group={group} busyId={busyId} run={run} onOpenPost={onOpenPost} />
      ) : view === "announcements" ? (
        <Announcements rows={data.announcements || []} busyId={busyId} run={run} onPostAgain={onPostAgain} />
      ) : view === "members" ? (
        <Members rows={data.members} busyId={busyId} run={run} />
      ) : view === "topics" ? (
        <Topics room={data.room} run={run} busyId={busyId} />
      ) : (
        <Insights data={data} group={group} />
      )}
    </div>
  );
}

function Requests({ rows, busyId, run }) {
  if (!rows.length) return <p className="font-body font-light text-[13px] text-awburg-mid">No requests waiting.</p>;
  return rows.map((m) => (
    <div key={m.id} className={`${CARD} px-5 py-4 flex flex-col gap-3`}>
      <div>
        <p className="font-body font-semibold text-[14px] text-awburg-dark">{m.display_name}</p>
        <p className="font-body font-light text-[12px] text-awburg-mid break-all">{m.email} · asked {when(m.created_date)}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Consent ok={m.identifies_as_woman}>Identifies as a woman</Consent>
        <Consent ok={!!m.agreed_to_rules_at}>Agreed to the rules</Consent>
      </div>
      <div className="flex gap-2">
        <button type="button" className={`${BTN_PRIMARY} min-h-[48px]`} disabled={busyId === m.id} onClick={() => run(m.id, "approve", { memberId: m.id })}>Approve</button>
        <button type="button" className={`${BTN_SECONDARY} min-h-[48px]`} disabled={busyId === m.id} onClick={() => run(m.id, "decline", { memberId: m.id })}>Decline</button>
      </div>
    </div>
  ));
}

function Reports({ rows, group, busyId, run, onOpenPost }) {
  const open = rows.filter((r) => r.status === "open");
  const handled = rows.filter((r) => r.status !== "open");
  if (!rows.length) return <p className="font-body font-light text-[13px] text-awburg-mid">Nothing has been reported.</p>;
  const Item = ({ r }) => (
    <div className={`${CARD} px-5 py-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-body font-semibold text-[13px] text-awburg-dark">{REASONS[r.reason] || r.reason}</span>
        <span className="font-body text-[11px] text-awburg-mid">{when(r.created_date)}</span>
      </div>
      {r.target_preview && <p className="font-body font-light text-[13px] leading-[1.6] text-awburg-dark border-l-2 border-awburg-core/15 pl-3 whitespace-pre-line">{r.target_preview}</p>}
      {r.detail && <p className="font-body font-light text-[12.5px] text-awburg-mid">Note from the reporter: {r.detail}</p>}
      {r.posted_by && (
        <p className="font-body text-[11px] text-awburg-mid">
          Posted by {r.posted_by}{r.is_anonymous ? " (as Anonymous member)" : ""} · visible to moderators only
        </p>
      )}
      {r.status === "open" ? (
        <div className="flex flex-wrap gap-2">
          {r.target_type === "post" && <button type="button" className={`${BTN_SECONDARY} w-auto min-h-[44px] px-5`} onClick={() => onOpenPost(r.target_id)}>Open the thread</button>}
          {r.target_type === "post" && <button type="button" className={`${BTN_SECONDARY} w-auto min-h-[44px] px-5`} disabled={busyId === r.id} onClick={async () => { await run(r.id, "delete_post", { postId: r.target_id }); run(r.id, "resolve_report", { reportId: r.id, note: "Post removed" }); }}>Remove the post</button>}
          <button type="button" className={`${BTN_PRIMARY} w-auto min-h-[44px] px-5`} disabled={busyId === r.id} onClick={() => run(r.id, "resolve_report", { reportId: r.id })}>Mark handled</button>
          <button type="button" className={BTN_TEXT} disabled={busyId === r.id} onClick={() => run(r.id, "dismiss_report", { reportId: r.id })}>Dismiss</button>
        </div>
      ) : (
        <p className="font-body text-[11px] text-awburg-mid">{r.status === "actioned" ? "Handled" : "Dismissed"} {r.resolution_notes ? `· ${r.resolution_notes}` : ""}</p>
      )}
    </div>
  );
  return (
    <>
      {open.map((r) => <Item key={r.id} r={r} />)}
      {handled.length > 0 && <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-deep mt-2">Handled</p>}
      {handled.map((r) => <Item key={r.id} r={r} />)}
    </>
  );
}

function Announcements({ rows, busyId, run, onPostAgain }) {
  if (!rows.length) {
    return <p className="font-body font-light text-[13px] text-awburg-mid">No notices yet. Post one from the room header when you need it.</p>;
  }
  return rows.map((a) => (
    <div key={a.id} className={`${CARD} px-5 py-4 flex flex-col gap-3 ${a.expired ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`font-body font-bold text-[10px] tracking-eyebrow uppercase ${a.expired ? "text-awburg-mid" : "text-awrose-deep"}`}>
          {a.expired ? "Ended" : "Showing now"}
        </span>
        <span className="font-body text-[11px] text-awburg-mid">{when(a.created_date)}</span>
      </div>
      <p className="font-body font-light text-[13px] leading-[1.6] text-awburg-dark whitespace-pre-line">{a.body}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${BTN_SECONDARY} w-auto min-h-[44px] px-5`} onClick={() => onPostAgain?.(a)}>Post again</button>
        {!a.expired && (
          <button type="button" className={`${BTN_SECONDARY} w-auto min-h-[44px] px-5`} disabled={busyId === a.id} onClick={() => run(a.id, "clear_announcement", { postId: a.id })}>
            Clear it
          </button>
        )}
      </div>
    </div>
  ));
}

function Members({ rows, busyId, run }) {
  const approved = rows.filter((m) => m.status === "approved");
  const gone = rows.filter((m) => m.status !== "approved");
  return (
    <>
      <p className="font-body font-light text-[13px] text-awburg-mid">{approved.length} {approved.length === 1 ? "member" : "members"} in the Circle.</p>
      {approved.map((m) => (
        <div key={m.id} className={`${CARD} px-5 py-3 flex items-center justify-between gap-3`}>
          <div className="min-w-0">
            <p className="font-body font-semibold text-[13.5px] text-awburg-dark truncate">{m.display_name}{m.role === "owner" ? " · host" : ""}</p>
            <p className="font-body font-light text-[11.5px] text-awburg-mid truncate">{m.email} · joined {when(m.created_date)}{m.reviewed_by ? ` · approved by ${m.reviewed_by}` : ""}</p>
          </div>
          {m.role !== "owner" && (
            <button type="button" className={`${BTN_SECONDARY} w-auto min-h-[40px] px-4 text-[10px]`} disabled={busyId === m.id} onClick={() => { if (window.confirm(`Remove ${m.display_name} from the Circle?`)) run(m.id, "remove", { memberId: m.id }); }}>Remove</button>
          )}
        </div>
      ))}
      {gone.length > 0 && (
        <>
          <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-deep mt-2">Declined or removed</p>
          {gone.map((m) => (
            <div key={m.id} className={`${CARD} px-5 py-3 flex items-center justify-between gap-3 opacity-70`}>
              <div className="min-w-0">
                <p className="font-body font-semibold text-[13px] text-awburg-dark truncate">{m.display_name}</p>
                <p className="font-body font-light text-[11.5px] text-awburg-mid truncate">{m.status}{m.reviewed_by ? ` by ${m.reviewed_by}` : ""} {when(m.reviewed_at)}</p>
              </div>
              <button type="button" className={BTN_TEXT} disabled={busyId === m.id} onClick={() => run(m.id, "approve", { memberId: m.id })}>Let back in</button>
            </div>
          ))}
        </>
      )}
    </>
  );
}

function Topics({ room, run, busyId }) {
  const [topics, setTopics] = useState(room.topics || []);
  const save = (next) => { setTopics(next); run("topics", "update_room", { fields: { topics: next } }); };
  const move = (i, dir) => {
    const arr = [...topics];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    save(arr.map((t, idx) => ({ ...t, order: idx })));
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="font-body font-light text-[13px] text-awburg-mid">Rename, reorder or retire. Retired topics stay on old posts and leave the composer.</p>
      {topics.map((t, i) => (
        <div key={t.key || i} className={`${CARD} px-3 py-2 flex items-center gap-2 ${t.active === false ? "opacity-50" : ""}`}>
          <input value={t.label} onChange={(e) => setTopics((arr) => arr.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))} onBlur={() => save(topics)} className="flex-1 min-w-0 h-10 bg-off-white border border-awburg-core/10 rounded-full px-3 font-body text-[13px] text-awburg-dark outline-none focus:border-awrose-core" aria-label={`Topic ${i + 1}`} />
          <button type="button" aria-label="Move up" className="w-10 h-10 rounded-full border border-awburg-core/15 text-awburg-core" onClick={() => move(i, -1)}>{"↑"}</button>
          <button type="button" aria-label="Move down" className="w-10 h-10 rounded-full border border-awburg-core/15 text-awburg-core" onClick={() => move(i, 1)}>{"↓"}</button>
          <button type="button" className="h-10 px-3 rounded-full border border-awburg-core/15 font-body text-[10.5px] font-semibold text-awburg-mid whitespace-nowrap" disabled={busyId === "topics"} onClick={() => save(topics.map((x, idx) => (idx === i ? { ...x, active: x.active === false } : x)))}>
            {t.active === false ? "Restore" : "Retire"}
          </button>
        </div>
      ))}
      <button type="button" className={BTN_TEXT + " self-start"} onClick={() => setTopics((arr) => [...arr, { key: `t${randomId().slice(0, 10)}`, label: "", order: arr.length, active: true }])}>Add a topic</button>
    </div>
  );
}

function Insights({ data, group }) {
  const i = data.insights || {};
  const [downloading, setDownloading] = useState(false);
  const byTopic = Object.entries(i.by_topic || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...byTopic.map(([, n]) => n));
  const Tile = ({ label, value }) => (
    <div className={`${CARD} px-4 py-3`}>
      <p className="font-display text-[26px] text-awburg-dark leading-none">{value}</p>
      <p className="font-body text-[11px] text-awburg-mid mt-1">{label}</p>
    </div>
  );
  const download = async () => {
    setDownloading(true);
    try {
      const d = await mod(group.id, "export");
      const blob = new Blob([d.csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = d.filename || "circle.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setDownloading(false);
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Tile label="questions" value={i.questions_total || 0} />
        <Tile label="open" value={i.questions_open || 0} />
        <Tile label="answered" value={i.questions_answered || 0} />
        <Tile label="members" value={i.members_approved || 0} />
        <Tile label="new in 30 days" value={i.members_new_30d || 0} />
        <Tile label="replies" value={i.replies_total || 0} />
      </div>
      <div className={`${CARD} px-5 py-4`}>
        <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-deep mb-3">Questions by topic</p>
        {byTopic.length === 0 ? (
          <p className="font-body font-light text-[13px] text-awburg-mid">No questions yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {byTopic.map(([key, n]) => (
              <li key={key}>
                <div className="flex items-center justify-between font-body text-[12px] text-awburg-dark mb-1">
                  <span>{topicLabel(group, key) || "No topic"}</span><span className="text-awburg-mid">{n}</span>
                </div>
                <div className="h-2 rounded-full bg-off-white overflow-hidden"><div className="h-full bg-awsage-core rounded-full" style={{ width: `${Math.round((n / max) * 100)}%` }} /></div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" className={`${BTN_SECONDARY} md:w-auto md:px-6`} disabled={downloading} onClick={download}>
        {downloading ? "Preparing..." : "Download questions (no names or emails)"}
      </button>
    </div>
  );
}