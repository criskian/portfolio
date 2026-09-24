import { expect, test } from "@playwright/test";

test("language toggle switches the copy to Spanish and back", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("switch", { name: /en\s*es/i });
  await expect(page.getByRole("link", { name: /Explore the hidden layers/ })).toBeVisible();

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page).toHaveURL(/\?lang=es/);
  await expect(page.getByRole("link", { name: /Explora las capas ocultas/ })).toBeVisible();

  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).not.toHaveURL(/lang=/);
});

test("?lang=es opens the Spanish version", async ({ page }) => {
  await page.goto("/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { name: "Capas ocultas" })).toBeAttached();
});

test("theme toggle switches to light and persists", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("switch", { name: /light mode/i }).click();
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  await expect(page.getByRole("switch", { name: /dark mode/i })).toBeVisible();
});
