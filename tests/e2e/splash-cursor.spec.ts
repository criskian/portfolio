import { expect, test, type Page } from "@playwright/test";

/**
 * Non-negotiable requirement: the SplashCursor is active on the hero and the
 * manifesto, and disabled over the projects section.
 */
test.skip(({ isMobile }) => isMobile, "pointer zones are exercised with a mouse on desktop");

const state = (page: Page) => page.locator("html").getAttribute("data-splash-state");

async function wiggle(page: Page, y: number) {
  for (let i = 0; i < 12; i++) await page.mouse.move(300 + i * 30, y + (i % 2) * 20);
}

async function scrollToSection(page: Page, id: string) {
  await page.evaluate((sectionId) => {
    document.getElementById(sectionId)!.scrollIntoView({ block: "start" });
  }, id);
  await page.waitForTimeout(200);
}

test("splash cursor is on over the hero, off over projects, on over the manifesto", async ({
  page,
}) => {
  await page.goto("/");

  await wiggle(page, 450);
  await expect.poll(() => state(page)).toBe("on");
  // Lazily mounted on the first interaction.
  await expect(page.locator("div.fixed.inset-0.z-40 canvas")).toHaveCount(1, { timeout: 10_000 });

  await scrollToSection(page, "hidden-layers");
  await wiggle(page, 450);
  await expect.poll(() => state(page)).toBe("off");
  // The canvas is fully clipped while only the projects are on screen.
  await expect(page.locator("div.fixed.inset-0.z-40")).toHaveCSS(
    "clip-path",
    /inset\(100% 0px 0px\)/,
  );

  await scrollToSection(page, "output");
  await wiggle(page, 450);
  await expect.poll(() => state(page)).toBe("on");
});

test("splash cursor is disabled for reduced-motion users", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await wiggle(page, 450);
  await expect(page.locator("html")).toHaveAttribute("data-splash-state", "disabled");
  await expect(page.locator("div.fixed.inset-0.z-40")).toHaveCount(0);
  await context.close();
});
