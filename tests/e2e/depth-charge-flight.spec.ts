import { test, expect } from '@playwright/test'

/**
 * The flight's pointer parallax ("depth charge"). The scrub camera writes
 * only scale/opacity on the plates; a pointer layer writes x/y on top,
 * scaled per plate so the front plate moves most. These are DOM assertions
 * only — pixel assertions would be flaky by design, since the offsets are
 * pointer-driven tweens.
 */

test.describe('flight pointer parallax', () => {
  test('the copy wrapper exists inside .flight__copy', async ({ page }) => {
    await page.goto('/')
    const copy = page.locator('.flight__copy')
    await expect(copy).toHaveCount(1)
    const wrapper = copy.locator('[data-parallax-copy]')
    await expect(wrapper).toHaveCount(1)
    // The headline cut animation must still find its targets inside the wrapper.
    await expect(wrapper.locator('[data-cut]').first()).toHaveCount(1)
  })

  test('all seven depth plates exist, front to back', async ({ page }) => {
    await page.goto('/')
    const plates = page.locator('[data-plane]')
    await expect(plates).toHaveCount(7)
    // The parallax depth factor derives from authored zIndex:
    // plane 0 (front) at zIndex 7 down to plane 6 at zIndex 1.
    const zIndexes = await plates.evaluateAll((els) =>
      els.map((el) => Number(getComputedStyle(el).zIndex)),
    )
    expect(zIndexes).toEqual([7, 6, 5, 4, 3, 2, 1])
  })
})
