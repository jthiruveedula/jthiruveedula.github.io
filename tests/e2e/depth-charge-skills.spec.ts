import { test, expect } from '@playwright/test'

test.describe('skills depth bars (depth charge)', () => {
  test('every depth bar has a shine sweep band', async ({ page }) => {
    await page.goto('/')
    await page.locator('#skills').scrollIntoViewIfNeeded()

    // One bar per domain row that has years to picture; one shine band per bar.
    const bars = page.locator('#skills .skills-row > div > span[aria-hidden]')
    const shines = page.locator('#skills .depth-shine')

    await expect(shines.first()).toBeAttached()
    expect(await bars.count()).toBeGreaterThan(0)
    expect(await shines.count()).toBe(await bars.count())

    for (const shine of await shines.all()) {
      await expect(shine).toHaveAttribute('aria-hidden', 'true')
    }
  })

  test('depth-years data-years matches its text', async ({ page }) => {
    await page.goto('/')
    await page.locator('#skills').scrollIntoViewIfNeeded()

    // The markup already holds the final number, so "text === data" is also true
    // *before* the tween starts. Let the ScrollTrigger fire and the 0.9s count-up
    // (plus its stagger) finish first, or the check can sample mid-tween.
    await page.waitForTimeout(2000)
    await page.waitForFunction(() => {
      const els = Array.from(document.querySelectorAll('#skills .depth-years'))
      return (
        els.length > 0 &&
        els.every((el) => el.textContent?.trim() === el.getAttribute('data-years'))
      )
    })

    const pairs = await page.locator('#skills .depth-years').evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent?.trim(),
        data: el.getAttribute('data-years'),
      })),
    )
    expect(pairs.length).toBeGreaterThan(0)
    for (const { text, data } of pairs) {
      expect(data).not.toBeNull()
      expect(text).toBe(data)
    }
  })
})
