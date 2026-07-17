import { test, expect } from '@playwright/test'

test.describe('scroll-driven era wash', () => {
  const readWash = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--era-wash')
      return parseFloat(v || '0')
    })

  test('era wash scrubs from legacy to ai as the page scrolls', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Escape')

    const top = await readWash(page)
    expect(top).toBeLessThan(0.2)

    // Drive Lenis via wheel so the scrubbed ScrollTrigger updates.
    await page.mouse.move(640, 400)
    await page.mouse.wheel(0, 40000)
    await page.waitForTimeout(900)

    const bottom = await readWash(page)
    expect(bottom).toBeGreaterThan(0.8)
  })

  test('era wash is static under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const v = await readWash(page)
    expect(v).toBeCloseTo(0.5, 1)
  })
})
