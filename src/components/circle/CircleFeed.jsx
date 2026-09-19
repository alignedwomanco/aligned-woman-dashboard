import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { activeTopics, formatDuration, shortTime, topicLabel } from "@/lib/circle";
import {
  BTN_PRIMARY, BTN_SECONDARY, BTN_TEXT, CARD, CHIP, CHIP_ON, Avatar, HostCard, HostLogo, TrustChips, FinePrint, RulesModal, Sheet,
} from "@/components/circle/CircleShell";

// ────────────────────────────────────────────────────────────────
// Feed · Section B, screens 5, 8 and 9. The member view, the host view
// with the moderator only line, the first day empty state and the in
// room notification setting.
// ────────────────────────────────────────────────────────────────

export function StatusMark({ post }) {
  // Answered is the record's state, set when the host replies or marks it.
  const answered = post.status === "answered";
  return answered ? (
    <span className="inline-flex items-center gap-1.5 font-body text-[10.5px] font-semibold text-awsage-core">
      <span className="w-[7px] h-[7px] rounded-full bg-awsage-core" aria-hidden="true" />
      Answered
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-awburg-core/30 px-2.5 py-[3px] font-body text-[10px] font-semibold text-awburg-core">Open</span>
  );
}

export function TopicChip({ label }) {
  if (!label) return null;
  return <span className="inline-flex items-center rounded-full bg-off-white border border-awburg-core/10 px-2.5 py-[4px] font-body text-[10px] font-semibold text-awburg-core">{label}</span>;
}

export function MediaBlock({ media, full = false }) {
  if (!Array.isArray(media) || media.length === 0) return null;
  const photos = media.filter((m) => m.kind === "photo");
  const audio = media.filter((m) => m.kind === "audio");
  return (
    <div className="flex flex-col gap-2 mt-3">
      {photos.length > 0 && (
        <div className="relative">
          <img src={photos[0].url} alt="" className={`rounded-[20px] object-cover border border-awburg-core/10 ${full ? "w-full max-h-[420px]" : "w-full h-[160px]"}`} />
          {photos.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-awburg-dark/70 text-paper font-body text-[10px] font-semibold px-2 py-[3px]">1 of {photos.length}</span>
          )}
        </div>
      )}
      {full && photos.slice(1).map((p) => <img key={p.url} src={p.url} alt="" className="w-full max-h-[420px] rounded-[20px] object-cover border border-awburg-core/10" />)}
      {audio.map((a) => (
        <div key={a.url} className="flex items-center gap-3 rounded-full bg-off-white border border-awburg-core/10 px-3 py-2">
          <audio controls preload="none" src={a.url} className="h-8 flex-1 min-w-0" />
          <span className="font-body text-[11px] text-awburg-mid whitespace-nowrap">{formatDuration(a.duration_seconds)}</span>
        </div>
      ))}
    </div>
  );
}

export function ModeratorLine({ post }) {
  if (!post?.moderator_only) return null;
  return (
    <p className="flex items-center gap-1.5 font-body text-[10.5px] text-awburg-mid mt-[2px]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
      Posted by {post.moderator_only.real_name} · visible to moderators only
    </p>
  );
}

function QuestionCard({ post, group, host, onOpen, onReport }) {
  const [menu, setMenu] = useState(false);
  const label = topicLabel(group, post.topic_key);
  return (
    <article className={`${CARD} px-5 py-[18px]`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-2">
          {post.is_pinned && (
            <svg className="text-awburg-core" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-label="Pinned"><path d="M16 3l5 5-4 1-3 3 1 6-2 2-4-4-5 5-1-1 5-5-4-4 2-2 6 1 3-3z" /></svg>
          )}
          <TopicChip label={label} />
        </span>
        <StatusMark post={post} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Avatar post={post} size={32} />
        <div className="min-w-0">
          <p className="font-body font-semibold text-[13px] text-awburg-dark truncate">{post.author_name}</p>
          <ModeratorLine post={post} />
        </div>
      </div>
      <button type="button" onClick={() => onOpen(post.id)} className="block w-full text-left">
        <p className="font-body font-light text-[14.5px] leading-[1.6] text-awburg-dark line-clamp-3">{post.body}</p>
      </button>
      {/* Media sits outside the button so a voice note can be played here. */}
      <MediaBlock media={post.media} />
      {post.status === "answered" && (
        <div className="flex items-center gap-2 mt-3">
          <HostLogo host={host} size={20} />
          <span className="font-body text-[11.5px] font-semibold text-awburg-core">{host?.first_name || "The host"} answered</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 mt-3">
        <button type="button" onClick={() => onOpen(post.id)} className="inline-flex items-center gap-4 font-body text-[11.5px] text-awburg-mid min-h-[44px]">
          <span className="inline-flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-4.5A8 8 0 1 1 21 12z" /></svg>
            {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
          </span>
          <span>{shortTime(post.created_date)}</span>
        </button>
        <div className="relative">
          <button type="button" aria-label="More" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="w-11 h-11 -mr-3 flex items-center justify-center text-awburg-mid text-[18px] leading-none">{"⋯"}</button>
          {menu && (
            <div className="absolute right-0 top-10 z-20 bg-paper border border-awburg-core/10 rounded-2xl shadow-lg overflow-hidden min-w-[150px]">
              <button type="button" className="block w-full text-left px-4 py-3 font-body text-[12.5px] text-awburg-dark hover:bg-awrose-wash" onClick={() => { setMenu(false); onReport(post); }}>Report</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function WelcomePost({ pinned, host }) {
  if (!pinned) return null;
  return (
    <div className="rounded-[22px] bg-awrose-pale px-5 py-[18px]">
      <div className="flex items-center gap-2 mb-2">
        <HostLogo host={host} size={22} />
        <p className="font-body font-bold text-[9.5px] tracking-eyebrow uppercase text-awburg-core">From {host?.first_name || "the host"}</p>
        <svg className="ml-auto text-awburg-core" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-label="Pinned"><path d="M16 3l5 5-4 1-3 3 1 6-2 2-4-4-5 5-1-1 5-5-4-4 2-2 6 1 3-3z" /></svg>
      </div>
      <p className="font-body font-light text-[14px] leading-[1.65] text-awburg-dark whitespace-pre-line">{pinned.body}</p>
    </div>
  );
}

export function NotifySheet({ open, onClose, group, current, onSaved }) {
  const [pref, setPref] = useState(current || "mine");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("notifyCircle", { groupId: group.id, action: "set_pref", notifyPref: pref });
      if ((res?.data || res)?.error) throw new Error("failed");
      onSaved(pref);
      onClose();
    } catch (_e) {
      setError("That did not save. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open={open} onClose={onClose} label="Notification settings">
      <NotifyBody pref={pref} setPref={setPref} busy={busy} error={error} onSave={save} onCancel={onClose} />
    </Sheet>
  );
}

export function NotifyBody({ pref, setPref, options, busy, error, onSave, onCancel, inline = false }) {
  const opts = options || [
    { key: "mine", label: "My threads only", note: "Replies and answers to questions you asked or replied to." },
    { key: "all", label: "All new questions", note: "Every new question posted in the Circle." },
    { key: "none", label: "Nothing", note: "You will still be able to visit the Circle any time." },
  ];
  return (
    <div className={inline ? "" : "px-[22px] pt-6 pb-8 md:px-8"}>
      <h2 className={`font-display ${inline ? "text-[18px]" : "text-[24px]"} leading-tight text-awburg-dark mb-4`}>
        How much do you want to hear from <em className="italic text-awburg-bright">the Circle</em>
      </h2>
      <div className="flex flex-col gap-2" role="radiogroup">
        {opts.map((o) => (
          <label key={o.key} className={`flex items-start gap-3 rounded-[18px] border px-4 py-3 cursor-pointer min-h-[52px] ${pref === o.key ? "bg-awrose-pale border-awrose-pale" : "bg-paper border-awburg-core/10"}`}>
            <input type="radio" name="notify" className="sr-only" checked={pref === o.key} onChange={() => setPref(o.key)} />
            <span aria-hidden="true" className={`flex-none mt-[3px] w-[18px] h-[18px] rounded-full border-[1.5px] ${pref === o.key ? "border-awburg-core bg-awburg-core" : "border-awburg-core/30 bg-paper"}`} />
            <span>
              <span className="block font-body font-semibold text-[13.5px] text-awburg-dark">{o.label}</span>
              <span className="block font-body font-light text-[12px] leading-[1.5] text-awburg-mid">{o.note}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="font-body font-light text-[11.5px] leading-[1.6] text-awburg-mid mt-3 mb-4">We email you and show it in the app. Nothing shows who you are.</p>
      {error && <p className="font-body text-[12px] text-awrose-deep mb-3">{error}</p>}
      <button type="button" className={`${BTN_PRIMARY} ${inline ? "min-h-[48px]" : ""}`} disabled={busy} onClick={onSave}>{busy ? "Saving..." : "Save"}</button>
      {!inline && <button type="button" className={`${BTN_TEXT} w-full mt-2`} onClick={onCancel}>Cancel</button>}
    </div>
  );
}

export default function CircleFeed({ group, host, me, posts, pinned, onOpenPost, onAsk, onShare, onReport, onModerate, pendingCount, onPrefSaved }) {
  const [filter, setFilter] = useState(() => new URLSearchParams(window.location.search).get("filter") || "all");
  const [search, setSearch] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [inlinePref, setInlinePref] = useState(me?.notify_pref || "mine");
  const [inlineBusy, setInlineBusy] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const topics = activeTopics(group);
  const isMod = me?.role === "host" || me?.role === "admin";

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (filter === "unanswered" && p.status === "answered") return false;
      if (filter === "answered" && p.status !== "answered") return false;
      if (filter !== "all" && filter !== "unanswered" && filter !== "answered" && p.topic_key !== filter) return false;
      if (q && !String(p.body || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [posts, filter, search]);

  const saveInline = async () => {
    setInlineBusy(true);
    setInlineError("");
    try {
      const res = await base44.functions.invoke("notifyCircle", { groupId: group.id, action: "set_pref", notifyPref: inlinePref });
      if ((res?.data || res)?.error) throw new Error("failed");
      onPrefSaved?.(inlinePref);
    } catch (_e) {
      setInlineError("That did not save. Try again in a moment.");
    } finally {
      setInlineBusy(false);
    }
  };

  const chips = [
    { key: "all", label: "All" },
    { key: "unanswered", label: "Unanswered" },
    { key: "answered", label: "Answered" },
  ];

  const empty = posts.length === 0;

  return (
    <div className="md:max-w-[1100px] md:mx-auto md:grid md:grid-cols-[minmax(0,680px)_320px] md:gap-10 md:px-10 md:pt-8 md:pb-16">
      <div className="px-[22px] pt-6 pb-8 md:px-0 md:pt-0 flex flex-col gap-4">
        {!empty && group.description && (
          <p className="font-body font-light text-[13.5px] leading-[1.65] text-awburg-dark">
            {group.description}{" "}
            <button type="button" className="underline underline-offset-4 font-semibold text-awburg-bright" onClick={() => setRulesOpen(true)}>Circle rules</button>
          </p>
        )}

        {!empty && (
          <div className="flex gap-2">
            <button type="button" className={BTN_PRIMARY} onClick={onAsk}>Ask a question</button>
            {isMod ? (
              <button type="button" className={`${BTN_SECONDARY} relative`} onClick={onModerate}>
                Moderate
                {pendingCount > 0 && <span className="absolute -top-2 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-awburg-bright text-paper font-body text-[10.5px] font-bold flex items-center justify-center">{pendingCount}</span>}
              </button>
            ) : (
              <button type="button" className={BTN_SECONDARY} onClick={onShare}>Share</button>
            )}
            <button type="button" aria-label="Notification settings" onClick={() => setNotifyOpen(true)} className="md:hidden flex-none w-12 h-12 rounded-full border-[1.5px] border-awburg-core/15 bg-paper flex items-center justify-center text-awburg-core">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            </button>
          </div>
        )}

        {!empty && (
          <>
            <label className="relative block">
              <span className="sr-only">Search the Circle</span>
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-awburg-mid" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the Circle" className="w-full h-12 rounded-full bg-off-white border border-awburg-core/15 focus:border-awrose-core pl-11 pr-4 font-body text-[13.5px] text-awburg-dark outline-none" />
            </label>
            <div className="flex gap-2 overflow-x-auto -mx-[22px] px-[22px] pb-1 md:flex-wrap md:mx-0 md:px-0 md:overflow-visible" role="tablist" aria-label="Filter">
              {chips.map((c) => (
                <button key={c.key} type="button" role="tab" aria-selected={filter === c.key} onClick={() => setFilter(c.key)} className={filter === c.key ? CHIP_ON : CHIP}>{c.label}</button>
              ))}
              <span className="flex-none w-px bg-awburg-core/15 my-1" aria-hidden="true" />
              {topics.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={filter === t.key} onClick={() => setFilter(t.key)} className={filter === t.key ? CHIP_ON : CHIP}>{t.label}</button>
              ))}
            </div>
          </>
        )}

        <WelcomePost pinned={pinned} host={host} />

        {empty ? (
          <div className={`${CARD} px-6 py-8 text-center flex flex-col items-center gap-3`}>
            <h2 className="font-display text-[24px] leading-tight text-awburg-dark m-0">Nothing here yet, and that is <em className="italic text-awburg-bright">the point</em>.</h2>
            <p className="font-body font-light text-[14px] leading-[1.65] text-awburg-dark max-w-[380px]">
              You are one of the first women in the Circle. Ask the thing you have been carrying. {host?.first_name || "The host"} reads every question herself.
            </p>
            <button type="button" className={`${BTN_PRIMARY} md:w-auto md:px-8 mt-2`} onClick={onAsk}>Ask a question</button>
            {isMod && <button type="button" className={BTN_TEXT} onClick={onModerate}>Moderate{pendingCount > 0 ? ` (${pendingCount})` : ""}</button>}
          </div>
        ) : shown.length === 0 ? (
          <p className="font-body font-light text-[13px] text-awburg-mid text-center py-6">Nothing matches that yet.</p>
        ) : (
          shown.map((p) => <QuestionCard key={p.id} post={p} group={group} host={host} onOpen={onOpenPost} onReport={onReport} />)
        )}

        {!empty && shown.length > 0 && (
          <p className="font-body font-light text-[12px] text-awburg-mid text-center pt-2">You have reached the start of the Circle.</p>
        )}
        <FinePrint host={host} className="pt-2 md:hidden" />
      </div>

      <aside className="hidden md:flex flex-col gap-4 sticky top-6 self-start">
        <HostCard host={host} />
        <TrustChips />
        <button type="button" className="text-left font-body text-[12.5px] font-semibold text-awburg-bright underline underline-offset-4 min-h-[44px] px-1" onClick={() => setRulesOpen(true)}>Circle rules</button>
        <div className={`${CARD} p-5`}>
          <NotifyBody inline pref={inlinePref} setPref={setInlinePref} busy={inlineBusy} error={inlineError} onSave={saveInline} />
        </div>
        <FinePrint host={host} />
      </aside>

      <RulesModal open={rulesOpen} rules={group.rules_text} onClose={() => setRulesOpen(false)} />
      <NotifySheet open={notifyOpen} onClose={() => setNotifyOpen(false)} group={group} current={me?.notify_pref} onSaved={(p) => { setInlinePref(p); onPrefSaved?.(p); }} />
    </div>
  );
}
