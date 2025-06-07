-- Migration to update guild movement schedule
-- Guild movements happen on: 1st, 6th, 10th, 14th, 19th, 23rd, 27th at 12:00 AM UTC

-- Update the trigger function
CREATE OR REPLACE FUNCTION set_expiration_time()
RETURNS TRIGGER AS $$
DECLARE
    guild_movement_dates INTEGER[] := ARRAY[1, 6, 10, 14, 19, 23, 27];
    current_day INTEGER;
    next_movement_day INTEGER;
    next_expiration TIMESTAMP WITH TIME ZONE;
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
            -- Guilds expire on specific dates (1st, 6th, 10th, 14th, 19th, 23rd, 27th at 12:00 AM UTC)
            current_day := EXTRACT(DAY FROM (NOW() AT TIME ZONE 'UTC'));

            -- Find the next guild movement date
            SELECT MIN(day) INTO next_movement_day
            FROM UNNEST(guild_movement_dates) AS day
            WHERE day > current_day;

            IF next_movement_day IS NOT NULL THEN
                -- Next movement is this month
                next_expiration := DATE_TRUNC('month', NOW() AT TIME ZONE 'UTC') + (next_movement_day - 1) * INTERVAL '1 day';
            ELSE
                -- Next movement is first day of next month
                next_expiration := DATE_TRUNC('month', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month';
            END IF;

            NEW.expires_at := next_expiration;
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

-- Function to calculate next guild movement date
CREATE OR REPLACE FUNCTION calculate_next_guild_movement(base_date TIMESTAMP WITH TIME ZONE DEFAULT NOW())
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    guild_movement_dates INTEGER[] := ARRAY[1, 6, 10, 14, 19, 23, 27];
    current_day INTEGER;
    next_movement_day INTEGER;
    next_expiration TIMESTAMP WITH TIME ZONE;
BEGIN
    current_day := EXTRACT(DAY FROM (base_date AT TIME ZONE 'UTC'));

    -- Find the next guild movement date
    SELECT MIN(day) INTO next_movement_day
    FROM UNNEST(guild_movement_dates) AS day
    WHERE day > current_day;

    IF next_movement_day IS NOT NULL THEN
        -- Next movement is this month
        next_expiration := DATE_TRUNC('month', base_date AT TIME ZONE 'UTC') + (next_movement_day - 1) * INTERVAL '1 day';
    ELSE
        -- Next movement is first day of next month
        next_expiration := DATE_TRUNC('month', base_date AT TIME ZONE 'UTC') + INTERVAL '1 month';
    END IF;

    RETURN next_expiration;
END;
$$ LANGUAGE plpgsql;

-- Update existing guild reports to use the new expiration schedule
UPDATE location_reports
SET expires_at = calculate_next_guild_movement(reported_at)
WHERE building_type = 'guild'
AND is_active = TRUE;

-- Log the migration
SELECT 'Guild movement schedule updated successfully' AS migration_status;