import { Header } from "@/components/layout/Header";
import { SECTION_IDS } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <section id={SECTION_IDS.input} className="flex min-h-svh items-center justify-center">
          <p className="layer-label">layer_01 — input</p>
        </section>
        <section id={SECTION_IDS.hidden} className="flex min-h-svh items-center justify-center">
          <p className="layer-label">layer_02 — hidden</p>
        </section>
        <section id={SECTION_IDS.output} className="flex min-h-svh items-center justify-center">
          <p className="layer-label">layer_03 — output</p>
        </section>
      </main>
    </>
  );
}
