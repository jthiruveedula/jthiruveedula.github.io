import { useEffect, type RefObject } from 'react'
import { magnetize } from '@/lib/pointer'
import '@/styles/portal.css'

const DURATION = 480

/**
 * Click handler for links to /journey/: plays a short scale+opacity veil, then
 * navigates. The anchor keeps its real href, so with JS dead (or cmd/ctrl/middle
 * click, reduced motion) the browser navigates normally.
 */
export function enterJourney(e: { preventDefault(): void; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; button?: number } | null, href: string) {
  if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e.button ?? 0) !== 0)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (!e) window.location.href = href
    return
  }
  e?.preventDefault()
  if (document.querySelector('.portal-veil')) return
  const veil = document.createElement('div')
  veil.className = 'portal-veil'
  veil.setAttribute('aria-hidden', 'true')
  document.body.appendChild(veil)
  // Back-forward cache restores this page as-left; drop the veil then.
  window.addEventListener('pageshow', () => veil.remove(), { once: true })
  // Navigation can be aborted (Esc/Stop, offline): never leave the page covered.
  window.addEventListener('keydown', (k) => k.key === 'Escape' && veil.remove(), { once: true })
  window.setTimeout(() => {
    window.location.href = href
  }, DURATION)
  window.setTimeout(() => veil.remove(), DURATION + 3000)
}

/** Magnetic pull on fine pointers; no-op on coarse / reduced motion (see pointer.ts). */
export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  opts?: { strength?: number; radius?: number },
) {
  const strength = opts?.strength
  const radius = opts?.radius
  useEffect(() => (ref.current ? magnetize(ref.current, { strength, radius }) : undefined), [ref, strength, radius])
}
