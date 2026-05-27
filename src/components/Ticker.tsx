"use client";

import { motion } from "framer-motion";

interface TickerProps { items: string[] }

export default function Ticker({ items }: TickerProps) {
  const tripled = [...items, ...items, ...items];
  return (
    <div className="relative bg-brand-accent py-3.5 overflow-hidden border-y border-white/10">
      {/* Subtle scanning sheen */}
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
          width: "50%",
        }}
      />
      <div className="ticker-track flex gap-10 items-center relative">
        {tripled.map((item, i) => (
          <span
            key={i}
            className="text-white font-black text-[11px] uppercase tracking-[0.35em] whitespace-nowrap flex items-center gap-10"
          >
            {item}
            <span className="opacity-50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
