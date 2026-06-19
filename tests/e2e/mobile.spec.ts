import { test, expect } from "@playwright/test";

test("mobile menu opens and closes via toggle", async ({ page }) => {
  await page.goto("/");
  const openBtn = page.getByRole("button", { name: /open menu/i });
  await expect(openBtn).toBeVisible();
  await openBtn.click();
  const closeBtn = page.getByRole("button", { name: /close menu/i });
  await expect(closeBtn).toBeVisible();
  await closeBtn.click();
  await expect(closeBtn).toBeHidden();
});

test("mobile menu closes on Escape key", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();
  const closeBtn = page.getByRole("button", { name: /close menu/i });
  await expect(closeBtn).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(closeBtn).toBeHidden();
});

test("skills orbital is responsive on mobile", async ({ page }) => {
  await page.goto("/");
  await page.locator("#skills").scrollIntoViewIfNeeded();
  const orbital = page.locator("#skills");
  await expect(orbital.getByRole("button", { name: "Cloud" })).toBeVisible();
  await expect(orbital.getByRole("button", { name: "Data Engineering" })).toBeVisible();
  await expect(orbital.getByRole("button", { name: "AI/ML" })).toBeVisible();
});

test("project card stack is tappable on mobile", async ({ page }) => {
  await page.goto("/");
  await page.locator("#projects").scrollIntoViewIfNeeded();
  const card = page.locator(".project-card").first();
  await expect(card).toBeVisible();
  await card.evaluate((el) => (el as HTMLElement).click());
  await expect(card).toBeVisible();
});

test("sections do not overflow mobile viewport", async ({ page }) => {
  await page.goto("/");
  const viewportWidth = page.viewportSize()?.width ?? 390;
  const sectionIds = ["hero", "about", "skills", "experience", "projects", "contact"];
  for (const id of sectionIds) {
    const el = page.locator(`#${id}`);
    const box = await el.boundingBox();
    if (box) {
      expect(box.x + box.width, `section #${id} overflows`).toBeLessThanOrEqual(
        viewportWidth + 1
      );
    }
  }
});

test("no horizontal scroll on mobile viewport", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth);
});
