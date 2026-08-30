import { test, expect } from '@playwright/test'

/**
 * The v5 Sequence hero: six stacked, sticky, opaque "stations" (no WebGL, no
 * crossfade — each station simply covers the one before it). One rAF-throttled
 * scroll driver reads each station's getBoundingClientRect() to compute a 0..1
 * "how far scrolled through this station" progress and drives per-element
 * count-up/fill/travel animations directly via inline styles.
 */

const sampleFirstStat = (page: import('@playwright/test').Page, stationIndex: number, fraction: number) =>
  page.evaluate(
    ({ stationIndex, fraction }) => {
      const station = document.querySelectorAll('[data-station]')[stationIndex] as HTMLElement
      const span = station.offsetHeight - window.innerHeight
      window.scrollTo({ top: station.offsetTop + Math.max(span, 0) * fraction, behavior: 'instant' })
      const stat = station.querySelector('[data-anim="count"], [data-anim="countdown"]') as HTMLElement
      return stat?.textContent ?? ''
    },
    { stationIndex, fraction },
  )

test.describe('Sequence stations', () => {
  test('all six stations are in the DOM so the copy stays crawlable', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-station]')).toHaveCount(6)
    const content = await page.locator('[data-station]').evaluateAll((els) =>
      els.map((el) => el.querySelector('h1,h2')?.textContent?.trim() ?? ''),
    )
    for (const heading of content) {
      expect(heading.length).toBeGreaterThan(0)
    }
  })

  test('stations are opaque (no crossfade) and stay covered by later ones', async ({ page }) => {
    await page.goto('/')
    const opacities = await page
      .locator('[data-station]')
      .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)))
    for (const o of opacities) expect(o).toBeGreaterThan(0.99)
  })

  test('scrolling deep into a station settles its stat counter on the final value', async ({ page }) => {
    await page.goto('/')
    // Station 1 = "Legacy" — first stat is "20+" (ETL pipelines).
    const settled = await sampleFirstStat(page, 1, 0.95)
    await expect.poll(async () => sampleFirstStat(page, 1, 0.95), { timeout: 6000 }).toBe(settled)
    expect(settled).toBe('20+')
  })

  test('a station not yet scrolled into view is not mid-animation', async ({ page }) => {
    await page.goto('/')
    // Before scrolling, station 1 (below the fold) keeps its settled JSX value —
    // the driver only touches a station's counters once it's on screen.
    const text = await page.evaluate(() => {
      const station = document.querySelectorAll('[data-station]')[1] as HTMLElement
      const stat = station.querySelector('[data-anim="count"], [data-anim="countdown"]') as HTMLElement
      return stat?.textContent ?? ''
    })
    expect(text).toBe('20+')
  })

  test('reduced motion settles every counter with no animation and no scroll', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const values = await page
      .locator('[data-anim="count"], [data-anim="countdown"]')
      .evaluateAll((els) => els.map((el) => el.textContent))
    expect(values).toContain('11+')
    expect(values).toContain('20+')
  })

  test('scrolling past the sequence reaches the sections below', async ({ page }) => {
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
