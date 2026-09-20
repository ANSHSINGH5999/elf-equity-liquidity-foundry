"use client";

import { useEffect } from "react";

/**
 * The two behaviours the design's script provides, and nothing else:
 *  (a) the artwork is a video, so reduced motion is honoured by pausing it on its first frame;
 *  (b) the entrance is pure CSS — this only retires it once the last tween ends, so a later
 *      breakpoint change can never replay it.
 * Renders nothing.
 */
export function LandingMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const video = document.querySelector<HTMLVideoElement>(".nl video.art");
    const q = window.matchMedia("(prefers-reduced-motion:reduce)");

    function sync() {
      if (!video) return;
      if (q.matches) video.pause();
      else {
        video.muted = true; // React does not reliably emit the muted attribute in SSR HTML; autoplay needs it
        video.play().catch(() => {});
      }
    }
    sync();
    q.addEventListener("change", sync);

    const last = document.getElementById("foot2");
    function done() {
      window.clearTimeout(timer);
      last?.removeEventListener("animationend", done);
      root.classList.add("is-entered");
    }
    last?.addEventListener("animationend", done);
    const timer = window.setTimeout(done, 4000);

    return () => {
      q.removeEventListener("change", sync);
      window.clearTimeout(timer);
      last?.removeEventListener("animationend", done);
      root.classList.remove("is-entered"); // leaving the page re-arms the entrance for the next visit
    };
  }, []);

  return null;
}
