"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import AnimateOnScroll from "./AnimateOnScroll";
import type { StatsContent } from "@/types/content";

interface StatsProps { stats: StatsContent }

function CountUp({ value, inView }: { value: string; inView: boolean }) {
  const [display, setDisplay] = useState("0");
  const started = useRef(false);

  useEffect(() => {
    if (!inView) { started.current = false; setDisplay("0"); return; }
    if (started.current) return;
    started.current = true;

    const m = value.match(/^([+]?)([\d.]+)([KkMm]?)([+]?)$/);
    if (!m) { setDisplay(value); return; }

    const pre = m[1], num = parseFloat(m[2]), suf = m[3], plus = m[4];
    const steps = 70, dur = 2400, inc = num / steps;
    let cur = 0, s = 0;
    const t = setInterval(() => {
      s++; cur = Math.min(cur + inc, num);
      const fmt = Number.isInteger(num) ? String(Math.round(cur)) : cur.toFixed(1);
      setDisplay(`${pre}${fmt}${suf}${plus}`);
      if (s >= steps) { setDisplay(value); clearInterval(t); }
    }, dur / steps);
    return () => clearInterval(t);
  }, [inView, value]);

  return <>{display}</>;
}

export default function Stats({ stats }: StatsProps) {
  const ref      = useRef<HTMLElement>(null);
  const countRef = useRef(null);
  const inView   = useInView(countRef, { once: false, margin: "-100px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glowOp = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const glowSc = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.05, 0.9]);

  return (
    <section ref={ref} id="logros" className="relative py-28 lg:py-44 overflow-hidden bg-[#0a0a0a]">

      {/* Centre glow */}
      <motion.div style={{ opacity: glowOp, scale: glowSc }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[900px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(232,92,0,0.07) 0%, transparent 65%)", filter: "blur(50px)" }} />
      </motion.div>

      {/* Marquee */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none border-b border-white/[0.04]">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap py-2.5">
          {Array(10).fill(null).map((_, i) => (
            <span key={i} className="text-[10px] font-black uppercase tracking-[0.6em] mr-14"
              style={{ color: "rgba(255,255,255,0.03)" }}>NUESTROS LOGROS ✦</span>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        <AnimateOnScroll direction="up" className="mb-16 lg:mb-24">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-brand-accent" />
            <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{stats.label}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
            {stats.title}
          </h2>
        </AnimateOnScroll>

        <div ref={countRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
          {stats.items.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.75, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ backgroundColor: "rgba(16,16,16,1)" }}
              className="relative bg-[#0a0a0a] p-8 lg:p-12 group overflow-hidden"
            >
              {/* Top line on hover */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.35 }}
                className="absolute top-0 left-0 right-0 h-0.5 bg-brand-accent origin-left"
              />

              {/* Glow */}
              <motion.div
                initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.4 }}
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(232,92,0,0.07) 0%, transparent 65%)" }}
              />

              {/* Value */}
              <div className="text-5xl lg:text-6xl xl:text-7xl font-black text-brand-accent leading-none mb-2 tabular-nums"
                style={{ textShadow: "0 0 40px rgba(232,92,0,0.2)" }}>
                <CountUp value={stat.value} inView={inView} />
              </div>
              {stat.unit && (
                <div className="text-brand-accent/40 text-base font-bold mb-4 tabular-nums">{stat.unit}</div>
              )}
              <p className="text-white/30 text-sm leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                {stat.label}
              </p>

              {/* Bottom divider */}
              <motion.div
                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 1.2, delay: 0.3 + i * 0.1 }}
                className="mt-8 h-px bg-white/[0.06] origin-left"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
