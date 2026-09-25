import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DEFAULT_CIRCLE_TOPICS, DEFAULT_RULES_TEXT, WEEKDAYS, randomId } from "@/lib/circle";

// ────────────────────────────────────────────────────────────────
// My Community · the host's setup checklist and room settings.
//
// Six cards: Your room · About you · The rules · Topics · Your welcome
// post · Your invite link. Fields autosave on blur through
// moderateCircle, so the host never hunts for a Save button, and the
// room stays in draft until she presses Publish. Day to day moderation
// lives inside the room; the two counters deep link there.
// ────────────────────────────────────────────────────────────────

const SITE_URL = "https://app.alignedwomanco.com";
const CARD = "rounded-3xl bg-paper border border-awburg-core/10 p-5 md:p-6 shadow-sm";
const INPUT = "w-full min-h-[44px] bg-off-white border border-awburg-core/15 focus:border-awrose-core rounded-xl px-3 py-2 font-body text-[13px] text-awburg-core outline-none";
const TEXTAREA = `${INPUT} resize-y leading-relaxed`;
const LABEL = "block font-body font-medium text-[11px] text-awburg-core mb-1.5";
const HELPER = "font-body font-light text-[11.5px] text-awburg-mid mt-1.5 leading-relaxed";
const BTN_PRIMARY = "inline-flex items-center justify-center rounded-full bg-awburg-core hover:bg-awburg-dark text-paper font-body font-bold text-[11px] tracking-eyebrow uppercase min-h-[48px] px-7 transition-colors disabled:opacity-50";
const BTN_SECONDARY = "inline-flex items-center justify-center rounded-full border-[1.5px] border-awrose-core text-awburg-core hover:bg-awrose-wash font-body font-bold text-[11px] tracking-eyebrow uppercase min-h-[44px] px-6 transition-colors disabled:opacity-50";

async function call(action, groupId, extra = {}) {
  const res = await base44.functions.invoke("moderateCircle", { groupId, action, ...extra });
  const data = res?.data || res;
  if (data?.error) throw new Error(data.error);
  return data;
}

function CardHead({ step, title, done, children }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className={`flex-none w-7 h-7 rounded-full flex items-center justify-center font-body text-[11px] font-bold ${done ? "bg-awsage-core text-paper" : "bg-awrose-pale text-awburg-core"}`} aria-hidden="true">
        {done ? "✓" : step}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-[19px] text-awburg-core leading-tight">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function SaveMark({ state }) {
  if (!state) return null;
  return (
    <span className={`font-body text-[11px] ${state === "error" ? "text-awrose-deep" : "text-awburg-mid"}`}>
      {state === "saving" ? "Saving..." : state === "saved" ? "Saved" : "Not saved, try again"}
    </span>
  );
}

export default function MyCommunityTab({ groupId }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["partner-community", groupId],
    queryFn: () => call("overview", groupId),
    enabled: !!groupId,
  });

  const room = data?.room || null;
  const [form, setForm] = useState(null);
  const [saveState, setSaveState] = useState("");
  const [welcome, setWelcome] = useState("");
  const [posting, setPosting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (room && !form) {
      setForm({
        name: room.name || "",
        subtitle: room.subtitle || "",
        description: room.description || "",
        host_bio_override: room.host_bio_override || data?.host?.bio || "",
        rules_text: room.rules_text || DEFAULT_RULES_TEXT,
        topics: Array.isArray(room.topics) && room.topics.length ? room.topics : [],
      });
    }
  }, [room, form, data]);

  // The weekly live hour. South African time, so it is set once and the
  // room works out the next one itself.
  useEffect(() => {
    if (room && !live) {
      setLive(room.live_session || { on: false, day: 2, start_time: "20:00", duration_minutes: 60, label: "Circle Hour" });
    }
  }, [room, live]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["partner-community", groupId] });

  const saveLive = (patch) => {
    const next = { ...live, ...patch };
    setLive(next);
    save({ live_session: next });
  };

  const save = async (fields) => {
    setSaveState("saving");
    try {
      await call("update_room", groupId, { fields });
      setSaveState("saved");
      refresh();
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveState(""), 1800);
    } catch (_e) {
      setSaveState("error");
    }
  };

  const done = useMemo(() => {
    if (!room || !form) return {};
    return {
      room: !!form.name.trim() && !!form.subtitle.trim() && !!form.description.trim(),
      about: !!form.host_bio_override.trim(),
      rules: !!form.rules_text.trim(),
      topics: form.topics.filter((t) => t.active !== false).length >= 3,
      live: !!live?.on,
      welcome: !!room.welcome_post_id,
      link: room.status === "published",
    };
  }, [room, form, live]);
  const doneCount = Object.values(done).filter(Boolean).length;

  if (!groupId) return null;
  if (isLoading || !form) {
    return <p className="font-body text-[13px] text-awburg-mid">Loading your community...</p>;
  }
  if (error || !room) {
    return <p className="font-body text-[13px] text-awrose-deep">We could not load your community. Refresh the page, or email hello@alignedwomanco.com.</p>;
  }

  const roomUrl = `${SITE_URL}/${room.slug}`;
  const isPublished = room.status === "published";
  const pending = data?.requests?.length || 0;
  const openQuestions = data?.insights?.questions_open || 0;

  const postWelcome = async () => {
    if (!welcome.trim()) return;
    setPosting(true);
    try {
      const res = await base44.functions.invoke("createCirclePost", { groupId, body: welcome.trim(), postType: "welcome" });
      const d = res?.data || res;
      if (d?.error) throw new Error(d.error);
      setWelcome("");
      refresh();
    } catch (_e) {
      setSaveState("error");
    } finally {
      setPosting(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    try {
      await call(isPublished ? "unpublish" : "publish", groupId);
      refresh();
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (_e) { /* clipboard blocked, the link is visible to copy by hand */ }
  };

  const updateTopic = (i, patch) => {
    setForm((f) => ({ ...f, topics: f.topics.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) }));
  };
  const moveTopic = (i, dir) => {
    setForm((f) => {
      const arr = [...f.topics];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      const next = arr.map((t, idx) => ({ ...t, order: idx }));
      save({ topics: next });
      return { ...f, topics: next };
    });
  };

  return (
    <div className="space-y-5">
      {/* Not visible yet banner */}
      <div className={`rounded-3xl p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 ${isPublished ? "bg-awsage-wash border border-awsage-core/30" : "bg-awburg-core text-paper"}`}>
        <div>
          <p className={`font-body font-bold text-[10px] tracking-eyebrow uppercase mb-1 ${isPublished ? "text-awsage-core" : "text-awrose-light"}`}>
            {isPublished ? "Live" : "Not visible yet"}
          </p>
          <p className={`font-display text-[20px] leading-tight ${isPublished ? "text-awburg-core" : "text-paper"}`}>
            {isPublished ? `${room.name} is open at ${roomUrl.replace("https://", "")}` : `${room.name} is private until you publish it.`}
          </p>
          <p className={`font-body font-light text-[12.5px] mt-1 ${isPublished ? "text-awburg-mid" : "text-paper/80"}`}>
            {doneCount} of 7 steps done{isPublished ? "" : ". You can publish at any point; the steps are a guide, not a gate."}
          </p>
        </div>
        <button type="button" onClick={publish} disabled={publishing} className={isPublished ? BTN_SECONDARY : "inline-flex items-center justify-center rounded-full bg-paper text-awburg-core font-body font-bold text-[11px] tracking-eyebrow uppercase min-h-[48px] px-7 transition-colors hover:bg-awrose-wash disabled:opacity-50"}>
          {publishing ? "One moment..." : isPublished ? "Take private" : "Publish"}
        </button>
      </div>

      {/* Room card with the two counters */}
      <div className={`${CARD} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-4 min-w-0">
          {data?.host?.logo_url ? (
            <img src={data.host.logo_url} alt="" className="w-12 h-12 rounded-full object-cover border-[1.5px] border-awsage-core flex-none" />
          ) : (
            <span className="w-12 h-12 rounded-full bg-awrose-pale border-[1.5px] border-awsage-core flex-none" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <p className="font-display text-[20px] text-awburg-core leading-tight truncate">{room.name}</p>
            <p className="font-body font-light text-[12px] text-awburg-mid truncate">{roomUrl.replace("https://", "")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/${room.slug}?tab=moderate&view=requests`} className="rounded-2xl bg-off-white border border-awburg-core/10 px-4 py-3 min-w-[120px] hover:border-awburg-core/30 transition-colors">
            <p className="font-display text-[24px] text-awburg-core leading-none">{pending}</p>
            <p className="font-body text-[11px] text-awburg-mid mt-1">{pending === 1 ? "request waiting" : "requests waiting"}</p>
          </Link>
          <Link to={`/${room.slug}?filter=unanswered`} className="rounded-2xl bg-off-white border border-awburg-core/10 px-4 py-3 min-w-[120px] hover:border-awburg-core/30 transition-colors">
            <p className="font-display text-[24px] text-awburg-core leading-none">{openQuestions}</p>
            <p className="font-body text-[11px] text-awburg-mid mt-1">{openQuestions === 1 ? "open question" : "open questions"}</p>
          </Link>
          <Link to={`/${room.slug}`} className={`${BTN_SECONDARY} self-center`}>Preview as a member</Link>
        </div>
      </div>

      <div className={`${CARD} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <p className="font-body font-semibold text-[14px] text-awburg-dark">Read the host guide before you open the doors.</p>
          <p className="font-body font-light text-[12.5px] text-awburg-mid">What you can see as a host, what we ask of you, and how join requests and reports work.</p>
        </div>
        <Link to="/host-guide" className={BTN_SECONDARY}>Open the host guide</Link>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-deep">Set up your Circle</p>
        <SaveMark state={saveState} />
      </div>

      {/* 1 Your room */}
      <section className={CARD}>
        <CardHead step={1} title="Your room" done={done.room}>
          <p className={HELPER}>The name, the line under it, and the intro women read at the top of the feed. Your logo comes from your listing. The address is fixed once shared; email us if it needs to change.</p>
        </CardHead>
        <div className="grid gap-4">
          <div>
            <label className={LABEL}>Room name</label>
            <input className={INPUT} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onBlur={() => { if (form.name.trim()) save({ name: form.name }); }} placeholder="The Grounded Women Circle" />
          </div>
          <div>
            <label className={LABEL}>Subtitle</label>
            <input className={INPUT} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} onBlur={() => save({ subtitle: form.subtitle })} placeholder="Grounded women. Still growing. Still living." />
          </div>
          <div>
            <label className={LABEL}>Room intro</label>
            <textarea className={TEXTAREA} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} onBlur={() => save({ description: form.description })} placeholder="A closed circle for women of culture to talk honestly about hormonal health. Ask anything. Post anonymously if you want to." />
          </div>
        </div>
      </section>

      {/* 2 About you */}
      <section className={CARD}>
        <CardHead step={2} title="About you" done={done.about}>
          <p className={HELPER}>Shown on the host card in the room. First person, a few lines.</p>
        </CardHead>
        <textarea className={TEXTAREA} rows={4} value={form.host_bio_override} onChange={(e) => setForm((f) => ({ ...f, host_bio_override: e.target.value }))} onBlur={() => save({ host_bio_override: form.host_bio_override })} />
      </section>

      {/* 3 The rules */}
      <section className={CARD}>
        <CardHead step={3} title="The rules" done={done.rules}>
          <p className={HELPER}>Every member agrees to these before she can request to join. Edit them, or keep the default. Three things stay whatever you write, because they are our promise to every member: women only, approved members only, nothing shared outside the room.</p>
        </CardHead>
        <textarea className={TEXTAREA} rows={5} value={form.rules_text} onChange={(e) => setForm((f) => ({ ...f, rules_text: e.target.value }))} onBlur={() => save({ rules_text: form.rules_text })} />
      </section>

      {/* 4 Topics */}
      <section className={CARD}>
        <CardHead step={4} title="Topics" done={done.topics}>
          <p className={HELPER}>Members tag every question with one. Rename, reorder, or retire them any time. Something else stays last.</p>
        </CardHead>
        {form.topics.length === 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-body font-light text-[13px] text-awburg-mid">No topics yet.</p>
            <button type="button" className={BTN_SECONDARY} onClick={() => { setForm((f) => ({ ...f, topics: DEFAULT_CIRCLE_TOPICS })); save({ topics: DEFAULT_CIRCLE_TOPICS }); }}>
              Start from the hormone health list
            </button>
          </div>
        ) : (
          <ul className="grid gap-2">
            {form.topics.map((t, i) => (
              <li key={t.key || i} className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${t.active === false ? "opacity-50" : ""}`}>
                <input
                  className={`${INPUT} min-h-[40px]`}
                  value={t.label}
                  onChange={(e) => updateTopic(i, { label: e.target.value })}
                  onBlur={() => save({ topics: form.topics })}
                  aria-label={`Topic ${i + 1}`}
                />
                <button type="button" className="w-10 h-10 rounded-full border border-awburg-core/15 text-awburg-core font-body text-[14px]" onClick={() => moveTopic(i, -1)} aria-label="Move up">↑</button>
                <button type="button" className="w-10 h-10 rounded-full border border-awburg-core/15 text-awburg-core font-body text-[14px]" onClick={() => moveTopic(i, 1)} aria-label="Move down">↓</button>
                <button
                  type="button"
                  className="min-h-[40px] px-3 rounded-full border border-awburg-core/15 text-awburg-mid font-body text-[11px] font-semibold whitespace-nowrap"
                  onClick={() => { const next = form.topics.map((x, idx) => (idx === i ? { ...x, active: x.active === false } : x)); setForm((f) => ({ ...f, topics: next })); save({ topics: next }); }}
                >
                  {t.active === false ? "Restore" : "Retire"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {form.topics.length > 0 && (
          <button
            type="button"
            className="mt-3 font-body text-[12px] font-semibold text-awburg-core underline underline-offset-4"
            onClick={() => setForm((f) => ({ ...f, topics: [...f.topics, { key: `t${randomId().slice(0, 10)}`, label: "", order: f.topics.length, active: true }] }))}
          >
            Add a topic
          </button>
        )}
      </section>

      {/* 5 Your live hour */}
      <section className={CARD}>
        <CardHead step={5} title="Your live hour" done={!!live?.on}>
          <p className={HELPER}>Your live hour. Pick one time a week when you are in the room. Members see the next one automatically, so you never have to post a reminder.</p>
        </CardHead>
        {live && (
          <div className="grid gap-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer min-h-[44px]">
              <span className="font-body font-semibold text-[14px] text-awburg-dark">Show your live hour in the room</span>
              <span className="flex items-center gap-2">
                <span className="font-body text-[11px] text-awburg-mid">{live.on ? "On" : "Off"}</span>
                <input type="checkbox" role="switch" aria-checked={live.on} className="sr-only peer" checked={live.on} onChange={(e) => saveLive({ on: e.target.checked })} />
                <span aria-hidden="true" className={`relative inline-block w-[46px] h-[26px] rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-awrose-deep ${live.on ? "bg-awburg-core" : "bg-awburg-core/20"}`}>
                  <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-paper transition-all ${live.on ? "left-[23px]" : "left-[3px]"}`} />
                </span>
              </span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL}>Day</label>
                <select className={INPUT} value={live.day} onChange={(e) => saveLive({ day: Number(e.target.value) })}>
                  {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Start time (South African time)</label>
                <input
                  type="time"
                  className={INPUT}
                  value={live.start_time}
                  onChange={(e) => setLive((l) => ({ ...l, start_time: e.target.value }))}
                  onBlur={(e) => saveLive({ start_time: e.target.value })}
                />
              </div>
              <div>
                <label className={LABEL}>How long</label>
                <select className={INPUT} value={live.duration_minutes} onChange={(e) => saveLive({ duration_minutes: Number(e.target.value) })}>
                  {[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} minutes</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>What you call it</label>
                <input
                  className={INPUT}
                  value={live.label}
                  onChange={(e) => setLive((l) => ({ ...l, label: e.target.value }))}
                  onBlur={(e) => saveLive({ label: e.target.value })}
                  placeholder="Circle Hour"
                />
              </div>
            </div>
            <p className={HELPER}>While the hour is running the line in the room changes by itself to say you are there, and back again when it ends.</p>
          </div>
        )}
      </section>

      {/* 6 Welcome post */}
      <section className={CARD}>
        <CardHead step={6} title="Your welcome post" done={done.welcome}>
          <p className={HELPER}>Pinned to the top of the feed. It is the first thing a new member reads, and on day one it is the only thing.</p>
        </CardHead>
        {room.welcome_post_id ? (
          <p className="font-body font-light text-[13px] text-awburg-mid">
            Your welcome post is pinned. <Link to={`/${room.slug}`} className="text-awburg-core underline underline-offset-4">Read it in the room</Link>.
          </p>
        ) : (
          <div className="grid gap-3">
            <textarea className={TEXTAREA} rows={5} value={welcome} onChange={(e) => setWelcome(e.target.value)} placeholder="Welcome to the Circle. This is the room I wish I had had at thirty. Ask the question you have been carrying." />
            <div>
              <button type="button" className={BTN_PRIMARY} disabled={posting || !welcome.trim()} onClick={postWelcome}>
                {posting ? "Pinning..." : "Pin my welcome post"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 7 Invite link */}
      <section className={CARD}>
        <CardHead step={7} title="Your invite link" done={done.link}>
          <p className={HELPER}>The only address your room has. Put it in your Instagram bio, your WhatsApp broadcast, your emails. Every woman lands on the same page and asks to join there.</p>
        </CardHead>
        <div className="flex flex-wrap items-center gap-3">
          <code className="font-body text-[13px] text-awburg-core bg-off-white border border-awburg-core/10 rounded-xl px-4 py-3 break-all">{roomUrl}</code>
          <button type="button" className={BTN_SECONDARY} onClick={copyLink}>{copied ? "Copied" : "Copy link"}</button>
        </div>
        {!isPublished && <p className={HELPER}>The link works for you now. For everyone else it works once you publish.</p>}
      </section>
    </div>
  );
}