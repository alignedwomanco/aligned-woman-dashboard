import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { activeTopics, shortTime, topicLabel } from "@/lib/circle";
import { BTN_PRIMARY, BTN_SECONDARY, BTN_TEXT, CARD, CHIP, CHIP_ON, Avatar, HostCard, HostLogo, FinePrint, RulesModal, Sheet } from "@/components/circle/CircleShell";
import { MediaBlock, ModeratorLine, TopicChip } from "@/components/circle/CircleFeed";

// ────────────────────────────────────────────────────────────────
// Thread · Section B, screen 7. The question, the host's answer pinned
// under it, one level of replies, the Asked this marker on the asker's
// own replies, a reply box with its own anonymous switch, and Report.
// ────────────────────────────────────────────────────────────────

const REPORT_REASONS = [
  { value: "harassment", label: "Unkind or unsafe" },
  { value: "misinformation", label: "Medical advice given as fact" },
  { value: "safety_concern", label: "Shares something private" },
  { value: "spam", label: "Spam or selling" },
  { value: "other", label: "Something else" },
];

export function ReportSheet({ open, target, group, host, onClose }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (!open) { setReason(""); setNote(""); setDone(false); setError(""); } }, [open]);
  const first = host?.first_name || "the host";

  const send = async () => {
    if (!reason) { setError("Choose what is wrong."); return; }
    setBusy(true);
    setError("");
    try {
      await base44.entities.Report.create({
        target_type: "post",
        target_id: target.id,
        target_preview: String(target.body || "").slice(0, 500),
        group_id: group.id,
        reason,
        detail: note.trim(),
        status: "open",
      });
      setDone(true);
    } catch (_e) {
      setError("We could not send that just now. Please try again, or email hello@alignedwomanco.com.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} label="Report">
      <div className="px-[22px] pt-6 pb-8 md:px-8">
        {done ? (
          <>
            <h2 className="font-display text-[26px] leading-tight text-awburg-dark mb-2">Thank <em className="italic text-awburg-bright">you</em>.</h2>
            <p className="font-body font-light text-[14px] leading-[1.65] text-awburg-dark mb-6">{first} and The Aligned Woman Co. will look at this.</p>
            <button type="button" className={BTN_SECONDARY} onClick={onClose}>Back to the thread</button>
          </>
        ) : (
          <>
            <h2 className="font-display text-[22px] leading-tight text-awburg-dark mb-4">Report this to {first} and The Aligned Woman Co.</h2>
            <div className="flex flex-col gap-2" role="radiogroup">
              {REPORT_REASONS.map((r) => (
                <label key={r.value} className={`flex items-center gap-3 rounded-[16px] border px-4 min-h-[48px] cursor-pointer ${reason === r.value ? "bg-awrose-pale border-awrose-pale" : "bg-paper border-awburg-core/10"}`}>
                  <input type="radio" name="report-reason" className="sr-only" checked={reason === r.value} onChange={() => { setReason(r.value); setError(""); }} />
                  <span aria-hidden="true" className={`flex-none w-[18px] h-[18px] rounded-full border-[1.5px] ${reason === r.value ? "border-awburg-core bg-awburg-core" : "border-awburg-core/30 bg-paper"}`} />
                  <span className="font-body text-[13.5px] text-awburg-dark">{r.label}</span>
                </label>
              ))}
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={`Anything you want ${first} to know, optional`} className="w-full mt-3 bg-paper border border-awburg-core/15 focus:border-awrose-core rounded-[16px] px-4 py-3 font-body font-light text-[13.5px] text-awburg-dark outline-none resize-y" />
            {error && <p className="font-body text-[12.5px] text-awrose-deep mt-2">{error}</p>}
            <button type="button" className={`${BTN_PRIMARY} mt-4`} disabled={busy} onClick={send}>{busy ? "Sending..." : "Send report"}</button>
            <button type="button" className={`${BTN_TEXT} w-full mt-2`} onClick={onClose}>Cancel</button>
          </>
        )}
      </div>
    </Sheet>
  );
}

function Reply({ post, host, group, isMod, onReport, onMenuAction }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="flex gap-3 py-3 border-t border-awburg-core/10">
      {post.author_is_host ? <HostLogo host={host} src={group?.logo_url} size={28} /> : <Avatar post={post} size={28} />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-body font-semibold text-[12.5px] text-awburg-dark">{post.author_name}</span>
          {post.author_is_host && <span className="rounded-full bg-awburg-core text-paper font-body text-[8.5px] font-bold tracking-[0.16em] uppercase px-2 py-[2px]">Host</span>}
          {post.is_asker && !post.author_is_host && <span className="rounded-full border border-awburg-core/40 text-awburg-core font-body text-[8.5px] font-bold tracking-[0.16em] uppercase px-2 py-[2px]">Asked this</span>}
          <span className="font-body text-[11px] text-awburg-mid">{shortTime(post.created_date)}</span>
          <div className="relative ml-auto">
            <button type="button" aria-label="More" onClick={() => setMenu((m) => !m)} className="w-9 h-9 -mr-2 flex items-center justify-center text-awburg-mid text-[16px]">{"⋯"}</button>
            {menu && (
              <div className="absolute right-0 top-8 z-20 bg-paper border border-awburg-core/10 rounded-2xl shadow-lg overflow-hidden min-w-[170px]">
                <button type="button" className="block w-full text-left px-4 py-3 font-body text-[12.5px] text-awburg-dark hover:bg-awrose-wash" onClick={() => { setMenu(false); onReport(post); }}>Report</button>
                {isMod && <button type="button" className="block w-full text-left px-4 py-3 font-body text-[12.5px] text-awburg-dark hover:bg-awrose-wash" onClick={() => { setMenu(false); onMenuAction("delete_post", post); }}>Remove reply</button>}
              </div>
            )}
          </div>
        </div>
        <ModeratorLine post={post} />
        <p className="font-body font-light text-[13.5px] leading-[1.6] text-awburg-dark mt-1 whitespace-pre-line">{post.body}</p>
        <MediaBlock media={post.media} full />
      </div>
    </div>
  );
}

export default function CircleThread({ group, host, me, post, replies, onBack, onPosted, onModerateAction }) {
  const [draft, setDraft] = useState("");
  const [anon, setAnon] = useState(!!post?.is_asker && !!post?.is_anonymous);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [retagOpen, setRetagOpen] = useState(false);
  const isMod = me?.role === "host" || me?.role === "admin";
  // The woman who asked anonymously stays anonymous on her own thread. The
  // server enforces it; the switch is simply not offered to her here.
  const askedAnonymously = post?.is_mine && post?.is_anonymous;

  useEffect(() => { setAnon(!!askedAnonymously); }, [askedAnonymously, post?.id]);

  const answer = replies.find((r) => r.id === post.answer_post_id) || replies.find((r) => r.author_is_host) || null;
  const others = replies.filter((r) => r.id !== answer?.id);

  const send = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("createCirclePost", { groupId: group.id, body: draft.trim(), parentId: post.id, isAnonymous: anon });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      setDraft("");
      onPosted();
    } catch (_e) {
      setError("That did not send. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="md:max-w-[1100px] md:mx-auto md:grid md:grid-cols-[minmax(0,680px)_320px] md:gap-10 md:px-10 md:pt-8 md:pb-16">
      <div className="px-[22px] pt-5 pb-32 md:px-0 md:pt-0 md:pb-8 flex flex-col gap-4">
        <button type="button" onClick={onBack} className="self-start font-body text-[12px] font-semibold text-awburg-core min-h-[44px] inline-flex items-center gap-1">
          <span aria-hidden="true">{"←"}</span> Back to the Circle
        </button>

        <article className={`${CARD} px-5 py-[18px]`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <TopicChip label={topicLabel(group, post.topic_key)} />
            <div className="relative">
              <button type="button" aria-label="More" onClick={() => setMenu((m) => !m)} className="w-11 h-11 -mr-3 flex items-center justify-center text-awburg-mid text-[18px]">{"⋯"}</button>
              {menu && (
                <div className="absolute right-0 top-10 z-20 bg-paper border border-awburg-core/10 rounded-2xl shadow-lg overflow-hidden min-w-[190px]">
                  <button type="button" className="block w-full text-left px-4 py-3 font-body text-[12.5px] text-awburg-dark hover:bg-awrose-wash" onClick={() => { setMenu(false); setReport(post); }}>Report</button>
                  {isMod && (
                    <>
                      <button type="button" className="block w-full text-left px-4 py-3 font-body text-[12.5px] text-awburg-dark hover:bg-awrose-wash" onClick={() => { setMenu(false); onModerateAction(post.status === "answered" ? "unmark_answered" : "mark_answered", post, answer?.id); }}>
                        {post.status === "answered" ? "Mark as open" : "Mark as answered"}
                      </button>
                      <button type="button" className="block w-full text-left px-4 py-3 font-body text-[12.5px] text-awburg-dark hover:bg-awrose-wash" onClick={() => { setMenu(false); onModerateAction(post.is_pinned ? "unpin" : "pin", post); }}>
                        {post.is_pinned ? "Unpin" : "Pin to the top"}
                      </button>
                      <button type="button" className="block w-full text-left px-4 py-3 font-body text-[12.5px] text-awburg-dark hover:bg-awrose-wash" onClick={() => { setMenu(false); setRetagOpen(true); }}>
                        Change topic
                      </button>
                      <button type="button" className="block w-full text-left px-4 py-3 font-body text-[12.5px] text-awrose-deep hover:bg-awrose-wash" onClick={() => { setMenu(false); onModerateAction("delete_post", post); }}>Remove post</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Avatar post={post} size={32} />
            <div className="min-w-0">
              <p className="font-body font-semibold text-[13px] text-awburg-dark">{post.author_name}</p>
              <ModeratorLine post={post} />
            </div>
            <span className="ml-auto font-body text-[11px] text-awburg-mid">{shortTime(post.created_date)}</span>
          </div>
          <p className="font-body font-light text-[15px] leading-[1.65] text-awburg-dark whitespace-pre-line">{post.body}</p>
          <MediaBlock media={post.media} full />
          {retagOpen && isMod && (
            <div className="mt-4 pt-4 border-t border-awburg-core/10">
              <p className="font-body font-semibold text-[12px] text-awburg-dark mb-2">Move this to</p>
              <div className="flex flex-wrap gap-2">
                {activeTopics(group).map((t) => (
                  <button key={t.key} type="button" className={t.key === post.topic_key ? CHIP_ON : CHIP} onClick={() => { setRetagOpen(false); if (t.key !== post.topic_key) onModerateAction("retag", post, t.key); }}>
                    {t.label}
                  </button>
                ))}
              </div>
              <button type="button" className={BTN_TEXT} onClick={() => setRetagOpen(false)}>Cancel</button>
            </div>
          )}
        </article>

        {answer && (
          <div className="rounded-[22px] bg-awrose-wash border-l-[3px] border-awsage-core px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <HostLogo host={host} src={group.logo_url} size={20} />
              <p className="font-body font-bold text-[9.5px] tracking-eyebrow uppercase text-awburg-core">{host?.first_name || "The host"} answered</p>
              <span className="ml-auto font-body text-[11px] text-awburg-mid">{shortTime(answer.created_date)}</span>
            </div>
            <p className="font-body font-light text-[14px] leading-[1.65] text-awburg-dark whitespace-pre-line">{answer.body}</p>
            <MediaBlock media={answer.media} full />
          </div>
        )}

        {others.length > 0 && (
          <div className={`${CARD} px-5 py-2`}>
            {others.map((r) => <Reply key={r.id} post={r} host={host} group={group} isMod={isMod} onReport={setReport} onMenuAction={onModerateAction} />)}
          </div>
        )}

        {/* Reply box: fixed above the safe area on mobile, in flow on desktop */}
        <div className="fixed md:static bottom-0 left-0 right-0 z-30 bg-off-white/95 backdrop-blur border-t md:border border-awburg-core/10 md:rounded-[22px] px-[18px] pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Reply to this question"
              className="flex-1 min-w-0 h-12 rounded-full bg-paper border border-awburg-core/15 focus:border-awrose-core px-4 font-body text-[13.5px] text-awburg-dark outline-none"
            />
            <button type="button" aria-label="Send reply" disabled={busy || !draft.trim()} onClick={send} className="flex-none w-12 h-12 rounded-full bg-awburg-core text-paper flex items-center justify-center disabled:opacity-40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </div>
          {!(me?.role === "host") && !askedAnonymously && (
            <label className="flex items-center justify-between gap-3 min-h-[36px] cursor-pointer">
              <span className="font-body text-[11.5px] text-awburg-dark">Reply as Anonymous member · {anon ? "On" : "Off"}</span>
              <input type="checkbox" role="switch" aria-checked={anon} className="sr-only peer" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
              <span aria-hidden="true" className={`relative inline-block w-[40px] h-[22px] rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-awrose-deep ${anon ? "bg-awburg-core" : "bg-awburg-core/20"}`}>
                <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-paper transition-all ${anon ? "left-[21px]" : "left-[3px]"}`} />
              </span>
            </label>
          )}
          {askedAnonymously && <p className="font-body text-[11px] text-awburg-mid">Kept anonymous so your question stays yours.</p>}
          {error && <p className="font-body text-[11.5px] text-awrose-deep">{error}</p>}
        </div>
      </div>

      <aside className="hidden md:flex flex-col gap-4 sticky top-6 self-start">
        <HostCard host={host} />
        <button type="button" className="text-left font-body text-[12.5px] font-semibold text-awburg-bright underline underline-offset-4 min-h-[44px] px-1" onClick={() => setRulesOpen(true)}>Circle rules</button>
        <FinePrint host={host} />
      </aside>

      <ReportSheet open={!!report} target={report} group={group} host={host} onClose={() => setReport(null)} />
      <RulesModal open={rulesOpen} rules={group.rules_text} onClose={() => setRulesOpen(false)} />
    </div>
  );
}