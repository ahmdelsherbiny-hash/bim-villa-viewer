import * as THREE from 'three';

export class MaterialLibrary {
  private materials: Map<string, THREE.Material> = new Map();
  private textures: Map<string, THREE.Texture> = new Map();

  constructor() {
    this.initTextures();
    this.initMaterials();
  }

  private initTextures() {
    // 1. Procedural Concrete / Screed Texture
    this.textures.set('concrete', this.createNoiseTexture('#d6d3d1', '#a8a29e', 256, 15));
    // 2. Procedural Wood Grain Texture
    this.textures.set('wood', this.createWoodTexture());
    // 3. Procedural Modern Tile / Paver Texture
    this.textures.set('tiles', this.createTileTexture());
    // 4. Subtle Wall Plaster Bump
    this.textures.set('stuccoBump', this.createNoiseTexture('#808080', '#909090', 128, 40));
  }

  private initMaterials() {
    // White modern exterior stucco
    const stuccoTex = this.textures.get('stuccoBump');
    const wallWhite = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.85,
      metalness: 0.05,
      bumpMap: stuccoTex,
      bumpScale: 0.005,
    });
    this.materials.set('wall_white', wallWhite);

    // Charcoal architectural accent wall
    const wallAccent = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.7,
      metalness: 0.15,
      bumpMap: stuccoTex,
      bumpScale: 0.005,
    });
    this.materials.set('wall_accent', wallAccent);

    // Warm Architectural Wood (Flooring, Louvers, Eaves)
    const woodTex = this.textures.get('wood');
    const wood = new THREE.MeshStandardMaterial({
      color: 0xbb8a52,
      roughness: 0.45,
      metalness: 0.05,
      map: woodTex,
    });
    this.materials.set('wood', wood);

    // Polished Concrete / Ground Floor Slab
    const concreteTex = this.textures.get('concrete');
    const concrete = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.4,
      metalness: 0.1,
      map: concreteTex,
    });
    this.materials.set('concrete', concrete);

    // Exterior Pavers / Decking
    const tileTex = this.textures.get('tiles');
    const pavers = new THREE.MeshStandardMaterial({
      color: 0x71717a,
      roughness: 0.75,
      metalness: 0.05,
      map: tileTex,
    });
    this.materials.set('pavers', pavers);

    // Architectural Double Glazing (Glass)
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.92,
      thickness: 0.5,
      transparent: true,
      opacity: 0.45,
      ior: 1.52,
      reflectivity: 0.9,
      side: THREE.DoubleSide,
    });
    this.materials.set('glass', glass);

    // Tinted Balustrade Glass
    const glassBalustrade = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.8,
      transparent: true,
      opacity: 0.5,
      ior: 1.5,
      side: THREE.DoubleSide,
    });
    this.materials.set('glass_balustrade', glassBalustrade);

    // Modern Dark Anodized Aluminum (Mullions, Window Frames, Copings)
    const aluminumDark = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.85,
    });
    this.materials.set('aluminum_dark', aluminumDark);

    // Stainless Steel (Railings, Hardware)
    const steel = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.25,
      metalness: 0.9,
    });
    this.materials.set('steel', steel);

    // Interior Warm Ceiling / Drywall
    const ceiling = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.9,
      metalness: 0.0,
    });
    this.materials.set('ceiling', ceiling);

    // Foundation / Retaining Wall
    const foundation = new THREE.MeshStandardMaterial({
      color: 0x52525b,
      roughness: 0.9,
      metalness: 0.05,
      map: concreteTex,
    });
    this.materials.set('foundation', foundation);

    // Reflecting Pool / Water
    const water = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    this.materials.set('water', water);

    // Landscaping / Lawn Green
    const grass = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.95,
      metalness: 0.0,
    });
    this.materials.set('grass', grass);
  }

  public get(name: string): THREE.Material {
    const mat = this.materials.get(name);
    if (!mat) {
      console.warn(`Material "${name}" not found in library, using default.`);
      return new THREE.MeshStandardMaterial({ color: 0xcccccc });
    }
    return mat;
  }

  // --- Procedural Canvas Texture Generators ---
  private createNoiseTexture(color1: string, color2: string, size = 256, grainDensity = 20): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, size, size);

    // Add noise grain
    for (let i = 0; i < size * grainDensity; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const alpha = Math.random() * 0.15;
      ctx.fillStyle = color2;
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  private createWoodTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base wood amber tone
    ctx.fillStyle = '#b48450';
    ctx.fillRect(0, 0, 512, 512);

    // Longitudinal wood planks & rings
    for (let y = 0; y < 512; y += 4) {
      const shade = Math.sin(y * 0.08) * 20 + (Math.random() - 0.5) * 15;
      ctx.fillStyle = `rgba(90, 55, 20, ${Math.max(0.04, (shade + 20) / 120)})`;
      ctx.fillRect(0, y, 512, 3);
    }

    // Plank seam lines
    ctx.fillStyle = 'rgba(40, 20, 5, 0.4)';
    for (let x = 64; x < 512; x += 64) {
      ctx.fillRect(x, 0, 2, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  private createTileTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 512, 512);

    // Tile grid
    const tileSize = 64;
    ctx.fillStyle = '#475569';
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        ctx.fillStyle = Math.random() > 0.5 ? '#5f6f84' : '#697a90';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }

  public dispose() {
    this.materials.forEach(mat => mat.dispose());
    this.textures.forEach(tex => tex.dispose());
    this.materials.clear();
    this.textures.clear();
  }
}
