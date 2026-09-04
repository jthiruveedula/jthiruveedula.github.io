/**
 * The flight — seven rooms passing one lens.
 *
 * Copy is first person on purpose. It is his own site, and "I pointed an LLM at the
 * code I used to write" carries the argument in a way no third-person construction
 * does. Every figure here is quoted from `portfolio.ts`; nothing is invented.
 *
 * `weight` is the scene's share of camera travel. Deliberately uneven — scene 2 is
 * clipped short, scene 5 is held long. Nothing signals a human edit like a beat that
 * is shorter than its neighbour on purpose.
 */
export interface FlightScene {
  id: string
  /** Basename in public/scenes/graded/. */
  plate: string
  /** Share of total camera travel. */
  weight: number
  /** Shown in the frame counter — the year you are standing in. */
  year: string
  eyebrow: string
  headline: string
  /** The verb landmark inside `headline`, coloured and underlined. Must appear verbatim. */
  verb?: string
  /** Two or three readings, each with its source printed under it. */
  readings: { value: string; label: string }[]
  /** The line that carries the beat's argument. */
  kicker?: string
  /**
   * Mobile-only object-position override, `"X% Y%"`. The default (`center 48%`)
   * is tuned for the plates' own 16:9 framing, where cropping is horizontal and
   * the full frame height survives cover-fit into a portrait viewport — which is
   * exactly the problem on two plates authored with a wide establishing shot's
   * headroom: that headroom is real image content, not a crop artifact, and no
   * object-position value can crop away pixels that already fit. Those two set
   * this field to pull the visible window toward whatever part of the frame
   * actually carries the subject. Unset means the default already works — most
   * plates read fine cropped tight, because their subject is already centered.
   */
  mobilePosition?: string
  /**
   * Mobile-only zoom, for the one plate `mobilePosition` cannot fix: this plate's
   * cover-fit is height-constrained (the full frame height already fits the
   * portrait viewport with room to spare on width), so there is no vertical crop
   * budget for `object-position` to redistribute — the dark headroom above the
   * equipment is real image content, fully visible, not a crop artifact. Scaling
   * past the natural cover point trades some of that surplus width for the
   * vertical crop this plate actually needs.
   */
  mobileZoom?: { scale: number; origin: string }
}

export const flightScenes: FlightScene[] = [
  {
    id: 'ingress',
    plate: '01-ingress',
    weight: 1.0,
    year: '2015 — present',
    eyebrow: 'Jagadeesh Thiruveedula · Data & AI Architect · Dallas–Fort Worth, TX',
    headline: 'I automated the job I used to do by hand.',
    verb: 'automated',
    readings: [
      { value: '11+', label: 'years, data & AI' },
      { value: '$2M+', label: 'cost saved' },
      { value: '500+ TiB', label: 'migrated' },
    ],
    kicker:
      'Eleven years: first writing ETL against Mainframe and Teradata, then moving petabyte estates to GCP without losing a row, now building the LLM systems that do the first job — and the eval harnesses that prove they did it right.',
  },
  {
    id: 'substrate',
    plate: '02-legacy-substrate',
    weight: 0.85,
    year: '2015 — 2019',
    eyebrow: 'InnoMinds (CROMA) · DSO MCS Group',
    headline: 'First I wrote them by hand. Twenty of them.',
    verb: 'wrote',
    readings: [
      { value: '20+', label: 'ETL pipelines built' },
      { value: '5M+', label: 'records / day' },
      { value: '25%', label: 'defect rate cut' },
    ],
    kicker: 'Nobody automates a language they cannot read.',
  },
  {
    id: 'migration',
    plate: '03-great-migration',
    weight: 1.15,
    year: '2019 — 2022',
    eyebrow: 'Charles Schwab · Austin, TX',
    headline: 'A multi-petabyte estate, moved without losing a row.',
    verb: 'moved',
    readings: [
      { value: '1B+', label: 'daily records, zero loss' },
      { value: '$1M+', label: 'annual infra savings' },
      { value: '50%', label: 'release cycles cut' },
    ],
    kicker:
      'The discipline was never speed. It was making the migration boring, reversible, and provable.',
  },
  {
    id: 'governed',
    plate: '04-governed-realtime',
    weight: 1.0,
    year: '2022 — 2024',
    eyebrow: 'HCA Healthcare · NRG Energy',
    headline: 'Scale is the easy part. Scale under audit is the job.',
    verb: 'audit',
    // See `mobileZoom` on the type: object-position has no vertical crop budget to
    // spend here, so this plate zooms past cover instead, anchored low.
    mobileZoom: { scale: 1.8, origin: '50% 84%' },
    readings: [
      { value: '50+', label: 'clinical sources, real time' },
      { value: '100%', label: 'data accuracy under HIPAA' },
      { value: '<30 min', label: 'cross-cloud cutover' },
    ],
    kicker:
      'The evaluation and governance built for regulated data became the guardrails for the LLMs.',
  },
  {
    id: 'translation',
    plate: '05-translation-engine',
    weight: 1.55,
    year: '2024 — 2025',
    eyebrow: 'Definity · Mainframe Operations',
    headline: 'Then I pointed an LLM at the code I used to write.',
    verb: 'pointed',
    readings: [
      { value: '12', label: 'COBOL workstreams triaged' },
      { value: '5', label: 'patterns codified' },
    ],
    kicker:
      'Nothing was promoted until a semantic-fidelity eval harness scored it. That harness is the entire difference between a translation and a guess.',
  },
  {
    id: 'grounded',
    plate: '06-grounded-mind',
    weight: 1.2,
    year: '2025 — present',
    eyebrow: 'John Wiley & Sons · Forward Deployed',
    headline: 'Fifty million documents. 95% grounded — measured, not claimed.',
    verb: 'measured',
    readings: [
      { value: '50M+', label: 'docs in production RAG' },
      { value: '95%', label: 'grounded accuracy' },
      { value: '60%', label: 'tier-1 tickets deflected' },
    ],
    kicker:
      'In-VPC, behind SSO/SAML, with VPC-SC, CMEK and full audit logging. The data never left the customer perimeter.',
  },
  {
    id: 'whole',
    plate: '07-whole-system',
    weight: 1.05,
    year: 'the whole system',
    eyebrow: 'Legacy roots · Cloud trunk · AI canopy',
    headline: 'Eleven years. One structure.',
    verb: 'One',
    // The lit structure sits left-of-centre in this plate; portrait cover-fit
    // crops mostly on width, and dead-centre crops half the structure away.
    mobilePosition: '20% 46%',
    readings: [
      { value: '99.9%', label: 'system uptime' },
      { value: '5', label: 'engineers mentored to senior' },
      { value: '10+', label: 'programs adopted the framework' },
    ],
    kicker: 'Legacy roots, cloud trunk, AI canopy — and the harness that keeps all three honest.',
  },
]

/** Cumulative weight boundaries, used to map --flight onto a scene index. */
export const TOTAL_WEIGHT = flightScenes.reduce((sum, s) => sum + s.weight, 0)

export const SCENE_BOUNDS = flightScenes.reduce<number[]>((acc, s) => {
  acc.push((acc.length ? acc[acc.length - 1] : 0) + s.weight / TOTAL_WEIGHT)
  return acc
}, [])
