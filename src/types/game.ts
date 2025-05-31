export interface Coordinate {
  x: number;
  y: number;
}

export interface Building {
  id: string;
  type: 'pub' | 'transit' | 'bank' | 'shop' | 'hidden' | 'lair' | 'other' | 'guild';
  name: string;
  coordinate: Coordinate;
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