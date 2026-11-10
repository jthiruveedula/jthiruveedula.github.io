/**
 * Showcase vs compact view. The attribute is set before first paint by the inline
 * script in index.html and can only change with a reload, so this is read once —
 * no store, no context, no subscription. CSS (styles/compact.css) owns the compact
 * layout; JS only uses COMPACT to skip work that would be invisible there.
 */
export type View = 'showcase' | 'compact'

export const COMPACT: boolean =
  typeof document !== 'undefined' && document.documentElement.dataset.view === 'compact'

/** gsap.matchMedia query for motion: 'not all' never matches, so compact creates no ScrollTriggers. */
export const MOTION_QUERY = COMPACT ? 'not all' : '(prefers-reduced-motion: no-preference)'

/** Compact view or OS-level reduced motion. */
export function prefersCalm(): boolean {
  return COMPACT || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

/** Real link into the other mode at the same section: `?view=compact#systems`. */
export function viewHref(target: View, sectionId = 'top'): string {
  return `?view=${target}#${sectionId}`
}
