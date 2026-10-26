/**
 * Timeline Scrubber and Controls for Genesis (Black Hole Birth) Mode
 */
export class TimelineBar {
  /**
   * @param {HTMLElement} container
   * @param {Object} stateManager
   */
  constructor(container, stateManager) {
    this.container = container;
    this.stateManager = stateManager;
    this.isPlaying = false;
    this.playSpeed = 0.08; // Progress per second

    this.render();
    this.bindEvents();

    this.stateManager.subscribe((state) => {
      this.updateUI(state);
    });
  }

  render() {
    this.container.innerHTML = `
      <div id="timeline-panel" class="glass-panel p-3.5 md:p-4 rounded-2xl border border-cyan-500/25 shadow-2xl transition-all">
        <!-- Stage Markers Bar -->
        <div class="grid grid-cols-4 gap-1.5 md:gap-3 mb-2 text-center">
          <button data-stage="0" class="stage-btn px-2 py-1.5 rounded-lg text-[10px] md:text-xs font-mono font-semibold transition-all bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30">
            1. Sao Khổng Lồ
          </button>
          <button data-stage="0.28" class="stage-btn px-2 py-1.5 rounded-lg text-[10px] md:text-xs font-mono font-semibold transition-all bg-black/40 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10">
            2. Co Rút Lõi
          </button>
          <button data-stage="0.48" class="stage-btn px-2 py-1.5 rounded-lg text-[10px] md:text-xs font-mono font-semibold transition-all bg-black/40 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10">
            3. Siêu Tân Tinh
          </button>
          <button data-stage="0.78" class="stage-btn px-2 py-1.5 rounded-lg text-[10px] md:text-xs font-mono font-semibold transition-all bg-black/40 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10">
            4. Hố Đen Khởi Sinh
          </button>
        </div>

        <!-- Scrubber & Play Controls -->
        <div class="flex items-center space-x-3 pt-1">
          <!-- Play / Pause Button -->
          <button id="timeline-play-btn" class="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-cyan-300 transition-all focus:outline-none shadow-md">
            <svg id="play-icon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
            <svg id="pause-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
          </button>

          <!-- Timeline Track Slider -->
          <div class="relative flex-1 flex items-center">
            <input
              id="timeline-slider"
              type="range"
              min="0"
              max="1"
              step="0.001"
              value="0"
              class="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
          </div>

          <!-- Progress Percentage -->
          <span id="timeline-pct" class="text-xs font-mono font-bold text-cyan-300 w-12 text-right">
            0%
          </span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.slider = this.container.querySelector('#timeline-slider');
    this.playBtn = this.container.querySelector('#timeline-play-btn');
    this.playIcon = this.container.querySelector('#play-icon');
    this.pauseIcon = this.container.querySelector('#pause-icon');
    this.pctLabel = this.container.querySelector('#timeline-pct');
    this.stageBtns = this.container.querySelectorAll('.stage-btn');

    this.slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.stateManager.setState({ timelineProgress: val });
    });

    this.playBtn.addEventListener('click', () => {
      this.togglePlay();
    });

    this.stageBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const stageProgress = parseFloat(btn.getAttribute('data-stage'));
        this.stateManager.setState({ timelineProgress: stageProgress });
      });
    });
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.stateManager.setState({ isPlaying: this.isPlaying });
    if (this.isPlaying) {
      this.playIcon.classList.add('hidden');
      this.pauseIcon.classList.remove('hidden');
    } else {
      this.playIcon.classList.remove('hidden');
      this.pauseIcon.classList.add('hidden');
    }
  }

  /**
   * Called per frame from main animation loop
   * @param {number} delta
   */
  tick(delta) {
    if (!this.isPlaying) return;

    let nextProgress = this.stateManager.getState().timelineProgress + delta * this.playSpeed;
    if (nextProgress >= 1.0) {
      nextProgress = 1.0;
      this.isPlaying = false;
      this.playIcon.classList.remove('hidden');
      this.pauseIcon.classList.add('hidden');
    }
    this.stateManager.setState({ timelineProgress: nextProgress, isPlaying: this.isPlaying });
  }

  updateUI(state) {
    const isGenesis = state.mode === 'genesis';
    this.container.style.display = isGenesis ? 'block' : 'none';
    if (!isGenesis) return;

    const p = state.timelineProgress ?? 0;
    if (this.slider && document.activeElement !== this.slider) {
      this.slider.value = p;
    }
    if (this.pctLabel) {
      this.pctLabel.textContent = `${Math.round(p * 100)}%`;
    }

    // Highlight active stage button
    this.stageBtns.forEach(btn => {
      const stageP = parseFloat(btn.getAttribute('data-stage'));
      let isActive = false;
      if (stageP === 0 && p < 0.25) isActive = true;
      else if (stageP === 0.28 && p >= 0.25 && p < 0.45) isActive = true;
      else if (stageP === 0.48 && p >= 0.45 && p < 0.72) isActive = true;
      else if (stageP === 0.78 && p >= 0.72) isActive = true;

      if (isActive) {
        btn.className = 'stage-btn px-2 py-1.5 rounded-lg text-[10px] md:text-xs font-mono font-semibold transition-all bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]';
      } else {
        btn.className = 'stage-btn px-2 py-1.5 rounded-lg text-[10px] md:text-xs font-mono font-semibold transition-all bg-black/40 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10';
      }
    });
  }
}
