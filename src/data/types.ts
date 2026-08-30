export type Era = 'legacy' | 'cloud' | 'ai'

export interface Metric {
  label: string
  value: string
  /** Numeric part for count-up animations; omit when not animatable. */
  numeric?: number
  prefix?: string
  suffix?: string
  /** Where the number came from — shown under the label in the Index grid. */
  source?: string
  /** Filter categories this metric belongs to; groups[0] is the "primary" one used
   *  for the category-composition bar. Only headlineMetrics use this. */
  groups?: string[]
}

export interface Skill {
  name: string
  domain: SkillDomain
  years?: number
  /** 1 = expert/primary, 2 = strong, 3 = working knowledge */
  tier: 1 | 2 | 3
}

export type SkillDomain =
  | 'Cloud Data Platforms'
  | 'GenAI & LLM'
  | 'Data Engineering'
  | 'Streaming & Realtime'
  | 'Databases & Warehouses'
  | 'Languages'
  | 'DevOps & IaC'
  | 'Governance & Quality'

export interface Experience {
  company: string
  client?: string
  title: string
  /** YYYY-MM */
  start: string
  /** YYYY-MM or 'present' */
  end: string
  era: Era
  summary?: string
  highlights: string[]
  metrics?: Metric[]
  tech?: string[]
}

/**
 * The shape of the stage-path diagram's timing — which of the four keyframe
 * patterns (see .stage-path in globals.css) the traveling dot(s) run:
 * - roundtrip: out to the end, dwell, then back — a request/response round trip.
 * - batch: stepped dwell-then-jump — data landing in discrete batches.
 * - gate: dwell at the midpoint — a checkpoint/eval gate the flow must clear.
 * - stream: a single continuous sweep — real-time/streaming ingestion.
 */
export type ProjectFlow = 'roundtrip' | 'batch' | 'gate' | 'stream'

export interface ProjectStage {
  step: number
  /** Short kind label under the node, e.g. "Source", "Govern", "Serve". */
  kind: string
  title: string
  detail: string
}

export interface FeaturedProject {
  id: string
  name: string
  client?: string
  era: Era
  tagline: string
  description: string
  before?: string
  after?: string
  /**
   * The engagement compressed to its two states. The section is called "Featured
   * Transformations", but a card that only lists the end state is not showing a
   * transformation — it is showing a result. This is the scannable version of
   * `before` → `after`, rendered on the card face so the change is visible without
   * opening anything.
   */
  shift?: { from: string; to: string }
  metrics: Metric[]
  tech: string[]
  /** Data-flow shape animated by the stage-path diagram. */
  flow: ProjectFlow
  /** The stage-path diagram's nodes, source → destination. */
  stages: ProjectStage[]
}

export interface Chapter {
  id: Era
  title: string
  /** The era's thesis — what the problem was and what capability it built. Metrics
   *  belong on the role cards, not here. */
  blurb: string
  /**
   * What this era handed the next one. Rendered as a beat between chapters, and it is
   * the section's whole argument: the eras are not a list of jobs, they compound. Omit
   * on the final chapter — the present has nothing to hand forward yet.
   */
  carry?: string
}

export interface Profile {
  name: string
  title: string
  summary: string
  email?: string
  linkedin?: string
  github?: string
  location?: string
}

export interface PortfolioData {
  profile: Profile
  skills: Skill[]
  experience: Experience[]
  featuredProjects: FeaturedProject[]
  headlineMetrics: Metric[]
  certifications: string[]
  education: string[]
  story: { chapters: Chapter[] }
}

/**
 * Era → design-token color hex (mirrors globals.css @theme).
 * v5 redesign: the story is no longer color-coded by era (amber/cyan/violet) —
 * it's a single cyan accent against a grayscale ground. Legacy/cloud read as
 * neutral gray steps that resolve into the accent for the AI era, matching the
 * Timeline's era-band legend (Legacy → Cloud → Enterprise AI).
 */
export const ERA_COLORS: Record<Era, string> = {
  legacy: '#808a91',
  cloud: '#a6aeb4',
  ai: '#46c9f0',
}
