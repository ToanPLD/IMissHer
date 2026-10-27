import { CAMERA_PRESETS } from '../core/SceneManager.js';

/**
 * Pure Cinematic Minimal HUD
 * Follows strict requirement: "No text, no typography, no logos, no watermark, no interface elements"
 * Canvas is 100% pure visual by default. Controls are hidden and accessible via subtle hotkeys or micro-trigger.
 */
export class CinematicHUD {
  /**
   * @param {HTMLElement} container
   * @param {Object} sceneManager
   * @param {Object} celestialSystem
   * @param {Object} audioController
   */
  constructor(container, sceneManager, celestialSystem, audioController) {
    this.container = container;
    this.sceneManager = sceneManager;
    this.celestialSystem = celestialSystem;
    this.audioController = audioController;

    this.isMenuVisible = false;
    this.isAutoPilot = true;
    this.activeCameraKey = 'cinematic';

    this.render();
    this.bindEvents();
    this.bindKeyboardShortcuts();
  }

  render() {
    this.container.innerHTML = `
      <!-- Anamorphic Letterbox Bars (Permanent 2.39:1 Cinema Ratio) -->
      <div id="letterbox-top" class="fixed top-0 left-0 right-0 h-10 md:h-14 bg-black z-40 pointer-events-none transition-all duration-700"></div>
      <div id="letterbox-bottom" class="fixed bottom-0 left-0 right-0 h-10 md:h-14 bg-black z-40 pointer-events-none transition-all duration-700"></div>

      <!-- Ultra-Minimal, Hidden-by-Default Floating Control Drawer -->
      <div id="hud-drawer" class="fixed bottom-16 right-6 z-50 pointer-events-none opacity-0 transition-all duration-500 transform translate-y-3">
        <div class="pointer-events-auto bg-black/60 backdrop-blur-xl p-3 rounded-2xl border border-amber-300/25 shadow-2xl space-y-2.5">
          <!-- Camera Presets -->
          <div class="flex items-center space-x-1.5">
            <button data-camera="cinematic" class="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-amber-400/20 text-amber-200 border border-amber-400/35 hover:bg-amber-400/30 transition-all">
              1. Masterpiece (Ảnh)
            </button>
            <button data-camera="ringDrift" class="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all">
              2. Vành Đai Băng
            </button>
            <button data-camera="solarEclipse" class="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all">
              3. Nhật Thực
            </button>
            <button data-camera="sisterPlanet" class="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all">
              4. Hành Tinh Xanh
            </button>
          </div>

          <!-- Controls row -->
          <div class="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] font-mono text-slate-400">
            <button id="toggle-audio-btn" class="hover:text-amber-300 transition-colors flex items-center space-x-1">
              <span>✦</span>
              <span id="audio-label">Âm Nhạc (Phím M)</span>
            </button>
            <span class="text-[10px] text-slate-500">Phím 1-4: Góc quay | Space: Tự hành</span>
          </div>
        </div>
      </div>

      <!-- Micro Trigger Dot at bottom-right (Virtually invisible until hovered) -->
      <button id="micro-trigger" class="fixed bottom-3 right-4 z-50 pointer-events-auto w-4 h-4 rounded-full bg-amber-400/20 hover:bg-amber-400/60 border border-amber-300/40 transition-all opacity-25 hover:opacity-100 flex items-center justify-center cursor-pointer" title="Phím tắt: H để mở bảng điều khiển">
        <span class="w-1 h-1 rounded-full bg-amber-300"></span>
      </button>
    `;
  }

  bindEvents() {
    this.drawer = this.container.querySelector('#hud-drawer');
    this.microTrigger = this.container.querySelector('#micro-trigger');
    this.audioBtn = this.container.querySelector('#toggle-audio-btn');
    this.audioLabel = this.container.querySelector('#audio-label');
    this.camBtns = this.container.querySelectorAll('[data-camera]');

    // Micro trigger toggle
    this.microTrigger.addEventListener('click', () => {
      this.toggleDrawer();
    });

    // Camera preset clicks
    this.camBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-camera');
        this.selectCamera(key);
      });
    });

    // Audio toggle
    this.audioBtn.addEventListener('click', async () => {
      await this.toggleAudio();
    });
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', async (e) => {
      const key = e.key.toLowerCase();

      if (key === 'h') {
        this.toggleDrawer();
      } else if (key === 'm') {
        await this.toggleAudio();
      } else if (key === '1') {
        this.selectCamera('cinematic');
      } else if (key === '2') {
        this.selectCamera('ringDrift');
      } else if (key === '3') {
        this.selectCamera('solarEclipse');
      } else if (key === '4') {
        this.selectCamera('sisterPlanet');
      } else if (key === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    });
  }

  toggleDrawer() {
    this.isMenuVisible = !this.isMenuVisible;
    if (this.isMenuVisible) {
      this.drawer.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
      this.drawer.classList.add('opacity-100', 'translate-y-0');
    } else {
      this.drawer.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
      this.drawer.classList.remove('opacity-100', 'translate-y-0');
    }
  }

  selectCamera(key) {
    this.activeCameraKey = key;
    this.sceneManager.setCameraPreset(key);

    this.camBtns.forEach(btn => {
      const bKey = btn.getAttribute('data-camera');
      if (bKey === key) {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-amber-400/25 text-amber-200 border border-amber-400/40 shadow-md';
      } else {
        btn.className = 'px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all';
      }
    });
  }

  async toggleAudio() {
    await this.audioController.init();
    const isPlaying = this.audioController.toggle();
    if (this.audioLabel) {
      this.audioLabel.textContent = isPlaying ? "Âm Nhạc: Đang phát" : "Âm Nhạc: Tắt";
    }
  }
}
