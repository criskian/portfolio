import { SplashController } from "@/components/cursor/SplashController";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/hero/Hero";
import { Projects } from "@/components/sections/projects/Projects";
import { ForwardPass } from "@/components/transitions/ForwardPass";
import { SECTION_IDS } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <Header />
      <SplashController />
      <main id="main">
        <Hero />
        <ForwardPass />
        <Projects />
        <section
          id={SECTION_IDS.output}
          data-splash="on"
          className="flex min-h-svh items-center justify-center"
        >
          <p className="layer-label">layer_03 — output</p>
        </section>
      </main>
    </>
  );
}
