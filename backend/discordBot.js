import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from 'discord.js';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

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

// Helper functions for structured logging
function logInfo(message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'INFO',
    source: 'discord_bot',
    message,
    ...data
  };
  console.log(JSON.stringify(logEntry));
}

function logWarning(message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'WARNING',
    source: 'discord_bot',
    message,
    ...data
  };
  console.log(JSON.stringify(logEntry));
}

function logError(message, error = null, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'ERROR',
    source: 'discord_bot',
    message,
    error: error ? error.message : null,
    ...data
  };
  console.log(JSON.stringify(logEntry));
}

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'city_crawler',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // Smaller pool for bot
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Convert street name to coordinate
function getCoordinateFromStreetName(streetName) {
  const normalizedName = streetName.toLowerCase().trim();
  const index = streetNameToIndex[normalizedName];
  if (index !== undefined) {
    // Convert from array index (0-99) to game coordinate (1-100)
    return (index * 2) + 2; // This matches the mapping in cityData.ts
  }
  return null;
}

// Parse credited contributors from Discord message
function parseCredits(messageContent) {
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

      logInfo('Parsed credits from Discord message', {
        credit_line: cleanLine,
        credited_users: names,
        count: names.length
      });
      break; // Found credits, no need to continue
    }
  }

  return credits;
}

// Parse guild location from Discord message
function parseGuildLocations(messageContent) {
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

    // Debug logging for pattern matching
    if (cleanLine.length > 0 && !cleanLine.toLowerCase().includes('credit') && !cleanLine.includes('NEXT MOVE:') && !cleanLine.includes('<t:')) {
      logInfo('Attempting to parse guild line', {
        original_line: line,
        clean_line: cleanLine,
        line_length: cleanLine.length
      });
    }

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

          logInfo('Parsed guild location', {
            guild_name: guildName,
            guild_level: guildLevel,
            street_name: streetName,
            street_number: streetNumber,
            coordinates: { x: buildingX, y: buildingY },
            pattern_matched: pattern.toString(),
            clean_line: cleanLine
          });
        } else {
          logWarning('Failed to parse coordinates for guild', {
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
function parseShopLocations(messageContent) {
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

    // Debug logging for pattern matching
    if (cleanLine.length > 0 && !cleanLine.toLowerCase().includes('credit') && !cleanLine.includes('NEXT MOVE:') && !cleanLine.includes('<t:')) {
      logInfo('Attempting to parse line', {
        original_line: line,
        clean_line: cleanLine,
        line_length: cleanLine.length
      });
    }

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

          logInfo('Parsed shop location', {
            shop_name: shopName,
            street_name: streetName,
            street_number: streetNumber,
            coordinates: { x: buildingX, y: buildingY }
          });
        } else {
          logWarning('Failed to parse coordinates for shop', {
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

// Report guild location to database for multiple credited users
async function reportGuildLocation(guild, messageAuthor, messageTimestamp, creditedUsers = [], bypassTimeLimit = false) {
  try {
    // Check if message is more than 12 hours old (only for automatic monitoring)
    if (!bypassTimeLimit) {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      if (messageTimestamp < twelveHoursAgo) {
        logWarning('Skipping old guild message - more than 12 hours old', {
          message_timestamp: messageTimestamp.toISOString(),
          guild_name: guild.name,
          guild_level: guild.level,
          author: messageAuthor
        });
        return { success: false, reports: 0 };
      }
    }

    // Determine the primary reporter and prepare credits
    const primaryReporter = creditedUsers.length > 0 ? creditedUsers[0] : 'Discord Bot';
    const allCreditedUsers = creditedUsers.length > 0 ? creditedUsers : ['Discord Bot'];

    // Ensure all credited users exist in the users table
    for (const username of allCreditedUsers) {
      await pool.query(`
        INSERT INTO users (username, total_reports)
        VALUES ($1, 0)
        ON CONFLICT (username) DO NOTHING
      `, [username]);
    }

    // Remove any existing reports for the same guild and level (to match API behavior)
    await pool.query(`
      UPDATE location_reports
      SET is_active = FALSE
      WHERE building_name = $1 AND building_type = $2 AND guild_level = $3 AND is_active = TRUE
    `, [guild.name, 'guild', guild.level]);

    // Create ONE report per guild with all credits in notes
    const notes = creditedUsers.length > 0
      ? `Auto-reported from Discord by ${messageAuthor}. Credits: ${creditedUsers.join(', ')}`
      : `Auto-reported from Discord by ${messageAuthor}`;

    const insertQuery = `
      INSERT INTO location_reports (
        building_name, building_type, coordinate_x, coordinate_y,
        street_name, street_number, guild_level, reporter_username, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    try {
      const result = await pool.query(insertQuery, [
        guild.name,
        'guild',
        guild.coordinate.x,
        guild.coordinate.y,
        guild.streetName,
        guild.streetNumber,
        guild.level,
        primaryReporter,
        notes
      ]);

      const newReport = result.rows[0];

      logInfo('Guild location reported successfully', {
        report_id: newReport.id,
        guild_name: newReport.building_name,
        guild_level: newReport.guild_level,
        coordinates: { x: newReport.coordinate_x, y: newReport.coordinate_y },
        location: `${guild.streetName} & ${guild.streetNumber}`,
        primary_reporter: primaryReporter,
        all_credited_users: allCreditedUsers,
        discord_author: messageAuthor,
        message_timestamp: messageTimestamp.toISOString(),
        group_credit: creditedUsers.length > 1,
        time_limit_bypassed: bypassTimeLimit
      });

      return { success: true, reports: 1 };

    } catch (reportError) {
      logError('Failed to create guild report', reportError, {
        guild_name: guild.name,
        guild_level: guild.level,
        primary_reporter: primaryReporter,
        discord_author: messageAuthor
      });
      return { success: false, reports: 0 };
    }
  } catch (error) {
    logError('Failed to report guild location', error, {
      guild_name: guild.name,
      guild_level: guild.level,
      coordinates: guild.coordinate,
      discord_author: messageAuthor,
      credited_users: creditedUsers
    });
    return { success: false, reports: 0 };
  }
}

// Report shop location to database for multiple credited users
async function reportShopLocation(shop, messageAuthor, messageTimestamp, creditedUsers = [], bypassTimeLimit = false) {
  try {
    // Check if message is more than 12 hours old (only for automatic monitoring)
    if (!bypassTimeLimit) {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      if (messageTimestamp < twelveHoursAgo) {
        logWarning('Skipping old message - more than 12 hours old', {
          message_timestamp: messageTimestamp.toISOString(),
          shop_name: shop.name,
          author: messageAuthor
        });
        return { success: false, reports: 0 };
      }
    }

    // Determine the primary reporter and prepare credits
    const primaryReporter = creditedUsers.length > 0 ? creditedUsers[0] : 'Discord Bot';
    const allCreditedUsers = creditedUsers.length > 0 ? creditedUsers : ['Discord Bot'];

    // Ensure all credited users exist in the users table
    for (const username of allCreditedUsers) {
      await pool.query(`
        INSERT INTO users (username, total_reports)
        VALUES ($1, 0)
        ON CONFLICT (username) DO NOTHING
      `, [username]);
    }

    // Remove any existing reports for the same building (to match API behavior)
    await pool.query(`
      UPDATE location_reports
      SET is_active = FALSE
      WHERE building_name = $1 AND building_type = $2 AND is_active = TRUE
    `, [shop.name, 'shop']);

    // Create ONE report per shop with all credits in notes
    const notes = creditedUsers.length > 0
      ? `Auto-reported from Discord by ${messageAuthor}. Credits: ${creditedUsers.join(', ')}`
      : `Auto-reported from Discord by ${messageAuthor}`;

    const insertQuery = `
      INSERT INTO location_reports (
        building_name, building_type, coordinate_x, coordinate_y,
        street_name, street_number, reporter_username, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    try {
      const result = await pool.query(insertQuery, [
        shop.name,
        'shop',
        shop.coordinate.x,
        shop.coordinate.y,
        shop.streetName,
        shop.streetNumber,
        primaryReporter,
        notes
      ]);

      const newReport = result.rows[0];

      logInfo('Shop location reported successfully', {
        report_id: newReport.id,
        shop_name: newReport.building_name,
        coordinates: { x: newReport.coordinate_x, y: newReport.coordinate_y },
        location: `${shop.streetName} & ${shop.streetNumber}`,
        primary_reporter: primaryReporter,
        all_credited_users: allCreditedUsers,
        discord_author: messageAuthor,
        message_timestamp: messageTimestamp.toISOString(),
        group_credit: creditedUsers.length > 1,
        time_limit_bypassed: bypassTimeLimit
      });

      return { success: true, reports: 1 };

    } catch (reportError) {
      logError('Failed to create report', reportError, {
        shop_name: shop.name,
        primary_reporter: primaryReporter,
        discord_author: messageAuthor
      });
      return { success: false, reports: 0 };
    }
  } catch (error) {
    logError('Failed to report shop location', error, {
      shop_name: shop.name,
      coordinates: shop.coordinate,
      discord_author: messageAuthor,
      credited_users: creditedUsers
    });
    return { success: false, reports: 0 };
  }
}

// Register slash commands
async function registerSlashCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('parse-shops')
      .setDescription('Parse shop locations from a specific message')
      .addStringOption(option =>
        option.setName('message_id')
          .setDescription('The ID of the message to parse for shop locations')
          .setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName('parse-guilds')
      .setDescription('Parse guild locations from a specific message')
      .addStringOption(option =>
        option.setName('message_id')
          .setDescription('The ID of the message to parse for guild locations')
          .setRequired(true)
      )
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    logInfo('Registering slash commands');

    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    logInfo('Successfully registered slash commands');
  } catch (error) {
    logError('Failed to register slash commands', error);
  }
}

// Process a specific guild message by ID
async function processGuildMessageById(messageId, channelId, interactionUser) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      throw new Error(`Could not access channel ${channelId}`);
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      throw new Error(`Could not find message ${messageId}`);
    }

    logInfo('Processing guild message by ID via slash command', {
      message_id: messageId,
      original_author: message.author.username,
      requested_by: interactionUser.username,
      message_timestamp: message.createdAt.toISOString(),
      content_length: message.content.length
    });

    // Parse guild locations and credits from the fetched message
    const guilds = parseGuildLocations(message.content);
    const creditedUsers = parseCredits(message.content);

    if (guilds.length === 0) {
      logInfo('No guild locations found in requested message', {
        message_id: messageId,
        original_author: message.author.username,
        requested_by: interactionUser.username
      });
      return {
        success: false,
        message: 'No guild locations found in the specified message',
        guilds: 0,
        reports: 0
      };
    }

    logInfo('Found guild locations in requested message', {
      message_id: messageId,
      original_author: message.author.username,
      requested_by: interactionUser.username,
      guild_count: guilds.length,
      credited_users: creditedUsers,
      credited_count: creditedUsers.length,
      guilds: guilds.map(g => ({ name: g.name, level: g.level, location: `${g.streetName} & ${g.streetNumber}` }))
    });

    // Report each guild for each credited user
    let totalReports = 0;
    let failedGuilds = 0;

    for (const guild of guilds) {
      const result = await reportGuildLocation(
        guild,
        `${message.author.username} (via slash command by ${interactionUser.username})`,
        message.createdAt,
        creditedUsers,
        true // Bypass time limit for slash commands
      );
      if (result.success) {
        totalReports += result.reports;
      } else {
        failedGuilds++;
      }
    }

    logInfo('Slash command guild reporting completed', {
      message_id: messageId,
      original_author: message.author.username,
      requested_by: interactionUser.username,
      total_guilds: guilds.length,
      credited_users: creditedUsers,
      total_reports_created: totalReports,
      failed_guilds: failedGuilds
    });

    return {
      success: true,
      message: `Successfully processed ${guilds.length} guilds with ${totalReports} total reports created`,
      guilds: guilds.length,
      reports: totalReports,
      credits: creditedUsers,
      failedGuilds: failedGuilds
    };

  } catch (error) {
    logError('Failed to process guild message by ID', error, {
      message_id: messageId,
      channel_id: channelId,
      requested_by: interactionUser.username
    });
    return {
      success: false,
      message: `Error processing guild message: ${error.message}`,
      guilds: 0,
      reports: 0
    };
  }
}

// Process a specific message by ID
async function processMessageById(messageId, channelId, interactionUser) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      throw new Error(`Could not access channel ${channelId}`);
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      throw new Error(`Could not find message ${messageId}`);
    }

    logInfo('Processing message by ID via slash command', {
      message_id: messageId,
      original_author: message.author.username,
      requested_by: interactionUser.username,
      message_timestamp: message.createdAt.toISOString(),
      content_length: message.content.length
    });

    // Parse shop locations and credits from the fetched message
    const shops = parseShopLocations(message.content);
    const creditedUsers = parseCredits(message.content);

    if (shops.length === 0) {
      logInfo('No shop locations found in requested message', {
        message_id: messageId,
        original_author: message.author.username,
        requested_by: interactionUser.username
      });
      return {
        success: false,
        message: 'No shop locations found in the specified message',
        shops: 0,
        reports: 0
      };
    }

    logInfo('Found shop locations in requested message', {
      message_id: messageId,
      original_author: message.author.username,
      requested_by: interactionUser.username,
      shop_count: shops.length,
      credited_users: creditedUsers,
      credited_count: creditedUsers.length,
      shops: shops.map(s => ({ name: s.name, location: `${s.streetName} & ${s.streetNumber}` }))
    });

    // Report each shop for each credited user
    let totalReports = 0;
    let failedShops = 0;

        for (const shop of shops) {
      const result = await reportShopLocation(
        shop,
        `${message.author.username} (via slash command by ${interactionUser.username})`,
        message.createdAt,
        creditedUsers,
        true // Bypass time limit for slash commands
      );
      if (result.success) {
        totalReports += result.reports;
      } else {
        failedShops++;
      }
    }

    logInfo('Slash command shop reporting completed', {
      message_id: messageId,
      original_author: message.author.username,
      requested_by: interactionUser.username,
      total_shops: shops.length,
      credited_users: creditedUsers,
      total_reports_created: totalReports,
      failed_shops: failedShops,
      reports_per_shop: creditedUsers.length > 0 ? creditedUsers.length : 1
    });

    return {
      success: true,
      message: `Successfully processed ${shops.length} shops with ${totalReports} total reports created`,
      shops: shops.length,
      reports: totalReports,
      credits: creditedUsers,
      failedShops: failedShops
    };

  } catch (error) {
    logError('Failed to process message by ID', error, {
      message_id: messageId,
      channel_id: channelId,
      requested_by: interactionUser.username
    });
    return {
      success: false,
      message: `Error processing message: ${error.message}`,
      shops: 0,
      reports: 0
    };
  }
}

// Bot event handlers
client.on('ready', async () => {
  logInfo('Discord bot is ready', {
    bot_user: client.user.tag,
    guild_count: client.guilds.cache.size
  });

  // Register slash commands
  await registerSlashCommands();

    // Log monitoring channels and verify access
  const SHOP_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
  const GUILD_CHANNEL_ID = '1374842501839458334';

  logInfo('Message monitoring configured', {
    shop_channel_id: SHOP_CHANNEL_ID,
    guild_channel_id: GUILD_CHANNEL_ID,
    monitoring_method: 'messageCreate_event'
  });

  // Verify bot can access both channels
  try {
    if (SHOP_CHANNEL_ID) {
      const shopChannel = await client.channels.fetch(SHOP_CHANNEL_ID);
      logInfo('Shop channel access verified', {
        channel_id: SHOP_CHANNEL_ID,
        channel_name: shopChannel?.name,
        channel_type: shopChannel?.type,
        can_view: !!shopChannel
      });
    }

    const guildChannel = await client.channels.fetch(GUILD_CHANNEL_ID);
    logInfo('Guild channel access verified', {
      channel_id: GUILD_CHANNEL_ID,
      channel_name: guildChannel?.name,
      channel_type: guildChannel?.type,
      can_view: !!guildChannel
    });
  } catch (error) {
    logError('Failed to verify channel access', error, {
      shop_channel_id: SHOP_CHANNEL_ID,
      guild_channel_id: GUILD_CHANNEL_ID
    });
  }
});

// Event-driven message monitoring for both shops and guilds
client.on('messageCreate', async (message) => {
  const SHOP_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
  const GUILD_CHANNEL_ID = '1374842501839458334'; // Guild channel ID

  // Skip messages from bots
  if (message.author.bot) {
    return;
  }

  // Determine message type based on channel
  let messageType = null;
  if (message.channel.id === SHOP_CHANNEL_ID) {
    messageType = 'shop';
  } else if (message.channel.id === GUILD_CHANNEL_ID) {
    messageType = 'guild';
  } else {
    // Not a monitored channel, skip
    return;
  }

  logInfo('Discord message received', {
    author: message.author.username,
    channel: message.channel.name,
    channel_id: message.channel.id,
    message_id: message.id,
    timestamp: message.createdAt.toISOString(),
    content_length: message.content.length,
    message_type: messageType,
    is_monitored: true
  });

  try {
    await processDiscordMessage(message, messageType);
  } catch (error) {
    logError('Error processing Discord message', error, {
      message_id: message.id,
      author: message.author.username,
      channel_id: message.channel.id,
      message_type: messageType
    });
  }
});

// Extract message processing logic into separate function
async function processDiscordMessage(message, messageType = 'shop') {
  logInfo('Processing Discord message', {
    author: message.author.username,
    channel: message.channel.name,
    message_id: message.id,
    timestamp: message.createdAt.toISOString(),
    content_length: message.content.length,
    message_type: messageType,
    message_preview: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
  });

  const creditedUsers = parseCredits(message.content);

  if (messageType === 'shop') {
    // Parse shop locations from message
    const shops = parseShopLocations(message.content);

    if (shops.length === 0) {
      logInfo('No shop locations found in message', {
        author: message.author.username,
        message_content: message.content.substring(0, 200) + (message.content.length > 200 ? '...' : '')
      });
      return;
    }

    logInfo('Found shop locations in Discord message', {
      author: message.author.username,
      shop_count: shops.length,
      credited_users: creditedUsers,
      credited_count: creditedUsers.length,
      shops: shops.map(s => ({ name: s.name, location: `${s.streetName} & ${s.streetNumber}` }))
    });

    // Report each shop
    let totalReports = 0;
    let failedShops = 0;

    for (const shop of shops) {
      const result = await reportShopLocation(shop, message.author.username, message.createdAt, creditedUsers, false); // Apply 12-hour limit for automatic monitoring
      if (result.success) {
        totalReports += result.reports;
      } else {
        failedShops++;
      }
    }

    logInfo('Discord shop reporting completed', {
      author: message.author.username,
      total_shops: shops.length,
      credited_users: creditedUsers,
      total_reports_created: totalReports,
      failed_shops: failedShops
    });

  } else if (messageType === 'guild') {
    // Parse guild locations from message
    const guilds = parseGuildLocations(message.content);

    if (guilds.length === 0) {
      logInfo('No guild locations found in message', {
        author: message.author.username,
        message_content: message.content.substring(0, 200) + (message.content.length > 200 ? '...' : '')
      });
      return;
    }

    logInfo('Found guild locations in Discord message', {
      author: message.author.username,
      guild_count: guilds.length,
      credited_users: creditedUsers,
      credited_count: creditedUsers.length,
      guilds: guilds.map(g => ({ name: g.name, level: g.level, location: `${g.streetName} & ${g.streetNumber}` }))
    });

    // Report each guild
    let totalReports = 0;
    let failedGuilds = 0;

    for (const guild of guilds) {
      const result = await reportGuildLocation(guild, message.author.username, message.createdAt, creditedUsers, false); // Apply 12-hour limit for automatic monitoring
      if (result.success) {
        totalReports += result.reports;
      } else {
        failedGuilds++;
      }
    }

    logInfo('Discord guild reporting completed', {
      author: message.author.username,
      total_guilds: guilds.length,
      credited_users: creditedUsers,
      total_reports_created: totalReports,
      failed_guilds: failedGuilds
    });
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'parse-guilds') {
    try {
      // Defer the reply since processing might take a while
      await interaction.deferReply({ flags: 64 }); // 64 = EPHEMERAL flag

      const messageId = interaction.options.getString('message_id');
      const channelId = interaction.channelId;

      logInfo('Guild slash command received', {
        command: commandName,
        message_id: messageId,
        channel_id: channelId,
        user: interaction.user.username
      });

      // Process the message for guilds
      const result = await processGuildMessageById(messageId, channelId, interaction.user);

      // Prepare response message
      let responseMessage = result.message;

      if (result.success) {
        responseMessage += `\n\n📊 **Details:**`;
        responseMessage += `\n• Guilds found: ${result.guilds}`;
        responseMessage += `\n• Total reports created: ${result.reports}`;

        if (result.credits && result.credits.length > 0) {
          responseMessage += `\n• Credited users: ${result.credits.join(', ')}`;
        }

        if (result.failedGuilds > 0) {
          responseMessage += `\n⚠️ Failed to process ${result.failedGuilds} guilds`;
        }
      }

      await interaction.editReply(responseMessage);

    } catch (error) {
      logError('Error handling guild slash command', error, {
        command: commandName,
        user: interaction.user.username
      });

      const errorMessage = 'An error occurred while processing the guild command. Please check the message ID and try again.';

      if (interaction.deferred) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply({ content: errorMessage, flags: 64 }); // 64 = EPHEMERAL flag
      }
    }
  } else if (commandName === 'parse-shops') {
    try {
      // Defer the reply since processing might take a while
      await interaction.deferReply({ flags: 64 }); // 64 = EPHEMERAL flag

      const messageId = interaction.options.getString('message_id');
      const channelId = interaction.channelId;

      logInfo('Slash command received', {
        command: commandName,
        message_id: messageId,
        channel_id: channelId,
        user: interaction.user.username
      });

      // Process the message
      const result = await processMessageById(messageId, channelId, interaction.user);

      // Prepare response message
      let responseMessage = result.message;

      if (result.success) {
        responseMessage += `\n\n📊 **Details:**`;
        responseMessage += `\n• Shops found: ${result.shops}`;
        responseMessage += `\n• Total reports created: ${result.reports}`;

        if (result.credits && result.credits.length > 0) {
          responseMessage += `\n• Credited users: ${result.credits.join(', ')}`;
        }

        if (result.failedShops > 0) {
          responseMessage += `\n⚠️ Failed to process ${result.failedShops} shops`;
        }
      }

      await interaction.editReply(responseMessage);

    } catch (error) {
      logError('Error handling slash command', error, {
        command: commandName,
        user: interaction.user.username
      });

      const errorMessage = 'An error occurred while processing the command. Please check the message ID and try again.';

      if (interaction.deferred) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply({ content: errorMessage, flags: 64 }); // 64 = EPHEMERAL flag
      }
    }
  }
});

client.on('error', (error) => {
  logError('Discord client error', error);
});

// Start the bot
export function startDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    logError('DISCORD_BOT_TOKEN environment variable not set');
    return;
  }

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId) {
    logError('DISCORD_CHANNEL_ID environment variable not set');
    return;
  }

  logInfo('Starting Discord bot', {
    channel_id: channelId
  });

  client.login(token).catch(error => {
    logError('Failed to start Discord bot', error);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logInfo('Discord bot shutdown initiated');
  client.destroy();
  await pool.end();
  process.exit(0);
});

export { client, pool };