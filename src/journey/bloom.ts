import { HalfFloatType, Vector2, WebGLRenderTarget } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import type { SceneContext } from './layers'

const STRENGTH = 0.55
const RADIUS = 0.55
const THRESHOLD = 0.85 // high: only emissive things glow
const MSAA_SAMPLES = 4 // composer targets lose the canvas's antialias otherwise

export interface Bloom {
  readonly enabled: boolean
  render(): void
  setSize(width: number, height: number, pixelRatio: number): void
  dispose(): void
}

export function createBloom({ scene, camera, renderer }: SceneContext): Bloom {
  const enabled =
    matchMedia('(min-width: 901px)').matches &&
    !matchMedia('(pointer: coarse)').matches &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!enabled) {
    return { enabled, render: () => renderer.render(scene, camera), setSize() {}, dispose() {} }
  }

  // Alpha: composer targets are RGBA half-float and RenderPass clears with the renderer's alpha 0, so empty
  // pixels stay (0,0,0,0). Bloom adds premultiplied-safe rgb with alpha=max(rgb); OutputPass keeps alpha. No halo.
  const size = renderer.getSize(new Vector2())
  const pr = renderer.getPixelRatio()
  const target = new WebGLRenderTarget(size.x * pr, size.y * pr, { type: HalfFloatType, samples: MSAA_SAMPLES })
  const composer = new EffectComposer(renderer, target)
  composer.setPixelRatio(pr)
  composer.setSize(size.x, size.y)
  // UnrealBloomPass halves its own resolution internally (three 0.186), so pass full size.
  const bloom = new UnrealBloomPass(size.clone(), STRENGTH, RADIUS, THRESHOLD)
  const passes = [new RenderPass(scene, camera), bloom, new OutputPass()]
  passes.forEach((p) => composer.addPass(p))

  return {
    enabled,
    render: () => composer.render(),
    setSize(width, height, pixelRatio) {
      composer.setPixelRatio(pixelRatio)
      composer.setSize(width, height)
    },
    dispose() {
      passes.forEach((p) => p.dispose())
      composer.dispose()
    },
  }
}
