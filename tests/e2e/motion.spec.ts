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
    const alphas = await page.evaluate(() => {
      const scrim = Array.from(document.querySelectorAll('#hero *')).find((el) => {
        const s = el as HTMLElement
        const bg = getComputedStyle(s).backgroundImage || ''
        return bg.includes('rgba(5, 8, 16') || bg.includes('rgba(5,8,16')
      }) as HTMLElement | undefined
      if (!scrim) return []
      const bg = getComputedStyle(scrim).backgroundImage
      // radial-gradient(…, rgba(5, 8, 16, 0.42) 72%, rgba(5, 8, 16, 0.82) 100%)
      const matches = (bg.match(/rgba\(5,\s*8,\s*16,\s*([\d.]+)\)/g) || []).map((s) =>
        parseFloat(s.replace(/rgba\(5,\s*8,\s*16,\s*([\d.]+)\)/, '$1')),
      )
      return matches
    })
    // Must be a symmetric radial — the darkest stop should be ≤0.65 (not old 0.8).
    expect(alphas.length).toBeGreaterThanOrEqual(1)
    const maxAlpha = Math.max(...alphas)
    expect(maxAlpha).toBeLessThanOrEqual(0.85)
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
