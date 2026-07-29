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

    // Must be a raster format. This test previously asserted `.svg`, which locked in a
    // card that renders blank on LinkedIn, X, Slack, WhatsApp and Facebook — none of them
    // support SVG in link previews, and those are the only places this URL gets shared.
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /og-image\.(png|jpe?g)$/,
    )
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200')
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630')
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    )
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      /og-image\.(png|jpe?g)$/,
    )
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US')
  })

  test('the social card image is served as a real raster file', async ({ page, request }) => {
    await page.goto('/')
    const url = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content')
    // Fetch the path the tag actually advertises, so a repointed tag with a missing file
    // fails here rather than silently on someone's LinkedIn feed.
    const res = await request.get(new URL(url!).pathname)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/image\/(png|jpeg)/)
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
  test('main and the first station paint immediately, then the intro hands off', async ({ page }) => {
    await page.goto('/')
    // main is no longer gated behind an `invisible` class — it paints under the intro overlay.
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('#hero')).toBeVisible()

    // The opening station is readable straight away — the flight has no entrance gate
    // that could leave the hero blank. The h1 is the ROLE, not the narrative line: a
    // recruiter scanning the first viewport is matching a job title, so that has to be
    // the largest thing on it (and the most semantically prominent).
    const h1 = page.locator('#hero h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).toContainText('Data & AI Architect')

    // The narrative line still ships, demoted to the subhead beneath it.
    await expect(page.locator('[data-station="0"]')).toContainText('Eleven years')

    // And an interested visitor can act without scrolling the whole flight.
    await expect(page.locator('[data-station="0"] a[href^="mailto:"]')).toHaveCount(1)

    await page.keyboard.press('Escape')

    // Park at the very top before measuring: the opening station is only fully opaque
    // at flight progress 0, so any residual scroll would legitimately dim it.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect
      .poll(
        async () =>
          page
            .locator('[data-station="0"]')
            .first()
            .evaluate((el) => Number(getComputedStyle(el).opacity)),
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0.9)
  })

  test('reduced motion renders the stations statically with no WebGL', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('main')).toBeVisible()

    // All seven stations are present as ordinary stacked sections, fully opaque.
    await expect(page.locator('[data-station]')).toHaveCount(7)
    const opacities = await page
      .locator('[data-station]')
      .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)))
    expect(Math.min(...opacities)).toBeGreaterThan(0.9)

    // Reduced motion must skip the WebGL flight entirely (no <canvas>), so the
    // ~180KB three.js chunk never loads.
    await expect(page.locator('#hero canvas')).toHaveCount(0)
  })
})
