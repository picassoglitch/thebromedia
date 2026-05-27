"use client";

import { useEffect, useRef, useState } from "react";

interface LoaderProps {
  /** flips to true when the WebGL scene has mounted */
  ready: boolean;
}

/**
 * Branded preloader. Animates a progress bar to ~85% on its own, then
 * completes the moment the scene reports ready. Fades out and unmounts.
 *
 * IMPORTANT: once `done` is true the overlay gets `pointer-events-none`.
 * Without that, the still-mounted (but transparent) loader covers the whole
 * viewport at `z-[100]` and silently swallows every click on the page —
 * making navbar / sidebar / any CTA appear broken.
 */
export default function Loader({ ready }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [unmount, setUnmount] = useState(false);

  // creep up to 85% so the user sees motion even on slow loads
  useEffect(() => {
    if (done) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setProgress((p) => {
        const cap = ready ? 100 : 85;
        const speed = ready ? 220 : 28;
        const next = Math.min(cap, p + speed * dt);
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, done]);

  // Persist the unmount timer in a ref so the effect's cleanup (which fires
  // on every re-render once `done` flips) can't cancel it. Previously the
  // cleanup was clearing the timeout immediately after setDone(true) caused
  // a re-render → setUnmount(true) never fired → loader stayed in the DOM
  // intercepting every click on the page.
  const unmountTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!ready || progress < 100 || done) return;
    setDone(true);
    unmountTimerRef.current = window.setTimeout(() => setUnmount(true), 900);
  }, [ready, progress, done]);

  // Only cancel the timer if the component itself unmounts (route change etc.),
  // not on every render.
  useEffect(() => () => {
    if (unmountTimerRef.current !== undefined) {
      window.clearTimeout(unmountTimerRef.current);
    }
  }, []);

  if (unmount) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#080808] flex flex-col items-center justify-center transition-opacity duration-700 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={done}
    >
      <div className="flex flex-col items-center gap-8 w-[min(360px,72vw)]">
        <div className="flex items-baseline gap-[0.05em] font-black tracking-tighter text-white text-2xl uppercase">
          <span>The</span>
          <span className="text-[#E85C00]">Bro</span>
          <span>Media</span>
        </div>

        <div className="relative w-full h-px bg-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-[#E85C00]"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 14px rgba(232,92,0,0.7)",
              transition: "width 60ms linear",
            }}
          />
        </div>

        <div className="flex w-full justify-between text-[10px] tracking-[0.4em] uppercase text-white/40">
          <span>Loading</span>
          <span>{Math.floor(progress).toString().padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}
