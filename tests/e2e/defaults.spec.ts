import { expect, test } from "@playwright/test";

test("loads in dark mode and English by default", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveClass(/\bdark\b/);
  await expect(html).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(/Cristian Molina/);
  await expect(page.getByRole("heading", { level: 1, name: "Cristian Molina" })).toBeVisible();
});

test("renders the three sections in order", async ({ page }) => {
  await page.goto("/");
  const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(["input", "hidden-layers", "output"]);
});

test("lists every project", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hidden-layers article")).toHaveCount(6);
});
