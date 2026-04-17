"use client";

import { motion } from "framer-motion";
import AnimateOnScroll, { StaggerContainer, staggerItem } from "./AnimateOnScroll";
import type { PartnersContent } from "@/types/content";

interface PartnersProps { partners: PartnersContent }

export default function Partners({ partners }: PartnersProps) {
  return (
    <section id="bros" className="relative py-28 lg:py-44 bg-[#0a0a0a] overflow-hidden">

      {/* Marquee ticker */}
      <div className="absolute top-0 left-0 right-0 border-b border-white/[0.04] overflow-hidden pointer-events-none">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap py-2.5">
          {Array(12).fill(null).map((_, i) => (
            <span key={i} className="text-[10px] font-black uppercase tracking-[0.6em] mr-14"
              style={{ color: "rgba(255,255,255,0.03)" }}>NUESTROS BRO&apos;S ✦</span>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        <div className="mb-16 lg:mb-20">
          <AnimateOnScroll direction="right">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-brand-accent" />
              <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{partners.label}</span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.05}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight mb-3">
              {partners.title}
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.1}>
            <p className="text-white/30 text-base max-w-md">{partners.subtitle}</p>
          </AnimateOnScroll>
        </div>

        {partners.logos.length > 0 ? (
          <StaggerContainer staggerDelay={0.06} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-white/[0.04]">
            {partners.logos.map((logo, i) => (
              <motion.div
                key={i}
                variants={staggerItem("scale")}
                whileHover={{ backgroundColor: "rgba(14,14,14,1)", borderColor: "rgba(232,92,0,0.2)" }}
                className="bg-[#0a0a0a] glass border border-transparent p-8 flex items-center justify-center min-h-[120px] group transition-all duration-300"
              >
                <span className="text-white/15 group-hover:text-white/50 transition-colors text-xs font-bold uppercase tracking-widest text-center">
                  {logo.name}
                </span>
              </motion.div>
            ))}
          </StaggerContainer>
        ) : (
          <AnimateOnScroll>
            <div className="border border-dashed border-white/[0.08] p-16 text-center">
              <p className="text-white/15 text-sm mb-1">Los logos aparecerán aquí.</p>
              <p className="text-white/10 text-xs uppercase tracking-widest">Agrégalos desde el panel admin</p>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
}
