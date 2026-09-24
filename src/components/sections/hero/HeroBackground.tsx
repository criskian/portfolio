"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useIsLight } from "@/hooks/useIsLight";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { detectDeviceTier, hasWebGL, onIdle, type DeviceTier } from "@/lib/device";

const WebThreads = dynamic(() => import("@/components/reactbits/WebThreads"), { ssr: false });

/**
 * "Dendrites" behind the portrait: React Bits <WebThreads /> fanning out from
 * the left. Loaded after idle on capable devices; phones, reduced-motion users
 * and browsers without WebGL keep the static CSS gradient underneath.
 */
export function HeroBackground() {
  const reducedMotion = useReducedMotion();
  const [tier, setTier] = useState<DeviceTier | null>(null);

  useEffect(
    () =>
      onIdle(() => {
        if (hasWebGL()) setTier(detectDeviceTier());
      }, 1200),
    [],
  );

  const light = useIsLight();
  const animated = tier !== null && tier !== "low" && !reducedMotion;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Static layer: always present, zero cost, no layout shift. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_22%_55%,var(--accent-soft),transparent_70%)]" />
      <div className="absolute inset-0 [background-image:radial-gradient(var(--border-strong)_1px,transparent_1px)] [mask-image:radial-gradient(70%_60%_at_30%_50%,#000,transparent)] [background-size:28px_28px] opacity-60" />

      {animated && (
        <div className="absolute inset-0 animate-[fade-in_1.6s_ease-out_both] [mask-image:linear-gradient(to_bottom,#000_35%,transparent_85%)] md:[mask-image:linear-gradient(to_right,#000_25%,rgb(0_0_0/0.35)_55%,transparent_90%)]">
          <WebThreads
            fanMode="left"
            position={0.52}
            threadCount={tier === "high" ? 8 : 6}
            speed={0.12}
            spread={0.22}
            frequency={4.2}
            glow={0.018}
            brightness={light ? 0.9 : 0.4}
            thickness={1}
            opacity={light ? 0.55 : 0.7}
            mirror={false}
            grain={!light}
            grainIntensity={0.035}
            mouseInteraction={false}
            color1={light ? "#0038ff" : "#2f7bff"}
            color2={light ? "#3d6bff" : "#00b4ff"}
            color3={light ? "#0a0a0a" : "#ffffff"}
            backgroundColor={light ? "#ffffff" : "#030304"}
            lightMode={light}
            maxDpr={tier === "high" ? 1.5 : 1}
          />
        </div>
      )}
      {/* Blend the edges into the page so the section boundary disappears. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
