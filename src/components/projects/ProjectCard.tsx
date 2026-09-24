"use client";

import * as m from "motion/react-m";

import BorderGlow from "@/components/reactbits/BorderGlow";
import { AnimatedLink } from "@/components/skiper/AnimatedLink";
import DecryptedText from "@/components/reactbits/DecryptedText";
import type { Project } from "@/content/projects";
import { useCenterActive } from "@/hooks/useCenterActive";
import { useIsLight } from "@/hooks/useIsLight";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

import { ProjectCover } from "./ProjectCover";

const GLOW_COLORS = ["#2f7bff", "#00b4ff", "#5ea0ff"];

interface ProjectCardProps {
  project: Project;
  index: number;
}

/**
 * Hover choreography (desktop) / centre-of-screen activation (touch):
 *  - React Bits <BorderGlow />: electric edge that follows the pointer
 *  - cover goes grayscale → electric blue and starts its idle animation
 *  - title decrypts (React Bits <DecryptedText />)
 *  - card lifts, stack chips light up in sequence
 */
export function ProjectCard({ project, index }: ProjectCardProps) {
  const { t, locale } = useI18n();
  const { ref, active } = useCenterActive<HTMLDivElement>();
  const light = useIsLight();
  const wide = project.size === "wide";

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "h-full",
        project.size === "lg" && "md:col-span-2",
        wide && "md:col-span-2 lg:col-span-3",
      )}
    >
      <BorderGlow
        className="h-full transition-transform duration-500 ease-out hover:-translate-y-1"
        backgroundColor={light ? "#f4f5f7" : "#0b0b0f"}
        borderRadius={24}
        glowRadius={32}
        glowColor="218 100 62"
        glowIntensity={light ? 0.7 : 1}
        edgeSensitivity={24}
        coneSpread={22}
        fillOpacity={0.35}
        colors={GLOW_COLORS}
        animated={active}
      >
        <article
          data-active={active}
          className={cn(
            "group flex h-full flex-col gap-5 p-5 sm:p-6",
            wide && "lg:flex-row lg:gap-8",
          )}
        >
          <div className={cn("flex flex-col", wide && "lg:w-[46%] lg:shrink-0")}>
            <div className="flex items-center justify-between font-mono text-[0.65rem] tracking-widest text-muted uppercase">
              <span>
                <span className="text-accent">{String(index + 1).padStart(2, "0")}</span> /{" "}
                {project.cover}
              </span>
              <span>{project.year}</span>
            </div>
            <div
              className={cn(
                "relative mt-4 overflow-hidden rounded-2xl border border-border bg-surface-2",
                project.size === "lg" ? "aspect-[16/8]" : "aspect-[16/9]",
                wide && "lg:aspect-auto lg:flex-1",
              )}
            >
              <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.05] group-data-[active=true]:scale-[1.05]">
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0 group-data-[active=true]:grayscale-0"
                  />
                ) : (
                  <ProjectCover variant={project.cover} />
                )}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,var(--accent-soft),transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-data-[active=true]:opacity-100" />
              {project.featured && (
                <span className="absolute top-3 left-3 rounded-full border border-accent/40 bg-bg/70 px-2.5 py-1 font-mono text-[0.6rem] tracking-widest text-accent uppercase backdrop-blur">
                  {t.projects.featured}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <p className="font-mono text-xs text-accent">{project.tagline[locale]}</p>
            <h3 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
              <DecryptedText
                key={`${project.slug}-${locale}`}
                text={project.title}
                animateOn="inViewHover"
                sequential
                speed={40}
                characters="01<>/{}#%&*+=NEURAL"
                encryptedClassName="text-accent"
              />
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-pretty text-muted">
              {project.summary[locale]}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs">
              <div>
                <dt className="font-mono text-[0.6rem] tracking-widest text-muted uppercase">
                  {t.projects.role}
                </dt>
                <dd className="mt-1 text-fg">{project.role[locale]}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.6rem] tracking-widest text-muted uppercase">
                  {t.projects.impact}
                </dt>
                <dd className="mt-1 font-mono text-accent">{project.impact[locale]}</dd>
              </div>
            </dl>

            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
              {project.stack.map((tech, i) => (
                <li
                  key={tech}
                  style={{ transitionDelay: `${i * 45}ms` }}
                  className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.65rem] text-muted transition-colors duration-300 group-hover:border-accent/40 group-hover:text-fg group-data-[active=true]:border-accent/40 group-data-[active=true]:text-fg"
                >
                  {tech}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center gap-5 pt-6 text-sm">
              {project.links.case && (
                <AnimatedLink href={project.links.case} className="text-fg">
                  {t.projects.viewCase}
                </AnimatedLink>
              )}
              {project.links.repo && (
                <AnimatedLink href={project.links.repo} className="text-muted hover:text-fg">
                  {t.projects.viewCode}
                </AnimatedLink>
              )}
            </div>
          </div>
        </article>
      </BorderGlow>
    </m.div>
  );
}
