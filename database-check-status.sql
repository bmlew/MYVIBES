-- ============================================
-- CHECK MIGRATION STATUS
-- ============================================
-- Run this to see what's already been created
-- ============================================

-- Check which tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'users', 'businesses', 'specials', 'reservations', 
            'checkins', 'special_clicks', 'reviews', 'events',
            'payments', 'analytics_clicks', 'menu_items'
        ) THEN '✅ Migration table'
        WHEN table_name = 'kv_store_175b2872' THEN '📦 Original KV store'
        WHEN table_name = 'kv_store_backup' THEN '💾 Backup table'
        ELSE '❓ Other table'
    END as table_type,
    (
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE columns.table_name = tables.table_name
    ) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN (
            'users', 'businesses', 'specials', 'reservations', 
            'checkins', 'special_clicks', 'reviews', 'events',
            'payments', 'analytics_clicks', 'menu_items'
        ) THEN 1
        WHEN table_name = 'kv_store_175b2872' THEN 2
        WHEN table_name = 'kv_store_backup' THEN 3
        ELSE 4
    END,
    table_name;

-- Check row counts
SELECT 'Row Counts' as section;

SELECT 
    'users' as table_name,
    COUNT(*) as rows
FROM users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
UNION ALL
SELECT 'businesses', COUNT(*) FROM businesses
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses')
UNION ALL
SELECT 'specials', COUNT(*) FROM specials
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specials')
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservations')
UNION ALL
SELECT 'checkins', COUNT(*) FROM checkins
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checkins')
UNION ALL
SELECT 'special_clicks', COUNT(*) FROM special_clicks
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'special_clicks')
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews')
UNION ALL
SELECT 'events', COUNT(*) FROM events
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events')
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments')
UNION ALL
SELECT 'analytics_clicks', COUNT(*) FROM analytics_clicks
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_clicks')
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_items')
UNION ALL
SELECT 'kv_store (original)', COUNT(*) FROM kv_store_175b2872
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kv_store_175b2872');

-- Check which stored procedures exist
SELECT 'Stored Procedures' as section;

SELECT 
    routine_name as function_name,
    '✅ Created' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
        'update_updated_at_column',
        'update_loyalty_points_on_checkin',
        'update_business_rating',
        'increment_special_clicks',
        'get_special_to_reservation_matches',
        'get_business_analytics',
        'get_user_analytics',
        'search_businesses',
        'get_top_businesses',
        'get_nearby_businesses',
        'get_trending_specials',
        'cleanup_old_analytics',
        'update_all_business_stats'
    )
ORDER BY routine_name;

-- ============================================
-- MIGRATION STATUS SUMMARY
-- ============================================
