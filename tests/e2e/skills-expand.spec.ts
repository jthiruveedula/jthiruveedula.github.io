import { test, expect } from '@playwright/test'

/**
 * The toolkit's "+N more" disclosure. Tier 2/3 skills used to be asserted only
 * as a count — "+14 more across the toolkit" — with no way to actually see them.
 * A project's tech chip (ProjectCard.tsx) can cross-link straight to a domain row
 * expecting to confirm a specific tool is there, and until this, the row had
 * nothing to show past its top few. This locks in that the count is now a real
 * disclosure, not still just a number.
 *
 * Rows, not the toggle's own text, anchor every locator below. The toggle's label
 * flips between "+N more" and "− show fewer" on click, so a locator built from
 * that text stops matching the instant it's clicked — Playwright re-queries a
 * `getByRole(..., { name })` locator live, and the element that WAS index 0
 * silently becomes whatever button is next in the now-shorter match set.
 */
test.describe('the toolkit disclosure', () => {
  const domainRow = (page: import('@playwright/test').Page, i: number) =>
    page.locator('#skills li').nth(i)

  test('a domain with a rest-tail can be expanded to reveal it', async ({ page }) => {
    await page.goto('/')
    const row = domainRow(page, 0)
    await row.scrollIntoViewIfNeeded()

    const toggle = row.getByRole('button')
    await expect(toggle).toHaveText(/^\+\s*\d+ more/)

    await toggle.click()
    await expect(toggle).toHaveText(/show fewer/)
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')

    // The revealed list is real tool names, not a repeat of the count.
    const panelId = await toggle.getAttribute('aria-controls')
    const panel = page.locator(`#${panelId}`)
    await expect(panel).toBeVisible()
    const revealed = (await panel.textContent()) ?? ''
    expect(revealed.length).toBeGreaterThan(10)
    expect(revealed).not.toMatch(/more across the toolkit/)
  })

  test('opening a second domain closes the first — one open at a time', async ({ page }) => {
    await page.goto('/')
    const first = domainRow(page, 0).getByRole('button')
    const second = domainRow(page, 1).getByRole('button')
    await second.scrollIntoViewIfNeeded()

    await first.click()
    await expect(first).toHaveText(/show fewer/)

    await second.click()
    await expect(second).toHaveText(/show fewer/)
    // The first reverted to its collapsed count rather than staying open —
    // this is a single shared `openDomain`, not one flag per row.
    await expect(first).toHaveText(/more across the toolkit/)
  })

  test('the collapsed panel is removed from the tab order (inert)', async ({ page }) => {
    await page.goto('/')
    const row = domainRow(page, 0)
    await row.scrollIntoViewIfNeeded()

    const toggle = row.getByRole('button')
    const panelId = await toggle.getAttribute('aria-controls')
    const panel = page.locator(`#${panelId}`)

    await expect(panel).toHaveJSProperty('inert', true)
    await toggle.click()
    await expect(panel).toHaveJSProperty('inert', false)
  })
})
