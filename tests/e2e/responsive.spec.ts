import { expect, test } from "@playwright/test";

const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1920];

test.describe("layout", () => {
  test.skip(({ isMobile }) => isMobile, "viewport sweep runs once, on the desktop project");

  for (const width of WIDTHS) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test("puts the portrait above the copy on mobile and beside it on desktop", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  const portrait = await page.locator("#input figure").boundingBox();
  const title = await page.locator("#hero-title").boundingBox();
  expect(portrait && title).toBeTruthy();
  if (isMobile) expect(portrait!.y + portrait!.height).toBeLessThanOrEqual(title!.y + 1);
  else expect(portrait!.x + portrait!.width).toBeLessThanOrEqual(title!.x + 1);
});
