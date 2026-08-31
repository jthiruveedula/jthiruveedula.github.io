# Jagadeesh Thiruveedula — Portfolio

A proof-led single page, not a static resume. It tells one story — **Legacy Systems →
Cloud Modernization → Enterprise AI** — leading with the numbers that back it
(500+ TiB migrated, $2M+ saved, 50M+ documents in production RAG) and then showing the
work behind each one.

**Live:** [https://jthiruveedula.github.io](https://jthiruveedula.github.io)
**Hosting:** GitHub Pages (user site), deployed on a published GitHub Release via GitHub Actions

---

## Portfolio content

**Jagadeesh Thiruveedula** — Data & AI Architect, 11+ years, Fortune 500 enterprises. Legacy systems → cloud modernization → production GenAI. $2M+ cost savings delivered, 500+ TiB migrated, 1B+ daily events at 99.9% uptime, private LLM apps serving 50M+ documents at 95% grounded accuracy.

### Featured projects

| Project | Client | Era | Impact |
| --- | --- | --- | --- |
| GenAI COBOL → Cloud Code Translation | Definity | Legacy | 12 legacy workstreams triaged, 5 reusable transformation patterns codified |
| Multi-Petabyte Hadoop/Teradata → GCP Migration | Charles Schwab | Cloud | $1M+ annual savings, 1B+ daily records with zero data loss, 25% efficiency gain, release cycles cut 50% |
| HIPAA Real-Time Streaming & GenAI Accelerators | HCA Healthcare | Cloud | 50+ sources streaming in real time, 100% data accuracy, delivery timelines cut 50% |
| AWS → GCP Cross-Cloud Migration | NRG Energy | Cloud | <30 min cutover downtime, reporting latency down 40%, 99.95% uptime SLA |
| 500+ TiB Snowflake → BigQuery Modernization | John Wiley & Sons | AI | 500+ TiB migrated, zero data loss across 200+ ETL workflows, manual refactoring cut 40% via GenAI |
| Private LLM Research Assistant & Agent Platform | John Wiley & Sons | AI | RAG over 50M+ documents at 95% grounded accuracy, 60% tier-1 ticket deflection, 3x analyst productivity |

### Experience

Forward-deployed Data & GenAI Architect roles progressing through Data & GenAI Architect → Cloud Data Architect → Lead Data Engineer → Senior Data Engineer → Data Engineer, spanning legacy mainframe/Hadoop/Teradata modernization, multi-cloud (GCP/AWS/Azure) migrations, and production RAG/agent systems.

### Skills

GCP (BigQuery, Dataflow, Cloud Composer, Dataproc, Vertex AI), AWS, Azure (ADF, Synapse, Fabric), Databricks/Delta Lake/Unity Catalog, legacy migrations (Snowflake, Teradata, Hadoop, Mainframe/COBOL, Couchbase), GenAI (GPT-4o, Claude Sonnet 4, Gemini 1.5 Pro, Llama 3, LoRA/QLoRA fine-tuning, guardrails, Responsible AI governance), RAG (Pinecone, Weaviate, pgvector, FAISS, Chroma, hybrid retrieval + reranking), agent frameworks (LangChain, LangGraph, CrewAI, DSPy, MCP, multi-agent orchestration, A2A), and LLMOps evaluation (RAGAS, LangSmith, Langfuse).

To see the full detail (bio, all metrics, tech stacks per project), open `src/data/portfolio.ts` — it's the single source every section renders from.

---

## Stack

| Layer     | Tool                                          |
| --------- | --------------------------------------------- |
| Build     | Vite 7 (static output to `out/`)              |
| UI        | React 19 + TypeScript (strict)                |
| Animation | GSAP 3 (ScrollTrigger) via `@gsap/react`      |
| Scroll    | Lenis (smooth scroll, reduced-motion aware)   |
| Styling   | Tailwind CSS v4 (`@theme` design tokens)      |
| E2E       | Playwright (chromium + mobile projects)       |

No WebGL. Earlier versions shipped a Three.js scroll-world; v6 is DOM, SVG and CSS only.

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build & Deploy

```bash
npm run build      # static site → out/
npm run preview    # serve the production build on :4173
```

Publishing a GitHub Release triggers `.github/workflows/deploy.yml`, which builds and
publishes `out/` to GitHub Pages only after the build job passes. Point-in-time recovery
lives in a separate `.github/workflows/rollback.yml` (`workflow_dispatch` → `rollback_ref`),
so a rollback never needs a new release.

## Architecture

```
src/
  components/          # One self-contained section per file (no props; each imports its own data)
    Rail.tsx             Sequence.tsx      Apparatus.tsx     MeterStrip.tsx
    Timeline.tsx         Projects.tsx      ProjectCard.tsx
    Metrics.tsx          Contact.tsx
  data/
    types.ts           # Contractual shapes (Era, Skill, Experience, FeaturedProject…)
    portfolio.ts       # THE single content source — every section renders from this
    scenes.ts          # The six career chapters rendered by the arc
  lib/hooks.ts         # useReducedMotion / useInView
  styles/globals.css   # Tailwind v4 @theme tokens + the theme's own components
tokens.css             # Framework-free mirror of the token set, for reuse elsewhere
public/scenes/         # Station stills from v3–v5. Retained, no longer referenced.
```

Sections below the hero are `React.lazy` code-split; GSAP ships as its own chunk
(`manualChunks` in `vite.config.ts`).

## The page shape

**Stat-Led.** The hero leads with the single largest defensible figure (500+ TiB) and a
headline that completes its sentence, backed by three supporting figures, a meter strip,
and one hand-built SVG apparatus — a topology graph of six sources ringing a governed
plane, with leader-line callouts carrying real values from `portfolio.ts`.

Below it, six career chapters render as a hairline spec sheet: mono ordinal and era on
the left, chapter and figures on the right.

**What v6 removed.** v5 spent 13,284px — roughly sixteen viewports — driving those six
chapters through a pinned, scroll-scrubbed timeline. Everything past the first station was
invisible until you had scrolled most of a novel, and a deep link or a restored scroll
position could land on an empty screen because the pinned timeline had never been driven.
The chapters are now static DOM: same copy, same figures, ~2k px instead of ~13k, correct
at any scroll position and with JavaScript doing nothing. Total page height went from
17,670px to ~7,200px.

The seven AI-generated station stills are no longer referenced either. They rendered at
4–8% opacity behind the copy, which read as noise rather than imagery while costing
fourteen JPEGs of payload. The files stay in `public/scenes/`; the generation prompts stay
in [SCENE_PLAN.md](./SCENE_PLAN.md) and [ASSET_MANIFEST.md](./ASSET_MANIFEST.md).

## Design language

Built with the Hallmark design skill. Genre **atmospheric**, theme **Lumen / Night
Foundry**, macrostructure **Stat-Led** — the stamp at the top of `src/styles/globals.css`
is the durable record, and `.hallmark/log.json` is what the next run reads.

- **One accent.** Molten brass `oklch(76% 0.17 50)` against a cool-violet near-black
  ground `oklch(15% 0.014 265)`. A coral chord `oklch(68% 0.16 18)` is reserved for exactly
  one word per headline — always the verb — carried by colour plus a 1px underline, never
  italics. The era code is grey resolving into brass; v5's amber/cyan/violet is gone.
- **Three faces.** Instrument Serif for display, Geist for body, JetBrains Mono for labels.
- **Two registers.** Display type and the lede render lowercase; mono labels render
  UPPERCASE. Proper nouns that carry credibility — employers, certifications, product
  names, units — opt out via `.proper`. Lumen's stock rule lowercases those too, which
  turned "500+ TiB" into "500+ tib" and "1B+" into "1b+": a different claim, not a
  different style.
- **Colour is OKLCH throughout**, declared once in the `@theme` block and mirrored in
  `tokens.css`. No hex outside the favicon, the social card and the `<meta>` tags.
- Motion is fade-and-lift only. The apparatus pulses; nothing rotates, nothing parallaxes,
  and no cursor is tracked.

## Performance & accessibility

- No canvas mounts anywhere — the hero apparatus is inline SVG, the meter strip is 72
  spans, and every diagram is CSS or SVG. GSAP drives section reveals only.
- `prefers-reduced-motion` freezes the apparatus packets and collapses every reveal to its
  final state. The six chapters and all their figures are static text in every path, so
  nothing depends on an animation having run.
- All content is semantic HTML: keyboard navigation, `aria-expanded` disclosures, a skip
  link, and a side-rail nav that marks the active section.
- **Contrast: zero WCAG AA failures** across the rendered page (audited by resolving every
  computed `oklch()` through a canvas and checking each text node against its painted
  background at its real size).
- **Touch targets: every control clears 44×44px** wherever the rail is in its touch
  layout (≤1023px). Controls that cannot grow without breaking their layout — the 8px
  composition-bar segments, the 16px rail monogram — carry an invisible expanded hit area.
- Brand webfonts load non-render-blocking via a `preload`→`stylesheet` swap, with a
  `<noscript>` fallback.

## SEO & social

- `public/robots.txt` and `public/sitemap.xml` are published to the site root for crawler discovery.
- `public/og-image.png` (1200×630) backs the OpenGraph + Twitter `summary_large_image`
  cards declared in `index.html`. It is a raster on purpose — LinkedIn, X, Slack, WhatsApp
  and Facebook all render a blank card for an SVG. `public/og-image.svg` is the editable
  source of record and `public/og-image.source.html` is the live-webfont render the PNG is
  captured from.

## Customization (swap in your own data)

1. Edit `src/data/portfolio.ts` — profile, skills (`domain`/`tier`/`years`), experience (`era`), featured projects (`vizType`), headline metrics (`numeric` + `prefix`/`suffix` drive count-up animations).
2. Types in `src/data/types.ts` enforce the shape; sections re-render from data with no component changes.
3. Colors/fonts: `@theme` block in `src/styles/globals.css`.

## Testing

```bash
npm run typecheck
npm run lint
npm run test:e2e:chrome   # production build served via `npm run preview` automatically
npm run test:e2e:all      # chromium + mobile
```

Playwright runs with `workers: 2`. The suite has no WebGL to contend with any more, so the
old software-GL caveat is gone — 40 tests across chromium and mobile finish in ~10s each.
