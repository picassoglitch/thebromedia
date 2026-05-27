"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Section {
  id: string;
  label: string;
}

interface SectionSidebarProps {
  sections: Section[];
}

/**
 * Fixed right-edge vertical dots showing the current section.
 *
 * Each dot grows + brightens when its section enters the viewport center.
 * Hovering reveals the section label. Clicking scroll-jumps to the section
 * (Lenis picks the smooth scroll up automatically via window.scrollTo).
 */
export default function SectionSidebar({ sections }: SectionSidebarProps) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div
      className="hidden lg:flex fixed right-6 xl:right-10 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-5"
      aria-hidden
    >
      {sections.map((section) => {
        const isActive = active === section.id;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group flex items-center gap-3 cursor-pointer"
            data-cursor="hover"
          >
            <motion.span
              animate={{
                opacity: isActive ? 1 : 0,
                x: isActive ? 0 : 8,
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] uppercase tracking-[0.35em] text-white/60 whitespace-nowrap"
            >
              {section.label}
            </motion.span>
            <motion.span
              animate={{
                scale: isActive ? 1 : 0.55,
                backgroundColor: isActive ? "#E85C00" : "rgba(255,255,255,0.25)",
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block w-2 h-2 rounded-full"
              style={{
                boxShadow: isActive ? "0 0 12px rgba(232,92,0,0.7)" : "none",
              }}
            />
          </a>
        );
      })}
    </div>
  );
}
