import React, { useEffect, useRef, useState } from "react";
import { PATTERNS, DOORS, LOGO_URL, REPLY_DATE } from "@/data/startingPointProfile";
import { imageFor } from "@/lib/sppStore";

// Shared pieces of the Starting Point Profile and the Your Pattern page,
// ported from the design file. Class names match the design stylesheet
// (src/components/spp/spp.css).

export const MIXC = ["#4A0E2E", "#A86460", "#C4847A", "#E8B4AE", "#F5DDD9"];

const ICON_PATHS = {
  mindset: "M11 14a7 7 0 1 1 14 0 7 7 0 0 1-14 0M18 21v4M14 25h8",
  nervous: "M18 6v24M12 10c0 3.3 2.7 6 6 6s6-2.7 6-6M12 26c0-3.3 2.7-6 6-6s6 2.7 6 6",
  health: "M18 28s-10-7-10-14a7 7 0 0 1 10-6.3A7 7 0 0 1 28 14c0 7-10 14-10 14z",
  identity: "M13 14a5 5 0 1 0 10 0 5 5 0 0 0-10 0M6 18a12 12 0 1 0 24 0 12 12 0 0 0-24 0M9 27c0-4 4-7 9-7s9 3 9 7",
  leadership: "M18 8l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
  visibility: "M6 18c0-3.3 5.4-6 12-6s12 2.7 12 6-5.4 6-12 6-12-2.7-12-6M15 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0",
  awareness: "M15 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0M11 18a7 7 0 1 0 14 0 7 7 0 0 0-14 0M6 18a12 12 0 1 0 24 0 12 12 0 0 0-24 0",
  alive: "M8 28l5-10 5 6 4-8 6 12",
  arrow: "M5 12h14M13 6l6 6-6 6",
};

export function Icon({ name = "awareness", size = 24, style }) {
  const small = name === "arrow";
  return (
    <svg width={size} height={size} viewBox={small ? "0 0 24 24" : "0 0 36 36"} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
      <path d={ICON_PATHS[name] || ICON_PATHS.awareness} />
    </svg>
  );
}

export const PILLAR_ICON = {
  "Identity, Visibility & Personal Brand": "visibility",
  "Mindset & Behaviour": "mindset",
  "Nervous System & Emotional Regulation": "nervous",
  "Leadership, Authority & Career": "leadership",
  "Health, Hormones & Body Literacy": "health",
  "Relationships & Connection": "identity",
};

export function Check({ s = 14 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function Arrow() {
  return <span aria-hidden="true">→</span>;
}

export function Primary({ children, onClick, loading, disabled, full = true, style, type = "button" }) {
  return (
    <button type={type} className={"btn btn-p" + (full ? " full" : "")} onClick={onClick} disabled={disabled || loading} aria-busy={loading ? "true" : "false"} style={style}>
      {loading ? <span className="spinner" /> : children}
    </button>
  );
}

export function Logo() {
  return (
    <div className="logo-bar">
      <img src={LOGO_URL} alt="The Aligned Woman Co." />
    </div>
  );
}

export function PatternImg({ p, imgIdx, ratio = "4 / 5", radius = 0, style }) {
  const P = PATTERNS[p];
  const src = imageFor(p, imgIdx);
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: ratio, background: "linear-gradient(160deg,#F5DDD9,#E8B4AE)", borderRadius: radius, overflow: "hidden", ...style }}>
      {src && (
        <>
          <img src={src} alt={P.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(74,14,46,0.12)", pointerEvents: "none" }} />
        </>
      )}
    </div>
  );
}

export function MixBar({ mix, anim }) {
  const sr = "Strongest: " + mix.map((m, i) => (i ? "then " : "") + PATTERNS[m.k].short).join(", ") + ".";
  const max = Math.max(1, mix[0].pct);
  return (
    <div className={"mixrows" + (anim ? " rv-mix" : "")} role="img" aria-label={sr}>
      {mix.map((m, i) => (
        <div key={m.k} className={"mixrow" + (i === 0 ? " pri" : "")} aria-hidden="true">
          <span>{i === 0 ? PATTERNS[m.k].name : PATTERNS[m.k].short}</span>
          <div className="track">
            <div className="seg" style={{ width: Math.max(2, (m.pct / max) * 100) + "%", background: MIXC[i], border: i === 4 ? "1px solid rgba(74,14,46,0.2)" : "none", animationDelay: 0.7 + i * 0.08 + "s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuessLine({ guess, primary }) {
  if (!guess) return null;
  if (guess === "X") return <p className="guess">You weren't sure. <b>Your answers point to {PATTERNS[primary].name}.</b></p>;
  if (guess === primary) return <p className="guess"><b>You called it.</b></p>;
  return <p className="guess">You picked {PATTERNS[guess].name}. <b>Your answers point to {PATTERNS[primary].name}.</b></p>;
}

export function FitCheck({ secondary, value, onChange }) {
  const opts = ["Yes, that's me", "Partly", "Not really"];
  return (
    <div className="block">
      <p className="eye" id="fitl">Does this sound like you?</p>
      <div className="chips" role="radiogroup" aria-labelledby="fitl">
        {opts.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={value === o} className={"chip" + (value === o ? " sel" : "")} onClick={() => onChange(o)}>
            {value === o && <Check s={12} />}{o}
          </button>
        ))}
      </div>
      {value === "Not really" && (
        <p className="body" style={{ marginTop: 14 }}>
          Your answers also leaned towards <b style={{ fontWeight: 600, color: "var(--burg)" }}>{PATTERNS[secondary].name}</b>.
        </p>
      )}
    </div>
  );
}

export function FootNote() {
  return (
    <p className="footnote">
      This is a self-assessment, not a medical or psychological diagnosis. If this brought something up for you: SADAG 0800 567 567 (South Africa) · Samaritans 116 123 (UK).
    </p>
  );
}

// Her full pattern (design screen 9, open state).
export function PatternFull({ res, guess, imgIdx, onRetake }) {
  const P = PATTERNS[res.primary];
  return (
    <section className="dash-open" style={{ marginTop: 22 }}>
      <div className="pad dash-img"><PatternImg p={res.primary} imgIdx={imgIdx} radius={10} /></div>
      <div className="pad dash-body">
        <div className="panel" style={{ padding: "24px 20px", marginTop: 3 }}>
          <p className="eye">Your starting point</p>
          <h2 className="h-l" style={{ marginTop: 10 }}>{P.name}</h2>
          <p className="body" style={{ marginTop: 10, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 19, lineHeight: 1.4, color: "var(--burg)" }}>{P.mirror}</p>
          {guess && <div style={{ marginTop: 16 }}><GuessLine guess={guess} primary={res.primary} /></div>}
          <div className="block" style={{ marginTop: 20 }}><p className="eye">Your pattern mix</p><MixBar mix={res.mix} /></div>
        </div>
      </div>
      <div className="pad dash-full">
        <div className="panel" style={{ padding: "0 20px 24px", marginTop: 3 }}>
          <div className="block"><p className="eye">At your best</p><p className="body">{P.best}</p></div>
          <div className="block"><p className="eye">At your worst</p><p className="body">{P.worst}</p></div>
          <div className="block"><p className="eye">What this means</p><p className="body">{P.means}</p></div>
          <div className="block" style={{ background: "var(--rose-pale)", margin: "0 -20px", padding: "24px 20px", borderTop: "none" }}><p className="eye">One thing this week</p><p className="body" style={{ color: "var(--burg)" }}>{P.week}</p></div>
          <div className="block" style={{ borderTop: "none" }}>
            <p className="eye">Where your work starts</p>
            {P.pillars.map((pl, i) => (
              <div className="pillar" key={pl}>
                <Icon name={PILLAR_ICON[pl]} size={28} />
                <div><b>{pl}</b><span>{i === 0 ? "Primary pillar" : "Secondary pillar"}</span></div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 4 }}>
            <button type="button" className="btn-t" onClick={onRetake}>Retake the profile</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Your next step: the two doors (design screen 10).
export function Doors({ route, setRoute, doorState, onDoor, res, bpPrice }) {
  const D = DOORS.map((d) => (d.k === "bp" && bpPrice ? { ...d, price: bpPrice } : d));
  const Sect = ({ children }) => <section className="sect" style={{ marginTop: 36 }}><div className="sect-inner">{children}</div></section>;
  if (doorState.applied) {
    const d = D.find((x) => x.k === doorState.applied) || D[1];
    return (
      <Sect>
        <p className="eye">Your next step</p>
        <div className="door chosen" style={{ marginTop: 16 }}>
          <span className="tag"><Check s={11} />Application received</span>
          <h4>{d.name}</h4>
          <p className="body" style={{ fontSize: 16 }}>Application received. We'll be in touch by {REPLY_DATE}.</p>
        </div>
      </Sect>
    );
  }
  if (doorState.bought) {
    const others = D.filter((d) => d.k !== "bp");
    return (
      <Sect>
        <p className="eye">Your next step</p>
        <div className="door chosen" style={{ marginTop: 16 }}>
          <span className="tag"><Check s={11} />Enrolled</span>
          <h4>The Aligned Woman Blueprint</h4>
          <p className="body" style={{ fontSize: 16 }}>Start with {PATTERNS[res.primary].pillars[0]}, where your pattern starts.</p>
          <button type="button" className="btn btn-p full" style={{ marginTop: 4 }} onClick={() => onDoor("continue")}>Continue the Blueprint</button>
        </div>
        {others.map((d) => (
          <div key={d.k} className="door quiet" style={{ marginTop: 10 }}>
            <h4>{d.name}</h4>
            <p className="body door-line" style={{ fontSize: 16 }}>{d.line}</p>
            <p className="price">{d.price}</p>
            <button type="button" className="btn btn-s full" style={{ marginTop: 4 }} onClick={() => onDoor(d.k)}>{d.btn}</button>
          </div>
        ))}
      </Sect>
    );
  }
  const ordered = route && D.find((d) => d.k === route) ? [D.find((d) => d.k === route), ...D.filter((d) => d.k !== route)] : D;
  return (
    <Sect>
      <p className="eye">Your next step</p>
      <h2 className="h-l" style={{ marginTop: 12 }} id="doorsl">How do you want to work on this?</h2>
      <div role="radiogroup" aria-labelledby="doorsl" className="doors-grid" style={{ marginTop: 20 }}>
        {D.map((d) => (
          <button key={d.k} type="button" role="radio" aria-checked={route === d.k} className={"opt" + (route === d.k ? " sel" : "")} onClick={() => setRoute(route === d.k ? null : d.k)}>
            <span style={{ font: "500 15px/1.4 var(--sans)", color: "var(--burg)" }}>{d.route}</span>
            <span className="tick">{route === d.k && <Check s={12} />}</span>
          </button>
        ))}
      </div>
      <div className="doors-grid" style={{ marginTop: 22 }}>
        {ordered.map((d) => {
          const cls = route ? (route === d.k ? " chosen" : " quiet") : "";
          return (
            <div key={d.k} className={"door" + cls}>
              <h4>{d.name}</h4>
              <p className="body door-line" style={{ fontSize: 16 }}>{d.line}</p>
              <p className="price">{d.price}</p>
              <button type="button" className={"btn " + (route === d.k ? "btn-p" : "btn-s") + " full"} style={{ marginTop: 4 }} onClick={() => onDoor(d.k)}>{d.btn}</button>
            </div>
          );
        })}
      </div>
    </Sect>
  );
}

// One-on-one application sheet. A bottom sheet on mobile, a centred dialog
// from tablet up (the stylesheet switches it). Focus moves in, Escape and the
// backdrop close it, focus returns to the button that opened it.
export function ApplySheet({ user, res, onClose, onSubmit, onSent }) {
  const door = DOORS.find((d) => d.k === "laura");
  const P = PATTERNS[res.primary];
  const [stage, setStage] = useState("form");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [sentTo, setSentTo] = useState("");
  const ref = useRef(null);
  const opener = useRef(typeof document !== "undefined" ? document.activeElement : null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      const first = el.querySelector("input,textarea,button");
      (first || el).focus();
    }
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && el) {
        const f = Array.from(el.querySelectorAll("button,input,textarea,a[href]")).filter((x) => !x.disabled);
        if (!f.length) return;
        const firstEl = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      try { opener.current && opener.current.focus && opener.current.focus(); } catch (_e) { /* ignore */ }
    };
  }, []);

  const submit = async () => {
    setStage("sending");
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), a1: a1.trim(), a2: a2.trim() });
      setSentTo(email.trim());
      setStage("sent");
    } catch (_e) {
      setStage("error");
    }
  };

  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={door.name} ref={ref} tabIndex={-1}>
        <div className="grab" />
        {stage === "sent" ? (
          <>
            <p className="eye">Sent</p>
            <h3 className="h-m" style={{ marginTop: 10 }}>Application received.</h3>
            <p className="body" style={{ marginTop: 10, fontSize: 16 }}>We've emailed a copy to {sentTo || "you"}. We'll be in touch by {REPLY_DATE}.</p>
            <div style={{ marginTop: 22 }}><Primary onClick={() => { onSent("laura"); onClose(); }}>Back to my profile</Primary></div>
          </>
        ) : (
          <>
            <p className="eye">Application</p>
            <h3 className="h-m" style={{ marginTop: 10 }}>{door.name}</h3>
            <div style={{ marginTop: 14 }}><span className="tag">Attached: {P.name}</span></div>
            <div className="field"><label htmlFor="an">First name</label><input id="an" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></div>
            <div className="field"><label htmlFor="ae">Email</label><input id="ae" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
            <div className="field"><label htmlFor="q1">What's happening for you right now that made you choose this?</label><textarea id="q1" value={a1} onChange={(e) => setA1(e.target.value)} required aria-required="true" /></div>
            <div className="field"><label htmlFor="q2">What would be different in six months if this worked?</label><textarea id="q2" value={a2} onChange={(e) => setA2(e.target.value)} /></div>
            {stage === "error" && <p className="guess" role="alert" style={{ marginTop: 16, borderColor: "rgba(155,44,44,0.35)" }}>We couldn't save that. Your answers are still here. Try again.</p>}
            <div style={{ marginTop: 20 }}>
              <Primary onClick={submit} loading={stage === "sending"} disabled={!a1.trim() || !name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())}>{door.btn.replace("Apply", "Send application")}</Primary>
            </div>
          </>
        )}
      </div>
    </>
  );
}
