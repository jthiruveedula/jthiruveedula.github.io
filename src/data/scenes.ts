import type { Era, Metric } from './types'

/**
 * The scroll-world camera flight — seven stations along one continuous path.
 *
 * Copy and metrics are drawn from `portfolio.ts` (the canonical resume dataset);
 * nothing here is invented. Stills were generated on Higgsfield from a single
 * shared style preamble so the whole flight reads as one world — see SCENE_PLAN.md
 * for the prompts and ASSET_MANIFEST.md for the asset mapping.
 *
 * `era` drives the accent tint; the flight crossfades amber → cyan → violet so no
 * scene boundary is a hard colour cut.
 */
export interface WorldScene {
  id: string
  /** Short label for the scene rail. */
  label: string
  era: Era
  /** Accent hex — matches the era tokens in globals.css. */
  accent: string
  /** 2048w still (desktop) and 1280w still (mobile). */
  still: string
  stillMobile: string
  eyebrow: string
  /**
   * Opening station only: the dominant line, taking the place of `title` as the page's
   * h1 with `title` demoted to a subhead beneath it. A recruiter scanning the first
   * viewport is matching a role, so the role has to be the largest thing on it — the
   * narrative line reads better once they have decided to keep going.
   */
  lead?: string
  title: string
  body: string
  metrics: Metric[]
  tags: string[]
  /** Terminal scene only — the single call to action. */
  cta?: {
    label: string
    href: string
    secondaryLabel: string
    secondaryHref: string
  }
}

export const ACCENT: Record<Era, string> = {
  legacy: '#f59e0b',
  cloud: '#22d3ee',
  ai: '#a78bfa',
}

export const worldScenes: WorldScene[] = [
  {
    id: 'ingress',
    label: 'Origin',
    era: 'cloud',
    accent: '#22d3ee',
    still: '/scenes/01-ingress.jpg',
    stillMobile: '/scenes/01-ingress@sm.jpg',
    eyebrow: 'Jagadeesh Thiruveedula · Dallas–Fort Worth, TX',
    lead: 'Data & AI Architect',
    title: 'Eleven years, one continuous system.',
    body:
      'Fortune 500 enterprises taken from legacy estates through cloud modernization into production GenAI — with the evaluation, guardrails, and governance that turn a demo into a system.',
    metrics: [
      { label: 'Years across data & AI', value: '11+' },
      { label: 'Cost savings delivered', value: '$2M+' },
      { label: 'Events streamed daily', value: '1B+' },
      { label: 'System uptime', value: '99.9%' },
    ],
    tags: ['GCP', 'BigQuery', 'Vertex AI', 'RAG', 'Agents'],
    // An interested visitor should be able to act on arrival rather than scrolling all
    // seven stations to find out how. Rendered quietly so station 7 stays the finale.
    cta: {
      label: 'Get in touch',
      href: 'mailto:jagadeeshthiruveedula77@gmail.com',
      secondaryLabel: 'See the work',
      secondaryHref: '#projects',
    },
  },
  {
    id: 'legacy-substrate',
    label: 'Legacy',
    era: 'legacy',
    accent: '#f59e0b',
    still: '/scenes/02-legacy-substrate.jpg',
    stillMobile: '/scenes/02-legacy-substrate@sm.jpg',
    eyebrow: '2015 – 2019 · Legacy Systems',
    title: 'It starts underground, in COBOL and Teradata.',
    body:
      'Twenty-plus warehouse ETL pipelines for the CROMA retail estate, then Mainframe, Teradata and NAS sources unified into a mortgage-recovery analytics platform. The fluency built down here is exactly what later made LLM-driven COBOL translation possible.',
    metrics: [
      { label: 'ETL pipelines built', value: '20+' },
      { label: 'Records processed daily', value: '5M+' },
      { label: 'Defect rate reduction', value: '25%' },
      { label: 'Pipeline dev time cut', value: '35%' },
    ],
    tags: ['Talend', 'PL/SQL', 'Oracle', 'Hive', 'Mainframe'],
  },
  {
    id: 'great-migration',
    label: 'Migration',
    era: 'cloud',
    accent: '#22d3ee',
    still: '/scenes/03-great-migration.jpg',
    stillMobile: '/scenes/03-great-migration@sm.jpg',
    eyebrow: '2019 – 2022 · Charles Schwab',
    title: 'A multi-petabyte estate moved without losing a row.',
    body:
      'Hadoop and Teradata lifted to GCP with rewritten PySpark and Talend ETL, standardized CDC patterns, a 30M records/day transactional framework at 99.5% SLA, and metadata-driven Terraform deployments.',
    metrics: [
      { label: 'Daily records, zero loss', value: '1B+' },
      { label: 'Annual infra savings', value: '$1M+' },
      { label: 'Efficiency improvement', value: '25%' },
      { label: 'Release cycles cut', value: '50%' },
    ],
    tags: ['BigQuery', 'Dataproc', 'Dataflow', 'PySpark', 'Terraform'],
  },
  {
    id: 'governed-realtime',
    label: 'Realtime',
    era: 'cloud',
    accent: '#22d3ee',
    still: '/scenes/04-governed-realtime.jpg',
    stillMobile: '/scenes/04-governed-realtime@sm.jpg',
    eyebrow: '2022 – 2024 · HCA Healthcare · NRG Energy',
    title: 'Scale is the easy part. Scale under audit is the job.',
    body:
      'Fifty-plus healthcare sources streaming through Kafka and Pub/Sub at 100% data accuracy under HIPAA governance, 100+ TB migrated to GCP, and a cross-cloud AWS → GCP cutover delivered inside a 30-minute window.',
    metrics: [
      { label: 'Migrated under HIPAA', value: '100+ TB' },
      { label: 'Sources streamed real-time', value: '50+' },
      { label: 'Cutover downtime', value: '<30 min' },
      { label: 'Uptime SLA', value: '99.95%' },
    ],
    tags: ['Kafka', 'Pub/Sub', 'Databricks', 'dbt', 'HIPAA'],
  },
  {
    id: 'translation-engine',
    label: 'Translation',
    era: 'ai',
    accent: '#a78bfa',
    still: '/scenes/05-translation-engine.jpg',
    stillMobile: '/scenes/05-translation-engine@sm.jpg',
    eyebrow: '2024 – 2025 · Definity',
    title: 'Decades of mainframe logic, translated by LLMs.',
    body:
      'A GenAI code-translation pipeline turning Mainframe/COBOL into BigQuery SQL and PySpark, scored by a semantic-fidelity eval harness and deployed inside the customer’s GCP VPC behind their own IAM. Discovery across 12 workstreams sequenced the migration by risk and value.',
    metrics: [
      { label: 'Legacy workstreams triaged', value: '12' },
      { label: 'Reusable patterns codified', value: '5' },
    ],
    tags: ['GenAI translation', 'PySpark', 'BigQuery', 'GCP VPC', 'IAM'],
  },
  {
    id: 'grounded-mind',
    label: 'Grounded AI',
    era: 'ai',
    accent: '#a78bfa',
    still: '/scenes/06-grounded-mind.jpg',
    stillMobile: '/scenes/06-grounded-mind@sm.jpg',
    eyebrow: '2025 – present · John Wiley & Sons',
    title: 'RAG that cites its sources, at fifty million documents.',
    body:
      'Production retrieval over an enterprise corpus with hybrid search and cross-encoder reranking, MCP-orchestrated multi-agent tool use, and an LLMOps layer — evals, guardrails, drift observability — all inside the customer’s VPC behind SSO/SAML.',
    metrics: [
      { label: 'Documents in production RAG', value: '50M+' },
      { label: 'Grounded answer accuracy', value: '95%' },
      { label: 'Tier-1 ticket deflection', value: '60%' },
      { label: 'p95 latency', value: '<1.5s' },
    ],
    tags: ['Vertex AI', 'Pinecone', 'LangGraph', 'MCP', 'RAGAS', 'VPC-SC'],
  },
  {
    id: 'whole-system',
    label: 'The Offer',
    era: 'ai',
    accent: '#a78bfa',
    still: '/scenes/07-whole-system.jpg',
    stillMobile: '/scenes/07-whole-system@sm.jpg',
    eyebrow: 'Dallas–Fort Worth, TX · Open to relocation',
    title: 'I build the system, not the demo.',
    body:
      'Legacy untangled, platforms modernized, GenAI shipped into production with evals and governance intact. That is the whole eleven years in one sentence.',
    metrics: [
      { label: 'Cost savings delivered', value: '$2M+' },
      { label: 'Cloud migrations orchestrated', value: '500+ TiB' },
      { label: 'Grounded RAG accuracy', value: '95%' },
      { label: 'Years across data & AI', value: '11+' },
    ],
    tags: ['GCP PDE certified', 'Forward deployed', 'Architecture governance'],
    cta: {
      label: 'Hire me — view résumé',
      href: '/resume.html',
      secondaryLabel: 'jagadeeshthiruveedula77@gmail.com',
      secondaryHref: 'mailto:jagadeeshthiruveedula77@gmail.com',
    },
  },
]
