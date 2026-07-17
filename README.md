# Jagadeesh Thiruveedula — Immersive Portfolio

An explorable data landscape, not a static resume. The site tells one story — **Legacy Systems → Cloud Modernization → Enterprise AI** — through interactive 3D scenes, scroll-driven data-flow animations, and metric visualizations drawn from real project outcomes (500+ TiB migrated, $2M+ saved, production GenAI systems).

**Live:** [https://jthiruveedula.github.io](https://jthiruveedula.github.io)
**Hosting:** GitHub Pages (user site), deployed from `master` via GitHub Actions

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

| Layer     | Tool                                     |
| --------- | ---------------------------------------- |
| Build     | Vite 7 (static output to `out/`)         |
| UI        | React 19 + TypeScript (strict)           |
| 3D        | Three.js + @react-three/fiber + drei     |
| Animation | GSAP 3 (ScrollTrigger) via `@gsap/react` |
| Styling   | Tailwind CSS v4 (`@theme` design tokens) |
| E2E       | Playwright (chromium + mobile projects)  |

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

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds and publishes `out/` to GitHub Pages. Every deploy is tagged `v0.0.0-<sha>` for one-click rollback via `workflow_dispatch` → `rollback_ref`.

## Architecture

```
src/
  components/          # One self-contained section per file (no props; each imports its own data)
    Navigation.tsx       Hero.tsx          Timeline.tsx
    SkillsConstellation.tsx  Projects.tsx  ProjectCard.tsx
    Metrics.tsx          Contact.tsx
  scenes/              # R3F scene graphs (hero mindscape, skills constellation)
  data/
    types.ts           # Contractual shapes (Era, Skill, Experience, FeaturedProject…)
    portfolio.ts       # THE single content source — every section renders from this
  lib/hooks.ts         # useReducedMotion / useWebGLSupport / useIsMobile / useInView
  styles/globals.css   # Tailwind v4 @theme tokens (era colors, fonts, surfaces)
```

Sections below the hero are `React.lazy` code-split; Three.js, R3F, and GSAP ship as separate chunks (`manualChunks` in `vite.config.ts`).

## Design language

- **Era color code** carried through every visual: amber `#f59e0b` = legacy, cyan `#22d3ee` = cloud, violet `#a78bfa` = AI.
- Dark OLED base (`#050810`), Space Grotesk headings, Inter body, JetBrains Mono for data/HUD labels.
- Every animation is field-related — migration particle streams, pipeline pulses, schema grids, count-up metrics — no decorative motion.

## Performance & accessibility

- Max two WebGL canvases (Hero, Skills); everything else is SVG/CSS/GSAP. Instanced geometry only, DPR clamped to 2, frameloops pause when offscreen.
- `prefers-reduced-motion` → static frames and instant metric values. No WebGL → 2D fallbacks. Mobile → reduced particle counts.
- All content exists as semantic HTML (canvases are `aria-hidden` enhancements): keyboard navigation, `aria-expanded` disclosures, skip link, 4.5:1 contrast on body text.
- First paint is not gated by the loading intro: the hero renders underneath the overlay and its word-reveal plays once the intro hands off (no flash, no word-jump). Brand webfonts load non-render-blocking via a `preload`→`stylesheet` swap, with a `<noscript>` fallback.

## SEO & social

- `public/robots.txt` and `public/sitemap.xml` are published to the site root for crawler discovery.
- `public/og-image.svg` (1200×630) backs the OpenGraph + Twitter `summary_large_image` cards declared in `index.html` (`og:image`, `og:image:width/height`, `og:locale`, `twitter:image`, `link[rel="me"]`).

## Customization (swap in your own data)

1. Edit `src/data/portfolio.ts` — profile, skills (`domain`/`tier`/`years`), experience (`era`), featured projects (`vizType`), headline metrics (`numeric` + `prefix`/`suffix` drive count-up animations).
2. Types in `src/data/types.ts` enforce the shape; sections re-render from data with no component changes.
3. Colors/fonts: `@theme` block in `src/styles/globals.css`.

## Testing

```bash
npm run typecheck
npm run lint
npm run test:e2e:chrome   # production build served via `npm run preview` automatically
```
