"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimateOnScroll, { StaggerContainer, staggerItem } from "./AnimateOnScroll";
import { MagneticButton, SplitText, useCursorParallax, useScrollScale } from "./fx/effects";
import type { ContactContent } from "@/types/content";
import { Phone, Mail, Instagram, Facebook, ArrowUpRight } from "lucide-react";

interface ContactProps { contact: ContactContent }

export default function Contact({ contact }: ContactProps) {
  const ref = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY    = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const glowOp = useTransform(scrollYProgress, [0, 0.4, 1], [0, 1, 0.4]);
  const headlineY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  const { x: cx, y: cy } = useCursorParallax(32);
  const { scale: hScale } = useScrollScale(headlineRef);

  return (
    <section ref={ref} id="contacto" className="relative py-32 lg:py-52 bg-[#080808] overflow-hidden">

      {/* Bottom glow — intensifies into the section + cursor parallax */}
      <motion.div style={{ opacity: glowOp }}
        className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none">
        <motion.div
          style={{
            x: cx,
            y: cy,
            background: "radial-gradient(ellipse at 50% 100%, rgba(232,92,0,0.09) 0%, transparent 65%)",
            filter: "blur(50px)",
          }}
          className="w-full h-full"
        />
      </motion.div>

      {/* Watermark with cursor parallax */}
      <motion.div style={{ y: bgY }}
        className="absolute inset-0 flex items-end pointer-events-none select-none overflow-hidden">
        <motion.span
          style={{ x: cx, y: cy, display: "inline-block", color: "rgba(255,255,255,0.022)" }}
          className="text-[22vw] font-black leading-none pl-2 pb-0"
        >
          BRO.
        </motion.span>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Big headline */}
        <motion.div
          ref={headlineRef}
          style={{ y: headlineY, scale: hScale, transformOrigin: "left center" }}
          className="mb-20 lg:mb-28 will-change-transform"
        >
          <AnimateOnScroll direction="right">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-px bg-brand-accent" />
              <span className="text-brand-accent text-xs font-bold uppercase tracking-[0.45em]">{contact.label}</span>
            </div>
          </AnimateOnScroll>
          <h2 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-[0.9] tracking-tight">
            <SplitText text="NEED HELP" className="block" />
          </h2>
          <h2
            className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tight mb-8"
            style={{ textShadow: "0 0 60px rgba(232,92,0,0.25)" }}
          >
            <span>FROM A&nbsp;</span>
            <span className="text-brand-accent">
              <SplitText text="BRO?" className="inline" delay={0.4} />
            </span>
          </h2>
          <AnimateOnScroll direction="up" delay={0.14}>
            <p className="text-white/40 text-lg max-w-xl leading-relaxed">{contact.subtitle}</p>
          </AnimateOnScroll>
        </motion.div>

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
                whileHover={{ x: 10 }}
                className="flex items-center gap-5 p-5 border border-white/[0.07] hover:border-brand-accent/40 glass transition-all duration-300 group"
              >
                <div className="w-12 h-12 flex items-center justify-center border border-white/10 group-hover:border-brand-accent/40 group-hover:bg-brand-accent/5 transition-all duration-300 shrink-0">
                  <Icon size={18} className="text-brand-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-white/25 text-[10px] uppercase tracking-widest mb-0.5">{label}</div>
                  <div className="text-white/70 font-semibold text-sm sm:text-base group-hover:text-brand-accent transition-colors duration-200 truncate">
                    {value}
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-brand-accent ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </motion.a>
            ))}
          </StaggerContainer>

          {/* CTA box */}
          <AnimateOnScroll direction="left" delay={0.1} distance={65}>
            <div className="relative glass border border-white/[0.07] p-8 lg:p-12 min-h-[340px] flex flex-col justify-between overflow-hidden">
              {/* Corner accents */}
              {["top-0 left-0 border-t-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((cls, i) => (
                <div key={i} className={`absolute w-10 h-10 border-brand-accent ${cls}`} />
              ))}

              {/* Animated bg blob */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.07, 0.18, 0.07] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
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
                <p className="text-white/30 text-sm leading-relaxed">
                  Somos tu bro para cualquier necesidad de tecnología, medios y marketing.
                </p>
              </div>

              {/* Magnetic CTA */}
              <div className="relative z-10 mt-8">
                <MagneticButton
                  as="a"
                  href={`mailto:${contact.email}`}
                  strength={18}
                  radius={140}
                  className="inline-flex items-center gap-3 px-7 py-3.5 bg-brand-accent text-white font-black text-xs uppercase tracking-widest hover:bg-brand-accent-dim transition-colors duration-200"
                >
                  <span>Enviar mensaje</span>
                  <ArrowUpRight size={14} />
                </MagneticButton>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
