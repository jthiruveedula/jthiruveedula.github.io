import * as THREE from 'three'
import type { Layer, SceneContext } from './layers'

const SKY_RADIUS = 180
const STAR_RADIUS = 170
const STAR_COUNT = 700
const STAR_SEED = 0x5eed
const STAR_SIZE_PX = 1.6
const STAR_MAX_DPR = 2
const STAR_MIN_Y = 0.05 // keep stars off the horizon haze
const STAR_OPACITY_START = 0.25
const STAR_OPACITY_MAX = 0.9
const TWINKLE_SPEED = 1.5
const TWINKLE_DEPTH = 0.3

const DUSK_ZENITH = new THREE.Color('#0b1220')
const DUSK_HORIZON = new THREE.Color('#1d3350')
const NIGHT_ZENITH = new THREE.Color('#03050a')
const NIGHT_HORIZON = new THREE.Color('#070b14')
const AZURE = new THREE.Color('#00caf4')
const NIGHT_AZURE_MIX = 0.06
const GRADIENT_POWER = 0.6 // <1 keeps the horizon glow band tall
const FOG_LERP = 0.2

const LIT_MIN = 0.35
const LIT_MAX = 1

const ease = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

export function litRatio(progress: number): number {
  return LIT_MIN + (LIT_MAX - LIT_MIN) * ease(clamp01(progress))
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createSky(ctx: Pick<SceneContext, 'scene'>): Layer {
  const { scene } = ctx

  const zenith = DUSK_ZENITH.clone()
  const horizon = DUSK_HORIZON.clone()
  const nightHorizon = NIGHT_HORIZON.clone().lerp(AZURE, NIGHT_AZURE_MIX)

  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uZenith: { value: zenith },
      uHorizon: { value: horizon },
    },
    vertexShader: /* glsl */ `
      varying float vY;
      void main() {
        vY = normalize(position).y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith;
      uniform vec3 uHorizon;
      varying float vY;
      void main() {
        float h = pow(clamp(vY, 0.0, 1.0), ${GRADIENT_POWER.toFixed(2)});
        gl_FragColor = vec4(mix(uHorizon, uZenith, h), 1.0);
        #include <colorspace_fragment>
      }`,
  })
  const skyGeo = new THREE.SphereGeometry(SKY_RADIUS, 32, 16)
  const sky = new THREE.Mesh(skyGeo, skyMat)
  sky.renderOrder = -1
  sky.frustumCulled = false

  const rand = mulberry32(STAR_SEED)
  const pos = new Float32Array(STAR_COUNT * 3)
  const phase = new Float32Array(STAR_COUNT)
  for (let i = 0; i < STAR_COUNT; i++) {
    // uniform on the upper hemisphere: y uniform in [STAR_MIN_Y, 1]
    const y = STAR_MIN_Y + rand() * (1 - STAR_MIN_Y)
    const r = Math.sqrt(1 - y * y)
    const a = rand() * Math.PI * 2
    pos.set([Math.cos(a) * r * STAR_RADIUS, y * STAR_RADIUS, Math.sin(a) * r * STAR_RADIUS], i * 3)
    phase[i] = rand() * Math.PI * 2
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  starGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))

  const starMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uSize: { value: STAR_SIZE_PX * Math.min(STAR_MAX_DPR, window.devicePixelRatio || 1) },
    },
    vertexShader: /* glsl */ `
      attribute float aPhase;
      uniform float uTime;
      uniform float uSize;
      varying float vTwinkle;
      void main() {
        vTwinkle = 1.0 - ${TWINKLE_DEPTH.toFixed(2)} * (0.5 + 0.5 * sin(uTime * ${TWINKLE_SPEED.toFixed(2)} + aPhase));
        gl_PointSize = uSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vTwinkle;
      void main() {
        gl_FragColor = vec4(vec3(0.85, 0.93, 1.0), uOpacity * vTwinkle);
      }`,
  })
  const stars = new THREE.Points(starGeo, starMat)
  stars.renderOrder = -1
  stars.frustumCulled = false

  scene.add(sky, stars)

  return {
    update(progress, time) {
      const e = ease(clamp01(progress))
      zenith.copy(DUSK_ZENITH).lerp(NIGHT_ZENITH, e)
      horizon.copy(DUSK_HORIZON).lerp(nightHorizon, e)
      starMat.uniforms.uTime.value = time
      starMat.uniforms.uOpacity.value =
        STAR_OPACITY_MAX * ease(clamp01((progress - STAR_OPACITY_START) / (1 - STAR_OPACITY_START)))
      if (scene.fog instanceof THREE.Fog) scene.fog.color.lerp(horizon, FOG_LERP)
    },
    dispose() {
      scene.remove(sky, stars)
      skyGeo.dispose()
      skyMat.dispose()
      starGeo.dispose()
      starMat.dispose()
    },
  }
}
