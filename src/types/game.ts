export interface Coordinate {
  x: number;
  y: number;
}

export interface Building {
  id: string;
  type: 'pub' | 'transit' | 'bank' | 'shop' | 'lair' | 'other' | 'guild';
  name: string;
  coordinate: Coordinate;
}

export interface ReportedLocation {
  id: string;
  buildingName: string;
  buildingType: 'shop' | 'guild';
  coordinate: Coordinate;
  reportedAt: Date;
  reporterName?: string;
  confidence?: 'confirmed' | 'unverified';
  notes?: string;
}

export interface LocationReport {
  buildingName: string;
  buildingType: 'shop' | 'guild';
  streetName: string;
  streetNumber: string;
  coordinate?: Coordinate;
  reporterName?: string;
  notes?: string;
}

export interface Street {
  name: string;
  type: 'numbered' | 'named';
  index: number;
}

export interface CityTile {
  coordinate: Coordinate;
  type: 'street' | 'building' | 'alley' | 'blocked';
  building?: Building;
  isPlayerLocation?: boolean;
  hasVampires?: boolean;
  vampireCount?: number;
}

export interface GameState {
  playerLocation: Coordinate;
  actionPoints: number;
  maxActionPoints: number;
  bloodPints: number;
  coins: number;
  rank: string;
}

export interface MapViewport {
  centerX: number;
  centerY: number;
  zoom: number;
  tileSize: number;
}