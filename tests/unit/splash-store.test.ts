import { beforeEach, describe, expect, it } from "vitest";

import { splashStore } from "@/components/cursor/splash-store";

/** Lay out three stacked sections: hero (on) 0–800, projects (off) 800–2000, manifesto (on) 2000–3000. */
function mountSections() {
  document.body.innerHTML = `
    <section data-splash="on" id="a"></section>
    <section data-splash="off" id="b"></section>
    <section data-splash="on" id="c"></section>`;
  const boxes: Record<string, [number, number]> = { a: [0, 800], b: [800, 2000], c: [2000, 3000] };
  for (const [id, [top, bottom]] of Object.entries(boxes)) {
    const el = document.getElementById(id)!;
    el.getBoundingClientRect = () =>
      ({ top: top - window.scrollY, bottom: bottom - window.scrollY }) as DOMRect;
  }
}

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
}

describe("splash zones", () => {
  beforeEach(() => {
    scrollTo(0);
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    mountSections();
    splashStore.measure();
  });

  it("is active over the hero and inactive over the projects", () => {
    expect(splashStore.isActiveAt(400)).toBe(true);
    scrollTo(1000);
    expect(splashStore.isActiveAt(400)).toBe(false);
  });

  it("is active again over the manifesto", () => {
    scrollTo(2100);
    expect(splashStore.isActiveAt(100)).toBe(true);
  });

  it("clips the canvas to the visible active band only", () => {
    scrollTo(400); // hero 0–400 visible (viewport 400–1200), projects below
    expect(splashStore.visibleBand()).toEqual({ top: 0, bottom: 400 });
    scrollTo(1000); // only projects visible
    expect(splashStore.visibleBand()).toBeNull();
  });
});
