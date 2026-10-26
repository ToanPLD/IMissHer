/**
 * Romantic Sci-Fi Cinematic Web Audio Synthesizer
 * Generates ambient celestial pads and falling starlight piano notes.
 * Inspired by Interstellar (Hans Zimmer) and Your Name (Radwimps).
 */
export class RomanticAudioController {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.masterGain = null;
    this.padGain = null;
    this.pianoGain = null;

    // Chord Progression in Hz:
    // Chord 1 (Cmaj7): C3 (130.81), E3 (164.81), G3 (196.00), B3 (246.94)
    // Chord 2 (Am9):   A2 (110.00), C3 (130.81), E3 (164.81), B3 (246.94)
    // Chord 3 (Fmaj7): F2 (87.31),  A2 (110.00), C3 (130.81), E3 (164.81)
    // Chord 4 (Gsus4): G2 (98.00),  C3 (130.81), D3 (146.83), G3 (196.00)
    this.chords = [
      [130.81, 164.81, 196.00, 246.94],
      [110.00, 130.81, 164.81, 246.94],
      [87.31,  110.00, 130.81, 164.81],
      [98.00,  130.81, 146.83, 196.00]
    ];
    this.currentChordIndex = 0;
    this.padOscillators = [];
    this.chordTimer = null;
    this.pianoTimer = null;
  }

  async init() {
    if (this.isInitialized) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Pad bus with low-pass warmth filter
    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.setValueAtTime(380, this.ctx.currentTime);

    this.padGain = this.ctx.createGain();
    this.padGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.padFilter.connect(this.padGain);
    this.padGain.connect(this.masterGain);

    // Piano bus with subtle delay
    this.pianoGain = this.ctx.createGain();
    this.pianoGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.pianoGain.connect(this.masterGain);

    this.isInitialized = true;
  }

  start() {
    if (!this.isInitialized || this.isPlaying) return;
    this.isPlaying = true;

    // Fade in Pad
    const t = this.ctx.currentTime;
    this.padGain.gain.setValueAtTime(0.001, t);
    this.padGain.gain.exponentialRampToValueAtTime(0.32, t + 3.0);

    this.playChord(this.currentChordIndex);

    // Progression changes every 8 seconds
    this.chordTimer = setInterval(() => {
      if (!this.isPlaying) return;
      this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
      this.playChord(this.currentChordIndex);
    }, 8000);

    // Sporadic celestial piano notes
    this.scheduleNextPianoNote();
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;
    this.isPlaying = false;

    clearInterval(this.chordTimer);
    clearTimeout(this.pianoTimer);

    const t = this.ctx.currentTime;
    this.padGain.gain.setValueAtTime(this.padGain.gain.value, t);
    this.padGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);

    setTimeout(() => {
      this.stopPadOscillators();
    }, 1600);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  playChord(index) {
    if (!this.ctx) return;
    const notes = this.chords[index];
    const t = this.ctx.currentTime;

    // Smoothly shift existing oscillators or create new ones
    if (this.padOscillators.length === 0) {
      this.padOscillators = notes.map((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.connect(this.padFilter);
        osc.start(t);
        return osc;
      });
    } else {
      this.padOscillators.forEach((osc, i) => {
        if (notes[i]) {
          osc.frequency.exponentialRampToValueAtTime(notes[i], t + 2.5);
        }
      });
    }
  }

  stopPadOscillators() {
    this.padOscillators.forEach(osc => {
      try { osc.stop(); } catch (_) {}
    });
    this.padOscillators = [];
  }

  scheduleNextPianoNote() {
    if (!this.isPlaying) return;

    // High pentatonic starlight frequencies: E5, G5, A5, B5, D6, E6
    const starlightNotes = [659.25, 783.99, 880.00, 987.77, 1174.66, 1318.51];
    const delay = 1800 + Math.random() * 2600;

    this.pianoTimer = setTimeout(() => {
      if (!this.isPlaying) return;
      const freq = starlightNotes[Math.floor(Math.random() * starlightNotes.length)];
      this.playPianoNote(freq);
      this.scheduleNextPianoNote();
    }, delay);
  }

  playPianoNote(freq) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    const noteGain = this.ctx.createGain();
    // Fast attack, slow lingering exponential decay
    noteGain.gain.setValueAtTime(0.001, t);
    noteGain.gain.linearRampToValueAtTime(0.25, t + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

    osc.connect(noteGain);
    noteGain.connect(this.pianoGain);

    osc.start(t);
    osc.stop(t + 3.4);
  }
}
