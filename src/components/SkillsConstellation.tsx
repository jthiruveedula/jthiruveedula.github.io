import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import type { Era, Skill, SkillDomain } from '@/data/types'
import { ERA_COLORS } from '@/data/types'
import { useInView, useIsMobile, useReducedMotion, useWebGLSupport } from '@/lib/hooks'
import { getSkillStory } from '@/lib/skillStory'
import { revealFrom } from '@/lib/motion'
import SplitText from '@/components/SplitText'
import ConstellationScene, { DOMAIN_COLORS } from '@/scenes/ConstellationScene'
import Decrypt from '@/components/Decrypt'
import SectionSweep from '@/components/SectionSweep'
import ClipReveal from '@/components/ClipReveal'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const TIER_LABELS: Record<Skill['tier'], string> = {
  1: 'core skill',
  2: 'strong skill',
  3: 'working knowledge',
}

interface DomainGroup {
  domain: SkillDomain
  color: string
  slug: string
  tier1: Skill[]
  rest: Skill[]
}

function slugify(domain: string): string {
  return domain.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

/**
 * Domains bucketed into the site's three eras, in story order. Mirrors the era grouping the
 * node palette already uses (see DOMAIN_COLORS), so the rail reads as the same
 * legacy → cloud → AI arc and the colours become an axis rather than decoration.
 */
const ERA_RAIL: { id: Era; label: string; domains: SkillDomain[] }[] = [
  { id: 'legacy', label: 'legacy', domains: ['Databases & Warehouses', 'Languages'] },
  {
    id: 'cloud',
    label: 'cloud',
    domains: ['Cloud Data Platforms', 'Data Engineering', 'Streaming & Realtime'],
  },
  { id: 'ai', label: 'ai', domains: ['GenAI & LLM', 'Governance & Quality', 'DevOps & IaC'] },
]

function groupByDomain(skills: Skill[]): DomainGroup[] {
  const order = [...new Set(skills.map((s) => s.domain))]
  return order.map((domain) => {
    const domainSkills = skills.filter((s) => s.domain === domain)
    return {
      domain,
      color: DOMAIN_COLORS[domain],
      slug: slugify(domain),
      tier1: domainSkills.filter((s) => s.tier === 1),
      rest: domainSkills.filter((s) => s.tier !== 1),
    }
  })
}

function SkillChip({
  skill,
  color,
  hidden,
  active,
  onSelect,
}: {
  skill: Skill
  color: string
  hidden?: boolean
  active: boolean
  onSelect: (skill: Skill) => void
}) {
  const isCore = skill.tier === 1
  return (
    <li hidden={hidden} data-extra={hidden === undefined ? undefined : ''}>
      <button
        type="button"
        onClick={() => onSelect(skill)}
        aria-haspopup="dialog"
        aria-expanded={active}
        className={`press-feedback inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
          isCore ? 'border-panel-edge bg-panel text-ink' : 'border-panel-edge/60 text-ink-muted'
        } ${active ? 'ring-2 ring-offset-2 ring-offset-void' : ''}`}
        style={{
          borderColor: isCore ? `${color}55` : undefined,
          boxShadow: isCore ? `0 0 12px ${color}1f` : undefined,
          ...(active ? ({ '--tw-ring-color': color } as Record<string, string>) : {}),
        }}
      >
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: color, opacity: isCore ? 1 : 0.45 }}
        />
        {skill.name}
        {skill.years !== undefined && <span className="text-ink-faint">{skill.years}y</span>}
        <span className="sr-only">, {TIER_LABELS[skill.tier]} — view field story</span>
      </button>
    </li>
  )
}

export default function SkillsConstellation() {
  const reducedMotion = useReducedMotion()
  const webgl = useWebGLSupport()
  const isMobile = useIsMobile()
  const [canvasRef, inView] = useInView<HTMLDivElement>('300px')
  const [hasEntered, setHasEntered] = useState(false)
  const [pinned, setPinned] = useState<SkillDomain | null>(null)
  const [hovered, setHovered] = useState<SkillDomain | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const closeStoryRef = useRef<HTMLButtonElement>(null)

  const groups = useMemo(() => groupByDomain(portfolio.skills), [])
  const totalSkills = portfolio.skills.length
  const focusDomain = hovered ?? pinned ?? selectedSkill?.domain ?? null
  const story = useMemo(() => (selectedSkill ? getSkillStory(selectedSkill) : null), [selectedSkill])

  const selectSkill = (skill: Skill) => {
    setPinned(skill.domain)
    setSelectedSkill(skill)
  }
  const closeStory = () => setSelectedSkill(null)

  // Escape closes the field-story panel and returns focus to the trigger.
  useEffect(() => {
    if (!selectedSkill) return
    closeStoryRef.current?.focus({ preventScroll: true })
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeStory()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [selectedSkill])

  // Mount the Canvas once the section approaches the viewport, then keep it.
  useEffect(() => {
    if (inView) setHasEntered(true)
  }, [inView])

  // Section reveal — staggered rise per the shared motion language.
  useGSAP(
    () => {
      if (reducedMotion || !sectionRef.current) return
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          // Replayable rather than `once: true`. A consumed one-shot trigger cannot
          // recover if the GSAP context is rebuilt, which is how this section's header
          // ended up stranded at visibility:hidden — and because visibility inherits, it
          // took the kicker and heading with it.
          toggleActions: 'play none none none',
        },
      })
      revealFrom(tl, '[data-reveal]', { y: 24, duration: 0.7, stagger: 0.05 }, 0)
      revealFrom(
        tl,
        '.skills-head .split-word',
        { yPercent: 110, duration: 0.8, stagger: 0.05, ease: 'power3.out' },
        0.1,
      )
      revealFrom(tl, '.skills-sub', { y: 20, duration: 0.6 }, 0.35)
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )


  const toggleFocus = (domain: SkillDomain) => {
    setSelectedSkill(null)
    setPinned((p) => (p === domain ? null : domain))
  }

  return (
    <section
      ref={sectionRef}
      id="skills"
      aria-label="Skills constellation"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6 md:py-32"
    >
      <ClipReveal>
      <header data-reveal className="skills-head max-w-3xl">
        <Decrypt as="p" className="hud-label section-kicker" text="02 · capability map" />
        <SectionSweep />
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
          <SplitText as="span">Skills constellation</SplitText>
        </h2>
        <p className="skills-sub mt-4 max-w-2xl text-ink-muted">
          {totalSkills} capabilities, clustered into {groups.length} domains and coloured by the era
          they belong to — the amber ones are a decade deep, the violet ones are current. One map of
          what eleven years actually accumulated.
        </p>
      </header>

      {/* How to read this — the encoding, stated. The section used to lean on a paragraph of
          instructions plus a 154-chip table beneath, which explained the data but never the
          graphic. A key does that job in a fraction of the space. */}
      <dl data-reveal className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-3">
        {[
          {
            label: 'Cluster',
            body: 'One domain. The bigger the core, the more it holds.',
            glyph: (
              <span className="relative flex size-4 items-center justify-center">
                <span className="absolute size-4 rounded-full bg-cloud/25" />
                <span className="size-2 rounded-full bg-cloud" />
              </span>
            ),
          },
          {
            label: 'Bright node',
            body: 'A core skill. Hover a cluster to read its names.',
            glyph: (
              <span className="flex size-4 items-center justify-center">
                <span className="size-2 rounded-full bg-ink shadow-[0_0_8px_rgba(230,237,247,0.8)]" />
              </span>
            ),
          },
          {
            label: 'Faint node',
            body: 'Supporting depth, orbiting its domain.',
            glyph: (
              <span className="flex size-4 items-center justify-center">
                <span className="size-1.5 rounded-full bg-ink-faint" />
              </span>
            ),
          },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 shrink-0">
              {item.glyph}
            </span>
            <div>
              <dt className="hud-label text-[10px] text-ink">{item.label}</dt>
              <dd className="mt-1 text-sm leading-snug text-ink-muted">{item.body}</dd>
            </div>
          </div>
        ))}
      </dl>

      {/* 3D constellation — decorative enhancement. The full record lives in the
          screen-reader list further down (and renders visibly when WebGL is unavailable),
          so removing the chip table did not remove the content. */}
      {webgl && (
        <div
          ref={canvasRef}
          data-reveal
          className="glass-panel relative mt-10 h-[320px] overflow-hidden rounded-2xl sm:h-[420px] md:h-[540px]"
        >
          {/* The 3D graph is a decorative enhancement — hidden from AT; the story
              panel below (when open) is real interactive content and stays exposed. */}
          <div aria-hidden="true" className="absolute inset-0">
            {hasEntered && (
              <Canvas
                camera={{ position: [0, 0.4, 10.5], fov: 42 }}
                dpr={[1, 2]}
                frameloop={!inView ? 'never' : reducedMotion ? 'demand' : 'always'}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                onPointerMissed={() => {
                  setPinned(null)
                  setSelectedSkill(null)
                }}
              >
                <ConstellationScene
                  skills={portfolio.skills}
                  focusDomain={focusDomain}
                  onSelectDomain={toggleFocus}
                  selectedSkill={selectedSkill}
                  onSelectSkill={selectSkill}
                  isMobile={isMobile}
                  animate={inView && !reducedMotion}
                  reducedMotion={reducedMotion}
                />
              </Canvas>
            )}
            <span className="hud-label pointer-events-none absolute left-4 top-3">skill graph</span>
            <span className="hud-label pointer-events-none absolute right-4 top-3">
              {totalSkills} nodes
            </span>
          </div>

          {/* Field-story panel — opens when a node (3D or chip) is selected */}
          {story && selectedSkill && (
            <div
              role="dialog"
              aria-modal="false"
              aria-labelledby="skill-story-heading"
              className="glass-panel absolute inset-x-3 bottom-3 z-10 max-h-[70%] overflow-y-auto rounded-xl p-4 sm:inset-x-auto sm:right-3 sm:top-3 sm:bottom-3 sm:w-72 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="hud-label" style={{ color: DOMAIN_COLORS[selectedSkill.domain] }}>
                    {selectedSkill.domain}
                  </p>
                  <h3 id="skill-story-heading" className="mt-1 font-display text-lg font-semibold text-ink">
                    {selectedSkill.name}
                  </h3>
                </div>
                <button
                  ref={closeStoryRef}
                  type="button"
                  onClick={closeStory}
                  aria-label="Close field story"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink"
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3l10 10M13 3 3 13" />
                  </svg>
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{story.narrative}</p>
              <p
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wide text-ink-muted"
                style={{ borderColor: `${ERA_COLORS[story.era]}55` }}
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full"
                  style={{ background: ERA_COLORS[story.era] }}
                />
                {story.source}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Domain rail, grouped by era. Doubles as the colour key the graphic needs — reading
          it left to right is the same legacy → cloud → AI arc the rest of the site tells, so
          the palette stops being decoration and starts being the axis. Also the keyboard
          route into a domain, since canvas hubs cannot take focus. */}
      <div data-reveal className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3">
        {ERA_RAIL.map((era, eraIndex) => (
          <div key={era.id} className="flex flex-wrap items-center gap-2">
            {eraIndex > 0 && (
              <span aria-hidden="true" className="mr-1 hidden text-ink-faint sm:inline">
                →
              </span>
            )}
            <span
              className="hud-label text-[10px]"
              style={{ color: ERA_COLORS[era.id] }}
            >
              {era.label}
            </span>
            {groups
              .filter((g) => era.domains.includes(g.domain))
              .map((g) => {
                const active = focusDomain === g.domain
                return (
                  <button
                    key={g.domain}
                    type="button"
                    aria-pressed={pinned === g.domain}
                    onMouseEnter={() => setHovered(g.domain)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(g.domain)}
                    onBlur={() => setHovered(null)}
                    onClick={() => toggleFocus(g.domain)}
                    className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-xs transition-colors ${
                      active ? 'border-transparent text-ink' : 'border-panel-edge text-ink-muted hover:text-ink'
                    }`}
                    style={active ? { borderColor: g.color, background: `${g.color}1a` } : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full"
                      style={{ background: g.color, boxShadow: `0 0 8px ${g.color}88` }}
                    />
                    {g.domain}
                    <span className="text-ink-faint">{g.tier1.length + g.rest.length}</span>
                  </button>
                )
              })}
          </div>
        ))}
      </div>

      {/* Core skills for the pinned domain. Progressive disclosure replaces the old
          154-chip table: pick a domain and you get its handful of core skills, not the
          whole inventory. It is also the keyboard route to the field stories, which the
          canvas nodes cannot provide because a canvas cannot take focus. Driven by `pinned`
          rather than `focusDomain` so merely hovering the rail does not make it flicker. */}
      {(() => {
        const shown = pinned ?? selectedSkill?.domain ?? null
        const group = shown ? groups.find((g) => g.domain === shown) : null
        if (!group) return null
        return (
          <div className="mt-6 border-t border-panel-edge/60 pt-5">
            <p className="hud-label text-[10px]" style={{ color: group.color }}>
              {group.domain} · {group.tier1.length} core
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.tier1.map((skill) => (
                <SkillChip
                  key={skill.name}
                  skill={skill}
                  color={group.color}
                  active={selectedSkill?.name === skill.name}
                  onSelect={selectSkill}
                />
              ))}
            </ul>
          </div>
        )
      })()}

      {/* The complete record. Visually hidden when the constellation is doing the talking —
          the graphic plus the domain rail is the presentation — but always in the DOM so
          crawlers and screen readers get all 154 capabilities with their depth and standing.
          When WebGL is unavailable this is the only representation, so it becomes visible. */}
      <div className={webgl ? 'sr-only' : 'mt-10 grid gap-6 sm:grid-cols-2'}>
        <h3 className={webgl ? '' : 'sr-only'}>Full capability record</h3>
        {groups.map((g) => (
          <section key={g.domain} aria-label={`${g.domain} skills`}>
            <h4 className={webgl ? '' : 'flex items-center gap-2.5 font-display text-base font-medium'}>
              {!webgl && (
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: g.color, boxShadow: `0 0 10px ${g.color}66` }}
                />
              )}
              {g.domain}
            </h4>
            <ul className={webgl ? '' : 'mt-3 flex flex-wrap gap-x-3 gap-y-1.5'}>
              {[...g.tier1, ...g.rest].map((skill) => (
                <li
                  key={skill.name}
                  className={webgl ? '' : 'font-mono text-xs text-ink-muted'}
                >
                  {skill.name}
                  {skill.years ? ` — ${skill.years} years` : ''}
                  {`, ${TIER_LABELS[skill.tier]}`}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      </ClipReveal>
    </section>
  )
}
