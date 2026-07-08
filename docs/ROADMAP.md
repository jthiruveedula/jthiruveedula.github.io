# Portfolio Roadmap — Futuristic / Pro Upgrade Plan

> Living document. Written 2026-07-08 after a full repo audit (CodeGraph + manual review).
> Purpose: (1) capture how the site works today so future changes are safe, (2) define a
> phased plan to push the site from "impressive" to "flagship-grade futuristic portfolio".

---

## 1. Repo Snapshot (how it works today)

**Live:** https://jthiruveedula.github.io — GitHub Pages user site, deployed from `master`
via `.github/workflows/deploy.yml` (builds `out/`, tags every deploy `v0.0.0-<sha>` for
one-click rollback). CI (`ci.yml`) runs lint → typecheck → build → Playwright on every push.

**Stack:** Vite 7 · React 19 + TS strict · Three.js + @react-three/fiber + drei · GSAP 3
(ScrollTrigger via `@gsap/react`) · Tailwind CSS v4 (`@theme` tokens) · Playwright e2e.

**Architecture (single-page, section-per-file, no props):**

| Area | File | Notes |
|---|---|---|
| Entry / code-split | [src/App.tsx](../src/App.tsx) | Hero + Nav eager; Timeline/Skills/Projects/Metrics/Contact are `React.lazy` behind `Suspense` |
| Content source | [src/data/portfolio.ts](../src/data/portfolio.ts) | **THE single source of truth** — every section renders from this. Do not hand-edit metrics; regenerate via resume-data-extraction workflow |
| Contracts | [src/data/types.ts](../src/data/types.ts) | `Era` ('legacy'\|'cloud'\|'ai'), `Skill` (tiered 1–3), `Experience`, `FeaturedProject` (`vizType`), `ERA_COLORS` |
| Hero 3D | [src/scenes/HeroScene.tsx](../src/scenes/HeroScene.tsx) | "Mindscape": 2400 instanced-box particles desktop / 720 mobile in 4 clusters (legacy lattice → cloud swarm → AI shell + migration flow). CPU-side per-frame loop over `setMatrixAt`. Frameloop `demand` when offscreen/reduced-motion |
| Skills 3D | [src/scenes/ConstellationScene.tsx](../src/scenes/ConstellationScene.tsx) | Interactive domain graph; selection wired to DOM chips + field-story dialog ([src/lib/skillStory.ts](../src/lib/skillStory.ts)) |
| Hooks | [src/lib/hooks.ts](../src/lib/hooks.ts) | `useReducedMotion` / `useWebGLSupport` (2D fallback) / `useIsMobile` / `useInView` (pauses frameloops offscreen) |
| Design tokens | [src/styles/globals.css](../src/styles/globals.css) | OLED void `#050810`, era accents (amber/cyan/violet), `.hud-label`, `.glass-panel`, skip-link, global reduced-motion kill switch |
| Chunks | [vite.config.ts](../vite.config.ts) | manualChunks: `three`, `r3f`, `gsap` |
| Tests | [tests/e2e/smoke.spec.ts](../tests/e2e/smoke.spec.ts) | Title, hero, sections render, nav anchors, zero console errors — chromium + mobile projects |

**Design language (established — extend, don't replace):**
- Era color code everywhere: amber `#f59e0b` = legacy · cyan `#22d3ee` = cloud · violet `#a78bfa` = AI.
- Space Grotesk headings · Inter body · JetBrains Mono HUD/data labels.
- Rule: **every animation is field-related** (migration streams, pipeline pulses, count-ups) — no decorative motion.
- A11y baseline: skip link, focus-visible rings, reduced-motion gates on all GSAP/R3F, 3D marked `aria-hidden` with the DOM as the real record, WebGL fallback.

**Strengths:** disciplined perf model (frameloop gating, mobile particle cuts, code-split, manual chunks), real a11y, coherent story, CI/CD with rollback.

**Gaps (what keeps it from "flagship"):** no post-processing (particles read flat, no bloom), boxy instanced particles instead of shader points, no page-load choreography beyond hero intro, plain section boundaries, no custom cursor/micro-interactions, no command palette or case-study depth, no visual-regression or perf budget in CI, no OG image / sitemap, `docs/` empty.

---

## 2. Design Direction

Verdict from the design-system pass (HUD / Sci-Fi FUI pattern, "Immersive/Interactive Experience"):
the current identity is already correct — dark void base, mono HUD labels, era neons. The upgrade
path is **more FUI texture and choreography, not a new palette**.

**Keep:** era colors, fonts, `.glass-panel` / `.hud-label`, "no decorative motion" rule.

**Add (FUI effect vocabulary):** glow/bloom, scanlines + film grain (subtle), fine 1px line
drawing (borders that draw themselves in), corner brackets on panels, ticker/status text,
blinking data markers, text decrypt/scramble reveals, magnetic hover, holographic sheen on cards.

**Anti-patterns to enforce (from the FUI style's known weaknesses):**
- Thin-line UI hurts a11y → decorative lines stay `aria-hidden`, contrast on real text ≥ 4.5:1.
- Immersive pattern needs escape hatches → keep skip-link, add "skip intro", mobile fallback always.
- No emoji icons — SVG only (Lucide/Heroicons, one stroke width).
- Micro-interactions 150–300 ms, exits ~65 % of enter, `transform`/`opacity` only.

---

## 3. Phased Plan

Each phase ships independently (branch → PR → CI → deploy). Order chosen so visual payoff
arrives early while risk (shaders, routing) lands late. Estimates are focused-session counts.

### Phase 0 — Foundation & guardrails (½–1 session) ✅ prerequisite for everything

| # | Item | Detail | Files |
|---|---|---|---|
| 0.1 | Perf budget in CI | Lighthouse CI (or `unlighthouse`) against the built `out/` — fail under: Perf ≥ 90, A11y ≥ 95, CLS < 0.1. Add bundle-size check (three chunk ≤ 700 kB gz total JS) | `.github/workflows/ci.yml` |
| 0.2 | Visual regression | Playwright `toHaveScreenshot` per section, reduced-motion forced so shots are deterministic | `tests/e2e/visual.spec.ts` |
| 0.3 | Motion tokens | Centralize durations/easings (`--dur-fast: .2s`, `--dur-reveal: .7s`, eases) so all phases share one rhythm | `src/styles/globals.css`, `src/lib/motion.ts` (new) |
| 0.4 | SEO pack | OG image (1200×630 generated frame of the mindscape), `twitter:card summary_large_image`, `sitemap.xml`, `robots.txt` | `public/`, `index.html` |

### Phase 1 — FUI texture & micro-interactions (1–2 sessions) · biggest perceived-quality jump per effort

| # | Item | Detail |
|---|---|---|
| 1.1 | Atmosphere overlay | Fixed, `pointer-events-none`, `aria-hidden` layer: faint scanlines + animated grain (CSS `repeating-linear-gradient` + SVG noise, opacity ≤ 0.04) + slow radial "aurora" glows in era colors behind sections. Pure CSS — zero JS cost. Gate hard on reduced-motion |
| 1.2 | Panel FUI chrome | Upgrade `.glass-panel`: corner brackets (`::before/::after` L-shapes), 1px edge that "draws in" on first reveal (ScrollTrigger + `background-size` or SVG `stroke-dashoffset`), inner top-edge highlight |
| 1.3 | Text decrypt reveals | H2s + `.hud-label`s scramble→resolve on scroll entry (GSAP `TextPlugin`/ScrambleText-style, char whitelist `A-Z0-9·/`). Once per element, ≤ 600 ms, skipped under reduced-motion (render final text immediately) |
| 1.4 | Magnetic + glow CTAs | Nav links & primary CTAs: pointer-proximity translate (≤ 6 px, damped), press scale 0.97, era-colored glow ring on hover. `transform` only |
| 1.5 | Custom cursor (desktop, fine-pointer only) | Small dot + trailing ring; ring tints to the era color of the hovered section; expands over interactive targets. `@media (pointer: fine)`, native cursor kept (`cursor: none` never on form/controls) |
| 1.6 | HUD status ticker | Thin fixed bottom (or nav-integrated) strip: mono ticker cycling live-feeling stats from `portfolio.ts` ("500+ TiB migrated · 1B+ events/day · 99.9 % uptime …") with blinking cursor char. `aria-hidden`, duplicated in DOM for SRs via existing metrics |
| 1.7 | Boot sequence loader | First-visit-only (sessionStorage) ≤ 1.2 s mini terminal boot ("mounting mindscape… ok") that crossfades into the hero burst — with an instant "skip" affordance, auto-skip on reduced-motion |

### Phase 2 — Scroll choreography (1–2 sessions)

| # | Item | Detail |
|---|---|---|
| 2.1 | Section transition seams | Era color "current" line that draws down the page spine as you scroll (scrub), handing off amber→cyan→violet between Timeline eras. Doubles as scroll progress |
| 2.2 | Hero → Timeline handoff | On hero exit, migration-flow particles visually "pour" toward the timeline (emphasisRef already scrubs 0→1 — extend with an exit tween + pinned overlap so sections feel continuous, not stacked) |
| 2.3 | Metrics count-up upgrade | Tabular-figure mono count-ups (types already carry `numeric/prefix/suffix`), odometer-style digits, tick marks and thin gauge arcs per metric. Instant final values under reduced-motion |
| 2.4 | Parallax depth layers | 2–3 subtle `data-speed` layers per section (bg glows slower than content). ≤ 40 px total travel, transform-only, respects reduced-motion |
| 2.5 | Timeline pinned scrub | Pin Timeline; scrub through eras with the 3D emphasis + era seam synced. Escape hatch: normal flow on mobile/short viewports |

### Phase 3 — 3D upgrades (2–3 sessions) · highest wow, highest risk — keep perf gates

| # | Item | Detail |
|---|---|---|
| 3.1 | Post-processing bloom | `@react-three/postprocessing` (selective/threshold bloom + subtle chromatic aberration + vignette) on both canvases. **Gates:** desktop + `!reducedMotion` + frame-time headroom only; drei `PerformanceMonitor` to drop DPR then effects under load |
| 3.2 | Shader particles | Replace instanced boxes in `HeroScene` with a custom `ShaderMaterial` points system: soft round sprites, size attenuation, per-particle twinkle in-shader. Moves the 2400-iteration CPU loop to the GPU (positions via attributes + time uniform; keep CPU path as reduced-motion/fallback). Unlocks 5–10× particle counts on desktop |
| 3.3 | Data-flow trails | Migration flow gets curved additive trails (drei `Line2` / ribbon quads along the arc) with era color ramp — the signature "data pipeline" visual |
| 3.4 | Camera rig | Gentle scroll-linked camera dolly/FOV shift in hero (±0.5 unit, damped) for depth without disorientation. Off under reduced-motion |
| 3.5 | Constellation polish | Hover: connected-edge highlight pulse; select: camera easing to node (drei `CameraControls`), bloom-boosted hub. Keep DOM chips as the canonical interaction |
| 3.6 | WebGPU note (future) | Three r180+ WebGPURenderer is viable but R3F support still maturing — revisit ~2027; not now |

### Phase 4 — Content & "pro" features (2–3 sessions)

| # | Item | Detail |
|---|---|---|
| 4.1 | Command palette (⌘K / ctrl+K) | FUI-styled palette: jump to sections, copy email, open LinkedIn/GitHub, download resume, toggle effects. Small custom impl or `cmdk`. Full keyboard + ARIA combobox pattern |
| 4.2 | Project case-study depth | `FeaturedProject` already has before/after + metrics + `vizType` — add expandable case-study view per project (accessible dialog or `#/project/:id` hash route): architecture diagram (SVG, era-colored), problem→approach→impact narrative. No router dep needed; hash-based keeps GH Pages simple |
| 4.3 | Resume artifacts | `public/resume.html` exists — add first-class "Download resume (PDF)" CTA in Nav + Contact; generate PDF in CI so it never drifts from `portfolio.ts` |
| 4.4 | "Ask my portfolio" (flagship differentiator) | On-brand for a GenAI architect: chat affordance answering from portfolio data. v1 = client-side keyword/intent matching over `portfolio.ts` + `skillStory.ts` (zero backend, honest "demo" framing); v2 (optional) = real RAG behind a tiny Cloud Run endpoint — dogfoods his own stack, but adds ops cost. Ship v1 first |
| 4.5 | Analytics + uptime | Privacy-friendly analytics (Plausible/GoatCounter script) + section-view events; add a status-style footer line ("build v0.0.0-<sha>") wired from CI env |
| 4.6 | Print/ATS path | `@media print` stylesheet rendering the DOM record as a clean 1-page resume — recruiters print/PDF directly |

### Phase 5 — Hardening & release polish (1 session)

| # | Item | Detail |
|---|---|---|
| 5.1 | Perf pass | Verify budgets from 0.1 across mid-tier Android (CPU 4× throttle): 60 fps hero, INP < 200 ms, no long tasks > 100 ms during scroll |
| 5.2 | A11y audit | Keyboard-only + VoiceOver full pass; axe scan in Playwright; verify every Phase 1–4 effect is inert under reduced-motion and invisible to AT where decorative |
| 5.3 | Cross-browser | Safari (backdrop-filter, OffscreenCanvas quirks), Firefox (scrollbar-color already set), iOS Safari (dvh, no hover) |
| 5.4 | E2E expansion | Specs for palette, case-study dialogs, ticker presence, boot-skip; visual baselines refreshed |

---

## 4. Standing Budgets & Rules (apply to every change)

- **Perf:** Lighthouse Perf ≥ 90 / A11y ≥ 95 · CLS < 0.1 · hero steady-state 60 fps desktop, ≥ 40 fps mid-mobile · total JS (gz) ≤ 700 kB.
- **Motion:** micro 150–300 ms · reveals ≤ 700 ms · exits ≈ 65 % of enters · `transform`/`opacity` only · stagger 30–50 ms · everything interruptible · **every effect has a reduced-motion branch** (final state rendered instantly).
- **A11y:** decorative layers `aria-hidden` + `pointer-events-none` · DOM is always the canonical record (3D is enhancement) · text contrast ≥ 4.5:1 on void/panel surfaces · touch targets ≥ 44 px · focus-visible never removed.
- **Content:** all copy/metrics flow from `portfolio.ts` — components never hard-code data.
- **Identity:** era colors + type stack are frozen; new visuals must map to the legacy→cloud→AI story ("no decorative motion" rule).
- **Process:** feature branch → PR → CI green (incl. visual + perf gates once 0.1/0.2 land) → merge to `master` auto-deploys · rollback via `workflow_dispatch` → `rollback_ref`.

## 5. Suggested Sequence & Status

| Order | Phase | Effort | Payoff | Status |
|---|---|---|---|---|
| 1 | 0 Foundation | ½–1 | Safety net | ☐ |
| 2 | 1 FUI texture | 1–2 | ★★★★★ | ☐ |
| 3 | 2 Scroll choreography | 1–2 | ★★★★ | ☐ |
| 4 | 3 3D upgrades | 2–3 | ★★★★★ | ☐ |
| 5 | 4 Pro features | 2–3 | ★★★★ | ☐ |
| 6 | 5 Hardening | 1 | Ship quality | ☐ |

Check items off and append decisions/date notes below as work lands.

## 6. Appendix — Feeding this codebase to Claude cheaply (pxpipe)

The repo reads well as rendered images (~78 % token savings measured). Two paths:

1. **Proxy (automatic):** run `pxpipe` and point Claude Code at it; the dashboard at
   `http://127.0.0.1:47821/` controls live compression (if it shows "0 turned into images",
   enable compression there — requests pass through untouched otherwise).
2. **Export (manual):** render sources to PNG pages and attach them to any Claude chat:

   ```bash
   pxpipe export src index.html vite.config.ts --open
   # → page-NNN.png (drag into chat) + factsheet.txt (verbatim ids/numbers) + prompt.txt (paste-ready instruction)
   ```

   Measured on this repo (2026-07-08): 19 files · 51,356 text tokens → 11,353 image tokens
   across 7 pages (77.9 % saved). Re-export after big changes; use `--git`/`--diff <ref>`
   to render only a change set.

## 7. Decision Log

- **2026-07-08** — Plan created. Kept existing era-color identity over the design-system tool's
  generic green/slate FUI palette (identity already stronger and story-coupled). Chose hash-based
  case studies over a router (GH Pages simplicity). Deferred WebGPU. "Ask my portfolio" v1 chosen
  as client-side only — no backend ops until value proven.
