import { describe, it, expect, vi } from 'vitest';
import { RomanticAudioController } from '../src/utils/romanticAudio.js';

describe('RomanticAudioController', () => {
  it('initializes chord progression and soundscape parameters', () => {
    const audio = new RomanticAudioController();
    expect(audio.chords.length).toBe(4);
    expect(audio.currentChordIndex).toBe(0);
    expect(audio.isPlaying).toBe(false);
  });

  it('cycles chord indices properly', () => {
    const audio = new RomanticAudioController();
    expect(audio.chords[0][0]).toBeCloseTo(130.81, 2); // C3
    expect(audio.chords[1][0]).toBeCloseTo(110.00, 2); // A2
  });
});
