"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, MotionValue } from "framer-motion";
import AnimateOnScroll from "./AnimateOnScroll";
import { SplitText, useCursorParallax, useReducedMotion } from "./fx/effects";
import type { StatsContent, StatItem } from "@/types/content";

interface StatsProps { stats: StatsContent }

/**
 * CountUp: animates from 0 to the numeric body of `value`.
 * Re-runs whenever `value` changes (which it does on every slide change
 * because the slide is keyed and remounts), so no lingering counter from
 * a previous slide.
 */
function CountUp({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const m = value.match(/^([+]?)([\d.]+)([KkMm]?)([+]?)$/);
    if (!m) { setDisplay(value); return; }

    const pre = m[1], num = parseFloat(m[2]), suf = m[3], plus = m[4];
    const steps = 60, dur = 1600, inc = num / steps;
    let cur = 0, s = 0;
    setDisplay(`${pre}0${suf}${plus}`);
    const t = setInterval(() => {
      s++; cur = Math.min(cur + inc, num);
      const fmt = Number.isInteger(num) ? String(Math.round(cur)) : cur.toFixed(1);
      setDisplay(`${pre}${fmt}${suf}${plus}`);
      if (s >= steps) { setDisplay(value); clearInterval(t); }
    }, dur / steps);
    return () => clearInterval(t);
  }, [value]);

  return <>{display}</>;
}

/**
 * Pinned cinematic stats. Section spans `items.length × 100vh`. As the user
 * scrolls, exactly ONE slide is active at any moment. The previous slide
 * exits before the next enters (AnimatePresence mode="wait"), with a total
 * transition under 400ms so the handoff never reads as "ghosting".
 */
export default function Stats({ stats }: StatsProps) {
  const reduced = useReducedMotion();
  if (reduced) return <StatsSimple stats={stats} />;
  return <StatsPinned stats={stats} />;
}

function StatsPinned({ stats }: StatsProps) {
  const items = stats.items;
  const ref   = useRef<HTMLElement>(null);
  const SECTION_VH = items.length;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Motion-value drifts 0 → items.length as user scrolls through the pin.
  const idxMV = useTransform(scrollYProgress, [0, 1], [0, items.length]);

  // Single source of truth — exactly one slide is active at a time.
  const [activeIdx, setActiveIdx] = useState(0);
  useMotionValueEvent(idxMV, "change", (v) => {
    const next = Math.max(0, Math.min(items.length - 1, Math.floor(v)));
    setActiveIdx((cur) => (cur === next ? cur : next));
  });

  // Cursor parallax — applies to the active slide
  const { x: cx, y: cy } = useCursorParallax(26);

  // Background glow — scroll pulse stays
  const glowOp = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4]);
  const glowSc = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.15, 0.85]);

  const activeItem = items[activeIdx];

  return (
    <section
      ref={ref}
      id="logros"
      className="relative bg-[#0a0a0a]"
      style={{ height: `${SECTION_VH * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Center glow — scroll pulse + cursor parallax */}
        <motion.div
          style={{ opacity: glowOp, scale: glowSc }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            style={{
              x: cx,
              y: cy,
              background: "radial-gradient(ellipse, rgba(232,92,0,0.1) 0%, transparent 65%)",
              filter: "blur(60px)",
            }}
            className="w-[1100px] h-[600px] rounded-full"
          />
        </motion.div>

        {/* Top marquee */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none border-b border-white/[0.04]">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap py-2.5"
          >
            {Array(10).fill(null).map((_, i) => (
              <span
                key={i}
                className="text-[10px] font-black uppercase tracking-[0.6em] mr-14"
                style={{ color: "rgba(255,255,255,0.035)" }}
              >
                NUESTROS LOGROS ✦
              </span>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto h-full px-6 lg:px-8 flex flex-col">

          {/* Header — pinned at top */}
          <div className="pt-28 lg:pt-36">
            <AnimateOnScroll direction="up">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-px bg-brand-accent" />
                <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">
                  {stats.label}
                </span>
              </div>
            </AnimateOnScroll>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[0.95] tracking-tight max-w-4xl">
              <SplitText text={stats.title} staggerChar={0.025} />
            </h2>
          </div>

          {/* Spotlight — exactly ONE slide at any moment. mode="wait" makes
              the outgoing slide finish its exit before the new one enters,
              so the user never sees two big numbers or two captions stacked. */}
          <div className="relative flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <Slide
                key={activeIdx}
                item={activeItem}
                index={activeIdx}
                total={items.length}
                cursorX={cx}
                cursorY={cy}
              />
            </AnimatePresence>
          </div>

          {/* Pagination — single source of truth, only ONE active dot */}
          <div className="pb-10 flex items-center justify-center gap-3">
            {items.map((_, i) => {
              const on = i === activeIdx;
              return (
                <span
                  key={i}
                  aria-current={on ? "true" : undefined}
                  className="block h-px transition-all duration-300 ease-out"
                  style={{
                    width: on ? 44 : 24,
                    backgroundColor: on ? "#E85C00" : "rgba(255,255,255,0.18)",
                    opacity: on ? 1 : 0.5,
                    boxShadow: on ? "0 0 10px rgba(232,92,0,0.55)" : "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Slide ──────────────────────────────────────────────────────────────
// One slide. Mounts/unmounts via AnimatePresence — short, clean handoff.
// Total transition (exit 0.15s + enter 0.22s) sits under 400ms.
function Slide({
  item,
  index,
  total,
  cursorX,
  cursorY,
}: {
  item: StatItem;
  index: number;
  total: number;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{
        opacity: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
        y:       { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
        scale:   { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
        exit: { duration: 0.15, ease: [0.7, 0, 0.84, 0] },
      }}
      style={{
        x: useTransform(cursorX, (v) => v * 0.5),
        rotateX: useTransform(cursorY, (v) => v * -0.25),
        rotateY: useTransform(cursorX, (v) => v * 0.25),
        transformStyle: "preserve-3d",
        perspective: 1400,
      }}
      className="flex flex-col items-center justify-center text-center w-full max-w-5xl"
    >
      {/* Step counter — one per active slide */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-brand-accent text-[10px] font-bold uppercase tracking-[0.45em] tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`block h-px w-6 ${i === index ? "bg-brand-accent" : "bg-white/15"}`}
            />
          ))}
        </div>
      </div>

      {/* Big number — CountUp resets on every slide because Slide is keyed */}
      <div className="flex items-end gap-3 justify-center mb-6">
        <div
          className="text-[18vw] sm:text-[14vw] lg:text-[12vw] xl:text-[180px] font-black text-brand-accent leading-[0.85] tabular-nums"
          style={{ textShadow: "0 0 60px rgba(232,92,0,0.4)" }}
        >
          <CountUp value={item.value} />
        </div>
        {item.unit && (
          <div className="text-3xl lg:text-5xl text-brand-accent/40 font-bold tabular-nums leading-none mb-4 lg:mb-6">
            {item.unit}
          </div>
        )}
      </div>

      {/* Label — single line per active slide */}
      <p className="text-white/70 text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed font-light">
        {item.label}
      </p>
    </motion.div>
  );
}

// ─── Mobile / reduced-motion fallback ───────────────────────────────────
function StatsSimple({ stats }: { stats: StatsContent }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <section ref={ref} id="logros" className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-brand-accent" />
            <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{stats.label}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight">
            {stats.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.04]">
          {stats.items.map((s, i) => (
            <div key={i} className="bg-[#0a0a0a] p-7 text-center">
              <div className="text-5xl font-black text-brand-accent leading-none mb-2 tabular-nums"
                style={{ textShadow: "0 0 30px rgba(232,92,0,0.3)" }}>
                {s.value}
                {s.unit && <span className="text-2xl text-brand-accent/40 ml-1">{s.unit}</span>}
              </div>
              <p className="text-white/55 text-sm leading-relaxed mt-3">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
