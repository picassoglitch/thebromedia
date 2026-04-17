"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { NavContent } from "@/types/content";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  nav: NavContent;
  logoImage?: string;
}

export default function Navbar({ nav, logoImage }: NavbarProps) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActive]  = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight active section
  useEffect(() => {
    const ids = nav.links.map(l => l.href.replace("#", "")).filter(Boolean);
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [nav.links]);

  return (
    <>
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#080808]/85 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        {/* Thin accent line at very top */}
        {scrolled && (
          <motion.div
            layoutId="nav-accent"
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(232,92,0,0.6), transparent)" }}
          />
        )}

        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">

            {/* Logo */}
            <a href="#" className="flex items-center shrink-0">
              <Image
                src="/images/logo-thumbnail.png"
                alt="The Bro Media"
                width={160}
                height={54}
                className="h-9 lg:h-10 w-auto object-contain"
                priority
              />
            </a>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-7 xl:gap-9">
              {nav.links.map((link) => {
                const id  = link.href.replace("#", "");
                const active = activeSection === id;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`relative text-xs font-semibold uppercase tracking-[0.25em] transition-colors duration-200 py-1
                      ${active ? "text-white" : "text-white/40 hover:text-white/80"}`}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-brand-accent"
                      />
                    )}
                  </a>
                );
              })}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center">
              <motion.a
                href="#contacto"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 bg-brand-accent text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-accent-dim transition-colors duration-200"
              >
                {nav.cta}
              </motion.a>
            </div>

            {/* Mobile burger */}
            <button
              aria-label="Menú"
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden text-white/60 hover:text-white p-1.5 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06] lg:hidden overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-0.5">
              {nav.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-white/50 hover:text-white uppercase tracking-widest py-3.5 border-b border-white/[0.06] last:border-0 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={() => setMobileOpen(false)}
                className="mt-4 py-3.5 bg-brand-accent text-white text-xs font-black uppercase tracking-widest text-center"
              >
                {nav.cta}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
