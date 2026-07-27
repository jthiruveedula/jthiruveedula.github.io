// Shared motion rhythm — every GSAP/CSS animation in the app draws from these.
export const DUR = {
  fast: 0.2,
  reveal: 0.7,
  exit: 0.45, // ~65% of reveal
} as const

export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  spring: 'back.out(1.6)',
} as const

export const STAGGER = 0.04

/**
 * Scroll-triggered entrance reveal that cannot strand its target invisible.
 *
 * Entrance reveals here were written as one-shot `tl.from(target, { autoAlpha: 0 })`
 * under a `once: true` ScrollTrigger. That combination has bitten this codebase twice —
 * every project card, and the whole Skills header — because `.from()` records the
 * from-state as inline style immediately, so if the GSAP context is ever reverted after
 * the trigger has already been consumed, the element keeps `opacity: 0; visibility:
 * hidden` and nothing is left to play it forward. The Skills case was worse than it
 * looked: `visibility` inherits, so one stranded `<header>` silently took its kicker and
 * heading down with it.
 *
 * Three properties make this safe:
 *   - `fromTo` with an explicit visible end state, so the resting state is never implied
 *   - `clearProps` on the animated properties, so a completed reveal leaves no inline
 *     opacity/visibility behind for a later revert to restore
 *   - callers pair it with a replayable trigger instead of `once: true`, so a rebuilt
 *     context can run the reveal again rather than sitting on a dead from-state
 */
interface RevealOptions {
  /** Offset props to animate from. All of these rest at 0, which is what makes the
   *  explicit end state below safe to derive. */
  y?: number
  yPercent?: number
  x?: number
  duration?: number
  ease?: string
  stagger?: number
}

const OFFSET_KEYS = ['y', 'yPercent', 'x'] as const

export function revealFrom(
  timeline: gsap.core.Timeline,
  targets: gsap.TweenTarget,
  options: RevealOptions = {},
  position: gsap.Position = 0,
): gsap.core.Timeline {
  const { duration, ease, stagger, ...offsets } = options
  const restingOffsets = Object.fromEntries(
    OFFSET_KEYS.filter((key) => key in offsets).map((key) => [key, 0]),
  )

  return timeline.fromTo(
    targets,
    { ...offsets, autoAlpha: 0 },
    {
      ...restingOffsets,
      autoAlpha: 1,
      duration,
      ease,
      stagger,
      // Leave no inline opacity/visibility behind, so a later context revert has nothing
      // to restore the element to an invisible state with.
      clearProps: 'opacity,visibility',
      // Do not write the from-state at render time. With it on, scrolling back to the very
      // top of the page re-rendered the start state of every reveal whose trigger sits
      // below the viewport — re-hiding already-revealed content with no pending tween to
      // bring it back. That is what kept the Skills header disappearing at scrollY 0.
      immediateRender: false,
    },
    position,
  )
}
