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

    // The seven section destinations plus the command palette's Search entry.
    expect(geometry.count).toBe(8)
    for (const start of geometry.starts) {
      expect(start).toBeGreaterThanOrEqual(-0.5)
    }
  })
})

/**
 * The desktop rail's vertical twin of the mobile top-bar test above. Eight
 * vertical-text destinations no longer fit every viewport height, and the rail
 * had no scroll fallback on that axis — a real CI failure on the default
 * 1280x720 viewport caught this: the Search entry rendered past the fixed
 * rail's bottom edge, genuinely unreachable (not just visually clipped),
 * because nothing on the page was a scroll container for it. Every desktop
 * screenshot taken by hand during development used a taller window, so this
 * survived local testing entirely.
 */
test.describe('desktop rail overflow', () => {
  test('every destination is reachable at a short viewport height', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    const search = page.getByRole('button', { name: 'Search', exact: true })
    // The regression was a click timeout, not a wrong result — scrollIntoView
    // plus a real click is the assertion; a stale/overflowed element fails
    // Playwright's actionability check the same way it failed a real user.
    await search.scrollIntoViewIfNeeded()
    await search.click({ timeout: 5000 })
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('the rail list scrolls internally rather than spilling past the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    const overflow = await page.evaluate(() => {
      const list = document.querySelector('.rail__list') as HTMLElement
      return { scrollHeight: list.scrollHeight, clientHeight: list.clientHeight }
    })
    // Only meaningful once content actually exceeds the box — this pins the
    // scenario the bug reproduced in, not just that overflow-y is set to auto.
    expect(overflow.scrollHeight).toBeGreaterThan(overflow.clientHeight)
  })
})
