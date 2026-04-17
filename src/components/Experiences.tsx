"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimateOnScroll, { StaggerContainer, staggerItem } from "./AnimateOnScroll";
import type { ExperiencesContent } from "@/types/content";
import { Wifi, Gamepad2, Zap, Globe } from "lucide-react";

interface ExperiencesProps { experiences: ExperiencesContent }

const iconMap: Record<string, React.ElementType> = {
  wifi: Wifi, gamepad: Gamepad2, zap: Zap, globe: Globe,
};

export default function Experiences({ experiences }: ExperiencesProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY    = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const lineW  = useTransform(scrollYProgress, [0.1, 0.55], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative py-28 lg:py-44 bg-[#080808] overflow-hidden">

      {/* Watermark */}
      <motion.div style={{ y: bgY }}
        className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden">
        <span className="text-[17vw] font-black leading-none pr-4"
          style={{ color: "rgba(255,255,255,0.016)" }}>EXP.</span>
      </motion.div>

      {/* Animated accent top line */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <motion.div style={{ width: lineW }} className="h-full bg-gradient-to-r from-transparent via-brand-accent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <AnimateOnScroll direction="right">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-brand-accent" />
              <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{experiences.label}</span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.05}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-none tracking-tight">
              Our <em className="text-brand-accent not-italic">fullfilled</em>
              <br />experiences
            </h2>
          </AnimateOnScroll>
        </div>

        {/* Cards */}
        <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
          {experiences.items.map((item, i) => {
            const Icon = iconMap[item.icon] || Zap;
            return (
              <motion.div
                key={i}
                variants={staggerItem("up", 60)}
                whileHover={{ backgroundColor: "rgba(16,16,16,1)" }}
                className="relative bg-[#0a0a0a] p-8 lg:p-12 group overflow-hidden cursor-default"
              >
                {/* Top accent */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.35 }}
                  className="absolute top-0 left-0 right-0 h-0.5 bg-brand-accent origin-left"
                />

                {/* Glow on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(232,92,0,0.06) 0%, transparent 70%)" }}
                />

                {/* Big index */}
                <div className="text-[80px] lg:text-[100px] font-black leading-none select-none mb-4"
                  style={{ color: "rgba(255,255,255,0.03)" }}>
                  0{i + 1}
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="inline-flex w-13 h-13 w-[52px] h-[52px] items-center justify-center border border-white/10 group-hover:border-brand-accent/40 mb-6 transition-colors duration-300"
                >
                  <Icon size={22} className="text-brand-accent" />
                </motion.div>

                <h3 className="text-white font-black text-lg lg:text-xl leading-tight mb-4 uppercase tracking-wide group-hover:text-brand-accent transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-white/30 text-sm leading-relaxed group-hover:text-white/55 transition-colors duration-400">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </StaggerContainer>

        {/* Tag row */}
        <AnimateOnScroll direction="up" delay={0.25}>
          <div className="mt-16 flex flex-wrap gap-3 lg:gap-6">
            {["Eventos", "Activaciones", "Streaming", "Convenciones", "Festivales", "BTL"].map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ color: "rgb(232,92,0)" }}
                className="text-white/20 text-xs font-bold uppercase tracking-[0.35em] cursor-default transition-colors duration-200"
              >
                {t}{i < 5 && <span className="ml-3 lg:ml-6 text-white/10">·</span>}
              </motion.span>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
