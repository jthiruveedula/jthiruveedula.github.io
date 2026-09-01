import { test, expect } from '@playwright/test'

/**
 * The spec that makes it safe to put scrubbed cinema back on this page.
 *
 * v5's defining defect was a blank screen: a hand-rolled scroll driver left
 * off-screen stations in an undefined state, so a deep link or a browser-restored
 * scroll position landed on nothing. The fix is structural — the flight's resting
 * state is authored in CSS and the arc below is statically complete — but structure
 * decays under editing. One `fromTo` flipped to a `from` and it is silently gone.
 *
 * So this asserts the property directly, from every entry point the site exposes.
 */
const ENTRIES = ['/', '/#top', '/#arc', '/#ledger', '/#systems', '/#index', '/#contact']

/** Nothing that carries content may be invisible, zero-height or clipped away. */
async function assertNothingStranded(page: import('@playwright/test').Page) {
  await expect(page.locator('main')).toBeVisible()

  const stranded = await page.evaluate(() => {
    const bad: string[] = []
    const nodes = document.querySelectorAll<HTMLElement>('[data-station], .flight__copy, #arc h2')
    for (const el of nodes) {
      const cs = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      const id = el.getAttribute('data-station') ?? el.className.toString().slice(0, 28)
      if (cs.visibility === 'hidden') bad.push(`${id}: visibility hidden`)
      if (Number(cs.opacity) <= 0.01) bad.push(`${id}: opacity ${cs.opacity}`)
      if (rect.height <= 40) bad.push(`${id}: height ${Math.round(rect.height)}`)
      if (/inset\((9\d|100)%/.test(cs.clipPath)) bad.push(`${id}: clipped ${cs.clipPath}`)
    }
    return bad
  })
  expect(stranded, `stranded nodes: ${stranded.join(' · ')}`).toEqual([])
}

test.describe('deep-link and restored-scroll safety', () => {
  for (const entry of ENTRIES) {
    test(`nothing is stranded entering at ${entry}`, async ({ page }) => {
      await page.goto(entry)
      await page.waitForTimeout(900)
      await assertNothingStranded(page)
    })
  }

  test('a reload mid-page lands on a painted frame, not a blank one', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.55, behavior: 'instant' }))
    await page.waitForTimeout(500)
    await page.reload()
    await page.waitForTimeout(1100)
    await assertNothingStranded(page)
  })

  test('the flight always has exactly one plate painted', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(900)
    // Equal-power crossfade: sin² + cos² = 1, so total painted opacity is always ~1.
    // If it ever reaches zero the visitor is looking at an empty stage.
    const total = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-plane]')]
        .filter((p) => getComputedStyle(p).visibility === 'visible')
        .reduce((sum, p) => sum + Number(getComputedStyle(p).opacity), 0),
    )
    expect(total).toBeGreaterThan(0.9)
  })
})
