/**
 * The five chapters of the career-journey skyline — sourced entirely from the
 * `experience` entries in `src/data/portfolio.ts` (the canonical resume dataset).
 * No invented numbers: every metric below is copied verbatim from a portfolio.ts
 * metric or highlight. Roles/titles match portfolio.ts exactly (e.g. InnoMinds
 * and DSO MCS Group are both titled "Data Engineer" there, not "ETL Developer").
 */
export type Era = 'legacy' | 'cloud' | 'ai'

/** Matches the ACCENT map in src/data/scenes.ts — one hex per era, reused so the
 *  journey never invents a colour outside the site's existing token set. */
export const ERA_COLOR: Record<Era, string> = {
  legacy: '#66696f',
  cloud: '#9b9ea4',
  ai: '#00caf4',
}

export interface Chapter {
  id: string
  era: Era
  years: string
  roles: string
  title: string
  body: string
  metrics: { label: string; value: string }[]
}

export const chapters: Chapter[] = [
  {
    id: 'foundations',
    era: 'legacy',
    years: '2015 – 2019',
    roles: 'Data Engineer · InnoMinds (CROMA, Hyderabad) → Data Engineer · DSO MCS Group (Mauritius)',
    title: 'Data foundations',
    body: 'Twenty-plus ETL pipelines for the CROMA retail warehouse, then Mainframe, Teradata and NAS sources unified into a mortgage-recovery analytics platform. The low warehouse blocks of the skyline rise first — everything after is built on this substrate.',
    metrics: [
      { label: 'ETL pipelines built', value: '20+' },
      { label: 'Records processed daily', value: '5M+' },
      { label: 'Defect rate reduction', value: '25%' },
    ],
  },
  {
    id: 'cloud-at-scale',
    era: 'cloud',
    years: '2019 – 2022',
    roles: 'Senior Data Engineer · Charles Schwab',
    title: 'Cloud at scale',
    body: 'A multi-petabyte Hadoop/Teradata estate lifted to GCP — 1B+ daily records moved with zero data loss, $1M+ in annual savings, and release cycles cut in half. The towers get taller here, and a bridge spans from the old district into the new.',
    metrics: [
      { label: 'Daily records, zero loss', value: '1B+' },
      { label: 'Annual infra savings', value: '$1M+' },
      { label: 'Release cycles cut', value: '50%' },
    ],
  },
  {
    id: 'genai-accelerators',
    era: 'cloud',
    years: '2022 – 2024',
    roles: 'Lead Data Engineer · HCA Healthcare',
    title: 'GenAI accelerators',
    body: 'Custom GenAI accelerators automated legacy Talend/SQL to PySpark conversion, cutting delivery timelines 50% — alongside a 100+ TB HIPAA-governed migration to GCP. The towers gain their first glowing crowns.',
    metrics: [
      { label: 'Delivery timelines cut', value: '50%' },
      { label: 'Migrated under HIPAA', value: '100+ TB' },
    ],
  },
  {
    id: 'forward-deployed',
    era: 'cloud',
    years: '2024',
    roles: 'Cloud Data Architect · NRG Energy  →  Data & GenAI Architect · Definity',
    title: 'Forward deployed',
    body: 'A phased AWS → GCP Databricks cutover at NRG Energy landed in under 30 minutes of downtime. At Definity, a GenAI pipeline translated COBOL into governed BigQuery SQL and PySpark across 12 triaged workstreams. Bridges now reach out to other districts — the customers.',
    metrics: [
      { label: 'Cutover downtime', value: '<30 min' },
      { label: 'Legacy workstreams triaged', value: '12' },
    ],
  },
  {
    id: 'applied-genai',
    era: 'ai',
    years: '2025 – present',
    roles: 'Data & GenAI Architect (Forward Deployed) · John Wiley & Sons',
    title: 'Applied GenAI',
    body: 'Production RAG over 50M+ documents at 95% grounded accuracy, and a support agent deflecting 60% of tier-1 tickets. A central spire rises above the skyline, and data flows in from every district it was built on.',
    metrics: [
      { label: 'Documents in production RAG', value: '50M+' },
      { label: 'Grounded answer accuracy', value: '95%' },
      { label: 'Tier-1 ticket deflection', value: '60%' },
    ],
  },
]
