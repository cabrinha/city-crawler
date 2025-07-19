# City Crawler - Vampires Interactive Map

An interactive web-based map for the [Vampires!](https://quiz.ravenblack.net/blood.pl) browser game. This application provides a zoomable, pannable grid view of the 100x100 city with all the buildings and locations.

## Features

- **Interactive Grid Map**: 100x100 tile city grid matching the game layout
- **Zoom & Pan**: Smooth zooming and panning controls
- **Building Locations**: All transit stations, pubs, shops, and banks marked
- **Street Names**: Proper street naming system (trees/animals in west, minerals/malaise in east)
- **Player Location**: Visual indicator of current player position
- **Building Information**: Click on tiles to see building details
- **Game-like Styling**: Dark theme matching the original game aesthetic
- **Shop and guild location reporting system**
- **Discord Bot Integration**: Automatic shop location reporting from Discord messages
- **Multi-user Credit System**: Credits multiple contributors for collaborative reporting

## Game Information

Based on the Vampires! browser game:
- **City Layout**: 100 numbered streets crossed by 100 named streets
- **Transit Stations**: Located at Mongoose/25th, 50th, 75th; Zelkova/25th, 50th, 75th; Malachite/25th, 50th, 75th
- **Buildings**: Pubs, magic shops, banks, and hidden locations scattered throughout
- **Navigation**: Click and drag to pan, use zoom controls, click tiles for info

## Technology Stack

- **TypeScript**: Type-safe development
- **React**: Component-based UI
- **Styled Components**: CSS-in-JS styling
- **Vite**: Fast development and build tool
- **Node.js/Express**: Backend API server
- **PostgreSQL**: Database for location reports and leaderboards
- **Discord.js**: Discord bot integration for automated shop reporting

## Discord Bot Integration

The application includes a Discord bot that automatically monitors a specified Discord channel for shop location updates. When users post shop listings in the configured format, the bot parses the information and reports the locations to the database automatically.

### Supported Message Formats

The bot recognizes these message patterns:

```
***Discount Magic - Beech & 80
Discount Scrolls - Hessite & 80***

Potable Potions - Unicorn & 37
Potion Distillery, right by Wulfenite & 90
Potionworks, right by Flint & 96
The Potion Shoppe - Gloom & 50

Credit: Harleigh, Lannair, Malice, MANTRA
```

#### Credit System

The bot supports crediting multiple contributors for shop locations:

- **Credit formats**: `Credit:` or `Credits:` followed by comma-separated names
- **Multiple reports**: Each credited person gets a separate report for each shop
- **Fallback**: If no credits are found, reports are created under "Discord Bot"

**Examples:**
- `Credit: Harleigh, Lannair, Malice, MANTRA` → 4 people credited
- `Credits: Aydan, Joy, Seyda` → 3 people credited
- No credit line → Reports attributed to "Discord Bot"

For 4 shops with 4 credited users = 16 total reports created (4 × 4)

### Required Environment Variables

To enable the Discord bot, add these environment variables to your `.env` file:

```bash
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=1308920592279539742

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=city_crawler
DB_USER=postgres
DB_PASSWORD=your_db_password
```

### Discord Bot Setup

1. **Create a Discord Application**: Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. **Create a Bot**: In your application, go to the "Bot" section and create a new bot
3. **Get Bot Token**: Copy the bot token and add it to your environment variables
4. **Bot Permissions**: The bot needs these permissions:
   - View Channels
   - Read Message History
   - Read Messages/View Channels
5. **Invite Bot**: Generate an invite link with the required permissions and add the bot to your Discord server
6. **Get Channel ID**: Enable Developer Mode in Discord, right-click the target channel, and copy the ID

### Features

- **Automatic Shop Reporting**: Parses Discord messages and reports shop locations automatically
- **Multi-User Credit System**: Credits multiple contributors per message, creating separate reports for each
- **12-Hour Time Limit**: Only processes messages less than 12 hours old
- **Street Name Recognition**: Converts street names to coordinates using the game's street system
- **Error Handling**: Comprehensive logging and error handling for Discord operations
- **Database Integration**: Reports are stored using the same system as manual reports

## Getting Started

### Frontend Only

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the displayed URL (usually `http://localhost:5173`)

### Full Stack with Backend (includes Discord bot)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your PostgreSQL database and run the schema:
   ```bash
   psql -U postgres -d city_crawler -f backend/database/schema.sql
   ```

3. Configure environment variables in `.env` file (see Discord Bot Integration section above)

4. Start both frontend and backend:
   ```bash
   npm run dev:full
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev
   ```

5. Open your browser to the displayed URL (usually `http://localhost:5173`)

## Controls

- **Mouse Drag**: Pan around the map
- **Zoom In/Out**: Use the control buttons
- **Center on Player**: Return to player location
- **Click Tiles**: Select tiles to see information
- **Hover**: See coordinate and building tooltips

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

This project is for educational and fan purposes. The original Vampires! game is created by RavenBlack.

## Database Considerations

Currently, the application uses localStorage for persistence, which works well for a client-side application but has limitations:

**Current localStorage approach:**
- ✅ Simple implementation
- ✅ No server required
- ✅ Fast access
- ❌ Data lost if user clears browser data
- ❌ No sharing between users
- ❌ Limited storage capacity

**Potential database options:**

**Redis:** Good for high-frequency updates and caching
- ✅ Very fast read/write
- ✅ Good for real-time features
- ✅ Built-in data expiration (useful for shop movements)
- ❌ In-memory (data lost on restart without persistence)
- ❌ Requires server infrastructure

**PostgreSQL:** Best for comprehensive data management
- ✅ ACID compliance and data integrity
- ✅ Complex queries and relationships
- ✅ User accounts and permissions
- ✅ Historical data tracking
- ✅ Robust backup/recovery
- ❌ More complex setup
- ❌ Requires server infrastructure

**Recommendation:** For production use with multiple users, PostgreSQL would be ideal for storing reported locations, user accounts, and historical data, with Redis as a cache layer for frequently accessed location data.

## Development

To clear test data during development, open browser console and run:
```javascript
// Clear all reported locations
localStorage.removeItem('vampire_city_reported_locations');
location.reload();
```