import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

// Tab title becomes "404 — Página no encontrada | The Bro Media"
// thanks to the template in the root layout's metadata.
export const metadata: Metadata = {
  title: "404 — Página no encontrada",
  description: "Esta página no existe. Volvé al inicio.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full bg-[#080808] overflow-hidden flex items-center justify-center px-6">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(232,92,0,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 text-center max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/images/logo-thumbnail.png"
            alt="The Bro Media"
            width={947}
            height={470}
            priority
            className="w-56 sm:w-72 h-auto opacity-90"
          />
        </div>

        {/* Tag */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-10 h-px bg-[#E85C00]" />
          <span className="text-[#E85C00] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.5em]">
            Error 404
          </span>
          <span className="w-10 h-px bg-[#E85C00]" />
        </div>

        {/* Big number */}
        <div
          className="text-[28vw] sm:text-[18vw] lg:text-[200px] font-black text-[#E85C00] leading-[0.9] tracking-tighter mb-2 tabular-nums"
          style={{ textShadow: "0 0 60px rgba(232,92,0,0.35)" }}
        >
          404
        </div>

        {/* Subtitle */}
        <h1 className="text-white font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-wide mb-4">
          Esta página no la tenemos, bro.
        </h1>
        <p className="text-white/45 text-sm sm:text-base mb-10 max-w-md mx-auto leading-relaxed">
          La URL que buscás no existe o se mudó. Volvé al inicio y desde ahí
          encontrás todo lo que tenemos para ofrecerte.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 px-8 py-3.5 bg-[#E85C00] text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-[#c44900] transition-colors duration-200"
          >
            <span>Volver al inicio</span>
            <span className="text-white text-base leading-none translate-x-0 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
          <Link
            href="/#contacto"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/25 text-white text-xs font-bold uppercase tracking-[0.3em] hover:border-[#E85C00] hover:bg-[#E85C00]/10 transition-all duration-300"
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </main>
  );
}
