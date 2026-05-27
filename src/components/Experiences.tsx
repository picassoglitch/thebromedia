"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, MotionValue } from "framer-motion";
import AnimateOnScroll from "./AnimateOnScroll";
import { SplitText, useCursorParallax, useReducedMotion } from "./fx/effects";
import type { ExperiencesContent, ExperienceItem } from "@/types/content";
import { Wifi, Gamepad2, Zap, Globe } from "lucide-react";

interface ExperiencesProps { experiences: ExperiencesContent }

const iconMap: Record<string, React.ElementType> = {
  wifi: Wifi, gamepad: Gamepad2, zap: Zap, globe: Globe,
};

/**
 * Pinned cinematic reveal. The section spans 3× viewport height. As the user
 * scrolls through it, three cards take focus one at a time — active card
 * scales up + lifts in 3D, inactive cards dim and recede. The whole section
 * stays pinned so the user feels they're moving through a depth scene.
 */
function ExperiencesPinned({ experiences }: ExperiencesProps) {
  const items = experiences.items.slice(0, 3); // pin choreography assumes 3
  const ref = useRef<HTMLElement>(null);

  // 3 stages * 1 viewport height = ~3× section length
  const SECTION_VH = items.length;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Motion value drifts 0 → items.length as user scrolls through the pin.
  const idxMV = useTransform(scrollYProgress, [0, 1], [0, items.length]);

  // Single source of truth: exactly ONE card is active at any moment.
  const [activeIdx, setActiveIdx] = useState(0);
  useMotionValueEvent(idxMV, "change", (v) => {
    const next = Math.max(0, Math.min(items.length - 1, Math.floor(v)));
    setActiveIdx((cur) => (cur === next ? cur : next));
  });

  // Cursor parallax on the whole scene
  const { x: cx, y: cy } = useCursorParallax(28);

  // Watermark + accent parallax driven by section scroll
  const wmY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const lineW = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const activeItem = items[activeIdx];

  return (
    <section
      ref={ref}
      id="experiencias"
      className="relative bg-[#080808]"
      style={{ height: `${SECTION_VH * 100}vh` }}
    >
      {/* Sticky stage — fills the viewport while the section scrolls past */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Watermark layer with cursor parallax */}
        <motion.div
          style={{ y: wmY, x: useTransform(cx, (v) => v * 1.2) }}
          className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden"
        >
          <span
            className="text-[18vw] font-black leading-none pr-4"
            style={{ color: "rgba(255,255,255,0.022)" }}
          >
            EXP.
          </span>
        </motion.div>

        {/* Soft accent glow tracking the cursor */}
        <motion.div
          style={{ x: useTransform(cx, (v) => v * 2), y: useTransform(cy, (v) => v * 2) }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div
            className="w-[800px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(232,92,0,0.06) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </motion.div>

        {/* Top accent line, drawn as user scrolls section */}
        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
          <motion.div
            style={{ width: lineW }}
            className="h-full bg-gradient-to-r from-transparent via-brand-accent to-transparent"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto h-full px-6 lg:px-8 flex flex-col">

          {/* Header — pinned at top of viewport */}
          <div className="pt-28 lg:pt-36">
            <AnimateOnScroll direction="right">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-12 h-px bg-brand-accent" />
                <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">
                  {experiences.label}
                </span>
              </div>
            </AnimateOnScroll>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[0.95] tracking-tight">
              <SplitText text="Our" className="inline-block" />
              <span>&nbsp;</span>
              <SplitText text="fullfilled" className="inline-block text-brand-accent italic" delay={0.15} />
              <br />
              <SplitText text="experiences" className="inline-block" delay={0.4} />
            </h2>
          </div>

          {/* Stage — ONE card at a time. AnimatePresence mode="wait" ensures
              the outgoing card completes its exit before the next enters so
              we never render two stacked simultaneously. */}
          <div className="relative flex-1 flex items-center justify-center" style={{ perspective: 1400 }}>
            <div className="relative w-full max-w-3xl">
              <AnimatePresence mode="wait" initial={false}>
                <PinCard
                  key={activeIdx}
                  item={activeItem}
                  index={activeIdx}
                  total={items.length}
                  cursorX={cx}
                  cursorY={cy}
                />
              </AnimatePresence>
            </div>
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

// ─── PinCard ────────────────────────────────────────────────────────────
// The currently active card. Mounts on slide change via AnimatePresence —
// enters from below + z-back, exits to above + z-back. Transition total
// stays under 400ms (exit 0.18 + enter 0.22).
function PinCard({
  item,
  index,
  total,
  cursorX,
  cursorY,
}: {
  item: ExperienceItem;
  index: number;
  total: number;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
}) {
  const Icon = iconMap[item.icon] || Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, z: -180, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, z: 60, scale: 1.02 }}
      exit={{ opacity: 0, y: -40, z: -180, scale: 0.94 }}
      transition={{
        opacity: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
        y:       { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
        z:       { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
        scale:   { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
        exit:    { duration: 0.18, ease: [0.7, 0, 0.84, 0] },
      }}
      style={{
        x: useTransform(cursorX, (v) => v * 0.4),
        rotateX: useTransform(cursorY, (v) => v * -0.4),
        rotateY: useTransform(cursorX, (v) => v * 0.4),
        transformStyle: "preserve-3d",
      }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div
        className="relative w-full bg-[#0a0a0a] border border-white/[0.08] p-10 lg:p-14 overflow-hidden"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(232,92,0,0.12)" }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-accent" />

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-brand-accent text-[10px] font-bold uppercase tracking-[0.45em]">
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

        {/* Big index number watermark */}
        <div
          className="absolute -top-4 right-6 text-[140px] lg:text-[200px] font-black leading-none select-none pointer-events-none"
          style={{ color: "rgba(232,92,0,0.06)" }}
        >
          0{index + 1}
        </div>

        {/* Icon */}
        <div className="inline-flex w-16 h-16 items-center justify-center border border-brand-accent/40 mb-8 bg-brand-accent/5">
          <Icon size={26} className="text-brand-accent" />
        </div>

        <h3 className="text-white font-black text-2xl lg:text-3xl xl:text-4xl leading-tight mb-5 uppercase tracking-wide max-w-2xl">
          {item.title}
        </h3>
        <p className="text-white/55 text-base lg:text-lg leading-relaxed max-w-2xl">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Public component — picks pinned vs simple based on viewport / a11y ─
export default function Experiences({ experiences }: ExperiencesProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <ExperiencesSimple
        items={experiences.items.slice(0, 3)}
        label={experiences.label}
      />
    );
  }
  return <ExperiencesPinned experiences={experiences} />;
}

// ─── Mobile / reduced-motion fallback ───────────────────────────────────
function ExperiencesSimple({ items, label }: { items: ExperienceItem[]; label: string }) {
  return (
    <section id="experiencias" className="relative py-24 bg-[#080808] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-brand-accent" />
            <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{label}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight">
            Our <em className="text-brand-accent not-italic">fullfilled</em><br />experiences
          </h2>
        </div>
        <div className="space-y-px bg-white/[0.04]">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] || Zap;
            return (
              <div key={i} className="bg-[#0a0a0a] p-7">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-brand-accent text-[10px] font-bold uppercase tracking-[0.45em]">
                    {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="inline-flex w-12 h-12 items-center justify-center border border-brand-accent/40 mb-4 bg-brand-accent/5">
                  <Icon size={20} className="text-brand-accent" />
                </div>
                <h3 className="text-white font-black text-lg leading-tight mb-3 uppercase tracking-wide">{item.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

