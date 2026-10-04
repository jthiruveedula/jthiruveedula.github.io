import type * as THREE from 'three'

/** Contract for the journey scene's optional layers. City owns the render loop and calls these. */
export interface Layer {
  /** progress: scroll 0..1. time: seconds since the scene started. */
  update(progress: number, time: number): void
  /** Release every geometry, material, texture and DOM/event hook the layer created. */
  dispose(): void
}

/** Shared scene handles passed to layers that need them. */
export interface SceneContext {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
}
