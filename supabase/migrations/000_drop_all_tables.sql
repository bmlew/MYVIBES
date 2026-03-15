-- ============================================
-- DROP ALL VIBESPOT TABLES (Clean Slate)
-- ============================================
-- Run this FIRST if you need to reset the database
-- WARNING: This will delete ALL data in these tables!
-- ============================================

-- Drop tables in reverse order of dependencies (children first, parents last)

-- Analytics & Tracking
DROP TABLE IF EXISTS special_clicks CASCADE;
DROP TABLE IF EXISTS business_analytics CASCADE;
DROP TABLE IF EXISTS platform_analytics CASCADE;

-- Notifications
DROP TABLE IF EXISTS notifications CASCADE;

-- Partners & Referrals
DROP TABLE IF EXISTS partner_commissions CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS partners CASCADE;

-- Reservations & Check-ins
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;

-- Customer Relations
DROP TABLE IF EXISTS customer_event_interests CASCADE;
DROP TABLE IF EXISTS customer_favorites CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS loyalty_points_ledger CASCADE;

-- Events, Specials, Menu
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS specials CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;

-- Payments & Subscriptions
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Business Extensions
DROP TABLE IF EXISTS business_media CASCADE;
DROP TABLE IF EXISTS business_locations CASCADE;

-- Business
DROP TABLE IF EXISTS businesses CASCADE;

-- Users (must be after businesses due to FK)
DROP TABLE IF EXISTS users CASCADE;

-- Platform Admin
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS platform_admins CASCADE;
DROP TABLE IF EXISTS platform_config CASCADE;

-- Drop extensions (optional - only if you want to fully clean up)
-- DROP EXTENSION IF EXISTS earthdistance CASCADE;
-- DROP EXTENSION IF EXISTS cube CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Verify all tables are dropped
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'kv_%') LOOP
        RAISE NOTICE 'Remaining table: %', r.tablename;
    END LOOP;
END $$;

SELECT 'All VIBESPOT tables dropped successfully!' AS status;
