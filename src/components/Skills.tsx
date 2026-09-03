import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import type { Skill } from '@/data/types'
import { useInView, useReducedMotion } from '@/lib/hooks'
import { revealFrom } from '@/lib/motion'
import { domainSlug } from '@/lib/skillMatch'

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface DomainGroup {
  domain: Skill['domain']
  total: number
  /** Tier 1 — "reached for by default". Everything else is a count, not a list;
   *  the section's whole argument is depth-by-domain, not a wall of chips. A
   *  154-item chip table shipped here once already and was cut on visual review. */
  primary: Skill[]
  restCount: number
  maxYears: number
}

/** Grouped in the data's own order — first appearance in portfolio.ts, not a
 *  hardcoded domain list that could drift from what's actually there. */
const DOMAIN_GROUPS: DomainGroup[] = (() => {
  const order: Skill['domain'][] = []
  const byDomain = new Map<Skill['domain'], Skill[]>()
  for (const skill of portfolio.skills) {
    if (!byDomain.has(skill.domain)) {
      byDomain.set(skill.domain, [])
      order.push(skill.domain)
    }
    byDomain.get(skill.domain)!.push(skill)
  }
  return order.map((domain) => {
    const skills = byDomain.get(domain)!
    const primary = skills.filter((s) => s.tier === 1)
    return {
      domain,
      total: skills.length,
      primary,
      restCount: skills.length - primary.length,
      maxYears: Math.max(0, ...skills.map((s) => s.years ?? 0)),
    }
  })
})()

const TOTAL_SKILLS = portfolio.skills.length
const TOTAL_DOMAINS = DOMAIN_GROUPS.length

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [verbRef, verbInView] = useInView<HTMLElement>()

  useGSAP(
    () => {
      if (reduced) return
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          // Replayable — see lib/motion.ts. A one-shot `once: true` trigger paired
          // with a `.from()` reveal is exactly what stranded this section's header
          // the first time it existed on the page.
          toggleActions: 'play none none none',
        },
      })
      revealFrom(tl, '.skills-head', { y: 24, duration: 0.6, stagger: 0.08 }, 0)
      revealFrom(tl, '.skills-row', { y: 20, duration: 0.6, stagger: 0.05 }, 0.15)
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-labelledby="skills-heading"
      className="relative scroll-mt-24 px-[clamp(20px,4vw,64px)] py-[clamp(64px,10vh,120px)]"
    >
      <div className="mx-auto max-w-[1320px]">
        <header className="max-w-[46ch]">
          <p className="skills-head eyebrow">
            <b>04</b> · The toolkit
          </p>
          <h2 id="skills-heading" className="skills-head text-[clamp(1.7rem,3.6vw,2.8rem)]">
            {TOTAL_DOMAINS} domains,{' '}
            <em ref={verbRef} className={`verb${verbInView ? ' verb--armed' : ''}`}>
              stacked
            </em>{' '}
            by how deep they run.
          </h2>
          <p className="skills-head mt-5 text-[clamp(0.95rem,1.1vw,1.05rem)] leading-[1.62] text-ink-muted">
            {TOTAL_SKILLS} tools, pulled from the same résumé data every other section reads.
            Each row leads with what gets reached for by default — the rest of the stack
            follows as a count.
          </p>
        </header>

        <ol className="mt-14 border-t border-rule">
          {DOMAIN_GROUPS.map((group, i) => (
            <li
              key={group.domain}
              id={domainSlug(group.domain)}
              // Target of the tech chips in Systems (ProjectCard.tsx) — a project's
              // tech is cross-linked to the domain it belongs to here, and `:target`
              // (globals.css) gives the arrival highlight with no JS state to wire
              // between the two sections.
              className="skills-row relative scroll-mt-24 grid gap-x-10 gap-y-3 border-b border-rule py-8 md:grid-cols-[10rem_minmax(0,1fr)] lg:grid-cols-[13rem_minmax(0,1fr)]"
            >
              <div>
                <span className="font-mono text-[11px] tracking-[0.1em] text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 max-w-[16ch] text-[1.05rem] text-ink">{group.domain}</h3>
                <p className="stat__label mt-1.5">
                  {group.total} tools{group.maxYears ? ` · ${group.maxYears}+ yrs` : ''}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[0.95rem] leading-[1.7] text-ink-muted">
                  {group.primary.map((s) => s.name).join('  ·  ')}
                </p>
                {group.restCount > 0 ? (
                  <p className="stat__label mt-3 text-ink-faint">
                    +{group.restCount} more across the toolkit
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
