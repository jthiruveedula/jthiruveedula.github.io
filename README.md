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
    Navigation.tsx       ScrollWorld.tsx   Timeline.tsx
    SkillsConstellation.tsx  Projects.tsx  ProjectCard.tsx
    Metrics.tsx          Contact.tsx
  scenes/              # R3F scene graphs (scroll-world flight, skills constellation)
    WorldScene.tsx       ConstellationScene.tsx
  data/
    types.ts           # Contractual shapes (Era, Skill, Experience, FeaturedProject…)
    portfolio.ts       # THE single content source — every section renders from this
    scenes.ts          # The 7 scroll-world stations (copy + metrics + still paths)
  lib/hooks.ts         # useReducedMotion / useWebGLSupport / useIsMobile / useInView
  styles/globals.css   # Tailwind v4 @theme tokens (era colors, fonts, surfaces)
public/scenes/         # The 7 AI-generated station stills, 2048w + 1280w (`@sm`)
```

Sections below the flight are `React.lazy` code-split; Three.js, R3F, and GSAP ship as separate chunks (`manualChunks` in `vite.config.ts`).

## The scroll-world hero

The top of the page is one continuous camera flight through seven stations of the résumé —
legacy substrate → cloud migration → governed realtime → LLM translation → production RAG
→ the whole system + CTA. Backdrops are AI-generated stills (Higgsfield); the camera is
real Three.js.

**Scroll drives a camera, not a timeline.** Station depth, scale, opacity, the dust field
and every DOM overlay are pure functions of one scroll-progress value, so scrolling up
retraces the flight exactly, there is nothing to snap at a station boundary, and no video
is decoded on a phone. There is no GSAP pin either — the scene is `position: sticky` in a
tall section, which keeps Lenis out of a fight with a pin-spacer and stops mobile URL-bar
resizes from jumping the page (`100svh`, not `dvh`).

- **Framing** covers on landscape, and *contains* on portrait: cropping a 16:9 still to a
  tall phone would throw away three quarters of its width, so phones get the whole frame
  anchored to the top band with the copy on clean void beneath it.
- **Lazy stations** — only the stations within a scroll-window of the camera are mounted,
  and leaving one disposes its GPU texture. A visitor downloads what they fly through.
- **Degradation** — no WebGL or `prefers-reduced-motion` renders the same seven stations
  as ordinary stacked sections with the stills as backdrops. The copy is real DOM in both
  paths, so it stays crawlable and screen-reader navigable either way.

Scene plan and generation prompts: [SCENE_PLAN.md](./SCENE_PLAN.md). Asset mapping,
re-rolls and credit spend: [ASSET_MANIFEST.md](./ASSET_MANIFEST.md).

## Design language

- **Era color code** carried through every visual: amber `#f59e0b` = legacy, cyan `#22d3ee` = cloud, violet `#a78bfa` = AI.
- Dark OLED base (`#050810`), Space Grotesk headings, Inter body, JetBrains Mono for data/HUD labels.
- Every animation is field-related — migration particle streams, pipeline pulses, schema grids, count-up metrics — no decorative motion.

## Performance & accessibility

- Max two WebGL canvases (scroll-world, Skills); everything else is SVG/CSS/GSAP. Instanced geometry only, DPR clamped (1.75 desktop / 1.25 mobile — the flight is fill-rate bound), frameloops pause when offscreen.
- The flight holds 60fps through a 2× CPU throttle on a mobile viewport and locks to a clean 30fps at 4×+ (p95 ≈ median, so it slows rather than stutters). Overlay writes are skipped for stations parked at zero, and the dust volume streams by translating two tiles instead of re-uploading a vertex buffer each frame.
- `prefers-reduced-motion` → static stations and instant metric values. No WebGL → 2D fallbacks. Mobile → reduced particle counts and 1280w stills.
- All content exists as semantic HTML (canvases are `aria-hidden` enhancements): keyboard navigation, `aria-expanded` disclosures, skip link, 4.5:1 contrast on body text.
- First paint is not gated by the loading intro: the opening station renders underneath the overlay and its copy staggers in once the intro hands off (no flash, no jump). Brand webfonts load non-render-blocking via a `preload`→`stylesheet` swap, with a `<noscript>` fallback.

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
npm run test:e2e:all      # chromium + mobile
```

Playwright runs with `workers: 2`. Headless Chromium falls back to software GL, and
several concurrent WebGL contexts uploading full-screen station textures starve each
other enough to time tests out — that is a harness limit, not the page's (a real
GPU-backed browser holds 60fps).
