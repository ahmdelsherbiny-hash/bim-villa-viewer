import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';

export type CameraPreset = 'perspective' | 'front' | 'back' | 'left' | 'right' | 'top';

export class CameraManager {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  private domElement: HTMLElement;
  private isTransitioning = false;

  // Preset positions and targets
  private presets: Record<CameraPreset, { pos: THREE.Vector3; target: THREE.Vector3 }> = {
    perspective: {
      pos: new THREE.Vector3(22, 16, 26),
      target: new THREE.Vector3(0, 3.0, 0)
    },
    front: {
      pos: new THREE.Vector3(0, 4.0, 30),
      target: new THREE.Vector3(0, 3.5, 0)
    },
    back: {
      pos: new THREE.Vector3(0, 4.0, -30),
      target: new THREE.Vector3(0, 3.5, 0)
    },
    left: {
      pos: new THREE.Vector3(-32, 4.0, 0),
      target: new THREE.Vector3(0, 3.5, 0)
    },
    right: {
      pos: new THREE.Vector3(32, 4.0, 0),
      target: new THREE.Vector3(0, 3.5, 0)
    },
    top: {
      pos: new THREE.Vector3(0, 36, 0.001),
      target: new THREE.Vector3(0, 0, 0)
    }
  };

  constructor(domElement: HTMLElement, aspect: number) {
    this.domElement = domElement;

    // Perspective camera with natural architectural field of view
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    const initial = this.presets.perspective;
    this.camera.position.copy(initial.pos);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.target.copy(initial.target);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 3.0;
    this.controls.maxDistance = 120.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.02; // Prevent dipping beneath ground level

    this.controls.update();
  }

  public update(time?: number) {
    if (this.isTransitioning) {
      TWEEN.update(time);
    }
    this.controls.update();
  }

  public setAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  public transitionToPreset(presetName: CameraPreset, duration = 900): Promise<void> {
    const preset = this.presets[presetName];
    if (!preset) return Promise.resolve();

    return this.animateCamera(preset.pos, preset.target, duration);
  }

  public resetView(duration = 900): Promise<void> {
    return this.transitionToPreset('perspective', duration);
  }

  public animateCamera(targetPos: THREE.Vector3, targetLookAt: THREE.Vector3, duration = 900): Promise<void> {
    return new Promise((resolve) => {
      this.isTransitioning = true;
      this.controls.enabled = false;

      const startPos = this.camera.position.clone();
      const startTarget = this.controls.target.clone();

      const coords = {
        px: startPos.x, py: startPos.y, pz: startPos.z,
        tx: startTarget.x, ty: startTarget.y, tz: startTarget.z
      };

      new TWEEN.Tween(coords)
        .to({
          px: targetPos.x, py: targetPos.y, pz: targetPos.z,
          tx: targetLookAt.x, ty: targetLookAt.y, tz: targetLookAt.z
        }, duration)
        .easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(() => {
          this.camera.position.set(coords.px, coords.py, coords.pz);
          this.controls.target.set(coords.tx, coords.ty, coords.tz);
        })
        .onComplete(() => {
          this.isTransitioning = false;
          this.controls.enabled = true;
          this.controls.update();
          resolve();
        })
        .start();
    });
  }

  public getCoordinatesString(): string {
    const p = this.camera.position;
    return `X: ${p.x.toFixed(1)} Y: ${p.y.toFixed(1)} Z: ${p.z.toFixed(1)}`;
  }
}
