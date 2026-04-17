"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimateOnScroll from "./AnimateOnScroll";
import type { VideoContent } from "@/types/content";

interface VideoSectionProps { video: VideoContent }

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/\s]{11})/);
  return m ? m[1] : null;
}

export default function VideoSection({ video }: VideoSectionProps) {
  const sectionRef    = useRef<HTMLElement>(null);
  const iframeRef     = useRef<HTMLIFrameElement>(null);
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded]   = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.94, 1, 1, 0.94]);
  const y     = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  const ytId       = video.url ? getYouTubeId(video.url) : null;
  const hasVideo   = !!ytId;

  // Send YT postMessage
  const sendCmd = useCallback((fn: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: fn, args: [] }),
      "*"
    );
  }, []);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    if (hasVideo) sendCmd("playVideo");
  }, [hasVideo, sendCmd]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    if (hasVideo) sendCmd("pauseVideo");
  }, [hasVideo, sendCmd]);

  // Build embed URL — muted, no autoplay by default, JS API enabled
  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?enablejsapi=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1`
    : "";

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-32 bg-brand-black overflow-hidden">

      {/* Subtle top separator glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(232,92,0,0.4), transparent)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 lg:mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <AnimateOnScroll direction="right">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-brand-accent" />
                <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">
                  {video.label}
                </span>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll direction="up" delay={0.07}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-none tracking-tight">
                {video.title}
              </h2>
            </AnimateOnScroll>
          </div>
          {video.subtitle && (
            <AnimateOnScroll direction="up" delay={0.12}>
              <p className="text-white/30 text-sm sm:text-right max-w-xs leading-relaxed">
                {video.subtitle}
              </p>
            </AnimateOnScroll>
          )}
        </div>

        {/* Video wrapper */}
        <AnimateOnScroll direction="scale" delay={0.08}>
          <motion.div
            style={{ scale, y }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full aspect-video group cursor-pointer"
          >
            {/* Outer glow on hover */}
            <motion.div
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="absolute -inset-[1px] rounded-none pointer-events-none"
              style={{ boxShadow: "0 0 60px rgba(232,92,0,0.2), 0 0 120px rgba(232,92,0,0.07)" }}
            />

            {/* Border */}
            <div className="absolute inset-0 border border-white/10 group-hover:border-brand-accent/30 transition-colors duration-500 z-10 pointer-events-none" />

            {/* Corner accents */}
            {[
              "top-0 left-0 border-t-2 border-l-2",
              "top-0 right-0 border-t-2 border-r-2",
              "bottom-0 left-0 border-b-2 border-l-2",
              "bottom-0 right-0 border-b-2 border-r-2",
            ].map((cls, i) => (
              <motion.div
                key={i}
                animate={{ opacity: hovered ? 1 : 0.4 }}
                transition={{ duration: 0.3 }}
                className={`absolute w-8 h-8 border-brand-accent z-20 pointer-events-none ${cls}`}
              />
            ))}

            {/* The actual iframe */}
            {hasVideo ? (
              <iframe
                ref={iframeRef}
                src={embedSrc}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setLoaded(true)}
                className="absolute inset-0 w-full h-full bg-brand-dark"
              />
            ) : (
              /* Placeholder when no URL set */
              <div className="absolute inset-0 bg-brand-dark flex flex-col items-center justify-center gap-6">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
                  }}
                />
                <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                  {/* Pulsing circles */}
                  <div className="relative flex items-center justify-center">
                    {[1, 1.6, 2.2].map((s, i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, s, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                        className="absolute w-16 h-16 rounded-full border border-brand-accent"
                      />
                    ))}
                    <div className="w-16 h-16 flex items-center justify-center border border-white/15">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white/40 ml-1">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white/20 text-xs uppercase tracking-[0.4em]">
                    Agrega la URL de YouTube desde el panel admin
                  </p>
                </div>
              </div>
            )}

            {/* Hover overlay hint (only when video loaded but not playing) */}
            {hasVideo && (
              <motion.div
                animate={{ opacity: hovered ? 0 : 0 }}
                className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
              >
                <div className="text-white/20 text-xs uppercase tracking-widest">
                  Hover para reproducir
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimateOnScroll>

        {/* Hover hint */}
        {hasVideo && (
          <AnimateOnScroll direction="up" delay={0.2}>
            <p className="mt-5 text-center text-white/20 text-xs uppercase tracking-[0.4em]">
              Pasa el cursor para reproducir
            </p>
          </AnimateOnScroll>
        )}
      </div>

      {/* Bottom separator */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(232,92,0,0.2), transparent)" }}
      />
    </section>
  );
}
