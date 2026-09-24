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
        <Hero />
        <ForwardPass />
        <Projects />
        <ActivationBands />
        <Manifesto />
      </main>
    </>
  );
}
