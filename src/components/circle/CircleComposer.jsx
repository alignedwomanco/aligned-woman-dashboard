import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CIRCLE_COPY, activeTopics, scrubPhoto } from "@/lib/circle";
import { BTN_PRIMARY, BTN_SECONDARY, BTN_TEXT, CHIP, CHIP_ON, Sheet } from "@/components/circle/CircleShell";

// ────────────────────────────────────────────────────────────────
// Composer · Ask a question and Share, one sheet, two moods.
//
// Photos are scrubbed in the browser before upload (canvas re-encode,
// random file name) so no EXIF and no original name ever leave the
// phone. Photos are the only media type: voice notes were removed on
// purpose and createCirclePost rejects them. The post itself goes
// through createCirclePost.
// ────────────────────────────────────────────────────────────────

export default function CircleComposer({ open, mode, group, host, onClose, onPosted }) {
  const isQuestion = mode === "question";
  const topics = activeTopics(group);
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("");
  const [anon, setAnon] = useState(false);
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setBody(""); setTopic(""); setAnon(false); setMedia([]); setError(""); setBusy(false);
    }
  }, [open]);

  const addPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const clean = await scrubPhoto(file);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: clean });
      setMedia((m) => [...m, { kind: "photo", url: file_url, duration_seconds: 0 }]);
    } catch (_e) {
      setError("That photo did not upload. Try a different one.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setError("");
    if (!topic) { setError("Choose a topic so the right women find it."); return; }
    if (!body.trim() && media.length === 0) { setError("Write something, or add a photo."); return; }
    setBusy(true);
    try {
      const res = await base44.functions.invoke("createCirclePost", {
        groupId: group.id,
        body: body.trim(),
        postType: isQuestion ? "question" : "share",
        isAnonymous: anon,
        topicKey: topic,
        media,
      });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      onPosted(data.postId);
    } catch (e) {
      setError(e?.message === "topic_required" ? "Choose a topic so the right women find it." : "That did not post. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const first = host?.first_name || "The host";

  return (
    <Sheet open={open} onClose={busy ? () => {} : onClose} label={isQuestion ? "Ask the Circle" : "Share with the Circle"} wide>
      <div className="px-[22px] pt-6 pb-8 md:px-8 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-[26px] leading-tight text-awburg-dark m-0">
            {isQuestion ? <>Ask <em className="italic text-awburg-bright">the Circle</em></> : <>Share with <em className="italic text-awburg-bright">the Circle</em></>}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center text-awburg-core text-[20px]">{"✕"}</button>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder={isQuestion ? CIRCLE_COPY.questionPlaceholder : CIRCLE_COPY.sharePlaceholder}
          className="w-full bg-paper border border-awburg-core/15 focus:border-awrose-core rounded-[18px] px-4 py-3 font-body font-light text-[15px] leading-[1.6] text-awburg-dark outline-none resize-y min-h-[140px]"
        />

        <div>
          <p className="font-body font-semibold text-[12px] text-awburg-dark mb-2">What is this about <span className="text-awrose-deep" aria-hidden="true">*</span></p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
            {topics.map((t) => (
              <button key={t.key} type="button" role="radio" aria-checked={topic === t.key} onClick={() => { setTopic(t.key); setError(""); }} className={topic === t.key ? CHIP_ON : CHIP}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] bg-paper border border-awburg-core/10 p-4">
          <label className="flex items-center justify-between gap-4 cursor-pointer min-h-[44px]">
            <span className="font-body font-semibold text-[14px] text-awburg-dark">Post anonymously</span>
            <span className="flex items-center gap-2">
              <span className="font-body text-[11px] text-awburg-mid">{anon ? "On" : "Off"}</span>
              <input type="checkbox" role="switch" aria-checked={anon} className="sr-only peer" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
              <span aria-hidden="true" className={`relative inline-block w-[46px] h-[26px] rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-awrose-deep ${anon ? "bg-awburg-core" : "bg-awburg-core/20"}`}>
                <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-paper transition-all ${anon ? "left-[23px]" : "left-[3px]"}`} />
              </span>
            </span>
          </label>
          <p className="font-body font-light text-[12px] leading-[1.6] text-awburg-mid mt-2">{CIRCLE_COPY.anonymousHelper(first)}</p>
          {anon && <p className="font-body text-[12px] font-semibold text-awburg-core mt-2">You will appear as Anonymous member</p>}
        </div>

        <div>
          <label className={`${BTN_SECONDARY} w-auto min-h-[44px] px-5 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            {uploading ? "Uploading..." : "Add a photo"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { addPhoto(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {media.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {media.map((m, i) => (
                <div key={m.url} className="relative">
                  <img src={m.url} alt="" className="w-[84px] h-[84px] rounded-[16px] object-cover border border-awburg-core/10" />
                  <button type="button" aria-label="Remove" onClick={() => setMedia((arr) => arr.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-awburg-core text-paper text-[12px] flex items-center justify-center">{"✕"}</button>
                </div>
              ))}
            </div>
          )}
          <p className="font-body font-light text-[11.5px] leading-[1.6] text-awburg-mid mt-3">{CIRCLE_COPY.mediaHelper}</p>
        </div>

        {error && <p className="font-body text-[12.5px] text-awrose-deep">{error}</p>}

        <button type="button" className={BTN_PRIMARY} disabled={busy || uploading} onClick={submit}>
          {busy ? "Posting..." : isQuestion ? "Post to the Circle" : "Share with the Circle"}
        </button>
        <button type="button" className={`${BTN_TEXT} w-full`} onClick={onClose} disabled={busy}>Cancel</button>
      </div>
    </Sheet>
  );
}
