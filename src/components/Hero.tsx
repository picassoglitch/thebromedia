"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import type { HeroContent } from "@/types/content";

interface HeroProps { hero: HeroContent }

export default function Hero({ hero }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentY  = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity   = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const bgY       = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  // Mouse spring
  const rawX = useSpring(0, { stiffness: 50, damping: 18 });
  const rawY = useSpring(0, { stiffness: 50, damping: 18 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 28;
      const y = (e.clientY / window.innerHeight - 0.5) * 18;
      rawX.set(x); rawY.set(y);
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.25 } },
  };
  const item = {
    hidden: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── Animated mesh background ── */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {/* Deep base */}
        <div className="absolute inset-0 bg-[#060608]" />

        {/* Gradient mesh */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at ${mousePos.x * 100}% ${mousePos.y * 100}%,
                rgba(232,92,0,0.07) 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 80% 20%,
                rgba(232,92,0,0.04) 0%, transparent 55%),
              radial-gradient(ellipse 50% 50% at 20% 80%,
                rgba(232,92,0,0.03) 0%, transparent 55%)
            `,
            transition: "background 0.15s ease",
          }}
        />

        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-100" />

        {/* Diagonal accent lines */}
        {[15, 35, 55, 75, 92].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 1.4, delay: 0.4 + i * 0.1 }}
            className="absolute top-0 bottom-0 w-px origin-top"
            style={{
              left: `${pos}%`,
              background: "linear-gradient(to bottom, transparent, rgba(232,92,0,0.06), transparent)",
            }}
          />
        ))}

        {/* Scanning line */}
        <motion.div
          animate={{ top: ["-5%", "105%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(232,92,0,0.25), transparent)" }}
        />

        {/* Bottom fade to black */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#080808] to-transparent" />
      </motion.div>

      {/* ── Floating orbs (mouse reactive) ── */}
      <motion.div
        style={{ x: rawX, y: rawY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            top: "10%", left: "60%",
            background: "radial-gradient(circle, rgba(232,92,0,0.09) 0%, transparent 65%)",
            filter: "blur(40px)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{
            top: "55%", left: "15%",
            background: "radial-gradient(circle, rgba(232,92,0,0.07) 0%, transparent 65%)",
            filter: "blur(50px)",
            animation: "float 10s ease-in-out infinite 2s",
          }}
        />
      </motion.div>

      {/* ── Content ── */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 w-full"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Tag line */}
          <motion.div variants={item} className="flex items-center gap-3 mb-8">
            <motion.span
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="block h-px w-10 bg-brand-accent origin-left"
            />
            <span className="text-brand-accent text-xs font-semibold uppercase tracking-[0.45em]">
              {hero.tagline}
            </span>
            <motion.span
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="block h-px w-10 bg-brand-accent origin-right"
            />
          </motion.div>

          {/* Main logo */}
          <motion.div variants={item} className="mb-6">
            <Image
              src="/images/logo-thumbnail.png"
              alt="The Bro Media"
              width={947}
              height={470}
              className="w-[72vw] sm:w-[56vw] lg:w-[44vw] xl:w-[40vw] max-w-[700px] h-auto mx-auto"
              style={{ filter: "drop-shadow(0 0 60px rgba(232,92,0,0.35))" }}
              priority
            />
          </motion.div>

          {/* Headline */}
          <motion.div variants={item} className="mb-4">
            <p className="text-white/60 font-light text-sm sm:text-base lg:text-lg tracking-[0.3em] uppercase">
              {hero.headline}
            </p>
          </motion.div>

          {/* Sub badge */}
          <motion.div variants={item} className="mb-10">
            <span className="inline-block bg-brand-accent text-white font-black text-xs sm:text-sm tracking-[0.2em] uppercase px-6 py-2.5">
              {hero.subheadline}
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href={hero.ctaHref}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/20 text-white text-xs font-bold uppercase tracking-[0.3em] hover:border-brand-accent hover:bg-brand-accent/10 transition-all duration-300"
            >
              {hero.ctaLabel}
              <span className="text-brand-accent text-base leading-none">→</span>
            </motion.a>
            <motion.a
              href="#nosotros"
              whileHover={{ scale: 1.04 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-accent text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-brand-accent-dim transition-colors duration-200"
            >
              Nosotros
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator — line only, no text ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="relative w-px h-10 bg-white/10 overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeIn", repeatDelay: 0.4 }}
            className="absolute top-0 w-full h-1/2 bg-brand-accent"
          />
        </div>
      </motion.div>
    </section>
  );
}
