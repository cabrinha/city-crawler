// Pure Discord message parsers (no Discord.js / DB side effects).
// Extracted from backend/discordBot.js so they can be unit-tested.
// `log` accepts any object with a `warn` method (e.g. { warn: logWarning });
// it defaults to console and is only used for parse-failure warnings.

// Street names from the official game data (from streets.html)
// Array indices 0-99 map to game coordinates 1-100
const STREET_NAMES = [
  // First 50 streets (west half) - animals, trees, and other names
  'Aardvark', 'Alder', 'Buzzard', 'Beech', 'Cormorant', 'Cedar', 'Duck', 'Dogwood', 'Eagle', 'Elm',
  'Ferret', 'Fir', 'Gibbon', 'Gum', 'Haddock', 'Holly', 'Iguana', 'Ivy', 'Jackal', 'Juniper',
  'Kraken', 'Knotweed', 'Lion', 'Larch', 'Mongoose', 'Maple', 'Nightingale', 'Nettle', 'Octopus', 'Olive',
  'Pilchard', 'Pine', 'Quail', 'Quince', 'Raven', 'Ragweed', 'Squid', 'Sycamore', 'Tapir', 'Teasel',
  'Unicorn', 'Umbrella', 'Vulture', 'Vervain', 'Walrus', 'Willow', 'Yak', 'Yew', 'Zebra', 'Zelkova',

  // Second 50 streets (east half) - minerals, emotions, and malaise
  'Amethyst', 'Anguish', 'Beryl', 'Bleak', 'Cobalt', 'Chagrin', 'Diamond', 'Despair', 'Emerald', 'Ennui',
  'Flint', 'Fear', 'Gypsum', 'Gloom', 'Hessite', 'Horror', 'Ivory', 'Ire', 'Jet', 'Jaded',
  'Kyanite', 'Killjoy', 'Lead', 'Lonely', 'Malachite', 'Malaise', 'Nickel', 'Nervous', 'Obsidian', 'Oppression',
  'Pyrites', 'Pessimism', 'Quartz', 'Qualms', 'Ruby', 'Regret', 'Steel', 'Sorrow', 'Turquoise', 'Torment',
  'Uranium', 'Unctuous', 'Vauxite', 'Vexation', 'Wulfenite', 'Woe', 'Yuksporite', 'Yearning', 'Zinc', 'Zestless'
];

// Street name mapping for coordinate lookup
// Array indices 0-99 map to game coordinates 1-100
const streetNameToIndex = {};
STREET_NAMES.forEach((name, index) => {
  streetNameToIndex[name.toLowerCase()] = index;
});

// Convert street name to coordinate
export function getCoordinateFromStreetName(streetName) {
  const normalizedName = streetName.toLowerCase().trim();
  const index = streetNameToIndex[normalizedName];
  if (index !== undefined) {
    // Convert from array index (0-99) to game coordinate (1-100)
    return (index * 2) + 2; // This matches the mapping in cityData.ts
  }
  return null;
}

// Parse credited contributors from Discord message
export function parseCredits(messageContent) {
  const lines = messageContent.split('\n');
  const credits = [];

  for (const line of lines) {
    // Look for credit lines (case insensitive, handle bold formatting)
    const cleanLine = line.replace(/\*+/g, '').trim();
    const creditMatch = cleanLine.match(/^Credits?:\s*(.+)$/i);

    if (creditMatch) {
      const creditString = creditMatch[1].trim();
      // Split by comma and clean up each name
      const names = creditString.split(',').map(name => name.trim()).filter(name => name.length > 0);
      credits.push(...names);

      break; // Found credits, no need to continue
    }
  }

  return credits;
}

// Parse guild location from Discord message
export function parseGuildLocations(messageContent, log = console) {
  const guilds = [];
  const lines = messageContent.split('\n');

  for (const line of lines) {
    // Skip empty lines, credit lines, next move lines, etc.
    if (!line.trim() ||
        line.toLowerCase().includes('credit:') ||
        line.includes('NEXT MOVE:') ||
        line.includes('<t:') ||
        line.toLowerCase().startsWith('*credit:')) {
      continue;
    }

    // Remove bold formatting and other Discord formatting
    const cleanLine = line.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();

    // Look for guild-specific patterns
    const patterns = [
      // Guild patterns: "Guild Name Level - Street & Number"
      /^(.+?)\s+(\d)\s*-\s*(.+?)\s*&\s*(.+?)$/,  // "Guild Name 1 - Street & Number"
      /^(.+?)\s+(\d)\s*-\s*(.+?)\s+and\s+(.+?)$/,  // "Guild Name 1 - Street and Number"

      // Standard shop-like patterns but for guilds
      /^(.+?)\s*-\s*(.+?)\s*&\s*(.+?)$/,  // "Guild Name - Street & Number"
      /^(.+?),\s*right\s+by\s+(.+?)\s*&\s*(.+?)$/,  // "Guild Name, right by Street & Number"
      /^(.+?)\s*-\s*(.+?)\s+and\s+(.+?)$/,  // "Guild Name - Street and Number"
      /^(.+?),\s*right\s+by\s+(.+?)\s+and\s+(.+?)$/,  // "Guild Name, right by Street and Number"
      /^(.+?)\s*at\s+(.+?)\s+and\s+(.+?)$/,  // "Guild Name at Street and Number"
      /^(.+?)\s*on\s+(.+?)\s+and\s+(.+?)$/,  // "Guild Name on Street and Number"
      /^(.+?),\s*(.+?)\s+and\s+(.+?)$/,      // "Guild Name, Street and Number"
    ];

    for (const pattern of patterns) {
      const match = cleanLine.match(pattern);
      if (match) {
        let guildName, guildLevel, streetName, streetNumber;

        // Check if this is the "Guild Name Level - Street & Number" format
        if (match.length === 5 && /^\d$/.test(match[2])) {
          guildName = match[1].trim();
          guildLevel = parseInt(match[2]);
          streetName = match[3].trim();
          streetNumber = match[4].trim();
        } else {
          // Standard format - extract level from guild name if present
          guildName = match[1].trim();
          streetName = match[2].trim();
          streetNumber = match[3].trim();

          // Try to extract guild level from name (e.g., "Thieves Guild 2" -> level 2)
          const levelMatch = guildName.match(/(.+?)\s+(\d)$/);
          if (levelMatch) {
            guildName = levelMatch[1].trim();
            guildLevel = parseInt(levelMatch[2]);
          } else {
            guildLevel = 1; // Default level if not specified
          }
        }

        // Convert street name to coordinate
        let streetX = null;
        if (streetName.toLowerCase() === 'wcl' || streetName.toLowerCase() === 'western city limits') {
          streetX = 1; // Western City Limits
        } else {
          streetX = getCoordinateFromStreetName(streetName);
        }

        // Convert street number to coordinate
        let streetY = null;
        if (streetNumber.toLowerCase() === 'ncl' || streetNumber.toLowerCase() === 'northern city limits') {
          streetY = 1; // Northern City Limits
        } else if (streetNumber.toLowerCase() === 'wcl' || streetNumber.toLowerCase() === 'western city limits') {
          // Handle case where WCL is in the street number position (unusual but possible)
          streetX = 1; // Western City Limits is X coordinate
          streetY = 1; // Default Y if WCL is used as street number
        } else {
          const numMatch = streetNumber.match(/(\d+)/);
          if (numMatch) {
            const num = parseInt(numMatch[1]);
            streetY = (num - 1) * 2 + 2; // Convert street number to coordinate (matches frontend logic)
          }
        }

        if (streetX && streetY) {
          // Building locations are at odd coordinates (intersections + 1)
          const buildingX = streetX + 1;
          const buildingY = streetY + 1;

          guilds.push({
            name: guildName,
            level: guildLevel,
            streetName: streetName,
            streetNumber: streetNumber,
            coordinate: { x: buildingX, y: buildingY }
          });

        } else {
          log.warn('Failed to parse coordinates for guild', {
            guild_name: guildName,
            guild_level: guildLevel,
            street_name: streetName,
            street_number: streetNumber,
            raw_line: cleanLine
          });
        }
        break; // Found a match, move to next line
      }
    }
  }

  return guilds;
}

// Parse shop location from Discord message
export function parseShopLocations(messageContent, log = console) {
  const shops = [];
  const lines = messageContent.split('\n');

  for (const line of lines) {
    // Skip empty lines, credit lines, next move lines, etc.
    if (!line.trim() ||
        line.toLowerCase().includes('credit:') ||
        line.includes('NEXT MOVE:') ||
        line.includes('<t:') ||
        line.toLowerCase().startsWith('*credit:')) {
      continue;
    }

    // Remove bold formatting and other Discord formatting
    const cleanLine = line.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();

    // Look for various patterns matching Discord shop reports
    const patterns = [
      /^(.+?)\s*-\s*(.+?)\s*&\s*(.+?)$/,  // "Shop Name - Street & Number"
      /^(.+?),\s*right\s+by\s+(.+?)\s*&\s*(.+?)$/,  // "Shop Name, right by Street & Number"

      // Patterns with "and" instead of "&" (common in Discord messages)
      /^(.+?)\s*-\s*(.+?)\s+and\s+(.+?)$/,  // "Shop Name - Street and Number"
      /^(.+?),\s*right\s+by\s+(.+?)\s+and\s+(.+?)$/,  // "Shop Name, right by Street and Number"
      /^(.+?)\s*at\s+(.+?)\s+and\s+(.+?)$/,  // "Shop Name at Street and Number"
      /^(.+?)\s*on\s+(.+?)\s+and\s+(.+?)$/,  // "Shop Name on Street and Number"
      /^(.+?),\s*(.+?)\s+and\s+(.+?)$/,      // "Shop Name, Street and Number"
    ];

    for (const pattern of patterns) {
      const match = cleanLine.match(pattern);
      if (match) {
        const shopName = match[1].trim();
        const streetName = match[2].trim();
        const streetNumber = match[3].trim();

        // Convert street name to coordinate
        const streetX = getCoordinateFromStreetName(streetName);

        // Convert street number to coordinate
        let streetY = null;
        if (streetNumber.toLowerCase() === 'ncl') {
          streetY = 1; // Northern City Limits
        } else {
          const numMatch = streetNumber.match(/(\d+)/);
          if (numMatch) {
            const num = parseInt(numMatch[1]);
            streetY = (num - 1) * 2 + 2; // Convert street number to coordinate (matches frontend logic)
          }
        }

        if (streetX && streetY) {
          // Building locations are at odd coordinates (intersections + 1)
          const buildingX = streetX + 1;
          const buildingY = streetY + 1;

          shops.push({
            name: shopName,
            streetName: streetName,
            streetNumber: streetNumber,
            coordinate: { x: buildingX, y: buildingY }
          });

        } else {
          log.warn('Failed to parse coordinates for shop', {
            shop_name: shopName,
            street_name: streetName,
            street_number: streetNumber,
            raw_line: cleanLine
          });
        }
        break; // Found a match, move to next line
      }
    }
  }

  return shops;
}
