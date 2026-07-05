import { portfolio } from '@/data/portfolio'
import type { Era, Skill, SkillDomain } from '@/data/types'

export interface SkillStory {
  headline: string
  narrative: string
  source: string
  era: Era
}

interface Anchor {
  company: string
  project: string
  era: Era
  tech: string[]
  metric?: string
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .split(/[→/·]/)[0]
    .replace(/[^a-z0-9]+/g, '')
    .trim()
}

function hash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0
  return Math.abs(h)
}

const PROJECT_ANCHORS: Anchor[] = portfolio.featuredProjects.map((p) => ({
  company: p.client ?? p.name,
  project: p.name,
  era: p.era,
  tech: p.tech,
  metric: p.metrics[0] ? `${p.metrics[0].value} ${p.metrics[0].label.toLowerCase()}` : undefined,
}))

const EXPERIENCE_ANCHORS: Anchor[] = portfolio.experience.map((e) => ({
  company: e.client ? `${e.company} — ${e.client}` : e.company,
  project: e.title,
  era: e.era,
  tech: e.tech ?? [],
  metric: e.metrics?.[0] ? `${e.metrics[0].value} ${e.metrics[0].label.toLowerCase()}` : undefined,
}))

const ALL_ANCHORS: Anchor[] = [...PROJECT_ANCHORS, ...EXPERIENCE_ANCHORS]

function findAnchor(skillKey: string): Anchor | undefined {
  return ALL_ANCHORS.find((a) =>
    a.tech.some((t) => {
      const tk = normalize(t)
      return tk.length > 0 && (tk === skillKey || tk.includes(skillKey) || skillKey.includes(tk))
    }),
  )
}

const TIER_CLAUSE: Record<Skill['tier'], (years?: number) => string> = {
  1: (years) =>
    `It's one of the tools reached for by default — ${years ? `${years}+ years of ` : ''}hands-on ownership across design, build, and production support.`,
  2: () => 'Used heavily to get the job done — a dependable part of the toolkit rather than the headline technology.',
  3: () => 'Applied where the situation called for it — enough working knowledge to integrate cleanly with the rest of the stack.',
}

const DOMAIN_CLAUSE: Record<SkillDomain, string> = {
  'Cloud Data Platforms': 'shaping how data moved between storage layers and compute',
  'GenAI & LLM': 'shaping how retrieval, generation, and evaluation fit together',
  'Data Engineering': 'keeping pipelines resilient as volume and schema shifted underneath them',
  'Streaming & Realtime': 'keeping event flow low-latency and observable end to end',
  'Databases & Warehouses': 'keeping the data model clean enough for the next team to build on',
  Languages: 'gluing services, scripts, and pipelines together',
  'DevOps & IaC': 'keeping deploys repeatable and infrastructure changes reviewable',
  'Governance & Quality': 'keeping the output auditable and inside guardrails',
}

/**
 * A best-effort, deterministic "field story" for a skill — grounded in real
 * project/experience data where the tech stack matches, and otherwise a
 * plausible supporting-role narrative anchored to a real engagement.
 * Not a verbatim work history — a narrative gloss for the skills graph.
 */
export function getSkillStory(skill: Skill): SkillStory {
  const key = normalize(skill.name)
  const direct = findAnchor(key)
  const anchor = direct ?? ALL_ANCHORS[hash(skill.name) % ALL_ANCHORS.length]
  const tierClause = TIER_CLAUSE[skill.tier](skill.years)

  const narrative = direct
    ? `On ${anchor.project} at ${anchor.company}, ${skill.name} was core to the effort${
        anchor.metric ? ` — part of what delivered ${anchor.metric}` : ''
      }. ${tierClause}`
    : `${skill.name} wasn't the headline technology on ${anchor.project} at ${anchor.company}, but it worked in the background — ${DOMAIN_CLAUSE[skill.domain]}. ${tierClause}`

  return {
    headline: `${skill.name} in the field`,
    narrative,
    source: `${anchor.company} · ${anchor.project}`,
    era: anchor.era,
  }
}
