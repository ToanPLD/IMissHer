import { ANATOMY_DATA } from '../anatomy/anatomyData.js';

/**
 * Slide-in Scientific Information Card for Selected Black Hole Anatomy Component
 */
export class InfoCard {
  /**
   * @param {HTMLElement} container
   * @param {Object} stateManager
   * @param {Object} hotspotManager
   */
  constructor(container, stateManager, hotspotManager) {
    this.container = container;
    this.stateManager = stateManager;
    this.hotspotManager = hotspotManager;
    this.currentHotspotId = null;

    this.render();
    this.stateManager.subscribe((state) => {
      if (state.selectedHotspotId !== this.currentHotspotId) {
        this.currentHotspotId = state.selectedHotspotId;
        this.render();
      }
    });
  }

  render() {
    if (!this.currentHotspotId) {
      this.container.innerHTML = '';
      return;
    }

    const item = ANATOMY_DATA.find(d => d.id === this.currentHotspotId);
    if (!item) {
      this.container.innerHTML = '';
      return;
    }

    this.container.innerHTML = `
      <div class="glass-panel w-80 md:w-96 p-5 rounded-2xl border border-cyan-400/30 text-slate-100 shadow-2xl animate-fade-in pointer-events-auto">
        <!-- Header -->
        <div class="flex items-start justify-between pb-3 border-b border-cyan-500/20">
          <div>
            <span class="inline-block px-2 py-0.5 mb-1.5 text-[10px] font-mono tracking-wider uppercase font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              ${item.badge}
            </span>
            <h3 class="text-base md:text-lg font-bold text-white tracking-wide leading-tight">
              ${item.name}
            </h3>
          </div>
          <button id="close-infocard-btn" class="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Đóng">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Formula Banner -->
        <div class="my-3.5 px-3 py-2 rounded-lg bg-black/60 border border-cyan-500/20 flex items-center justify-between">
          <span class="text-xs text-slate-400 font-mono">Công thức vật lý:</span>
          <code class="text-xs md:text-sm font-mono font-bold text-amber-300 tracking-wider">
            ${item.formula}
          </code>
        </div>

        <!-- Description -->
        <p class="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
          ${item.description}
        </p>

        <!-- Fun Fact Callout -->
        <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-200 text-xs leading-normal flex items-start space-x-2.5">
          <span class="text-base leading-none">💡</span>
          <div>
            <strong class="font-semibold text-amber-300 block mb-0.5">Bạn có biết?</strong>
            <span>${item.funFact}</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="mt-4 flex space-x-2">
          <button id="focus-camera-btn" class="w-full py-2 px-3 rounded-xl bg-cyan-500/25 hover:bg-cyan-500/40 border border-cyan-400/40 text-cyan-300 text-xs font-semibold tracking-wider transition-all flex items-center justify-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            <span>Lấy nét Góc nhìn</span>
          </button>
        </div>
      </div>
    `;

    // Bind events
    const closeBtn = this.container.querySelector('#close-infocard-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.stateManager.setState({ selectedHotspotId: null });
      });
    }

    const focusBtn = this.container.querySelector('#focus-camera-btn');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        this.hotspotManager.selectHotspot(this.currentHotspotId);
      });
    }
  }
}
