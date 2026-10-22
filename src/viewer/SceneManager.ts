import * as THREE from 'three';

export class SceneManager {
  public scene: THREE.Scene;
  public gridHelper: THREE.GridHelper;
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public ambientLight: THREE.AmbientLight;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Deep slate architectural background

    // Atmospheric subtle fog to give depth
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    // Setup Lighting & Environment
    const { sun, hemi, amb } = this.setupLighting();
    this.sunLight = sun;
    this.hemiLight = hemi;
    this.ambientLight = amb;

    // Architectural Ground Grid
    this.gridHelper = this.setupGrid();
    this.scene.add(this.gridHelper);
  }

  private setupLighting() {
    // 1. Primary Architectural Sun Light
    const sun = new THREE.DirectionalLight(0xfffbeb, 2.2); // Warm sunlight
    sun.position.set(24, 32, 20);
    sun.castShadow = true;

    // High fidelity shadow map parameters
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 100;
    const d = 26;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.00015;
    sun.shadow.normalBias = 0.02;

    this.scene.add(sun);

    // 2. Hemisphere Light (Simulates sky dome and warm ground reflection)
    const hemi = new THREE.HemisphereLight(0xbae6fd, 0x3f3f46, 0.85);
    hemi.position.set(0, 50, 0);
    this.scene.add(hemi);

    // 3. Subtle Ambient Fill Light
    const amb = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(amb);

    // 4. Subtle Interior Warm Glow PointLights to give life to windows
    const warmLight1 = new THREE.PointLight(0xfef08a, 1.2, 14, 1.5);
    warmLight1.position.set(-1.0, 2.0, 1.0);
    this.scene.add(warmLight1);

    const warmLight2 = new THREE.PointLight(0xfef08a, 1.0, 14, 1.5);
    warmLight2.position.set(4.0, 5.0, 2.0);
    this.scene.add(warmLight2);

    return { sun, hemi, amb };
  }

  private setupGrid(): THREE.GridHelper {
    // 60m x 60m grid with 1m module divisions
    const grid = new THREE.GridHelper(60, 60, 0x0284c7, 0x1e293b);
    grid.position.y = -0.15;
    grid.material.opacity = 0.65;
    grid.material.transparent = true;
    return grid;
  }

  public setGridVisible(visible: boolean) {
    this.gridHelper.visible = visible;
  }
}
