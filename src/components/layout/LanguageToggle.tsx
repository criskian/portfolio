"use client";

import { motion } from "motion/react";

import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES } from "@/i18n/types";
import { cn } from "@/lib/utils";

/** EN/ES pill with a sliding indicator. Switching re-triggers the decrypt effects. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, toggleLocale, t } = useI18n();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={locale === "es"}
      aria-label={`${t.controls.language}: ${locale.toUpperCase()}. ${t.controls.switchTo}`}
      title={t.controls.switchTo}
      onClick={toggleLocale}
      className={cn(
        "relative flex h-10 cursor-pointer items-center rounded-full border border-border bg-surface/70 p-1 font-mono text-[0.7rem] tracking-widest backdrop-blur-md transition-colors duration-300 hover:border-accent",
        className,
      )}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <span
            key={code}
            aria-hidden
            className={cn(
              "relative z-10 grid h-full w-9 place-items-center rounded-full uppercase transition-colors duration-300",
              active ? "text-white" : "text-muted",
            )}
          >
            {active && (
              <motion.span
                layoutId="language-indicator"
                className="absolute inset-0 -z-10 rounded-full bg-accent shadow-[0_0_18px_var(--accent-glow)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {code}
          </span>
        );
      })}
    </button>
  );
}
