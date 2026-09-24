"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { DEFAULT_LOCALE, LOCALES, type Dictionary, type Locale } from "./types";

const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value);
}

/**
 * Client-side i18n. English is rendered into the static HTML (default, and
 * the SEO language); Spanish is a runtime switch so the page — and the
 * persistent WebGL cursor — never remounts. `?lang=es` gives a shareable
 * Spanish link.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("lang");
    // Syncing from the URL is only possible after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isLocale(fromQuery)) setLocaleState(fromQuery);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = DICTIONARIES[locale].meta.title;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    const url = new URL(window.location.href);
    if (next === DEFAULT_LOCALE) url.searchParams.delete("lang");
    else url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "es" : "en");
  }, [locale, setLocale]);

  const value = useMemo(
    () => ({ locale, t: DICTIONARIES[locale], setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
