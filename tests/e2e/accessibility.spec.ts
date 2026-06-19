import { test, expect } from "@playwright/test";

test("all buttons have accessible names", async ({ page }) => {
  await page.goto("/");
  const buttons = page.getByRole("button");
  const count = await buttons.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    const name = await btn.evaluate((el) => {
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim().length > 0) return aria;
      return (el.textContent || "").trim();
    });
    expect(name.length, `button #${i} missing accessible name`).toBeGreaterThan(0);
  }
});

test("all images have alt text", async ({ page }) => {
  await page.goto("/");
  const imgs = page.locator("img");
  const count = await imgs.count();
  for (let i = 0; i < count; i++) {
    const alt = await imgs.nth(i).getAttribute("alt");
    expect(alt, `img #${i} missing alt`).not.toBeNull();
  }
});

test("page has exactly one h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("page has h2 section headings", async ({ page }) => {
  await page.goto("/");
  const h2s = page.locator("h2");
  const count = await h2s.count();
  expect(count).toBeGreaterThan(0);
  await expect(h2s.first()).toBeVisible();
});

test("skip link is present and targets #main", async ({ page }) => {
  await page.goto("/");
  const skip = page.locator('a[href="#main"]').first();
  await expect(skip).toHaveCount(1);
  await expect(page.locator("#main")).toHaveCount(1);
});

test("nav buttons are keyboard focusable", async ({ page }) => {
  await page.goto("/");
  const homeBtn = page.getByRole("button", { name: "Home" }).first();
  await homeBtn.focus();
  const isFocused = await homeBtn.evaluate((el) => document.activeElement === el);
  expect(isFocused).toBe(true);
});

test("keyboard focus shows a visible focus indicator", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      tag: el.tagName,
      outlineStyle: s.outlineStyle,
      outlineWidth: s.outlineWidth,
      boxShadow: s.boxShadow,
    };
  });
  expect(focused, "nothing received focus on Tab").not.toBeNull();
  const hasOutline =
    focused!.outlineStyle !== "none" && focused!.outlineWidth !== "0px";
  const hasRing = focused!.boxShadow !== "none";
  expect(hasOutline || hasRing, "focused element has no visible focus indicator").toBe(
    true
  );
});

test("aria-hidden is used on decorative elements", async ({ page }) => {
  await page.goto("/");
  const hidden = page.locator('[aria-hidden="true"]');
  expect(await hidden.count()).toBeGreaterThan(0);
});

test("contact form fields have associated labels", async ({ page }) => {
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  for (const id of ["name", "email", "message"]) {
    const input = page.locator(`#${id}`);
    const label = page.locator(`label[for="${id}"]`);
    await expect(input).toBeVisible();
    await expect(label).toBeVisible();
  }
});

test("text has defined color and background (contrast smoke check)", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const body = document.body;
    const heading = document.querySelector("h1") || document.querySelector("h2");
    return {
      bodyBg: getComputedStyle(body).backgroundColor,
      headingColor: heading ? getComputedStyle(heading).color : "",
    };
  });
  expect(result.bodyBg).not.toBe("rgba(0, 0, 0, 0)");
  expect(result.headingColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(result.headingColor).not.toBe(result.bodyBg);
});
