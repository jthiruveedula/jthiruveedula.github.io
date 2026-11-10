import { test, expect, type Page } from '@playwright/test'
import { portfolio } from '../../src/data/portfolio'

/**
 * Showcase / compact view switch (index.html head script, src/lib/view.ts,
 * src/styles/compact.css, ViewSwitch.tsx). One DOM, two modes, chosen before
 * first paint: ?view= > localStorage > showcase.
 */

const IDS = ['top', 'arc', 'ledger', 'systems', 'skills', 'index', 'contact', 'main']
const EMAIL = portfolio.profile.email ?? ''

const view = (page: Page) => page.evaluate(() => document.documentElement.dataset.view)

async function expectContract(page: Page) {
  for (const id of IDS) await expect(page.locator(`#${id}`)).toHaveCount(1)
  await expect(page.locator('.rail')).toHaveCount(1)
  await expect(page.locator('.rail__list')).toHaveCount(1)
  await expect(page.locator('.rail__link')).toHaveCount(8)
  await expect(page.locator('[data-station]')).toHaveCount(6)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
}

test.describe('view switch', () => {
  test('default is showcase, and the showcase DOM is intact', async ({ page }) => {
    await page.goto('/')
    expect(await view(page)).toBe('showcase')
    await expectContract(page)
    await expect(page.locator('[data-plane]')).toHaveCount(7)
    await expect(page.locator('[data-plane]').first()).toBeVisible()
    // The runway is still the film, not a static header.
    const top = await page.locator('#top').evaluate((el) => (el as HTMLElement).offsetHeight / window.innerHeight)
    expect(top).toBeGreaterThan(1.5)
    await expect(page.locator('.rail__view')).toHaveText(/compact/i)
  })

  test('?view=compact sets the mode, persists it, and ignores garbage', async ({ page }) => {
    await page.goto('/?view=compact')
    expect(await view(page)).toBe('compact')
    expect(await page.evaluate(() => localStorage.getItem('view'))).toBe('compact')

    await page.goto('/?view=garbage')
    expect(await view(page)).toBe('compact')
    await page.goto('/')
    expect(await view(page)).toBe('compact')

    await page.goto('/?view=showcase')
    expect(await view(page)).toBe('showcase')
    await page.goto('/')
    expect(await view(page)).toBe('showcase')
  })

  test('print flips to compact and restores', async ({ page }) => {
    await page.goto('/')
    expect(await page.evaluate(() => {
      dispatchEvent(new Event('beforeprint'))
      const during = document.documentElement.dataset.view
      dispatchEvent(new Event('afterprint'))
      return [during, document.documentElement.dataset.view]
    })).toEqual(['compact', 'showcase'])
  })

  test('compact keeps every id and contract, drops the film, stays within bounds', async ({ page }) => {
    const errors: string[] = []
    const requests: string[] = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('request', (r) => requests.push(r.url()))

    await page.goto('/?view=compact')
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await expect(page.locator('#contact')).toBeVisible()
    await expectContract(page)
    for (const id of IDS) await expect(page.locator(`#${id}`)).toBeVisible()

    const m = await page.evaluate(() => {
      let maxFont = 0
      for (const el of document.querySelectorAll('body *')) {
        if (!el.getClientRects().length || !(el.textContent ?? '').trim()) continue
        maxFont = Math.max(maxFont, parseFloat(getComputedStyle(el).fontSize))
      }
      const doc = document.documentElement
      return {
        top: document.getElementById('top')!.offsetHeight / window.innerHeight,
        maxFont,
        overflow: doc.scrollWidth - doc.clientWidth,
        lenis: doc.classList.contains('lenis'),
        canvas: document.querySelectorAll('canvas[data-dust]').length,
        planeInline: [...document.querySelectorAll<HTMLElement>('[data-plane]')].some(
          (p) => p.style.opacity !== '' || p.style.transform !== '',
        ),
      }
    })
    expect(m.top).toBeLessThan(1.2)
    expect(m.maxFont).toBeLessThanOrEqual(32)
    expect(m.overflow).toBeLessThanOrEqual(0)
    expect(m.lenis).toBe(false)
    expect(m.canvas).toBe(0)
    expect(m.planeInline).toBe(false)
    expect(requests.some((u) => /\/assets\/three/.test(u))).toBe(false)
    expect(errors, errors.join('\n')).toHaveLength(0)
  })

  test('no horizontal overflow at 375 in compact', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/?view=compact')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    const rail = await page.locator('.rail').boundingBox()
    expect(rail!.x).toBeGreaterThanOrEqual(0)
    expect(rail!.x + rail!.width).toBeLessThanOrEqual(375)
  })

  test('the pill switch round-trips at the active section', async ({ page }) => {
    await page.goto('/')
    const toCompact = page.locator('.rail__view')
    await expect(toCompact).toHaveAttribute('href', /\?view=compact#top$/)
    const box = await toCompact.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)

    await toCompact.click()
    await page.waitForURL(/\?view=compact/)
    await page.waitForLoadState('domcontentloaded')
    expect(await view(page)).toBe('compact')
    expect(new URL(page.url()).search).toBe('?view=compact')

    await page.locator('#systems').scrollIntoViewIfNeeded()
    const toShowcase = page.locator('.rail__view')
    await expect(toShowcase).toHaveText(/showcase/i)
    await expect(toShowcase).toHaveAttribute('href', /\?view=showcase#systems$/)
    await toShowcase.click()
    await page.waitForURL(/\?view=showcase/)
    await page.waitForLoadState('domcontentloaded')
    expect(await view(page)).toBe('showcase')
    expect(new URL(page.url()).hash).toBe('#systems')
  })

  test('palette: "view" + Enter switches, and the email address is never shown', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).not.toContainText(EMAIL)
    await expect(dialog).toContainText('Email me')

    await page.keyboard.type('view')
    await expect(page.locator('.cmdk__item').first()).toHaveText(/Switch to compact view/)
    await page.keyboard.press('Enter')
    await page.waitForURL(/\?view=compact/)
    await page.waitForLoadState('domcontentloaded')
    expect(await view(page)).toBe('compact')
  })

  test('compact never shows the email before a click', async ({ page }) => {
    await page.goto('/?view=compact')
    await page.locator('#contact').scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.body.innerText)).not.toContain(EMAIL)
    await page.getByRole('button', { name: 'Show email' }).click()
    await expect(page.locator('.contact-mail__link')).toHaveText(EMAIL)
  })
})
