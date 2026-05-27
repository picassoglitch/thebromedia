"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimateOnScroll, { StaggerContainer, staggerItem } from "./AnimateOnScroll";
import { TiltCard, SplitText, useCursorParallax, useScrollScale } from "./fx/effects";
import type { ServicesContent } from "@/types/content";
import { Cpu, BarChart2, Wifi, Brain, MapPin, Globe, Zap, Shield } from "lucide-react";

interface ServicesProps { services: ServicesContent }
const iconMap: Record<string, React.ElementType> = {
  cpu: Cpu, "bar-chart": BarChart2, wifi: Wifi, brain: Brain,
  "map-pin": MapPin, globe: Globe, zap: Zap, shield: Shield,
};

export default function Services({ services }: ServicesProps) {
  const ref = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const blobX = useTransform(scrollYProgress, [0, 1], ["-25%", "25%"]);
  const blobY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  const { x: cx, y: cy } = useCursorParallax(30);
  const { scale: hScale } = useScrollScale(headlineRef);

  // Bullet list ↔ card grid sync. Whichever card is closest to the viewport
  // center sets the active bullet. Driven by IntersectionObserver so it's
  // free of scroll handlers and stays smooth.
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const root = cardsRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card-idx]"));
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry with the highest intersection ratio that's in view
        let best: IntersectionObserverEntry | null = null;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        });
        if (best) {
          const idx = parseInt((best as IntersectionObserverEntry).target.getAttribute("data-card-idx") || "0", 10);
          setActiveIdx(idx);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0.1, 0.5, 1] }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id="servicios" className="relative py-32 lg:py-48 bg-[#080808] overflow-hidden">

      {/* Drifting blob — parallax both axes + cursor parallax */}
      <motion.div style={{ x: blobX, y: blobY }}
        className="absolute top-1/4 -right-40 w-[700px] h-[700px] pointer-events-none">
        <motion.div
          style={{
            x: cx,
            y: cy,
            background: "radial-gradient(circle, rgba(232,92,0,0.07) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
          className="w-full h-full rounded-full"
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Headline */}
        <motion.div
          ref={headlineRef}
          style={{ scale: hScale, transformOrigin: "left center" }}
          className="mb-16 lg:mb-24 will-change-transform"
        >
          <AnimateOnScroll direction="right">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-px bg-brand-accent" />
              <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{services.label}</span>
            </div>
          </AnimateOnScroll>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.95] tracking-tight">
            <SplitText text="NEED TECH" className="block" />
          </h2>
          <h2
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-brand-accent leading-[0.95] tracking-tight mb-8"
            style={{ textShadow: "0 0 60px rgba(232,92,0,0.25)" }}
          >
            <SplitText text="TRENDING IDEAS?" className="block" delay={0.3} />
          </h2>
          <AnimateOnScroll direction="up" delay={0.14}>
            <p className="text-white/40 text-base lg:text-lg max-w-xl leading-relaxed">{services.subtitle}</p>
          </AnimateOnScroll>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Bullet list — sticky on desktop, scrolls inside its column */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 self-start">
            <AnimateOnScroll direction="right" delay={0.05}>
              <div className="border-l-2 border-brand-accent pl-5 mb-10">
                <h3 className="text-white font-black text-xl lg:text-2xl uppercase tracking-wide">
                  The Tech Bro
                </h3>
                <div className="mt-2 text-brand-accent text-[10px] font-bold uppercase tracking-[0.45em] tabular-nums">
                  {String(activeIdx + 1).padStart(2, "0")} / {String(services.items.length).padStart(2, "0")}
                </div>
              </div>
            </AnimateOnScroll>
            <StaggerContainer staggerDelay={0.08} className="space-y-0">
              {services.items.map((item, i) => {
                const isActive = i === activeIdx;
                return (
                  <motion.a
                    key={i}
                    href={`#service-${i}`}
                    variants={staggerItem("right")}
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-3 py-4 border-b border-white/[0.06] group cursor-pointer transition-colors duration-300"
                    data-cursor="hover"
                  >
                    <motion.span
                      animate={{
                        scale: isActive ? 1.6 : 1,
                        color: isActive ? "#E85C00" : "rgba(232,92,0,0.6)",
                      }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-1 shrink-0 text-base origin-left"
                    >
                      ·
                    </motion.span>
                    <div>
                      <motion.div
                        animate={{
                          color: isActive ? "#E85C00" : "rgba(255,255,255,0.65)",
                        }}
                        transition={{ duration: 0.25 }}
                        className="font-semibold text-sm mb-0.5"
                      >
                        {item.title}
                      </motion.div>
                      <motion.div
                        animate={{
                          color: isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                        }}
                        transition={{ duration: 0.25 }}
                        className="text-xs leading-relaxed"
                      >
                        {item.description}
                      </motion.div>
                    </div>
                  </motion.a>
                );
              })}
            </StaggerContainer>
          </div>

          {/* Cards grid — 3D tilt + observed by the sticky list */}
          <div ref={cardsRef} className="lg:col-span-7">
            <StaggerContainer staggerDelay={0.07} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.items.map((item, i) => {
                const Icon = iconMap[item.icon] || Zap;
                return (
                  <motion.div key={i} variants={staggerItem("up", 45)} id={`service-${i}`} data-card-idx={i}>
                    <TiltCard max={9} className="glass border border-white/[0.06] h-full transition-colors duration-300 hover:border-[rgba(232,92,0,0.3)]">
                      <div className="relative p-6 group cursor-default overflow-hidden h-full">
                        <motion.div
                          initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-0 left-0 right-0 h-0.5 bg-brand-accent origin-left"
                        />
                        <motion.div
                          initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.35 }}
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(232,92,0,0.07) 0%, transparent 60%)" }}
                        />
                        <motion.div
                          whileHover={{ rotate: 12, scale: 1.15 }}
                          className="inline-flex w-10 h-10 items-center justify-center border border-white/10 group-hover:border-brand-accent/40 mb-4 transition-colors duration-300"
                          style={{ transform: "translateZ(25px)" }}
                        >
                          <Icon size={18} className="text-brand-accent" />
                        </motion.div>
                        <h4
                          className="text-white/75 font-bold text-sm leading-snug mb-2 group-hover:text-brand-accent transition-colors duration-200"
                          style={{ transform: "translateZ(15px)" }}
                        >
                          {item.title}
                        </h4>
                        <p
                          className="text-white/30 text-xs leading-relaxed group-hover:text-white/50 transition-colors duration-300"
                          style={{ transform: "translateZ(8px)" }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </TiltCard>
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
