"use client";

/**
 * Word-by-word blur reveal with rich-text support. Same motion as React Bits'
 * <BlurText /> (blur → sharp, rising from below), rebuilt so words can keep
 * the `**accent**` / `_serif_` styles from the dictionaries.
 */
import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

import { RICH_CLASS, richWords, stripRich } from "./rich";

interface BlurRichTextProps {
  text: string;
  className?: string;
  as?: "p" | "span" | "h2" | "h3";
  delay?: number;
  stagger?: number;
}

const word: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 14 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function BlurRichText({
  text,
  className,
  as = "p",
  delay = 0,
  stagger = 0.035,
}: BlurRichTextProps) {
  const Tag = motion[as];
  const words = richWords(text);

  return (
    <Tag
      className={className}
      aria-label={stripRich(text)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((pieces, i) => (
        <motion.span key={i} aria-hidden variants={word} className="inline-block">
          {pieces.map((piece, j) => (
            <span key={j} className={cn(RICH_CLASS[piece.kind])}>
              {piece.text}
            </span>
          ))}
          {i < words.length - 1 && " "}
        </motion.span>
      ))}
    </Tag>
  );
}
