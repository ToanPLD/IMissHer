import { calculateSchwarzschildRadius } from '../utils/physics.js';

/**
 * Sci-Fi HUD Controls Deck (Left Panel)
 */
export class HUD {
  /**
   * @param {HTMLElement} container
   * @param {Object} stateManager
   * @param {Object} sceneManager
   */
  constructor(container, stateManager, sceneManager) {
    this.container = container;
    this.stateManager = stateManager;
    this.sceneManager = sceneManager;
    this.isCollapsed = false;

    this.render();
    this.bindEvents();

    this.stateManager.subscribe((state) => {
      this.updateUI(state);
    });
  }

  render() {
    this.container.innerHTML = `
      <div id="hud-deck" class="glass-panel w-72 md:w-80 p-4 md:p-5 rounded-2xl border border-cyan-500/25 text-slate-200 shadow-2xl transition-all">
        <!-- Deck Header -->
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
            <h2 class="text-xs md:text-sm font-bold font-mono tracking-wider uppercase text-cyan-300">Bảng Tham Số Vật Lý</h2>
          </div>
          <button id="collapse-hud-btn" class="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Thu gọn">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>

        <div id="hud-controls-body" class="space-y-4">
          <!-- Mass Slider -->
          <div>
            <div class="flex justify-between items-center text-xs mb-1 font-mono">
              <span class="text-slate-400">Khối lượng (M):</span>
              <span id="mass-val" class="font-bold text-amber-300">10 M☉</span>
            </div>
            <input
              id="mass-slider"
              type="range"
              min="3"
              max="60"
              step="1"
              value="10"
              class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>Bán kính Rs:</span>
              <span id="rs-km-val">~29.5 km</span>
            </div>
          </div>

          <!-- Spin Parameter (a) Slider -->
          <div>
            <div class="flex justify-between items-center text-xs mb-1 font-mono">
              <span class="text-slate-400">Độ Tự Quay Spin (a):</span>
              <span id="spin-val" class="font-bold text-cyan-300">0.90</span>
            </div>
            <input
              id="spin-slider"
              type="range"
              min="0"
              max="0.998"
              step="0.01"
              value="0.9"
              class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>Hố đen Schwarzschild (0.0)</span>
              <span>Cực đại Kerr (0.998)</span>
            </div>
          </div>

          <!-- Accretion Density Slider -->
          <div>
            <div class="flex justify-between items-center text-xs mb-1 font-mono">
              <span class="text-slate-400">Mật Độ Bồi Tụ:</span>
              <span id="density-val" class="font-bold text-cyan-300">1.0x</span>
            </div>
            <input
              id="density-slider"
              type="range"
              min="0.1"
              max="2.5"
              step="0.1"
              value="1.0"
              class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
          </div>

          <!-- Toggles -->
          <div class="pt-2 border-t border-cyan-500/15 space-y-2.5">
            <!-- Doppler Beaming Toggle -->
            <label class="flex items-center justify-between cursor-pointer group">
              <span class="text-xs text-slate-300 group-hover:text-white transition-colors">Doppler Beaming (Bất đối xứng)</span>
              <input id="doppler-toggle" type="checkbox" checked class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>

            <!-- Cutaway Mode Toggle -->
            <label class="flex items-center justify-between cursor-pointer group">
              <span class="text-xs text-slate-300 group-hover:text-white transition-colors">Lát Cắt 90° (Soi Điểm Kỳ Dị)</span>
              <input id="cutaway-toggle" type="checkbox" class="sr-only peer" />
              <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <!-- Reset Camera Button -->
          <div class="pt-2">
            <button id="reset-cam-btn" class="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center space-x-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Đặt lại Góc Nhìn Camera</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.massSlider = this.container.querySelector('#mass-slider');
    this.massVal = this.container.querySelector('#mass-val');
    this.rsKmVal = this.container.querySelector('#rs-km-val');

    this.spinSlider = this.container.querySelector('#spin-slider');
    this.spinVal = this.container.querySelector('#spin-val');

    this.densitySlider = this.container.querySelector('#density-slider');
    this.densityVal = this.container.querySelector('#density-val');

    this.dopplerToggle = this.container.querySelector('#doppler-toggle');
    this.cutawayToggle = this.container.querySelector('#cutaway-toggle');
    this.resetCamBtn = this.container.querySelector('#reset-cam-btn');
    this.collapseBtn = this.container.querySelector('#collapse-hud-btn');
    this.controlsBody = this.container.querySelector('#hud-controls-body');

    // Mass
    this.massSlider.addEventListener('input', (e) => {
      const mass = parseFloat(e.target.value);
      this.stateManager.setState({ mass });
    });

    // Spin
    this.spinSlider.addEventListener('input', (e) => {
      const spin = parseFloat(e.target.value);
      this.stateManager.setState({ spin });
    });

    // Density
    this.densitySlider.addEventListener('input', (e) => {
      const accretionDensity = parseFloat(e.target.value);
      this.stateManager.setState({ accretionDensity });
    });

    // Doppler
    this.dopplerToggle.addEventListener('change', (e) => {
      this.stateManager.setState({ dopplerEnabled: e.target.checked });
    });

    // Cutaway
    this.cutawayToggle.addEventListener('change', (e) => {
      this.stateManager.setState({ cutawayEnabled: e.target.checked });
    });

    // Reset Camera
    this.resetCamBtn.addEventListener('click', () => {
      this.sceneManager.camera.position.set(0, 3.5, 14.0);
      this.sceneManager.controls.target.set(0, 0, 0);
    });

    // Collapse
    this.collapseBtn.addEventListener('click', () => {
      this.isCollapsed = !this.isCollapsed;
      this.controlsBody.classList.toggle('hidden', this.isCollapsed);
    });
  }

  updateUI(state) {
    if (this.massVal) {
      this.massVal.textContent = `${state.mass} M☉`;
      // Rs = 2.95 km per solar mass
      const km = (state.mass * 2.95).toFixed(1);
      this.rsKmVal.textContent = `~${km} km`;
    }
    if (this.spinVal) {
      this.spinVal.textContent = state.spin.toFixed(2);
    }
    if (this.densityVal) {
      this.densityVal.textContent = `${state.accretionDensity.toFixed(1)}x`;
    }
    if (this.dopplerToggle) {
      this.dopplerToggle.checked = !!state.dopplerEnabled;
    }
    if (this.cutawayToggle) {
      this.cutawayToggle.checked = !!state.cutawayEnabled;
    }
  }
}
