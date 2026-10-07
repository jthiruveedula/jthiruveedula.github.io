import { test, expect } from '@playwright/test'

/** Wave 2 regressions: the few behaviours that break silently. */

test('a proof chip hash opens the matching case study', async ({ page }) => {
  await page.goto('/')
  const chip = page.locator('.proof__chip').first()
  const href = await chip.getAttribute('href')
  expect(href).toMatch(/^#.+/)
  await chip.click()
  await expect(page.locator(`article${href}`).getByRole('button', { name: /Hide the build/ })).toBeVisible()
})

test('copy-link announces to assistive tech', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  const chip = page.locator('.proof__chip').first()
  const href = await chip.getAttribute('href')
  await chip.click()
  const copy = page.locator(`article${href}`).getByRole('button', { name: 'Copy link' })
  await expect(copy).toBeVisible()
  await copy.click()
  await expect(page.locator('.project-card [role="status"]', { hasText: 'Link copied' }).first()).toBeAttached()
})

test('reduced motion skips the portal veil and still navigates', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('link', { name: 'See the career journey' }).click()
  await expect(page).toHaveURL(/\/journey\/$/)
})

test('no horizontal scroll at 375px', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } })
  const page = await context.newPage()
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.waitForLoadState('networkidle')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await context.close()
})

test('palette easter eggs match exactly, never fuzzily', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible()
  await page.keyboard.press('Control+k')
  await expect(page.locator('.cmdk__input')).toBeFocused()
  const egg = page.locator('.cmdk__item', { hasText: 'Easter egg' })
  await page.keyboard.type('whoami')
  await expect(egg).toHaveCount(1)
  await page.keyboard.press('Backspace') // 'whoam' must drop it again: stale count 1 retries until the filter settles
  await expect(egg).toHaveCount(0)
})
