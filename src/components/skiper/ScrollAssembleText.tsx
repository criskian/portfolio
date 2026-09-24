"use client";

/**
 * Scroll-assembled heading — adapted from Skiper UI "skiper31" (CharacterV1,
 * https://skiper-ui.com). Free component; attribution to Skiper UI is required.
 *
 * Letters start scattered horizontally and tilted on X, then snap into the
 * word as the heading scrolls into the centre of the viewport. Changes: one
 * scroll value per heading written to a CSS variable (--p) instead of three
 * motion values per letter, no Lenis dependency, screen-reader text, and a
 * viewport-relative spread so it never overflows on phones.
 */
import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export function ScrollAssembleText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 55%"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    ref.current?.style.setProperty("--p", p.toFixed(3));
  });

  const chars = text.split("");
  const center = (chars.length - 1) / 2;

  return (
    <h2
      ref={ref}
      className={cn("[perspective:600px]", className)}
      style={{ "--p": reducedMotion ? 1 : 0 } as React.CSSProperties}
    >
      <span className="sr-only">{text}</span>
      {chars.map((char, i) => (
        <span
          key={i}
          aria-hidden
          className={cn("assemble-char", char === " " && "w-[0.28em]")}
          style={{ "--o": i - center } as React.CSSProperties}
        >
          {char}
        </span>
      ))}
    </h2>
  );
}
