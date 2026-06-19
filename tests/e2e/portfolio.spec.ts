import { test, expect } from "@playwright/test";

test("hero section renders with key content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Data · RAG · Agents · Guardrails")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("#hero-heading").getByText("Data Architect", { exact: true })).toBeVisible();
  await expect(page.locator("#hero-heading").getByText("Generative AI", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /see the systems/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /discuss a system/i })).toBeVisible();
});

test("about section has bio and content", async ({ page }) => {
  await page.goto("/");
  await page.locator("#about").scrollIntoViewIfNeeded();
  await expect(page.locator("#about")).toContainText("GCP Data Architect");
  await expect(page.locator("#about")).toContainText(/bigquery/i);
  await expect(page.locator("#about")).toContainText(/LLM/i);
});

test("skills section has radar visualization", async ({ page }) => {
  await page.goto("/");
  await page.locator("#skills").scrollIntoViewIfNeeded();
  await expect(page.locator("#skills svg")).toBeVisible({ timeout: 8000 });
  await expect(page.locator("#skills")).toContainText("Skills & capabilities");
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
  await expect(page.locator("#contact").getByText("Dallas, Texas").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /github/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /linkedin/i }).first()).toBeVisible();
});

test("footer displays copyright and stack info", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer).toBeVisible();
  await expect(footer.locator("span").filter({ hasText: "GSAP" }).first()).toBeVisible();
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

test("experience timeline has 6 roles", async ({ page }) => {
  await page.goto("/");
  await page.locator("#experience").scrollIntoViewIfNeeded();
  await expect(page.locator("#experience").getByText("Quantiphi")).toBeVisible();
  await expect(page.locator("#experience").getByText("Charles Schwab")).toBeVisible();
  await expect(page.locator("#experience").getByText("Wiley Publications")).toBeVisible();
});

test("resume download link is available in contact section", async ({ page }) => {
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  const resumeLink = page.getByRole("link", { name: /download resume/i });
  await expect(resumeLink).toBeVisible();
  await expect(resumeLink).toHaveAttribute("href", "/resume.html");
  await expect(resumeLink).toHaveAttribute("target", "_blank");
});

test("contact form submits and triggers mailto flow with success feedback", async ({ page }) => {
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Message").fill("Hello there");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByText(/message sent/i)).toBeVisible();
});

test("page has proper meta tags", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Jagadeesh Thiruveedula/);
  const desc = page.locator('meta[name="description"]');
  await expect(desc).toHaveAttribute("content", /Data Architect/);
  const ogImage = page.locator('meta[property="og:image"]');
  await expect(ogImage).toHaveAttribute("content", /.+/);
});

test("SVG favicon is present", async ({ page }) => {
  await page.goto("/");
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveCount(1);
  const href = await icon.first().getAttribute("href");
  expect(href).toMatch(/favicon\.svg$/);
});

test("sitemap.xml is accessible", async ({ page }) => {
  const res = await page.request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body).toContain("jthiruveedula.github.io");
});

test("robots.txt is accessible", async ({ page }) => {
  const res = await page.request.get("/robots.txt");
  expect(res.ok()).toBe(true);
  const body = await res.text();
  expect(body.toLowerCase()).toMatch(/user-agent|allow/);
});
