"use client";

/**
 * Text roll — adapted from Skiper UI "skiper58" (https://skiper-ui.com).
 * Free component; attribution to Skiper UI is required. Changes: `motion/react`
 * import, screen-reader friendly (letters are aria-hidden) and focus-triggered.
 */
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const STAGGER = 0.025;

interface TextRollProps {
  children: string;
  className?: string;
  center?: boolean;
}

export function TextRoll({ children, className, center = false }: TextRollProps) {
  const letters = children.split("");
  const delayFor = (i: number) =>
    center ? STAGGER * Math.abs(i - (letters.length - 1) / 2) : STAGGER * i;

  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      whileFocus="hovered"
      className={cn("relative block overflow-hidden leading-[1.1]", className)}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden className="block">
        {letters.map((l, i) => (
          <motion.span
            key={i}
            variants={{ initial: { y: 0 }, hovered: { y: "-100%" } }}
            transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.45, delay: delayFor(i) }}
            className="inline-block whitespace-pre"
          >
            {l}
          </motion.span>
        ))}
      </span>
      <span aria-hidden className="absolute inset-0 block text-accent">
        {letters.map((l, i) => (
          <motion.span
            key={i}
            variants={{ initial: { y: "100%" }, hovered: { y: 0 } }}
            transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.45, delay: delayFor(i) }}
            className="inline-block whitespace-pre"
          >
            {l}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}
