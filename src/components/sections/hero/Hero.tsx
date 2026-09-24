"use client";

import { ArrowDownIcon, GitHubIcon, LinkedInIcon } from "@/components/icons";
import { Portrait } from "@/components/portrait/Portrait";
import Magnet from "@/components/reactbits/Magnet";
import RotatingText from "@/components/reactbits/RotatingText";
import StarBorder from "@/components/reactbits/StarBorder";
import { BlurRichText } from "@/components/text/BlurRichText";
import DecryptedText from "@/components/reactbits/DecryptedText";
import { SOCIAL } from "@/content/social";
import { useI18n } from "@/i18n/I18nProvider";
import { SECTION_IDS } from "@/lib/constants";

import { HeroBackground } from "./HeroBackground";

const DECRYPT_CHARS = "01<>/{}[]#$%&*+=~NEURONSIGNAL";

export function Hero() {
  const { t, locale } = useI18n();
  const { hero } = t;

  return (
    <section
      id={SECTION_IDS.input}
      data-splash="on"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-20 pb-16 sm:pt-24"
    >
      <HeroBackground />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-6 px-4 sm:px-8 md:grid-cols-[5fr_7fr] md:gap-10 lg:gap-16">
        {/* Portrait — left on desktop, top on mobile. */}
        {/* CSS entrance (not JS) so the portrait — the LCP element — paints immediately. */}
        <div className="relative mx-auto w-[min(72vw,40svh)] animate-[portrait-in_1.1s_var(--ease-out-expo)_both] md:w-full md:max-w-[520px]">
          <Portrait alt={hero.portraitAlt} />
          <span className="layer-label absolute top-[18%] -right-3 hidden [writing-mode:vertical-rl] md:block">
            node[0] · activation 0.97
          </span>
        </div>

        {/* Copy — right on desktop, bottom on mobile. */}
        <div className="relative text-center md:text-left">
          <p className="layer-label mb-5 flex items-center justify-center gap-3 md:justify-start">
            <span className="h-px w-8 bg-accent" />
            {hero.label}
          </p>

          <p className="mb-2 font-mono text-sm text-muted">
            <DecryptedText
              key={`greeting-${locale}`}
              text={hero.greeting}
              animateOn="view"
              sequential
              speed={28}
              characters={DECRYPT_CHARS}
              encryptedClassName="text-accent"
            />
          </p>

          <h1 id="hero-title" className="name-in text-display font-semibold">
            {/* Decrypts again on hover; the load entrance is CSS so the LCP paints at once. */}
            <DecryptedText
              text={hero.name}
              animateOn="hover"
              sequential
              revealDirection="start"
              speed={45}
              characters={DECRYPT_CHARS}
              encryptedClassName="text-accent"
            />
          </h1>

          <p className="mt-5 flex flex-col items-center gap-x-2 text-lead text-muted md:flex-row md:items-baseline md:justify-start">
            <span>{hero.rolePrefix}</span>
            <RotatingText
              key={`roles-${locale}`}
              texts={[...hero.roles]}
              rotationInterval={2600}
              staggerDuration={0.02}
              staggerFrom="first"
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-110%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 380 }}
              mainClassName="overflow-hidden font-serif text-[1.2em] italic text-accent"
              splitLevelClassName="overflow-hidden pb-1"
            />
          </p>

          <BlurRichText
            key={`intro-${locale}`}
            text={hero.intro}
            delay={0.35}
            stagger={0.018}
            className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-pretty text-fg/80 sm:text-lg md:mx-0"
          />

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4 md:justify-start">
            <StarBorder
              as="a"
              href={`#${SECTION_IDS.hidden}`}
              color="var(--accent-glow)"
              speed="5s"
              backgroundColor="var(--surface)"
              textColor="var(--fg)"
              borderColor="var(--border-strong)"
              className="group rounded-full [&>div:last-child]:rounded-full [&>div:last-child]:px-6 [&>div:last-child]:py-3.5 [&>div:last-child]:text-sm"
            >
              <span className="flex items-center gap-2.5">
                {hero.cta}
                <ArrowDownIcon className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </span>
            </StarBorder>

            <div className="flex items-center gap-2">
              {[
                { ...SOCIAL.github, Icon: GitHubIcon },
                { ...SOCIAL.linkedin, Icon: LinkedInIcon },
              ].map(({ href, label, Icon }) => (
                <Magnet key={label} padding={40} magnetStrength={3}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid size-12 place-items-center rounded-full border border-border bg-surface/60 text-fg transition-colors duration-300 hover:border-accent hover:text-accent"
                  >
                    <Icon className="size-5" />
                  </a>
                </Magnet>
              ))}
            </div>
          </div>

          <p className="mt-8 flex items-center justify-center gap-2.5 font-mono text-xs text-muted md:justify-start">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {hero.status}
          </p>
        </div>
      </div>

      <a
        href={`#${SECTION_IDS.hidden}`}
        aria-hidden
        tabIndex={-1}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.6rem] tracking-[0.3em] text-muted uppercase md:flex"
      >
        scroll
        <span className="relative h-10 w-px overflow-hidden bg-border-strong">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-hint_1.8s_var(--ease-in-out-quart)_infinite] bg-accent" />
        </span>
      </a>
    </section>
  );
}
