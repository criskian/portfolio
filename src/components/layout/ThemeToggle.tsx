"use client";

/**
 * Theme toggle — adapted from Skiper UI "skiper26" (https://skiper-ui.com),
 * itself inspired by rudrodip/theme-toggle-effect. Free component; attribution
 * to Skiper UI is required.
 *
 * Changes: only the circle variant is kept, and the reveal now starts from the
 * exact centre of the button (instead of a fixed corner) using the View
 * Transitions API. Browsers without it — or users who prefer reduced motion —
 * get an instant switch.
 */
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useRef } from "react";

import { useMounted } from "@/hooks/useMounted";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Before hydration the theme is unknown on the server: assume the default (dark).
  const mounted = useMounted();
  const isDark = !mounted || resolvedTheme !== "light";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduceMotion || !buttonRef.current) {
      setTheme(next);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${radius}px`);

    // next-themes applies the class synchronously inside setTheme, so the
    // transition snapshot captures the new theme.
    document.startViewTransition(() => setTheme(next));
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? t.controls.themeToLight : t.controls.themeToDark}
      title={isDark ? t.controls.themeToLight : t.controls.themeToDark}
      onClick={toggle}
      className={cn(
        "group relative grid size-10 cursor-pointer place-items-center rounded-full border border-border bg-surface/70 text-fg backdrop-blur-md transition-[transform,border-color] duration-300 hover:border-accent active:scale-95",
        className,
      )}
    >
      <svg viewBox="0 0 240 240" fill="none" className="size-6" aria-hidden>
        <motion.g
          initial={false}
          animate={{ rotate: isDark ? -180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
          style={{ originX: "120px", originY: "120px" }}
        >
          <path
            d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
            fill="currentColor"
          />
          <path
            d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
            className="fill-accent"
          />
        </motion.g>
        <motion.path
          initial={false}
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}
