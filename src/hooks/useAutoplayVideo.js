import { useEffect, useRef } from "react";

/**
 * Returns a ref to attach to a <video> element.
 * On mount (and whenever deps change), attempts an imperative .play() call
 * so the video autoplays on mobile browsers that block the autoplay attribute.
 */
export default function useAutoplayVideo(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // Autoplay blocked — silently ignore
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}