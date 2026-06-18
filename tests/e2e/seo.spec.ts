import { test, expect } from "@playwright/test";

test("page has a proper title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Jagadeesh Thiruveedula/);
});

test("page has a meta description", async ({ page }) => {
  await page.goto("/");
  const desc = page.locator('meta[name="description"]');
  await expect(desc).toHaveAttribute("content", /Data Architect/);
});

test("page has Open Graph tags", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /.+/
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    /.+/
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website"
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    /jthiruveedula\.github\.io/
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /.+/
  );
});

test("page has Twitter Card tags", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image"
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    /.+/
  );
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
    "content",
    /.+/
  );
});

test("page has a canonical URL", async ({ page }) => {
  await page.goto("/");
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  const href = await canonical.first().getAttribute("href");
  expect(href).toMatch(/jthiruveedula\.github\.io/);
});

test("page has proper heading hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  const h2Count = await page.locator("h2").count();
  expect(h2Count).toBeGreaterThan(0);
});

test("sitemap.xml is served and lists the site", async ({ page }) => {
  const res = await page.request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toContain("jthiruveedula.github.io");
});

test("robots.txt is served and allows crawling", async ({ page }) => {
  const res = await page.request.get("/robots.txt");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toMatch(/User-agent/i);
  expect(body).toMatch(/Allow/i);
});
