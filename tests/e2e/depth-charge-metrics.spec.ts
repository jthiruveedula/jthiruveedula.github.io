import { test, expect } from '@playwright/test'

test.describe('depth charge — metrics decorative layers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('#index').scrollIntoViewIfNeeded()
  })

  test('volume band rows render isometric blocks', async ({ page }) => {
    const volumeBand = page.locator('#index section[aria-labelledby="band-volume-heading"]')
    await expect(volumeBand).toBeVisible()
    const blocks = volumeBand.locator('.iso-block')
    await expect(blocks.first()).toBeAttached()
    expect(await blocks.count()).toBeGreaterThan(0)
  })

  test('window band renders the radar sweep', async ({ page }) => {
    const windowBand = page.locator('#index section[aria-labelledby="band-window-heading"]')
    await expect(windowBand).toBeVisible()
    await expect(windowBand.locator('.radar-sweep')).toHaveCount(1)
  })
})
