"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import SmoothScrollProvider from "./SmoothScrollProvider";
import SceneCanvas from "./SceneCanvas";
import Loader from "./Loader";
import AudioToggle from "./AudioToggle";
import Footer from "../Footer";
import type { FooterContent } from "@/types/content";

// Custom cursor is client-only and depends on window.matchMedia at module load
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });

export default function AppShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: FooterContent;
}) {
  const pathname = usePathname();
  const [sceneReady, setSceneReady] = useState(false);

  // Admin pages get just the page chrome — no particle canvas, no audio toggle,
  // no custom cursor, no smooth scroll, no loader. The admin panel is a tool,
  // not a brand showcase, and the FX layer just gets in the way of editing.
  const isAdminRoute = pathname?.startsWith("/admin");
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="bg-[#060608] border-t border-white/[0.05] px-6 py-4 text-center">
          <span className="text-white/25 text-xs break-words">{footer.copy}</span>
        </footer>
      </div>
    );
  }

  return (
    <SmoothScrollProvider>
      <SceneCanvas onReady={() => setSceneReady(true)} />
      <div className="relative z-10">
        {children}
        <Footer footer={footer} />
      </div>
      <AudioToggle />
      <CustomCursor />
      <Loader ready={sceneReady} />
    </SmoothScrollProvider>
  );
}
