import { portfolio } from '@/data/portfolio'
import type { SkillDomain } from '@/data/types'

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * Systems → Skills cross-link. Maps a `FeaturedProject.tech` string to the Skills
 * domain it belongs to, derived from the same `portfolio.skills` list Skills.tsx
 * renders — so a new skill or project tech entry is picked up automatically instead
 * of drifting against a hand-maintained map.
 *
 * Exact match first (most precise), then "the tech term is contained in a skill
 * name" for compound skill names like "Databricks (Delta Lake, Unity Catalog)".
 * Deliberately no reverse containment: a short skill name (e.g. "GCP") swallowing an
 * unrelated compound term (e.g. "GCP VPC") would be a worse failure than leaving a
 * handful of chips unlinked — those render as plain text instead of a link.
 */
function findDomain(tech: string): SkillDomain | null {
  const needle = normalize(tech)
  if (needle.length < 3) return null
  for (const skill of portfolio.skills) if (normalize(skill.name) === needle) return skill.domain
  for (const skill of portfolio.skills) if (normalize(skill.name).includes(needle)) return skill.domain
  return null
}

const cache = new Map<string, SkillDomain | null>()

export function techDomain(tech: string): SkillDomain | null {
  if (!cache.has(tech)) cache.set(tech, findDomain(tech))
  return cache.get(tech) ?? null
}

/** Anchor id for a domain's row in the Skills section. */
export function domainSlug(domain: SkillDomain): string {
  return `skill-${domain
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`
}

const highlightTimers = new WeakMap<Element, number>()

/**
 * Briefly highlights a domain's row in Skills (`.skills-row--hit` in globals.css).
 * Plain DOM — no context/state shared between the Systems and Skills components.
 *
 * The site's global anchor-click handler (SmoothScroll.tsx) already scrolls any
 * `href="#id"` click there; it calls `preventDefault()` without ever writing the
 * fragment to `location.hash`, so a `:target` CSS selector alone never matches
 * on a real click here (only on a direct load of a URL carrying that hash,
 * where `:target` still applies as a bonus). This class is the click path.
 */
export function pulseDomainRow(domain: SkillDomain): void {
  const el = document.getElementById(domainSlug(domain))
  if (!el) return
  const pending = highlightTimers.get(el)
  if (pending) window.clearTimeout(pending)
  el.classList.add('skills-row--hit')
  highlightTimers.set(
    el,
    window.setTimeout(() => el.classList.remove('skills-row--hit'), 900),
  )
}
