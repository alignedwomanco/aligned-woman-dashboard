import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import "@/components/spp/spp.css";
import { PATTERNS, ORDER, Q, MINUTES, CONSENT_TEXT, INTRO_IMAGE, LOGO_URL, PLATFORM_KEY, DESIGN_KEY, score, shuffle } from "@/data/startingPointProfile";
import { Icon, Check, Arrow, Primary, Logo, PatternImg, MixBar, GuessLine, FitCheck, FootNote } from "@/components/spp/SppUI";
import {
  readProgress, writeProgress, readResult, writeResult,
  attemptCreate, attemptUpdate, track, buildResult, saveQuizResultToProfile,
  pickImageIndex, FIT_KEY, FIT_LABEL, guessToPlatform, guessFromPlatform, mixFromObject,
} from "@/lib/sppStore";

// ────────────────────────────────────────────────────────────────
// Starting Point Profile v3 (October 2026). Built from the design file
// "Starting Point Profile - All Screens" and the Base44 build brief.
// Intro → Before → 12 questions (Halfway after 6) → Guess → Reading →
// Result with the sign-up card. After sign-up she goes to /YourPattern.
// The previous quiz is kept on checkpoint "Before new Starting Point
// Profile and Your Pattern page".
// ────────────────────────────────────────────────────────────────

const BAR_H = 94;
const RESUME_PATH = "/StartingPointProfile?resume=1";

function heroCopy(summit) {
  return summit ? <>You've made your guess. <em>Now check it.</em></> : <>Which pattern has been <em>running<br />your life?</em></>;
}
function TimeLine({ center }) {
  return <p className="small" style={{ marginTop: 14, textAlign: center ? "center" : "left", color: "#3A2A28" }}>12 questions · about {MINUTES} minutes · free</p>;
}
const WHAT = [
  ["identity", "Your pattern, named"],
  ["awareness", "Your full pattern mix"],
  ["health", "What it costs you at your best and your worst"],
  ["alive", "Where your work starts"],
];

function Intro({ summit, onStart }) {
  return (
    <div>
      <section className="hero hero-intro" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", overflow: "hidden" }}>
        {INTRO_IMAGE && <img src={INTRO_IMAGE} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "40% 50%", display: "block" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(250,245,243,0.45) 0%,rgba(250,245,243,0.6) 40%,rgba(250,245,243,0.9) 100%)" }} />
        <div style={{ position: "relative" }}><Logo /></div>
        <div className="hero-text" style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <p className="eye">The Starting Point Profile</p>
          <div style={{ width: 40, height: 1, background: "var(--rose-deep)", margin: "20px 0" }} />
          <h1 className="h-xl">{heroCopy(summit)}</h1>
          <p className="body" style={{ marginTop: 18, maxWidth: 330 }}>
            <strong>This isn’t a personality test.</strong><br />It’s a diagnostic. Twelve questions to show you what’s been driving the way you live.
          </p>
        </div>
        <Primary onClick={onStart} style={{ position: "relative" }}>Show me my pattern</Primary>
        <div style={{ position: "relative" }}><TimeLine center /></div>
      </section>
      <section className="sect"><div className="sect-inner">
        <p className="eye">What you'll see</p>
        <h2 className="h-l" style={{ marginTop: 14 }}>Most tests tell you who you are. <em>This one shows you what has been running you.</em></h2>
        <div className="cards4">{WHAT.map(([ic, t]) => <div className="c4" key={t}><Icon name={ic} size={30} /><h4>{t}</h4></div>)}</div>
        <p className="body" style={{ marginTop: 28, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 21, lineHeight: 1.4, color: "var(--burg)" }}>This is not reading your best day. It is reading your operating system.</p>
      </div></section>
      <section className="sect"><div className="sect-inner">
        <p className="eye">The five patterns</p>
        <div className="strip strip-p">{ORDER.map((k) => <div key={k}><b>{PATTERNS[k].name}</b><span>{PATTERNS[k].desc}</span></div>)}</div>
        <p className="body" style={{ marginTop: 20 }}>You'll see yourself in more than one. The quiz finds the one that runs first.</p>
      </div></section>
      <section className="sect"><div className="sect-inner narrow">
        <p className="body">Built with the 13 specialists behind The Aligned Woman Blueprint: doctors, psychologists and practitioners.</p>
      </div></section>
      <section className="sect" style={{ background: "linear-gradient(160deg,#FAF5F3 0%,#F5DDD9 100%)", textAlign: "center", paddingBottom: 64 }}><div className="sect-inner narrow">
        <h2 className="h-l">{heroCopy(summit)}</h2>
        <div style={{ marginTop: 28 }}><Primary onClick={onStart}>Show me my pattern</Primary></div>
        <TimeLine center />
      </div></section>
    </div>
  );
}

function BackBtn({ onBack }) {
  return <button type="button" className="back" onClick={onBack} aria-label="Back"><Icon name="arrow" size={20} style={{ transform: "scaleX(-1)" }} /></button>;
}

function Before({ onBegin, onBack }) {
  return (
    <div className="hero before" style={{ display: "flex", flexDirection: "column" }}>
      <div className="qtop-row"><BackBtn onBack={onBack} /><span /></div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p className="eye">Before you start</p>
        <p className="h-l" style={{ marginTop: 18 }}>Pick the response that happens first, <em>not the one you'd like to have.</em></p>
        <p className="body" style={{ marginTop: 18 }}>You'll see yourself in more than one.</p>
      </div>
      <Primary onClick={onBegin}>Begin</Primary>
    </div>
  );
}

function QTop({ onBack, label, pct }) {
  return (
    <div className="qtop"><div className="qtop-inner">
      <div className="qtop-row"><BackBtn onBack={onBack} /><span className="qcount">{label}</span></div>
      {pct != null && (
        <div className="pbar">
          <div className="ptrack" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress"><div className="pfill" style={{ width: pct + "%" }} /></div>
          <span className="ppct">{pct}%</span>
        </div>
      )}
    </div></div>
  );
}

function Question({ qi, order, answer, onAnswer, onBack, animClass }) {
  const q = Q[qi];
  const [sel, setSel] = useState(null);
  const lock = useRef(false);
  const pick = useCallback((i) => {
    if (lock.current) return;
    lock.current = true;
    setSel(i);
    setTimeout(() => onAnswer(q.a[order[i]][1]), 500);
  }, [q, order, onAnswer]);
  useEffect(() => {
    const h = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 5) pick(n - 1);
      if (e.key === "Backspace") { e.preventDefault(); onBack(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [pick, onBack]);
  const prev = answer ? order.findIndex((o) => q.a[o][1] === answer) : -1;
  const shown = sel != null ? sel : prev;
  const pct = Math.round((qi / 12) * 100);
  return (
    <div>
      <QTop onBack={onBack} label={`Question ${qi + 1} of 12`} pct={pct} />
      <div className={"qbody " + animClass}>
        <p className="eye">{String(qi + 1).padStart(2, "0")} · {q.dim}</p>
        <p className="qsetup">{q.setup}</p>
        <h2 className="qq" id={"qlabel" + qi}>{q.q}</h2>
        <div className="answers" role="radiogroup" aria-labelledby={"qlabel" + qi}>
          {order.map((o, i) => (
            <button key={i} type="button" role="radio" aria-checked={shown === i} aria-disabled={sel != null ? "true" : "false"} className={"ans" + (shown === i ? " sel" : "")} onClick={() => pick(i)}>
              <span>{q.a[o][0]}</span><span className="tick">{shown === i && <Check />}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Halfway({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t); }, [onDone]);
  return (
    <button type="button" className="inter" onClick={onDone} aria-label="Continue">
      <p className="eye">Halfway</p>
      <p className="h-l" style={{ marginTop: 18 }}>Keep going with your first response, <em>not your best one.</em></p>
      <p className="caption" style={{ marginTop: 28 }}>Tap to continue</p>
    </button>
  );
}

function Guess({ onPick, onBack, value }) {
  const [sel, setSel] = useState(value || null);
  const opts = [...ORDER.map((k) => ({ k, name: PATTERNS[k].name, desc: PATTERNS[k].desc })), { k: "X", name: "I honestly don't know", desc: "" }];
  const pick = (k) => { setSel(k); setTimeout(() => onPick(k), 500); };
  return (
    <div>
      <QTop onBack={onBack} label="Your guess" />
      <div className="qbody qanim">
        <p className="eye">Before the answer</p>
        <h2 className="qq" id="glabel" style={{ fontStyle: "normal" }}>Before we show you: <em style={{ color: "var(--rose-deep)" }}>which of these do you think runs you?</em></h2>
        <div className="answers" role="radiogroup" aria-labelledby="glabel" style={{ gap: 8 }}>
          {opts.map((o) => (
            <button key={o.k} type="button" role="radio" aria-checked={sel === o.k} className={"opt" + (sel === o.k ? " sel" : "")} onClick={() => pick(o.k)}>
              <span><b>{o.name}</b>{o.desc && <span>{o.desc}</span>}</span><span className="tick">{sel === o.k && <Check s={12} />}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Reading({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2100); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="reading hero" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: "linear-gradient(160deg,#0E0208 0%,#1A0510 35%,#4A0E2E 65%,#1A0510 100%)" }} role="status">
      <p className="h-l" style={{ color: "#FAF5F3" }}><em style={{ color: "var(--rose-light)" }}>Reading your answers</em></p>
      <div className="drawline" style={{ background: "rgba(255,255,255,0.12)" }}><i style={{ background: "var(--rose)" }} /></div>
    </div>
  );
}

function RevealHead({ res, imgIdx }) {
  const P = PATTERNS[res.primary];
  return (
    <div className="rv-head">
      <div className="rv-img"><PatternImg p={res.primary} imgIdx={imgIdx} /></div>
      <div className="rv-fade" />
      <div className="rv-text">
        <p className="eye">Your starting point</p>
        <h1 className="h-xl rv-name" style={{ marginTop: 12 }}>{P.name}</h1>
        <p className="body rv-mirror" style={{ marginTop: 12, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, lineHeight: 1.4, color: "var(--burg)" }}>{P.mirror}</p>
      </div>
      <img className="rv-logo" src={LOGO_URL} alt="The Aligned Woman Co." />
    </div>
  );
}

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
);

// The sign-up card: name, email, consent → how you'll sign in → email code.
function Gate({ onLead, onBeforeLeave, onSaved }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resent, setResent] = useState(false);
  const refs = useRef([]);
  const loginHref = "/login?from_url=" + encodeURIComponent(RESUME_PATH);

  const save = async () => {
    const e = {};
    if (!name.trim()) e.name = "Add your first name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Check your email address.";
    if (!consent) e.consent = "Tick this so we can send your results.";
    setErr(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    await onLead({ name: name.trim(), email: email.trim().toLowerCase() });
    setLoading(false);
    setStep(2);
  };

  const toCode = async () => {
    setErr({});
    setLoading(true);
    try {
      await base44.auth.register({ email: email.trim().toLowerCase(), password: pw });
      setStep(3);
      setTimeout(() => refs.current[0] && refs.current[0].focus(), 50);
    } catch (ex) {
      const msg = String(ex?.message || ex?.response?.data?.message || "");
      if (/exist|already|registered|in use|taken/i.test(msg)) {
        onBeforeLeave();
        setErr({ taken: true });
      } else {
        setErr({ pw: msg || "We couldn't create your account. Try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = async (digits) => {
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: email.trim().toLowerCase(), otpCode: digits });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      try { await base44.auth.updateMe({ full_name: name.trim() }); } catch (_e) { /* name can be added later */ }
      await onSaved({ name: name.trim(), method: "password" });
    } catch (_e) {
      setErr({ code: "That code didn't match. Check the latest email from us and try again." });
      setCode(["", "", "", "", "", ""]);
      refs.current[0] && refs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const setDigits = (next) => {
    setCode(next);
    if (next.every(Boolean)) verify(next.join(""));
  };
  const typeCode = (i, v) => {
    const digits = v.replace(/\D/g, "");
    setErr({});
    if (digits.length > 1) {
      const next = code.slice();
      digits.slice(0, 6 - i).split("").forEach((d, j) => { next[i + j] = d; });
      const focusAt = Math.min(5, i + digits.length);
      refs.current[focusAt] && refs.current[focusAt].focus();
      setDigits(next);
      return;
    }
    const next = code.slice();
    next[i] = digits.slice(-1);
    if (next[i] && i < 5) refs.current[i + 1].focus();
    setDigits(next);
  };
  const resend = async () => {
    setErr({});
    try { await base44.auth.resendOtp(email.trim().toLowerCase()); setResent(true); } catch (_e) { /* ignore */ }
  };
  const provider = (p) => {
    try { sessionStorage.setItem("aw_pending_full_name", name.trim()); } catch (_e) { /* private mode */ }
    onBeforeLeave();
    track("spp_signup_provider", { method: p });
    base44.auth.loginWithProvider(p, RESUME_PATH);
  };

  return (
    <div className="gate" id="gate">
      {step === 1 && (
        <>
          <p className="eye">Free account</p>
          <h3 className="h-m" style={{ marginTop: 10 }}>Your full profile is ready.</h3>
          <p className="body" style={{ marginTop: 10, fontSize: 16 }}>Create your free account to read the rest: what it costs you at your worst, your full pattern, and where your work starts.</p>
          <div className={"field" + (err.name ? " err" : "")}><label htmlFor="fn">First name</label><input id="fn" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" aria-invalid={!!err.name} />{err.name && <span className="msg">{err.name}</span>}</div>
          <div className={"field" + (err.email ? " err" : "")}><label htmlFor="em">Email</label><input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" aria-invalid={!!err.email} />{err.email && <span className="msg">{err.email}</span>}</div>
          <button type="button" className={"consent" + (consent ? " on" : "")} role="checkbox" aria-checked={consent} onClick={() => setConsent(!consent)} style={err.consent ? { color: "#9B2C2C" } : null}>
            <span className="box" style={err.consent ? { borderColor: "#9B2C2C", borderWidth: 2 } : null}>{consent && <Check s={14} />}</span>
            <span>{CONSENT_TEXT}</span>
          </button>
          {err.consent && <p className="small" style={{ color: "#9B2C2C", marginTop: 4 }}>{err.consent}</p>}
          <div style={{ marginTop: 20 }}><Primary onClick={save} loading={loading}>Continue</Primary></div>
        </>
      )}
      {step === 2 && (
        <>
          <p className="eye">Saved</p>
          <h3 className="h-m" style={{ marginTop: 10 }}>Thanks, {name.trim()}. <em>One last step.</em></h3>
          <p className="body" style={{ marginTop: 10, fontSize: 16 }}>Your result is saved to {email.trim()}. Choose how you'll sign in.</p>
          <div style={{ marginTop: 20 }}><button type="button" className="gbtn" onClick={() => provider("google")}><GoogleG />Continue with Google</button></div>
          <p className="or">or</p>
          <div className={"field" + (err.pw ? " err" : "")}><label htmlFor="pw">Set a password</label><input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />{err.pw && <span className="msg">{err.pw}</span>}</div>
          {err.taken && <p className="guess" role="alert" style={{ marginTop: 16, borderColor: "rgba(155,44,44,0.35)" }}>You already have an account. <a href={loginHref}>Log in to save this result.</a></p>}
          <div style={{ marginTop: 16 }}><Primary onClick={toCode} loading={loading} disabled={pw.length < 6}>Create my free account</Primary></div>
          <div style={{ textAlign: "center", marginTop: 6 }}><button type="button" className="btn-t" onClick={() => setMore(!more)} aria-expanded={more}>More ways to sign in</button></div>
          {more && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["microsoft", "Microsoft"], ["apple", "Apple"], ["facebook", "Facebook"]].map(([p, label]) => (
                <button key={p} type="button" className="gbtn" onClick={() => provider(p)}>Continue with {label}</button>
              ))}
            </div>
          )}
        </>
      )}
      {step === 3 && (
        <>
          <p className="eye">Check your email</p>
          <h3 className="h-m" style={{ marginTop: 10 }}>Enter the 6-digit code</h3>
          <p className="body" style={{ marginTop: 10, fontSize: 16 }}>We sent it to {email.trim()}.</p>
          <div className="code">
            {code.map((c, i) => (
              <input key={i} ref={(el) => (refs.current[i] = el)} value={c} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={"Digit " + (i + 1)}
                onChange={(e) => typeCode(i, e.target.value)}
                onPaste={(e) => { const t = (e.clipboardData?.getData("text") || "").replace(/\D/g, ""); if (t) { e.preventDefault(); typeCode(i, t); } }}
                onKeyDown={(e) => { if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1].focus(); }}
                style={err.code ? { borderColor: "#9B2C2C" } : null} />
            ))}
          </div>
          {err.code && <p className="small" role="alert" style={{ color: "#9B2C2C", marginTop: 10 }}>{err.code}</p>}
          {loading && <p className="caption" style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}><span className="spinner" />Checking</p>}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button type="button" className="btn-t" onClick={resend}>Resend code</button>
            {resent && <span className="caption" style={{ alignSelf: "center" }} role="status">Sent</span>}
          </div>
        </>
      )}
    </div>
  );
}

function Result({ res, guess, imgIdx, fit, onFit, unlocked, userName, onLead, onBeforeLeave, onSaved, onYourPattern }) {
  const P = PATTERNS[res.primary];
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const g = document.getElementById("gate");
    if (!g || unlocked) { setShowSticky(false); return; }
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { root: null, threshold: 0, rootMargin: `0px 0px -${BAR_H}px 0px` });
    io.observe(g);
    return () => io.disconnect();
  }, [unlocked]);
  const toGate = () => {
    const g = document.getElementById("gate");
    if (g) window.scrollTo({ top: g.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };
  return (
    <div className="result" style={{ paddingBottom: unlocked ? 0 : BAR_H }}>
      <RevealHead res={res} imgIdx={imgIdx} />
      <div className="pad result-col" style={{ paddingTop: 22 }}>
        <GuessLine guess={guess} primary={res.primary} />
        <div className="block" style={{ marginTop: 22 }}>
          <p className="eye">Your pattern mix</p>
          <MixBar mix={res.mix} anim />
        </div>
        <FitCheck secondary={res.secondary} value={fit} onChange={onFit} />
        <div className="block">
          <p className="eye">At your best</p>
          <p className="body">{P.best}</p>
        </div>
        <div className="block lockwrap" style={{ paddingBottom: unlocked ? 28 : 0 }}>
          <div className={unlocked ? "unlocking" : "locked"} aria-hidden={!unlocked}>
            <p className="eye">At your worst</p>
            <p className="body">{P.worst}</p>
            <p className="eye" style={{ marginTop: 24 }}>What this means</p>
            <p className="body">{P.means}</p>
          </div>
          {!unlocked && <Gate onLead={onLead} onBeforeLeave={onBeforeLeave} onSaved={onSaved} />}
          {unlocked && (
            <div style={{ marginTop: 28, padding: "24px 20px", borderRadius: 10, background: "#fff", border: "1px solid var(--hair)", textAlign: "center" }}>
              <p className="eye">Saved to your profile</p>
              <p className="h-m" style={{ marginTop: 10 }}>Welcome, {userName || "there"}.</p>
              <div style={{ marginTop: 18 }}><Primary onClick={onYourPattern}>Go to my full profile <Arrow /></Primary></div>
            </div>
          )}
        </div>
      </div>
      <div className="span" style={{ height: 28 }} />
      <FootNote />
      <div className={"sticky" + (showSticky && !unlocked ? " on" : "")} aria-hidden={!(showSticky && !unlocked)} style={{ height: BAR_H }}>
        <Primary onClick={toGate}>Read the rest <span aria-hidden="true">↓</span></Primary>
      </div>
    </div>
  );
}

function newOrders() {
  return Q.map(() => shuffle([0, 1, 2, 3, 4]));
}

function readParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    summit: p.get("src") === "summit",
    resume: p.get("resume") === "1",
    utm: {
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
    },
  };
}

export default function StartingPointProfile() {
  const navigate = useNavigate();
  const params = useRef(readParams()).current;
  const saved = useRef(readProgress()).current;
  const resumeOk = saved && saved.step && saved.step !== "intro" && Array.isArray(saved.answers) && saved.answers.length === 12;

  const [user, setUser] = useState(undefined); // undefined while checking
  const [step, setStep] = useState(resumeOk ? (saved.step === "half" ? "q" : saved.step) : "intro");
  const [qi, setQi] = useState(resumeOk ? saved.qi || 0 : 0);
  const [answers, setAnswers] = useState(resumeOk ? saved.answers : Array(12).fill(null));
  const [orders, setOrders] = useState(resumeOk && Array.isArray(saved.orders) ? saved.orders : newOrders());
  const [guess, setGuess] = useState(resumeOk ? saved.guess || null : null);
  const [fit, setFit] = useState(resumeOk ? saved.fit || null : null);
  const [halfShown, setHalfShown] = useState(resumeOk ? !!saved.halfShown : false);
  const [attempt, setAttempt] = useState(resumeOk ? saved.attempt || null : null);
  const [source] = useState((resumeOk && saved.source) || (params.summit ? "summit" : ""));
  const [utm] = useState((resumeOk && saved.utm) || params.utm);
  const [imgIdx, setImgIdx] = useState(resumeOk ? saved.imgIdx || 0 : 0);
  const [startedAt, setStartedAt] = useState(resumeOk ? saved.startedAt : null);
  const [completedAt, setCompletedAt] = useState(resumeOk ? saved.completedAt || null : null);
  const [anim, setAnim] = useState("qanim");
  const [unlocked, setUnlocked] = useState(false);
  const [userName, setUserName] = useState("");
  const [resumed, setResumed] = useState(null); // result rebuilt from aw_quiz_result
  const resultTracked = useRef(false);

  const summit = source === "summit";
  const res = resumed ? resumed.res : (step === "result" && answers.every(Boolean) ? score(answers) : null);
  const shownGuess = resumed ? resumed.guess : guess;
  const shownImg = resumed ? resumed.imgIdx : imgIdx;

  // Who is she?
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ok = await base44.auth.isAuthenticated();
        const me = ok ? await base44.auth.me() : null;
        if (!cancelled) setUser(me || null);
      } catch (_e) {
        if (!cancelled) setUser(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Save progress so a refresh resumes at the same place.
  useEffect(() => {
    if (resumed) return;
    if (step === "intro") return;
    writeProgress({ step, qi, answers, orders, guess, fit, halfShown, attempt, source, utm, imgIdx, startedAt, completedAt });
  }, [step, qi, answers, orders, guess, fit, halfShown, attempt, source, utm, imgIdx, startedAt, completedAt, resumed]);

  // Signed in, with a finished result: save it straight away.
  const saveForSignedIn = useCallback(async (me, r, extra = {}) => {
    try {
      await saveQuizResultToProfile(me, extra);
    } catch (_e) { /* the hand-off stays for the next page load */ }
    setUnlocked(true);
    setUserName(extra.firstName || (me?.full_name || "").split(" ")[0] || "");
  }, []);

  // ?resume=1 after an OAuth or login round trip.
  useEffect(() => {
    if (!params.resume || user === undefined) return;
    const stored = readResult();
    if (!stored?.archetype_key) {
      if (user) navigate("/YourPattern", { replace: true });
      return;
    }
    const primary = DESIGN_KEY[stored.archetype_key];
    const secondary = DESIGN_KEY[stored.secondary_key];
    const mix = mixFromObject(stored.mix, primary, secondary);
    const r = mix ? { primary, secondary, mix } : null;
    if (!r) { navigate(user ? "/YourPattern" : "/StartingPointProfile", { replace: true }); return; }
    setResumed({ res: r, guess: guessFromPlatform(stored.guess), imgIdx: Number(stored.image_variant) || 0 });
    setFit(stored.fit ? FIT_LABEL[stored.fit] : null);
    setStep("result");
    if (user) {
      let pending = "";
      try { pending = sessionStorage.getItem("aw_pending_full_name") || ""; sessionStorage.removeItem("aw_pending_full_name"); } catch (_e) { /* ignore */ }
      (async () => {
        if (pending && !user.full_name) { try { await base44.auth.updateMe({ full_name: pending }); } catch (_e) { /* ignore */ } }
        await saveForSignedIn(user, r, { firstName: pending || (user.full_name || "").split(" ")[0] });
        track("spp_signup_complete", { primary: stored.archetype_key, method: "other" });
      })();
    }
  }, [params.resume, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    track("spp_start", { source: source || "" });
    const now = new Date().toISOString();
    setStartedAt(now);
    setAnswers(Array(12).fill(null));
    setOrders(newOrders());
    setGuess(null); setFit(null); setHalfShown(false); setQi(0); setCompletedAt(null);
    setStep("before");
    const att = await attemptCreate({ source: source || "", ...utm, started_at: now });
    setAttempt(att);
  };

  const onAnswer = useCallback((k) => {
    track("spp_question", { question: qi + 1 });
    setAnswers((a) => { const n = a.slice(); n[qi] = k; return n; });
    setAnim("qanim");
    if (qi === 5 && !halfShown) { setHalfShown(true); setStep("half"); setQi(6); return; }
    if (qi < 11) { setQi(qi + 1); window.scrollTo(0, 0); return; }
    setStep("guess");
    window.scrollTo(0, 0);
  }, [qi, halfShown]);

  const onBackQ = useCallback(() => {
    setAnim("qback");
    if (qi === 0) { setStep("before"); return; }
    setQi(qi - 1);
    window.scrollTo(0, 0);
  }, [qi]);

  const onGuess = (g) => {
    setGuess(g);
    track("spp_guess", { guess: guessToPlatform(g) });
    setStep("reading");
    window.scrollTo(0, 0);
  };

  // Reading: calculate, save the attempt, then reveal.
  const finishReading = useCallback(() => {
    const r = score(answers);
    const now = new Date().toISOString();
    const idx = pickImageIndex(r.primary);
    setImgIdx(idx);
    setCompletedAt(now);
    setStep("result");
    window.scrollTo(0, 0);
    const handoff = buildResult({ res: r, answers, guess, fit: null, source, attempt, imgIdx: idx, completedAt: now });
    writeResult(handoff);
    attemptUpdate(attempt, {
      answers: handoff.answers, primary_key: handoff.archetype_key, secondary_key: handoff.secondary_key,
      mix: handoff.mix, guess: handoff.guess, stage: "completed", completed_at: now,
    });
    if (user) saveForSignedIn(user, r);
  }, [answers, guess, source, attempt, user, saveForSignedIn]);

  // Track the reveal once.
  useEffect(() => {
    if (step !== "result" || !res || resultTracked.current) return;
    resultTracked.current = true;
    track("spp_result", { primary: PLATFORM_KEY[res.primary], guess_matched: shownGuess === res.primary });
  }, [step, res, shownGuess]);

  // If she was already signed in when a saved result was resumed, show it unlocked.
  useEffect(() => {
    if (step === "result" && user && !unlocked && !resumed && res) saveForSignedIn(user, res);
  }, [user, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentHandoff = () => {
    const stored = readResult();
    if (stored?.archetype_key) return stored;
    if (!res) return null;
    return buildResult({ res, answers, guess, fit: FIT_KEY[fit], source, attempt, imgIdx, completedAt });
  };

  const onFit = (label) => {
    setFit(label);
    const key = FIT_KEY[label];
    track("spp_fit", { fit: key });
    const h = currentHandoff();
    if (h) {
      writeResult({ ...h, fit: key });
      attemptUpdate(h.attempt_id ? { id: h.attempt_id, token: h.attempt_token } : attempt, { fit: key });
    }
    if (user) {
      (async () => {
        try {
          const rows = await base44.entities.MemberProfile.filter({ user_id: user.id }, "-created_date", 1);
          if (rows?.[0]) await base44.entities.MemberProfile.update(rows[0].id, { quiz_fit: key });
        } catch (_e) { /* ignore */ }
      })();
    }
  };

  const onLead = async ({ name, email }) => {
    setUserName(name);
    try { sessionStorage.setItem("aw_pending_full_name", name); } catch (_e) { /* ignore */ }
    const h = currentHandoff();
    const att = h?.attempt_id ? { id: h.attempt_id, token: h.attempt_token } : attempt;
    await attemptUpdate(att, { first_name: name, email, consent: true, consent_text: CONSENT_TEXT, consent_at: new Date().toISOString(), stage: "lead" });
    track("spp_signup_step1", { primary: h?.archetype_key || "" });
  };

  const onBeforeLeave = () => {
    const h = currentHandoff();
    if (h) writeResult({ ...h, fit: FIT_KEY[fit] || h.fit });
  };

  const onSaved = async ({ name, method }) => {
    onBeforeLeave();
    let me = null;
    try { me = await base44.auth.me(); } catch (_e) { me = null; }
    if (me) {
      try { await saveQuizResultToProfile(me, { firstName: name }); } catch (_e) { /* retried on next page */ }
    }
    try { sessionStorage.removeItem("aw_pending_full_name"); } catch (_e) { /* ignore */ }
    setUser(me);
    setUserName(name);
    setUnlocked(true);
    track("spp_signup_complete", { primary: res ? PLATFORM_KEY[res.primary] : "", method });
  };

  const goYourPattern = () => navigate("/YourPattern");

  return (
    <div className="spp-c">
      <div className="spp">
        {step === "intro" && <Intro summit={summit} onStart={start} />}
        {step === "before" && <Before onBack={() => setStep("intro")} onBegin={() => { setAnim("qanim"); setQi(0); setStep("q"); }} />}
        {step === "q" && (
          <Question key={qi} qi={qi} order={orders[qi]} answer={answers[qi]} onAnswer={onAnswer} onBack={onBackQ} animClass={anim} />
        )}
        {step === "half" && <Halfway onDone={() => { setStep("q"); window.scrollTo(0, 0); }} />}
        {step === "guess" && <Guess value={guess} onPick={onGuess} onBack={() => { setAnim("qback"); setQi(11); setStep("q"); }} />}
        {step === "reading" && <Reading onDone={finishReading} />}
        {step === "result" && res && (
          <Result
            res={res}
            guess={shownGuess}
            imgIdx={shownImg}
            fit={fit}
            onFit={onFit}
            unlocked={unlocked}
            userName={userName}
            onLead={onLead}
            onBeforeLeave={onBeforeLeave}
            onSaved={onSaved}
            onYourPattern={goYourPattern}
          />
        )}
        {step === "result" && !res && <div className="hero" />}
      </div>
    </div>
  );
}
