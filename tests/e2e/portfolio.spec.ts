import { test, expect } from "@playwright/test";

test("hero section renders with key content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Data · RAG · Agents · Guardrails")).toBeVisible();
  await expect(page.getByText("Command Surface for")).toBeVisible();
  await expect(page.getByRole("link", { name: /see the systems/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /discuss a system/i })).toBeVisible();
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

test("architecture pipeline has 5 steps", async ({ page }) => {
  await page.goto("/");
  await page.locator("#pipeline").scrollIntoViewIfNeeded();
  await expect(page.locator("#pipeline").getByRole("heading", { name: "Ingest" })).toBeVisible();
  await expect(page.locator("#pipeline").getByRole("heading", { name: "Embed" })).toBeVisible();
  await expect(page.locator("#pipeline").getByRole("heading", { name: "Retrieve" })).toBeVisible();
  await expect(page.locator("#pipeline").getByRole("heading", { name: "Govern" })).toBeVisible();
  await expect(page.locator("#pipeline").getByRole("heading", { name: "Serve" })).toBeVisible();
});

test("professional metrics displays counters", async ({ page }) => {
  await page.goto("/");
  await page.locator("#metrics").scrollIntoViewIfNeeded();
  await expect(page.locator("#metrics").getByText("Production Deployments")).toBeVisible();
  await expect(page.locator("#metrics").getByText("Enterprise Clients")).toBeVisible();
  await expect(page.locator("#metrics").getByText("RAG Pipelines")).toBeVisible();
  await expect(page.locator("#metrics").getByText("Agentic Workflows")).toBeVisible();
});

test("experience timeline has 6 roles", async ({ page }) => {
  await page.goto("/");
  await page.locator("#experience").scrollIntoViewIfNeeded();
  await expect(page.locator("#experience").getByText("Quantiphi")).toBeVisible();
  await expect(page.locator("#experience").getByText("Charles Schwab")).toBeVisible();
  await expect(page.locator("#experience").getByText("Wiley Publications")).toBeVisible();
});
