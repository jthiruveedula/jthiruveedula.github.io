const AUDIO_ENABLED_KEY = 'portfolio-audio-enabled'

class AudioManager {
  private ctx: AudioContext | null = null
  private enabled = false
  private reduced = false

  constructor() {
    if (typeof window === 'undefined') return
    this.enabled = window.localStorage.getItem(AUDIO_ENABLED_KEY) === 'true'
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reduced = e.matches
      if (this.reduced) this.enabled = false
    })
  }

  isEnabled(): boolean {
    return this.enabled && !this.reduced
  }

  toggle(): boolean {
    if (this.reduced) return false
    this.enabled = !this.enabled
    window.localStorage.setItem(AUDIO_ENABLED_KEY, String(this.enabled))
    if (this.enabled && !this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return this.enabled
  }

  /** Subtle UI blip — short sine burst with quick decay. */
  playBlip(type: 'hover' | 'click' | 'focus' = 'click') {
    if (!this.enabled || this.reduced || !this.ctx) return
    if (this.ctx.state === 'suspended') this.ctx.resume()

    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    const freq = type === 'hover' ? 520 : type === 'focus' ? 660 : 440
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.08)

    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.04, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(t)
    osc.stop(t + 0.13)
  }
}

export const audioManager = new AudioManager()
