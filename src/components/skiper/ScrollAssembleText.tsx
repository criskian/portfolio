"use client";

/**
 * Scroll-assembled heading — adapted from Skiper UI "skiper31" (CharacterV1,
 * https://skiper-ui.com). Free component; attribution to Skiper UI is required.
 *
 * Letters start scattered horizontally and tilted on X, then snap into the
 * word as the heading scrolls into the centre of the viewport. Changes:
 * `motion/react` import, no Lenis dependency, screen-reader text, and a
 * responsive spread so it never overflows on phones.
 */
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface CharacterProps {
  char: string;
  offset: number;
  progress: MotionValue<number>;
}

function Character({ char, offset, progress }: CharacterProps) {
  const x = useTransform(progress, [0, 1], [`${offset * 2.4}vw`, "0vw"]);
  const rotateX = useTransform(progress, [0, 1], [offset * 40, 0]);
  const opacity = useTransform(progress, [0, 0.6], [0.15, 1]);
  return (
    <motion.span
      aria-hidden
      className={cn("inline-block", char === " " && "w-[0.28em]")}
      style={{ x, rotateX, opacity }}
    >
      {char}
    </motion.span>
  );
}

export function ScrollAssembleText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 55%"] });

  const chars = text.split("");
  const center = (chars.length - 1) / 2;

  if (reducedMotion) return <h2 className={className}>{text}</h2>;

  return (
    <h2 ref={ref} className={cn("[perspective:600px]", className)}>
      <span className="sr-only">{text}</span>
      {chars.map((char, i) => (
        <Character key={i} char={char} offset={i - center} progress={scrollYProgress} />
      ))}
    </h2>
  );
}
