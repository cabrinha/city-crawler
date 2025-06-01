-- Grant permissions to crawler user
-- Run this as the database superuser (postgres)

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO crawler;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON location_reports TO crawler;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO crawler;

-- Grant permissions on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO crawler;

-- Grant permissions on views
GRANT SELECT ON active_location_reports TO crawler;
GRANT SELECT ON top_contributors TO crawler;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION set_expiration_time() TO crawler;
GRANT EXECUTE ON FUNCTION update_user_report_count() TO crawler;
GRANT EXECUTE ON FUNCTION cleanup_expired_reports() TO crawler;

-- Make sure crawler can create temporary tables (sometimes needed)
GRANT TEMPORARY ON DATABASE city_crawler TO crawler;