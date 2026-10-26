import { CAMERA_PRESETS } from '../core/SceneManager.js';

/**
 * Cinematic Luxury HUD with Cinema Mode, Camera Director, and Romantic Sci-Fi Controls
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

    this.isCinemaMode = false;
    this.isAutoHiding = false;
    this.autoHideTimer = null;
    this.activeCameraKey = 'cinematic';

    this.render();
    this.bindEvents();
    this.initAutoHide();
  }

  render() {
    this.container.innerHTML = `
      <!-- Anamorphic Cinema Letterbox Bars (Top & Bottom) -->
      <div id="letterbox-top" class="fixed top-0 left-0 right-0 h-0 bg-black z-40 transition-all duration-700 pointer-events-none"></div>
      <div id="letterbox-bottom" class="fixed bottom-0 left-0 right-0 h-0 bg-black z-40 transition-all duration-700 pointer-events-none"></div>

      <!-- Main HUD Shell -->
      <div id="hud-shell" class="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 md:p-8 transition-opacity duration-700 opacity-100">
        
        <!-- Header: Romantic Brand & Atmosphere Status -->
        <header class="flex items-start justify-between">
          <div class="pointer-events-auto flex items-center space-x-3.5 bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-amber-300/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div class="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_#ffb86c]"></div>
            <div>
              <h1 class="text-base md:text-lg font-serif tracking-[0.25em] uppercase text-amber-200 font-bold leading-tight">
                I MISS HER
              </h1>
              <p class="text-[10px] md:text-xs text-slate-400 font-mono tracking-wider">
                Vũ Khúc Vành Đai Không-Thời Gian • Saturnine Romance
              </p>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="pointer-events-auto flex items-center space-x-2">
            <!-- Cinema Mode Button -->
            <button id="toggle-cinema-btn" class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-amber-400/25 text-amber-200 hover:text-white transition-all shadow-lg group" title="Bật/Tắt Chế Độ Điện Ảnh (Ẩn UI)">
              <svg class="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span class="text-xs font-mono font-medium hidden md:inline">Chế Độ Điện Ảnh</span>
            </button>

            <!-- Music Player Toggle -->
            <button id="toggle-music-btn" class="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-amber-400/25 text-amber-200 hover:text-white transition-all shadow-lg group" title="Bật/Tắt Giai Điệu Vũ Trụ">
              <!-- Soundwave animated bars -->
              <div class="flex items-end space-x-0.5 h-3.5 w-3.5">
                <span class="music-bar w-0.5 h-2 bg-amber-400 rounded-full"></span>
                <span class="music-bar w-0.5 h-3.5 bg-amber-300 rounded-full"></span>
                <span class="music-bar w-0.5 h-1.5 bg-amber-400 rounded-full"></span>
              </div>
              <span id="music-text" class="text-xs font-mono font-medium hidden md:inline">Nhạc Nền</span>
            </button>
          </div>
        </header>

        <!-- Center Camera Director Selector (Floating Bar) -->
        <div class="pointer-events-auto mx-auto mb-2 flex items-center space-x-1.5 md:space-x-2 p-1.5 rounded-2xl bg-black/50 backdrop-blur-xl border border-amber-400/20 shadow-2xl">
          <button data-camera="cinematic" class="cam-btn active-cam px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center space-x-1.5 bg-amber-400/25 text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(255,184,108,0.25)]">
            <span>🪐</span>
            <span>Góc Điện Ảnh (Ảnh)</span>
          </button>
          <button data-camera="ringDrift" class="cam-btn px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1.5">
            <span>❄️</span>
            <span>Vành Đai Băng</span>
          </button>
          <button data-camera="solarEclipse" class="cam-btn px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1.5">
            <span>🌒</span>
            <span>Nhật Thực</span>
          </button>
          <button data-camera="sisterPlanet" class="cam-btn px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1.5">
            <span>💫</span>
            <span>Hành Tinh Phụ</span>
          </button>
          <button data-camera="titanMoon" class="cam-btn px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1.5">
            <span>🌕</span>
            <span>Mặt Trăng Titan</span>
          </button>
        </div>

        <!-- Footer: Romantic Elegy & Lighting Tweak Slider -->
        <footer class="flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
          <!-- Romantic Quote (Poetic Sci-Fi Theme) -->
          <div class="pointer-events-auto max-w-lg bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-serif italic leading-relaxed">
            <span class="text-amber-300 font-bold not-italic font-mono text-[11px] block mb-0.5">✦ ELEGY IN DEEP SPACE</span>
            “Dù cách nhau hàng triệu năm ánh sáng, lực hấp dẫn và nỗi nhớ vẫn là thứ duy nhất có thể vượt qua không-thời gian để tìm về bên em.”
          </div>

          <!-- Atmosphere & Bloom Controls Pill -->
          <div class="pointer-events-auto flex items-center space-x-4 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-400/20 text-xs font-mono text-slate-300">
            <div class="flex items-center space-x-2">
              <span class="text-amber-300">Ánh Hào Quang:</span>
              <input id="bloom-slider" type="range" min="0.2" max="1.8" step="0.05" value="0.75" class="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400" />
            </div>
            <div class="flex items-center space-x-1 text-[11px] text-slate-400">
              <span>Chuột: Xoay / Cuộn: Zoom</span>
            </div>
          </div>
        </footer>

      </div>

      <!-- Quick wake up indicator when UI is hidden -->
      <div id="cinema-hint" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-0 transition-opacity duration-500 text-[11px] font-mono text-amber-200/60 bg-black/50 px-3 py-1 rounded-full border border-amber-400/20">
        Di chuyển chuột để hiện lại bảng điều khiển
      </div>
    `;
  }

  bindEvents() {
    this.hudShell = this.container.querySelector('#hud-shell');
    this.letterboxTop = this.container.querySelector('#letterbox-top');
    this.letterboxBottom = this.container.querySelector('#letterbox-bottom');
    this.cinemaBtn = this.container.querySelector('#toggle-cinema-btn');
    this.musicBtn = this.container.querySelector('#toggle-music-btn');
    this.musicText = this.container.querySelector('#music-text');
    this.musicBars = this.container.querySelectorAll('.music-bar');
    this.camBtns = this.container.querySelectorAll('.cam-btn');
    this.bloomSlider = this.container.querySelector('#bloom-slider');
    this.cinemaHint = this.container.querySelector('#cinema-hint');

    // Camera presets click
    this.camBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-camera');
        this.selectCamera(key);
      });
    });

    // Cinema Mode Toggle (Widescreen 2.39:1 bars + UI fade)
    this.cinemaBtn.addEventListener('click', () => {
      this.toggleCinemaMode();
    });

    // Music Toggle
    this.musicBtn.addEventListener('click', async () => {
      await this.audioController.init();
      const isPlaying = this.audioController.toggle();
      this.updateMusicUI(isPlaying);
    });

    // Bloom Glow Slider
    this.bloomSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.sceneManager.setBloomStrength(val);
    });
  }

  selectCamera(key) {
    this.activeCameraKey = key;
    this.sceneManager.setCameraPreset(key);

    this.camBtns.forEach(btn => {
      const bKey = btn.getAttribute('data-camera');
      if (bKey === key) {
        btn.className = 'cam-btn px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center space-x-1.5 bg-amber-400/25 text-amber-200 border border-amber-400/40 shadow-[0_0_12px_rgba(255,184,108,0.25)]';
      } else {
        btn.className = 'cam-btn px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1.5';
      }
    });
  }

  toggleCinemaMode() {
    this.isCinemaMode = !this.isCinemaMode;

    if (this.isCinemaMode) {
      // Add cinematic letterbox bars (52px top & bottom)
      this.letterboxTop.style.height = '60px';
      this.letterboxBottom.style.height = '60px';
      // Fade out HUD
      this.hudShell.style.opacity = '0';
      this.hudShell.style.pointerEvents = 'none';
      this.cinemaHint.style.opacity = '1';
      setTimeout(() => {
        this.cinemaHint.style.opacity = '0';
      }, 3000);
    } else {
      this.letterboxTop.style.height = '0px';
      this.letterboxBottom.style.height = '0px';
      this.hudShell.style.opacity = '1';
      this.hudShell.style.pointerEvents = 'none';
      this.cinemaHint.style.opacity = '0';
    }
  }

  updateMusicUI(isPlaying) {
    if (isPlaying) {
      this.musicText.textContent = "Đang Phát";
      this.musicBars.forEach(b => b.classList.add('animate-pulse'));
      this.musicBtn.classList.add('border-amber-400', 'bg-amber-500/20');
    } else {
      this.musicText.textContent = "Nhạc Nền";
      this.musicBars.forEach(b => b.classList.remove('animate-pulse'));
      this.musicBtn.classList.remove('border-amber-400', 'bg-amber-500/20');
    }
  }

  initAutoHide() {
    // If not in cinema mode, hide UI after 4.5s of no interaction to maximize immersion
    const resetTimer = () => {
      if (this.isCinemaMode) return;

      this.hudShell.style.opacity = '1';
      clearTimeout(this.autoHideTimer);

      this.autoHideTimer = setTimeout(() => {
        if (!this.isCinemaMode) {
          this.hudShell.style.opacity = '0.15'; // Keep subtly visible on hover
        }
      }, 4500);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();
  }
}
