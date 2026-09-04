import { test, expect } from '@playwright/test'

test.describe('PWA & mobile metadata', () => {
  test('links a valid web manifest with installable icons', async ({ page }) => {
    await page.goto('/')

    const manifestHref = await page
      .locator('link[rel="manifest"]')
      .getAttribute('href')
    expect(manifestHref).toMatch(/manifest\.json$/)

    const manifest = await (await page.request.get(manifestHref!)).json()
    expect(manifest.name).toBeTruthy()
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#0a0d15')
    // A maskable icon lets the OS fill the adaptive-icon safe area on Android.
    const purposes = manifest.icons.map((i: { purpose?: string }) => i.purpose)
    expect(purposes).toContain('maskable')
  })

  test('declares iOS home-screen + theme-color metadata', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      'href',
      /favicon\.svg$/,
    )
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
      'content',
      'yes',
    )
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#0a0d15',
    )
  })

  test('ships a styled 404 page', async ({ request }) => {
    // GitHub Pages serves /404.html (with a 404 status) for unknown routes;
    // locally we verify the asset itself is present and correctly structured.
    const res = await request.get('/404.html')
    expect(res.ok()).toBeTruthy()
    const body = await res.text()
    expect(body).toContain('404')
    expect(body).toContain('Return home')
    expect(body).toContain('View resume')
  })
})

/**
 * The top bar. Seven destinations no longer fit a 390px screen, and a plain
 * `flex-end` on an overflowing scroll container pushes the overflow out of the
 * start edge where no scroll can reach it. This pins the invariant that broke:
 * every destination is reachable, whether by fitting or by scrolling.
 */
test.describe('mobile top bar', () => {
  test('no destination is clipped out of reach', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const geometry = await page.evaluate(() => {
      const list = document.querySelector('.rail__list') as HTMLElement
      const links = [...document.querySelectorAll('.rail__link')] as HTMLElement[]
      const listLeft = list.getBoundingClientRect().left
      return {
        // Positions relative to the scroll container's content box, undoing any
        // scroll offset — a negative value is content behind the start edge.
        starts: links.map((l) => l.getBoundingClientRect().left - listLeft + list.scrollLeft),
        count: links.length,
      }
    })

    expect(geometry.count).toBe(7)
    for (const start of geometry.starts) {
      expect(start).toBeGreaterThanOrEqual(-0.5)
    }
  })
})
