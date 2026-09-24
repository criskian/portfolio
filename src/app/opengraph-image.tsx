import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { en } from "@/i18n/dictionaries/en";

export const alt = en.meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview, generated once at build time (dark theme, neural motif). */
export default async function OpengraphImage() {
  const portrait = await readFile(join(process.cwd(), "assets/source/portrait-transparent.png"));
  const src = `data:image/png;base64,${portrait.toString("base64")}`;

  const nodes = [
    [1120, 120],
    [1120, 250],
    [1120, 380],
    [1120, 510],
    [1060, 190],
    [1060, 320],
    [1060, 450],
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#030304",
        color: "#fafafa",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "radial-gradient(60% 70% at 25% 60%, rgba(47,123,255,0.28), transparent 70%)",
        }}
      />
      {nodes.map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 14,
            height: 14,
            borderRadius: 999,
            background: i % 3 === 0 ? "#2f7bff" : "#1c1c24",
            border: "2px solid #2f7bff",
          }}
        />
      ))}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={560}
        height={650}
        style={{ position: "absolute", left: -10, bottom: -40, objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 150,
          width: 460,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ fontSize: 20, letterSpacing: 6, color: "#a1a1aa", display: "flex" }}>
          LAYER_01 — INPUT
        </div>
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1, marginTop: 24 }}>
          Cristian Molina
        </div>
        <div style={{ fontSize: 30, color: "#a1a1aa", marginTop: 28, display: "flex" }}>
          Software engineer ·{" "}
          <span style={{ color: "#2f7bff", marginLeft: 10 }}>AI · Cloud · Data</span>
        </div>
        <div
          style={{
            marginTop: 40,
            height: 4,
            width: 120,
            background: "#2f7bff",
            borderRadius: 4,
            display: "flex",
          }}
        />
      </div>
    </div>,
    size,
  );
}
