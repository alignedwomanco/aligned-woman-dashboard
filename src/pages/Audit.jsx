import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AppShellV2 from "@/components/dashboard-v2/AppShellV2";
import "@/components/spp/spp.css";
import "@/components/audit/audit.css";
import { Primary, Check } from "@/components/spp/SppUI";
import { AnswerField, CarryQuote, LiveQuote, QuestionText } from "@/components/audit/AuditFields";
import { Q as SPP_Q, DESIGN_KEY, MINUTES } from "@/data/startingPointProfile";
import { saveQuizResultToProfile, track } from "@/lib/sppStore";
import {
  BEFORE_YOU_BEGIN, AGREEMENT_TEXT, TERMS_LABEL, TERMS_URL, TRACK_SCREEN, WHEN_YOU_FINISH, PAUSE_SCREEN,
  SPP_CARRY, partsForTrack, questionsFor, isAnswered, migrateAnswers,
} from "@/data/auditQuestions";

// ────────────────────────────────────────────────────────────────
// The Alignment Audit (/Audit). The paid questionnaire, in the member's
// account. Screens, in order (brief: "The audit form"):
//   before   Before you begin, with the agreement tick
//   track    I run a business / I have a career
//   spp      the Starting Point Profile, only if she has never taken it
//   p1..p7   Parts 1 to 7, one per screen, with a pause screen before
//            Part 4 (not a part, not counted in progress)
//   tb | tc  her track module
//   p8, p9   Parts 8 and 9
//   finish   When you finish
//   review   every part with done or skipped, edit links, Submit
// Answers autosave through the auditFlow backend function, which is the
// only thing allowed to write an AuditResponse. Her place is saved too, so
// she reopens on the same screen on any device.
// Declared in App.jsx beside /YourPattern, in its own AppShellV2 chrome.
// ────────────────────────────────────────────────────────────────

const SPP_RETURN_KEY = "aw_spp_return";

// Which Starting Point Profile field each Q2 or Q3 field fills.
const FACT_TO_PROFILE = {
  q2: { what: "role_or_business", stage: "stage" },
  q3: { role: "role_or_business", how_long: "stage", industry: "industry" },
};

// What is sent to the server for one answer. Rows with nothing filled in
// are not saved.
function rowFilled(row) {
  if (!row || typeof row !== "object") return false;
  return Object.values(row).some((x) => {
    if (x === undefined || x === null) return false;
    if (typeof x === "number") return true;
    if (typeof x === "string") return x.trim().length > 0;
    if (Array.isArray(x?.selected)) return x.selected.length > 0 || String(x.other || "").trim().length > 0;
    return false;
  });
}

function cleanAnswer(q, value) {
  if (q.type === "rows" && Array.isArray(value)) return value.filter(rowFilled);
  return value;
}

async function callAudit(payload) {
  const res = await base44.functions.invoke("auditFlow", payload);
  return res?.data ?? res;
}

function formatDue(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Johannesburg" });
  } catch (_e) {
    return "";
  }
}

// The quotes carried into the audit, built from her latest attempt.
function quotesFromAttempt(attempt) {
  const keys = Array.isArray(attempt?.answers) ? attempt.answers : [];
  if (keys.length !== SPP_Q.length) return {};
  const out = {};
  for (const [carryKey, indexes] of Object.entries(SPP_CARRY)) {
    const texts = indexes
      .map((i) => {
        const design = DESIGN_KEY[keys[i]];
        const row = SPP_Q[i]?.a?.find(([, k]) => k === design);
        return row ? row[0] : "";
      })
      .filter(Boolean);
    if (texts.length) out[carryKey] = texts;
  }
  return out;
}

async function findLatestAttempt(user, profile) {
  try {
    const rows = await base44.entities.ProfileAttempt.filter({ user_id: user.id }, "-completed_at", 10);
    const done = (rows || []).filter((r) => r.primary_key && r.completed_at);
    return done.find((r) => r.id === profile?.latest_attempt_id) || done[0] || null;
  } catch (_e) {
    return null;
  }
}

export default function Audit() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [audit, setAudit] = useState(undefined); // undefined = loading, null = none
  const [answers, setAnswers] = useState({});
  const [trackChoice, setTrackChoice] = useState(null);
  const [screen, setScreen] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [error, setError] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const pending = useRef({ answers: {}, facts: {} });
  const timer = useRef(null);
  const chain = useRef(Promise.resolve());
  const topRef = useRef(null);

  const trackValue = trackChoice || audit?.track || null;
  const parts = useMemo(() => (trackValue ? partsForTrack(trackValue) : []), [trackValue]);
  const hasProfile = !!(profile?.computed_archetype_key || audit?.spp_snapshot?.primary);

  const screens = useMemo(() => {
    const list = ["before", "track"];
    if (!hasProfile) list.push("spp");
    parts.forEach((p) => {
      if (p.pauseBefore) list.push("pause");
      list.push(p.id);
    });
    list.push("finish", "review");
    return list;
  }, [parts, hasProfile]);

  const visibleQuestions = useMemo(() => parts.flatMap((p) => questionsFor(p, trackValue)), [parts, trackValue]);
  const progress = useMemo(() => {
    if (!visibleQuestions.length) return 0;
    const done = visibleQuestions.filter((q) => isAnswered(q, answers[q.id])).length;
    return Math.round((done / visibleQuestions.length) * 100);
  }, [visibleQuestions, answers]);

  const profileFacts = useMemo(() => ({
    role_or_business: profile?.role_or_business || "",
    stage: profile?.stage || "",
    industry: profile?.industry || "",
  }), [profile]);

  // ── Load ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (cancelled) return;
        setMe(user);
        // Saves a Starting Point Profile result she just finished, if any.
        let p = null;
        try { p = await saveQuizResultToProfile(user); } catch (_e) { p = null; }
        try { sessionStorage.removeItem(SPP_RETURN_KEY); } catch (_e) { /* ignore */ }
        if (cancelled) return;
        setProfile(p);
        const r = await callAudit({ action: "get" });
        if (cancelled) return;
        const a = r?.audit || null;
        setAudit(a);
        if (a) {
          // Answers saved before the Answer Format Update move into the new
          // layout, and the moved versions are saved back once.
          const migrated = migrateAnswers(a.answers || {});
          setAnswers(migrated.answers);
          if (Object.keys(migrated.changed).length && (a.status === "purchased" || a.status === "in_progress")) {
            Object.assign(pending.current.answers, migrated.changed);
            setSaveState("saving");
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => flushRef.current(), 300);
          }
          setTrackChoice(a.track || (p?.track === "business" || p?.track === "career" ? p.track : null));
          if (a.status === "purchased") setScreen("before");
          else if (a.status === "in_progress") setScreen(a.last_part || "track");
          else setScreen("done");
          track("audit_open", { status: a.status });
        }
      } catch (_e) {
        if (!cancelled) { setError("load"); setAudit(null); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // A saved place that no longer exists (for example "spp" after she took it)
  // falls back to the next sensible screen.
  useEffect(() => {
    if (!screen || screen === "done") return;
    if (!screens.includes(screen)) setScreen(trackValue ? (parts[0]?.id || "track") : "track");
  }, [screen, screens, trackValue, parts]);

  // ── Snapshot of her Starting Point Profile, taken once ──
  const takeSnapshot = useCallback(async (user, prof, current) => {
    if (!user || !current || current.spp_snapshot?.primary) return current;
    if (!prof?.computed_archetype_key) return current;
    const attempt = await findLatestAttempt(user, prof);
    try {
      const r = await callAudit({
        action: "snapshot",
        attempt_id: attempt?.id || "",
        quotes: attempt ? quotesFromAttempt(attempt) : {},
      });
      if (r?.audit) { setAudit(r.audit); return r.audit; }
    } catch (_e) { /* tried again on the next screen change */ }
    return current;
  }, []);

  useEffect(() => {
    if (audit?.status === "in_progress" && !audit?.spp_snapshot?.primary && profile?.computed_archetype_key && me) {
      takeSnapshot(me, profile, audit);
    }
  }, [audit, profile, me, takeSnapshot]);

  // ── Saving ──
  const flush = useCallback((extra = {}) => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const batch = pending.current;
    pending.current = { answers: {}, facts: {} };
    const payload = { action: "save", progress_percent: progress, ...extra };
    if (Object.keys(batch.answers).length) payload.answers = batch.answers;
    if (Object.keys(batch.facts).length) payload.profile_facts = { ...batch.facts, ...(extra.profile_facts || {}) };
    if (!payload.answers && !payload.profile_facts && extra.last_part === undefined && extra.track === undefined) {
      return chain.current;
    }
    setSaveState("saving");
    chain.current = chain.current
      .then(() => callAudit(payload))
      .then((r) => {
        if (r?.error) throw new Error(r.error);
        setSaveState("saved");
      })
      .catch(() => {
        // Put the unsaved answers back so the next save retries them.
        pending.current = {
          answers: { ...(payload.answers || {}), ...pending.current.answers },
          facts: { ...(payload.profile_facts || {}), ...pending.current.facts },
        };
        setSaveState("error");
      });
    return chain.current;
  }, [progress]);

  // Timers call the latest flush, so they never send a stale progress figure.
  const flushRef = useRef(flush);
  flushRef.current = flush;

  const setAnswer = (q, value) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    pending.current.answers[q.id] = value === undefined ? null : cleanAnswer(q, value);
    const map = FACT_TO_PROFILE[q.id];
    if (map && value && typeof value === "object") {
      for (const [field, profileKey] of Object.entries(map)) {
        if (value[field] !== undefined) pending.current.facts[profileKey] = value[field];
      }
    }
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flushRef.current(), 900);
  };

  // Save whatever is waiting if she closes the tab.
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flush]);

  // Fill Q2 or Q3 from her profile the first time she reaches Part 1.
  useEffect(() => {
    if (screen !== "p1" || !trackValue) return;
    const qid = trackValue === "business" ? "q2" : "q3";
    if (answers[qid]) return;
    const map = FACT_TO_PROFILE[qid];
    const seed = {};
    for (const [field, profileKey] of Object.entries(map)) {
      if (profileFacts[profileKey]) seed[field] = profileFacts[profileKey];
    }
    if (Object.keys(seed).length) {
      setAnswers((prev) => ({ ...prev, [qid]: seed }));
      pending.current.answers[qid] = seed;
    }
  }, [screen, trackValue, answers, profileFacts]);

  // ── Navigation ──
  const go = (next) => {
    setScreen(next);
    if (next !== "before") flush({ last_part: next });
    try { topRef.current?.scrollIntoView({ block: "start" }); window.scrollTo({ top: 0 }); } catch (_e) { /* ignore */ }
  };
  const idx = screens.indexOf(screen);
  const goNext = () => { if (idx >= 0 && idx < screens.length - 1) go(screens[idx + 1]); };
  // Once started, Back never returns to Before you begin.
  const canBack = idx > 1;
  const goBack = () => { if (canBack) go(screens[idx - 1]); };

  const start = async () => {
    if (!agreed) return;
    setBusy(true);
    setError("");
    try {
      const r = await callAudit({ action: "start", agreement_text: `${AGREEMENT_TEXT} ${TERMS_LABEL}` });
      if (!r?.audit) throw new Error(r?.error || "start_failed");
      setAudit(r.audit);
      track("audit_start", {});
      await takeSnapshot(me, profile, r.audit);
      setScreen("track");
      window.scrollTo({ top: 0 });
    } catch (_e) {
      setError("We couldn't start your audit. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const chooseTrack = (value) => {
    setTrackChoice(value);
    pending.current.facts.track = value;
    flush({ track: value });
  };

  const goToProfile = () => {
    try { sessionStorage.setItem(SPP_RETURN_KEY, "/Audit"); } catch (_e) { /* ignore */ }
    flush({ last_part: "spp" }).finally(() => navigate("/StartingPointProfile"));
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await flush();
      const r = await callAudit({ action: "submit", progress_percent: progress });
      if (!r?.audit) throw new Error(r?.error || "submit_failed");
      setAudit(r.audit);
      setScreen("done");
      setConfirmSubmit(false);
      track("audit_submit", { progress });
      window.scrollTo({ top: 0 });
    } catch (_e) {
      setError("We couldn't submit your audit. Your answers are saved. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const firstName = profile?.first_name || (me?.full_name || "").split(" ")[0] || "";
  const quotes = audit?.spp_snapshot?.quotes || {};
  const partIndex = parts.findIndex((p) => p.id === screen);
  const partLabel = partIndex >= 0 ? `Part ${partIndex + 1} of ${parts.length}` : "";
  // The pause screen is not counted in the progress bar.
  const counted = screens.filter((s) => s !== "pause");
  const countedIdx = counted.indexOf(screen === "pause" ? screens[idx - 1] : screen);
  const navPct = counted.length > 1 && countedIdx >= 0 ? Math.round((countedIdx / (counted.length - 1)) * 100) : 0;
  const editable = audit?.status === "purchased" || audit?.status === "in_progress";

  // ── Screens ──
  const renderBefore = () => (
    <div className="aw-col">
      <p className="eye">One-to-one with Laura</p>
      <h1 className="h-l" style={{ marginTop: 10 }}>{BEFORE_YOU_BEGIN.title}</h1>
      <p className="body" style={{ marginTop: 16 }}>{BEFORE_YOU_BEGIN.intro}</p>
      <ul className="aw-bullets">
        {BEFORE_YOU_BEGIN.bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>
      <p className="body" style={{ marginTop: 20 }}>{BEFORE_YOU_BEGIN.promise}</p>
      <p className="small" style={{ marginTop: 24, fontWeight: 600, color: "var(--burg)" }}>{BEFORE_YOU_BEGIN.tickLead}</p>
      <button
        type="button"
        role="checkbox"
        aria-checked={agreed}
        className={"consent" + (agreed ? " on" : "")}
        onClick={() => setAgreed((x) => !x)}
      >
        <span className="box">{agreed && <Check />}</span>
        <span>
          {AGREEMENT_TEXT}{" "}
          <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{TERMS_LABEL}</a>
        </span>
      </button>
      {error && <p className="small" role="alert" style={{ marginTop: 14, color: "var(--burg)" }}>{error}</p>}
      <div style={{ marginTop: 24 }}>
        <Primary onClick={start} disabled={!agreed} loading={busy}>Start</Primary>
      </div>
    </div>
  );

  const renderTrack = () => (
    <div className="aw-col">
      <h1 className="h-l">{TRACK_SCREEN.title}</h1>
      <div className="answers" role="radiogroup" aria-label={TRACK_SCREEN.title}>
        {TRACK_SCREEN.options.map((o) => {
          const on = trackValue === o.value;
          return (
            <button key={o.value} type="button" role="radio" aria-checked={on} className={"opt" + (on ? " sel" : "")} onClick={() => chooseTrack(o.value)}>
              <span><b>{o.label}</b><span>{o.sub}</span></span>
              <span className="tick">{on && <Check />}</span>
            </button>
          );
        })}
      </div>
      <p className="small" style={{ marginTop: 18, fontStyle: "italic" }}>{TRACK_SCREEN.note}</p>
    </div>
  );

  const renderSpp = () => (
    <div className="aw-col">
      <p className="eye">Before Part 1</p>
      <h1 className="h-l" style={{ marginTop: 10 }}>First, your Starting Point Profile.</h1>
      <p className="body" style={{ marginTop: 16 }}>
        The audit builds on it. It takes about {MINUTES} minutes, and you come straight back here when you finish. Everything so far is saved.
      </p>
      <div style={{ marginTop: 24 }}><Primary onClick={goToProfile}>Take my Starting Point Profile</Primary></div>
    </div>
  );

  const renderQuestion = (q) => (
    <section key={q.id} className="aw-q" aria-labelledby={`${q.id}-n`}>
      <p className="aw-qnum" id={`${q.id}-n`}>{q.n}</p>
      {q.quote && <LiveQuote kind={q.quote} answers={answers} />}
      <QuestionText q={q} />
      {q.carry && <CarryQuote quotes={quotes[q.carry]} />}
      <AnswerField q={q} value={answers[q.id]} answers={answers} profileFacts={profileFacts} onChange={(v) => setAnswer(q, v)} />
    </section>
  );

  const renderPart = (part) => {
    const qs = questionsFor(part, trackValue);
    const hasPair = qs.some((q) => q.pairWith);
    const paired = new Set(qs.filter((q) => q.pairWith).map((q) => q.pairWith));
    let lastGroup = null;
    return (
      <div className={"aw-col" + (hasPair ? " wide" : "")}>
        <p className="eye">{partLabel}</p>
        <h1 className="h-l" style={{ marginTop: 10 }}>{part.title}</h1>
        {part.intro && <p className="body" style={{ marginTop: 12 }}>{part.intro}</p>}
        <div style={{ marginTop: 12 }}>
          {qs.map((q) => {
            if (paired.has(q.id)) return null;
            const groupHead = part.groups && q.group !== lastGroup ? q.group : null;
            lastGroup = q.group;
            // Q34 and Q35: two columns on a wide screen, Q34 on the left, so
            // she sees the gap. Stacked on a phone.
            if (q.pairWith) {
              const partner = qs.find((x) => x.id === q.pairWith);
              return (
                <div key={q.id} className="aw-pair">
                  {renderQuestion(q)}
                  {partner && renderQuestion(partner)}
                </div>
              );
            }
            return (
              <React.Fragment key={q.id}>
                {groupHead && <h2 className="aw-group">{groupHead}</h2>}
                {renderQuestion(q)}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPause = () => (
    <div className="aw-col aw-pause">
      <h1 className="h-l">{PAUSE_SCREEN.title}</h1>
      <p className="body" style={{ marginTop: 16 }}>{PAUSE_SCREEN.body}</p>
      <div style={{ marginTop: 28 }}><Primary onClick={goNext}>{PAUSE_SCREEN.button}</Primary></div>
    </div>
  );

  const renderFinish = () => (
    <div className="aw-col">
      <h1 className="h-l">{WHEN_YOU_FINISH.title}</h1>
      {WHEN_YOU_FINISH.lines.map((l) => <p key={l} className="body" style={{ marginTop: 16 }}>{l}</p>)}
    </div>
  );

  const renderReview = () => (
    <div className="aw-col">
      <p className="eye">Review</p>
      <h1 className="h-l" style={{ marginTop: 10 }}>Check your answers, then submit.</h1>
      <p className="body" style={{ marginTop: 12 }}>Once you submit, your answers are locked and go to Laura.</p>
      <div className="aw-review">
        <div className="aw-review-row">
          <div>
            <b>{TRACK_SCREEN.options.find((o) => o.value === trackValue)?.label || "Your track"}</b>
            <span>The questions for your track</span>
          </div>
          <button type="button" className="btn-t" onClick={() => go("track")}>Edit</button>
        </div>
        {parts.map((p) => {
          const qs = questionsFor(p, trackValue);
          const skipped = qs.filter((q) => !isAnswered(q, answers[q.id])).length;
          return (
            <div key={p.id} className="aw-review-row">
              <div>
                <b>{p.title}</b>
                <span>{skipped === 0 ? "Done" : `${skipped} of ${qs.length} skipped`}</span>
              </div>
              <button type="button" className="btn-t" onClick={() => go(p.id)}>Edit</button>
            </div>
          );
        })}
      </div>
      {error && <p className="small" role="alert" style={{ marginTop: 14, color: "var(--burg)" }}>{error}</p>}
      <div style={{ marginTop: 24 }}>
        {confirmSubmit ? (
          <div className="panel" style={{ padding: 20 }}>
            <p className="body">Submit your audit now? You won't be able to change your answers afterwards.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <Primary onClick={submit} loading={busy} full={false}>Submit</Primary>
              <button type="button" className="btn btn-s" onClick={() => setConfirmSubmit(false)} disabled={busy}>Not yet</button>
            </div>
          </div>
        ) : (
          <Primary onClick={() => setConfirmSubmit(true)}>Submit my audit</Primary>
        )}
      </div>
    </div>
  );

  const renderDone = () => {
    const ready = audit?.status === "diagnostic_ready" || audit?.status === "complete";
    return (
      <div className="aw-col">
        <p className="eye">The Alignment Audit</p>
        {ready ? (
          <>
            <h1 className="h-l" style={{ marginTop: 10 }}>Your blueprint is ready.</h1>
            {audit?.diagnostic && (/^https?:\/\//.test(audit.diagnostic.trim()) ? (
              <div style={{ marginTop: 20 }}>
                <a className="btn btn-s" href={audit.diagnostic.trim()} target="_blank" rel="noopener noreferrer">Read your blueprint</a>
              </div>
            ) : (
              <div className="aw-diag">{audit.diagnostic}</div>
            ))}
          </>
        ) : (
          <>
            <h1 className="h-l" style={{ marginTop: 10 }}>
              {audit?.due_at ? <>Your blueprint arrives by <em>{formatDue(audit.due_at)}</em>.</> : "Your audit is with Laura."}
            </h1>
            {WHEN_YOU_FINISH.lines.map((l) => <p key={l} className="body" style={{ marginTop: 16 }}>{l}</p>)}
          </>
        )}
        <div style={{ marginTop: 28 }}>
          <button type="button" className="btn btn-s" onClick={() => navigate("/Dashboard")}>Back to your dashboard</button>
        </div>
      </div>
    );
  };

  const renderNone = () => (
    <div className="aw-col">
      <p className="eye">The Alignment Audit</p>
      {error === "load" ? (
        <p className="body" style={{ marginTop: 12 }}>We couldn't load your audit. Refresh to try again.</p>
      ) : (
        <>
          <h1 className="h-l" style={{ marginTop: 10 }}>There's no audit on this account yet.</h1>
          <p className="body" style={{ marginTop: 12 }}>
            If you've paid, sign in with the email you paid with{me?.email ? <>. You're signed in as <b>{me.email}</b>.</> : "."}
          </p>
        </>
      )}
      <div style={{ marginTop: 24 }}>
        <button type="button" className="btn btn-s" onClick={() => navigate("/Dashboard")}>Back to your dashboard</button>
      </div>
    </div>
  );

  const inForm = editable && screen && screen !== "done" && screen !== "before";
  const canNext = screen !== "track" || !!trackValue;
  const nextLabel = screen === "finish" ? "Review my answers" : "Next";

  let body;
  if (audit === undefined) body = <div className="aw-col"><div style={{ height: 180, borderRadius: 10, background: "var(--rose-pale)", opacity: 0.6 }} /></div>;
  else if (!audit) body = renderNone();
  else if (!editable || screen === "done") body = renderDone();
  else if (screen === "before") body = renderBefore();
  else if (screen === "track") body = renderTrack();
  else if (screen === "spp") body = renderSpp();
  else if (screen === "pause") body = renderPause();
  else if (screen === "finish") body = renderFinish();
  else if (screen === "review") body = renderReview();
  else {
    const part = parts.find((p) => p.id === screen);
    body = part ? renderPart(part) : renderTrack();
  }

  return (
    <div className="min-h-screen flex relative bg-off-white">
      <AppShellV2 active="audit">
        <div className="spp-c">
          <div className="spp in-shell aw-audit" ref={topRef}>
            {inForm && (
              <div className="qtop">
                <div className="aw-col">
                  <div className="qtop-row">
                    <button type="button" className="back" aria-label="Back" onClick={goBack} disabled={!canBack} style={canBack ? undefined : { visibility: "hidden" }}>
                      <span aria-hidden="true">←</span>
                    </button>
                    <span className="qcount">{partLabel || (firstName ? `${firstName}'s audit` : "Your audit")}</span>
                    <span className="aw-saved" aria-live="polite">
                      {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "error" ? "Not saved yet" : ""}
                    </span>
                  </div>
                  <div className="pbar">
                    <div className="ptrack"><div className="pfill" style={{ width: `${navPct}%` }} /></div>
                    <span className="ppct">{progress}%</span>
                  </div>
                </div>
              </div>
            )}
            <div className="aw-audit-body">{body}</div>
            {inForm && screen !== "review" && screen !== "spp" && screen !== "pause" && (
              <div className="aw-nav">
                <div className="aw-nav-inner">
                  {canBack && <button type="button" className="btn btn-s" onClick={goBack}>Back</button>}
                  <Primary onClick={goNext} disabled={!canNext} full={false}>{nextLabel}</Primary>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppShellV2>
    </div>
  );
}
