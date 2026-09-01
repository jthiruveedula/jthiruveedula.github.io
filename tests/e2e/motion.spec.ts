import { test, expect } from '@playwright/test'

/**
 * The v6 arc. The v5 hero drove six sticky, scroll-scrubbed "stations" through
 * 13,284px of pinned scroll, animating each stat's count-up from a rAF scroll
 * driver. That is gone: the six chapters are now ordinary stacked list items
 * with their figures printed as static text.
 *
 * These tests survive that rewrite because their intent never depended on the
 * scrubbing — they exist to guarantee the copy is in the DOM, opaque, and
 * showing final values no matter where the visitor is on the page. That
 * guarantee is now *stronger*, so the assertions below check it unconditionally
 * instead of only after scrolling into range.
 */

const statsOfStation = (page: import('@playwright/test').Page, index: number) =>
  page.evaluate(
    (index) => {
      const station = document.querySelectorAll('[data-station]')[index] as HTMLElement
      return [...station.querySelectorAll('[data-stat]')].map((el) => el.textContent?.trim() ?? '')
    },
    index,
  )

test.describe('Arc chapters', () => {
  test('all six chapters are in the DOM so the copy stays crawlable', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-station]')).toHaveCount(6)
    const content = await page.locator('[data-station]').evaluateAll((els) =>
      els.map((el) => el.querySelector('h1,h2,h3')?.textContent?.trim() ?? ''),
    )
    for (const heading of content) {
      expect(heading.length).toBeGreaterThan(0)
    }
  })

  test('chapters are opaque', async ({ page }) => {
    await page.goto('/')
    const opacities = await page
      .locator('[data-station]')
      .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)))
    for (const o of opacities) expect(o).toBeGreaterThan(0.99)
  })

  test('a chapter shows its final figures before it is ever scrolled to', async ({ page }) => {
    await page.goto('/')
    // Chapter 1 = "Legacy" — first figure is "20+" (ETL pipelines). Read it while
    // the page is still parked at the top: nothing may render a placeholder or a
    // zero on the way to its real value.
    expect(await statsOfStation(page, 1)).toEqual(['20+', '5M+', '25%', '35%'])
  })

  test('scrolling deep into a chapter leaves its figures unchanged', async ({ page }) => {
    await page.goto('/')
    const before = await statsOfStation(page, 1)
    await page.evaluate(() => {
      const station = document.querySelectorAll('[data-station]')[1] as HTMLElement
      window.scrollTo({ top: station.offsetTop, behavior: 'instant' })
    })
    await page.waitForTimeout(600)
    expect(await statsOfStation(page, 1)).toEqual(before)
  })

  test('reduced motion settles every figure with no animation and no scroll', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const values = await page
      .locator('[data-stat]')
      .evaluateAll((els) => els.map((el) => el.textContent?.trim()))
    expect(values).toContain('11+')
    expect(values).toContain('20+')
    expect(values).toContain('50M+')
  })

  test('scrolling past the arc reaches the sections below', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const stations = document.querySelectorAll('[data-station]')
      const last = stations[stations.length - 1] as HTMLElement
      window.scrollTo({ top: last.offsetTop + last.offsetHeight, behavior: 'instant' })
    })
    await expect(page.locator('#ledger')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('scroll-reveal durability', () => {
  test('project cards stay visible after the section has been scrolled past', async ({ page }) => {
    await page.goto('/')

    // Systems is a lazy chunk — it has to mount before it can be measured.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await expect(page.locator('#systems')).toBeAttached({ timeout: 10000 })

    // Park on the systems section so its own reveal triggers fire...
    await page.evaluate(() => {
      const section = document.querySelector('#systems') as HTMLElement
      window.scrollTo({ top: section.offsetTop - 100, behavior: 'instant' })
    })
    await expect(page.locator('#systems article').first()).toBeVisible({ timeout: 10000 })

    // ...then scroll well past it and back, which is what used to strand every card at
    // opacity 0 / visibility hidden: two `.from(autoAlpha: 0)` tweens on the same node
    // each captured the other's zeroed value as their END state.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await page.waitForTimeout(1200)
    await page.evaluate(() => {
      const section = document.querySelector('#systems') as HTMLElement
      window.scrollTo({ top: section.offsetTop + 400, behavior: 'instant' })
    })
    await page.waitForTimeout(1200)

    const cards = await page.locator('#systems article').evaluateAll((els) =>
      els.map((el) => {
        const style = getComputedStyle(el)
        return { opacity: Number(style.opacity), visibility: style.visibility }
      }),
    )

    expect(cards).toHaveLength(6)
    for (const card of cards) {
      expect(card.visibility).toBe('visible')
      expect(card.opacity).toBeGreaterThan(0.9)
    }
  })

  test('no section heading is left stranded after scrolling the page twice', async ({ page }) => {
    // Genuinely slow by nature: it wheels a multi-viewport page end to end and back.
    // Triple the budget rather than weaken what it asserts — this is the test guarding
    // the bug that has recurred three times.
    test.slow()
    await page.goto('/')

    // Scroll all the way down with real wheel input, then partially back up. That exact
    // sequence is what stranded one-shot `.from(autoAlpha: 0)` reveals. Real wheel steps
    // matter: an instant `scrollTo` jump skips the intermediate state and the bug does
    // not reproduce.
    await page.mouse.move(700, 450)

    const wheelUntil = async (
      done: () => Promise<boolean>,
      delta: number,
      maxBatches = 60,
    ) => {
      for (let batch = 0; batch < maxBatches; batch += 1) {
        if (await done()) return
        for (let step = 0; step < 6; step += 1) {
          await page.mouse.wheel(0, delta)
          await page.waitForTimeout(6)
        }
      }
    }

    const atBottom = () =>
      page.evaluate(
        () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4,
      )
    await wheelUntil(atBottom, 500)
    await page.waitForTimeout(1200)

    const atTop = () => page.evaluate(() => window.scrollY <= 0)
    await wheelUntil(atTop, -500)
    await page.waitForTimeout(1400)

    const sections = ['ledger', 'systems', 'index', 'contact']
    for (const id of sections) {
      const heading = page.locator(`#${id} h2`).first()
      await expect(heading, `${id} heading should not be stranded`).toBeVisible({ timeout: 10000 })
      const state = await heading.evaluate((el) => {
        const style = getComputedStyle(el)
        return { opacity: Number(style.opacity), visibility: style.visibility }
      })
      expect(state.visibility, `${id} heading visibility`).toBe('visible')
      expect(state.opacity, `${id} heading opacity`).toBeGreaterThan(0.9)
    }
  })
})
