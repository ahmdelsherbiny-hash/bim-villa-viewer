import './style.css';
import { ViewerApp } from './viewer/ViewerApp';
import { CameraPreset } from './viewer/CameraManager';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  if (!container) {
    console.error('Canvas container element not found.');
    return;
  }

  // 1. Initialize 3D BIM Viewer
  const app = new ViewerApp(container);

  // 2. Wire Camera Preset buttons
  const viewButtons = document.querySelectorAll<HTMLButtonElement>('.nav-btn[data-view]');
  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      viewButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.getAttribute('data-view') as CameraPreset;
      if (view) {
        app.setCameraPreset(view);
      }
    });
  });

  // 3. Reset View button
  const resetBtn = document.getElementById('btn-reset-cam');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      viewButtons.forEach((b) => b.classList.remove('active'));
      const defaultBtn = document.querySelector<HTMLButtonElement>('.nav-btn[data-view="perspective"]');
      if (defaultBtn) defaultBtn.classList.add('active');
      app.resetView();
    });
  }

  // 4. Toggle Construction Grid button
  const gridBtn = document.getElementById('btn-toggle-grid');
  if (gridBtn) {
    gridBtn.classList.add('active'); // active by default
    gridBtn.addEventListener('click', () => {
      const isVisible = app.toggleGrid();
      if (isVisible) {
        gridBtn.classList.add('active');
      } else {
        gridBtn.classList.remove('active');
      }
    });
  }

  console.log('BIM 3D Villa Visualization Phase 1 initialized.');
});
