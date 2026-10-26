import { describe, it, expect, vi } from 'vitest';
import { StateManager } from '../src/core/StateManager.js';

describe('StateManager', () => {
  it('initializes with default values', () => {
    const stateManager = new StateManager();
    const state = stateManager.getState();
    expect(state.mode).toBe('anatomy');
    expect(state.mass).toBe(10.0);
    expect(state.spin).toBe(0.9);
    expect(state.dopplerEnabled).toBe(true);
    expect(state.timelineProgress).toBe(1.0);
  });

  it('updates state and notifies subscribers', () => {
    const stateManager = new StateManager();
    const listener = vi.fn();
    const unsubscribe = stateManager.subscribe(listener);

    stateManager.setState({ mass: 25.0, mode: 'genesis' });

    expect(stateManager.getState().mass).toBe(25.0);
    expect(stateManager.getState().mode).toBe('genesis');
    expect(listener).toHaveBeenCalledWith(stateManager.getState());

    unsubscribe();
    stateManager.setState({ mass: 50.0 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('clamps timelineProgress to [0.0, 1.0]', () => {
    const stateManager = new StateManager();
    stateManager.setState({ timelineProgress: 1.5 });
    expect(stateManager.getState().timelineProgress).toBe(1.0);

    stateManager.setState({ timelineProgress: -0.2 });
    expect(stateManager.getState().timelineProgress).toBe(0.0);
  });
});
