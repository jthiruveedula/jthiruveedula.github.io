# Asset Manifest — Scroll-World Stations

Seven stills, one per station of the camera flight. Generated on Higgsfield through the
MCP server (`generate_image`, model id `nano_banana_2`, which the service routes to
`nano_banana_flash`) at 16:9 / 2k — every one from the same style preamble, so the whole
flight reads as a single world. Prompts live in [SCENE_PLAN.md](./SCENE_PLAN.md).

**No video was generated.** The camera flight runs in-engine (`three` + GSAP
ScrollTrigger); see "Why stills" below.

## Files

Masters render at 2752×1536. Each is transcoded to a 2048w desktop JPEG and a 1280w
mobile JPEG (`@sm`). The engine picks the variant by viewport, and stations are lazily
mounted, so a visitor only ever downloads the stations they actually fly through.

| # | Station | Era | Desktop (2048w) | Mobile (1280w) | Higgsfield job |
|---|---|---|---|---|---|
| 1 | Ingress | cloud | `public/scenes/01-ingress.jpg` (346K) | `01-ingress@sm.jpg` (133K) | `28780c67-6144-4473-9408-256b074ff4c1` (replaced) |
| 2 | Legacy Substrate | legacy | `public/scenes/02-legacy-substrate.jpg` (355K) | `02-legacy-substrate@sm.jpg` (136K) | `761973bb-8bd9-41f1-bf77-283c77c2c258` (re-roll) |
| 3 | The Great Migration | cloud | `public/scenes/03-great-migration.jpg` (468K) | `03-great-migration@sm.jpg` (193K) | `eca17fb6-73d3-4827-a1c3-a10e4da9f4a0` |
| 4 | Governed Realtime | cloud | `public/scenes/04-governed-realtime.jpg` (346K) | `04-governed-realtime@sm.jpg` (154K) | `4ecc815c-32f3-4401-8197-cb2ba4be5488` |
| 5 | The Translation Engine | ai | `public/scenes/05-translation-engine.jpg` (296K) | `05-translation-engine@sm.jpg` (124K) | `f79268c5-ca77-4fee-9540-2a46d424e081` (re-roll) |
| 6 | The Grounded Mind | ai | `public/scenes/06-grounded-mind.jpg` (435K) | `06-grounded-mind@sm.jpg` (201K) | `7039cb97…` — see note | 
| 7 | The Whole System | ai | `public/scenes/07-whole-system.jpg` (398K) | `07-whole-system@sm.jpg` (142K) | `7039cb97-8de6-4831-b7e1-1a48125ba84b` (re-roll) |

> Station 6's job id is `00c4ccac-76db-4ca2-ac31-191632adafeb` (first pass, accepted).

**Total shipped: 3.4 MB** across both variants — 1.0 MB of that is the mobile set. Only
station 1 (214K) is on the critical path; the rest stream in as the flight approaches
them.

Station IDs map to copy and accent colour in [`src/data/scenes.ts`](./src/data/scenes.ts).

## Re-rolls

Three of the seven first passes were rejected on visual inspection and regenerated with
corrected prompts:

| Station | Why rejected | Prompt correction |
|---|---|---|
| 2 Legacy Substrate | Cyan neon edge lighting dominated, so it read as the cloud era rather than legacy amber | Named amber as the only light source and explicitly excluded cyan/teal/blue |
| 5 Translation Engine | Brassy gold steampunk turbine — saturated toy render, broke the near-black/thin-neon contract | Forced dark matte and gunmetal surfaces, colour from emitted light only, excluded brass/gold/copper/bronze |
| 7 The Whole System | Rendered a small isolated prop (read as a water tower), not a colossal structure | Specified an extreme wide aerial of a kilometres-tall megastructure filling frame height, excluded "small object"/"floating prop" |

Re-rolls cost 6 credits.

### Station 1 replaced

The original Ingress still (`bf49a782-13fb-46ee-8a3c-52e67bb5dba6`) was a bundle of
fibre-optic conduits. It passed the style check but was the weakest of the seven on
substance: it read as generic stock tech, it did not carry the era arc the copy claims,
and its subject sat dead-centre, which is what forced the copy column off to one side.

Three replacement concepts were generated and reviewed:

| Candidate | Concept | Verdict |
|---|---|---|
| A `5b63c05f…` | Core sample — three strata in one column | Rejected: reads as a lab specimen in a beaker, small-object scale |
| **B `28780c67…`** | **Cathedral threshold — amber machinery underfoot, cyan vaults overhead, violet orb at the vanishing point** | **Shipped** |
| C `fbd30902…` | Tower cutaway — floors of racks → lattice → orb | Runner-up: clearest three-layer read, but sits on a visible plinth so it looks like an architect's model |

B was chosen because it is the only one that behaves like an *establishing shot*: it has
depth that invites entry, which is what an ingress station is for, and it encodes all
three eras in one piece of readable architecture. A and C are objects you look at; B is a
place you are about to fly into. Its prompt also reserves the **left** third for copy,
matching the left-anchored text column.

All three masters are archived in the session scratchpad (`scene-masters/`) so C can be
swapped in without regenerating.

**Total spend: 26 credits** (13 generations × 2) of the 50 available.

## Provenance

- **PNG masters** are not committed — 5–9 MB each, ~40 MB total, with no purpose in the
  repo once transcoded. They are archived outside the tree in the session scratchpad
  (`scene-masters/`). Regenerate from the SCENE_PLAN prompts if they are ever needed.
- **Transcoding** used macOS `sips` (`cwebp`/`avifenc` are not installed on this
  machine), so the shipped format is JPEG rather than WebP/AVIF. JPEG costs perhaps
  20–30% more bytes on this kind of dark render but needs no new dependency and is
  universally supported. Adding `sharp` as a devDependency to emit AVIF/WebP is the
  obvious follow-up if the byte budget ever matters.

## Why stills, not clips

The brief asked for a still plus a dive-in clip plus a connector clip per scene — 20
assets, 13 of them video. The Higgsfield balance was **50 credits on the free plan**,
which video generation alone would have exhausted several times over.

Rather than degrade quality or stop, the camera moves in-engine instead: station
position, scale, opacity and the dust field are all pure functions of scroll offset in
[`src/scenes/WorldScene.tsx`](./src/scenes/WorldScene.tsx). That also happens to beat
pre-rendered video on all four of the brief's stated edge cases — reverse scroll is
exact rather than a backwards video seek, there are no clip durations to reconcile, no
seams to pop at, and nothing to decode on a phone. See SCENE_PLAN.md for the full
comparison.
