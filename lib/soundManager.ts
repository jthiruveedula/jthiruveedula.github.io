type SoundMode = "off" | "low" | "on";
type SfxName = "shimmer" | "click" | "whoosh" | "reveal" | "tick" | "sweep" | "transition" | "success" | "toggle" | "ambient";

interface SoundManagerState {
  mode: SoundMode;
  volume: number;
  initialized: boolean;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private state: SoundManagerState = { mode: "on", volume: 0.35, initialized: false };
  private listeners: Set<() => void> = new Set();
  private ambientNode: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private lastPlay: Record<string, number> = {};

  private getCtx(): AudioContext | null {
    if (!this.ctx) return null;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private cooldown(name: string, ms = 80): boolean {
    const now = Date.now();
    if (this.lastPlay[name] && now - this.lastPlay[name] < ms) return true;
    this.lastPlay[name] = now;
    return false;
  }

  private vol(): number {
    const base = this.state.volume;
    if (this.state.mode === "off") return 0;
    if (this.state.mode === "low") return base * 0.3;
    return base;
  }

  init() {
    if (this.state.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.state.initialized = true;
    } catch {
      console.warn("Web Audio API not available");
    }
  }

  setMode(mode: SoundMode) {
    this.state.mode = mode;
    if (mode === "off") {
      this.stopAmbient();
    } else if (!this.state.initialized) {
      this.init();
    }
    if (mode !== "off" && !this.ambientNode) {
      this.startAmbient();
    }
    this.notify();
  }

  setVolume(v: number) {
    this.state.volume = Math.max(0, Math.min(1, v));
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(0.03 * this.vol(), this.getCtx()?.currentTime ?? 0);
    }
    this.notify();
  }

  getState(): Readonly<SoundManagerState> {
    return this.state;
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private startAmbient() {
    const ctx = this.getCtx();
    if (!ctx || this.ambientNode) return;
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0, ctx.currentTime);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(55, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(54.5, ctx.currentTime + 8);
    osc1.frequency.linearRampToValueAtTime(55.5, ctx.currentTime + 16);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(110, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(109.5, ctx.currentTime + 12);
    osc2.frequency.linearRampToValueAtTime(110.5, ctx.currentTime + 24);

    const osc3 = ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(165, ctx.currentTime);
    osc3.frequency.linearRampToValueAtTime(164.5, ctx.currentTime + 10);
    osc3.frequency.linearRampToValueAtTime(165.5, ctx.currentTime + 20);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.04, ctx.currentTime);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.02, ctx.currentTime);
    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0.015, ctx.currentTime);

    osc1.connect(gain1).connect(this.ambientGain);
    osc2.connect(gain2).connect(this.ambientGain);
    osc3.connect(gain3).connect(this.ambientGain);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);

    this.ambientGain.connect(filter).connect(ctx.destination);
    this.ambientGain.gain.linearRampToValueAtTime(0.03 * this.vol(), ctx.currentTime + 2);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc3.start(ctx.currentTime);

    const loop = () => {
      if (!this.ambientNode) return;
      const now = ctx.currentTime;
      osc1.frequency.setValueAtTime(55 + Math.sin(now * 0.2) * 0.5, now);
      osc2.frequency.setValueAtTime(110 + Math.sin(now * 0.15) * 0.8, now);
    };
    const interval = setInterval(loop, 500);
    this.ambientNode = osc1;
    (this.ambientNode as any)._cleanup = () => clearInterval(interval);
  }

  private stopAmbient() {
    if (this.ambientNode) {
      (this.ambientNode as any)._cleanup?.();
    }
    if (this.ambientGain) {
      const ctx = this.getCtx();
      if (ctx) {
        this.ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      }
    }
    setTimeout(() => {
      this.ambientNode?.stop();
      this.ambientNode = null;
      this.ambientGain = null;
    }, 600);
  }

  play(name: SfxName) {
    if (this.state.mode === "off") return;
    if (this.cooldown(name)) return;

    const ctx = this.getCtx();
    if (!ctx) return;

    const v = this.vol();
    if (v === 0) return;

    switch (name) {
      case "shimmer": this._shimmer(ctx, v); break;
      case "click": this._click(ctx, v); break;
      case "whoosh": this._whoosh(ctx, v); break;
      case "reveal": this._reveal(ctx, v); break;
      case "tick": this._tick(ctx, v); break;
      case "sweep": this._sweep(ctx, v); break;
      case "transition": this._transition(ctx, v); break;
      case "success": this._success(ctx, v); break;
      case "toggle": this._toggle(ctx, v); break;
    }
  }

  private _shimmer(ctx: AudioContext, v: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(3000, now + 0.3);

    filter.type = "highpass";
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.3);

    gain.gain.setValueAtTime(0.06 * v, now);
    gain.gain.exponentialRampToValueAtTime(0.12 * v, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  private _click(ctx: AudioContext, v: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08 * v, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  private _whoosh(ctx: AudioContext, v: number) {
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.3);
    filter.Q.setValueAtTime(2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1 * v, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.1 * v, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.3);
  }

  private _reveal(ctx: AudioContext, v: number) {
    const now = ctx.currentTime;
    const chords = [261.6, 329.6, 392, 523.2];

    chords.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.06 * v, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.45);
    });

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) noiseData[i] = (Math.random() * 2 - 1) * 0.3;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.02 * v, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(now);
  }

  private _tick(ctx: AudioContext, v: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2400, now);
    gain.gain.setValueAtTime(0.04 * v, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  private _sweep(ctx: AudioContext, v: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.4);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05 * v, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  private _transition(ctx: AudioContext, v: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06 * v, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.06 * v, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  private _success(ctx: AudioContext, v: number) {
    const now = ctx.currentTime;
    [523.2, 659.3, 783.9, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.06 * v, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }

  private _toggle(ctx: AudioContext, v: number) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.03);
    gain.gain.setValueAtTime(0.05 * v, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(900, now + 0.04);
    gain2.gain.setValueAtTime(0.04 * v, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.1);
  }

  destroy() {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.state.initialized = false;
  }
}

export const soundManager = new SoundManager();
