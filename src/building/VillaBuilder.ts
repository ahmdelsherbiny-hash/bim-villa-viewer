import * as THREE from 'three';
import { MaterialLibrary } from './MaterialLibrary';
import { BuildingCategory, BuildingElementMetadata, BuildingLayer } from './types';

export class VillaBuilder {
  private materials: MaterialLibrary;
  private idCounter = 0;

  constructor(materials: MaterialLibrary) {
    this.materials = materials;
  }

  private nextId(prefix: string): string {
    this.idCounter++;
    return `${prefix}-${String(this.idCounter).padStart(3, '0')}`;
  }

  private tagMesh(
    mesh: THREE.Mesh,
    name: string,
    category: BuildingCategory,
    layer: BuildingLayer,
    floorLevel: number,
    materialDesc: string,
    dimensions?: { width: number; height: number; depth: number },
    specs?: Record<string, string | number>
  ): THREE.Mesh {
    const metadata: BuildingElementMetadata = {
      id: this.nextId(category.toUpperCase()),
      name,
      category,
      layer,
      floorLevel,
      materialDescription: materialDesc,
      dimensions,
      specs
    };

    mesh.userData.bimData = metadata;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  public buildVilla(): THREE.Group {
    const villaGroup = new THREE.Group();
    villaGroup.name = 'VillaRoot';

    // Organized into Floor Groups to allow easy exploded views in later phases
    const siteGroup = new THREE.Group();
    siteGroup.name = 'Site_Ground';

    const floor0Group = new THREE.Group();
    floor0Group.name = 'Level_00_Ground';

    const floor1Group = new THREE.Group();
    floor1Group.name = 'Level_01_FirstFloor';

    const roofGroup = new THREE.Group();
    roofGroup.name = 'Level_02_Roof';

    // 1. SITE & LANDSCAPE
    this.buildSite(siteGroup);

    // 2. GROUND FLOOR (Level 0, y: 0 to 3.2m)
    this.buildGroundFloor(floor0Group);

    // 3. FIRST FLOOR (Level 1, y: 3.2 to 6.4m)
    this.buildFirstFloor(floor1Group);

    // 4. ROOF & PARAPET (Level 2, y: 6.4 to 7.2m)
    this.buildRoof(roofGroup);

    // 5. STAIRCASE (Connects ground to first floor)
    this.buildStaircase(floor0Group);

    villaGroup.add(siteGroup);
    villaGroup.add(floor0Group);
    villaGroup.add(floor1Group);
    villaGroup.add(roofGroup);

    return villaGroup;
  }

  // ==========================================
  // 1. SITE & FOUNDATION PLATFORM
  // ==========================================
  private buildSite(group: THREE.Group) {
    // Surrounding ground lawn
    const lawnGeo = new THREE.BoxGeometry(36, 0.2, 30);
    const lawnMesh = new THREE.Mesh(lawnGeo, this.materials.get('grass'));
    lawnMesh.position.set(0, -0.1, 0);
    this.tagMesh(lawnMesh, 'Surrounding Landscape', 'site', 'architectural', -1, 'Natural Grass / Landscaping');
    group.add(lawnMesh);

    // Main paved podium / Terrace slab
    const podiumGeo = new THREE.BoxGeometry(22, 0.4, 18);
    const podiumMesh = new THREE.Mesh(podiumGeo, this.materials.get('pavers'));
    podiumMesh.position.set(0, 0.2, 0);
    this.tagMesh(podiumMesh, 'Podium Slab & Terrace', 'foundation', 'structural', -1, 'Reinforced Concrete with Stone Pavers');
    group.add(podiumMesh);

    // Timber pool deck area on the right
    const deckGeo = new THREE.BoxGeometry(7, 0.42, 10);
    const deckMesh = new THREE.Mesh(deckGeo, this.materials.get('wood'));
    deckMesh.position.set(6.5, 0.21, 2);
    this.tagMesh(deckMesh, 'Outdoor Teak Sun Deck', 'floor', 'architectural', 0, 'Treated Teak Hardwood Decking');
    group.add(deckMesh);

    // Reflecting Pool / Swimming Basin
    const poolGeo = new THREE.BoxGeometry(4.5, 0.35, 7.5);
    const poolMesh = new THREE.Mesh(poolGeo, this.materials.get('water'));
    poolMesh.position.set(6.5, 0.25, 2);
    this.tagMesh(poolMesh, 'Reflecting Pool', 'site', 'architectural', 0, 'Infinity Edge Water Feature');
    group.add(poolMesh);

    // Entrance stone walkway
    const walkGeo = new THREE.BoxGeometry(3.5, 0.05, 5);
    const walkMesh = new THREE.Mesh(walkGeo, this.materials.get('pavers'));
    walkMesh.position.set(-3.5, 0.42, 8);
    this.tagMesh(walkMesh, 'Entrance Pathway', 'site', 'architectural', 0, 'Basalt Stone Pavers');
    group.add(walkMesh);
  }

  // ==========================================
  // 2. GROUND FLOOR
  // ==========================================
  private buildGroundFloor(group: THREE.Group) {
    const h = 3.2; // Floor height
    const baseElevation = 0.4; // Ground slab top

    // Ground Floor Concrete Slab
    const slabGeo = new THREE.BoxGeometry(16, 0.3, 12);
    const slabMesh = new THREE.Mesh(slabGeo, this.materials.get('concrete'));
    slabMesh.position.set(-1.5, baseElevation + 0.15, 0);
    this.tagMesh(slabMesh, 'Ground Floor Slab', 'slab', 'structural', 0, 'C30/37 Reinforced Concrete Slab 300mm');
    group.add(slabMesh);

    // --- EXTERIOR WALLS (Ground Floor) ---
    // North (Rear) Wall - Solid with window openings
    this.addWall(group, 'GF North Exterior Wall (West)', -5.5, baseElevation + 0.3 + h / 2, -5.9, 8, h, 0.25, 'wall_white', 0);
    this.addWall(group, 'GF North Exterior Wall (East)', 4.0, baseElevation + 0.3 + h / 2, -5.9, 4.5, h, 0.25, 'wall_white', 0);

    // West Exterior Wall - Stucco with vertical slit windows
    this.addWall(group, 'GF West Exterior Wall', -9.375, baseElevation + 0.3 + h / 2, 0, 0.25, h, 12, 'wall_white', 0);

    // South (Front) Exterior Wall - Featuring large architectural glazed facade & entrance
    // Solid accent section (left)
    this.addWall(group, 'GF Entrance Accent Feature Wall', -7.0, baseElevation + 0.3 + h / 2, 5.9, 4.5, h, 0.3, 'wall_accent', 0);
    // Low sill wall for glazed section
    this.addWall(group, 'GF Patio Glazing Sill', 0.5, baseElevation + 0.3 + 0.2, 5.9, 7.5, 0.4, 0.25, 'wall_white', 0);

    // East Exterior Wall (facing pool deck)
    this.addWall(group, 'GF East Wall Solid Section', 6.375, baseElevation + 0.3 + h / 2, -3.5, 0.25, h, 5, 'wall_white', 0);

    // --- INTERIOR PARTITIONS (Ground Floor) ---
    // Living / Study partition wall
    this.addWall(group, 'GF Study Partition Wall', -4.0, baseElevation + 0.3 + h / 2, 0.5, 0.2, h, 7, 'wall_white', 0);
    // Kitchen / Utility core wall
    this.addWall(group, 'GF Kitchen Utility Core Wall', 1.5, baseElevation + 0.3 + h / 2, -2.5, 5, h, 0.2, 'wall_white', 0);

    // --- DOORS & GLAZED FACADES ---
    // Grand Modern Pivot Front Entrance Door
    this.addDoor(group, 'Main Entrance Pivot Door', -3.8, baseElevation + 0.3 + 1.4, 5.9, 1.6, 2.8, 0.1, 'wood', 0);

    // Entrance Porch Canopy Overhang
    const canopyGeo = new THREE.BoxGeometry(2.8, 0.15, 2.2);
    const canopyMesh = new THREE.Mesh(canopyGeo, this.materials.get('aluminum_dark'));
    canopyMesh.position.set(-3.8, baseElevation + 0.3 + 2.9, 7.0);
    this.tagMesh(canopyMesh, 'Entrance Canopy Overhang', 'roof', 'architectural', 0, 'Powder-coated Steel & Aluminum Canopy');
    group.add(canopyMesh);

    // Floor-to-Ceiling Sliding Patio Glass Facade (facing pool and lawn)
    this.addCurtainWall(group, 'GF Living Room Glazed Curtain Wall', 0.5, baseElevation + 0.3 + 1.8, 5.9, 7.4, 2.8, 0, 0);

    // East Pool-facing Glass Wall
    this.addCurtainWall(group, 'GF East Pool Glazing', 6.375, baseElevation + 0.3 + 1.8, 2.5, 0.1, 2.8, 6.8, 0);

    // Rear Courtyard Window
    this.addWindow(group, 'GF Kitchen Panoramic Ribbon Window', 0.0, baseElevation + 0.3 + 1.8, -5.9, 3.0, 1.4, 0.1, 0);
  }

  // ==========================================
  // 3. FIRST FLOOR
  // ==========================================
  private buildFirstFloor(group: THREE.Group) {
    const h = 3.2;
    const baseElevation = 0.4 + 0.3 + 3.2; // Elevation of Level 1 slab (3.9m)

    // Intermediate Concrete Slab (Separating Level 0 and Level 1)
    const slabGeo = new THREE.BoxGeometry(17, 0.35, 13);
    const slabMesh = new THREE.Mesh(slabGeo, this.materials.get('concrete'));
    slabMesh.position.set(-1.0, baseElevation - 0.175, 0.5);
    this.tagMesh(slabMesh, 'First Floor Inter-story Concrete Slab', 'slab', 'structural', 1, 'Post-tensioned Concrete Slab 350mm');
    group.add(slabMesh);

    // Architectural Cantilever Volume (Master Bedroom projecting over the pool deck)
    const cantileverGeo = new THREE.BoxGeometry(6.5, 0.35, 5.5);
    const cantileverMesh = new THREE.Mesh(cantileverGeo, this.materials.get('wood'));
    cantileverMesh.position.set(4.5, baseElevation - 0.175, 3.8);
    this.tagMesh(cantileverMesh, 'Cantilevered Suite Terrace Soffit', 'slab', 'architectural', 1, 'Insulated Timber Clad Overhang');
    group.add(cantileverMesh);

    // --- EXTERIOR WALLS (First Floor) ---
    // North Wall
    this.addWall(group, 'FF North Exterior Wall', -1.5, baseElevation + h / 2, -5.9, 15.5, h, 0.25, 'wall_white', 1);

    // West Wall
    this.addWall(group, 'FF West Wall Solid Panel', -9.125, baseElevation + h / 2, 0.5, 0.25, h, 12.5, 'wall_white', 1);

    // Cantilever Master Suite (East & South) - Clad in charcoal and warm timber louvers
    this.addWall(group, 'FF Master Bedroom East Clad Wall', 7.625, baseElevation + h / 2, 2.5, 0.25, h, 8.0, 'wall_accent', 1);
    this.addWall(group, 'FF Master Bedroom South Feature Wall', 5.0, baseElevation + h / 2, 6.4, 5.5, h, 0.25, 'wall_accent', 1);

    // Decorative Timber Louver Screen on Master Suite Facade
    this.addLouverScreen(group, 'FF Master Suite Timber Solar Louvers', 5.0, baseElevation + h / 2, 6.6, 5.0, h * 0.9, 1);

    // South Bedroom Balcony Retreat (Recessed facade for shaded outdoor terrace)
    this.addWall(group, 'FF South Recessed Terrace Wall', -5.0, baseElevation + h / 2, 3.5, 7.5, h, 0.25, 'wall_white', 1);

    // --- INTERIOR PARTITIONS (First Floor) ---
    this.addWall(group, 'FF Master Corridor Wall', 1.0, baseElevation + h / 2, 0, 0.2, h, 8.0, 'wall_white', 1);
    this.addWall(group, 'FF Guest Suite Partition', -4.0, baseElevation + h / 2, -1.0, 6.5, h, 0.2, 'wall_white', 1);

    // --- FIRST FLOOR WINDOWS & BALCONY DOORS ---
    // Master Bedroom Floor-to-Ceiling Balcony Glazing
    this.addCurtainWall(group, 'FF Master Suite Glass Sliding Door', 1.8, baseElevation + 1.5, 6.4, 2.5, 2.7, 0, 1);

    // Secondary Bedroom Balcony Sliding Wall
    this.addCurtainWall(group, 'FF Bedroom 02 Balcony Access', -4.5, baseElevation + 1.5, 3.5, 4.0, 2.7, 0, 1);

    // First Floor Balcony Glass Balustrade / Railing
    this.addBalustrade(group, 'FF South Terrace Glass Balustrade', -4.5, baseElevation + 0.6, 6.5, 7.0, 1.1, 0, 1);
    this.addBalustrade(group, 'FF East Master Terrace Balustrade', 7.6, baseElevation + 0.6, -1.5, 0.1, 1.1, 4.0, 1);

    // Ribbon windows on North facade
    this.addWindow(group, 'FF Hallway Ribbon Window', -1.5, baseElevation + 2.0, -5.9, 6.0, 1.2, 0.1, 1);
  }

  // ==========================================
  // 4. ROOF & PARAPET
  // ==========================================
  private buildRoof(group: THREE.Group) {
    const baseElevation = 0.4 + 0.3 + 3.2 + 3.2; // 7.1m
    const roofThickness = 0.35;

    // Main Flat Concrete Roof Slab
    const roofSlabGeo = new THREE.BoxGeometry(17.5, roofThickness, 13.5);
    const roofSlabMesh = new THREE.Mesh(roofSlabGeo, this.materials.get('concrete'));
    roofSlabMesh.position.set(-1.0, baseElevation + roofThickness / 2, 0.5);
    this.tagMesh(roofSlabMesh, 'Insulated Flat Roof Slab', 'roof', 'structural', 2, 'Inverted Roof System with Waterproof Membrane & Insulation');
    group.add(roofSlabMesh);

    // Perimeter Parapet Walls (0.6m high, prevents water runoff & conceals equipment)
    const parapetH = 0.6;
    const parapetY = baseElevation + roofThickness + parapetH / 2;

    // North & South Parapets
    this.addWall(group, 'Roof North Parapet', -1.0, parapetY, -6.15, 17.5, parapetH, 0.2, 'wall_white', 2);
    this.addWall(group, 'Roof South Parapet', -1.0, parapetY, 7.15, 17.5, parapetH, 0.2, 'wall_white', 2);
    // East & West Parapets
    this.addWall(group, 'Roof West Parapet', -9.65, parapetY, 0.5, 0.2, parapetH, 13.5, 'wall_white', 2);
    this.addWall(group, 'Roof East Parapet', 7.65, parapetY, 0.5, 0.2, parapetH, 13.5, 'wall_white', 2);

    // Architectural Staircase Skylight / Lightwell
    const skylightFrameGeo = new THREE.BoxGeometry(2.6, 0.4, 3.6);
    const skylightFrame = new THREE.Mesh(skylightFrameGeo, this.materials.get('aluminum_dark'));
    skylightFrame.position.set(-1.5, baseElevation + roofThickness + 0.2, -0.5);
    this.tagMesh(skylightFrame, 'Central Atrium Skylight Curb', 'roof', 'architectural', 2, 'Thermally Broken Aluminum Skylight Curb');
    group.add(skylightFrame);

    const skylightGlassGeo = new THREE.BoxGeometry(2.4, 0.05, 3.4);
    const skylightGlass = new THREE.Mesh(skylightGlassGeo, this.materials.get('glass'));
    skylightGlass.position.set(-1.5, baseElevation + roofThickness + 0.42, -0.5);
    this.tagMesh(skylightGlass, 'Atrium Skylight Double Glazing', 'window', 'architectural', 2, 'Solar Control Laminated Low-E Glass');
    group.add(skylightGlass);

    // Roof Solar Photovoltaic Panels Array
    for (let i = 0; i < 4; i++) {
      const pvGeo = new THREE.BoxGeometry(3.0, 0.08, 1.8);
      const pvMesh = new THREE.Mesh(pvGeo, this.materials.get('aluminum_dark'));
      pvMesh.position.set(-6.5 + i * 3.4, baseElevation + roofThickness + 0.25, -3.5);
      pvMesh.rotation.x = THREE.MathUtils.degToRad(-15); // Tilted towards south
      this.tagMesh(pvMesh, `Rooftop Solar PV Array Module 0${i + 1}`, 'roof', 'electrical', 2, 'High-Efficiency Monocrystalline Solar Panel 450W');
      group.add(pvMesh);
    }
  }

  // ==========================================
  // 5. STAIRCASE
  // ==========================================
  private buildStaircase(group: THREE.Group) {
    const stairGroup = new THREE.Group();
    stairGroup.name = 'Architectural_Staircase';

    const numSteps = 16;
    const totalRise = 3.2;
    const stepRise = totalRise / numSteps;
    const stepRun = 0.28;
    const stepWidth = 1.2;
    const startX = -1.5;
    const startY = 0.7; // Above ground floor slab
    const startZ = -2.5;

    // Cantilevered Teak Wooden Treads
    for (let i = 0; i < numSteps; i++) {
      const stepGeo = new THREE.BoxGeometry(stepWidth, 0.06, stepRun);
      const stepMesh = new THREE.Mesh(stepGeo, this.materials.get('wood'));
      stepMesh.position.set(startX, startY + i * stepRise + 0.03, startZ + i * stepRun);
      this.tagMesh(stepMesh, `Staircase Tread ${i + 1}`, 'stair', 'architectural', 0, 'Solid Teak Tread 60mm with Anti-slip Groove');
      stairGroup.add(stepMesh);
    }

    // Steel Spine Stringer Support Beam
    const stringerGeo = new THREE.BoxGeometry(0.2, 0.15, numSteps * stepRun * 1.35);
    const stringerMesh = new THREE.Mesh(stringerGeo, this.materials.get('steel'));
    stringerMesh.position.set(startX, startY + (numSteps * stepRise) / 2, startZ + (numSteps * stepRun) / 2);
    stringerMesh.rotation.x = Math.atan2(totalRise, numSteps * stepRun);
    this.tagMesh(stringerMesh, 'Staircase Central Steel Stringer Beam', 'stair', 'structural', 0, 'Structural Steel Box Section 200x150mm');
    stairGroup.add(stringerMesh);

    // Floating Glass Balustrade along stairs
    const glassRailingGeo = new THREE.BoxGeometry(0.04, 1.0, numSteps * stepRun * 1.05);
    const glassRailing = new THREE.Mesh(glassRailingGeo, this.materials.get('glass_balustrade'));
    glassRailing.position.set(startX + stepWidth / 2 + 0.02, startY + (numSteps * stepRise) / 2 + 0.5, startZ + (numSteps * stepRun) / 2);
    glassRailing.rotation.x = Math.atan2(totalRise, numSteps * stepRun);
    this.tagMesh(glassRailing, 'Staircase Glass Balustrade', 'railing', 'architectural', 0, '12mm Toughened Laminated Structural Glass Balustrade');
    stairGroup.add(glassRailing);

    group.add(stairGroup);
  }

  // ==========================================
  // HELPER BUILDERS
  // ==========================================
  private addWall(
    group: THREE.Group,
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    matName: string,
    floorLevel: number
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, this.materials.get(matName));
    mesh.position.set(x, y, z);
    this.tagMesh(mesh, name, 'wall', 'architectural', floorLevel, 'Insulated Autoclaved Aerated Concrete / Plaster', { width: w, height: h, depth: d });
    group.add(mesh);
  }

  private addCurtainWall(
    group: THREE.Group,
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    floorLevel: number
  ) {
    const curtainGroup = new THREE.Group();
    curtainGroup.position.set(x, y, z);
    curtainGroup.name = name;

    const isAlongX = w >= d;
    const length = isAlongX ? w : d;
    const frameDepth = 0.15;
    const glassThickness = 0.03;

    // Glass Panes
    const glassGeo = isAlongX
      ? new THREE.BoxGeometry(length - 0.1, h - 0.1, glassThickness)
      : new THREE.BoxGeometry(glassThickness, h - 0.1, length - 0.1);

    const glassMesh = new THREE.Mesh(glassGeo, this.materials.get('glass'));
    this.tagMesh(glassMesh, `${name} - Double Glazing Pane`, 'window', 'architectural', floorLevel, 'Double Glazed Low-E Safety Glass');
    curtainGroup.add(glassMesh);

    // Aluminum Perimeter Framing
    const frameGeo = isAlongX
      ? new THREE.BoxGeometry(length, h, frameDepth)
      : new THREE.BoxGeometry(frameDepth, h, length);
    // Wireframe / subtle frame box
    const frameEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(frameGeo),
      new THREE.LineBasicMaterial({ color: 0x1f2937, linewidth: 2 })
    );
    curtainGroup.add(frameEdges);

    // Mullions (Vertical divide every ~1.8m)
    const numMullions = Math.max(1, Math.floor(length / 1.8));
    for (let i = 1; i < numMullions; i++) {
      const offset = -length / 2 + (i * length) / numMullions;
      const mullionGeo = isAlongX
        ? new THREE.BoxGeometry(0.08, h, frameDepth * 0.9)
        : new THREE.BoxGeometry(frameDepth * 0.9, h, 0.08);
      const mullion = new THREE.Mesh(mullionGeo, this.materials.get('aluminum_dark'));
      if (isAlongX) mullion.position.set(offset, 0, 0);
      else mullion.position.set(0, 0, offset);
      this.tagMesh(mullion, `${name} - Vertical Mullion ${i}`, 'window', 'architectural', floorLevel, 'Thermally Broken Black Anodized Aluminum Profile');
      curtainGroup.add(mullion);
    }

    group.add(curtainGroup);
  }

  private addWindow(
    group: THREE.Group,
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    floorLevel: number
  ) {
    const winGroup = new THREE.Group();
    winGroup.position.set(x, y, z);
    winGroup.name = name;

    // Window Frame
    const frameGeo = new THREE.BoxGeometry(w, h, Math.max(d, 0.15));
    const frameMesh = new THREE.Mesh(frameGeo, this.materials.get('aluminum_dark'));
    this.tagMesh(frameMesh, `${name} - Frame`, 'window', 'architectural', floorLevel, 'Extruded Aluminum Window Frame');
    winGroup.add(frameMesh);

    // Window Glass
    const glassGeo = new THREE.BoxGeometry(w - 0.12, h - 0.12, 0.04);
    const glassMesh = new THREE.Mesh(glassGeo, this.materials.get('glass'));
    this.tagMesh(glassMesh, `${name} - Glazing`, 'window', 'architectural', floorLevel, 'Double Glazed Insulated Glass');
    winGroup.add(glassMesh);

    group.add(winGroup);
  }

  private addDoor(
    group: THREE.Group,
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    matName: string,
    floorLevel: number
  ) {
    const doorGroup = new THREE.Group();
    doorGroup.position.set(x, y, z);
    doorGroup.name = name;

    // Door Leaf
    const leafGeo = new THREE.BoxGeometry(w, h, d);
    const leafMesh = new THREE.Mesh(leafGeo, this.materials.get(matName));
    this.tagMesh(leafMesh, `${name} Leaf`, 'door', 'architectural', floorLevel, 'Engineered Architectural Hardwood Door');
    doorGroup.add(leafMesh);

    // Modern Long Vertical Stainless Steel Pull Handle
    const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.2, 16);
    const handleMesh = new THREE.Mesh(handleGeo, this.materials.get('steel'));
    handleMesh.position.set(w / 2 - 0.15, 0, d / 2 + 0.05);
    doorGroup.add(handleMesh);

    group.add(doorGroup);
  }

  private addBalustrade(
    group: THREE.Group,
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    floorLevel: number
  ) {
    const isAlongX = w >= d;
    const len = isAlongX ? w : d;

    // Glass panel
    const glassGeo = isAlongX
      ? new THREE.BoxGeometry(len, h, 0.03)
      : new THREE.BoxGeometry(0.03, h, len);
    const glassMesh = new THREE.Mesh(glassGeo, this.materials.get('glass_balustrade'));
    glassMesh.position.set(x, y, z);
    this.tagMesh(glassMesh, `${name} - Glass Panel`, 'railing', 'architectural', floorLevel, '16.76mm Toughened Laminated Structural Glass');
    group.add(glassMesh);

    // Slim top capping channel
    const capGeo = isAlongX
      ? new THREE.BoxGeometry(len, 0.04, 0.06)
      : new THREE.BoxGeometry(0.06, 0.04, len);
    const capMesh = new THREE.Mesh(capGeo, this.materials.get('aluminum_dark'));
    capMesh.position.set(x, y + h / 2 + 0.02, z);
    this.tagMesh(capMesh, `${name} - Top Handrail Cap`, 'railing', 'architectural', floorLevel, 'Anodized Aluminum U-Channel Cap');
    group.add(capMesh);
  }

  private addLouverScreen(
    group: THREE.Group,
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    floorLevel: number
  ) {
    const louverGroup = new THREE.Group();
    louverGroup.position.set(x, y, z);
    louverGroup.name = name;

    const numLouvers = 18;
    const louverWidth = 0.05;
    const louverDepth = 0.15;
    const spacing = w / numLouvers;

    for (let i = 0; i <= numLouvers; i++) {
      const slatGeo = new THREE.BoxGeometry(louverWidth, h, louverDepth);
      const slatMesh = new THREE.Mesh(slatGeo, this.materials.get('wood'));
      slatMesh.position.set(-w / 2 + i * spacing, 0, 0);
      slatMesh.rotation.y = THREE.MathUtils.degToRad(25); // Angled for sun shading
      this.tagMesh(slatMesh, `${name} Slat ${i + 1}`, 'wall', 'architectural', floorLevel, 'Natural Thermowood Exterior Shading Louver');
      louverGroup.add(slatMesh);
    }

    group.add(louverGroup);
  }
}
