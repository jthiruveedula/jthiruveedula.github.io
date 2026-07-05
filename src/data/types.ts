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
  metrics: Metric[]
  tech: string[]
  vizType: ProjectVizType
}

export interface Chapter {
  id: Era
  title: string
  blurb: string
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
