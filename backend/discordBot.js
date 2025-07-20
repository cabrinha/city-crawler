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

    // Remove bold formatting
    const cleanLine = line.replace(/\*\*\*/g, '').trim();

    // Look for patterns like "Shop Name - Street & Number" or "Shop Name, right by Street & Number"
    const patterns = [
      /^(.+?)\s*-\s*(.+?)\s*&\s*(.+?)$/,  // "Shop Name - Street & Number"
      /^(.+?),\s*right\s+by\s+(.+?)\s*&\s*(.+?)$/,  // "Shop Name, right by Street & Number"
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
            streetY = (num * 2) + 2; // Convert street number to coordinate
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

    // Use credited users if available, otherwise fall back to Discord Bot
    const reportersToCredit = creditedUsers.length > 0 ? creditedUsers : ['Discord Bot'];

    // Ensure all credited users exist in the users table
    for (const username of reportersToCredit) {
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

    let successfulReports = 0;
    const insertQuery = `
      INSERT INTO location_reports (
        building_name, building_type, coordinate_x, coordinate_y,
        street_name, street_number, reporter_username, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    // Create one report per credited user
    for (const reporterUsername of reportersToCredit) {
      try {
        const notes = creditedUsers.length > 0
          ? `Auto-reported from Discord by ${messageAuthor}. Part of group credit: ${creditedUsers.join(', ')}`
          : `Auto-reported from Discord by ${messageAuthor}`;

        const result = await pool.query(insertQuery, [
          shop.name,
          'shop',
          shop.coordinate.x,
          shop.coordinate.y,
          shop.streetName,
          shop.streetNumber,
          reporterUsername,
          notes
        ]);

        const newReport = result.rows[0];
        successfulReports++;

        logInfo('Shop location reported successfully', {
          report_id: newReport.id,
          shop_name: newReport.building_name,
          coordinates: { x: newReport.coordinate_x, y: newReport.coordinate_y },
          location: `${shop.streetName} & ${shop.streetNumber}`,
          credited_to: reporterUsername,
          discord_author: messageAuthor,
          message_timestamp: messageTimestamp.toISOString(),
          group_credit: creditedUsers.length > 1,
          time_limit_bypassed: bypassTimeLimit
        });
      } catch (reportError) {
        logError('Failed to create individual report', reportError, {
          shop_name: shop.name,
          credited_to: reporterUsername,
          discord_author: messageAuthor
        });
      }
    }

    return { success: successfulReports > 0, reports: successfulReports };
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
});

client.on('messageCreate', async (message) => {
  // Only process messages from the specific channel
  const TARGET_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
  if (!TARGET_CHANNEL_ID) {
    logError('DISCORD_CHANNEL_ID environment variable not set');
    return;
  }

  if (message.channel.id !== TARGET_CHANNEL_ID) {
    return; // Not the target channel
  }

  // Skip messages from bots
  if (message.author.bot) {
    return;
  }

  logInfo('Processing Discord message', {
    author: message.author.username,
    channel: message.channel.name,
    message_id: message.id,
    timestamp: message.createdAt.toISOString(),
    content_length: message.content.length
  });

    // Parse shop locations and credits from message
  const shops = parseShopLocations(message.content);
  const creditedUsers = parseCredits(message.content);

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

  // Report each shop for each credited user
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
    failed_shops: failedShops,
    reports_per_shop: creditedUsers.length > 0 ? creditedUsers.length : 1
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'parse-shops') {
    try {
      // Defer the reply since processing might take a while
      await interaction.deferReply({ ephemeral: true });

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
        await interaction.reply({ content: errorMessage, ephemeral: true });
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