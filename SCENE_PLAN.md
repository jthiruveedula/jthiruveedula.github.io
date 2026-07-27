# Scroll-World Scene Plan — Jagadeesh Thiruveedula

**Status:** Built and shipped. Plan approved with four decisions: stills-only assets
(camera in-engine), no dedicated trading scene, "Hire me — view résumé" as the single CTA,
and the flight replacing the hero with the existing sections kept below it.

Implementation: [`src/scenes/WorldScene.tsx`](./src/scenes/WorldScene.tsx) (camera),
[`src/components/ScrollWorld.tsx`](./src/components/ScrollWorld.tsx) (scroll mapping +
copy), [`src/data/scenes.ts`](./src/data/scenes.ts) (station content).
Assets and credit spend: [ASSET_MANIFEST.md](./ASSET_MANIFEST.md).

Three of the seven stills were rejected on visual review and re-rolled with corrected
prompts — the amber-era corridor came back cyan-lit, the translation engine came back as a
brass steampunk toy, and the finale came back as a small isolated prop instead of a
megastructure. The re-roll prompts and reasons are in the asset manifest; the table below
records the plan as approved.

Sourced entirely from `src/data/portfolio.ts` (canonical, merged from 8 resume variants). Every project scene carries at least one real metric. No invented numbers.

---

## Shared visual contract (appended to every still prompt)

```
glossy 3D render, physically based reflective surfaces, near-black background #05070D,
volumetric haze, thin neon edge lighting, no text, no letters, no signage, no people,
shallow depth of field, cinematic 35mm anamorphic, 16:9, high detail, clean negative space
in the lower third for caption overlay
```

**Era accent palette** (matches existing `EraWash` / era-token system in the repo):

| Era | Years | Accent | Hex |
|---|---|---|---|
| legacy | 2015–2019 | amber / sodium | `#F59E0B` |
| cloud | 2019–2024 | cyan | `#22D3EE` |
| ai | 2024–present | violet | `#A78BFA` |

Camera flies one continuous path: descends through legacy substrate → accelerates through cloud → rises into AI canopy → pulls back to reveal the whole structure. Accent hue crossfades along the path, so no scene cut is a hard colour jump.

---

## Scene table

| # | Scene Name | Narrative Beat | Narrative Description | Higgsfield Still Prompt | Dive-In Clip Prompt (camera approach) | Connector Clip Prompt (transition out) |
|---|---|---|---|---|---|---|
| 1 | **Ingress** | Arrival | Camera opens in black, drifting toward a vast vertical monolith of illuminated data conduits — the whole 11-year system seen from outside before we enter it. Establishes scale and the "11+ years, $2M+ saved, 1B+ events/day" claim. | Colossal vertical monolith of bundled glass data conduits rising out of a dark reflective plane, faint amber light at the base graduating to cyan mid-height and violet at the crown, thin luminous filaments tracing the surface, distant volumetric fog, single specular highlight | Slow forward dolly from far field, monolith growing from silhouette to filling frame, drifting haze parallax, subtle lens breathing, no cuts, 6s | Camera tilts down and begins descending along the monolith's base, amber light intensifying as the surface passes, motion blur on passing filaments, 4s |
| 2 | **Legacy Substrate** | Where it started (2015–2019) | Descent into the foundation layer: mainframe cabinets, Teradata racks, Oracle spindles, and the first 20+ ETL pipelines. This is the fluency that later made LLM-driven COBOL translation possible. Metrics: 20+ pipelines, 5M+ records/day, defect rate −25%, pipeline dev time −35%. | Underground vault of monolithic mainframe cabinets and tape reels in brushed steel, punch-card geometry etched into the floor, thick amber sodium light bleeding through vent grilles, heavy copper conduit bundles running out of frame, dust motes in the beams, oppressive low ceiling | Camera descends vertically past rows of mainframe cabinets, amber vent light strobing across the lens, settling into a slow forward glide down a corridor of racks, 6s | Camera accelerates down the corridor toward a bright cyan aperture at the far end, amber falling away behind, streaking light, 4s |
| 3 | **The Great Migration** | Petabyte lift (Charles Schwab, 2019–2022) | The camera bursts out of the legacy vault into open cloud: a multi-petabyte Hadoop/Teradata estate streaming across a chasm into BigQuery. Metrics: 1B+ daily records at zero data loss, $1M+ annual savings, 25% efficiency gain, release cycles −50%, 30M/day transactional framework at 99.5% SLA. | Two vast structures separated by a chasm, a decaying dark ziggurat of legacy racks on the left and a crystalline cyan lattice cathedral on the right, a torrential river of luminous data particles arcing between them, cyan light dominant, amber only as dying embers in the left structure, cathedral facets throwing caustic reflections | Camera bursts through the aperture and banks hard right, tracking alongside the particle river mid-arc, both structures sweeping through frame, high speed with visible motion streaks, 6s | Camera slows and rises above the cathedral, the lattice receding below, a network of glowing streaming conduits coming into view ahead, 4s |
| 4 | **Governed Realtime** | Scale under constraint (HCA Healthcare + NRG Energy, 2022–2024) | Above the warehouse sits the live plumbing: 50+ healthcare sources streaming through Kafka and Pub/Sub under HIPAA audit, and a cross-cloud AWS→GCP cutover done in under 30 minutes. Constraint is the point — governance rings gate every flow. Metrics: 100+ TB migrated under HIPAA, 50+ real-time sources at 100% data accuracy, ETL +30%, <30 min cutover, 99.95% uptime SLA. | Dense horizontal manifold of transparent pipes carrying pulsing cyan light, each pipe passing through a glowing concentric governance ring that scans and gates the flow, secondary teal telemetry filaments threading between pipes, a mirrored dark floor doubling the whole structure, two distinct pipe clusters converging into one trunk line | Camera threads forward through the centre of the manifold between pipes, governance rings passing overhead like tunnel arches, pulses racing past in both directions, 6s | Camera exits the manifold and rotates upward toward a warm violet glow above, pipe cluster shrinking below, cyan cooling into violet, 4s |
| 5 | **The Translation Engine** | Legacy meets AI (Definity, 2024–2025) | The two halves of the career collide: an LLM engine ingesting COBOL and emitting governed BigQuery SQL and PySpark, scored by a semantic-fidelity eval harness. Metrics: 12 legacy workstreams triaged, 5 reusable transformation patterns codified. | A machine bridging two worlds, left intake made of rusted amber punch-card and tape geometry feeding into a central violet toroidal engine core, right output emerging as clean crystalline cyan geometric blocks on a conveyor of light, amber and violet and cyan meeting in one frame, sparks of translation at the throat of the engine, sharp specular reflections on the polished core | Camera pushes in low along the amber intake, following material into the throat of the engine, violet core light growing until it dominates the frame, 6s | Camera pulls back and up out of the engine bay, revealing the engine as one component in a larger violet structure overhead, 4s |
| 6 | **The Grounded Mind** | Production GenAI (John Wiley & Sons, 2025–present) | The summit: a private LLM platform — RAG over 50M+ documents with grounded citations, multi-agent orchestration over MCP, a 500+ TiB Snowflake→BigQuery lift, and the LLMOps that keeps it honest. Metrics: 50M+ documents, 95% grounded accuracy, p95 <1.5s, 60% tier-1 ticket deflection, >4.3/5 CSAT, 500+ TiB migrated, 200+ workflows zero data loss, 99.9% uptime. | Enormous suspended violet orb of layered translucent shells at the centre of a spherical chamber, dense swarm of glowing document shards orbiting it in nested rings, thin retrieval beams connecting individual shards to the orb core, smaller satellite agent orbs in a ring further out linked to the core by light threads, a containment cage of thin violet filaments enclosing everything, magenta rim light | Camera rises into the chamber from below, orbiting the great orb as the document swarm parallaxes across frame, retrieval beams igniting as they pass, 6s | Camera retreats rapidly outward through the containment cage, the entire chamber compressing to a single point of violet light in the distance, 4s |
| 7 | **The Whole System** | Close + CTA | Final pull-back reveals every prior scene as one connected structure — legacy roots, cloud trunk, AI canopy — lit end to end. Single call to action. | Extreme wide shot of one colossal connected structure seen from far above and to the side, amber industrial roots at the base, cyan crystalline lattice trunk in the middle, violet orb canopy crowning the top, all linked by continuous luminous conduits, deep starless black void surrounding it, structure occupying the left two thirds of frame with clean empty void on the right for a call-to-action panel | Camera continues retreating and slowly rolls level, the full structure settling into frame, all three era colours resolving simultaneously, motion easing to near-stillness, 6s | — (terminal scene; scroll ends here) |

---

## Metric coverage check

| Scene | Metrics carried |
|---|---|
| 1 Ingress | 11+ years, $2M+ saved, 1B+ events/day, 99.9% uptime |
| 2 Legacy Substrate | 20+ pipelines, 5M+ records/day, −25% defects, −35% dev time |
| 3 Great Migration | 1B+ daily records zero loss, $1M+/yr, +25% efficiency, −50% release cycles, 30M/day @ 99.5% SLA |
| 4 Governed Realtime | 100+ TB HIPAA, 50+ sources @ 100% accuracy, +30% ETL, <30 min cutover, 99.95% SLA |
| 5 Translation Engine | 12 workstreams, 5 patterns codified — **weakest scene numerically; leans before/after architecture visual** |
| 6 Grounded Mind | 50M+ docs, 95% grounded accuracy, p95 <1.5s, 60% deflection, >4.3/5 CSAT, 500+ TiB, 200+ workflows |
| 7 Whole System | Aggregate headline metrics |

Scene 5 is flagged per the "no concrete metrics available" rule — it carries only counts (12, 5), so it is composed as a before/after architecture visual rather than a metrics scene.

---

## Blocker: Higgsfield budget

`balance` → **50 credits, free plan.** Higgsfield CLI is not installed on this machine; the MCP server is authenticated and usable, so generation can proceed through MCP — but not at the volume this plan specifies.

As specified (7 stills + 7 dive-in clips + 6 connector clips = 20 assets, 13 of them video) the plan is not fundable at 50 credits. Video generation is the dominant cost.

### Recommended alternative — stills only, camera motion in-engine

Generate the **7 stills** on Higgsfield and produce all camera motion in the browser with the stack already installed here (`three`, `@react-three/fiber`, `gsap` + ScrollTrigger, `lenis`). Each still is decomposed into 3–4 depth-layered planes; scroll drives a real camera through the layer stack.

This is not only cheaper — it is better on every stated constraint:

| Constraint | Pre-rendered clips | In-engine camera |
|---|---|---|
| Reverse scroll | Video scrub reverse is unreliable; iOS Safari decodes forward-only in practice | Camera position is a pure function of scroll offset — reverse is free and exact |
| 60fps mobile | 13 clips = tens of MB, decode spikes, jank | 7 optimised stills, GPU-composited planes |
| Variable clip duration | Config must absorb mismatched clip lengths | No durations exist — scroll offset is the only clock |
| Boundary snapping | Clip handoff is the snap risk | One continuous curve, no boundaries to snap at |
| Load < 3s | Blocked on video bytes | 7 lazy-loaded WebP/AVIF stills |

Cost: 7 images. Leaves headroom in the 50 credits for regenerating any off-brand scene (the fallback-prompt requirement).

If pre-rendered clips are wanted anyway, credits need topping up first — and even then I would ship in-engine camera for the scroll and use clips only as ambient loops inside a scene, never as the scroll mechanism.

---

## Outcome

Stills-only was approved. Seven stills generated for **20 of 50 credits** (10 generations
including 3 re-rolls), and the camera flight was built in-engine on the stack already in
the repo.

Measured against the brief's success criteria:

| Criterion | Result |
|---|---|
| Coherent visual style across stations | Verified by inspecting all seven; 3 re-rolled until on-brand |
| Continuous camera flight, no jarring jumps | Stations crossfade asymmetrically and zoom past the camera; no cuts, nothing to seam |
| Reverse scroll works | Exact — every value is a pure function of scroll offset (covered by an e2e test) |
| 60fps mobile scroll | 60fps at 1× and 2× CPU throttle on a 390×844 viewport; clean 30fps lock at 4×+ |
| Concrete metric per project scene | Every station carries 2–4 real metrics from `portfolio.ts` (covered by an e2e test) |
| Single strong CTA | "Hire me — view résumé" → `/resume.html`, plus email, on station 7 only |
| Loads in under 3s on desktop | Only station 1 (214K) is on the critical path; later stations stream in on approach |

Deviations from the brief, and why:

- **No dive-in or connector clips.** Not fundable at 50 credits, and the in-engine camera
  is strictly better on the brief's own edge cases (see the comparison above). Approved.
- **JPEG, not WebP/AVIF.** No `cwebp`/`avifenc` on this machine and `sips` cannot emit
  WebP; JPEG avoids adding a dependency mid-build. Adding `sharp` is the follow-up.
- **No `scroll-world.config.json` / vanilla `src/main.js`.** The requested Phase-3 file
  list assumes the skill's standalone vanilla scrub engine, which exists to play a chain
  of pre-rendered clips. With no clips, that engine has nothing to do, and this is an
  existing Vite + React app rather than a greenfield page — so the equivalent artifacts
  are the three source files listed at the top, and station config lives in
  `src/data/scenes.ts` as typed data rather than loose JSON.
- **Station 5 carries counts, not scale metrics** (12 workstreams, 5 patterns) — flagged
  under the brief's "no concrete metrics" rule and composed as a before/after visual.
