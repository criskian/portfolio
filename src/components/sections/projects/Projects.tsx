"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { ScrollAssembleText } from "@/components/skiper/ScrollAssembleText";
import { BlurRichText } from "@/components/text/BlurRichText";
import { PROJECTS, PROJECTS_ARE_MOCKS } from "@/content/projects";
import { useIsLight } from "@/hooks/useIsLight";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useI18n } from "@/i18n/I18nProvider";
import { SECTION_IDS } from "@/lib/constants";
import { detectDeviceTier, onIdle } from "@/lib/device";

// gsap + InertiaPlugin only load for desktop users who reach this section.
const DotGrid = dynamic(() => import("@/components/reactbits/DotGrid"), { ssr: false });

/**
 * Section 2 — hidden layers. The SplashCursor is OFF here (data-splash="off");
 * instead the pointer "activates neurons" on a React Bits <DotGrid />.
 */
export function Projects() {
  const { t, locale } = useI18n();
  const reducedMotion = useReducedMotion();
  const [interactive, setInteractive] = useState(false);

  useEffect(
    () =>
      onIdle(() => {
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        setInteractive(fine && detectDeviceTier() !== "low");
      }, 2500),
    [],
  );

  const light = useIsLight();

  return (
    <section
      id={SECTION_IDS.hidden}
      data-splash="off"
      aria-labelledby="projects-title"
      className="relative isolate py-24 sm:py-32"
    >
      {/* Neuron field: sticky to the viewport so only ~1k dots are ever drawn. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="sticky top-0 h-svh w-full [mask-image:radial-gradient(80%_70%_at_50%_50%,#000,transparent)]">
          {interactive && !reducedMotion ? (
            <DotGrid
              dotSize={2}
              gap={30}
              baseColor={light ? "#d4d8e0" : "#1c1c24"}
              activeColor={light ? "#0038ff" : "#2f7bff"}
              proximity={140}
              shockRadius={220}
              shockStrength={4}
              className="p-0!"
            />
          ) : (
            <div className="size-full [background-image:radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:30px_30px] opacity-70" />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <header className="mb-14 flex flex-col items-center text-center sm:mb-20">
          <p className="layer-label mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            {t.projects.label}
            <span className="h-px w-8 bg-accent" />
          </p>
          <div id="projects-title">
            <ScrollAssembleText
              key={locale}
              text={t.projects.title}
              className="text-headline font-semibold"
            />
          </div>
          <BlurRichText
            key={`sub-${locale}`}
            text={t.projects.subtitle}
            className="mt-5 max-w-xl text-lead text-muted"
          />
          {PROJECTS_ARE_MOCKS && (
            <p className="mt-4 font-mono text-[0.7rem] tracking-wider text-muted/70">
              {"// "}
              {t.projects.mockNotice}
            </p>
          )}
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
