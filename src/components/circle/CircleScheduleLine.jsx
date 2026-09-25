import React, { useEffect, useState } from "react";
import { nextCircleSession, sessionHint, sessionLabel } from "@/lib/circle";

// ────────────────────────────────────────────────────────────────
// The slim line above the feed: when the room next meets. It computes
// the next occurrence from the Group record, so there is nothing to
// schedule and nothing to drift. Inside the session window it turns
// into the live line in the room accent, and back again when the
// window closes. A thirty second tick is all that drives it.
// ────────────────────────────────────────────────────────────────

export default function CircleScheduleLine({ schedule, host, showLive = true }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  if (!schedule?.on) return null;
  const occ = nextCircleSession(schedule, now);
  if (!occ) return null;

  const label = String(schedule.label || "").trim() || "Circle Hour";
  const live = showLive && now >= occ.start && now < occ.end;

  if (live) {
    return (
      <p className="flex items-center gap-2 rounded-full bg-awsage-wash border border-awsage-core/30 px-4 py-[11px] font-body text-[12.5px] font-semibold text-awsage-core">
        <span className="w-2 h-2 rounded-full bg-awsage-core animate-pulse" aria-hidden="true" />
        {host?.first_name || "The host"} is live in the Circle now
      </p>
    );
  }

  const hint = sessionHint(occ, schedule, now);
  return (
    <p className="rounded-full bg-paper border border-awburg-core/10 px-4 py-[11px] font-body text-[12.5px] text-awburg-dark">
      Next {label}: <span className="font-semibold">{sessionLabel(schedule)}</span>
      {hint ? <span className="text-awburg-mid"> · {hint}</span> : null}
    </p>
  );
}