/**
 * Text roll — adapted from Skiper UI "skiper58" (https://skiper-ui.com).
 * Free component; attribution to Skiper UI is required.
 *
 * Changes: pure CSS port (the original animates every letter with motion
 * components; here each letter only gets a --i index and CSS transitions do
 * the rest — see .roll in globals.css), screen-reader friendly, and
 * triggered by keyboard focus as well as hover.
 */
import { cn } from "@/lib/utils";

interface TextRollProps {
  children: string;
  className?: string;
}

export function TextRoll({ children, className }: TextRollProps) {
  const letters = children.split("");
  const row = (extra: string) => (
    <span aria-hidden className={cn("block", extra)}>
      {letters.map((l, i) => (
        <span key={i} className="roll-letter" style={{ "--i": i } as React.CSSProperties}>
          {l}
        </span>
      ))}
    </span>
  );

  return (
    <span className={cn("roll relative block overflow-hidden leading-[1.1]", className)}>
      <span className="sr-only">{children}</span>
      {row("roll-top")}
      {row("roll-bottom absolute inset-0 text-accent")}
    </span>
  );
}
