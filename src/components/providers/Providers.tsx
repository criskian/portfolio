"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";

import { I18nProvider } from "@/i18n/I18nProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider>
        {/* Respect the OS "reduce motion" setting for every motion component. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </I18nProvider>
    </ThemeProvider>
  );
}
