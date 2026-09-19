import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ANON_TINT_CLASSES, ANONYMOUS_NAME, CIRCLE_COPY } from "@/lib/circle";

// ────────────────────────────────────────────────────────────────
// Circle shell · the pieces that look identical in every state of a
// partner hosted room, lifted from the Section A and B design file:
// platform bar, host band with the sage seam, host card, trust chips,
// buttons, fine print, rules modal and the anonymous avatar.
//
// Everything is on tailwind tokens. The room accent is awsage and it
// appears only as the seam, the logo ring and the Answered mark.
// ────────────────────────────────────────────────────────────────

export const BTN_PRIMARY =
  "inline-flex w-full items-center justify-center rounded-full bg-awburg-core hover:bg-awburg-dark text-paper font-body font-bold text-[12px] tracking-[0.2em] uppercase min-h-[52px] px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const BTN_SECONDARY =
  "inline-flex w-full items-center justify-center rounded-full border-[1.5px] border-awrose-core text-awburg-core hover:bg-awrose-wash font-body font-bold text-[12px] tracking-[0.2em] uppercase min-h-[48px] px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const BTN_TEXT =
  "inline-flex items-center justify-center font-body text-[12px] font-semibold text-awburg-mid hover:text-awburg-core min-h-[44px] px-3";
export const CHIP =
  "inline-flex items-center rounded-full bg-paper border border-awburg-core/15 px-[15px] py-[11px] font-body text-[11px] font-semibold text-awburg-core whitespace-nowrap";
export const CHIP_ON =
  "inline-flex items-center rounded-full bg-awrose-pale border border-awrose-pale px-[15px] py-[11px] font-body text-[11px] font-semibold text-awburg-core whitespace-nowrap";
export const CARD = "rounded-[22px] bg-paper border border-awburg-core/10 shadow-sm";

const AW_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695154cb868ee011bb627195/23f49bf5a_AlignedWomanLogoPurple.png";

// "The Grounded Women Circle" with Women in true italic, per the brand.
export function RoomTitle({ name, className = "" }) {
  const parts = String(name || "").split(/(\bWomen\b|\bWoman\b)/);
  return (
    <span className={className}>
      {parts.map((p, i) => (/^(Women|Woman)$/.test(p) ? <em key={i} className="italic">{p}</em> : <React.Fragment key={i}>{p}</React.Fragment>))}
    </span>
  );
}

export function PlatformBar({ user, slug }) {
  const [open, setOpen] = useState(false);
  const home = user ? "/Dashboard" : "/";
  const links = user
    ? [
        { to: "/Dashboard", label: "Dashboard" },
        { to: "/Community", label: "Community" },
        { to: "/ExpertsDirectory", label: "Experts" },
      ]
    : [
        { to: "/Community", label: "Community" },
        { to: "/ExpertsDirectory", label: "Experts" },
        { to: "/Apply", label: "Apply" },
        { to: `/login?from_url=/${slug}`, label: "Log in" },
      ];
  return (
    <header className="relative h-[54px] bg-off-white border-b border-awburg-core/10 flex items-center justify-between px-[18px]">
      <Link to={home} className="flex items-center gap-[9px] min-h-[44px]">
        <img src={AW_LOGO} alt="" className="h-[22px] w-auto" />
        <span className="font-body font-bold text-[8.5px] tracking-[0.24em] text-awburg-core">THE ALIGNED WOMAN CO.</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="font-body font-bold text-[9.5px] tracking-[0.2em] uppercase text-awburg-core min-h-[44px] inline-flex items-center">
            {l.label}
          </Link>
        ))}
        {user && (
          <span className="font-body font-light text-[11px] text-awburg-mid">Signed in as {user.full_name?.split(" ")[0] || user.email}</span>
        )}
      </nav>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="md:hidden w-11 h-11 -mr-2 flex flex-col items-center justify-center gap-1"
      >
        <span className="block w-[18px] h-[1.5px] bg-awburg-core" />
        <span className="block w-[18px] h-[1.5px] bg-awburg-core" />
      </button>
      {open && (
        <div className="md:hidden absolute left-0 right-0 top-[54px] z-40 bg-off-white border-b border-awburg-core/10 shadow-lg">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-6 py-4 font-body font-bold text-[10px] tracking-[0.2em] uppercase text-awburg-core border-t border-awburg-core/10">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function HostLogo({ host, size = 50, className = "" }) {
  const initials = (host?.business_name || host?.name || "GW").split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      className={`flex-none rounded-full overflow-hidden border-[1.5px] border-awsage-core bg-paper flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {host?.logo_url ? (
        <img src={host.logo_url} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="font-display text-awburg-core" style={{ fontSize: size * 0.34 }}>{initials}</span>
      )}
    </span>
  );
}

export function HostBand({ group, host, compact = false }) {
  const business = host?.business_name || host?.name || "";
  return (
    <>
      <div className={`bg-awburg-core flex items-center gap-[14px] px-[18px] ${compact ? "py-[14px]" : "pt-5 pb-[18px]"}`}>
        <HostLogo host={host} size={compact ? 40 : 50} />
        <div className="min-w-0">
          {business && <p className="font-body font-bold text-[9px] tracking-eyebrow uppercase text-awrose-light mb-1">Hosted by {business}</p>}
          <h1 className="font-display text-[19px] leading-tight text-paper m-0">
            <RoomTitle name={group.name} />
          </h1>
          {!compact && group.subtitle && <p className="font-body font-light text-[11.5px] text-paper/80 mt-[3px]">{group.subtitle}</p>}
        </div>
      </div>
      <div className="h-[3px] bg-awsage-core" aria-hidden="true" />
    </>
  );
}

export function HostCard({ host, className = "" }) {
  if (!host) return null;
  return (
    <div className={`${CARD} flex items-center gap-[14px] px-5 py-[18px] ${className}`}>
      <HostLogo host={host} size={46} />
      <div className="min-w-0">
        <p className="font-body font-semibold text-[13.5px] text-awburg-dark">Hosted by {host.first_name || host.name}</p>
        <p className="font-body font-light text-[12px] text-awburg-mid">{host.business_name || host.name} · approves every member herself</p>
      </div>
    </div>
  );
}

export function TrustChips({ className = "" }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {CIRCLE_COPY.trustChips.map((c) => (
        <span key={c} className={CHIP}>{c}</span>
      ))}
    </div>
  );
}

export function FinePrint({ host, className = "" }) {
  return (
    <p className={`font-body font-light text-[11.5px] leading-[1.55] text-awburg-mid text-center ${className}`}>
      {CIRCLE_COPY.finePrint(host?.business_name || host?.name)}
    </p>
  );
}

export function RulesModal({ open, rules, onClose, onAgree }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="The Circle rules" onClick={onClose} className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-awburg-dark/60 p-0 md:p-6">
      <div onClick={(e) => e.stopPropagation()} className="w-full md:max-w-[440px] bg-paper rounded-t-[28px] md:rounded-[28px] px-6 pt-7 pb-8 shadow-xl">
        <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-deep mb-3">The Circle rules</p>
        <p className="font-body font-light text-[14px] leading-[1.7] text-awburg-dark whitespace-pre-line mb-6">{rules}</p>
        {onAgree ? (
          <button type="button" className={BTN_PRIMARY} onClick={() => { onAgree(); onClose(); }}>I agree</button>
        ) : null}
        <button type="button" className={`${BTN_TEXT} w-full mt-2`} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Anonymous avatar: a neutral silhouette on a tint chosen per post, so
// no colour can be traced back to one woman. Named members get initials.
export function Avatar({ post, size = 32 }) {
  const style = { width: size, height: size };
  if (post?.is_anonymous) {
    const cls = ANON_TINT_CLASSES[(post.anon_tint || 0) % ANON_TINT_CLASSES.length];
    return (
      <span className={`flex-none rounded-full flex items-center justify-center ${cls}`} style={style} aria-label={ANONYMOUS_NAME}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5v1H4v-1z" />
        </svg>
      </span>
    );
  }
  if (post?.author_avatar) {
    return <img src={post.author_avatar} alt="" className="flex-none rounded-full object-cover" style={style} />;
  }
  const initials = String(post?.author_name || "M").split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase().replace(".", "");
  return (
    <span className="flex-none rounded-full bg-awrose-pale text-awburg-core font-body font-semibold flex items-center justify-center" style={{ ...style, fontSize: size * 0.34 }} aria-hidden="true">
      {initials}
    </span>
  );
}

export function Sheet({ open, onClose, label, children, wide = false }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={label} onClick={onClose} className="fixed inset-0 z-[150] flex items-end md:items-center justify-center bg-awburg-dark/55 md:p-6">
      <div onClick={(e) => e.stopPropagation()} className={`w-full ${wide ? "md:max-w-[560px]" : "md:max-w-[480px]"} max-h-[94vh] md:max-h-[88vh] overflow-y-auto bg-off-white rounded-t-[28px] md:rounded-[28px] shadow-xl`}>
        {children}
      </div>
    </div>
  );
}
