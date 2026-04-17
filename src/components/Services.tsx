"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimateOnScroll, { StaggerContainer, staggerItem } from "./AnimateOnScroll";
import type { ServicesContent } from "@/types/content";
import { Cpu, BarChart2, Wifi, Brain, MapPin, Globe, Zap, Shield } from "lucide-react";

interface ServicesProps { services: ServicesContent }
const iconMap: Record<string, React.ElementType> = {
  cpu: Cpu, "bar-chart": BarChart2, wifi: Wifi, brain: Brain,
  "map-pin": MapPin, globe: Globe, zap: Zap, shield: Shield,
};

export default function Services({ services }: ServicesProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const blobX = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section ref={ref} id="servicios" className="relative py-28 lg:py-44 bg-[#080808] overflow-hidden">

      {/* Drifting blob */}
      <motion.div style={{ x: blobX }}
        className="absolute top-1/4 -right-40 w-[600px] h-[600px] pointer-events-none">
        <div className="w-full h-full rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232,92,0,0.055) 0%, transparent 65%)", filter: "blur(80px)" }} />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Headline */}
        <div className="mb-16 lg:mb-24">
          <AnimateOnScroll direction="right">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-brand-accent" />
              <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{services.label}</span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.05}>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-none tracking-tight">
              NEED TECH
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.09}>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-brand-accent leading-none tracking-tight mb-6"
              style={{ textShadow: "0 0 60px rgba(232,92,0,0.2)" }}>
              TRENDING IDEAS?
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.14}>
            <p className="text-white/35 text-base lg:text-lg max-w-xl leading-relaxed">{services.subtitle}</p>
          </AnimateOnScroll>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Bullet list */}
          <div className="lg:col-span-5">
            <AnimateOnScroll direction="right" delay={0.05}>
              <div className="border-l-2 border-brand-accent pl-5 mb-10">
                <h3 className="text-white font-black text-xl lg:text-2xl uppercase tracking-wide">
                  The Tech Bro
                </h3>
              </div>
            </AnimateOnScroll>
            <StaggerContainer staggerDelay={0.08} className="space-y-0">
              {services.items.map((item, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem("right")}
                  whileHover={{ x: 8, color: "rgba(255,255,255,0.9)" }}
                  className="flex items-start gap-3 py-4 border-b border-white/[0.06] group cursor-default"
                >
                  <span className="text-brand-accent mt-1 shrink-0 text-base">·</span>
                  <div>
                    <div className="text-white/60 font-semibold text-sm group-hover:text-brand-accent transition-colors duration-200 mb-0.5">
                      {item.title}
                    </div>
                    <div className="text-white/25 text-xs leading-relaxed">{item.description}</div>
                  </div>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>

          {/* Cards grid */}
          <div className="lg:col-span-7">
            <StaggerContainer staggerDelay={0.07} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.items.map((item, i) => {
                const Icon = iconMap[item.icon] || Zap;
                return (
                  <motion.div
                    key={i}
                    variants={staggerItem("up", 45)}
                    whileHover={{ y: -6, borderColor: "rgba(232,92,0,0.3)" }}
                    className="glass border border-white/[0.06] p-6 group cursor-default relative overflow-hidden transition-all duration-350"
                  >
                    <motion.div
                      initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-0 left-0 right-0 h-0.5 bg-brand-accent origin-left"
                    />
                    <motion.div
                      initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.35 }}
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(232,92,0,0.06) 0%, transparent 60%)" }}
                    />
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.15 }}
                      className="inline-flex w-10 h-10 items-center justify-center border border-white/10 group-hover:border-brand-accent/40 mb-4 transition-colors duration-300"
                    >
                      <Icon size={18} className="text-brand-accent" />
                    </motion.div>
                    <h4 className="text-white/70 font-bold text-sm leading-snug mb-2 group-hover:text-brand-accent transition-colors duration-200">
                      {item.title}
                    </h4>
                    <p className="text-white/25 text-xs leading-relaxed group-hover:text-white/45 transition-colors duration-300">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
