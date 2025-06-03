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
  buildingType: 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item' | 'blood_deity' | 'rich_vampire';
  customItemName?: string; // For custom items when buildingType = 'item'
  coordinate: Coordinate;
  reportedAt: Date;
  reporterName?: string;
  confidence?: 'confirmed' | 'unverified';
  notes?: string;
  guildLevel?: 1 | 2 | 3; // Guild level for guild buildings
  expiresAt?: Date; // When this report expires
}

export interface LocationReport {
  buildingName: string;
  buildingType: 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item' | 'blood_deity' | 'rich_vampire';
  customItemName?: string; // For custom items when buildingType = 'item'
  streetName: string;
  streetNumber: string;
  coordinate?: Coordinate;
  reporterName?: string;
  notes?: string;
  guildLevel?: 1 | 2 | 3; // Guild level for guild buildings
  bloodAmount?: number; // For blood deities
  coins?: number; // For rich vampires
}

export interface TopContributor {
  username: string;
  total_reports: number;
  created_at: Date;
  rank: number;
}

export interface DatabaseStats {
  total_reports: number;
  reports_by_type: Record<string, number>;
  total_contributors: number;
  confirmed_reports: number;
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

export interface BloodDeity {
  vampire_name: string;
  blood_amount: number;
  last_updated: Date;
  reporter_username?: string;
  rank: number;
}

export interface RichVampire {
  vampire_name: string;
  coins: number;
  last_updated: Date;
  reporter_username?: string;
  rank: number;
}