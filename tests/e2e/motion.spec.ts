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

    const sections = ['ledger', 'systems', 'skills', 'index', 'contact']
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

/**
 * The wash. Its only job is to grade the room, so the two things worth pinning
 * are that it *does* travel with scroll and that it can never sit in front of
 * content — the two ways an ambient layer turns into a bug.
 */
test.describe('the wash', () => {
  const progress = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const el = document.querySelector('.atmos') as HTMLElement | null
      return el ? Number(getComputedStyle(el).getPropertyValue('--atmos-p')) : NaN
    })

  test('grades from the authored mid-frame and travels with scroll', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(600)

    const top = await progress(page)
    expect(top).toBeGreaterThanOrEqual(0)
    expect(top).toBeLessThan(0.2)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1200)

    const bottom = await progress(page)
    expect(bottom).toBeGreaterThan(top + 0.5)
  })

  test('sits behind the document and takes no pointer events', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(400)

    const layers = await page.evaluate(() => {
      const atmos = getComputedStyle(document.querySelector('.atmos') as HTMLElement)
      const main = getComputedStyle(document.getElementById('main') as HTMLElement)
      return {
        atmosZ: Number(atmos.zIndex),
        atmosEvents: atmos.pointerEvents,
        mainZ: Number(main.zIndex),
      }
    })
    expect(layers.atmosEvents).toBe('none')
    expect(layers.mainZ).toBeGreaterThan(layers.atmosZ)
  })
})

/**
 * The index's volumes band. Six figures with no bar to fill the row used to sit
 * one per full-width row on a 1320px-max container — each with roughly 1100px of
 * empty track beside it. The fix reflows them into an auto-fill grid; the two
 * things worth pinning are that it actually reflows at desktop width and that it
 * still degrades to one honest column when the viewport can't hold two.
 */
test.describe('the index volumes band', () => {
  const volumeTops = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const band = [...document.querySelectorAll('#index section')].find((s) =>
        s.getAttribute('aria-label')?.startsWith('Volumes'),
      )
      // Scoped to the <ul> — the band's own caption also carries `.metric-row` as a
      // shared reveal-selector hook and would otherwise count as a seventh row.
      const rows = [...(band?.querySelectorAll('ul .metric-row') ?? [])] as HTMLElement[]
      return [...new Set(rows.map((r) => Math.round(r.getBoundingClientRect().top)))]
    })

  test('reflows into more than one column at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.getElementById('index')?.scrollIntoView())
    await page.waitForTimeout(300)

    // Fewer distinct row-tops than volume figures means at least two rows share a
    // line — the grid is laying cards side by side, not stacking them one per row.
    const tops = await volumeTops(page)
    expect(tops.length).toBeLessThan(6)
  })

  test('falls back to one column when the viewport cannot hold two', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.evaluate(() => document.getElementById('index')?.scrollIntoView())
    await page.waitForTimeout(300)

    // At 390px every card gets its own row — six distinct tops, one per figure.
    const tops = await volumeTops(page)
    expect(tops.length).toBe(6)
  })

  test('the rates band keeps its full-width bar untouched by the reflow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.getElementById('index')?.scrollIntoView())
    await page.waitForTimeout(300)

    const barWidth = await page.evaluate(() => {
      const bar = document.querySelector('.metric-plot') as HTMLElement
      return bar.getBoundingClientRect().width
    })
    // A card-width bar (reflowed like the volumes) would be well under 300px; the
    // rate row's bar is authored to max out at 26rem (416px) of the row's own width.
    expect(barWidth).toBeGreaterThan(300)
  })
})
