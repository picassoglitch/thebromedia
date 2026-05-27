"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import SmoothScrollProvider from "./SmoothScrollProvider";
import SceneCanvas from "./SceneCanvas";
import Loader from "./Loader";
import AudioToggle from "./AudioToggle";

// Custom cursor is client-only and depends on window.matchMedia at module load
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sceneReady, setSceneReady] = useState(false);

  // Admin pages get just the page chrome — no particle canvas, no audio toggle,
  // no custom cursor, no smooth scroll, no loader. The admin panel is a tool,
  // not a brand showcase, and the FX layer just gets in the way of editing.
  const isAdminRoute = pathname?.startsWith("/admin");
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <SmoothScrollProvider>
      <SceneCanvas onReady={() => setSceneReady(true)} />
      <div className="relative z-10">{children}</div>
      <AudioToggle />
      <CustomCursor />
      <Loader ready={sceneReady} />
    </SmoothScrollProvider>
  );
}
