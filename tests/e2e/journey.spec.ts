import { test, expect } from '@playwright/test'

/**
 * The /journey/ page — a second static entry (its own index.html/JS/CSS, see
 * vite.config.ts), so this is a real navigation rather than a route within the
 * main SPA. Covers the two contracts that matter most: the chapters are always
 * readable text, and prefers-reduced-motion swaps in the static skyline with
 * zero scrubbed motion.
 */
test.describe('the career journey', () => {
  test('loads and shows every chapter as real text', async ({ page }) => {
    await page.goto('/journey/')
    await expect(page).toHaveTitle(/Career Journey/)

    const headings = await page.locator('h2').allTextContents()
    expect(headings.map((h) => h.trim())).toEqual([
      'Data foundations',
      'Cloud at scale',
      'GenAI accelerators',
      'Forward deployed',
      'Applied GenAI',
    ])

    // Every chapter's copy is in the accessibility tree regardless of scroll
    // position or which one the camera currently favors.
    for (const id of ['foundations', 'cloud-at-scale', 'genai-accelerators', 'forward-deployed', 'applied-genai']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
      await expect(page.locator(`#${id} h2`)).not.toBeEmpty()
    }

    // Final chapter carries the single CTA.
    await expect(page.getByRole('link', { name: /get in touch/i })).toHaveAttribute(
      'href',
      'mailto:jagadeeshthiruveedula77@gmail.com',
    )
    await expect(page.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
      'href',
      'https://linkedin.com/in/jagadeesh-thiruveedula',
    )
  })

  test('prefers-reduced-motion shows the static skyline with no scrub', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/journey/')

    // No canvas mounted at all — the static path never imports three.js.
    await expect(page.locator('canvas')).toHaveCount(0)

    // Chapters are all present, unconditionally opaque (no IntersectionObserver
    // fade class gating them), and readable without scrolling.
    const opacities = await page
      .locator('.journey-chapter__panel')
      .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)))
    expect(opacities).toHaveLength(5)

    await expect(page.locator('#foundations h2')).toHaveText('Data foundations')
  })

  test('the main site links to the journey', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[href="/journey/"]').first()).toBeAttached()
  })
})
