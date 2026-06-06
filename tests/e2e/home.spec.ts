import { test, expect } from '@playwright/test';

test('homepage renders the premium hero and key sections', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /I architect AI systems/i })).toBeVisible();
  await expect(page.getByText(/Private LLM applications/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore the systems/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /A premium systems surface/i })).toBeVisible();
});

test('contact and navigation links resolve', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Start a conversation/i }).click();
  await expect(page).toHaveURL(/\/contact/);
  await expect(page.getByRole('heading', { name: /Let's Build the Future/i })).toBeVisible();
});
