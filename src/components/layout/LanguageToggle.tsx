"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES } from "@/i18n/types";
import { cn } from "@/lib/utils";

/**
 * EN/ES pill with a sliding indicator (pure CSS transform, so it needs no
 * layout-animation code). Switching re-triggers the decrypt effects.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, toggleLocale, t } = useI18n();
  const index = LOCALES.indexOf(locale);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={locale === "es"}
      title={t.controls.switchTo}
      onClick={toggleLocale}
      className={cn(
        "relative flex h-10 cursor-pointer items-center rounded-full border border-border bg-surface/70 p-1 font-mono text-[0.7rem] tracking-widest backdrop-blur-md transition-colors duration-300 hover:border-accent",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-9 rounded-full bg-accent-strong shadow-[0_0_18px_var(--accent-glow)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {LOCALES.map((code) => (
        <span
          key={code}
          className={cn(
            "relative grid h-full w-9 place-items-center rounded-full uppercase transition-colors duration-300",
            code === locale ? "text-white" : "text-muted",
          )}
        >
          {code}
        </span>
      ))}
      {/* Accessible name = visible text ("EN ES") + what the switch does. */}
      <span className="sr-only">{t.controls.switchTo}</span>
    </button>
  );
}
