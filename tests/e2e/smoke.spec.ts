import { test, expect } from '@playwright/test'

test.describe('portfolio smoke', () => {
  test('loads with hero content and no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')
    await expect(page).toHaveTitle(/Jagadeesh Thiruveedula/)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    expect(errors, `console errors: ${errors.join('\n')}`).toHaveLength(0)
  })

  test('all sections render on scroll', async ({ page }) => {
    await page.goto('/')
    for (const id of ['ledger', 'systems', 'skills', 'index', 'contact']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await expect(page.locator(`#${id}`)).toBeVisible()
    }
  })

  test('navigation links target existing sections', async ({ page }) => {
    await page.goto('/')
    const hrefs = await page.locator('nav a[href^="#"]').evaluateAll((links) =>
      links.map((l) => l.getAttribute('href')),
    )
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      await expect(page.locator(href!)).toHaveCount(1)
    }
  })

  test('an opened case study shows its before/after strip, not a description paragraph', async ({
    page,
  }) => {
    await page.goto('/')
    await page.locator('#systems').scrollIntoViewIfNeeded()
    // Open the first case study's wiring panel.
    await page.getByRole('button', { name: '+ Open the wiring' }).first().click()
    const panel = page.locator('#systems article').first()
    await expect(panel.getByText('Before', { exact: true })).toBeVisible()
    await expect(panel.getByText('After', { exact: true })).toBeVisible()
  })
})
