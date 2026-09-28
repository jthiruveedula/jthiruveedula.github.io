import { test, expect } from '@playwright/test'

test.describe('depth-charge dust field', () => {
  test('renders the dust canvas over the flight section when WebGL is available', async ({
    page,
  }) => {
    await page.goto('/')
    await page.locator('#top').scrollIntoViewIfNeeded()

    // The dust canvas is lazy-mounted (WebGL + motion allowed) and portaled
    // into .flight__stage above the plates but below the copy.
    const canvas = page.locator('canvas[data-dust]')
    await expect(canvas).toHaveCount(1)
    await expect(canvas).toHaveAttribute('aria-hidden', 'true')
  })
})

test.describe('depth-charge dust field with reduced motion', () => {
  // This Playwright version has no `reducedMotion` test-option shorthand, so
  // emulate it through the browser context (mirrors motion.spec.ts intent).
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('no dust canvas is rendered', async ({ page }) => {
    await page.goto('/')
    await page.locator('#top').scrollIntoViewIfNeeded()
    // The gating hook collapses the component to null: zero DOM, zero WebGL.
    await expect(page.locator('canvas[data-dust]')).toHaveCount(0)
  })
})
