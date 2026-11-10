import { portfolio } from '@/data/portfolio'
import type { Metric } from '@/data/types'

/** Scaffolded content fields (tradeoff/ownership, engagement descriptions, the
 *  availability line) get an honest `TODO(jagadeesh): ...` value in the data
 *  layer until real copy lands — see issues #206/#207/#209. That marker is for
 *  him reading `portfolio.ts`, not for a site visitor: render nothing rather
 *  than a raw TODO string on the live page. */
export const isPlaceholder = (value?: string): boolean => !!value && value.startsWith('TODO(')

/** The featured project a headline figure traces to: the one project carrying the
 *  same value in its own metrics. When several carry it, the label must match too;
 *  anything without a single source (e.g. the "$2M+" aggregate) returns undefined
 *  and stays plain text. Derived from data, so a link can never point at a card
 *  that doesn't carry the number. */
export function sourceProjectId(metric: Metric): string | undefined {
  let found = portfolio.featuredProjects.filter((p) => p.metrics.some((x) => x.value === metric.value))
  if (found.length > 1)
    found = found.filter((p) => p.metrics.some((x) => x.value === metric.value && x.label === metric.label))
  return found.length === 1 ? found[0].id : undefined
}

/** Follow a figure to its case study: open the card (Projects listens for
 *  hashchange; Lenis preventDefaults anchor clicks, so there is no native one) and
 *  DRAW a one-shot underline under the same number inside it (proof.css .is-cited). */
export function followEvidence(projectId: string, value: string): void {
  history.replaceState(null, '', `#${projectId}`)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
  document.querySelectorAll('.is-cited').forEach((el) => el.classList.remove('is-cited'))
  document
    .getElementById(projectId)
    ?.querySelectorAll<HTMLElement>('[data-figure]')
    .forEach((el) => {
      if (el.dataset.figure !== value) return
      void el.offsetWidth // restart the animation on a repeat click
      el.classList.add('is-cited')
    })
}
