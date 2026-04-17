"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimateOnScroll, { StaggerContainer, staggerItem } from "./AnimateOnScroll";
import type { ContactContent } from "@/types/content";
import { Phone, Mail, Instagram, Facebook, ArrowUpRight } from "lucide-react";

interface ContactProps { contact: ContactContent }

export default function Contact({ contact }: ContactProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY   = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"]);
  const glowOp = useTransform(scrollYProgress, [0, 0.4, 1], [0, 1, 0.4]);

  return (
    <section ref={ref} id="contacto" className="relative py-28 lg:py-44 bg-[#080808] overflow-hidden">

      {/* Bottom glow */}
      <motion.div style={{ opacity: glowOp }}
        className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none">
        <div className="w-full h-full"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(232,92,0,0.07) 0%, transparent 65%)", filter: "blur(40px)" }} />
      </motion.div>

      {/* Watermark */}
      <motion.div style={{ y: bgY }}
        className="absolute inset-0 flex items-end pointer-events-none select-none overflow-hidden">
        <span className="text-[20vw] font-black leading-none pl-2 pb-0"
          style={{ color: "rgba(255,255,255,0.018)" }}>BRO.</span>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Big headline */}
        <div className="mb-16 lg:mb-24">
          <AnimateOnScroll direction="right">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-px bg-brand-accent" />
              <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{contact.label}</span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.05}>
            <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-none tracking-tight">
              NEED HELP
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.09}>
            <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-none tracking-tight mb-6">
              FROM A <span className="text-brand-accent" style={{ textShadow: "0 0 60px rgba(232,92,0,0.25)" }}>BRO?</span>
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll direction="up" delay={0.14}>
            <p className="text-white/35 text-lg max-w-lg leading-relaxed">{contact.subtitle}</p>
          </AnimateOnScroll>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Contact rows */}
          <StaggerContainer staggerDelay={0.08} className="space-y-2.5">
            {[
              { icon: Phone,    label: "Teléfono",  value: contact.phone,     href: `tel:${contact.phone}` },
              { icon: Mail,     label: "Email",     value: contact.email,     href: `mailto:${contact.email}` },
              { icon: Instagram, label: "Instagram", value: contact.instagram, href: contact.instagramUrl, ext: true },
              { icon: Facebook, label: "Facebook",  value: contact.facebook,  href: contact.facebookUrl, ext: true },
            ].map(({ icon: Icon, label, value, href, ext }) => (
              <motion.a
                key={label}
                variants={staggerItem("left")}
                href={href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noopener noreferrer" : undefined}
                whileHover={{ x: 7 }}
                className="flex items-center gap-5 p-5 border border-white/[0.07] hover:border-brand-accent/35 glass transition-all duration-300 group"
              >
                <div className="w-12 h-12 flex items-center justify-center border border-white/10 group-hover:border-brand-accent/40 group-hover:bg-brand-accent/5 transition-all duration-300 shrink-0">
                  <Icon size={18} className="text-brand-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-white/25 text-[10px] uppercase tracking-widest mb-0.5">{label}</div>
                  <div className="text-white/65 font-semibold text-sm sm:text-base group-hover:text-brand-accent transition-colors duration-200 truncate">
                    {value}
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-brand-accent ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </motion.a>
            ))}
          </StaggerContainer>

          {/* CTA box */}
          <AnimateOnScroll direction="left" delay={0.1} distance={65}>
            <div className="relative glass border border-white/[0.07] p-8 lg:p-12 min-h-[320px] flex flex-col justify-between overflow-hidden">
              {/* Corner accents */}
              {["top-0 left-0 border-t-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((cls, i) => (
                <div key={i} className={`absolute w-9 h-9 border-brand-accent ${cls}`} />
              ))}

              {/* Animated bg blob */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.06, 0.14, 0.06] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-0 right-0 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(232,92,0,1) 0%, transparent 70%)", transform: "translate(30%,30%)" }}
              />

              <div className="relative z-10">
                <div className="text-brand-accent text-[10px] font-bold uppercase tracking-[0.45em] mb-6">
                  The Bro Experience
                </div>
                <h3 className="text-white font-black text-2xl lg:text-3xl leading-tight mb-4">
                  Juntos creamos<br />
                  <span className="text-brand-accent">experiencias</span><br />
                  que impactan.
                </h3>
                <p className="text-white/25 text-sm leading-relaxed">
                  Somos tu bro para cualquier necesidad de tecnología, medios y marketing.
                </p>
              </div>

              <motion.a
                href={`mailto:${contact.email}`}
                whileHover={{ x: 5, backgroundColor: "rgba(196,73,0,1)" }}
                whileTap={{ scale: 0.97 }}
                className="relative z-10 mt-8 inline-flex items-center gap-3 px-7 py-3.5 bg-brand-accent text-white font-black text-xs uppercase tracking-widest transition-colors duration-200"
                style={{ boxShadow: "0 4px 24px rgba(232,92,0,0.25)" }}
              >
                Enviar mensaje
                <ArrowUpRight size={14} />
              </motion.a>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
