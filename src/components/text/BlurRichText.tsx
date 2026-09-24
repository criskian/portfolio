"use client";

/**
 * Word-by-word blur reveal with rich-text support. Same motion as React Bits'
 * <BlurText /> (blur → sharp, rising from below), rebuilt so words keep the
 * `**accent**` / `_serif_` styles from the dictionaries.
 *
 * Performance: no animation library — one IntersectionObserver flips
 * `data-visible` and CSS transitions do the rest (.blur-word in globals.css).
 */
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { cn } from "@/lib/utils";

import { RICH_CLASS, richWords, stripRich } from "./rich";

interface BlurRichTextProps {
  text: string;
  className?: string;
  as?: "p" | "span" | "h2" | "h3";
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
}

export function BlurRichText({
  text,
  className,
  as: Tag = "p",
  delay = 0,
  stagger = 0.035,
}: BlurRichTextProps) {
  const { ref, visible } = useInViewOnce<HTMLElement>(0.3);
  const words = richWords(text);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={className}
      data-visible={visible}
      style={{ "--delay": `${delay}s`, "--stagger": `${stagger}s` } as React.CSSProperties}
    >
      <span className="sr-only">{stripRich(text)}</span>
      {words.map((pieces, i) => (
        <span key={i} aria-hidden className="blur-word" style={{ "--i": i } as React.CSSProperties}>
          {pieces.map((piece, j) => (
            <span key={j} className={cn(RICH_CLASS[piece.kind])}>
              {piece.text}
            </span>
          ))}
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
