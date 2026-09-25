import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ANNOUNCE_TEMPLATES, EXPIRY_PRESETS, awayExpiry, expiryFromPreset, formatAwayDate } from "@/lib/circle";
import { BTN_PRIMARY, BTN_TEXT, CHIP, CHIP_ON, Sheet } from "@/components/circle/CircleShell";

// ────────────────────────────────────────────────────────────────
// Announce · a one off notice for an exception, not a habit. Four
// one tap templates, editable, each with its own default expiry. It
// writes through createCirclePost like every other post, so there is
// no second write path into the room.
// ────────────────────────────────────────────────────────────────

const FIELD =
  "w-full min-h-[44px] bg-paper border border-awburg-core/15 focus:border-awrose-core rounded-[18px] px-4 py-3 font-body font-light text-[14.5px] leading-[1.6] text-awburg-dark outline-none";
const LABEL = "block font-body font-semibold text-[12px] text-awburg-dark mb-2";

function defaultAwayDate() {
  const sast = new Date(Date.now() + 7 * 86400000 + 2 * 3600000);
  return sast.toISOString().slice(0, 10);
}

function awayText(dateStr) {
  return `I'm away until ${formatAwayDate(dateStr)}, questions are still welcome and I'll answer them when I'm back`;
}

export default function CircleAnnounce({ open, onClose, group, seed, onPosted }) {
  const [tpl, setTpl] = useState("live");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("live");
  const [preset, setPreset] = useState("1h");
  const [awayDate, setAwayDate] = useState(defaultAwayDate);
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setError("");
    if (seed) {
      // Post again: the words and the mood come back, the expiry does not.
      setTpl("note");
      setKind(seed.announcement_kind || "note");
      setBody(seed.body || "");
      setPreset("3d");
      setNotify(false);
      setAwayDate(defaultAwayDate());
      return;
    }
    const first = ANNOUNCE_TEMPLATES[0];
    setTpl(first.key);
    setKind(first.kind);
    setBody(first.text);
    setPreset(first.preset);
    setNotify(first.notify);
    setAwayDate(defaultAwayDate());
  }, [open, seed]);

  const choose = (t) => {
    setTpl(t.key);
    setKind(t.kind);
    setNotify(t.notify);
    setError("");
    if (t.needsDate) {
      const d = awayDate || defaultAwayDate();
      setAwayDate(d);
      setBody(awayText(d));
    } else {
      setBody(t.text || "");
    }
  };

  const changeAwayDate = (value) => {
    setAwayDate(value);
    if (kind === "away") setBody(awayText(value));
  };

  const submit = async () => {
    setError("");
    if (!body.trim()) { setError("Write the notice first."); return; }
    const expires = kind === "away" ? awayExpiry(awayDate) : expiryFromPreset(preset);
    if (!expires || expires.getTime() <= Date.now()) { setError("That time has already passed. Choose another."); return; }
    setBusy(true);
    try {
      const res = await base44.functions.invoke("createCirclePost", {
        groupId: group.id,
        body: body.trim(),
        postType: "announcement",
        announcementKind: kind,
        expiresAt: expires.toISOString(),
        notify,
      });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      onPosted?.();
      onClose();
    } catch (_e) {
      setError("That did not post. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={busy ? () => {} : onClose} label="Post a notice" wide>
      <div className="px-[22px] pt-6 pb-8 md:px-8 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-[24px] leading-tight text-awburg-dark m-0">
            Post a <em className="italic text-awburg-bright">notice</em>
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center text-awburg-core text-[20px]">{"✕"}</button>
        </div>
        <p className="font-body font-light text-[12.5px] leading-[1.6] text-awburg-mid -mt-2">
          For the exceptions only. One notice shows at a time, at the top of the room, and it disappears on its own when it expires.
        </p>

        <div>
          <p className={LABEL}>Start from</p>
          <div className="flex flex-wrap gap-2">
            {ANNOUNCE_TEMPLATES.map((t) => (
              <button key={t.key} type="button" aria-pressed={tpl === t.key} onClick={() => choose(t)} className={tpl === t.key ? CHIP_ON : CHIP}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {kind === "away" && (
          <div>
            <label className={LABEL} htmlFor="away-until">Back on</label>
            <input id="away-until" type="date" className={FIELD} value={awayDate} onChange={(e) => changeAwayDate(e.target.value)} />
          </div>
        )}

        <div>
          <label className={LABEL} htmlFor="announce-body">The notice</label>
          <textarea
            id="announce-body"
            rows={4}
            value={body}
            onChange={(e) => { setBody(e.target.value); setError(""); }}
            className={`${FIELD} resize-y min-h-[110px]`}
          />
        </div>

        {kind !== "away" && (
          <div>
            <p className={LABEL}>It disappears after</p>
            <div className="flex flex-wrap gap-2">
              {EXPIRY_PRESETS.map((p) => (
                <button key={p.key} type="button" aria-pressed={preset === p.key} onClick={() => setPreset(p.key)} className={preset === p.key ? CHIP_ON : CHIP}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[18px] bg-paper border border-awburg-core/10 p-4">
          <label className="flex items-center justify-between gap-4 cursor-pointer min-h-[44px]">
            <span className="font-body font-semibold text-[14px] text-awburg-dark">Notify members</span>
            <span className="flex items-center gap-2">
              <span className="font-body text-[11px] text-awburg-mid">{notify ? "On" : "Off"}</span>
              <input type="checkbox" role="switch" aria-checked={notify} className="sr-only peer" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              <span aria-hidden="true" className={`relative inline-block w-[46px] h-[26px] rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-awrose-deep ${notify ? "bg-awburg-core" : "bg-awburg-core/20"}`}>
                <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-paper transition-all ${notify ? "left-[23px]" : "left-[3px]"}`} />
              </span>
            </span>
          </label>
          <p className="font-body font-light text-[12px] leading-[1.6] text-awburg-mid mt-2">
            Everyone approved in the room hears once, in the app. Nothing is sent twice.
          </p>
        </div>

        {error && <p className="font-body text-[12.5px] text-awrose-deep">{error}</p>}

        <button type="button" className={BTN_PRIMARY} disabled={busy} onClick={submit}>
          {busy ? "Posting..." : "Post the notice"}
        </button>
        <button type="button" className={`${BTN_TEXT} w-full`} onClick={onClose} disabled={busy}>Cancel</button>
      </div>
    </Sheet>
  );
}