import { test, expect } from "@playwright/test";

test("hero section renders with key content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("DATA ARCHITECT · GCP & GENERATIVE AI")).toBeVisible();
  await expect(page.getByRole("heading", { name: /architecting/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /view my work/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /contact me/i })).toBeVisible();
});

test("about section has bio and location", async ({ page }) => {
  await page.goto("/");
  await page.locator("#about").scrollIntoViewIfNeeded();
  await expect(page.locator("#about")).toContainText(/based in/i);
  await expect(page.locator("#about")).toContainText("Corinth, Texas");
});

test("skills section has category cards", async ({ page }) => {
  await page.goto("/");
  await page.locator("#skills").scrollIntoViewIfNeeded();
  await expect(page.locator("#skills").getByRole("heading", { name: "Cloud", exact: true })).toBeVisible();
  await expect(page.locator("#skills").getByRole("heading", { name: "Data Engineering", exact: true })).toBeVisible();
  await expect(page.locator("#skills").getByRole("heading", { name: "AI/ML", exact: true })).toBeVisible();
});

test("projects section has filter and cards", async ({ page }) => {
  await page.goto("/");
  await page.locator("#projects").scrollIntoViewIfNeeded();
  await expect(page.locator("#projects").getByText("Dual-Agent Platform")).toBeVisible();
  await expect(page.locator("#projects").getByText("RAG Pipeline — GCP / Vertex AI")).toBeVisible();
});

test("contact section has form and links", async ({ page }) => {
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.locator("#contact").getByText("Corinth, Texas (DFW)").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /github/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /linkedin/i }).first()).toBeVisible();
});

test("footer displays copyright and stack info", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
  await expect(footer.locator("span").filter({ hasText: "GSAP" })).toBeVisible();
  await expect(footer).toContainText("Next.js");
});
