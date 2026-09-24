"use client";

/**
 * Transition 2 → 3: "Activation".
 *
 * Two crossing React Bits <ScrollVelocity /> bands — one inverted
 * (black/white), one electric blue — whose speed reacts to the scroll
 * velocity. They only mount while near the viewport (the marquee runs a
 * per-frame animation); a static row with the same metrics stands in
 * otherwise, so there is no layout shift. The manifesto section below then
 * opens with a circular "neuron firing" reveal.
 */
import { useInView } from "motion/react";
import { useRef } from "react";

import ScrollVelocity from "@/components/reactbits/ScrollVelocity";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const TEXT_STYLE: React.CSSProperties = {
  fontSize: "clamp(1.4rem, 1rem + 2.6vw, 3.4rem)",
  lineHeight: 1.15,
  filter: "none",
};

function Band({
  text,
  velocity,
  active,
  className,
}: {
  text: string;
  velocity: number;
  active: boolean;
  className: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-x-[-6%] top-1/2 py-3 shadow-[0_20px_60px_-20px_rgb(0_0_0/0.5)] sm:py-4",
        className,
      )}
    >
      {active ? (
        <ScrollVelocity
          texts={[text]}
          velocity={velocity}
          numCopies={4}
          className="px-3 font-semibold tracking-tight uppercase"
          scrollerStyle={TEXT_STYLE}
          velocityMapping={{ input: [0, 1000], output: [0, 4] }}
        />
      ) : (
        <div
          className="overflow-hidden px-3 font-semibold tracking-tight whitespace-nowrap uppercase"
          style={TEXT_STYLE}
        >
          {`${text} ${text}`}
        </div>
      )}
    </div>
  );
}

export function ActivationBands() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "200px 0px" });
  const reducedMotion = useReducedMotion();
  const active = near && !reducedMotion;

  const bandA = `${t.activation.bandA.join("  ✦  ")}  ✦  `;
  const bandB = `${t.activation.bandB.join("  ·  ")}  ·  `;

  return (
    <div
      ref={ref}
      data-splash="off"
      aria-hidden
      className="relative h-[46svh] min-h-[300px] overflow-hidden"
    >
      <Band
        text={bandA}
        velocity={42}
        active={active}
        className="-translate-y-[70%] -rotate-[4deg] bg-fg text-bg"
      />
      <Band
        text={bandB}
        velocity={-36}
        active={active}
        className="-translate-y-[10%] rotate-[3deg] bg-accent text-white"
      />
    </div>
  );
}
