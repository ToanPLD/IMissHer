/**
 * Central State Manager for Black Hole Simulation
 */
export class StateManager {
  constructor(initialState = {}) {
    this.state = {
      mode: 'anatomy', // 'anatomy' | 'genesis'
      mass: 10.0,      // in solar masses
      spin: 0.9,      // Kerr parameter [0.0, 0.998]
      accretionDensity: 1.0,
      dopplerEnabled: true,
      cutawayEnabled: false,
      timelineProgress: 1.0, // 0.0 -> 1.0
      isPlaying: false,
      audioEnabled: false,
      selectedHotspotId: null,
      ...initialState
    };

    this.listeners = new Set();
  }

  /**
   * Returns a copy of current state
   * @returns {Object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Partially updates state and triggers listeners
   * @param {Object} partialState
   */
  setState(partialState) {
    const next = { ...this.state, ...partialState };

    // Clamps & constraints
    if ('timelineProgress' in next) {
      next.timelineProgress = Math.max(0.0, Math.min(1.0, next.timelineProgress));
    }
    if ('spin' in next) {
      next.spin = Math.max(0.0, Math.min(0.998, next.spin));
    }
    if ('mass' in next) {
      next.mass = Math.max(1.0, next.mass);
    }
    if ('accretionDensity' in next) {
      next.accretionDensity = Math.max(0.0, next.accretionDensity);
    }

    this.state = next;
    this.notify();
  }

  /**
   * Subscribes to state updates
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifies all registered listeners
   */
  notify() {
    const current = this.getState();
    this.listeners.forEach(cb => {
      try {
        cb(current);
      } catch (err) {
        console.error("StateManager listener error:", err);
      }
    });
  }
}
