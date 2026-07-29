import React from "react";

// ────────────────────────────────────────────────────────────────
// Community UI · the shared surface for the Community index and the
// group page, lifted from the AWB Community design handoff.
//
// Tokens and layout live here once so the two pages cannot drift, the
// way the domain label did across three files before it was pulled into
// @/lib/expertDomain.
// ────────────────────────────────────────────────────────────────

export const T = {
  burg: "#4A0E2E",
  rose: "#C4847A",
  roseDeep: "#A86460",
  roseSoft: "#E9B7AC",
  ink: "#2B1220",
  note: "#92707D",
  white: "#FFFFFF",
};

export const serif = "'DM Serif Display', Georgia, serif";
export const sans = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

export function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// "Yesterday, 21:14" style stamps, matching the design's tone rather
// than a raw timestamp.
export function friendlyTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const hhmm = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (sameDay) return `Today, ${hhmm}`;
  if (d.toDateString() === yest.toDateString()) return `Yesterday, ${hhmm}`;
  const days = Math.round((now - d) / 86400000);
  if (days < 7) return `${d.toLocaleDateString("en-GB", { weekday: "long" })}, ${hhmm}`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

export function joinedLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `you joined in ${d.toLocaleDateString("en-GB", { month: "long" })}`;
}

export function sessionDateLabel(iso, opts = {}) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.toLocaleDateString("en-GB", {
    weekday: opts.short ? "short" : "long",
    day: "numeric",
    month: opts.short ? "short" : "long",
  });
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" }).replace(":00", "");
  return `${day}, ${time}`;
}

// Relative until the last day, precise inside it. A seconds counter
// three weeks out is noise, and it repaints every second for nothing.
export function countdownLabel(iso) {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return "";
  if (ms <= 0) return "Starting now";
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `In ${days} ${days === 1 ? "day" : "days"}`;
  if (hours >= 1) return `In ${hours} ${hours === 1 ? "hour" : "hours"}`;
  return `In ${Math.max(mins, 1)} ${mins === 1 ? "minute" : "minutes"}`;
}

export function CommunityStyles() {
  return (
    <style>{`
      .aw-c {
        --burg:${T.burg}; --rose:${T.rose}; --rose-deep:${T.roseDeep};
        --rose-soft:${T.roseSoft}; --ink:${T.ink}; --note:${T.note};
        --card:rgba(255,255,255,0.72); --card-quiet:rgba(255,255,255,0.44);
        --r-card:24px; --r-sm:16px;
        --shadow:0 18px 44px rgba(74,14,46,0.10);
        --shadow-dark:0 22px 52px rgba(43,18,32,0.28);
        --ease:cubic-bezier(0.2,0.7,0.2,1);
        font-family:${sans};
        color:var(--ink);
        line-height:1.55;
        min-height:100vh;
        background:linear-gradient(168deg,
          rgba(233,183,172,0.20) 0%,
          rgba(196,132,122,0.30) 32%,
          rgba(196,132,122,0.22) 58%,
          rgba(233,183,172,0.16) 82%,
          rgba(255,255,255,0) 100%), #fff;
      }
      .aw-c .page { position:relative; max-width:1440px; margin:0 auto; padding:32px 40px 96px; }
      .aw-c .main { display:flex; flex-direction:column; gap:20px; }

      .aw-c .card {
        position:relative; background:var(--card); border-radius:var(--r-card);
        padding:32px 36px; box-shadow:var(--shadow);
      }
      .aw-c .card.quiet { background:var(--card-quiet); }
      .aw-c .card.dark {
        background:linear-gradient(152deg,#4A0E2E 0%,#3A0B24 55%,#2B1220 100%);
        color:#fff; box-shadow:var(--shadow-dark);
      }
      .aw-c .card.dark p, .aw-c .card.dark .meta { color:rgba(255,255,255,0.82); }

      .aw-c .page-head h1 { font-family:${serif}; font-weight:400; font-size:38px; color:var(--burg); line-height:1.1; margin:0 0 8px; }
      .aw-c .page-head p { font-size:13px; color:var(--note); margin:0; }
      .aw-c .section-title { font-size:14px; font-weight:600; color:var(--burg); padding:6px 10px 0; margin:44px 0 -4px; }

      .aw-c .eyebrow { font-size:10.5px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--rose-deep); }
      .aw-c .eyebrow.on-dark { color:var(--rose-soft); }

      .aw-c .chip {
        display:inline-flex; align-items:center; gap:7px; font-size:10.5px; font-weight:600;
        color:var(--burg); background:rgba(255,255,255,0.62); border-radius:999px;
        padding:6px 12px; width:fit-content;
      }
      .aw-c .chip .cdot { width:6px; height:6px; border-radius:50%; background:var(--rose); flex:none; }
      .aw-c .chip.on-dark { background:rgba(255,255,255,0.14); color:#fff; }
      .aw-c .chip.on-dark .cdot { background:var(--rose-soft); }

      .aw-c .avatar {
        width:38px; height:38px; border-radius:50%; flex:none; display:flex;
        align-items:center; justify-content:center; font-size:12px; font-weight:600;
        color:var(--burg); background:rgba(196,132,122,0.24); overflow:hidden;
      }
      .aw-c .avatar img { width:100%; height:100%; object-fit:cover; }
      .aw-c .avatar.sm { width:30px; height:30px; font-size:10.5px; }

      .aw-c .btn {
        display:inline-flex; align-items:center; justify-content:center; gap:10px;
        font-family:inherit; font-size:11.5px; font-weight:600; padding:11px 20px;
        border-radius:999px; border:none; cursor:pointer; text-decoration:none;
        transition:background var(--ease) 320ms, color var(--ease) 320ms, border-color var(--ease) 320ms, transform var(--ease) 320ms;
      }
      .aw-c .btn:active { transform:scale(0.96); }
      .aw-c .btn:disabled { opacity:0.55; cursor:default; }
      .aw-c .btn.rose { background:var(--rose); color:#fff; }
      .aw-c .btn.rose:hover:not(:disabled) { background:var(--rose-deep); }
      .aw-c .btn.ghost { border:1.5px solid rgba(74,14,46,0.35); color:var(--burg); background:transparent; }
      .aw-c .btn.ghost:hover:not(:disabled) { background:var(--burg); border-color:var(--burg); color:#fff; }
      .aw-c .btn.ghost-light { border:1px solid rgba(255,255,255,0.42); color:#fff; background:rgba(255,255,255,0.08); }
      .aw-c .btn.ghost-light:hover:not(:disabled) { border-color:#fff; background:rgba(255,255,255,0.18); }
      .aw-c .btn .knob {
        display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px;
        border-radius:50%; margin:-6px -14px -6px 2px; background:rgba(255,255,255,0.22);
      }
      .aw-c .textlink {
        background:none; border:none; padding:0; font-family:inherit; font-size:11.5px;
        font-weight:600; color:var(--burg); cursor:pointer; text-decoration:underline;
        text-underline-offset:3px;
      }
      .aw-c .textlink:hover { color:var(--rose-deep); }
      .aw-c .textlink.light { color:#fff; }

      .aw-c .empty {
        text-align:center; padding:34px 24px; border-radius:var(--r-sm);
        background:rgba(255,255,255,0.42); border:1px dashed rgba(74,14,46,0.14);
      }
      .aw-c .empty h4 { font-family:${serif}; font-weight:400; font-size:20px; color:var(--burg); margin:0 0 8px; }
      .aw-c .empty p { font-size:12.5px; color:var(--note); margin:0 auto 18px; max-width:420px; line-height:1.7; }

      .aw-c *:focus-visible { outline:2px solid var(--rose-deep); outline-offset:3px; }

      @media (max-width: 980px) {
        .aw-c .page { padding:20px 18px 56px; }
        .aw-c .card { padding:26px 22px; }
        .aw-c .section-title { margin-top:26px; padding:2px 4px 0; }
        .aw-c .page-head h1 { font-size:30px; }
        .aw-c .btn { padding:14px 22px; }
      }
    `}</style>
  );
}

export function Eyebrow({ children, onDark }) {
  return <span className={onDark ? "eyebrow on-dark" : "eyebrow"}>{children}</span>;
}

export function Chip({ children, onDark, dot = true }) {
  return (
    <span className={onDark ? "chip on-dark" : "chip"}>
      {dot && <span className="cdot" />}
      {children}
    </span>
  );
}

export function Avatar({ name, src, sm }) {
  return (
    <span className={sm ? "avatar sm" : "avatar"} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(name)}
    </span>
  );
}

export function Knob() {
  return (
    <span className="knob" aria-hidden="true">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}
