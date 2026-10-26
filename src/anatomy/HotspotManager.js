import * as THREE from 'three';
import { ANATOMY_DATA } from './anatomyData.js';
import { calculateSchwarzschildRadius } from '../utils/physics.js';

/**
 * Manages 3D Hotspot markers projected into screen space
 */
export class HotspotManager {
  /**
   * @param {HTMLElement} container - Layer container for HTML hotspot elements
   * @param {THREE.Camera} camera
   * @param {Object} controls - OrbitControls instance
   * @param {Object} stateManager
   */
  constructor(container, camera, controls, stateManager) {
    this.container = container;
    this.camera = camera;
    this.controls = controls;
    this.stateManager = stateManager;

    this.hotspots = [];
    this.isTransitioningCamera = false;
    this.cameraStartPos = new THREE.Vector3();
    this.cameraEndPos = new THREE.Vector3();
    this.targetStartPos = new THREE.Vector3();
    this.targetEndPos = new THREE.Vector3();
    this.transitionProgress = 0.0;

    this.initHotspots();
  }

  initHotspots() {
    this.container.innerHTML = '';
    this.hotspots = ANATOMY_DATA.map(data => {
      // Create DOM element for marker
      const el = document.createElement('button');
      el.className = 'absolute -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 group cursor-pointer pointer-events-auto transition-transform duration-200 hover:scale-110 focus:outline-none';
      el.setAttribute('data-hotspot-id', data.id);

      el.innerHTML = `
        <div class="relative flex items-center justify-center w-6 h-6">
          <div class="absolute inset-0 rounded-full border border-cyan-400 radar-ring"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] group-hover:bg-amber-400 group-hover:shadow-[0_0_12px_#ff9d00] transition-colors"></div>
        </div>
        <div class="px-2 py-1 rounded-md glass-panel text-[11px] font-mono text-cyan-300 opacity-90 group-hover:opacity-100 group-hover:text-amber-300 group-hover:border-amber-400/40 transition-all whitespace-nowrap shadow-md">
          ${data.badge}
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectHotspot(data.id);
      });

      this.container.appendChild(el);

      return {
        data,
        element: el,
        worldPosition: new THREE.Vector3()
      };
    });
  }

  /**
   * Selects a hotspot, triggers camera tween and updates state
   * @param {string} id
   */
  selectHotspot(id) {
    const item = this.hotspots.find(h => h.data.id === id);
    if (!item) return;

    this.stateManager.setState({ selectedHotspotId: id });

    // Initiate smooth camera glide
    this.cameraStartPos.copy(this.camera.position);
    this.targetStartPos.copy(this.controls.target);

    const rs = calculateSchwarzschildRadius(this.stateManager.getState().mass || 10.0);
    const targetOffset = item.data.cameraOffset;

    this.cameraEndPos.set(
      targetOffset.x * (rs / 2.0),
      targetOffset.y * (rs / 2.0),
      targetOffset.z * (rs / 2.0)
    );
    this.targetEndPos.copy(item.worldPosition);

    this.isTransitioningCamera = true;
    this.transitionProgress = 0.0;
  }

  /**
   * Updates positions and visibility every frame
   * @param {number} delta
   * @param {Object} state
   */
  update(delta, state) {
    // Only visible in anatomy mode
    const isAnatomy = state.mode === 'anatomy';
    this.container.style.display = isAnatomy ? 'block' : 'none';
    if (!isAnatomy) return;

    const rs = calculateSchwarzschildRadius(state.mass || 10.0);
    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    const tempVec = new THREE.Vector3();

    this.hotspots.forEach((h, index) => {
      // Calculate 3D position based on relativeRadius and Rs
      const r = h.data.relativeRadius * rs;
      // Stagger angle around the disk so markers don't overlap in 3D
      const angle = (index * (Math.PI * 2.0) / this.hotspots.length) + 0.35;
      
      if (h.data.id === 'singularity') {
        h.worldPosition.set(0, 0, 0);
      } else {
        h.worldPosition.set(Math.cos(angle) * r, 0.15, Math.sin(angle) * r);
      }

      tempVec.copy(h.worldPosition);
      tempVec.project(this.camera);

      // Check if point is behind camera
      if (tempVec.z > 1.0) {
        h.element.style.display = 'none';
      } else {
        const x = (tempVec.x * widthHalf) + widthHalf;
        const y = -(tempVec.y * heightHalf) + heightHalf;

        h.element.style.display = 'flex';
        h.element.style.left = `${x}px`;
        h.element.style.top = `${y}px`;
      }
    });

    // Handle smooth camera interpolation
    if (this.isTransitioningCamera) {
      this.transitionProgress += delta * 1.5;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioningCamera = false;
      }

      // Cubic ease-out
      const t = 1.0 - Math.pow(1.0 - this.transitionProgress, 3.0);
      this.camera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, t);
      this.controls.target.lerpVectors(this.targetStartPos, this.targetEndPos, t);
    }
  }

  dispose() {
    this.container.innerHTML = '';
    this.hotspots = [];
  }
}
