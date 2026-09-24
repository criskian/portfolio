"use client";

import { ProgressiveBlur } from "@/components/skiper/ProgressiveBlur";
import { TextRoll } from "@/components/skiper/TextRoll";
import { useI18n } from "@/i18n/I18nProvider";
import { SECTION_IDS } from "@/lib/constants";

import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useI18n();

  const links = [
    { href: `#${SECTION_IDS.input}`, label: t.nav.input, index: "01" },
    { href: `#${SECTION_IDS.hidden}`, label: t.nav.hidden, index: "02" },
    { href: `#${SECTION_IDS.output}`, label: t.nav.output, index: "03" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#main"
        className="sr-only rounded-full bg-accent px-4 py-2 text-sm text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10"
      >
        {t.a11y.skipToContent}
      </a>
      <ProgressiveBlur position="top" height="110px" className="-z-10" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-8">
        <a
          href={`#${SECTION_IDS.input}`}
          className="group flex items-center gap-2.5 font-mono text-xs tracking-wider"
          aria-label="Cristian Molina"
        >
          <span className="relative grid size-8 place-items-center rounded-full border border-border-strong">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--accent-glow)] transition-transform duration-500 group-hover:scale-[2.2]" />
          </span>
          <span className="hidden sm:inline">cristian.molina</span>
        </a>

        <nav aria-label={t.a11y.primaryNav} className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[0.6rem] text-muted">{link.index}</span>
                  <TextRoll>{link.label}</TextRoll>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
