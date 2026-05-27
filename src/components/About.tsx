"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimateOnScroll, { StaggerContainer, staggerItem } from "./AnimateOnScroll";
import { SplitText, useCursorParallax, useScrollScale } from "./fx/effects";
import type { AboutContent, VideoContent } from "@/types/content";

interface AboutProps {
  about: AboutContent;
  video: VideoContent;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/\s]{11})/);
  return m ? m[1] : null;
}

export default function About({ about, video }: AboutProps) {
  const ref       = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoWrap = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Big watermark drifts across; small accent glow drifts opposite — classic depth.
  const bgX        = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const glowY      = useTransform(scrollYProgress, [0, 1], ["40%", "-40%"]);
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const videoScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1, 0.96]);

  // Cursor parallax — watermark and glow shift with mouse for spatial feel
  const { x: cx, y: cy } = useCursorParallax(28);
  // Scroll-scale on the big headline
  const { scale: hScale } = useScrollScale(headlineRef);

  const ytId     = video.url ? getYouTubeId(video.url) : null;
  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=0&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1`
    : "";

  const sendCmd = useCallback((fn: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: fn, args: [] }),
      "*"
    );
  }, []);

  useEffect(() => {
    if (!ytId || !videoWrap.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) sendCmd("playVideo");
          else                       sendCmd("pauseVideo");
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(videoWrap.current);
    return () => observer.disconnect();
  }, [ytId, sendCmd]);

  return (
    <section ref={ref} id="nosotros" className="relative py-32 lg:py-48 overflow-hidden bg-[#0a0a0a]">

      {/* Massive watermark — scroll parallax (outer) + cursor parallax (inner) */}
      <motion.div
        style={{ x: bgX, y: watermarkY }}
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden w-full"
      >
        <motion.span
          style={{ x: cx, y: cy, display: "inline-block" }}
          className="text-[19vw] font-black leading-none whitespace-nowrap"
        >
          <span style={{ color: "rgba(255,255,255,0.022)" }}>NOSOTROS</span>
        </motion.span>
      </motion.div>

      {/* Accent glow — scroll-tracked + cursor-tracked */}
      <motion.div
        style={{ y: glowY }}
        className="absolute right-0 top-0 w-[600px] h-[600px] pointer-events-none"
      >
        <motion.div
          style={{ x: cx, y: cy }}
          className="w-full h-full"
        >
          <div className="w-full h-full"
            style={{ background: "radial-gradient(circle, rgba(232,92,0,0.07) 0%, transparent 70%)", filter: "blur(70px)" }} />
        </motion.div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Label */}
        <AnimateOnScroll direction="right">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-12 h-px bg-brand-accent" />
            <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{about.label}</span>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start">

          {/* Left — sticky text panel */}
          <div className="lg:col-span-6 lg:sticky lg:top-32 self-start">
            {/* Headline — char-by-char reveal + scroll-driven scale */}
            <motion.h2
              ref={headlineRef}
              style={{ scale: hScale, transformOrigin: "left center" }}
              className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.95] tracking-tight mb-10 will-change-transform break-words"
            >
              <SplitText text="¿Quiénes" className="block" staggerChar={0.035} />
              <SplitText text="somos?" className="block text-brand-accent" staggerChar={0.035} delay={0.3} />
            </motion.h2>

            <AnimateOnScroll direction="up" delay={0.1}>
              <p className="text-white/55 text-base sm:text-lg lg:text-xl leading-relaxed font-light mb-10 max-w-xl">
                {about.body}
              </p>
            </AnimateOnScroll>

            <StaggerContainer staggerDelay={0.06} className="flex flex-wrap gap-2.5">
              {["Tecnología", "Medios", "Marketing", "AI", "BTL", "SaaS"].map(tag => (
                <motion.span
                  key={tag}
                  variants={staggerItem("up")}
                  whileHover={{ borderColor: "rgba(232,92,0,0.6)", color: "rgb(232,92,0)", scale: 1.05, y: -2 }}
                  className="px-4 py-2 border border-white/10 text-white/35 text-xs font-semibold uppercase tracking-widest cursor-default transition-all duration-200"
                >
                  {tag}
                </motion.span>
              ))}
            </StaggerContainer>
          </div>

          {/* Right — video panel with subtle scale on scroll */}
          <div className="lg:col-span-6">
            <AnimateOnScroll direction="left" delay={0.14} distance={70}>
              <motion.div ref={videoWrap} style={{ scale: videoScale }} className="relative w-full aspect-video group">

                {/* Glow */}
                <div
                  className="absolute -inset-[1px] pointer-events-none"
                  style={{ boxShadow: "0 0 60px rgba(232,92,0,0.18), 0 0 120px rgba(232,92,0,0.08)" }}
                />

                {/* Border */}
                <div className="absolute inset-0 border border-brand-accent/25 transition-colors duration-500 z-10 pointer-events-none" />

                {/* Corner accents */}
                {[
                  "top-0 left-0 border-t-2 border-l-2",
                  "top-0 right-0 border-t-2 border-r-2",
                  "bottom-0 left-0 border-b-2 border-l-2",
                  "bottom-0 right-0 border-b-2 border-r-2",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-10 h-10 border-brand-accent z-20 pointer-events-none ${cls}`}
                  />
                ))}

                {/* YouTube iframe */}
                {ytId ? (
                  <iframe
                    ref={iframeRef}
                    src={embedSrc}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full bg-[#0a0a0a]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#0d0d0d] flex items-center justify-center">
                    <div className="absolute inset-0 grid-bg opacity-40" />
                    <div className="relative flex items-center justify-center">
                      {[180, 130, 80].map((size, i) => (
                        <motion.div
                          key={i}
                          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                          transition={{ duration: 22 + i * 6, repeat: Infinity, ease: "linear" }}
                          className="absolute rounded-full border"
                          style={{ width: size, height: size, borderColor: `rgba(232,92,0,${0.10 + i * 0.05})` }}
                        />
                      ))}
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0.2, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="w-3 h-3 rounded-full bg-brand-accent"
                      />
                    </div>
                    <motion.div
                      animate={{ top: ["-5%", "105%"] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                      className="absolute left-0 right-0 h-px pointer-events-none"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(232,92,0,0.4), transparent)" }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                      <p className="text-white/15 text-[10px] uppercase tracking-[0.4em] text-center">
                        Agrega un video desde el panel admin
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimateOnScroll>

            {/* Caption under video — pulled from content */}
            {video.subtitle && (
              <AnimateOnScroll direction="up" delay={0.3}>
                <p className="mt-6 text-white/30 text-xs uppercase tracking-[0.35em] text-center lg:text-right">
                  {video.subtitle}
                </p>
              </AnimateOnScroll>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
