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
    expect(manifest.theme_color).toBe('#050810')
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
      '#050810',
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
