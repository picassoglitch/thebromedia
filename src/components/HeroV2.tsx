"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "./fx/effects";
import type { HeroContent } from "@/types/content";

interface HeroV2Props {
  hero: HeroContent;
}

const charVariants = {
  hidden: { opacity: 0, y: "0.6em" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 1.6 + i * 0.04, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

function SplitText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={charVariants}
          initial="hidden"
          animate="visible"
          aria-hidden
          className="inline-block whitespace-pre"
          style={{ willChange: "transform, opacity" }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function HeroV2({ hero }: HeroV2Props) {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // overlay parallax — slight upward drift + fade as user scrolls
  const overlayY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.55, 0.9], [1, 0.6, 0]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen w-full overflow-hidden"
    >
      <motion.div
        style={{ y: overlayY, opacity: overlayOpacity }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-between text-center px-6 pt-28 pb-24 w-full max-w-6xl mx-auto"
      >
        {/* Top tagline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center gap-3"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="block h-px w-12 bg-[#E85C00] origin-left"
          />
          <span className="text-[#E85C00] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.5em]">
            {hero.tagline}
          </span>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="block h-px w-12 bg-[#E85C00] origin-right"
          />
        </motion.div>

        {/*
          Reserved space for the particle logo — the canvas behind the page
          renders the TBM hex here. No DOM logo lives in this section.
        */}
        <div className="h-[34vh] md:h-[40vh] w-full" aria-hidden />

        {/* Bottom group — headline + badge + CTAs */}
        <div className="flex flex-col items-center">
          {/* Headline — char-by-char reveal */}
          <div className="mb-5">
            <SplitText
              text={hero.headline}
              className="text-white/85 font-light text-xs sm:text-base lg:text-lg tracking-[0.45em] uppercase"
            />
          </div>

          {/* Sub badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 2.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <span className="inline-block bg-[#E85C00] text-white font-black text-xs sm:text-sm tracking-[0.25em] uppercase px-6 py-3 shadow-[0_0_30px_rgba(232,92,0,0.4)]">
              {hero.subheadline}
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton
              as="a"
              href={hero.ctaHref}
              strength={14}
              radius={110}
              className="group inline-flex items-center gap-3 px-8 py-3.5 border border-white/25 text-white text-xs font-bold uppercase tracking-[0.3em] hover:border-[#E85C00] hover:bg-[#E85C00]/10 transition-all duration-300"
            >
              <span>{hero.ctaLabel}</span>
              <span className="text-[#E85C00] text-base leading-none translate-x-0 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </MagneticButton>
            <MagneticButton
              as="a"
              href="#nosotros"
              strength={14}
              radius={110}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#E85C00] text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-[#c44900] transition-colors duration-200"
            >
              Nosotros
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[9px] tracking-[0.4em] uppercase text-white/40">Scroll</span>
        <div className="relative w-px h-10 bg-white/10 overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeIn", repeatDelay: 0.4 }}
            className="absolute top-0 w-full h-1/2 bg-[#E85C00]"
          />
        </div>
      </motion.div>
    </section>
  );
}
