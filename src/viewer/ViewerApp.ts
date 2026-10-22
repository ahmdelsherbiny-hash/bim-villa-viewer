import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { CameraManager, CameraPreset } from './CameraManager';
import { MaterialLibrary } from '../building/MaterialLibrary';
import { VillaBuilder } from '../building/VillaBuilder';

export class ViewerApp {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public sceneManager: SceneManager;
  public cameraManager: CameraManager;
  public materialLibrary: MaterialLibrary;
  public villaBuilder: VillaBuilder;
  public villaRoot: THREE.Group | null = null;

  private isRunning = false;
  private reqId: number | null = null;

  // Performance & HUD tracking
  private lastFpsUpdate = 0;
  private frameCount = 0;
  private fpsDisplay: HTMLElement | null = null;
  private coordsDisplay: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Initialize WebGL Renderer with professional architectural settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Initialize Scene and Environment
    this.sceneManager = new SceneManager();

    // 3. Initialize Camera and Controls
    const aspect = container.clientWidth / container.clientHeight;
    this.cameraManager = new CameraManager(this.renderer.domElement, aspect);

    // 4. Initialize Materials and Procedural Villa
    this.materialLibrary = new MaterialLibrary();
    this.villaBuilder = new VillaBuilder(this.materialLibrary);
    this.loadVilla();

    // 5. Connect UI element references
    this.fpsDisplay = document.getElementById('fps-counter');
    this.coordsDisplay = document.getElementById('camera-coords');

    // 6. Setup event listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));

    // 7. Start render loop
    this.start();
  }

  private loadVilla() {
    this.villaRoot = this.villaBuilder.buildVilla();
    this.sceneManager.scene.add(this.villaRoot);
    console.log('Modern Villa 3D Architecture loaded successfully.');
  }

  private onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.cameraManager.setAspect(width / height);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'r' || e.key === 'R') {
      this.resetView();
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    this.cameraManager.transitionToPreset(preset);
  }

  public resetView() {
    this.cameraManager.resetView();
  }

  public toggleGrid(): boolean {
    const isVisible = !this.sceneManager.gridHelper.visible;
    this.sceneManager.setGridVisible(isVisible);
    return isVisible;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFpsUpdate = performance.now();
    this.frameCount = 0;

    const animate = (time: number) => {
      this.reqId = requestAnimationFrame(animate);

      // Update camera transitions & orbit damping
      this.cameraManager.update(time);

      // Render 3D Scene
      this.renderer.render(this.sceneManager.scene, this.cameraManager.camera);

      // Update FPS and Coordinates HUD
      this.updateHudMetrics(time);
    };

    this.reqId = requestAnimationFrame(animate);
  }

  private updateHudMetrics(time: number) {
    this.frameCount++;
    if (time - this.lastFpsUpdate >= 500) {
      const fps = Math.round((this.frameCount * 1000) / (time - this.lastFpsUpdate));
      if (this.fpsDisplay) {
        this.fpsDisplay.textContent = `${fps} FPS`;
      }
      this.frameCount = 0;
      this.lastFpsUpdate = time;
    }

    if (this.coordsDisplay) {
      this.coordsDisplay.textContent = this.cameraManager.getCoordinatesString();
    }
  }

  public stop() {
    if (this.reqId !== null) {
      cancelAnimationFrame(this.reqId);
      this.reqId = null;
    }
    this.isRunning = false;
  }

  public dispose() {
    this.stop();
    window.removeEventListener('resize', this.onResize.bind(this));
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    this.materialLibrary.dispose();
    this.renderer.dispose();
  }
}
