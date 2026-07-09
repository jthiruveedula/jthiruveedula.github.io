import { test, expect } from '@playwright/test'

test.describe('portfolio smoke', () => {
  test('loads with hero content and no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')
    await expect(page).toHaveTitle(/Jagadeesh Thiruveedula/)
    // The intro can hide main for up to ~1.5 s; skip it so the test is deterministic.
    await page.keyboard.press('Escape')
    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    expect(errors, `console errors: ${errors.join('\n')}`).toHaveLength(0)
  })

  test('all sections render on scroll', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Escape')
    for (const id of ['timeline', 'skills', 'projects', 'impact', 'contact']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await expect(page.locator(`#${id}`)).toBeVisible()
    }
  })

  test('navigation links target existing sections', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Escape')
    const hrefs = await page.locator('nav a[href^="#"]').evaluateAll((links) =>
      links.map((l) => l.getAttribute('href')),
    )
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      await expect(page.locator(href!)).toHaveCount(1)
    }
  })
})
