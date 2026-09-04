import { useRef, useState } from 'react'
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
  /** Tier 1 — "reached for by default". Everything else is a count first, a list
   *  only on request; the row's resting state argues depth-by-domain, not a wall
   *  of chips. A 154-item chip table shipped here once already and was cut on
   *  visual review — `rest` is that same tail, just reachable now instead of
   *  asserted-and-hidden: the count used to be the only trace tier 2/3 skills
   *  left in the rendered page at all. */
  primary: Skill[]
  rest: Skill[]
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
      rest: skills.filter((s) => s.tier !== 1),
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
  // One domain open at a time — same model as the Systems wiring panel and the
  // ledger's role detail, so "+N more" behaves like every other disclosure on
  // the page rather than inventing a fourth pattern for the same idea.
  const [openDomain, setOpenDomain] = useState<Skill['domain'] | null>(null)

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
                {group.rest.length > 0 ? (
                  (() => {
                    const isOpen = openDomain === group.domain
                    const panelId = `skill-rest-${domainSlug(group.domain)}`
                    return (
                      <>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setOpenDomain(isOpen ? null : group.domain)}
                          className="stat__label mt-3 text-ink-faint transition-colors hover:text-accent focus-visible:text-accent"
                        >
                          {isOpen ? '− show fewer' : `+ ${group.rest.length} more across the toolkit`}
                        </button>
                        {/* Same grid-template-rows disclosure as the Systems wiring
                            panel and the ledger's role detail — 0fr/1fr collapses
                            without unmounting, so aria-controls resolves to a real
                            node and a keyboard user's place in the list survives a
                            toggle. `inert` (React 19) drops the collapsed list from
                            both focus and the AX tree, matching those two panels. */}
                        <div
                          id={panelId}
                          aria-hidden={!isOpen}
                          inert={!isOpen}
                          className="grid transition-[grid-template-rows] ease-out"
                          style={{
                            gridTemplateRows: isOpen ? '1fr' : '0fr',
                            transitionDuration: reduced ? '0.01ms' : '450ms',
                          }}
                        >
                          <div className="overflow-hidden">
                            <p className="mt-3 text-[0.9rem] leading-[1.7] text-ink-faint">
                              {group.rest.map((s) => s.name).join('  ·  ')}
                            </p>
                          </div>
                        </div>
                      </>
                    )
                  })()
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
