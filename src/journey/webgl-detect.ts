/** Feature-detect a real WebGL context without throwing on browsers/extensions
 *  that block canvas fingerprinting probes. Deliberately its own module with no
 *  `three` import — JourneyApp needs this synchronously to choose the static
 *  fallback vs. the scene, and importing it from City.ts would force `three`
 *  into that decision's chunk, defeating the point of lazy-loading it. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}
