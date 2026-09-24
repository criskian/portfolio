"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";

import { I18nProvider } from "@/i18n/I18nProvider";

const loadMotionFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider>
        {/* `strict` throws if a full `motion.*` component sneaks back in. */}
        <LazyMotion features={loadMotionFeatures} strict>
          {/* Respect the OS "reduce motion" setting for every motion component. */}
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
      </I18nProvider>
    </ThemeProvider>
  );
}
