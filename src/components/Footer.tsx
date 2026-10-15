"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MagneticButton } from "./fx/effects";
import type { FooterContent } from "@/types/content";

interface FooterProps { footer: FooterContent }

export default function Footer({ footer }: FooterProps) {
  return (
    <footer className="relative bg-[#060608] border-t border-white/[0.05] overflow-hidden">
      {/* Animated accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px origin-center"
        style={{ background: "linear-gradient(90deg, transparent, rgba(232,92,0,0.6), transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo — links back to top with magnetic feel */}
          <MagneticButton as="a" href="#hero" strength={10} radius={70}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} className="block">
              <Image
                src="/images/logo-thumbnail.png"
                alt="The Bro Media"
                width={140}
                height={47}
                className="h-9 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          </MagneticButton>

          {/* Centre block — copyright + Quantor service-provider credit (static text, not a link) */}
          <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 text-center sm:text-left">
            <span className="text-white/25 text-xs text-center sm:text-left break-words max-w-xs sm:max-w-none">{footer.copy}</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-white/15" aria-hidden />
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/40">
              <span className="text-white/30">by</span>
              <span className="font-bold tracking-[0.35em] text-white/55">Quantor</span>
            </span>
          </div>

          {/* Admin */}
          <motion.a
            href="/admin"
            whileHover={{ color: "rgba(232,92,0,0.8)" }}
            className="text-[10px] text-white/20 transition-colors uppercase tracking-widest"
            data-cursor="hover"
          >
            Admin
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
