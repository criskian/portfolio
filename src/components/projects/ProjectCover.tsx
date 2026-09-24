import type { CoverVariant } from "@/content/projects";

/**
 * Procedural, zero-byte project covers: one tiny SVG "diagram" per project
 * type. Grayscale at rest; the parent card (`group`) turns them electric blue
 * and starts their idle animation on hover / when active on touch devices.
 */

const W = 400;
const H = 220;

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bronze → Silver → Gold: many raw rows condense into a few curated marts. */
function Lakehouse() {
  const layers = [
    { y: 26, label: "bronze", dots: 22, r: 2.2 },
    { y: 92, label: "silver", dots: 12, r: 3.2 },
    { y: 158, label: "gold", dots: 5, r: 5 },
  ];
  return (
    <>
      {layers.map((layer, li) => (
        <g key={layer.label}>
          <rect
            x={70}
            y={layer.y}
            width={300}
            height={40}
            rx={10}
            fill="none"
            strokeOpacity={0.35 + li * 0.2}
          />
          <text
            x={30}
            y={layer.y + 24}
            className="cover-hl-text font-mono"
            fontSize={10}
            stroke="none"
            textAnchor="middle"
          >
            {layer.label}
          </text>
          {Array.from({ length: layer.dots }, (_, i) => (
            <circle
              key={i}
              cx={86 + (i * 268) / Math.max(1, layer.dots - 1)}
              cy={layer.y + 20}
              r={layer.r}
              className={li === 2 ? "cover-hl cover-pulse" : "fill-bg"}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
          {li < 2 && (
            <path
              d={`M220 ${layer.y + 44} V${layer.y + 62}`}
              className="cover-hl-stroke"
              strokeDasharray="3 4"
            />
          )}
        </g>
      ))}
    </>
  );
}

function Graph() {
  const rand = rng(7);
  const nodes = Array.from({ length: 16 }, () => ({
    x: 30 + rand() * (W - 60),
    y: 24 + rand() * (H - 48),
  }));
  const edges: [number, number][] = [];
  nodes.forEach((a, i) =>
    nodes.forEach((b, j) => {
      if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 110) edges.push([i, j]);
    }),
  );
  return (
    <>
      {edges.map(([i, j], k) => (
        <line
          key={k}
          x1={nodes[i].x}
          y1={nodes[i].y}
          x2={nodes[j].x}
          y2={nodes[j].y}
          strokeOpacity={0.45}
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i % 4 === 0 ? 6 : 3.5}
          className={i % 4 === 0 ? "cover-hl cover-pulse" : "fill-bg"}
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </>
  );
}

function Cloud() {
  const cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const hl = (r * 8 + c) % 5 === 1;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={36 + c * 42}
          y={30 + r * 42}
          width={32}
          height={32}
          rx={7}
          className={hl ? "cover-hl cover-pulse" : "fill-none"}
          style={{ animationDelay: `${(r + c) * 0.1}s` }}
        />,
      );
    }
  }
  return <>{cells}</>;
}

function Stream() {
  const wave = (amp: number, freq: number, phase: number, y: number) => {
    let d = `M0 ${y}`;
    for (let x = 0; x <= W * 2; x += 8) {
      d += ` L${x} ${y + Math.sin(x * freq + phase) * amp}`;
    }
    return d;
  };
  return (
    <g className="cover-drift">
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={wave(14 + i * 4, 0.02 + i * 0.004, i, 50 + i * 30)}
          fill="none"
          className={i === 2 ? "cover-hl-stroke" : undefined}
          strokeOpacity={i === 2 ? 1 : 0.5}
          strokeWidth={i === 2 ? 2 : 1.2}
        />
      ))}
    </g>
  );
}

function Vision() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={70 + i * 22}
          y={28 + i * 14}
          width={W - 140 - i * 44}
          height={H - 56 - i * 28}
          rx={10}
          fill="none"
          strokeOpacity={0.35 + i * 0.15}
          strokeDasharray={i === 3 ? "6 6" : undefined}
        />
      ))}
      <rect x={176} y={92} width={48} height={36} rx={4} className="cover-hl" fillOpacity={0.25} />
      <text x={176} y={86} className="cover-hl-text font-mono" fontSize={10} stroke="none">
        defect 0.97
      </text>
      <line
        x1={60}
        x2={340}
        y1={0}
        y2={0}
        className="cover-scan cover-hl-stroke"
        strokeWidth={1.5}
      />
    </>
  );
}

function Forecast() {
  const rand = rng(21);
  const pts = Array.from({ length: 21 }, (_, i) => ({
    x: 20 + i * 18,
    y: 150 - i * 3.2 - Math.sin(i / 1.6) * 18 - rand() * 10,
  }));
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  const future = pts.slice(13);
  const band =
    future.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y - 8 - i * 3}`).join(" ") +
    " " +
    [...future]
      .reverse()
      .map((p, i) => `L${p.x} ${p.y + 8 + (future.length - 1 - i) * 3}`)
      .join(" ") +
    " Z";
  return (
    <>
      {[60, 110, 160].map((y) => (
        <line key={y} x1={20} x2={380} y1={y} y2={y} strokeOpacity={0.2} />
      ))}
      <path d={band} className="cover-hl" fillOpacity={0.18} stroke="none" />
      <path d={line} fill="none" strokeWidth={1.6} />
      <path
        d={future.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ")}
        fill="none"
        strokeWidth={2}
        strokeDasharray="5 5"
        className="cover-hl-stroke"
      />
    </>
  );
}

function Agents() {
  const cx = W / 2;
  const cy = H / 2;
  const orbit = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2;
    return { x: cx + Math.cos(a) * 150, y: cy + Math.sin(a) * 78 };
  });
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={150} ry={78} fill="none" strokeOpacity={0.3} />
      <ellipse cx={cx} cy={cy} rx={90} ry={46} fill="none" strokeOpacity={0.2} />
      {orbit.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          strokeOpacity={0.35}
          strokeDasharray="3 5"
        />
      ))}
      <g className="cover-spin" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {orbit.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={7}
            className={i % 3 === 0 ? "cover-hl" : "fill-bg"}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={16} className="cover-hl cover-pulse" />
    </>
  );
}

const VARIANTS: Record<CoverVariant, () => React.JSX.Element> = {
  lakehouse: Lakehouse,
  graph: Graph,
  cloud: Cloud,
  stream: Stream,
  vision: Vision,
  forecast: Forecast,
  agents: Agents,
};

export function ProjectCover({ variant }: { variant: CoverVariant }) {
  const Variant = VARIANTS[variant];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="project-cover size-full stroke-current"
      aria-hidden
    >
      <Variant />
    </svg>
  );
}
