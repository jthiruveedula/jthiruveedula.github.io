import { test, expect, type Page } from '@playwright/test'
import { portfolio } from '../../src/data/portfolio'

/**
 * Showcase immersion (T8-T11): rooms behind each section, scroll-lit arc plates on
 * touch, the dust field carried below the hero, and evidence trails from #index to
 * the case study that earned each figure.
 */

const section = (page: Page) => page.evaluate(() => document.documentElement.dataset.section)

async function goToSection(page: Page, id: string) {
  await expect
    .poll(async () => {
      await page.evaluate((sid) => {
        const el = document.getElementById(sid)
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40)
      }, id)
      return section(page)
    }, { timeout: 15_000 })
    .toBe(id)
}

const visibleRooms = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('.atmos__room'))
      .filter((el) => Number(getComputedStyle(el).opacity) > 0.05)
      .map((el) => el.dataset.room),
  )

test.describe('rooms', () => {
  test('one room at a time, in film order, never on the hero', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'rooms mount only at >= 768px')
    await page.goto('/')
    await page.waitForTimeout(600)
    expect(await section(page)).toBe('top')
    await expect(page.locator('.atmos__room')).toHaveCount(0)

    for (const [id, room] of [
      ['arc', '02'],
      ['systems', '04'],
      ['skills', '05'],
      ['index', '06'],
      ['contact', '07'],
    ] as const) {
      await goToSection(page, id)
      await expect.poll(() => visibleRooms(page), { timeout: 5_000 }).toEqual([room])
    }

    // The ledger follows its era: exactly one of its three rooms.
    await goToSection(page, 'ledger')
    await expect.poll(async () => (await visibleRooms(page)).length, { timeout: 5_000 }).toBe(1)
    expect(['02', '03', '06']).toContain((await visibleRooms(page))[0])

    // Still behind the document.
    const atmos = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector('.atmos') as HTMLElement)
      return { z: s.zIndex, events: s.pointerEvents }
    })
    expect(atmos).toEqual({ z: '0', events: 'none' })
  })

  test('not mounted below 768px', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'mobile viewport only')
    await page.goto('/')
    await goToSection(page, 'systems')
    await page.waitForTimeout(400)
    await expect(page.locator('.atmos__room')).toHaveCount(0)
  })

  test('not mounted in compact', async ({ page }) => {
    await page.goto('/?view=compact')
    await goToSection(page, 'systems')
    await page.waitForTimeout(400)
    await expect(page.locator('.atmos__room')).toHaveCount(0)
  })
})

test.describe('same air', () => {
  const where = (page: Page) =>
    page.evaluate(() => {
      const c = document.querySelectorAll('canvas[data-dust]')
      const el = c[0]
      return {
        count: c.length,
        inAtmos: !!el?.closest('.atmos'),
        inStage: !!el?.closest('.flight__stage'),
      }
    })

  test('dust reparents into .atmos below the hero and back on scroll up', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'page-level dust is fine-pointer >= 900px only')
    const lost: string[] = []
    page.on('console', (m) => /context lost/i.test(m.text()) && lost.push(m.text()))
    await page.goto('/')
    const has = await page
      .locator('canvas[data-dust]')
      .waitFor({ state: 'attached', timeout: 8_000 })
      .then(() => true, () => false)
    test.skip(!has, 'no WebGL canvas in this headless run')
    expect(await where(page)).toEqual({ count: 1, inAtmos: false, inStage: true })

    await goToSection(page, 'systems')
    await expect.poll(() => where(page)).toEqual({ count: 1, inAtmos: true, inStage: false })

    await page.evaluate(() => window.scrollTo(0, 0))
    await expect.poll(() => where(page)).toEqual({ count: 1, inAtmos: false, inStage: true })
    expect(lost).toEqual([])
  })

  test('stays hero-only on coarse pointers', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'coarse pointer only')
    await page.goto('/')
    const has = await page
      .locator('canvas[data-dust]')
      .waitFor({ state: 'attached', timeout: 8_000 })
      .then(() => true, () => false)
    test.skip(!has, 'no WebGL canvas in this headless run')
    await goToSection(page, 'systems')
    await page.waitForTimeout(500)
    expect(await where(page)).toEqual({ count: 1, inAtmos: false, inStage: true })
  })
})

test.describe('scroll is the torch on touch', () => {
  test('the centred arc tile is lit, an off-centre one is not', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'touch emulation only')
    await page.goto('/')
    const supported = await page.evaluate(() => CSS.supports('animation-timeline: view()'))
    test.skip(!supported, 'animation-timeline unsupported')
    await page.locator('#arc').scrollIntoViewIfNeeded()
    const opacityAt = (i: number) =>
      page.evaluate((n) => {
        const img = document.querySelectorAll<HTMLElement>('.arc-plate img')[n]
        return Number(getComputedStyle(img).opacity)
      }, i)
    await expect
      .poll(async () => {
        await page.evaluate(() => {
          const tile = document.querySelector('[data-station]') as HTMLElement
          const r = tile.getBoundingClientRect()
          window.scrollTo(0, r.top + window.scrollY + r.height / 2 - window.innerHeight / 2)
        })
        return opacityAt(0)
      }, { timeout: 10_000 })
      .toBeGreaterThan(0.9)
    // The last tile is far below the fold: resting at the unlit end.
    expect(await opacityAt(5)).toBeLessThan(0.6)
  })
})

test.describe('evidence trails', () => {
  // Independent re-derivation of lib/content.ts sourceProjectId: one project carries
  // the value (label breaks a tie), otherwise no source.
  const sourceOf = (m: (typeof portfolio.headlineMetrics)[number]) => {
    let found = portfolio.featuredProjects.filter((p) => p.metrics.some((x) => x.value === m.value))
    if (found.length > 1) found = found.filter((p) => p.metrics.some((x) => x.value === m.value && x.label === m.label))
    return found.length === 1 ? found[0].id : undefined
  }
  const linked = portfolio.headlineMetrics.filter((m) => sourceOf(m))
  const unlinked = portfolio.headlineMetrics.filter((m) => !sourceOf(m))

  for (const mode of ['showcase', 'compact'] as const) {
    test(`only traced figures link, and a link opens its case study (${mode})`, async ({ page }) => {
      await page.goto(mode === 'compact' ? '/?view=compact' : '/')
      await page.locator('#index').scrollIntoViewIfNeeded()
      const links = page.locator('#index a.evidence-link')
      await expect(links).toHaveCount(linked.length)

      for (const m of unlinked) {
        const row = page.locator('#index .metric-row', { has: page.locator('.stat__label', { hasText: m.label }) })
        await expect(row.locator('a')).toHaveCount(0)
      }

      const m = linked[0]
      const row = page.locator('#index li.metric-row', { has: page.locator('.stat__label', { hasText: m.label }) })
      const link = row.locator('a.evidence-link')
      await expect(link).toHaveAttribute('href', `#${sourceOf(m)}`)
      await link.click()
      const card = page.locator(`article#${sourceOf(m)}`)
      await expect(card.getByRole('button', { name: /Hide the build/ })).toBeVisible()
      const cited = card.locator('.is-cited')
      await expect(cited.first()).toHaveText(m.value)
    })
  }
})
