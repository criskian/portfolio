import { SplashController } from "@/components/cursor/SplashController";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/hero/Hero";
import { SECTION_IDS } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <Header />
      <SplashController />
      <main id="main">
        <Hero />
        <section
          id={SECTION_IDS.hidden}
          data-splash="off"
          className="flex min-h-svh items-center justify-center"
        >
          <p className="layer-label">layer_02 — hidden</p>
        </section>
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
