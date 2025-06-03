-- Migration script to update existing City Crawler database
-- Run this against your existing database to add new features

-- 1. Update the building_type constraint to include new types
ALTER TABLE location_reports
DROP CONSTRAINT IF EXISTS location_reports_building_type_check;

ALTER TABLE location_reports
ADD CONSTRAINT location_reports_building_type_check
CHECK (building_type IN ('shop', 'guild', 'hunter', 'paladin', 'werewolf', 'item', 'blood_deity', 'rich_vampire'));

-- 2. Make coordinates optional for certain building types
ALTER TABLE location_reports
ALTER COLUMN coordinate_x DROP NOT NULL;

ALTER TABLE location_reports
ALTER COLUMN coordinate_y DROP NOT NULL;

-- 3. Update the expiration function to handle new building types
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
        WHEN 'hunter', 'paladin', 'werewolf', 'item' THEN
            -- Players and items expire after 36 hours (they can be claimed/move around)
            NEW.expires_at := NEW.reported_at + INTERVAL '36 hours';
        WHEN 'blood_deity', 'rich_vampire' THEN
            -- Blood deities and rich vampires never expire
            NEW.expires_at := NULL;
        ELSE
            -- Default: 24 hours
            NEW.expires_at := NEW.reported_at + INTERVAL '24 hours';
    END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Blood Deities leaderboard table
CREATE TABLE IF NOT EXISTS blood_deities (
    id SERIAL PRIMARY KEY,
    vampire_name VARCHAR(100) UNIQUE NOT NULL,
    blood_amount BIGINT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reporter_username VARCHAR(50),

    -- Foreign key to users table
    FOREIGN KEY (reporter_username) REFERENCES users(username) ON DELETE SET NULL
);

-- 5. Create Rich Vampires leaderboard table (no coins field)
CREATE TABLE IF NOT EXISTS rich_vampires (
    id SERIAL PRIMARY KEY,
    vampire_name VARCHAR(100) UNIQUE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reporter_username VARCHAR(50),

    -- Foreign key to users table
    FOREIGN KEY (reporter_username) REFERENCES users(username) ON DELETE SET NULL
);

-- 6. Create indexes for leaderboard tables
CREATE INDEX IF NOT EXISTS idx_blood_deities_blood_amount ON blood_deities(blood_amount DESC);
CREATE INDEX IF NOT EXISTS idx_rich_vampires_name ON rich_vampires(vampire_name ASC);
CREATE INDEX IF NOT EXISTS idx_blood_deities_reporter ON blood_deities(reporter_username);
CREATE INDEX IF NOT EXISTS idx_rich_vampires_reporter ON rich_vampires(reporter_username);

-- 7. Create views for leaderboards
CREATE OR REPLACE VIEW blood_deities_leaderboard AS
SELECT
    vampire_name,
    blood_amount,
    last_updated,
    reporter_username,
    RANK() OVER (ORDER BY blood_amount DESC, last_updated ASC) as rank
FROM blood_deities
ORDER BY blood_amount DESC, last_updated ASC
LIMIT 50;

CREATE OR REPLACE VIEW rich_vampires_leaderboard AS
SELECT
    vampire_name,
    last_updated,
    reporter_username,
    ROW_NUMBER() OVER (ORDER BY vampire_name ASC) as rank
FROM rich_vampires
ORDER BY vampire_name ASC
LIMIT 50;

-- 8. Grant permissions to crawler user
GRANT SELECT, INSERT, UPDATE, DELETE ON blood_deities TO crawler;
GRANT SELECT, INSERT, UPDATE, DELETE ON rich_vampires TO crawler;
GRANT USAGE, SELECT ON SEQUENCE blood_deities_id_seq TO crawler;
GRANT USAGE, SELECT ON SEQUENCE rich_vampires_id_seq TO crawler;
GRANT SELECT ON blood_deities_leaderboard TO crawler;
GRANT SELECT ON rich_vampires_leaderboard TO crawler;
GRANT EXECUTE ON FUNCTION set_expiration_time() TO crawler;

-- 9. Verify migration completed successfully
SELECT 'Migration completed successfully!' as status;