import gsap from 'gsap'

/**
 * TRACK — the pointer-reactive verb in the motion grammar (globals.css header).
 * One passive pointermove listener on window, no RAF: subscribers read
 * getPointer() from their own RAF / gsap.ticker. Disabled entirely on coarse
 * pointers and under prefers-reduced-motion (store stays at rest: 0,0, inactive).
 */
export interface PointerState {
  /** Normalized viewport position, -1..1 (0 = centre). */
  x: number
  y: number
  /** Normalized units moved since the previous event (not time-scaled). */
  vx: number
  vy: number
  /** True once a fine pointer has moved and TRACK is allowed. */
  active: boolean
}

const state: PointerState = { x: 0, y: 0, vx: 0, vy: 0, active: false }
const subs = new Set<(s: PointerState) => void>()
let attached = false
let mqCoarse: MediaQueryList | null = null
let mqReduced: MediaQueryList | null = null

const allowed = () => !!mqCoarse && !!mqReduced && !mqCoarse.matches && !mqReduced.matches

function reset() {
  state.x = state.y = state.vx = state.vy = 0
  state.active = false
}

function onMove(e: PointerEvent) {
  if (!allowed() || e.pointerType === 'touch') return
  const x = (e.clientX / window.innerWidth) * 2 - 1
  const y = (e.clientY / window.innerHeight) * 2 - 1
  state.vx = x - state.x
  state.vy = y - state.y
  state.x = x
  state.y = y
  state.active = true
  subs.forEach((fn) => fn(state))
}

/** Cursor left the window or the tab lost focus: ease everything back to rest. */
function onLeave() {
  if (!state.active) return
  state.active = false
  subs.forEach((fn) => fn(state))
}

function onPolicyChange() {
  if (allowed()) return
  reset()
  subs.forEach((fn) => fn(state))
}

function attach() {
  if (attached || typeof window === 'undefined') return
  attached = true
  mqCoarse = window.matchMedia('(pointer: coarse)')
  mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  mqCoarse.addEventListener('change', onPolicyChange)
  mqReduced.addEventListener('change', onPolicyChange)
  window.addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  window.addEventListener('blur', onLeave)
}

function detach() {
  if (!attached) return
  attached = false
  window.removeEventListener('pointermove', onMove)
  document.documentElement.removeEventListener('pointerleave', onLeave)
  window.removeEventListener('blur', onLeave)
  mqCoarse?.removeEventListener('change', onPolicyChange)
  mqReduced?.removeEventListener('change', onPolicyChange)
  reset()
}

/** Live shared state object (mutated in place; never hold a copy). */
export function getPointer(): PointerState {
  return state
}

/** Subscribe to pointer updates. Listener attaches on first subscriber, detaches on last. Returns unsubscribe. */
export function subscribePointer(fn: (s: PointerState) => void): () => void {
  attach()
  subs.add(fn)
  return () => {
    subs.delete(fn)
    if (subs.size === 0) detach()
  }
}

/**
 * Pull `el` toward the pointer when it is within `radius` px of its centre.
 * transform only (x/y via gsap.quickTo). No-op (returns noop) when TRACK is disabled.
 * Returns cleanup that unsubscribes and resets x/y to 0.
 */
export function magnetize(
  el: HTMLElement,
  { strength = 0.3, radius = 100 }: { strength?: number; radius?: number } = {},
): () => void {
  if (typeof window === 'undefined') return () => {}
  const toX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
  const toY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
  let near = false
  const unsub = subscribePointer((s) => {
    if (!s.active) {
      if (near) { toX(0); toY(0) }
      near = false
      return
    }
    const r = el.getBoundingClientRect()
    // getBoundingClientRect includes our own x/y; subtract so the rest centre is stable.
    const cx = r.left + r.width / 2 - (gsap.getProperty(el, 'x') as number)
    const cy = r.top + r.height / 2 - (gsap.getProperty(el, 'y') as number)
    const dx = (s.x + 1) * 0.5 * window.innerWidth - cx
    const dy = (s.y + 1) * 0.5 * window.innerHeight - cy
    if (Math.hypot(dx, dy) > radius + Math.max(r.width, r.height) / 2) {
      if (near) { toX(0); toY(0) }
      near = false
    } else {
      near = true
      toX(dx * strength)
      toY(dy * strength)
    }
  })
  return () => {
    unsub()
    gsap.killTweensOf(el, 'x,y')
    gsap.set(el, { x: 0, y: 0 })
  }
}
