import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { OPEN_COMMAND_PALETTE } from '@/components/Rail'
import { useLenis } from '@/components/SmoothScroll'
import { useReducedMotion } from '@/lib/hooks'

const CommandPaletteBody = lazy(() => import('@/components/CommandPaletteBody'))

/**
 * The command palette — ⌘K, or the "Search" entry at the end of the rail.
 *
 * The audience this site names in its own CSS header — "enterprise hiring
 * managers + staff engineers" — is exactly the population that reaches for ⌘K on
 * instinct, on a site that gives them no reason to expect one. This is the one
 * piece of chrome on the page that exists purely for a keyboard-first visitor:
 * jump to any section or any system by name, or fire a contact action, without
 * ever reaching for the mouse.
 *
 * Split in two on purpose. This shell is the only thing mounted eagerly — it is
 * a handful of event listeners and a boolean, nothing that needs `portfolio`.
 * The dialog itself (CommandPaletteBody) imports the ~35kB dataset to build its
 * command list and is lazy, exactly like Curtain: nobody has opened this yet,
 * so the entry bundle has no business paying for it. The one trade this makes
 * is a Suspense beat on the very first ⌘K — a network-speed delay before the
 * dialog paints, not a lost keystroke; every open after that is instant.
 *
 * No new motion verb: the dialog is a plain fade + scale on the toggle clock,
 * the same tokens (`DUR`/`EASE`) every other piece of chrome on the page
 * already uses — see the .cmdk rules in globals.css — collapsed to 0.01ms
 * under reduced motion like everything else here.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  const lenis = useLenis()
  // Focus returns to whatever opened the palette — the rail's Search button, or
  // wherever a keyboard user was when they pressed ⌘K — but only when the dialog
  // is *dismissed*. A command that navigates clears this: focus belongs in the
  // place the visitor asked to go, not back on the button they left behind.
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const close = useCallback(() => setOpen(false), [])

  const goTo = useCallback(
    (id: string) => {
      // This is a navigation, not a dismissal — suppress the close effect's
      // restore so it can't drag focus back to the opener a frame before the
      // destination below claims it.
      restoreFocusRef.current = null
      setOpen(false)
      // Five of the seven sections this can target (and every project card) are
      // behind React.lazy — their chunk starts fetching on first render, not on
      // scroll, so it is normally long since resolved by the time a visitor has
      // read the palette and picked something. But "normally" isn't "always": a
      // cold cache or a slow connection can still have Contact's chunk in flight
      // when its command fires. Polling a few animation frames for the target to
      // exist — cheap, and only ever spent on that one rare race — beats a
      // scrollTo that silently targets nothing and never retries.
      const attempt = (framesLeft: number) => {
        requestAnimationFrame(() => {
          const target = document.getElementById(id)
          if (!target && framesLeft > 0) {
            attempt(framesLeft - 1)
            return
          }
          if (lenis) {
            // A target that just mounted (the poll above exists for exactly this)
            // can still leave Lenis's cached content height stale for one more
            // frame while a sibling lazy section is still expanding the page
            // beneath it — resize() forces a fresh measurement immediately
            // before the jump, so the distance it computes matches the layout
            // that is actually on screen right now, not whatever it was when
            // Lenis last measured.
            lenis.resize()
            lenis.scrollTo(`#${id}`, { offset: -72 })
          } else {
            target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
          }
          // Nothing here is a fragment navigation, so the browser never moves
          // focus to the destination on its own — same gap SmoothScroll's anchor
          // handler closes, closed the same way. `preventScroll` leaves the
          // scroll above (Lenis or native smooth) to finish undisturbed.
          if (target) {
            target.setAttribute('tabindex', '-1')
            target.focus({ preventScroll: true })
          }
        })
      }
      // Two frames of headroom before the poll even starts: closing the dialog
      // removes it from the layout, and measuring before that reflow settles
      // would land mid-transition on whatever the pre-close layout happened to
      // report.
      requestAnimationFrame(() => requestAnimationFrame(() => attempt(60)))
    },
    [lenis, reduced],
  )

  useEffect(() => {
    const openHandler = () => {
      restoreFocusRef.current = document.activeElement as HTMLElement | null
      setOpen(true)
    }
    const keyHandler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openHandler()
      }
    }
    window.addEventListener(OPEN_COMMAND_PALETTE, openHandler)
    window.addEventListener('keydown', keyHandler)
    return () => {
      window.removeEventListener(OPEN_COMMAND_PALETTE, openHandler)
      window.removeEventListener('keydown', keyHandler)
    }
  }, [])

  // `aria-modal="true"` is a promise to assistive tech, not an implementation:
  // on its own it left every link in the page still tabbable behind the dialog,
  // and the page still scrolling under it. Freeze both for the duration.
  //
  // `inert` (React 19 / the DOM property) rather than a Tab-cycling trap: it is
  // the same tool this codebase already uses for collapsed panels
  // (ProjectCard/Skills/Timeline), and it takes the background out of pointer
  // and AT reach too, which a keydown trap never does. Everything focusable on
  // the page lives in one of these three — the rest of the shell (Atmosphere,
  // ScrollProgress) is `aria-hidden` decoration with nothing to focus.
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const background = document.querySelectorAll<HTMLElement>('#main, .rail, .skip-link')
    background.forEach((el) => {
      el.inert = true
    })
    return () => {
      // Before the restore below fires: focus() on an inert element is a no-op,
      // so un-inerting has to land first. React runs every cleanup in a commit
      // ahead of every effect body, which is exactly that order.
      background.forEach((el) => {
        el.inert = false
      })
      lenis?.start()
    }
  }, [open, lenis])

  useEffect(() => {
    if (open) return
    // Runs on the transition back to closed, never on first mount — the ref
    // starts null, so there is nothing to restore focus to yet. `goTo` nulls it
    // too, so a navigation lands in its destination instead of bouncing back.
    restoreFocusRef.current?.focus()
  }, [open])

  // A second Escape listener, scoped to `open`, rather than folding this into
  // the handler above: that one's identity must stay stable for the effect
  // above not to re-bind on every open/close, and Escape only ever matters
  // while the dialog exists.
  useEffect(() => {
    if (!open) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [open, close])

  if (!open) return null

  return (
    <Suspense fallback={null}>
      <CommandPaletteBody onClose={close} goTo={goTo} />
    </Suspense>
  )
}
