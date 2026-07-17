import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { portfolio } from '@/data/portfolio'
import type { Skill, SkillDomain } from '@/data/types'
import { ERA_COLORS } from '@/data/types'
import { useInView, useIsMobile, useReducedMotion, useWebGLSupport } from '@/lib/hooks'
import { getSkillStory } from '@/lib/skillStory'
import SplitText from '@/components/SplitText'
import ConstellationScene, { DOMAIN_COLORS } from '@/scenes/ConstellationScene'

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
  const [expanded, setExpanded] = useState<Partial<Record<SkillDomain, boolean>>>({})
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const lastToggled = useRef<SkillDomain | null>(null)
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
          once: true,
        },
      })
      tl.from('[data-reveal]', { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.05 }, 0)
      tl.from(
        '.skills-head .split-word',
        { yPercent: 110, autoAlpha: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out' },
        0.1,
      )
      tl.from('.skills-sub', { y: 20, autoAlpha: 0, duration: 0.6 }, 0.35)
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  )

  // Newly revealed tier-2/3 chips fade in when a domain expands.
  useGSAP(
    () => {
      const domain = lastToggled.current
      if (reducedMotion || !domain || !expanded[domain]) return
      gsap.from(`#skills-list-${slugify(domain)} li[data-extra]`, {
        autoAlpha: 0,
        y: 8,
        duration: 0.25,
        ease: 'power2.out',
        stagger: 0.015,
      })
    },
    { scope: sectionRef, dependencies: [expanded] },
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
      <header data-reveal className="skills-head max-w-3xl">
        <p className="hud-label">04 · capability map</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
          <SplitText as="span">Skills constellation</SplitText>
        </h2>
        <p className="skills-sub mt-4 text-ink-muted">
          {totalSkills} skills across {groups.length} domains, from legacy warehouses to
          production GenAI. Core skills shine as named stars; the rest orbit their domain. Click a
          hub or legend chip to focus a domain — click any skill (star, node, or chip) to zoom in
          and read how it showed up in the field.
        </p>
      </header>

      {/* 3D constellation — decorative enhancement; the chip grid below is the real record.
          Without WebGL the panel is skipped and the chip grid stands alone. */}
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

      {/* Domain legend — hover to preview, click to pin the same focus the 3D hubs use */}
      <div data-reveal className="mt-6 flex flex-wrap gap-2" aria-label="Highlight a skill domain">
        {groups.map((g) => {
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
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs transition-colors ${
                active ? 'border-transparent text-ink' : 'border-panel-edge text-ink-muted'
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

      {/* Full record: all skills grouped by domain — tier-1 visible, the rest collapsible */}
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {groups.map((g) => {
          const count = g.tier1.length + g.rest.length
          const isExpanded = expanded[g.domain] ?? false
          const isDimmed = focusDomain !== null && focusDomain !== g.domain
          const listId = `skills-list-${g.slug}`
          return (
            <div
              key={g.domain}
              data-reveal
              className={`glass-panel rounded-xl border p-5 transition-opacity duration-300 ${
                isDimmed ? 'opacity-50' : 'opacity-100'
              }`}
              style={{
                borderColor: focusDomain === g.domain ? `${g.color}66` : 'transparent',
              }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="flex items-center gap-2.5 font-display text-base font-medium">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: g.color, boxShadow: `0 0 10px ${g.color}66` }}
                  />
                  {g.domain}
                </h3>
                <span className="hud-label shrink-0">{count} skills</span>
              </div>
              <ul id={listId} className="mt-4 flex flex-wrap gap-2">
                {g.tier1.map((skill) => (
                  <SkillChip
                    key={skill.name}
                    skill={skill}
                    color={g.color}
                    active={selectedSkill?.name === skill.name}
                    onSelect={selectSkill}
                  />
                ))}
                {g.rest.map((skill) => (
                  <SkillChip
                    key={skill.name}
                    skill={skill}
                    color={g.color}
                    hidden={!isExpanded}
                    active={selectedSkill?.name === skill.name}
                    onSelect={selectSkill}
                  />
                ))}
              </ul>
              {g.rest.length > 0 && (
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={listId}
                  onClick={() => {
                    lastToggled.current = g.domain
                    setExpanded((prev) => ({ ...prev, [g.domain]: !isExpanded }))
                  }}
                  className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-mono text-xs tracking-wide text-accent-soft transition-colors hover:text-accent"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 12"
                    className={`size-3 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 4.5 6 8l3.5-3.5" />
                  </svg>
                  {isExpanded
                    ? 'show core only'
                    : `show ${g.rest.length} more skill${g.rest.length === 1 ? '' : 's'}`}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
