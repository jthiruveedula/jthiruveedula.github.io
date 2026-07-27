import { test, expect } from '@playwright/test'

test.describe('scroll-driven era wash', () => {
  const readWash = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--era-wash')
      return parseFloat(v || '0')
    })

  test('era wash scrubs from legacy to ai as the page scrolls', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Escape')

    const top = await readWash(page)
    expect(top).toBeLessThan(0.2)

    // Jump to the document end and let Lenis settle. A fixed wheel delta is no longer
    // enough to reach the bottom now that the scroll-world flight adds several
    // viewports of scroll ahead of the rest of the page.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await expect.poll(() => readWash(page), { timeout: 6000 }).toBeGreaterThan(0.8)
  })

  test('era wash is static under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const v = await readWash(page)
    expect(v).toBeCloseTo(0.5, 1)
  })
})

test.describe('scroll-world camera flight', () => {
  /**
   * Scrolls to a fraction of the flight and reads back each station's copy opacity,
   * waiting until the value settles. A fixed frame count is not enough: the overlay is
   * painted on the GSAP ticker, and under parallel test load a frame can slip, which
   * would make this read mid-update rather than at rest.
   */
  const sampleAt = (page: import('@playwright/test').Page, fraction: number) =>
    page.evaluate(async (f) => {
      const section = document.querySelector('#hero') as HTMLElement
      const span = section.offsetHeight - window.innerHeight
      window.scrollTo({ top: section.offsetTop + span * f, behavior: 'instant' })

      const read = () =>
        [
          Math.round(window.scrollY),
          ...Array.from(document.querySelectorAll('[data-station]')).map((el) =>
            Number(getComputedStyle(el).opacity).toFixed(3),
          ),
        ].join('|')

      const frame = () => new Promise((r) => requestAnimationFrame(r))
      // Lenis keeps easing for a while after a programmatic jump, so scroll position is
      // part of the settle condition — otherwise this can read while the smoothed
      // scroll is still moving and the sample never matches its counterpart.
      let previous = ''
      let stable = 0
      for (let i = 0; i < 120; i += 1) {
        await frame()
        const current = read()
        stable = current === previous ? stable + 1 : 0
        previous = current
        if (stable >= 3) break
      }
      return previous.split('|').slice(1)
    }, fraction)

  test('canvas fills the pinned viewport', async ({ page }) => {
    await page.goto('/')
    // The canvas mounts at an interim size and is resized by R3F's observer a frame
    // or two later, so wait for it to settle before measuring.
    await page.waitForFunction(
      () => {
        const canvas = document.querySelector('#hero canvas')
        const sticky = document.querySelector('#hero .sticky')
        if (!canvas || !sticky) return false
        return canvas.getBoundingClientRect().width > sticky.getBoundingClientRect().width * 0.95
      },
      { timeout: 10000 },
    )
    const box = await page.evaluate(() => {
      const sticky = document.querySelector('#hero .sticky')!.getBoundingClientRect()
      const canvas = document.querySelector('#hero canvas')!.getBoundingClientRect()
      return { stickyW: sticky.width, stickyH: sticky.height, canvasW: canvas.width, canvasH: canvas.height }
    })
    expect(box.canvasW).toBeGreaterThan(box.stickyW * 0.95)
    expect(box.canvasH).toBeGreaterThan(box.stickyH * 0.95)
  })

  test('every station is in the DOM so the copy stays crawlable', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-station]')).toHaveCount(7)
    // Each station carries a heading and at least one concrete metric.
    const content = await page.locator('[data-station]').evaluateAll((els) =>
      els.map((el) => ({
        heading: el.querySelector('h1,h2')?.textContent?.trim() ?? '',
        metrics: el.querySelectorAll('dd').length,
      })),
    )
    for (const station of content) {
      expect(station.heading.length).toBeGreaterThan(0)
      expect(station.metrics).toBeGreaterThan(0)
    }
  })

  test('reverse scroll retraces the flight', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => !!document.querySelector('#hero canvas'), { timeout: 10000 })

    const fractions = [0.2, 0.45, 0.7, 0.95]
    const forward: string[][] = []
    for (const f of fractions) forward.push(await sampleAt(page, f))

    await sampleAt(page, 1)

    // Walk back up through the same positions. The flight is a pure function of scroll
    // offset, but Lenis's smoothing does not land on the exact same pixel twice, so
    // compare with a small tolerance rather than bit-for-bit. A camera that got stuck,
    // snapped, or held one-way state at a boundary would miss by far more than this.
    for (let i = fractions.length - 1; i >= 0; i -= 1) {
      const back = await sampleAt(page, fractions[i])
      const expected = forward[i]
      expect(back).toHaveLength(expected.length)

      for (let station = 0; station < expected.length; station += 1) {
        expect(Number(back[station])).toBeCloseTo(Number(expected[station]), 1)
      }
      // The same station must still be the dominant one in both directions.
      const dominant = (values: string[]) => values.indexOf(String(Math.max(...values.map(Number)).toFixed(3)))
      expect(dominant(back)).toBe(dominant(expected))
    }
  })

  test('only nearby stills are fetched on first paint', async ({ page }) => {
    await page.goto('/')
    // Wait for the opening station's texture specifically — the canvas mounts before
    // any still has been requested, so keying off the canvas alone races the fetch.
    await page.waitForFunction(
      () =>
        performance.getEntriesByType('resource').some((r) => r.name.includes('/scenes/01-ingress')),
      { timeout: 10000 },
    )
    const loaded = await page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .filter((r) => r.name.includes('/scenes/'))
        .map((r) => r.name.split('/').pop()!),
    )
    // The flight lazily mounts stations, so the far end of the world must not be
    // downloaded before the visitor has scrolled anywhere near it.
    expect(loaded.length).toBeLessThanOrEqual(3)
    expect(loaded.some((n) => n.startsWith('01-'))).toBeTruthy()
    expect(loaded.some((n) => n.startsWith('07-'))).toBeFalsy()
  })

  test('scrolling past the flight reaches the sections below', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const section = document.querySelector('#hero') as HTMLElement
      window.scrollTo({ top: section.offsetTop + section.offsetHeight, behavior: 'instant' })
    })
    // The sections below the flight are lazy chunks, so give the Suspense boundary
    // time to resolve rather than asserting on the same tick as the scroll.
    await expect(page.locator('#timeline')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('scroll-reveal durability', () => {
  test('project cards stay visible after the section has been scrolled past', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Escape')

    // Projects is a lazy chunk — it has to mount before it can be measured.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await expect(page.locator('#projects')).toBeAttached({ timeout: 10000 })

    // Park on the projects section so its own reveal triggers fire...
    await page.evaluate(() => {
      const section = document.querySelector('#projects') as HTMLElement
      window.scrollTo({ top: section.offsetTop - 100, behavior: 'instant' })
    })
    await expect(page.locator('#projects article').first()).toBeVisible({ timeout: 10000 })

    // ...then scroll well past it and back, which is what used to strand every card at
    // opacity 0 / visibility hidden: two `.from(autoAlpha: 0)` tweens on the same node
    // each captured the other's zeroed value as their END state.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await page.waitForTimeout(1200)
    await page.evaluate(() => {
      const section = document.querySelector('#projects') as HTMLElement
      window.scrollTo({ top: section.offsetTop + 400, behavior: 'instant' })
    })
    await page.waitForTimeout(1200)

    const cards = await page.locator('#projects article').evaluateAll((els) =>
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
    await page.goto('/')
    await page.keyboard.press('Escape')

    // Scroll all the way down with real wheel input, then partially back up. That exact
    // sequence is what stranded one-shot `.from(autoAlpha: 0)` reveals — it took out
    // every project card once, and the entire Skills header another time. Because
    // `visibility` inherits, one stranded wrapper silently hides everything inside it, so
    // the headings are the cheapest reliable canary for the whole class.
    //
    // Real wheel steps matter: an instant `scrollTo` jump skips the intermediate state and
    // the bug does not reproduce, which made an earlier version of this test pass against
    // known-broken code.
    await page.mouse.move(700, 450)

    // Wheel until actually at the bottom rather than a fixed step count — the page height
    // changes as content is added, and a count that stops short leaves later sections
    // un-revealed, which fails for the wrong reason.
    const atBottom = () =>
      page.evaluate(
        () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4,
      )
    for (let i = 0; i < 200 && !(await atBottom()); i++) {
      await page.mouse.wheel(0, 500)
      await page.waitForTimeout(8)
    }
    await page.waitForTimeout(1200)

    // Then partway back up — a fraction of the document, so it scales with the page.
    const upSteps = await page.evaluate(() =>
      Math.round((document.documentElement.scrollHeight * 0.45) / 500),
    )
    for (let i = 0; i < upSteps; i++) {
      await page.mouse.wheel(0, -500)
      await page.waitForTimeout(8)
    }
    await page.waitForTimeout(1200)

    const sections = ['timeline', 'skills', 'approach', 'projects', 'impact', 'contact']
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
