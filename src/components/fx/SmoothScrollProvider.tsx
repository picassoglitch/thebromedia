"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Approximate navbar height (h-16 on mobile / h-[72px] on lg). Used as the
// scroll offset when jumping to an in-page anchor so the navbar doesn't
// cover the destination section's heading.
const NAV_OFFSET = -80;

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // ── Anchor link interception ──────────────────────────────────────────
    // Lenis hijacks the native scroll system, so clicking <a href="#foo">
    // either jumps instantly (bypassing the smooth easing) or fails to
    // commit the new position. Route those clicks through lenis.scrollTo()
    // so the buttons in the navbar and section sidebar actually work.
    //
    // Attached in CAPTURE phase so framer-motion / other libraries can't
    // beat us to preventDefault / stopPropagation.
    const onAnchorClick = (e: MouseEvent) => {
      // honor modifier-clicks (open in new tab, etc.)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const id = decodeURIComponent(href.slice(1));
      const el = document.getElementById(id);
      if (!el) return;

      e.preventDefault();

      const doScroll = () => {
        try {
          lenis.scrollTo(el, {
            offset: NAV_OFFSET,
            duration: 0.9,
            force: true,
          });
        } catch {
          // Lenis failed for some reason — fall back to native smooth scroll
          const top = el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
          window.scrollTo({ top, behavior: "smooth" });
        }
      };

      doScroll();

      // After 200ms, if Lenis hasn't started moving (e.g. browser blocked
      // the wheel-event simulation it uses internally), kick the native
      // scroller as a hard fallback so the click never "does nothing".
      const startY = window.scrollY;
      window.setTimeout(() => {
        if (Math.abs(window.scrollY - startY) < 4) {
          const top = el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 250);

      // Update the URL hash without re-triggering a jump
      if (history.replaceState) {
        history.replaceState(null, "", href);
      }
    };

    // capture: true → runs before bubble-phase handlers anywhere in the tree
    document.addEventListener("click", onAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", onAnchorClick, { capture: true });
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
