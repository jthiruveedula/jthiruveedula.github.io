import { test, expect } from '@playwright/test';

test('homepage renders the premium hero and key sections', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /I architect AI systems/i })).toBeVisible();
  await expect(page.getByText(/Private LLM applications/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /See the systems/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /The gap between a demo and production is/i })).toBeVisible();
});

test('primary CTAs and section navigation resolve', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /Discuss a system/i }).click();
  await expect(page).toHaveURL(/\/contact/);
  await expect(page.getByRole('heading', { name: /Let's Build the Future/i })).toBeVisible();

  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about/);
  await expect(page.getByRole('heading', { name: /About Me/i })).toBeVisible();

  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Experience' }).click();
  await expect(page).toHaveURL(/\/experience/);
  await expect(page.getByRole('heading', { name: /Experience Timeline/i })).toBeVisible();

  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Skills' }).click();
  await expect(page).toHaveURL(/\/skills/);
  await expect(page.getByRole('heading', { name: /Skills & Certifications/i })).toBeVisible();
});
