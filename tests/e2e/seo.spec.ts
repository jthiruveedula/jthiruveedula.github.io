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

test.describe('first paint', () => {
  test('main and the hero paint immediately', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main')).toBeVisible()

    // The flight opens on scene one, whose headline is the page's thesis. It is
    // authored in CSS as the resting state, so this assertion also proves the
    // no-JS / dead-timeline frame is a true one rather than an empty one.
    const h1 = page.locator('main h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).toContainText('I automated the job I used to do by hand')

    // The role a recruiter is scanning for still has to be on the first viewport;
    // in v6 it sits in the hero eyebrow above the figure rather than in the h1.
    await expect(page.locator('#top .eyebrow')).toContainText('Data & AI Architect')

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect
      .poll(async () => page.locator('#top').evaluate((el) => Number(getComputedStyle(el).opacity)), {
        timeout: 10_000,
      })
      .toBeGreaterThan(0.9)
  })

  test('reduced motion renders every chapter statically with no WebGL', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.locator('main')).toBeVisible()

    // All six chapters are present as ordinary stacked list items, fully opaque.
    await expect(page.locator('[data-station]')).toHaveCount(6)
    const opacities = await page
      .locator('[data-station]')
      .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)))
    expect(Math.min(...opacities)).toBeGreaterThan(0.9)

    // The hero is typography plus a hand-built SVG apparatus — no canvas ever mounts.
    await expect(page.locator('main canvas')).toHaveCount(0)
  })
})
