import Image from "next/image";
import type { FooterContent } from "@/types/content";

interface FooterProps { footer: FooterContent }

export default function Footer({ footer }: FooterProps) {
  return (
    <footer className="relative bg-[#060608] border-t border-white/[0.05]">
      {/* Accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(232,92,0,0.5), transparent)" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/images/logo-thumbnail.png"
            alt="The Bro Media"
            width={140}
            height={47}
            className="h-8 w-auto object-contain"
          />
          <span className="text-white/20 text-xs">{footer.copy}</span>
          <a href="/admin"
            className="text-[10px] text-white/15 hover:text-white/40 transition-colors uppercase tracking-widest">
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
