"use client";

/**
 * Transition 1 → 2: "Forward pass".
 *
 * A sticky SVG neural network whose connections draw themselves layer by layer
 * as you scroll (the scroll-linked path drawing of Skiper UI "skiper19"), with
 * nodes activating in cascade, signal pulses travelling along a few edges and
 * an epoch/loss read-out that converges while you scroll.
 *
 * Performance: every value is driven by one scroll MotionValue; the read-out
 * writes textContent directly (no React re-render per frame). Pulses use SMIL
 * <animateMotion>, and there are fewer nodes on small screens.
 */
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useMemo, useRef } from "react";

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

// Scroll windows (0..1) in which each group of edges draws itself.
const EDGE_WINDOWS: [number, number][] = [
  [0.08, 0.34],
  [0.32, 0.58],
  [0.56, 0.8],
];

function Edges({
  paths,
  progress,
  gradient,
}: {
  paths: string[];
  progress: MotionValue<number>;
  gradient: string;
}) {
  return (
    <g>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={`url(#${gradient})`}
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: progress }}
        />
      ))}
    </g>
  );
}

function Layer({ nodes, activation }: { nodes: Node[]; activation: MotionValue<number> }) {
  const glow = useTransform(activation, [0, 1], [0, 0.35]);
  const fill = useTransform(activation, [0, 1], [0, 1]);
  return (
    <g>
      {nodes.map((n, i) => (
        <g key={i}>
          <motion.circle
            cx={n.x}
            cy={n.y}
            r={22}
            className="fill-accent"
            style={{ opacity: glow }}
          />
          <circle
            cx={n.x}
            cy={n.y}
            r={9}
            className="fill-bg stroke-border-strong"
            strokeWidth={1.5}
          />
          <motion.circle
            cx={n.x}
            cy={n.y}
            r={9}
            className="fill-accent"
            style={{ opacity: fill }}
          />
        </g>
      ))}
    </g>
  );
}

export function ForwardPass() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const epochRef = useRef<HTMLSpanElement>(null);
  const lossRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Reduced motion: the network is shown fully trained, without scroll-jacking.
  const trained = useMotionValue(1);
  const progress = reducedMotion ? trained : scrollYProgress;

  const desktop = useMemo(() => buildNetwork([4, 6, 6, 3]), []);
  const mobile = useMemo(() => buildNetwork([3, 5, 5, 2]), []);

  const e0 = useTransform(progress, EDGE_WINDOWS[0], [0, 1]);
  const e1 = useTransform(progress, EDGE_WINDOWS[1], [0, 1]);
  const e2 = useTransform(progress, EDGE_WINDOWS[2], [0, 1]);
  const edgeProgress = [e0, e1, e2];

  const a0 = useTransform(progress, [0.02, 0.1], [0, 1]);
  const a1 = useTransform(progress, [0.3, 0.38], [0, 1]);
  const a2 = useTransform(progress, [0.54, 0.62], [0, 1]);
  const a3 = useTransform(progress, [0.78, 0.86], [0, 1]);
  const activations = [a0, a1, a2, a3];

  const netScale = useTransform(progress, [0, 0.12, 0.88, 1], [0.92, 1, 1, 1.06]);
  const netOpacity = useTransform(progress, [0, 0.08, 0.9, 1], [0, 1, 1, 0]);
  const pulseOpacity = useTransform(progress, [0.82, 0.9], [0, 1]);

  useMotionValueEvent(progress, "change", (p) => {
    const epoch = Math.max(1, Math.round(p * 100));
    const loss = 0.9312 * Math.exp(-3.9 * p) + 0.0187 * p;
    if (epochRef.current) epochRef.current.textContent = String(epoch).padStart(3, "0");
    if (lossRef.current) lossRef.current.textContent = loss.toFixed(4);
  });

  const renderNetwork = (net: ReturnType<typeof buildNetwork>, id: string, className: string) => (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
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
      {net.edges.map((paths, i) => (
        <Edges key={i} paths={paths} progress={edgeProgress[i]} gradient={id} />
      ))}
      {net.layers.map((nodes, i) => (
        <Layer key={i} nodes={nodes} activation={activations[i]} />
      ))}
      {!reducedMotion && (
        <motion.g style={{ opacity: pulseOpacity }}>
          {net.edges
            .flat()
            .filter((_, i) => i % 7 === 0)
            .map((d, i) => (
              <circle key={i} r={3.5} className="fill-accent-glow">
                <animateMotion dur={`${1.6 + (i % 4) * 0.35}s`} repeatCount="indefinite" path={d} />
              </circle>
            ))}
        </motion.g>
      )}
    </svg>
  );

  return (
    <div
      ref={ref}
      data-splash="off"
      aria-hidden
      className={reducedMotion ? "relative py-24" : "relative h-[190svh] md:h-[230svh]"}
    >
      <div
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

        <motion.div
          style={{ scale: netScale, opacity: reducedMotion ? 1 : netOpacity }}
          className="w-full max-w-6xl px-4"
        >
          {renderNetwork(desktop, "fp-edge-lg", "hidden h-auto w-full md:block")}
          {renderNetwork(mobile, "fp-edge-sm", "block h-auto w-full md:hidden")}
        </motion.div>

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
