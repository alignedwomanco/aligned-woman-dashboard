import React from "react";
import { shortTime } from "@/lib/circle";

// ────────────────────────────────────────────────────────────────
// The notice strip. One highlighted line at the very top of the room,
// visually distinct from a post: it is not a thread, it cannot be
// replied to, and only one is ever active. The host clears it, a
// member hides it for herself until a new one is posted.
// ────────────────────────────────────────────────────────────────

export default function CircleAnnounceBanner({ announcement, host, isMod, onClear, onDismiss, busy, readOnly = false }) {
  if (!announcement) return null;
  const who = announcement.author_name || host?.first_name || "the host";
  return (
    <div className="rounded-[18px] bg-awrose-pale border border-awrose-core/30 px-4 py-3 flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <p className="font-body font-bold text-[9.5px] tracking-eyebrow uppercase text-awrose-deep mb-1">
          Notice from {who} · {shortTime(announcement.created_date)}
        </p>
        <p className="font-body font-light text-[14px] leading-[1.6] text-awburg-dark whitespace-pre-line">{announcement.body}</p>
      </div>
      {!readOnly && isMod && (
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          className="flex-none min-h-[44px] px-2 font-body text-[11px] font-semibold text-awrose-deep disabled:opacity-50"
        >
          Clear
        </button>
      )}
      {!readOnly && !isMod && (
        <button
          type="button"
          aria-label="Dismiss this notice"
          onClick={onDismiss}
          className="flex-none w-11 h-11 -mr-1 flex items-center justify-center text-awburg-mid text-[18px] leading-none"
        >
          {"✕"}
        </button>
      )}
    </div>
  );
}