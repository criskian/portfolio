#!/usr/bin/env node
/**
 * Image pipeline — runs before `dev` and `build`.
 *
 * Source:  assets/source/portrait-transparent.png (RGBA, ~480 KB, 28% empty top)
 * Output:  public/images/generated/
 *   portrait-{w}.avif|webp   responsive, trimmed, black & white portrait
 *   portrait-halo.webp       wide blurred silhouette  (alpha mask, tinted in CSS)
 *   portrait-rim.webp        thin dilated silhouette  (alpha mask, tinted in CSS)
 *   portrait-og.png          black & white PNG for the Open Graph image
 *
 * The glow is pre-baked as alpha masks so it costs nothing at runtime and a
 * single asset serves both themes (the colour comes from CSS variables).
 */
import { existsSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "assets/source/portrait-transparent.png");
const OUT_DIR = path.join(ROOT, "public/images/generated");

/** Keep in sync with src/content/portrait.ts */
const WIDTHS = [320, 480, 640, 800];
const MARGIN = { x: 110, top: 160 };
const ALPHA_THRESHOLD = 16;

async function subjectBox(image) {
  const { data, info } = await image
    .clone()
    .extractChannel("alpha")
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const left = Math.max(0, minX - MARGIN.x);
  const top = Math.max(0, minY - MARGIN.top);
  const right = Math.min(info.width, maxX + MARGIN.x);
  return { left, top, width: right - left, height: info.height - top };
}

/** Build a white RGBA image whose alpha is a processed copy of the subject's alpha. */
async function alphaMask(cropped, { width, dilate, blur }) {
  let alpha = cropped.clone().resize({ width }).extractChannel("alpha");
  // Dilate: blur then threshold grows the silhouette by ~`dilate` px.
  if (dilate) alpha = sharp(await alpha.blur(dilate).threshold(12).toBuffer());
  const soft = await alpha.blur(blur).toBuffer();
  const { height } = await sharp(soft).metadata();

  return sharp({
    create: { width, height, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .joinChannel(soft)
    .webp({ quality: 70, alphaQuality: 100 });
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.warn(`[images] source not found: ${path.relative(ROOT, SOURCE)} — skipping`);
    return;
  }
  const manifest = path.join(OUT_DIR, "portrait.json");
  if (!process.argv.includes("--force") && existsSync(manifest)) {
    const [out, src, self] = await Promise.all(
      [manifest, SOURCE, fileURLToPath(import.meta.url)].map((f) => stat(f)),
    );
    if (out.mtimeMs > src.mtimeMs && out.mtimeMs > self.mtimeMs) {
      console.log("[images] up to date — skipping (use --force to rebuild)");
      return;
    }
  }
  await mkdir(OUT_DIR, { recursive: true });

  const source = sharp(SOURCE).ensureAlpha();
  const box = await subjectBox(source);
  const cropped = sharp(await source.clone().extract(box).png().toBuffer());
  // Black & white portrait (the alpha channel is left untouched).
  const mono = sharp(await cropped.clone().greyscale().png().toBuffer());

  const outputs = [];
  for (const width of WIDTHS) {
    const resized = mono.clone().resize({ width, withoutEnlargement: true });
    const avif = path.join(OUT_DIR, `portrait-${width}.avif`);
    const webp = path.join(OUT_DIR, `portrait-${width}.webp`);
    await resized.clone().avif({ quality: 58, effort: 6 }).toFile(avif);
    await resized.clone().webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(webp);
    outputs.push(avif, webp);
  }

  const halo = path.join(OUT_DIR, "portrait-halo.webp");
  const rim = path.join(OUT_DIR, "portrait-rim.webp");
  await (await alphaMask(cropped, { width: 400, dilate: 6, blur: 22 })).toFile(halo);
  await (await alphaMask(cropped, { width: 800, dilate: 2.2, blur: 1.4 })).toFile(rim);
  outputs.push(halo, rim);

  // PNG copy for the Open Graph image (satori does not decode AVIF/WebP).
  const og = path.join(OUT_DIR, "portrait-og.png");
  await mono.clone().resize({ width: 640 }).png({ compressionLevel: 9 }).toFile(og);
  outputs.push(og);

  await writeFile(
    manifest,
    JSON.stringify({ width: box.width, height: box.height, widths: WIDTHS }, null, 2),
  );

  for (const file of outputs) {
    const { size } = await stat(file);
    console.log(`[images] ${path.basename(file).padEnd(22)} ${(size / 1024).toFixed(1)} KB`);
  }
  console.log(`[images] crop ${box.width}×${box.height} (from ${box.left},${box.top})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
