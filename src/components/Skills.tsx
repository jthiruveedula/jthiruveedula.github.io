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
/** Longest-running domain — the depth bars below are scaled against this, so the
 *  header's "stacked by how deep they run" reads as a picture, not a claim. */
const DOMAIN_MAX_YEARS = Math.max(1, ...DOMAIN_GROUPS.map((g) => g.maxYears))

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
      // Shine sweep across each depth bar's fill. The bands are parked
      // off-band here so pre-trigger they read as a clean bar, not a static
      // highlight sitting mid-fill.
      gsap.set('.depth-shine', { xPercent: -160 })
      tl.fromTo(
        '.depth-shine',
        { xPercent: -160 },
        { xPercent: 480, duration: 1.1, ease: 'power2.inOut', stagger: 0.06 },
        0.4,
      )
      // Years count-up — mirrors Metrics' animateCounts. The authored markup
      // already holds the final number, so no-JS / reduced-motion readers see
      // the true value; the tween just replays it upward for everyone else.
      gsap.utils.toArray<HTMLElement>('.depth-years').forEach((el, i) => {
        const years = Number(el.dataset.years)
        if (!Number.isFinite(years) || years <= 0) return
        const proxy = { value: 0 }
        tl.to(
          proxy,
          {
            value: years,
            duration: 0.9,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = String(Math.round(proxy.value))
            },
          },
          0.4 + i * 0.06,
        )
      })
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
                  {group.total} tools
                  {group.maxYears > 0 ? (
                    <>
                      {' '}·{' '}
                      <span className="depth-years" data-years={group.maxYears}>
                        {group.maxYears}
                      </span>
                      + yrs
                    </>
                  ) : null}
                </p>
                {/* Depth as a picture: each domain's bar is its longest-running
                    tool count against the deepest domain on the page. Purely
                    decorative — the label above already states the years, so
                    screen readers get nothing new here (aria-hidden).
                    Pseudo-3D: the track reads recessed, the fill reads raised,
                    via inset shadow bevels only. */}
                {group.maxYears > 0 && (
                  <span
                    aria-hidden="true"
                    className="mt-3 block h-1 w-full max-w-[10rem] bg-neutral-800 shadow-[inset_0_1px_0_rgba(0,0,0,0.65),0_1px_0_rgba(255,255,255,0.07)]"
                  >
                    <span
                      className="relative block h-full overflow-hidden bg-accent-500/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.35)]"
                      style={{ width: `${(group.maxYears / DOMAIN_MAX_YEARS) * 100}%` }}
                    >
                      {/* Shine sweep band — a real child span (GSAP can't target
                          pseudo-elements), parked off-band by the timeline's
                          initial set and swept across on reveal. */}
                      <span
                        aria-hidden="true"
                        className="depth-shine absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.55),transparent)]"
                      />
                    </span>
                  </span>
                )}
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
                          {isOpen ? '− show fewer' : `+ ${group.rest.length} more in this domain`}
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
