export type BuildingLayer = 
  | 'architectural'
  | 'structural'
  | 'electrical'
  | 'plumbing'
  | 'hvac';

export type BuildingCategory =
  | 'wall'
  | 'floor'
  | 'ceiling'
  | 'window'
  | 'door'
  | 'roof'
  | 'stair'
  | 'railing'
  | 'column'
  | 'beam'
  | 'slab'
  | 'foundation'
  | 'mep'
  | 'site';

export interface BuildingElementMetadata {
  id: string;
  name: string;
  category: BuildingCategory;
  layer: BuildingLayer;
  floorLevel: number; // -1: foundation/site, 0: ground floor, 1: first floor, 2: roof
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  materialDescription?: string;
  description?: string;
  specs?: Record<string, string | number>;
}
