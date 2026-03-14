-- ============================================
-- DATA MIGRATION FROM KV STORE TO NEW TABLES
-- ============================================
-- Run this AFTER running database-migration.sql
-- This will transfer existing data from kv_store_175b2872
-- ============================================

-- IMPORTANT: Backup your kv_store first!
-- CREATE TABLE kv_store_backup AS SELECT * FROM kv_store_175b2872;

-- ============================================
-- 1. MIGRATE USERS (customer:*)
-- ============================================
INSERT INTO users (id, email, name, mobile, city, date_of_birth, status, loyalty_points, total_spend, joined_at, last_active)
SELECT 
    (value->>'id')::uuid,
    value->>'email',
    value->>'name',
    value->>'mobile',
    value->>'city',
    CASE 
        WHEN value->>'date_of_birth' IS NOT NULL 
        THEN (value->>'date_of_birth')::date 
        ELSE NULL 
    END,
    COALESCE(value->>'status', 'active'),
    COALESCE((value->>'loyalty_points')::integer, 0),
    COALESCE((value->>'total_spend')::decimal, 0),
    COALESCE((value->>'joined_at')::timestamptz, NOW()),
    COALESCE((value->>'last_active')::timestamptz, NOW())
FROM kv_store_175b2872
WHERE key LIKE 'customer:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. MIGRATE BUSINESSES (business:*)
-- ============================================
INSERT INTO businesses (
    id, owner_id, name, description, category, address, city, 
    latitude, longitude, phone, email, website, logo_url, cover_image_url,
    operating_hours, is_active, is_featured, total_views, rating, review_count,
    subscription_status, subscription_expires_at, daily_stats
)
SELECT 
    (value->>'id')::uuid,
    CASE 
        WHEN value->>'owner_id' IS NOT NULL 
        THEN (value->>'owner_id')::uuid 
        ELSE NULL 
    END,
    value->>'name',
    value->>'description',
    value->>'category',
    value->>'address',
    value->>'city',
    CASE 
        WHEN value->>'latitude' IS NOT NULL 
        THEN (value->>'latitude')::decimal 
        ELSE NULL 
    END,
    CASE 
        WHEN value->>'longitude' IS NOT NULL 
        THEN (value->>'longitude')::decimal 
        ELSE NULL 
    END,
    value->>'phone',
    value->>'email',
    value->>'website',
    value->>'logo_url',
    value->>'cover_image_url',
    COALESCE((value->'operating_hours')::jsonb, '{}'::jsonb),
    COALESCE((value->>'is_active')::boolean, true),
    COALESCE((value->>'is_featured')::boolean, false),
    COALESCE((value->>'total_views')::integer, 0),
    COALESCE((value->>'rating')::decimal, 0),
    COALESCE((value->>'review_count')::integer, 0),
    COALESCE(value->>'subscription_status', 'trial'),
    CASE 
        WHEN value->>'subscription_expires_at' IS NOT NULL 
        THEN (value->>'subscription_expires_at')::timestamptz 
        ELSE NULL 
    END,
    COALESCE((value->'daily_stats')::jsonb, '{}'::jsonb)
FROM kv_store_175b2872
WHERE key LIKE 'business:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. MIGRATE SPECIALS (special:*)
-- ============================================
INSERT INTO specials (
    id, business_id, title, description, discount_percentage,
    original_price, discounted_price, image_url, days_of_week,
    start_time, end_time, is_active, view_count, click_count
)
SELECT 
    (value->>'id')::uuid,
    (value->>'business_id')::uuid,
    value->>'title',
    value->>'description',
    (value->>'discount_percentage')::integer,
    CASE 
        WHEN value->>'original_price' IS NOT NULL 
        THEN (value->>'original_price')::decimal 
        ELSE NULL 
    END,
    CASE 
        WHEN value->>'discounted_price' IS NOT NULL 
        THEN (value->>'discounted_price')::decimal 
        ELSE NULL 
    END,
    value->>'image_url',
    CASE 
        WHEN value->'days_of_week' IS NOT NULL 
        THEN ARRAY(SELECT jsonb_array_elements_text(value->'days_of_week')::integer)
        ELSE ARRAY[0,1,2,3,4,5,6]
    END,
    CASE 
        WHEN value->>'start_time' IS NOT NULL 
        THEN (value->>'start_time')::time 
        ELSE NULL 
    END,
    CASE 
        WHEN value->>'end_time' IS NOT NULL 
        THEN (value->>'end_time')::time 
        ELSE NULL 
    END,
    COALESCE((value->>'is_active')::boolean, true),
    COALESCE((value->>'view_count')::integer, 0),
    COALESCE((value->>'click_count')::integer, 0)
FROM kv_store_175b2872
WHERE key LIKE 'special:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. MIGRATE RESERVATIONS (reservation:* and rsv:*)
-- ============================================
INSERT INTO reservations (
    id, business_id, user_id, customer_name, customer_email, customer_phone,
    party_size, reservation_date, reservation_time, special_requests, status
)
SELECT 
    (value->>'id')::uuid,
    (value->>'businessId')::uuid,
    CASE 
        WHEN value->>'userId' IS NOT NULL 
        THEN (value->>'userId')::uuid 
        ELSE NULL 
    END,
    value->>'customerName',
    value->>'customerEmail',
    value->>'customerPhone',
    COALESCE((value->>'partySize')::integer, (value->>'pax')::integer, 2),
    (value->>'reservationDate')::date,
    (value->>'reservationTime')::time,
    value->>'specialRequests',
    COALESCE(value->>'status', 'pending')
FROM kv_store_175b2872
WHERE key LIKE 'reservation:%' OR key LIKE 'rsv:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. MIGRATE CHECK-INS (checkin:*)
-- ============================================
INSERT INTO checkins (
    id, business_id, user_id, reservation_id, customer_email, party_size, loyalty_points_earned, checked_in_at
)
SELECT 
    (value->>'id')::uuid,
    (value->>'businessId')::uuid,
    CASE 
        WHEN value->>'userId' IS NOT NULL 
        THEN (value->>'userId')::uuid 
        ELSE NULL 
    END,
    CASE 
        WHEN value->>'reservationId' IS NOT NULL 
        THEN (value->>'reservationId')::uuid 
        ELSE NULL 
    END,
    value->>'customerEmail',
    COALESCE((value->>'partySize')::integer, (value->>'pax')::integer),
    COALESCE((value->>'loyaltyPointsEarned')::integer, 10),
    COALESCE((value->>'timestamp')::timestamptz, (value->>'created_at')::timestamptz, NOW())
FROM kv_store_175b2872
WHERE key LIKE 'checkin:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. MIGRATE SPECIAL CLICKS (special_click:*)
-- ============================================
INSERT INTO special_clicks (
    id, special_id, business_id, user_id, user_email, clicked_at
)
SELECT 
    (value->>'id')::uuid,
    (value->>'special_id')::uuid,
    (value->>'business_id')::uuid,
    CASE 
        WHEN value->>'user_id' IS NOT NULL 
        THEN (value->>'user_id')::uuid 
        ELSE NULL 
    END,
    value->>'user_email',
    COALESCE((value->>'timestamp')::timestamptz, NOW())
FROM kv_store_175b2872
WHERE key LIKE 'special_click:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. MIGRATE REVIEWS (review:*)
-- ============================================
INSERT INTO reviews (
    id, business_id, user_id, rating, comment, response, response_at
)
SELECT 
    (value->>'id')::uuid,
    (value->>'business_id')::uuid,
    CASE 
        WHEN value->>'user_id' IS NOT NULL 
        THEN (value->>'user_id')::uuid 
        ELSE NULL 
    END,
    (value->>'rating')::integer,
    value->>'comment',
    value->>'response',
    CASE 
        WHEN value->>'response_at' IS NOT NULL 
        THEN (value->>'response_at')::timestamptz 
        ELSE NULL 
    END
FROM kv_store_175b2872
WHERE key LIKE 'review:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. MIGRATE EVENTS (event:*)
-- ============================================
INSERT INTO events (
    id, business_id, title, description, event_date, start_time, end_time, image_url, is_active
)
SELECT 
    (value->>'id')::uuid,
    (value->>'business_id')::uuid,
    value->>'title',
    value->>'description',
    (value->>'event_date')::date,
    CASE 
        WHEN value->>'start_time' IS NOT NULL 
        THEN (value->>'start_time')::time 
        ELSE NULL 
    END,
    CASE 
        WHEN value->>'end_time' IS NOT NULL 
        THEN (value->>'end_time')::time 
        ELSE NULL 
    END,
    value->>'image_url',
    COALESCE((value->>'is_active')::boolean, true)
FROM kv_store_175b2872
WHERE key LIKE 'event:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. MIGRATE PAYMENTS (payment:*)
-- ============================================
INSERT INTO payments (
    id, business_id, amount, currency, payment_type, status, payment_method, transaction_id, metadata
)
SELECT 
    (value->>'id')::uuid,
    (value->>'business_id')::uuid,
    (value->>'amount')::decimal,
    COALESCE(value->>'currency', 'ZAR'),
    value->>'payment_type',
    COALESCE(value->>'status', 'pending'),
    value->>'payment_method',
    value->>'transaction_id',
    COALESCE((value->'metadata')::jsonb, '{}'::jsonb)
FROM kv_store_175b2872
WHERE key LIKE 'payment:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10. MIGRATE ANALYTICS CLICKS (click:*)
-- ============================================
INSERT INTO analytics_clicks (
    id, business_id, click_type, user_email, source_page, clicked_at
)
SELECT 
    (value->>'id')::uuid,
    (value->>'businessId')::uuid,
    value->>'type',
    value->>'userEmail',
    value->>'sourcePage',
    COALESCE((value->>'timestamp')::timestamptz, NOW())
FROM kv_store_175b2872
WHERE key LIKE 'click:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 11. MIGRATE MENU ITEMS (menu:* and menu_item:*)
-- ============================================
INSERT INTO menu_items (
    id, business_id, category, name, description, price, image_url, is_available
)
SELECT 
    (value->>'id')::uuid,
    (value->>'business_id')::uuid,
    value->>'category',
    value->>'name',
    value->>'description',
    CASE 
        WHEN value->>'price' IS NOT NULL 
        THEN (value->>'price')::decimal 
        ELSE NULL 
    END,
    value->>'image_url',
    COALESCE((value->>'is_available')::boolean, true)
FROM kv_store_175b2872
WHERE key LIKE 'menu:%' OR key LIKE 'menu_item:%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify migration success:

SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Businesses', COUNT(*) FROM businesses
UNION ALL
SELECT 'Specials', COUNT(*) FROM specials
UNION ALL
SELECT 'Reservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'Check-ins', COUNT(*) FROM checkins
UNION ALL
SELECT 'Special Clicks', COUNT(*) FROM special_clicks
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Analytics Clicks', COUNT(*) FROM analytics_clicks
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM menu_items;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
