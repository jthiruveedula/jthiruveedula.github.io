export type Landmark = { id: string; district: 0 | 1 | 2 | 3 | 4 }
export type LandmarkHover = { id: string | null; x: number; y: number }
export type LandmarkHandlers = {
  onHover(e: LandmarkHover): void
  onSelect(id: string, via: 'mouse' | 'touch'): void
}
export type LandmarkApi = {
  setLandmarks(l: readonly Landmark[]): void
  setLandmarkHandlers(h: LandmarkHandlers): void
}
