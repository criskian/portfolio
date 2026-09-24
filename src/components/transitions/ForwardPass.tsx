"use client";

/**
 * Transition 1 → 2: "Forward pass".
 *
 * A sticky SVG neural network whose connections draw themselves layer by layer
 * as you scroll (the scroll-linked path drawing of Skiper UI "skiper19"), with
 * nodes activating in cascade, signal pulses travelling along a few edges and
 * an epoch/loss read-out that converges while you scroll.
 *
 * Performance:
 *  - The SVG (~250 nodes) is client-only and mounts when the section is
 *    ~1 viewport away, in a single variant (desktop or mobile), so it never
 *    weighs on the initial HTML or hydration.
 *  - One scroll listener writes a handful of CSS custom properties; edges,
 *    nodes and the read-out react through CSS (normalised pathLength="1" +
 *    stroke-dashoffset). No per-element JS or animation components.
 *  - Pulses use SMIL <animateMotion>.
 */
import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useI18n } from "@/i18n/I18nProvider";

const VIEW = { w: 1200, h: 640 };
const LAYER_X = [140, 453, 766, 1080];

interface Node {
  x: number;
  y: number;
}

function buildNetwork(sizes: number[]) {
  const layers: Node[][] = sizes.map((count, li) => {
    const gap = VIEW.h / (count + 1);
    return Array.from({ length: count }, (_, i) => ({ x: LAYER_X[li], y: gap * (i + 1) }));
  });
  const edges = layers.slice(0, -1).map((layer, li) =>
    layer.flatMap((a) =>
      layers[li + 1].map((b) => {
        const dx = (b.x - a.x) / 2;
        return `M${a.x} ${a.y} C${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`;
      }),
    ),
  );
  return { layers, edges };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));

/** Scroll progress (0..1) → every CSS variable the network needs. */
function progressVars(p: number) {
  return {
    "--e0": range(p, 0.08, 0.34),
    "--e1": range(p, 0.32, 0.58),
    "--e2": range(p, 0.56, 0.8),
    "--a0": range(p, 0.02, 0.1),
    "--a1": range(p, 0.3, 0.38),
    "--a2": range(p, 0.54, 0.62),
    "--a3": range(p, 0.78, 0.86),
    "--pulse": range(p, 0.82, 0.9),
    "--net-opacity": Math.min(range(p, 0, 0.08), 1 - range(p, 0.9, 1)),
    "--net-scale": 0.92 + 0.08 * range(p, 0, 0.12) + 0.06 * range(p, 0.88, 1),
  };
}

function Network({ sizes, gradientId }: { sizes: number[]; gradientId: string }) {
  const net = useMemo(() => buildNetwork(sizes), [sizes]);
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--accent-glow)" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Faint "untrained" wiring underneath. */}
      <g className="stroke-border" strokeWidth={1} fill="none">
        {net.edges.flat().map((d, i) => (
          <path key={i} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      {net.edges.map((paths, gi) => (
        <g
          key={gi}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={1.2}
          style={{ "--draw": `var(--e${gi})` } as React.CSSProperties}
        >
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className="fp-edge"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      ))}
      {net.layers.map((nodes, li) => (
        <g key={li} style={{ "--act": `var(--a${li})` } as React.CSSProperties}>
          {nodes.map((n, i) => (
            <g key={i}>
              <circle
                cx={n.x}
                cy={n.y}
                r={22}
                className="fill-accent"
                style={{ opacity: "calc(var(--act) * 0.35)" }}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={9}
                className="fill-bg stroke-border-strong"
                strokeWidth={1.5}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={9}
                className="fill-accent"
                style={{ opacity: "var(--act)" }}
              />
            </g>
          ))}
        </g>
      ))}
      <g style={{ opacity: "var(--pulse)" }}>
        {net.edges
          .flat()
          .filter((_, i) => i % 7 === 0)
          .map((d, i) => (
            <circle key={i} r={3.5} className="fill-accent-glow">
              <animateMotion dur={`${1.6 + (i % 4) * 0.35}s`} repeatCount="indefinite" path={d} />
            </circle>
          ))}
      </g>
    </svg>
  );
}

const DESKTOP = [4, 6, 6, 3];
const MOBILE = [3, 5, 5, 2];

export function ForwardPass() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const epochRef = useRef<HTMLSpanElement>(null);
  const lossRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const [variant, setVariant] = useState<"desktop" | "mobile" | null>(null);

  // Mount the network only when the section gets close to the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVariant(window.matchMedia("(min-width: 768px)").matches ? "desktop" : "mobile");
        io.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const apply = (p: number) => {
    const stage = stageRef.current;
    if (stage) {
      for (const [key, value] of Object.entries(progressVars(p))) {
        stage.style.setProperty(key, value.toFixed(3));
      }
    }
    const epoch = Math.max(1, Math.round(p * 100));
    const loss = 0.9312 * Math.exp(-3.9 * p) + 0.0187 * p;
    if (epochRef.current) epochRef.current.textContent = String(epoch).padStart(3, "0");
    if (lossRef.current) lossRef.current.textContent = loss.toFixed(4);
  };

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!reducedMotion) apply(p);
  });

  // Reduced motion: show the network fully trained, without scroll-jacking.
  useEffect(() => {
    if (reducedMotion && variant) apply(1);
  });

  return (
    <div
      ref={ref}
      data-splash="off"
      aria-hidden
      className={reducedMotion ? "relative py-24" : "relative h-[190svh] md:h-[230svh]"}
    >
      <div
        ref={stageRef}
        style={progressVars(0) as unknown as React.CSSProperties}
        className={
          reducedMotion
            ? "flex flex-col items-center justify-center"
            : "sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden"
        }
      >
        <div className="layer-label mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-accent" />
          {t.forwardPass.label}
          <span className="h-px w-8 bg-accent" />
        </div>

        <div
          className="aspect-15/8 w-full max-w-6xl px-4"
          style={{
            opacity: reducedMotion ? 1 : "var(--net-opacity)",
            transform: reducedMotion ? undefined : "scale(var(--net-scale))",
          }}
        >
          {variant && (
            <Network
              sizes={variant === "desktop" ? DESKTOP : MOBILE}
              gradientId={`fp-edge-${variant}`}
            />
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 font-mono text-xs text-muted">
          <p className="tabular-nums">
            {t.forwardPass.epoch}{" "}
            <span ref={epochRef} className="text-fg">
              001
            </span>
            /100
            <span className="mx-3 text-border-strong">|</span>
            {t.forwardPass.loss}{" "}
            <span ref={lossRef} className="text-accent">
              0.9312
            </span>
          </p>
          <p className="text-[0.7rem] tracking-wider">{t.forwardPass.caption}</p>
        </div>
      </div>
    </div>
  );
}
