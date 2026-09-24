"use client";

import { useScroll, useTransform } from "motion/react";
import * as m from "motion/react-m";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { ArrowUpRightIcon } from "@/components/icons";
import ClickSpark from "@/components/reactbits/ClickSpark";
import Magnet from "@/components/reactbits/Magnet";
import ShinyText from "@/components/reactbits/ShinyText";
import { BlurRichText } from "@/components/text/BlurRichText";
import { ScrollRevealText } from "@/components/text/ScrollRevealText";
import { CONTACT_HREF } from "@/content/social";
import { useIsLight } from "@/hooks/useIsLight";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useI18n } from "@/i18n/I18nProvider";
import { SECTION_IDS } from "@/lib/constants";
import { detectDeviceTier, hasWebGL, onIdle } from "@/lib/device";

import { Footer } from "./Footer";

const Particles = dynamic(() => import("@/components/reactbits/Particles"), { ssr: false });

/**
 * Section 3 — output layer. SplashCursor is ON again (data-splash="on").
 * Opens with a circular clip-path reveal driven by the scroll: the neuron
 * "fires" from the top-centre and the section expands out of it.
 */
export function Manifesto() {
  const { t, locale } = useI18n();
  const { manifesto } = t;
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const light = useIsLight();
  const [particles, setParticles] = useState(false);

  useEffect(
    () =>
      onIdle(() => {
        const fine = window.matchMedia("(pointer: fine)").matches;
        setParticles(fine && hasWebGL() && detectDeviceTier() !== "low");
      }, 3000),
    [],
  );

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 10%"] });
  const clipPath = useTransform(scrollYProgress, (p) =>
    p >= 0.995 ? "none" : `circle(${(8 + p * 140).toFixed(2)}vmax at 50% 0%)`,
  );
  const ringScale = useTransform(scrollYProgress, [0, 1], [0.2, 2.4]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 1, 0]);

  return (
    <m.section
      ref={ref}
      id={SECTION_IDS.output}
      data-splash="on"
      aria-labelledby="manifesto-title"
      style={reducedMotion ? undefined : { clipPath }}
      className="relative isolate overflow-hidden bg-bg pt-28 sm:pt-36"
    >
      {/* Background: firing ring + glow + (desktop) particle field. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[80svh] bg-[radial-gradient(55%_45%_at_50%_0%,var(--accent-soft),transparent_75%)]" />
        {!reducedMotion && (
          <m.div
            style={{ scale: ringScale, opacity: ringOpacity }}
            className="absolute top-0 left-1/2 size-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/50 shadow-[0_0_80px_var(--accent-soft)]"
          />
        )}
        <div className="sticky top-0 h-svh w-full">
          {particles && !reducedMotion && (
            <Particles
              particleCount={140}
              particleSpread={12}
              speed={0.05}
              particleColors={light ? ["#0038ff", "#3d6bff"] : ["#2f7bff", "#5ea0ff", "#ffffff"]}
              particleBaseSize={70}
              sizeRandomness={0.8}
              alphaParticles
              moveParticlesOnHover={false}
              pixelRatio={1}
            />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <p className="layer-label mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-accent" />
          {manifesto.label}
        </p>
        <h2 id="manifesto-title" className="text-headline font-semibold">
          <BlurRichText key={`title-${locale}`} as="span" text={manifesto.title} />
        </h2>

        <div className="mt-12 space-y-10 sm:mt-16 sm:space-y-12">
          {manifesto.paragraphs.map((paragraph, i) => (
            <ScrollRevealText
              key={`${locale}-${i}`}
              text={paragraph}
              className="text-[clamp(1.3rem,1rem+1.3vw,2.1rem)] leading-[1.35] font-medium tracking-tight text-balance"
            />
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start gap-5 sm:mt-20 sm:flex-row sm:items-center">
          <Magnet padding={60} magnetStrength={4}>
            <ClickSpark sparkColor={light ? "#0038ff" : "#5ea0ff"} sparkRadius={28} sparkCount={10}>
              <a
                href={CONTACT_HREF}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-accent-strong px-7 py-4 text-base font-medium text-white shadow-[0_10px_40px_-10px_var(--accent)] transition-transform duration-300 hover:scale-[1.03] active:scale-95"
              >
                {manifesto.cta}
                <ArrowUpRightIcon className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </ClickSpark>
          </Magnet>
          <ShinyText
            key={`hint-${locale}`}
            text={manifesto.ctaHint}
            speed={3}
            color="var(--muted)"
            shineColor="var(--fg)"
            className="font-mono text-xs"
          />
        </div>
      </div>

      <Footer />
    </m.section>
  );
}
