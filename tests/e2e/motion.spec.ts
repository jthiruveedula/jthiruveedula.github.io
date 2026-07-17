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

test.describe('hero mindscape balance', () => {
  test('legibility scrim is balanced (left side not over-darkened) so the left cluster stays visible', async ({
    page,
  }) => {
    await page.goto('/')
    const stops = await page.evaluate(() => {
      const scrim = Array.from(document.querySelectorAll('#hero *')).find((el) =>
        String(el.className || '').includes('bg-gradient-to-r'),
      ) as HTMLElement | undefined
      const bg = scrim ? getComputedStyle(scrim).backgroundImage : ''
      // e.g. linear-gradient(to right, oklab(...) / 0.8 0%, ... / 0.22 50%, ... / 0.45 100%)
      const alphas = (bg.match(/\/\s*([\d.]+)\s*\)/g) || []).map((s) =>
        parseFloat(s.replace(/\/\s*([\d.]+)\s*\)/, '$1')),
      )
      return alphas
    })
    // Left stop must not be the old 0.8 over-darken that hid the legacy cluster.
    expect(stops.length).toBeGreaterThanOrEqual(1)
    expect(stops[0]).toBeLessThanOrEqual(0.65)
  })

  test('hero mindscape canvas spans the full hero width', async ({ page }) => {
    await page.goto('/')
    await page
      .waitForFunction(
        () => {
          const c = document.querySelector('#hero canvas')
          const h = document.querySelector('#hero')
          return c && h && c.getBoundingClientRect().width > h.getBoundingClientRect().width * 0.9
        },
        { timeout: 10000 },
      )
      .catch(() => {})
    const box = await page.evaluate(() => {
      const hero = document.querySelector('#hero')!.getBoundingClientRect()
      const canvas = document.querySelector('#hero canvas')?.getBoundingClientRect()
      return { heroW: hero.width, canvasW: canvas?.width ?? 0 }
    })
    expect(box.canvasW).toBeGreaterThan(box.heroW * 0.95)
  })
})
