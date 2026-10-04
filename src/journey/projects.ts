import { portfolio } from '@/data/portfolio'

export interface JourneyProject {
  id: string
  name: string
  client?: string
  tagline: string
  metric?: { label: string; value: string }
  tech: string[]
  chapterId: string
  district: 0 | 1 | 2 | 3 | 4
  href: string
}

/** featured-project id -> where it stands in the city. */
const PLACEMENT: Record<string, { chapterId: string; district: JourneyProject['district'] }> = {
  'schwab-hadoop-teradata-gcp': { chapterId: 'cloud-at-scale', district: 1 },
  'hca-hipaa-streaming': { chapterId: 'genai-accelerators', district: 2 },
  'nrg-cross-cloud': { chapterId: 'forward-deployed', district: 3 },
  'definity-cobol-translation': { chapterId: 'forward-deployed', district: 3 },
  'wiley-private-llm-rag': { chapterId: 'applied-genai', district: 4 },
  'wiley-snowflake-bigquery': { chapterId: 'applied-genai', district: 4 },
}

export const journeyProjects: JourneyProject[] = Object.entries(PLACEMENT).flatMap(([id, place]) => {
  const p = portfolio.featuredProjects.find((f) => f.id === id)
  if (!p) return []
  const m = p.metrics[0]
  return [
    {
      id,
      name: p.name,
      client: p.client,
      tagline: p.tagline,
      metric: m && { label: m.label, value: m.value },
      tech: p.tech,
      ...place,
      // ProjectCard renders <article id={project.id}> on the main site.
      href: `/#${id}`,
    },
  ]
})
