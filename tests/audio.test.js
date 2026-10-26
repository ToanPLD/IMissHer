import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CosmicAudioController } from '../src/utils/cosmicAudio.js';

describe('CosmicAudioController', () => {
  let controller;
  let mockAudioContext;

  beforeEach(() => {
    mockAudioContext = {
      state: 'suspended',
      resume: vi.fn().mockResolvedValue(),
      createGain: vi.fn(() => ({
        gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn()
      })),
      createOscillator: vi.fn(() => ({
        type: 'sine',
        frequency: { value: 440, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      })),
      createBiquadFilter: vi.fn(() => ({
        type: 'lowpass',
        frequency: { value: 200, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn()
      })),
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(1000))
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn()
      })),
      currentTime: 0,
      destination: {}
    };

    controller = new CosmicAudioController(mockAudioContext);
  });

  it('initializes audio context and resumes state', async () => {
    await controller.init();
    expect(mockAudioContext.resume).toHaveBeenCalled();
    expect(controller.isInitialized).toBe(true);
  });

  it('starts and stops cosmic drone oscillators', async () => {
    await controller.init();
    controller.startCosmicDrone();
    expect(controller.isPlayingDrone).toBe(true);

    controller.stopCosmicDrone();
    expect(controller.isPlayingDrone).toBe(false);
  });

  it('updates pitch based on mass ratio', async () => {
    await controller.init();
    controller.startCosmicDrone();
    // Larger mass -> deeper lower pitch
    controller.updatePitchByMass(2.0);
    expect(controller.currentBaseFreq).toBeLessThan(55);
  });

  it('triggers supernova rumble effect', async () => {
    await controller.init();
    controller.triggerSupernovaRumble(1.0);
    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
  });
});
