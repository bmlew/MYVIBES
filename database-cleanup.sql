-- ============================================
-- CLEANUP SCRIPT - REMOVE EXISTING TABLES
-- ============================================
-- ⚠️ WARNING: This will DROP all new tables!
-- Only run this if you want to start fresh
-- Make sure you have backups!
-- ============================================

-- Drop tables in reverse order (to handle foreign keys)
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS analytics_clicks CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS special_clicks CASCADE;
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS specials CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop views
DROP VIEW IF EXISTS business_performance CASCADE;
DROP VIEW IF EXISTS user_activity_summary CASCADE;

-- Drop functions/stored procedures
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_loyalty_points_on_checkin() CASCADE;
DROP FUNCTION IF EXISTS update_business_rating() CASCADE;
DROP FUNCTION IF EXISTS increment_special_clicks(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_special_to_reservation_matches() CASCADE;
DROP FUNCTION IF EXISTS get_business_analytics(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_analytics(UUID) CASCADE;
DROP FUNCTION IF EXISTS search_businesses(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_top_businesses(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_nearby_businesses(DECIMAL, DECIMAL, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_trending_specials(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_analytics(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_all_business_stats() CASCADE;

-- ============================================
-- Cleanup complete!
-- Now you can run database-migration.sql again
-- ============================================

SELECT 'Cleanup complete! All tables dropped.' as status;
