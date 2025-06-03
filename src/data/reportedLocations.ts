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

// Check if a shop location has expired (shops move every 12 hours at 10:40 GMT)
function isShopLocationExpired(reportedAt: Date): boolean {
  const now = new Date();
  const gmtNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));

  // Get the most recent 10:40 GMT time
  const today1040 = new Date(gmtNow);
  today1040.setUTCHours(10, 40, 0, 0);

  const yesterday1040 = new Date(today1040);
  yesterday1040.setUTCDate(yesterday1040.getUTCDate() - 1);

  // Determine the most recent shop movement time
  let lastMovement: Date;
  if (gmtNow >= today1040) {
    lastMovement = today1040;
  } else {
    lastMovement = yesterday1040;
  }

  return reportedAt < lastMovement;
}

// Check if a guild location has expired (guilds move every 3-5 days, expire after 5 days)
function isGuildLocationExpired(reportedAt: Date): boolean {
  const now = new Date();
  const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));
  return reportedAt < fiveDaysAgo;
}

// Clean up expired locations
function cleanupExpiredLocations(): void {
  const initialLength = reportedLocations.length;

  reportedLocations = reportedLocations.filter(location => {
    if (location.buildingType === 'shop' && isShopLocationExpired(location.reportedAt)) {
      return false; // Remove expired shop
    }
    if (location.buildingType === 'guild' && isGuildLocationExpired(location.reportedAt)) {
      return false; // Remove expired guild
    }
    return true; // Keep non-expired locations
  });

  // Save if any locations were removed
  if (reportedLocations.length < initialLength) {
    saveReportedLocations();
    console.log(`Cleaned up ${initialLength - reportedLocations.length} expired locations`);
  }
}

// Load reported locations from localStorage
export function loadReportedLocations(): ReportedLocation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Array<{
        id: string;
        buildingName: string;
        buildingType: 'shop' | 'guild';
        coordinate: { x: number; y: number };
        reportedAt: string;
        reporterName?: string;
        confidence?: 'confirmed' | 'unverified';
        notes?: string;
        guildLevel?: 1 | 2 | 3;
      }>;
      reportedLocations = parsed.map((location) => ({
        ...location,
        reportedAt: new Date(location.reportedAt)
      }));

      // Clean up expired locations after loading
      cleanupExpiredLocations();
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
    notes: report.notes,
    guildLevel: report.guildLevel // Include guild level if provided
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
  let x = 100;
  let y = 100;

  // Handle Western City Limits specially
  if (streetName.toLowerCase() === 'western city limits') {
    x = 1;
  } else {
    // Find street name index
    const streetIndex = STREET_NAMES.findIndex(name =>
      name.toLowerCase() === streetName.toLowerCase()
    );

    if (streetIndex !== -1) {
      // X coordinate: street index * 2 + 2 (for intersection) + 1 (one square east)
      x = (streetIndex * 2) + 2 + 1;
    }
  }

  // Handle Northern City Limits specially
  if (streetNumber.toLowerCase() === 'northern city limits') {
    y = 1;
  } else {
    // Parse street number
    const numberMatch = streetNumber.match(/(\d+)/);
    if (numberMatch) {
      const streetNum = Number.parseInt(numberMatch[1], 10);
      // Y coordinate: street number * 2 (for intersection) + 1 (one square south)
      y = streetNum * 2 + 1;
    }
  }

  return { x, y };
}

// Parse natural language location description
export function parseNaturalLanguageLocation(description: string): LocationReport | null {
  // Examples:
  // "Paper and Scrolls, right by Regret and 90th"
  // "Discount Magic, right by Lonely and 65th"
  // "Discount Scrolls, right by Chagrin and the NCL"
  // "Some Shop, right by the WCL and 50th"

  console.log(`🔍 Parsing: "${description}"`);

  // Handle common abbreviations
  let normalizedDescription = description
    .replace(/\bthe NCL\b/gi, 'Northern City Limits') // NCL = Northern City Limits
    .replace(/\bNCL\b/gi, 'Northern City Limits')
    .replace(/\bthe WCL\b/gi, 'Western City Limits')  // WCL = Western City Limits
    .replace(/\bWCL\b/gi, 'Western City Limits');

  console.log(`📝 Normalized: "${normalizedDescription}"`);

  const patterns = [
    // "BuildingName, right by StreetName and StreetNumber" - handles regular numbered streets
    /^(.+?),\s*right by\s+(.+?)\s+and\s+(\d+)(?:st|nd|rd|th)?\.?$/i,
    // "BuildingName, right by StreetName and City Limits" - handles city limits
    /^(.+?),\s*right by\s+(.+?)\s+and\s+(Northern City Limits|Western City Limits)\.?$/i,
    // "BuildingName, right by City Limits and StreetNumber" - handles limits as first part
    /^(.+?),\s*right by\s+(Northern City Limits|Western City Limits)\s+and\s+(\d+)(?:st|nd|rd|th)?\.?$/i,
    // "BuildingName at StreetName and StreetNumber" - regular numbered streets
    /^(.+?)\s*at\s+(.+?)\s+and\s+(\d+)(?:st|nd|rd|th)?\.?$/i,
    // "BuildingName at StreetName and City Limits" - handles city limits
    /^(.+?)\s*at\s+(.+?)\s+and\s+(Northern City Limits|Western City Limits)\.?$/i,
    // "BuildingName at City Limits and StreetNumber" - handles limits as first part
    /^(.+?)\s*at\s+(Northern City Limits|Western City Limits)\s+and\s+(\d+)(?:st|nd|rd|th)?\.?$/i,
    // "BuildingName on StreetName and StreetNumber" - regular numbered streets
    /^(.+?)\s*on\s+(.+?)\s+and\s+(\d+)(?:st|nd|rd|th)?\.?$/i,
    // "BuildingName on StreetName and City Limits" - handles city limits
    /^(.+?)\s*on\s+(.+?)\s+and\s+(Northern City Limits|Western City Limits)\.?$/i,
    // "BuildingName on City Limits and StreetNumber" - handles limits as first part
    /^(.+?)\s*on\s+(Northern City Limits|Western City Limits)\s+and\s+(\d+)(?:st|nd|rd|th)?\.?$/i,
    // "BuildingName, StreetName and StreetNumber" - regular numbered streets
    /^(.+?),\s*(.+?)\s+and\s+(\d+)(?:st|nd|rd|th)?\.?$/i,
    // "BuildingName, StreetName and City Limits" - handles city limits
    /^(.+?),\s*(.+?)\s+and\s+(Northern City Limits|Western City Limits)\.?$/i,
    // "BuildingName, City Limits and StreetNumber" - handles limits as first part
    /^(.+?),\s*(Northern City Limits|Western City Limits)\s+and\s+(\d+)(?:st|nd|rd|th)?\.?$/i
  ];

  for (const [patternIndex, pattern] of patterns.entries()) {
    const match = normalizedDescription.match(pattern);
    if (match) {
      console.log(`✅ Pattern ${patternIndex + 1} matched:`, match);

      const buildingName = match[1].trim();
      let streetName: string;
      let streetNumber: string;

      // Handle the different pattern formats
      if (match[3] && (match[3].includes('City Limits') || /^\d+/.test(match[3]))) {
        // Patterns where the third match is either city limits or a number
        streetName = match[2].trim();
        streetNumber = match[3].includes('City Limits') ? match[3] : `${match[3]}th`;
      } else if (match[2] && match[2].includes('City Limits')) {
        // Patterns where the second match is city limits
        streetName = match[2].trim();
        streetNumber = match[3] ? `${match[3]}th` : '';
      } else {
        // Default case for regular numbered streets
        streetName = match[2].trim();
        streetNumber = match[3] ? `${match[3]}th` : '';
      }

      console.log(`📊 Parsed components:`, { buildingName, streetName, streetNumber });

      // Validate street name exists (including city limits)
      const isValidStreet = streetName === 'Northern City Limits' ||
                           streetName === 'Western City Limits' ||
                           STREET_NAMES.some(name => name.toLowerCase() === streetName.toLowerCase());

      if (!isValidStreet) {
        console.log(`❌ Street "${streetName}" not found in STREET_NAMES or city limits`);
        console.log(`💡 Available streets starting with "${streetName.charAt(0).toLowerCase()}":`,
          STREET_NAMES.filter(name => name.toLowerCase().startsWith(streetName.charAt(0).toLowerCase())));
        return null;
      }

      // Determine building type
      let buildingType: 'shop' | 'guild' = 'shop';
      if (GUILD_NAMES.some(guild => buildingName.toLowerCase().includes(guild.toLowerCase()))) {
        buildingType = 'guild';
      }

      console.log(`🏢 Building type determined: ${buildingType}`);

      const result = {
        buildingName,
        buildingType,
        streetName,
        streetNumber,
        coordinate: parseLocationToCoordinate(streetName, streetNumber)
      };

      console.log(`🎯 Final result:`, result);
      return result;
    }
  }

  console.log(`❌ No patterns matched for: "${description}"`);
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
    for (const report of sampleReports) {
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
    }
  }
};

// Call this when the module loads - COMMENTED OUT to avoid persistent sample data
// initializeSampleData();

// Export the function so it can be called manually if needed for testing
export { initializeSampleData };

// Clear all reported locations (useful for testing)
export function clearAllReportedLocations(): void {
  reportedLocations = [];
  localStorage.removeItem(STORAGE_KEY);
}

// Initialize the module by loading existing data
loadReportedLocations();

// Set up periodic cleanup (every hour)
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupExpiredLocations();
  }, 60 * 60 * 1000); // Run every hour
}

// Export cleanup function for manual use
export { cleanupExpiredLocations };