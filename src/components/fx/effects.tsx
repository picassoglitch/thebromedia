"use client";

import { useEffect, useRef, useState, useCallback, RefObject } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll, MotionValue } from "framer-motion";

// ─── useCursorParallax ───────────────────────────────────────────────────
// Returns motion springs that track the cursor position (normalized to
// viewport center). Multiply by depth offsets to get a parallax effect.
export function useCursorParallax(strength: number = 20) {
  const x = useSpring(0, { stiffness: 60, damping: 18 });
  const y = useSpring(0, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * strength;
      const dy = (e.clientY / window.innerHeight - 0.5) * strength;
      x.set(dx);
      y.set(dy);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [strength, x, y]);

  return { x, y };
}

// ─── useReducedMotion ────────────────────────────────────────────────────
// Returns true if the user has prefers-reduced-motion enabled OR if the
// viewport is narrow (mobile-class). Used to disable pinning, big tilts,
// heavy parallax that would feel heavy or break on small screens.
export function useReducedMotion(mobileBelow: number = 768) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => setReduced(mq.matches || window.innerWidth < mobileBelow);
    check();
    mq.addEventListener("change", check);
    window.addEventListener("resize", check);
    return () => {
      mq.removeEventListener("change", check);
      window.removeEventListener("resize", check);
    };
  }, [mobileBelow]);

  return reduced;
}

// ─── useScrollScale ──────────────────────────────────────────────────────
// Returns a scale that grows from `from` (entering viewport) → 1 (centered)
// → `to` (exiting). Used on big headlines for a cinematic breathing effect.
export function useScrollScale<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { from = 0.92, to = 0.95 }: { from?: number; to?: number } = {}
) {
  const { scrollYProgress } = useScroll({
    target: ref as RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [from, 1, to]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4]);
  return { scale, opacity, progress: scrollYProgress };
}

// ─── TiltCard ────────────────────────────────────────────────────────────
// Wraps children in a div that tilts in 3D as the cursor moves over it.
// Lightweight, single-element transform — no GPU shaders, just CSS.
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** max tilt angle in degrees (default 10) */
  max?: number;
  /** scale on hover (default 1) */
  scale?: number;
  /** glare overlay on hover (default true) */
  glare?: boolean;
}

export function TiltCard({
  children,
  className = "",
  max = 10,
  scale = 1,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const scl = useMotionValue(1);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOp = useMotionValue(0);

  const srotX = useSpring(rotX, { stiffness: 220, damping: 22 });
  const srotY = useSpring(rotY, { stiffness: 220, damping: 22 });
  const sscl = useSpring(scl, { stiffness: 220, damping: 22 });

  const handle = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;   // 0 – 1
      const y = (e.clientY - r.top) / r.height;   // 0 – 1
      rotY.set((x - 0.5) * 2 * max);              // left/right tilt
      rotX.set(-(y - 0.5) * 2 * max);             // up/down tilt
      scl.set(scale);
      glareX.set(x * 100);
      glareY.set(y * 100);
      glareOp.set(1);
    },
    [max, scale, rotX, rotY, scl, glareX, glareY, glareOp]
  );

  const reset = useCallback(() => {
    rotX.set(0); rotY.set(0); scl.set(1); glareOp.set(0);
  }, [rotX, rotY, scl, glareOp]);

  return (
    <motion.div
      ref={ref}
      onPointerMove={handle}
      onPointerLeave={reset}
      style={{
        rotateX: srotX,
        rotateY: srotY,
        scale: sscl,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            opacity: useTransform(glareOp, (v) => v * 0.25),
            background: useTransform(
              [glareX, glareY] as unknown as MotionValue<number>,
              (latest) => {
                const [x, y] = latest as unknown as [number, number];
                return `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.5) 0%, transparent 45%)`;
              }
            ),
          }}
        />
      )}
    </motion.div>
  );
}

// ─── MagneticButton ──────────────────────────────────────────────────────
// Element attracts toward the cursor when it's nearby. Use for CTAs.
interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** max translation in px (default 14) */
  strength?: number;
  /** activation radius in px (default 100) */
  radius?: number;
  /** rendered element tag (default div) */
  as?: "div" | "a" | "button";
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

export function MagneticButton({
  children,
  className = "",
  strength = 14,
  radius = 100,
  as = "div",
  href,
  onClick,
  target,
  rel,
}: MagneticProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 18 });
  const y = useSpring(0, { stiffness: 200, damping: 18 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const k = (1 - dist / radius) * strength;
        x.set((dx / radius) * k * 3);
        y.set((dy / radius) * k * 3);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    const reset = () => { x.set(0); y.set(0); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("pointerleave", reset);
    };
  }, [strength, radius, x, y]);

  const style = { x, y };
  const cls = `inline-block ${className}`;

  if (as === "a") {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        style={style}
        className={cls}
      >
        {children}
      </motion.a>
    );
  }
  if (as === "button") {
    return (
      <motion.button
        ref={ref as React.RefObject<HTMLButtonElement>}
        onClick={onClick}
        style={style}
        className={cls}
      >
        {children}
      </motion.button>
    );
  }
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      onClick={onClick}
      style={style}
      className={cls}
    >
      {children}
    </motion.div>
  );
}

// ─── SplitText ───────────────────────────────────────────────────────────
// Character-by-character entrance reveal, lazy-triggered when in view.
interface SplitTextProps {
  text: string;
  className?: string;
  /** delay before first char animates (s) */
  delay?: number;
  /** delay between consecutive chars (s) */
  staggerChar?: number;
  /** start hidden / visible — overrides intersection behavior */
  trigger?: "viewport" | "mount";
}

export function SplitText({
  text,
  className = "",
  delay = 0,
  staggerChar = 0.04,
  trigger = "viewport",
}: SplitTextProps) {
  const variants = {
    hidden: { opacity: 0, y: "0.6em" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: delay + i * staggerChar, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  const isViewport = trigger === "viewport";

  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, wi, words) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((ch, ci) => (
            <motion.span
              key={ci}
              custom={wi * 8 + ci}
              variants={variants}
              initial="hidden"
              {...(isViewport
                ? { whileInView: "visible", viewport: { once: false, amount: 0.2 } }
                : { animate: "visible" })}
              aria-hidden
              className="inline-block"
              style={{ willChange: "transform, opacity" }}
            >
              {ch}
            </motion.span>
          ))}
          {wi < words.length - 1 && <span aria-hidden>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
