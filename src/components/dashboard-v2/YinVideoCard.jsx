import { useState, useEffect, useRef } from "react";
import { Play, X } from "lucide-react";

const YIN_VIDEO_URL =
  "https://pub-92fd07e9117b4774bd919918a55b163b.r2.dev/Phoebe-Greenacre-Intro-Yin-stress-digest.mp4";

// Card shell matches the dashboard glass cards.
const GLASS_CARD =
  "rounded-2xl border border-awburg-core/10 bg-white/40 backdrop-blur-2xl shadow-sm";

// Design spec hexes (AWB handoff, July 2026).
const INK = "#4a2a32"; // dark burgundy — play button, title
const BODY = "#706666"; // muted body text
const META = "#8a7c7c"; // meta line
const BADGE_BG = "#fcfaf9";

export default function YinVideoCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`${GLASS_CARD} p-6 flex flex-col`}>
        {/* Header */}
        <div>
          <span
            className="inline-block rounded-full px-3 py-1 font-body font-bold text-[10px] tracking-eyebrow uppercase"
            style={{ background: BADGE_BG, color: INK }}
          >
            Video practice
          </span>
        </div>
        <h3
          className="font-display text-[20px] leading-tight mt-4 mb-2"
          style={{ color: INK }}
        >
          Yin, with Phoebe
        </h3>
        <p
          className="font-body font-light text-[13px] leading-relaxed mb-3 flex-1"
          style={{ color: BODY }}
        >
          A slow yin practice with Phoebe Greenacre, somatic therapist and nervous
          system coach. For the days your body needs to arrive before your mind can.
        </p>
        <p
          className="font-body font-medium text-[12px] mb-4"
          style={{ color: META }}
        >
          20 minutes • watch anytime
        </p>

        {/* Video thumbnail — clicking opens the modal, never navigates. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Play Yin practice with Phoebe"
          className="group relative w-full overflow-hidden rounded-[20px] aspect-video bg-awburg-dark/10 focus:outline-none focus:ring-2 focus:ring-awburg-core/40"
        >
          <video
            src={YIN_VIDEO_URL}
            preload="metadata"
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtitle overlay, bottom center */}
          <div className="absolute inset-x-0 bottom-0 p-3 pt-8 bg-gradient-to-t from-black/45 to-transparent flex justify-center">
            <span className="font-body text-[12px] text-white/95 text-center drop-shadow">
              Hello, I'm Phoebe Greenacre.
            </span>
          </div>
          {/* Play button */}
          <span
            className="absolute inset-0 m-auto flex items-center justify-center w-14 h-14 rounded-full transition-transform duration-200 group-hover:scale-105"
            style={{ background: INK }}
          >
            <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
          </span>
          {/* Duration badge */}
          <span className="absolute bottom-2 right-2 rounded-md px-2 py-0.5 font-body font-medium text-[11px] text-white" style={{ background: "rgba(74,42,50,0.85)" }}>
            20:00
          </span>
        </button>
      </div>

      {open && <YinVideoModal src={YIN_VIDEO_URL} onClose={() => setOpen(false)} />}
    </>
  );
}

function YinVideoModal({ src, onClose }) {
  const ref = useRef(null);

  // Close on Escape, lock scroll while open.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Autoplay once mounted.
  useEffect(() => {
    ref.current?.play().catch(() => {});
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(26,5,16,0.78)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-2 -right-2 sm:top-0 sm:right-0 sm:-translate-y-10 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-colors"
        >
          <X className="w-5 h-5" style={{ color: INK }} />
        </button>
        <div className="overflow-hidden rounded-[24px] bg-black shadow-2xl">
          <video
            ref={ref}
            src={src}
            controls
            autoPlay
            playsInline
            className="w-full h-auto max-h-[80vh] block"
          />
        </div>
      </div>
    </div>
  );
}