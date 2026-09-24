import { Suspense } from "react";

import { SplashController } from "@/components/cursor/SplashController";
import { Header } from "@/components/layout/Header";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";
import { Hero } from "@/components/sections/hero/Hero";
import { Manifesto } from "@/components/sections/manifesto/Manifesto";
import { Projects } from "@/components/sections/projects/Projects";
import { ActivationBands } from "@/components/transitions/ActivationBands";
import { ForwardPass } from "@/components/transitions/ForwardPass";

export default function Home() {
  return (
    <>
      <PersonJsonLd />
      <Header />
      <SplashController />
      <main id="main">
        {/* Each Suspense boundary is a separate hydration unit: React hydrates the
            sections in independent tasks and yields to the main thread in between. */}
        <Suspense>
          <Hero />
        </Suspense>
        <Suspense>
          <ForwardPass />
        </Suspense>
        <Suspense>
          <Projects />
        </Suspense>
        <Suspense>
          <ActivationBands />
        </Suspense>
        <Suspense>
          <Manifesto />
        </Suspense>
      </main>
    </>
  );
}
