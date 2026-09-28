import { test, expect } from '@playwright/test'

test.describe('depth-charge 3D tilt (systems cards)', () => {
  test('an opened card arms tilt and exposes stage-node hooks', async ({ page }) => {
    await page.goto('/')
    await page.locator('#systems').scrollIntoViewIfNeeded()

    // Open the first case study's wiring panel.
    await page.getByRole('button', { name: '+ Open the wiring' }).first().click()
    const card = page.locator('#systems article').first()
    await expect(card).toBeVisible()

    // Tilt is armed only while the card is open (and motion is allowed with a
    // fine pointer); the armed article carries the marker attribute.
    await expect(card).toHaveAttribute('data-tilt', 'armed')

    // Stage nodes are queryable via data-stage-node within the expanded card.
    const nodes = card.locator('[data-stage-node]')
    await expect(nodes).not.toHaveCount(0)

    // Trace click behavior still works: clicking a node moves the accent fill.
    await nodes.nth(2).click()
    await expect(card.locator('[data-stage-node][aria-pressed="true"]')).toHaveCount(1)
  })
})
