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
    Rail.tsx             Sequence.tsx      MeterStrip.tsx
    Timeline.tsx         Projects.tsx      ProjectCard.tsx
    Skills.tsx           Metrics.tsx       Contact.tsx
  data/
    types.ts           # Contractual shapes (Era, Skill, Experience, FeaturedProject…)
    portfolio.ts       # THE single content source — every section renders from this
    scenes.ts          # The six career chapters rendered by the arc
  lib/hooks.ts         # useReducedMotion / useInView
  styles/globals.css   # Tailwind v4 @theme tokens + the theme's own components
tokens.css             # Framework-free mirror of the token set, for reuse elsewhere
scene-sources/         # The 7 original stills. Build inputs, not served.
public/scenes/         # Graded AVIF plates, generated on prebuild (gitignored).
```

Sections below the hero are `React.lazy` code-split; GSAP ships as its own chunk
(`manualChunks` in `vite.config.ts`).

## The page shape

**A corridor, then a document.**

The top of the page is one unbroken camera move. Seven plates are composited not as
siblings on a page but as depths in a single space: a room grows until it passes the
lens, and the next one is already behind it. Nothing fades in, nothing slides — across
the whole flight exactly one number changes, the camera's position.

Three things enforce it: fixed letterbox bars that belong to the viewport rather than
to any scene; a 1px brass horizon rule at 46%, held unchanged through all seven shots
(every plate in the set puts its vanishing point between 46% and 55%, so the eye locks
to it — a match cut for the cost of one div); and an equal-power crossfade, `sin²+cos²=1`,
which for additive-over-black compositing is exactly the fix for the luminance dip you
get from a naive linear dissolve.

Below the flight, the same argument again as a static spec sheet. That redundancy is
deliberate — it is what makes the film safe to ship, and it is why the first viewport
carries a **skip the film** chip. Cinema that gates the evidence is an imposition;
cinema with the evidence one click below it is an offer.

**The one rule: the image scrubs, the type cuts.** The plate dissolves as a smooth
function of scroll, but the headline swaps hard at the crossfade midpoint, then plays a
per-line mask stagger. So at every scroll position exactly one headline is at full
opacity, and legibility is never a function of scrub position. That is the specific
defect underneath v5 — it scrubbed `textContent` on its count-ups, so a half-scrolled
frame showed half-finished numbers, and a cold load advertised
`0 years · $0 saved · 0 TiB · 0.0% uptime`.

### What v5 got wrong, and what it didn't

v5 was also cinematic, and it was retired for defects that **cinema did not cause**:

| | v5 | v7 |
| --- | --- | --- |
| Camera travel | 13,284px over 6 full-viewport pins | 2,880px, zero pins |
| Sequential beats | 24 | 7 |
| Dead scroll (nothing new revealed) | ~5,600px, 42% | ~0 |
| Deep link / restored scroll | could land on a blank screen | resting state is a painted frame |
| Stills | 4–8% opacity behind copy, 2.8MB of JPEG | full bleed, 1.0MB of AVIF |

The scroll-jail came from choosing 24 *sequential* beats and six pins — beats running
in parallel inside a scene cost the same distance as one. The blank screen came from a
hand-rolled scroll driver that bypassed the ScrollTrigger already installed and wired to
Lenis, leaving off-screen stations in an undefined state. Neither is a property of
scrubbed cinema. v6 removed the cinema to fix them, which was an over-correction.

`tests/e2e/deep-link.spec.ts` now asserts the blank-screen property directly from every
entry point the site exposes, plus a mid-page reload, so the structure cannot silently
decay back into it.

### The grade

The seven stills were generated in the old era palette (amber legacy / cyan cloud /
violet AI), which fights the brass accent. `scripts/grade-scenes.mjs` (a `prebuild` step)
regrades them from `scene-sources/` instead of re-rendering: greyscale, a mild linear lift, then a 256-entry
per-channel LUT interpolated from a 4-stop luminance ramp, out to AVIF at two widths.

The shadow stop is exactly `--color-paper`, so a full-bleed plate and the page
background share one black point and there is no seam where the film meets the document.
Scene 03 is split-toned along x — its whole argument is old-left / new-right, which a
single ramp would erase. Scene 06 runs the coral ramp: six scenes are one hue, and on the
seventh idea a second colour arrives. It also kills the stock-purple-AI-orb tell, which
was the weakest thing in the set.

`hue-rotate()` was tested and rejected: it is a linear sRGB matrix, so at the rotation
that takes cyan to brass it turns 01's amber machines blue and 06 green.

## Design language

Genre **atmospheric**, theme **Lumen / Night Foundry**, macrostructure **Corridor**. The
stamp at the top of `src/styles/globals.css` is the durable record and
`.hallmark/log.json` is what the next run reads.

- **One accent.** Molten brass `oklch(76% 0.17 50)` on a cool-violet near-black ground
  `oklch(15% 0.014 265)`. A coral chord `oklch(68% 0.16 18)` is reserved for exactly one
  word per headline — always the verb — carried by colour plus a 1px underline, never
  italics.
- **Three faces.** Instrument Serif display, Geist body, JetBrains Mono labels.
- **Two registers, scoped.** Display type and the lede render lowercase; mono labels
  render UPPERCASE. Two deliberate exceptions: proper nouns that carry credibility
  (employers, units, product names) opt out via `.proper`, and the **flight headlines are
  sentence case** — the copy is first person, and the lowercase register turns "I
  automated the job I used to do by hand" into "i automated…", which is a grammar error
  wearing a design rule.
- **Colour is OKLCH throughout**, declared once in the `@theme` block and mirrored in
  `tokens.css`.
- Motion has three verbs and no more: the camera (`ease: 'none'` — scroll is the clock,
  and easing a scrubbed camera makes the visitor feel their input being interpreted), the
  type cut (`power4.out`), and grain. Nothing rotates, nothing parallaxes on a cursor.

## Performance & accessibility

- No canvas and no WebGL. The flight is seven `<img>` plates, transforms and opacity
  only — everything animated is compositor-side, and `will-change` is leased on the
  flight's `onToggle` rather than held permanently (a standing lease on seven full-bleed
  plates is real VRAM on a high-DPR phone).
- `prefers-reduced-motion` collapses the **geometry**, not just the animation: the runway
  becomes one screen instead of 420svh, the stage un-sticks, and the arc below carries the
  argument. v5 shipped reduced-motion users the full 13,284px of runway with none of the
  payoff, which is the worst of both.
- All content is semantic HTML: keyboard navigation, `aria-expanded` disclosures, a skip
  link, and a side-rail nav that marks the active section.
- **Contrast: zero WCAG AA failures** across the rendered page, and the flight is verified
  the harder way — by screenshotting each scene with the copy hidden and measuring the
  *brightest actual pixel* behind the headline. Worst case across the whole flight is
  **6.05:1** against a 4.5:1 floor. That check matters because these plates carry
  near-white speculars exactly where the headline sits.
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
