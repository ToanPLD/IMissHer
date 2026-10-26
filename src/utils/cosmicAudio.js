/**
 * Procedural Cosmic Audio Synthesizer
 * Generates ambient sub-bass spacetime drone and supernova explosions via Web Audio API.
 */
export class CosmicAudioController {
  /**
   * @param {AudioContext} [customContext] - Injected audio context (for testing or custom routing)
   */
  constructor(customContext = null) {
    this.ctx = customContext;
    this.isInitialized = false;
    this.isPlayingDrone = false;
    this.masterGain = null;
    this.droneGain = null;
    this.oscillators = [];
    this.currentBaseFreq = 50.0; // 50 Hz base rumble
  }

  /**
   * Initializes Web Audio Context on first user interaction
   */
  async init() {
    if (this.isInitialized) return;

    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Master volume node
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Drone sub-bus
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    this.isInitialized = true;
  }

  /**
   * Adjust master volume
   * @param {number} val in [0.0, 1.0]
   */
  setMasterVolume(val) {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0.0, Math.min(1.0, val));
    this.masterGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.1);
  }

  /**
   * Starts ambient cosmic drone with dual detuned sine waves
   */
  startCosmicDrone() {
    if (!this.isInitialized || !this.ctx || this.isPlayingDrone) return;

    const t = this.ctx.currentTime;
    this.oscillators = [];

    // Low-pass filter to keep it deep and ominous
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, t);
    filter.connect(this.droneGain);

    // Sub-oscillator 1 (fundamental)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(this.currentBaseFreq, t);
    osc1.connect(filter);
    osc1.start(t);
    this.oscillators.push(osc1);

    // Sub-oscillator 2 (subtle detune for beating/pulsing effect)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(this.currentBaseFreq * 1.5 + 0.5, t);
    osc2.connect(filter);
    osc2.start(t);
    this.oscillators.push(osc2);

    // Fade in drone
    this.droneGain.gain.setValueAtTime(0.001, t);
    this.droneGain.gain.exponentialRampToValueAtTime(0.4, t + 1.5);
    this.isPlayingDrone = true;
  }

  /**
   * Stops the cosmic drone smoothly
   */
  stopCosmicDrone() {
    if (!this.isPlayingDrone || !this.ctx) return;
    this.isPlayingDrone = false;
    const t = this.ctx.currentTime;

    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, t);
    this.droneGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

    const oldOscs = [...this.oscillators];
    this.oscillators = [];
    setTimeout(() => {
      oldOscs.forEach(osc => {
        try { osc.stop(); } catch (_) {}
      });
    }, 850);
  }

  /**
   * Modulates drone pitch based on black hole mass ratio
   * @param {number} massRatio - >1.0 for supermassive, <1.0 for stellar mass
   */
  updatePitchByMass(massRatio) {
    if (!this.ctx) return;
    const clampedRatio = Math.max(0.2, Math.min(10.0, massRatio));
    // As mass increases, frequency drops down to infrasound depths
    this.currentBaseFreq = 50.0 / Math.sqrt(clampedRatio);

    const t = this.ctx.currentTime;
    if (this.oscillators.length >= 2) {
      this.oscillators[0].frequency.exponentialRampToValueAtTime(this.currentBaseFreq, t + 0.5);
      this.oscillators[1].frequency.exponentialRampToValueAtTime(this.currentBaseFreq * 1.5 + 0.5, t + 0.5);
    }
  }

  /**
   * Triggers procedural supernova explosion rumble with noise burst
   * @param {number} [intensity=1.0]
   */
  triggerSupernovaRumble(intensity = 1.0) {
    if (!this.isInitialized || !this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 3.5;
    const sampleRate = this.ctx.sampleRate || 44100;
    const bufferSize = Math.floor(sampleRate * duration);

    // Generate white noise buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 1.2));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Resonant low-pass filter with sweeping cutoff
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400 * intensity, t);
    filter.frequency.exponentialRampToValueAtTime(30, t + duration);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.9 * intensity, t);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noiseSource.connect(filter);
    filter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);

    noiseSource.start(t);
  }
}
