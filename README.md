# Modern BIM 3D Villa Viewer (Phase 1)

A browser-based interactive 3D architectural BIM (Building Information Modeling) viewer built with **Three.js**, **TypeScript**, and **Vite**.

---

## 🌟 Features Implemented in Phase 1

1. **Procedural 3D Architectural Villa Model**:
   - Two-story modern residential villa (~385 m² gross area) with contemporary architectural language.
   - **Ground Floor**: Living room, entrance foyer, kitchen/dining zone, study/guest partition, floor-to-ceiling glass curtain walls, pivot entrance door with canopy overhang.
   - **First Floor**: Cantilevered master bedroom volume overhanging the pool terrace with timber solar shading louvers, private balcony with glass balustrade, secondary bedroom.
   - **Roof Level**: Insulated flat roof with perimeter parapets, lightwell central skylight illuminating the stairwell, and rooftop solar PV array.
   - **Staircase**: Architectural floating teak wood treads with a steel central stringer beam and frameless glass balustrade.
   - **Site & Landscape**: Paved podium slab, natural lawn ground, outdoor teak sun deck, and infinity reflecting pool.

2. **Realistic Architectural PBR Materials**:
   - Procedurally generated canvas textures (no external image downloads or paid assets required):
     - Exterior white stucco plaster with micro-bump.
     - Dark charcoal accent wall panels.
     - Natural teak hardwood grain for louvers, decking, and stair treads.
     - Polished concrete floor slabs and pavers.
     - Double-glazed architectural glass with realistic transmission, IOR, and tint.
     - Dark anodized aluminum window mullions and frames.
     - Stainless steel hardware and stringers.

3. **Camera Navigation & Controls**:
   - **Orbit Controls**: Rotate (Left click + drag), Pan (Right click + drag), Zoom (Scroll wheel).
   - **Smooth View Transitions**: Animated cubic easing between viewpoints:
     - 3/4 Isometric Perspective
     - Front Elevation
     - Rear Elevation
     - Left Elevation
     - Right Elevation
     - Top Plan
   - **Reset Camera**: One-click reset to home viewpoint (or press `R` on the keyboard).
   - Damping and elevation clamps to prevent dipping underground.

4. **Architectural Lighting & Rendering**:
   - Directional sunlight casting soft real-time shadows (2048x2048 PCFSoftShadowMap).
   - Sky hemisphere light and warm interior point lights.
   - ACESFilmicToneMapping with natural exposure.
   - Interactive ground construction grid toggle.
   - Real-time FPS counter and real-time 3D camera coordinate tracking.

5. **LOD 300 Metadata Architecture**:
   - Every mesh is tagged with structured BIM metadata (`BuildingElementMetadata`), categorized by layer (`architectural`, `structural`, `electrical`, etc.) and floor level (`Level 0`, `Level 1`, `Level 2`, `Site`), establishing the clean foundation for Phases 2 through 6.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm / yarn

### Installation
```bash
# Navigate to the project directory
cd bim-villa-viewer

# Install dependencies (already installed if using the workspace)
npm install
```

### Running Locally
```bash
# Launch the Vite local development server
npm run dev
```

By default, Vite will start the dev server at:
```
http://localhost:3000
```
Open that URL in any modern web browser (Chrome, Edge, Firefox, Safari).

### Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture

```
bim-villa-viewer/
├── index.html                  # HTML5 layout & BIM HUD controls
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite configuration
├── src/
│   ├── main.ts                 # Application entry point and UI binding
│   ├── style.css               # Professional dark-theme BIM viewer styling
│   ├── building/
│   │   ├── types.ts            # BIM metadata, category & layer definitions
│   │   ├── MaterialLibrary.ts  # Architectural PBR materials & procedural textures
│   │   └── VillaBuilder.ts     # Procedural 3D villa geometry generator
│   └── viewer/
│       ├── ViewerApp.ts        # Top-level WebGL lifecycle & render loop
│       ├── SceneManager.ts     # Lighting, sky dome, shadows, grid
│       └── CameraManager.ts    # OrbitControls & animated camera presets
```

---

## 🗺️ Next Steps (Upcoming Phases)

- **Phase 2**: Building layers & visibility toggles (Architectural vs Structural vs MEP filters).
- **Phase 3**: Structural skeleton (RC columns, beams, rebar) and MEP systems (electrical conduits, plumbing, HVAC ducts).
- **Phase 4**: Interactive raycasting component selection and property inspection panel.
- **Phase 5**: Exploded floor view animations and 4D construction sequence timeline.
- **Phase 6**: Post-processing (SSAO, bloom) and IFC/GLTF importer support.
