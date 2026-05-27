"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Replaces the OS cursor with a brand-orange dot that morphs into a ring
 * when hovering interactive elements (a, button, input, [data-cursor=hover]).
 *
 * Uses `mix-blend-mode: difference` so the cursor reads against any bg
 * (dark sections + bright accents).
 *
 * On touch devices it stays hidden and the native cursor is unaffected.
 */
export default function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 50, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 600, damping: 50, mass: 0.4 });

  const ringX = useSpring(x, { stiffness: 180, damping: 22 });
  const ringY = useSpring(y, { stiffness: 180, damping: 22 });

  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);
  const [touch, setTouch] = useState(false);
  const lastMove = useRef(0);

  useEffect(() => {
    // Detect touch / coarse pointer — skip the custom cursor on phones/tablets
    if (window.matchMedia("(pointer: coarse)").matches) {
      setTouch(true);
      return;
    }

    const HOVER_SEL = "a, button, input, textarea, label, [data-cursor='hover'], [role='button']";

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
      lastMove.current = performance.now();
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      setHover(!!t.closest(HOVER_SEL));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y, visible]);

  if (touch) return null;

  return (
    <>
      {/* Hide the OS cursor across the entire app while this is mounted */}
      <style jsx global>{`
        html, body, * { cursor: none !important; }
        /* Re-enable inside iframes (we don't control their internals) */
        iframe { cursor: auto !important; }
      `}</style>

      {/* Outer ring — lags behind, expands on hover */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[200] will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          opacity: visible ? 1 : 0,
          mixBlendMode: "difference",
        }}
      >
        <motion.div
          animate={{
            width: hover ? 56 : 32,
            height: hover ? 56 : 32,
            borderColor: hover ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
            borderWidth: hover ? 1.5 : 1,
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-full border -translate-x-1/2 -translate-y-1/2"
        />
      </motion.div>

      {/* Inner dot — snappy, follows tightly */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[201] will-change-transform"
        style={{
          x: sx,
          y: sy,
          opacity: visible ? 1 : 0,
        }}
      >
        <motion.div
          animate={{
            width: hover ? 4 : 6,
            height: hover ? 4 : 6,
            opacity: hover ? 0.7 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-full bg-[#E85C00] -translate-x-1/2 -translate-y-1/2"
          style={{ boxShadow: "0 0 12px rgba(232,92,0,0.7)" }}
        />
      </motion.div>
    </>
  );
}
