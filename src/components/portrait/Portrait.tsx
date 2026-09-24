import { PORTRAIT } from "@/content/portrait";
import { cn } from "@/lib/utils";

const srcSet = (format: "avif" | "webp") =>
  PORTRAIT.widths.map((w) => `${PORTRAIT.basePath}-${w}.${format} ${w}w`).join(", ");

interface PortraitProps {
  alt: string;
  className?: string;
  /** Matches the rendered width so the browser picks the smallest adequate file. */
  sizes?: string;
}

/**
 * Theme-aware portrait (server component — zero JS).
 *
 * Layers, back to front:
 *   1. halo  — wide blurred silhouette, "breathes" (opacity only → compositor)
 *   2. rim   — thin dilated silhouette peeking out around the edges
 *   3. photo — responsive AVIF/WebP
 * The whole stack fades out at the bottom so the shirt dissolves into the page.
 * Colours come from --portrait-halo / --portrait-rim / --portrait-aura, so a
 * single set of pre-baked masks serves both themes.
 */
export function Portrait({
  alt,
  className,
  sizes = "(min-width: 768px) 42vw, 78vw",
}: PortraitProps) {
  const mask = (url: string) =>
    ({
      maskImage: `url(${url})`,
      WebkitMaskImage: `url(${url})`,
      maskSize: "100% 100%",
      WebkitMaskSize: "100% 100%",
    }) as const;

  return (
    <figure
      className={cn("portrait-fade relative isolate mx-auto w-full select-none", className)}
      style={{ aspectRatio: `${PORTRAIT.width} / ${PORTRAIT.height}` }}
    >
      <div
        aria-hidden
        className="absolute inset-0 scale-[1.08] bg-(--portrait-aura) opacity-70"
        style={mask(PORTRAIT.halo)}
      />
      <div
        aria-hidden
        className="portrait-breathe absolute inset-0 bg-(--portrait-halo)"
        style={mask(PORTRAIT.halo)}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-(--portrait-rim)"
        style={mask(PORTRAIT.rim)}
      />
      <picture>
        <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
        {}
        <img
          src={`${PORTRAIT.basePath}-640.webp`}
          alt={alt}
          width={PORTRAIT.width}
          height={PORTRAIT.height}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          draggable={false}
          className="relative size-full object-contain"
        />
      </picture>
    </figure>
  );
}
