"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { detectDeviceTier, onIdle, type DeviceTier } from "@/lib/device";

import type { SplashCursorProps } from "./SplashCursor";
import { SPLASH_PALETTES, splashStore } from "./splash-store";

// WebGL code never runs on the server and is fetched only after the page is idle.
const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

const TIER_CONFIG: Record<DeviceTier, SplashCursorProps> = {
  high: { SIM_RESOLUTION: 128, DYE_RESOLUTION: 1440, PRESSURE_ITERATIONS: 20, MAX_DPR: 2 },
  medium: { SIM_RESOLUTION: 128, DYE_RESOLUTION: 1024, PRESSURE_ITERATIONS: 20, MAX_DPR: 1.5 },
  // Phones & tablets: low resolution, as agreed.
  low: { SIM_RESOLUTION: 64, DYE_RESOLUTION: 512, PRESSURE_ITERATIONS: 10, MAX_DPR: 1.25 },
};

/**
 * Owns the single, persistent SplashCursor instance.
 *
 * Non-negotiable rule: the fluid reacts only on the hero (`data-splash="on"`)
 * and manifesto (`data-splash="on"`) sections and is off over the projects
 * section (`data-splash="off"`). This component:
 *  - keeps section geometry fresh for the zone checks (splash-store),
 *  - clips the fixed canvas to the visible "on" section so the fluid never
 *    paints over the projects,
 *  - mirrors the state on <html data-splash-state="on|off|disabled"> (tests),
 *  - skips the effect entirely for `prefers-reduced-motion` users.
 */
export function SplashController() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [tier, setTier] = useState<DeviceTier | null>(null);

  useEffect(() => onIdle(() => setTier(detectDeviceTier())), []);

  useEffect(() => {
    splashStore.palette = resolvedTheme === "light" ? SPLASH_PALETTES.light : SPLASH_PALETTES.dark;
  }, [resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.dataset.splashState = "disabled";
      return;
    }

    let frame = 0;
    let pointerY: number | null = null;

    const update = () => {
      frame = 0;
      const band = splashStore.visibleBand();
      const wrapper = wrapperRef.current;
      if (wrapper) {
        wrapper.style.clipPath = band
          ? `inset(${band.top}px 0 ${window.innerHeight - band.bottom}px 0)`
          : "inset(100% 0 0 0)";
      }
      const probe = pointerY ?? window.innerHeight / 2;
      root.dataset.splashState = splashStore.isActiveAt(probe) ? "on" : "off";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      splashStore.measure();
      schedule();
    };
    const onPointer = (e: PointerEvent) => {
      pointerY = e.clientY;
      schedule();
    };

    remeasure();
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40"
      style={{ clipPath: "inset(100% 0 0 0)" }}
    >
      {tier && <SplashCursor {...TIER_CONFIG[tier]} />}
    </div>
  );
}
