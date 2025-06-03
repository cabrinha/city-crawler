import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
const { Pool } = pkg;

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Helper functions for structured logging
function logInfo(message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'INFO',
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
    message,
    error: error ? error.message : null,
    ...data
  };
  console.log(JSON.stringify(logEntry));
}

const app = express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
// Use CORS all the time but allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware for request logging
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    logInfo('API request', {
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      client_ip: clientIP,
      user_agent: userAgent.substring(0, 100) // Truncate long user agents
    });
  }
  next();
});

// Serve static files from React build in production
if (isProduction) {
  const frontendPath = path.join(__dirname, '../dist');
  app.use(express.static(frontendPath));

  console.log(`📁 Serving static files from: ${frontendPath}`);
}

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'city_crawler',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    logError('Database connection failed', err, {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'city_crawler'
    });
  } else {
    logInfo('Database connection established', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'city_crawler'
    });
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// API Routes

// Get all active location reports
app.get('/api/locations', async (req, res) => {
  try {
    const { building_type, limit = 100 } = req.query;

    let query = 'SELECT * FROM location_reports WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())';
    let params = [];

    if (building_type) {
      query += ' AND building_type = $1';
      params.push(building_type);
    }

    query += ` ORDER BY reported_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    logError('Error fetching locations', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      building_type: req.query.building_type,
      limit: req.query.limit
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new location report
app.post('/api/locations', async (req, res) => {
  try {
    const {
      building_name,
      building_type,
      custom_item_name,
      coordinate_x,
      coordinate_y,
      street_name,
      street_number,
      guild_level,
      reporter_username,
      notes
    } = req.body;

    // Get client IP for logging
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // Validation
    if (!building_name || !building_type) {
      logWarning('Location report submission failed - missing required fields', {
        client_ip: clientIP,
        building_name,
        building_type,
        coordinates: { x: coordinate_x, y: coordinate_y },
        reporter: reporter_username || 'anonymous'
      });
      return res.status(400).json({
        error: 'Missing required fields: building_name, building_type'
      });
    }

    // Coordinates are only required for location-based building types
    const requiresLocation = !['blood_deity', 'rich_vampire'].includes(building_type);
    if (requiresLocation && (!coordinate_x || !coordinate_y)) {
      logWarning('Location report submission failed - missing coordinates for location-based type', {
        client_ip: clientIP,
        building_name,
        building_type,
        coordinates: { x: coordinate_x, y: coordinate_y },
        reporter: reporter_username || 'anonymous'
      });
      return res.status(400).json({
        error: 'coordinate_x and coordinate_y are required for location-based building types'
      });
    }

    const validBuildingTypes = ['shop', 'guild', 'hunter', 'paladin', 'werewolf', 'item', 'blood_deity', 'rich_vampire'];
    if (!validBuildingTypes.includes(building_type)) {
      logWarning('Location report submission failed - invalid building type', {
        client_ip: clientIP,
        building_type,
        reporter: reporter_username || 'anonymous'
      });
      return res.status(400).json({
        error: `Invalid building_type. Must be one of: ${validBuildingTypes.join(', ')}`
      });
    }

    if (building_type === 'item' && !custom_item_name) {
      logWarning('Location report submission failed - missing custom item name', {
        client_ip: clientIP,
        building_type,
        reporter: reporter_username || 'anonymous'
      });
      return res.status(400).json({
        error: 'custom_item_name is required when building_type is "item"'
      });
    }

    if (building_type === 'guild' && guild_level && ![1, 2, 3].includes(guild_level)) {
      logWarning('Location report submission failed - invalid guild level', {
        client_ip: clientIP,
        building_type,
        guild_level,
        reporter: reporter_username || 'anonymous'
      });
      return res.status(400).json({
        error: 'guild_level must be 1, 2, or 3'
      });
    }

    // Remove any existing reports for the same building at the same location
    const deactivateResult = await pool.query(
      'UPDATE location_reports SET is_active = FALSE WHERE building_name = $1 AND coordinate_x = $2 AND coordinate_y = $3 AND is_active = TRUE RETURNING id',
      [building_name, coordinate_x, coordinate_y]
    );

    if (deactivateResult.rows.length > 0) {
      logInfo('Deactivated existing reports for same building/location', {
        building_name,
        coordinates: { x: coordinate_x, y: coordinate_y },
        deactivated_count: deactivateResult.rows.length,
        deactivated_ids: deactivateResult.rows.map(r => r.id)
      });
    }

    // Insert new report
    const insertQuery = `
      INSERT INTO location_reports (
        building_name, building_type, custom_item_name, coordinate_x, coordinate_y,
        street_name, street_number, guild_level, reporter_username, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      building_name,
      building_type,
      custom_item_name || null,
      coordinate_x,
      coordinate_y,
      street_name || null,
      street_number || null,
      guild_level || null,
      reporter_username || null,
      notes || null
    ]);

    const newReport = result.rows[0];

    // Log successful report submission
    logInfo('New location report submitted', {
      report_id: newReport.id,
      building_name: newReport.building_name,
      building_type: newReport.building_type,
      custom_item_name: newReport.custom_item_name,
      coordinates: { x: newReport.coordinate_x, y: newReport.coordinate_y },
      location: `${street_name || 'unknown'} & ${street_number || 'unknown'}`,
      guild_level: newReport.guild_level,
      reporter: newReport.reporter_username || 'anonymous',
      client_ip: clientIP,
      has_notes: !!notes
    });

    res.status(201).json(newReport);
  } catch (error) {
    logError('Error creating location report', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      building_name: req.body.building_name,
      building_type: req.body.building_type,
      reporter: req.body.reporter_username || 'anonymous'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update location confidence
app.patch('/api/locations/:id/confidence', async (req, res) => {
  try {
    const { id } = req.params;
    const { confidence } = req.body;
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    if (!['confirmed', 'unverified'].includes(confidence)) {
      logWarning('Confidence update failed - invalid value', {
        client_ip: clientIP,
        report_id: id,
        attempted_confidence: confidence
      });
      return res.status(400).json({
        error: 'confidence must be "confirmed" or "unverified"'
      });
    }

    const result = await pool.query(
      'UPDATE location_reports SET confidence = $1 WHERE id = $2 AND is_active = TRUE RETURNING building_name, building_type, confidence',
      [confidence, id]
    );

    if (result.rows.length === 0) {
      logWarning('Confidence update failed - report not found', {
        client_ip: clientIP,
        report_id: id,
        confidence
      });
      return res.status(404).json({ error: 'Location report not found' });
    }

    const updatedReport = result.rows[0];
    logInfo('Location report confidence updated', {
      report_id: id,
      building_name: updatedReport.building_name,
      building_type: updatedReport.building_type,
      new_confidence: updatedReport.confidence,
      client_ip: clientIP
    });

    res.json(result.rows[0]);
  } catch (error) {
    logError('Error updating confidence', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      report_id: req.params.id,
      confidence: req.body.confidence
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete (deactivate) a location report
app.delete('/api/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    const result = await pool.query(
      'UPDATE location_reports SET is_active = FALSE WHERE id = $1 AND is_active = TRUE RETURNING building_name, building_type, reporter_username',
      [id]
    );

    if (result.rows.length === 0) {
      logWarning('Location report deletion failed - report not found', {
        client_ip: clientIP,
        report_id: id
      });
      return res.status(404).json({ error: 'Location report not found' });
    }

    const deletedReport = result.rows[0];
    logInfo('Location report deleted', {
      report_id: id,
      building_name: deletedReport.building_name,
      building_type: deletedReport.building_type,
      original_reporter: deletedReport.reporter_username || 'anonymous',
      deleted_by_ip: clientIP
    });

    res.json({ message: 'Location report deleted successfully' });
  } catch (error) {
    logError('Error deleting location report', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      report_id: req.params.id
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top contributors
app.get('/api/contributors', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      'SELECT * FROM top_contributors LIMIT $1',
      [parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    logError('Error fetching contributors', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      limit: req.query.limit
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual cleanup of expired reports
app.post('/api/cleanup', async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    logInfo('Manual cleanup initiated', {
      initiated_by_ip: clientIP
    });

    // Get details of reports that will be expired before cleanup
    const expiredReportsQuery = `
      SELECT building_name, building_type, reporter_username, reported_at, expires_at
      FROM location_reports
      WHERE is_active = TRUE AND expires_at IS NOT NULL AND expires_at <= NOW()
    `;
    const expiredReports = await pool.query(expiredReportsQuery);

    const result = await pool.query('SELECT cleanup_expired_reports()');
    const expiredCount = result.rows[0].cleanup_expired_reports;

    if (expiredCount > 0) {
      logInfo('Manual cleanup completed - reports expired', {
        initiated_by_ip: clientIP,
        expired_count: expiredCount,
        expired_reports: expiredReports.rows.map(report => ({
          building_name: report.building_name,
          building_type: report.building_type,
          reporter: report.reporter_username || 'anonymous',
          reported_at: report.reported_at,
          expired_at: report.expires_at
        }))
      });
    } else {
      logInfo('Manual cleanup completed - no expired reports found', {
        initiated_by_ip: clientIP
      });
    }

    res.json({
      message: `Cleaned up ${expiredCount} expired reports`,
      expired_count: expiredCount
    });
  } catch (error) {
    logError('Error during manual cleanup', error, {
      initiated_by_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const queries = await Promise.all([
      pool.query('SELECT COUNT(*) as total_reports FROM location_reports WHERE is_active = TRUE'),
      pool.query('SELECT building_type, COUNT(*) as count FROM location_reports WHERE is_active = TRUE GROUP BY building_type'),
      pool.query('SELECT COUNT(*) as total_users FROM users WHERE total_reports > 0'),
      pool.query('SELECT COUNT(*) as total_confirmed FROM location_reports WHERE is_active = TRUE AND confidence = \'confirmed\'')
    ]);

    const stats = {
      total_reports: parseInt(queries[0].rows[0].total_reports),
      reports_by_type: queries[1].rows.reduce((acc, row) => {
        acc[row.building_type] = parseInt(row.count);
        return acc;
      }, {}),
      total_contributors: parseInt(queries[2].rows[0].total_users),
      confirmed_reports: parseInt(queries[3].rows[0].total_confirmed)
    };

    res.json(stats);
  } catch (error) {
    logError('Error fetching stats', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Blood Deities leaderboard
app.get('/api/leaderboards/blood-deities', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const result = await pool.query(
      'SELECT * FROM blood_deities_leaderboard LIMIT $1',
      [parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    logError('Error fetching blood deities leaderboard', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      limit: req.query.limit
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Rich Vampires leaderboard
app.get('/api/leaderboards/rich-vampires', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const result = await pool.query(
      'SELECT * FROM rich_vampires_leaderboard LIMIT $1',
      [parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    logError('Error fetching rich vampires leaderboard', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      limit: req.query.limit
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit or update blood deity entry
app.post('/api/leaderboards/blood-deities', async (req, res) => {
  try {
    const { vampire_name, blood_amount, reporter_username } = req.body;
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    if (!vampire_name || blood_amount === undefined || blood_amount === null) {
      logWarning('Blood deity submission failed - missing required fields', {
        client_ip: clientIP,
        vampire_name,
        blood_amount,
        reporter: reporter_username || 'anonymous'
      });
      return res.status(400).json({
        error: 'Missing required fields: vampire_name, blood_amount'
      });
    }

    if (typeof blood_amount !== 'number' || blood_amount < 0) {
      logWarning('Blood deity submission failed - invalid blood amount', {
        client_ip: clientIP,
        vampire_name,
        blood_amount,
        reporter: reporter_username || 'anonymous'
      });
      return res.status(400).json({
        error: 'blood_amount must be a non-negative number'
      });
    }

    const result = await pool.query(`
      INSERT INTO blood_deities (vampire_name, blood_amount, reporter_username)
      VALUES ($1, $2, $3)
      ON CONFLICT (vampire_name)
      DO UPDATE SET
        blood_amount = EXCLUDED.blood_amount,
        last_updated = CURRENT_TIMESTAMP,
        reporter_username = EXCLUDED.reporter_username
      RETURNING *
    `, [vampire_name, blood_amount, reporter_username || null]);

    const bloodDeity = result.rows[0];

    logInfo('Blood deity entry submitted/updated', {
      vampire_name: bloodDeity.vampire_name,
      blood_amount: bloodDeity.blood_amount,
      reporter: bloodDeity.reporter_username || 'anonymous',
      client_ip: clientIP
    });

    res.status(201).json(bloodDeity);
  } catch (error) {
    logError('Error submitting blood deity', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      vampire_name: req.body.vampire_name,
      reporter: req.body.reporter_username || 'anonymous'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit or update rich vampire entry
app.post('/api/leaderboards/rich-vampires', async (req, res) => {
  try {
    const { vampire_name, reporter_username } = req.body;
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    if (!vampire_name) {
      logWarning('Rich vampire submission failed - missing required fields', {
        client_ip: clientIP,
        vampire_name,
        reporter: reporter_username || 'anonymous'
      });
      return res.status(400).json({
        error: 'Missing required field: vampire_name'
      });
    }

    const result = await pool.query(`
      INSERT INTO rich_vampires (vampire_name, reporter_username)
      VALUES ($1, $2)
      ON CONFLICT (vampire_name)
      DO UPDATE SET
        last_updated = CURRENT_TIMESTAMP,
        reporter_username = EXCLUDED.reporter_username
      RETURNING *
    `, [vampire_name, reporter_username || null]);

    const richVampire = result.rows[0];

    logInfo('Rich vampire entry submitted/updated', {
      vampire_name: richVampire.vampire_name,
      reporter: richVampire.reporter_username || 'anonymous',
      client_ip: clientIP
    });

    res.status(201).json(richVampire);
  } catch (error) {
    logError('Error submitting rich vampire', error, {
      client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      vampire_name: req.body.vampire_name,
      reporter: req.body.reporter_username || 'anonymous'
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Catch-all handler: send back React's index.html file in production
if (isProduction) {
  app.get('*', (req, res) => {
    const frontendPath = path.join(__dirname, '../dist');
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Automatic cleanup every hour
setInterval(async () => {
  try {
    logInfo('Automatic cleanup started', {
      cleanup_type: 'scheduled_hourly'
    });

    // Get details of reports that will be expired before cleanup
    const expiredReportsQuery = `
      SELECT building_name, building_type, reporter_username, reported_at, expires_at
      FROM location_reports
      WHERE is_active = TRUE AND expires_at IS NOT NULL AND expires_at <= NOW()
    `;
    const expiredReports = await pool.query(expiredReportsQuery);

    const result = await pool.query('SELECT cleanup_expired_reports()');
    const expiredCount = result.rows[0].cleanup_expired_reports;

    if (expiredCount > 0) {
      logInfo('Automatic cleanup completed - reports expired', {
        cleanup_type: 'scheduled_hourly',
        expired_count: expiredCount,
        expired_reports: expiredReports.rows.map(report => ({
          building_name: report.building_name,
          building_type: report.building_type,
          reporter: report.reporter_username || 'anonymous',
          reported_at: report.reported_at,
          expired_at: report.expires_at,
          expiry_reason: report.building_type === 'shop' ? 'shop_movement_12h' :
                       report.building_type === 'guild' ? 'guild_movement_schedule' : 'other'
        }))
      });

      // Also log a simple message for easy monitoring
      console.log(`🧹 Automatic cleanup: removed ${expiredCount} expired reports`);
    } else {
      logInfo('Automatic cleanup completed - no expired reports found', {
        cleanup_type: 'scheduled_hourly'
      });
    }
  } catch (error) {
    logError('Error during automatic cleanup', error, {
      cleanup_type: 'scheduled_hourly'
    });
  }
}, 60 * 60 * 1000); // Every hour

// Start server
app.listen(port, () => {
  logInfo('Server started', {
    port: port,
    environment: process.env.NODE_ENV || 'development',
    database_host: process.env.DB_HOST || 'localhost',
    database_port: process.env.DB_PORT || 5432,
    database_name: process.env.DB_NAME || 'city_crawler',
    is_production: isProduction
  });

  console.log(`🚀 City Crawler API server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🗄️  Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'city_crawler'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logInfo('Server shutdown initiated', {
    reason: 'SIGINT_received'
  });
  console.log('\n🛑 Shutting down server...');

  try {
    await pool.end();
    logInfo('Database connections closed successfully');
  } catch (error) {
    logError('Error closing database connections', error);
  }

  logInfo('Server shutdown completed');
  process.exit(0);
});