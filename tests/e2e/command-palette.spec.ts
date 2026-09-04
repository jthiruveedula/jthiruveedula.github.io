import { test, expect } from '@playwright/test'

/**
 * The command palette. ⌘K/Ctrl+K, or the "Search" entry at the end of the rail —
 * the one piece of chrome on the page built for a keyboard-first visitor rather
 * than for scrolling. It is lazy-loaded (see CommandPalette.tsx's own doc comment),
 * so every open in these tests waits on the dialog actually appearing rather than
 * assuming it's instant.
 */

const openWithKeyboard = async (page: import('@playwright/test').Page) => {
  // The palette's keydown listener attaches in an effect after mount — wait for
  // a piece of its own chrome (the rail's Search entry) to exist first, or a
  // press that lands before React has hydrated is a real, reproducible flake
  // rather than anything wrong with the shortcut itself.
  //
  // `exact: true` throughout this file for the same reason: a Systems wiring
  // node's own accessible name ("Retrieve: Vector Search + Pinecone") contains
  // the substring "Search", and Playwright's role matcher is substring-based by
  // default — without it this locator is ambiguous the moment #systems mounts.
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible()
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog')).toBeVisible()
}

test.describe('the command palette', () => {
  test('is absent until opened', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.cmdk')).toHaveCount(0)
  })

  test('Ctrl/Cmd+K opens it, focused and ready to filter', async ({ page }) => {
    await page.goto('/')
    await openWithKeyboard(page)
    await expect(page.locator('.cmdk__input')).toBeFocused()
  })

  test('the rail\'s Search entry opens the same dialog', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('typing filters to only matching commands', async ({ page }) => {
    await page.goto('/')
    await openWithKeyboard(page)

    await page.keyboard.type('wiley')
    const items = page.locator('.cmdk__item')
    await expect(items).toHaveCount(2)
    for (const text of await items.allTextContents()) {
      expect(text.toLowerCase()).toContain('wiley')
    }
  })

  test('activating a section command scrolls to it and closes the dialog', async ({ page }) => {
    await page.goto('/')
    await openWithKeyboard(page)

    await page.keyboard.type('contact')
    // React re-renders the filtered list on every keystroke; Enter fired the
    // instant `type()` returns can beat that render and activate whatever the
    // list's stale, mid-typing state happened to have first. Wait for the
    // settled result, the same way a person reading the list before pressing
    // Enter naturally would.
    await expect(page.locator('.cmdk__item').first()).toHaveText(/Go to Contact/)
    await page.keyboard.press('Enter')

    await expect(page.locator('.cmdk')).toHaveCount(0)
    await expect(page.locator('#contact')).toBeInViewport({ timeout: 10000 })
  })

  test('activating a project command lands on that exact card', async ({ page }) => {
    await page.goto('/')
    await openWithKeyboard(page)

    await page.keyboard.type('cobol')
    // Same settle-before-Enter reasoning as the section-command test above.
    await expect(page.locator('.cmdk__item').first()).toHaveText(/GenAI COBOL/)
    await page.keyboard.press('Enter')

    await expect(page.locator('.cmdk')).toHaveCount(0)
    // The card whose id is the project's own — see ProjectCard.tsx's deep-link id.
    await expect(page.locator('#definity-cobol-translation')).toBeInViewport({ timeout: 10000 })
  })

  test('Escape closes the dialog and returns focus to the trigger', async ({ page }) => {
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Search', exact: true })
    await trigger.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('.cmdk')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('arrow keys move the active selection without a mouse', async ({ page }) => {
    await page.goto('/')
    await openWithKeyboard(page)

    const active = () => page.locator('.cmdk__item--active')
    await expect(active()).toHaveText(/Go to Open/)

    await page.keyboard.press('ArrowDown')
    await expect(active()).toHaveText(/Go to Arc/)

    await page.keyboard.press('ArrowUp')
    await expect(active()).toHaveText(/Go to Open/)
  })
})
