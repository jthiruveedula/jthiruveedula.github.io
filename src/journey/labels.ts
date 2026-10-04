import * as THREE from 'three'
import type { Layer } from './layers'

export interface LabelSpec {
  text: string
  sub?: string
  position: THREE.Vector3
  district: number
}

const LOGICAL_W = 512
const LOGICAL_H = 128
const MAX_SCALE = 3
const WORLD_WIDTH = 6.5
const FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, monospace'
const TEXT_SIZE = 26
const TEXT_WEIGHT = 600
const TEXT_SPACING = '3px'
const TEXT_COLOR = '#00caf4'
const SUB_SIZE = 17
const SUB_COLOR = '#9b9ea4'
const BAR_WIDTH = 2
const BAR_INSET = 14
const TEXT_X = 34
const BACKING_INNER = 'rgba(6, 10, 16, 0.62)'
const BACKING_OUTER = 'rgba(6, 10, 16, 0)'
const RENDER_ORDER = 10
const BOB_AMPLITUDE = 0.15
const BOB_SPEED = 1.1
// Fully faded at FADE_NEAR_MIN, fully visible from FADE_NEAR_MAX.
const FADE_NEAR_MIN = 3
const FADE_NEAR_MAX = 8
const FADE_FAR_START = 70
const FADE_FAR_END = 110
const HIDE_BELOW = 0.01

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function drawLabel(spec: LabelSpec, scale: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = LOGICAL_W * scale
  canvas.height = LOGICAL_H * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // Horizontal fade keeps the backing from reading as a hard box.
  const g = ctx.createLinearGradient(0, 0, LOGICAL_W, 0)
  g.addColorStop(0, BACKING_INNER)
  g.addColorStop(0.7, BACKING_INNER)
  g.addColorStop(1, BACKING_OUTER)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)

  ctx.fillStyle = TEXT_COLOR
  const barTop = BAR_INSET
  ctx.fillRect(BAR_INSET, barTop, BAR_WIDTH, LOGICAL_H - barTop * 2)

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.letterSpacing = TEXT_SPACING
  ctx.font = `${TEXT_WEIGHT} ${TEXT_SIZE}px ${FONT_FAMILY}`
  const midY = LOGICAL_H / 2
  ctx.fillText(spec.text.toUpperCase(), TEXT_X, spec.sub ? midY - 14 : midY)
  if (spec.sub) {
    ctx.fillStyle = SUB_COLOR
    ctx.letterSpacing = '1px'
    ctx.font = `400 ${SUB_SIZE}px ${FONT_FAMILY}`
    ctx.fillText(spec.sub, TEXT_X, midY + 18)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export function createLabels(
  scene: THREE.Scene,
  camera: THREE.Camera,
  specs: readonly LabelSpec[],
  visibility: (district: number, progress: number) => number,
): Layer {
  const scale = Math.min(MAX_SCALE, Math.max(2, Math.ceil(window.devicePixelRatio || 1)))
  const height = WORLD_WIDTH * (LOGICAL_H / LOGICAL_W)
  const camPos = new THREE.Vector3()

  const items = specs.map((spec) => {
    const map = drawLabel(spec, scale)
    const material = new THREE.SpriteMaterial({
      map,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      fog: false,
      sizeAttenuation: true,
    })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(WORLD_WIDTH, height, 1)
    sprite.position.copy(spec.position)
    sprite.renderOrder = RENDER_ORDER
    sprite.visible = false
    scene.add(sprite)
    return { spec, sprite, material, map }
  })

  return {
    update(progress, time) {
      camera.getWorldPosition(camPos)
      for (const { spec, sprite, material } of items) {
        sprite.position.copy(spec.position)
        sprite.position.y += Math.sin(time * BOB_SPEED + spec.position.x) * BOB_AMPLITUDE
        const d = camPos.distanceTo(sprite.position)
        const fade = smooth(FADE_NEAR_MIN, FADE_NEAR_MAX, d) * (1 - smooth(FADE_FAR_START, FADE_FAR_END, d))
        const opacity = Math.min(1, Math.max(0, visibility(spec.district, progress))) * fade
        material.opacity = opacity
        sprite.visible = opacity >= HIDE_BELOW
      }
    },
    dispose() {
      for (const { sprite, material, map } of items) {
        scene.remove(sprite)
        map.dispose()
        material.dispose()
      }
      items.length = 0
    },
  }
}
