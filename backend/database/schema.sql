-- City Crawler Database Schema

-- Create the database (run this as superuser)
-- CREATE DATABASE city_crawler;

-- Users table for tracking contributors
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_reports INTEGER DEFAULT 0
);

-- Location reports table with expanded building types
CREATE TABLE IF NOT EXISTS location_reports (
    id SERIAL PRIMARY KEY,
    building_name VARCHAR(100) NOT NULL,
    building_type VARCHAR(20) NOT NULL CHECK (building_type IN ('shop', 'guild', 'hunter', 'paladin', 'werewolf', 'item')),
    custom_item_name VARCHAR(100), -- For custom items when building_type = 'item'
    coordinate_x INTEGER NOT NULL CHECK (coordinate_x >= 1 AND coordinate_x <= 200),
    coordinate_y INTEGER NOT NULL CHECK (coordinate_y >= 1 AND coordinate_y <= 200),
    street_name VARCHAR(50),
    street_number VARCHAR(10),
    guild_level INTEGER CHECK (guild_level IN (1, 2, 3)), -- Only for guilds
    reporter_username VARCHAR(50),
    confidence VARCHAR(20) DEFAULT 'unverified' CHECK (confidence IN ('confirmed', 'unverified')),
    notes TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Foreign key to users table
    FOREIGN KEY (reporter_username) REFERENCES users(username) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_location_reports_building_type ON location_reports(building_type);
CREATE INDEX IF NOT EXISTS idx_location_reports_coordinates ON location_reports(coordinate_x, coordinate_y);
CREATE INDEX IF NOT EXISTS idx_location_reports_active_expires ON location_reports(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_location_reports_reporter ON location_reports(reporter_username);
CREATE INDEX IF NOT EXISTS idx_location_reports_reported_at ON location_reports(reported_at DESC);

-- Function to automatically set expiration times based on building type
CREATE OR REPLACE FUNCTION set_expiration_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiration based on building type
    CASE NEW.building_type
        WHEN 'shop' THEN
            -- Shops expire at next 10:40 GMT (every 12 hours)
            NEW.expires_at := (
                CASE
                    WHEN EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'UTC')) < 10
                         OR (EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'UTC')) = 10 AND EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'UTC')) < 40)
                    THEN (DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '10 hours 40 minutes')
                    WHEN EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'UTC')) < 22
                         OR (EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'UTC')) = 22 AND EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'UTC')) < 40)
                    THEN (DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '22 hours 40 minutes')
                    ELSE (DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 day 10 hours 40 minutes')
                END
            );
        WHEN 'guild' THEN
            -- Guilds expire after 5 days
            NEW.expires_at := NEW.reported_at + INTERVAL '5 days';
        WHEN 'hunter', 'paladin', 'werewolf' THEN
            -- Players expire after 24 hours (they move around)
            NEW.expires_at := NEW.reported_at + INTERVAL '24 hours';
        WHEN 'item' THEN
            -- Items expire after 7 days (custom duration for flexibility)
            NEW.expires_at := NEW.reported_at + INTERVAL '7 days';
        ELSE
            -- Default: 24 hours
            NEW.expires_at := NEW.reported_at + INTERVAL '24 hours';
    END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set expiration times
CREATE TRIGGER trigger_set_expiration_time
    BEFORE INSERT ON location_reports
    FOR EACH ROW
    EXECUTE FUNCTION set_expiration_time();

-- Function to update user report counts
CREATE OR REPLACE FUNCTION update_user_report_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user if they don't exist
    INSERT INTO users (username, total_reports)
    VALUES (NEW.reporter_username, 1)
    ON CONFLICT (username)
    DO UPDATE SET total_reports = users.total_reports + 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user report counts
CREATE TRIGGER trigger_update_user_report_count
    BEFORE INSERT ON location_reports
    FOR EACH ROW
    WHEN (NEW.reporter_username IS NOT NULL)
    EXECUTE FUNCTION update_user_report_count();

-- Function to clean up expired reports
CREATE OR REPLACE FUNCTION cleanup_expired_reports()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE location_reports
    SET is_active = FALSE
    WHERE is_active = TRUE
    AND expires_at < NOW();

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- View for active location reports
CREATE OR REPLACE VIEW active_location_reports AS
SELECT
    id,
    building_name,
    building_type,
    custom_item_name,
    coordinate_x,
    coordinate_y,
    street_name,
    street_number,
    guild_level,
    reporter_username,
    confidence,
    notes,
    reported_at,
    expires_at
FROM location_reports
WHERE is_active = TRUE
AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY reported_at DESC;

-- View for top contributors
CREATE OR REPLACE VIEW top_contributors AS
SELECT
    username,
    total_reports,
    created_at,
    RANK() OVER (ORDER BY total_reports DESC, created_at ASC) as rank
FROM users
WHERE total_reports > 0
ORDER BY total_reports DESC, created_at ASC
LIMIT 20;