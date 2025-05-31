import type { ReportedLocation, LocationReport } from '../types/game';
import { STREET_NAMES, getLocationName } from './cityData';

// Shop and guild names from cityData.ts
export const SHOP_NAMES = [
  'Discount Scrolls', 'Herman\'s Scrolls', 'Paper and Scrolls', 'Scrollmania',
  'Scrolls \'n\' Stuff', 'Scrolls R Us', 'Ye Olde Scrolles', 'Scrollworks',
  'Discount Potions', 'McPotions', 'Potable Potions', 'Potion Distillery',
  'Potionworks', 'Silver Apothecary', 'The Potion Shoppe',
  'Discount Magic', 'Dark Desires', 'Interesting Times', 'Sparks',
  'The Magic Box', 'White Light',
  'Spinners Pawn', 'Ace Pawn', 'Checkers Pawn', 'Reversi Pawn'
];

export const GUILD_NAMES = [
  'Allurists Guild', 'Empaths Guild', 'Immolators Guild',
  'Thieves Guild', 'Travellers Guild'
];

export const SPECIAL_SHOP_NAMES = [
  'Cloister of Secrets', 'The Sanguinarium', 'The Sepulchre of Shadows',
  'The Eternal Aubade of Mystical Treasures'
];

// Storage key for persisting reported locations
const STORAGE_KEY = 'vampire_city_reported_locations';

// In-memory store for reported locations
let reportedLocations: ReportedLocation[] = [];

// Load reported locations from localStorage
export function loadReportedLocations(): ReportedLocation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      reportedLocations = parsed.map((location: any) => ({
        ...location,
        reportedAt: new Date(location.reportedAt)
      }));
    }
  } catch (error) {
    console.error('Error loading reported locations:', error);
    reportedLocations = [];
  }
  return reportedLocations;
}

// Save reported locations to localStorage
function saveReportedLocations(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reportedLocations));
  } catch (error) {
    console.error('Error saving reported locations:', error);
  }
}

// Get all reported locations
export function getReportedLocations(): ReportedLocation[] {
  return reportedLocations;
}

// Add a new reported location
export function addReportedLocation(report: LocationReport): ReportedLocation {
  const coordinate = report.coordinate || parseLocationToCoordinate(report.streetName, report.streetNumber);

  const newLocation: ReportedLocation = {
    id: `${report.buildingName}_${Date.now()}`,
    buildingName: report.buildingName,
    buildingType: report.buildingType,
    coordinate,
    reportedAt: new Date(),
    reporterName: report.reporterName,
    confidence: 'unverified',
    notes: report.notes
  };

  // Remove any existing reports for the same building
  reportedLocations = reportedLocations.filter(loc => loc.buildingName !== report.buildingName);

  // Add the new report
  reportedLocations.push(newLocation);
  saveReportedLocations();

  return newLocation;
}

// Remove a reported location
export function removeReportedLocation(id: string): boolean {
  const initialLength = reportedLocations.length;
  reportedLocations = reportedLocations.filter(loc => loc.id !== id);

  if (reportedLocations.length < initialLength) {
    saveReportedLocations();
    return true;
  }
  return false;
}

// Update a reported location's confidence
export function updateLocationConfidence(id: string, confidence: 'confirmed' | 'unverified'): boolean {
  const location = reportedLocations.find(loc => loc.id === id);
  if (location) {
    location.confidence = confidence;
    saveReportedLocations();
    return true;
  }
  return false;
}

// Parse street intersection to coordinate
export function parseLocationToCoordinate(streetName: string, streetNumber: string): { x: number; y: number } {
  // Default to center if parsing fails
  let x = 100, y = 100;

  // Find street name index
  const streetIndex = STREET_NAMES.findIndex(name =>
    name.toLowerCase() === streetName.toLowerCase()
  );

  if (streetIndex !== -1) {
    // X coordinate: street index * 2 + 2 (for intersection)
    x = (streetIndex * 2) + 2;
  }

  // Parse street number
  const numberMatch = streetNumber.match(/(\d+)/);
  if (numberMatch) {
    const streetNum = parseInt(numberMatch[1], 10);
    // Y coordinate: street number * 2 (for intersection)
    y = streetNum * 2;
  }

  return { x, y };
}

// Parse natural language location description
export function parseNaturalLanguageLocation(description: string): LocationReport | null {
  // Examples:
  // "Paper and Scrolls, right by Regret and 90th"
  // "Discount Magic, right by Lonely and 65th"

  const patterns = [
    // "BuildingName, right by StreetName and StreetNumber"
    /^(.+?),\s*right by\s+(.+?)\s+and\s+(\d+)(?:st|nd|rd|th)?$/i,
    // "BuildingName at StreetName and StreetNumber"
    /^(.+?)\s*at\s+(.+?)\s+and\s+(\d+)(?:st|nd|rd|th)?$/i,
    // "BuildingName on StreetName and StreetNumber"
    /^(.+?)\s*on\s+(.+?)\s+and\s+(\d+)(?:st|nd|rd|th)?$/i,
    // "BuildingName, StreetName and StreetNumber"
    /^(.+?),\s*(.+?)\s+and\s+(\d+)(?:st|nd|rd|th)?$/i
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      const buildingName = match[1].trim();
      const streetName = match[2].trim();
      const streetNumber = `${match[3]}th`;

      // Determine building type
      let buildingType: 'shop' | 'guild' = 'shop';
      if (GUILD_NAMES.some(guild => buildingName.toLowerCase().includes(guild.toLowerCase()))) {
        buildingType = 'guild';
      }

      return {
        buildingName,
        buildingType,
        streetName,
        streetNumber,
        coordinate: parseLocationToCoordinate(streetName, streetNumber)
      };
    }
  }

  return null;
}

// Get reported locations for a specific building type
export function getReportedLocationsByType(type: 'shop' | 'guild'): ReportedLocation[] {
  return reportedLocations.filter(loc => loc.buildingType === type);
}

// Get the most recent report for a building
export function getLatestReportForBuilding(buildingName: string): ReportedLocation | null {
  const reports = reportedLocations
    .filter(loc => loc.buildingName === buildingName)
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());

  return reports[0] || null;
}

// Initialize with some sample data for testing
const initializeSampleData = () => {
  const sampleReports: ReportedLocation[] = [
    {
      id: 'sample-1',
      buildingName: 'Paper and Scrolls',
      buildingType: 'shop',
      coordinate: { x: 25, y: 45 },
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      reporterName: 'TestVampire',
      confidence: 'confirmed',
      notes: 'Confirmed by multiple users'
    },
    {
      id: 'sample-2',
      buildingName: 'Thieves Guild',
      buildingType: 'guild',
      coordinate: { x: 67, y: 23 },
      reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      reporterName: 'ShadowWalker',
      confidence: 'unverified',
      notes: 'Needs confirmation'
    }
  ];

  // Only add sample data if no reports exist
  const existingReports = getReportedLocations();
  if (existingReports.length === 0) {
    sampleReports.forEach(report => {
      // Convert ReportedLocation to the format expected by addReportedLocation
      const locationReport: LocationReport = {
        buildingName: report.buildingName,
        buildingType: report.buildingType,
        streetName: getLocationName(report.coordinate.x, report.coordinate.y).split(' & ')[1] || 'Unknown',
        streetNumber: getLocationName(report.coordinate.x, report.coordinate.y).split(' & ')[0] || 'Unknown',
        coordinate: report.coordinate,
        reporterName: report.reporterName,
        notes: report.notes
      };
      addReportedLocation(locationReport);
    });
  }
};

// Call this when the module loads
initializeSampleData();