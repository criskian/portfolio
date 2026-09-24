"use client";

/**
 * Scroll-linked word reveal — the effect of React Bits' <ScrollReveal />
 * (words brighten as the paragraph scrolls through the viewport), rebuilt
 * without GSAP and with rich-text support.
 *
 * Cheap by design: one scroll value per paragraph is written to a CSS custom
 * property (--p); each word derives its opacity from --p, its index (--i) and
 * the word count (--n) in CSS (.scroll-word in globals.css). No per-word JS.
 */
import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

import { RICH_CLASS, richWords, stripRich } from "./rich";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

export function ScrollRevealText({ text, className }: ScrollRevealTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "end 50%"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    ref.current?.style.setProperty("--p", p.toFixed(3));
  });

  const words = richWords(text);

  return (
    <p
      ref={ref}
      className={className}
      style={{ "--n": words.length, "--p": reducedMotion ? 1 : 0 } as React.CSSProperties}
    >
      <span className="sr-only">{stripRich(text)}</span>
      {words.map((pieces, i) => (
        <span
          key={i}
          aria-hidden
          className="scroll-word"
          style={{ "--i": i } as React.CSSProperties}
        >
          {pieces.map((piece, j) => (
            <span key={j} className={cn(RICH_CLASS[piece.kind])}>
              {piece.text}
            </span>
          ))}{" "}
        </span>
      ))}
    </p>
  );
}
