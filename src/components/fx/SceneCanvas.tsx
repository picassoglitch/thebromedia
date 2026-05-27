"use client";

import { useEffect, useRef } from "react";

interface SceneCanvasProps {
  /** path to the TBM logo image. Must be the high-res white-on-transparent
   * silhouette — alpha is sampled per pixel. */
  logoSrc?: string;
  /** width of the offscreen sampling buffer, in px. 1800 gives ~10500
   * particles from the TBM mark at sampleStep=2, which is the design target. */
  sampleBufferWidth?: number;
  /** grid step inside the sampling buffer (px). Smaller = more particles. */
  sampleStep?: number;
  /** brand accent — every particle renders in this color. */
  accent?: string;
  /** called once particles are sampled and the first frame has drawn */
  onReady?: () => void;
}

interface Particle {
  // home position in screen pixels, relative to viewport center
  homeX: number;
  homeY: number;
  // current rendered position
  x: number;
  y: number;
  // velocity
  vx: number;
  vy: number;
  // per-particle alpha (0.85 – 1.0) and jitter phase
  alpha: number;
  jitterSeed: number;
}

const TAU = Math.PI * 2;
// Logo aspect — locked to the source asset 6250x2084. Used for layout fidelity.
const LOGO_ASPECT = 6250 / 2084; // ≈ 2.999

function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * Persistent Canvas2D layer. The logo IS the particle field.
 *
 * Source: /images/logo-white.png (6250×2084, white silhouette on transparent).
 * Pipeline:
 *  1. Rasterize the high-res logo into a fixed sampling buffer (default
 *     1800×600 — 2–3× the displayed logo size) so thin strokes survive.
 *  2. Sample alpha at every step=2 px — ~10500 home coordinates.
 *  3. Map sample coords into screen pixels via the displayed logoBox, which
 *     locks aspect to the source 3:1.
 *  4. Particles spawn from random offscreen positions and spring toward home
 *     (intro lerp 0.04 → 0.10 over ~1.5s).
 *  5. Idle: capped ±0.5px breathing — wordmark stays readable.
 *  6. Cursor repel within a small radius (returns to home when cursor leaves).
 *  7. Scroll past the hero disperses the field outward; scroll back reassembles.
 */
export default function SceneCanvas({
  logoSrc = "/images/logo-white.png",
  sampleBufferWidth = 1800,
  sampleStep = 2,
  accent = "#E85C00",
  onReady,
}: SceneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const readyCalledRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isMobile = window.innerWidth < 768;
    // Mobile budget: smaller buffer + wider sample step → ~3.5k particles
    // (vs ~10.5k on desktop). Keeps the silhouette readable while staying
    // smooth on lower-power phones.
    const bufW = isMobile ? Math.round(sampleBufferWidth * 0.65) : sampleBufferWidth;
    const step = isMobile ? Math.max(sampleStep, 2) : sampleStep;

    // ─── Pre-rendered particle sprite ──────────────────────────────────────
    // Small soft-edged disc. Particle radius is intentionally tiny (1.4 CSS px)
    // so thin strokes in the wordmark and BRO letters don't blur into blobs.
    const PARTICLE_RADIUS = 1.4;
    const spritePxRaw = Math.ceil(PARTICLE_RADIUS * 2 * dpr) + 2;
    const sprite = document.createElement("canvas");
    sprite.width = spritePxRaw;
    sprite.height = spritePxRaw;
    {
      const sctx = sprite.getContext("2d")!;
      const r = spritePxRaw / 2;
      const g = sctx.createRadialGradient(r, r, 0, r, r, r * 0.85);
      g.addColorStop(0, accent);
      g.addColorStop(0.65, accent);
      g.addColorStop(1, "rgba(232, 92, 0, 0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, spritePxRaw, spritePxRaw);
    }
    const spriteHalfCss = spritePxRaw / dpr / 2;
    const spriteCss = spriteHalfCss * 2;

    // ─── Mutable state held by the effect ──────────────────────────────────
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let cssW = 0;
    let cssH = 0;
    let logoBox = { w: 0, h: 0 };
    let sampledMask:
      | { coords: Array<[number, number]>; w: number; h: number }
      | null = null;

    let scroll = 0;
    let scrollTarget = 0;

    const mouse = { x: -9999, y: -9999 };
    let mouseActive = false;

    let introT = 0;
    const introDuration = 1.5;

    // ─── Canvas sizing + logo footprint ────────────────────────────────────
    const computeLogoBox = () => {
      // Locked to source aspect 3:1. Responsive widths chosen so the wordmark
      // ("THE … MEDIA") is comfortably readable on each breakpoint.
      const w =
        cssW < 640  ? Math.min(560, cssW * 0.94) :
        cssW < 1024 ? Math.min(720, cssW * 0.80) :
        cssW < 1280 ? Math.min(820, cssW * 0.68) :
                      Math.min(900, cssW * 0.62);
      const h = w / LOGO_ASPECT;
      logoBox = { w, h };
    };

    const resize = () => {
      cssW = window.innerWidth || document.documentElement.clientWidth;
      cssH = window.innerHeight || document.documentElement.clientHeight;
      width = Math.floor(cssW * dpr);
      height = Math.floor(cssH * dpr);
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, cssW * dpr * 0.5, cssH * dpr * 0.5);
      computeLogoBox();
      if (sampledMask) rebuildHomes();
    };

    // ─── Logo sampling ─────────────────────────────────────────────────────
    const sampleLogo = (after: () => void) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logoSrc;

      img.onload = () => {
        // Rasterize the high-res source into our sampling buffer. Drawing
        // 6250×2084 down to 1800×600 keeps thin strokes intact thanks to
        // the browser's high-quality downscale.
        const sampleW = bufW;
        const sampleH = Math.max(2, Math.round(sampleW / LOGO_ASPECT));
        const c = document.createElement("canvas");
        c.width = sampleW;
        c.height = sampleH;
        const sx = c.getContext("2d", { willReadFrequently: true });
        if (!sx) { after(); return; }
        sx.imageSmoothingEnabled = true;
        sx.imageSmoothingQuality = "high";
        sx.drawImage(img, 0, 0, sampleW, sampleH);
        const data = sx.getImageData(0, 0, sampleW, sampleH).data;

        // logo-white.png is white on transparent → alpha is the mask.
        const coords: Array<[number, number]> = [];
        for (let y = 0; y < sampleH; y += step) {
          for (let x = 0; x < sampleW; x += step) {
            if (data[(y * sampleW + x) * 4 + 3] > 80) coords.push([x, y]);
          }
        }
        if (coords.length === 0) { after(); return; }

        sampledMask = { coords, w: sampleW, h: sampleH };
        buildParticles();
        rebuildHomes();
        after();
      };
      img.onerror = () => after();
    };

    const buildParticles = () => {
      if (!sampledMask) return;
      const n = sampledMask.coords.length;
      particles = new Array(n);
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * TAU;
        const r = Math.max(cssW, cssH) * (0.7 + Math.random() * 0.7);
        particles[i] = {
          homeX: 0,
          homeY: 0,
          x: Math.cos(ang) * r,
          y: Math.sin(ang) * r,
          vx: 0,
          vy: 0,
          // Tight alpha jitter: 0.85 – 1.0. Wider variance dithered the
          // strokes when many particles overlapped.
          alpha: 0.85 + Math.random() * 0.15,
          jitterSeed: Math.random() * TAU,
        };
      }
    };

    const rebuildHomes = () => {
      if (!sampledMask || particles.length === 0) return;
      const { coords, w: sw, h: sh } = sampledMask;
      // Both axes share the same scale because the canvas region aspect is
      // locked to the source aspect — guarantees nothing gets stretched.
      const scale = logoBox.w / sw;
      for (let i = 0; i < particles.length; i++) {
        const [px, py] = coords[i % coords.length];
        particles[i].homeX = (px - sw / 2) * scale;
        particles[i].homeY = (py - sh / 2) * scale;
      }
    };

    // ─── Listeners ─────────────────────────────────────────────────────────
    const markReady = () => {
      if (readyCalledRef.current) return;
      readyCalledRef.current = true;
      onReady?.();
    };

    const onPointer = (e: PointerEvent) => {
      mouse.x = e.clientX - cssW / 2;
      mouse.y = e.clientY - cssH / 2;
      mouseActive = true;
    };
    const onLeave = () => {
      mouseActive = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      scrollTarget = Math.min(1, Math.max(0, y / (h * 0.85)));
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") resize();
    };

    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => resize(), 200);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    onScroll();
    sampleLogo(() => markReady());

    // ─── Render loop ───────────────────────────────────────────────────────
    let last = performance.now();
    const REPEL_R = 90;
    const REPEL_R2 = REPEL_R * REPEL_R;
    // Idle drift — hard-capped at ±0.5px so wordmark text stays sharp.
    const IDLE_DRIFT = 0.5;

    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      introT = Math.min(introDuration, introT + dt);
      const introProgress = introT / introDuration;
      const lerpFactor = 0.04 + 0.06 * smoothstep(0, 1, introProgress);

      scroll += (scrollTarget - scroll) * Math.min(1, dt * 6);

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.restore();

      if (particles.length === 0) return;

      const t = now / 1000;
      const introDone = introProgress >= 1;
      const scatter = smoothstep(0.15, 1.0, scroll);
      const settledFactor = 1 - scatter;

      ctx.globalCompositeOperation = "source-over";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let targetX = p.homeX;
        let targetY = p.homeY;

        // Idle breathing — capped at ±IDLE_DRIFT px so text reads at all times.
        if (introDone && settledFactor > 0.01) {
          targetX += Math.sin(t * 1.5 + p.jitterSeed) * IDLE_DRIFT * settledFactor;
          targetY += Math.cos(t * 1.2 + p.jitterSeed * 1.7) * IDLE_DRIFT * settledFactor;
        }

        // Scroll dispersion + ambient drift bookend.
        // Past the hero the particles don't disappear — they scatter to a
        // wide orbit and keep drifting at a low alpha floor, so the whole
        // page feels like one continuous spatial field.
        if (scatter > 0.001) {
          const baseAngle = Math.atan2(p.homeY, p.homeX) || (p.jitterSeed - Math.PI);
          // each particle slowly orbits past the scatter — gives the field
          // life after the hero rather than freezing in place.
          const swirl = (p.jitterSeed - 0.5) * 0.35 * t;
          const angle = baseAngle + swirl * scatter;
          const burst = scatter * (260 + (p.alpha - 0.85) * 900);
          targetX += Math.cos(angle) * burst;
          targetY += Math.sin(angle) * burst;
          // gentle wander on top of the orbit
          targetX += Math.sin(t * 0.4 + p.jitterSeed * 3.7) * 8 * scatter;
          targetY += Math.cos(t * 0.35 + p.jitterSeed * 4.1) * 8 * scatter;
        }

        // Cursor repel
        if (mouseActive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < REPEL_R2 && d2 > 0.0001) {
            const d = Math.sqrt(d2);
            const force = (1 - d / REPEL_R) * 22;
            targetX += (dx / d) * force;
            targetY += (dy / d) * force;
          }
        }

        // Spring toward target
        const ax = (targetX - p.x) * lerpFactor;
        const ay = (targetY - p.y) * lerpFactor;
        p.vx = (p.vx + ax) * 0.78;
        p.vy = (p.vy + ay) * 0.78;
        p.x += p.vx;
        p.y += p.vy;

        // Alpha curve: full intensity in the hero, fades during scatter, then
        // clamps to a low ambient floor so particles stay visible as an
        // atmospheric layer through the rest of the page.
        const ambientFloor = 0.22 * p.alpha;
        const a = Math.max(ambientFloor * smoothstep(0.4, 0.85, scroll),
                           p.alpha * (1 - scatter * 0.95));
        if (a <= 0.01) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, p.x - spriteHalfCss, p.y - spriteHalfCss, spriteCss, spriteCss);
      }
      ctx.globalAlpha = 1;
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [logoSrc, sampleBufferWidth, sampleStep, accent, onReady]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
