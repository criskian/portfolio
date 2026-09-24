/**
 * Progressive blur — adapted from Skiper UI "skiper41" (https://skiper-ui.com).
 * Free component; attribution to Skiper UI is required. Changes: themeable via
 * CSS variables instead of a hard-coded background colour.
 */
import { cn } from "@/lib/utils";

interface ProgressiveBlurProps {
  className?: string;
  position?: "top" | "bottom";
  height?: string;
  blurAmount?: string;
}

export function ProgressiveBlur({
  className,
  position = "top",
  height = "120px",
  blurAmount = "8px",
}: ProgressiveBlurProps) {
  const isTop = position === "top";
  const direction = isTop ? "to bottom" : "to top";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 select-none", className)}
      style={{
        [isTop ? "top" : "bottom"]: 0,
        height,
        background: `linear-gradient(${direction}, var(--bg), transparent)`,
        maskImage: `linear-gradient(${direction}, #000 45%, transparent)`,
        WebkitMaskImage: `linear-gradient(${direction}, #000 45%, transparent)`,
        backdropFilter: `blur(${blurAmount})`,
        WebkitBackdropFilter: `blur(${blurAmount})`,
      }}
    />
  );
}
