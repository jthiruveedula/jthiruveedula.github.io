export type Era = 'legacy' | 'cloud' | 'ai'

export interface Metric {
  label: string
  value: string
  /** Numeric part for count-up animations; omit when not animatable. */
  numeric?: number
  prefix?: string
  suffix?: string
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

export type ProjectVizType = 'migration' | 'streaming' | 'translation' | 'rag' | 'crosscloud'

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
  vizType: ProjectVizType
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

/** Era → design-token color hex (mirrors globals.css @theme). */
export const ERA_COLORS: Record<Era, string> = {
  legacy: '#f59e0b',
  cloud: '#22d3ee',
  ai: '#a78bfa',
}
