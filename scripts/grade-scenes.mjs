/**
 * Bake the brass grade into the scene plates.
 *
 * The seven stills were generated in the v3–v5 era palette (amber #f59e0b legacy /
 * cyan #22d3ee cloud / violet #a78bfa AI). The site's accent is now molten brass
 * oklch(76% 0.17 50). Rather than re-render them, we regrade: these images are
 * essentially a luminance map with one narrow-band hue painted on, so throwing the
 * hue away leaves a complete picture that can be remapped through any ramp.
 *
 * This runs at build time rather than as a CSS `filter`, which means zero runtime
 * cost and identical output in every engine (Safari's SVG-filter path is the
 * weakest of the three).
 *
 * What NOT to do, both tested and rejected:
 *   - `hue-rotate()` is a linear sRGB matrix — it cannot move cyan without moving
 *     everything else by the same angle. At the rotation that takes cyan to brass,
 *     01's amber machines turn blue, 07's amber base turns blue-violet and 06 goes
 *     green.
 *   - The `sepia() saturate() hue-rotate()` chain crushes these near-clipped
 *     emissive pixels to flat orange. That is the "mud" people mean.
 *
 * The load-bearing detail is the shadow stop: it is exactly --color-paper, so a
 * full-bleed plate and the page background share one black point and there is no
 * seam where the film meets the document.
 */
import sharp from 'sharp'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Originals live outside public/ deliberately: they are build inputs, not served
// assets. Left in public/ they added 2.8MB of unreferenced JPEG to every deploy.
const SRC = path.join(ROOT, 'scene-sources')
const OUT = path.join(ROOT, 'public', 'scenes')

/** 4-stop luminance gradient maps. Stops are [luminance, r, g, b]. */
const RAMPS = {
  // Six of the seven scenes. 0.72 stop is --color-accent exactly.
  brass: [
    [0.0, 14, 13, 26], // cool-violet shadow === oklch(15% 0.014 265) === --color-paper
    [0.35, 92, 42, 20], // deep brass
    [0.72, 255, 140, 63], // oklch(76% 0.17 50) === --color-accent
    [1.0, 255, 232, 205], // hot cream highlight
  ],
  // The exception. Six scenes are one hue; on the seventh idea — the grounded RAG,
  // the eval harness, the thing he is actually being hired for — a second colour
  // arrives. One scene, one exception, one meaning. It also kills the stock
  // purple-AI-orb tell, which is the weakest thing about that asset.
  // Pulled deliberately toward hot metal rather than the literal token value:
  // oklch(68% 0.16 18) resolves to rgb(255,118,110), which reads salmon-pink over a
  // whole plate. The token stays as-is for UI (limit lines, the verb landmark);
  // the plate ramp runs a deeper red-orange so the second colour reads as heat.
  coral: [
    [0.0, 14, 13, 26],
    [0.35, 86, 30, 26],
    [0.72, 236, 100, 78],
    [1.0, 255, 224, 208],
  ],
}

/**
 * Per-scene grade. `split` cross-fades two ramps along an axis, for the two scenes
 * where a single ramp would erase the content: 03's whole argument is
 * old-left/new-right, and 07's three era bands would collapse into one.
 */
const SCENES = [
  { file: '01-ingress', ramp: 'brass' },
  { file: '02-legacy-substrate', ramp: 'brass' },
  { file: '03-great-migration', split: { axis: 'x', at: 0.47, feather: 0.15, a: 'brass', b: 'coral' } },
  { file: '04-governed-realtime', ramp: 'brass' },
  { file: '05-translation-engine', ramp: 'brass' },
  { file: '06-grounded-mind', ramp: 'coral' },
  // Brass only, deliberately. A split here would keep the three era bands separate,
  // but this is the finale and the line it carries is "one structure" — resolving
  // the whole tower into a single material is the point, not a loss.
  { file: '07-whole-system', ramp: 'brass' },
]

const WIDTHS = [2048, 1280]

/** Interpolate a 4-stop ramp into a 256-entry per-channel lookup table. */
function buildLut(stops) {
  const lut = new Uint8Array(256 * 3)
  for (let i = 0; i < 256; i++) {
    const t = i / 255
    let k = 0
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++
    const [t0, r0, g0, b0] = stops[k]
    const [t1, r1, g1, b1] = stops[k + 1]
    const f = t1 === t0 ? 0 : (t - t0) / (t1 - t0)
    lut[i * 3] = Math.round(r0 + (r1 - r0) * f)
    lut[i * 3 + 1] = Math.round(g0 + (g1 - g0) * f)
    lut[i * 3 + 2] = Math.round(b0 + (b1 - b0) * f)
  }
  return lut
}

const LUTS = Object.fromEntries(Object.entries(RAMPS).map(([k, v]) => [k, buildLut(v)]))

/** smoothstep, so a split seam reads as a lit gradient rather than a hard edge. */
const smoothstep = (x) => {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

async function grade(scene, width) {
  const src = path.join(SRC, `${scene.file}.jpg`)

  // Greyscale first, then a mild linear lift BEFORE the map. JPEG chroma-subsampling
  // noise in the near-black regions gets amplified by any ramp that lifts shadows,
  // so this buys contrast back before the ramp can multiply the noise.
  const { data, info } = await sharp(src)
    .resize({ width, fit: 'inside', withoutEnlargement: true })
    .greyscale()
    .linear(1.1, -6)
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: w, height: h, channels } = info
  const out = Buffer.allocUnsafe(w * h * 3)

  const lutA = LUTS[scene.split ? scene.split.a : scene.ramp]
  const lutB = scene.split ? LUTS[scene.split.b] : null

  for (let y = 0; y < h; y++) {
    // Blend weight is constant per row for a y-split, per column for an x-split.
    let rowMix = 0
    if (scene.split && scene.split.axis === 'y') {
      const t = h === 1 ? 0 : y / (h - 1)
      rowMix = smoothstep((t - (scene.split.at - scene.split.feather)) / (2 * scene.split.feather))
    }
    for (let x = 0; x < w; x++) {
      const l = data[(y * w + x) * channels]
      const i = l * 3
      const o = (y * w + x) * 3

      if (!lutB) {
        out[o] = lutA[i]
        out[o + 1] = lutA[i + 1]
        out[o + 2] = lutA[i + 2]
        continue
      }

      let mix = rowMix
      if (scene.split.axis === 'x') {
        const t = w === 1 ? 0 : x / (w - 1)
        mix = smoothstep((t - (scene.split.at - scene.split.feather)) / (2 * scene.split.feather))
      }
      out[o] = lutA[i] + (lutB[i] - lutA[i]) * mix
      out[o + 1] = lutA[i + 1] + (lutB[i + 1] - lutA[i + 1]) * mix
      out[o + 2] = lutA[i + 2] + (lutB[i + 2] - lutA[i + 2]) * mix
    }
  }

  const suffix = width === WIDTHS[0] ? '' : '@sm'
  const base = sharp(out, { raw: { width: w, height: h, channels: 3 } })
  const dest = path.join(OUT, `${scene.file}${suffix}`)

  await base.clone().avif({ quality: 52, effort: 6 }).toFile(`${dest}.avif`)
  // JPEG fallback only for the two eager scenes — 03-07 are AVIF-only.
  if (scene.file.startsWith('01') || scene.file.startsWith('02')) {
    await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(`${dest}.jpg`)
  }
  return { name: `${scene.file}${suffix}`, w, h }
}

await mkdir(OUT, { recursive: true })

const results = []
for (const scene of SCENES) {
  for (const width of WIDTHS) results.push(await grade(scene, width))
}

const files = await readdir(OUT)
let total = 0
for (const f of files) {
  const { size } = await sharp(path.join(OUT, f)).metadata().then(
    async () => ({ size: (await import('node:fs/promises')).stat(path.join(OUT, f)) }),
  ).then(async (x) => ({ size: (await x.size).size }))
  total += size
}
console.log(
  `graded ${results.length} plates -> ${files.length} files, ${(total / 1024 / 1024).toFixed(2)} MB`,
)
