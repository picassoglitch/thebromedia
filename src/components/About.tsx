"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimateOnScroll, { StaggerContainer, staggerItem } from "./AnimateOnScroll";
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
  const ref        = useRef<HTMLElement>(null);
  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const videoWrap  = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgX   = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);

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

  // Play when video enters viewport, pause when it leaves
  useEffect(() => {
    if (!ytId || !videoWrap.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sendCmd("playVideo");
          } else {
            sendCmd("pauseVideo");
          }
        });
      },
      { threshold: 0.4 } // play once 40% of the video is visible
    );

    observer.observe(videoWrap.current);
    return () => observer.disconnect();
  }, [ytId, sendCmd]);

  return (
    <section ref={ref} id="nosotros" className="relative py-28 lg:py-44 overflow-hidden bg-[#0a0a0a]">

      {/* Moving watermark */}
      <motion.div style={{ x: bgX }}
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden w-full">
        <span className="text-[19vw] font-black leading-none whitespace-nowrap"
          style={{ color: "rgba(255,255,255,0.018)" }}>NOSOTROS</span>
      </motion.div>

      {/* Accent glow */}
      <motion.div style={{ y: glowY }}
        className="absolute right-0 top-0 w-[500px] h-[500px] pointer-events-none">
        <div className="w-full h-full"
          style={{ background: "radial-gradient(circle, rgba(232,92,0,0.055) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Label */}
        <AnimateOnScroll direction="right">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-brand-accent" />
            <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{about.label}</span>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">

          {/* Left — text */}
          <div className="lg:col-span-6">
            <AnimateOnScroll direction="up" delay={0.04}>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-none tracking-tight mb-10">
                ¿Quiénes<br />
                <span className="text-brand-accent">somos?</span>
              </h2>
            </AnimateOnScroll>

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
                  whileHover={{ borderColor: "rgba(232,92,0,0.6)", color: "rgb(232,92,0)", scale: 1.04 }}
                  className="px-4 py-2 border border-white/10 text-white/35 text-xs font-semibold uppercase tracking-widest cursor-default transition-all duration-200"
                >
                  {tag}
                </motion.span>
              ))}
            </StaggerContainer>
          </div>

          {/* Right — video panel */}
          <div className="lg:col-span-6">
            <AnimateOnScroll direction="left" delay={0.14} distance={70}>
              <div ref={videoWrap} className="relative w-full aspect-video group">

                {/* Glow */}
                <div
                  className="absolute -inset-[1px] pointer-events-none"
                  style={{ boxShadow: "0 0 50px rgba(232,92,0,0.14), 0 0 100px rgba(232,92,0,0.06)" }}
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
                    className={`absolute w-8 h-8 border-brand-accent z-20 pointer-events-none ${cls}`}
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
                      {[160, 110, 70].map((size, i) => (
                        <motion.div
                          key={i}
                          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                          transition={{ duration: 20 + i * 6, repeat: Infinity, ease: "linear" }}
                          className="absolute rounded-full border"
                          style={{ width: size, height: size, borderColor: `rgba(232,92,0,${0.08 + i * 0.04})` }}
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
                      style={{ background: "linear-gradient(90deg, transparent, rgba(232,92,0,0.35), transparent)" }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                      <p className="text-white/15 text-[10px] uppercase tracking-[0.4em] text-center">
                        Agrega un video desde el panel admin
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
