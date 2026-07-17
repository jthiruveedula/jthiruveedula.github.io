import { test, expect } from '@playwright/test'

test.describe('SEO & social discovery', () => {
  test('serves robots.txt and sitemap.xml', async ({ request }) => {
    const robots = await request.get('/robots.txt')
    expect(robots.ok()).toBeTruthy()
    expect(await robots.text()).toContain('Sitemap:')

    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    const body = await sitemap.text()
    expect(body).toContain('https://jthiruveedula.github.io/')
    expect(body).toContain('/resume.html')
  })

  test('exposes OpenGraph + Twitter social card meta', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /og-image\.svg$/,
    )
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200')
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630')
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      /og-image\.svg$/,
    )
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')
  })

  test('loads brand webfonts without render-blocking stylesheet', async ({ request }) => {
    // The served HTML must use a preload→stylesheet swap (not a blocking <link rel="stylesheet">)
    // for the brand fonts. The only render-blocking font reference should live inside <noscript>.
    const html = await (await request.get('/')).text()
    expect(html).toContain('rel="preload"')
    expect(html).toContain('as="style"')
    expect(html).toContain('fonts.googleapis.com')

    // Strip every <noscript> block, then assert no blocking font stylesheet remains outside them.
    const withoutNoscript = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '')
    expect(withoutNoscript).not.toContain('rel="stylesheet" href="https://fonts.googleapis.com')
  })
})

test.describe('first paint & loading intro', () => {
  test('main is painted immediately and hero reveals after intro hands off', async ({ page }) => {
    await page.goto('/')
    // main is no longer gated behind an `invisible` class — it paints under the intro overlay.
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('#hero')).toBeVisible()

    // Before the intro completes, hero headline words are pre-hidden (no flash, no jump).
    const hiddenWords = await page
      .locator('#hero .split-word')
      .evaluateAll((els) => els.length > 0 && els.every((el) => Number(getComputedStyle(el).opacity) < 0.1))
    expect(hiddenWords).toBeTruthy()

    // Skip the intro — hero headline should reveal (opacity returns to ~1).
    await page.keyboard.press('Escape')
    await expect
      .poll(
        async () =>
          page
            .locator('#hero .split-word')
            .evaluateAll((els) => els.length > 0 && els.every((el) => Number(getComputedStyle(el).opacity) > 0.9)),
        { timeout: 4000 },
      )
      .toBeTruthy()
  })

  test('hero content is fully visible under reduced motion (no intro gate)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('main')).toBeVisible()
    // Under reduced motion the loading intro is skipped entirely and words are shown.
    await expect
      .poll(
        async () =>
          page
            .locator('#hero .split-word')
            .evaluateAll((els) => els.length > 0 && els.every((el) => Number(getComputedStyle(el).opacity) > 0.9)),
        { timeout: 4000 },
      )
      .toBeTruthy()

    // Reduced motion must skip the WebGL scene entirely (no <canvas>), rendering the
    // lightweight 2D fallback so the ~180KB three.js chunk never loads.
    await expect(page.locator('#hero canvas')).toHaveCount(0)
  })
})
