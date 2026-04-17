"use client";

interface TickerProps { items: string[] }

export default function Ticker({ items }: TickerProps) {
  const tripled = [...items, ...items, ...items];
  return (
    <div className="bg-brand-accent py-3 overflow-hidden border-y border-white/10">
      <div className="ticker-track flex gap-10 items-center">
        {tripled.map((item, i) => (
          <span key={i}
            className="text-white font-black text-[11px] uppercase tracking-[0.35em] whitespace-nowrap flex items-center gap-10">
            {item}
            <span className="opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
