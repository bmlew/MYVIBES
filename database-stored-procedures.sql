-- ============================================
-- STORED PROCEDURES FOR PERFORMANCE
-- ============================================
-- These optimize common operations for 20k+ users
-- Run after database-migration.sql
-- ============================================

-- 1. Increment special click count (atomic operation)
CREATE OR REPLACE FUNCTION increment_special_clicks(special_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE specials 
    SET click_count = click_count + 1,
        updated_at = NOW()
    WHERE id = special_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Get special-to-reservation matches (optimized with JOIN)
CREATE OR REPLACE FUNCTION get_special_to_reservation_matches()
RETURNS TABLE(matches BIGINT, total_clicks BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH matched_clicks AS (
        SELECT DISTINCT sc.id
        FROM special_clicks sc
        INNER JOIN reservations r ON (
            r.business_id = sc.business_id
            AND (r.user_id = sc.user_id OR r.customer_email = sc.user_email)
            AND r.created_at >= sc.clicked_at
            AND r.created_at <= sc.clicked_at + INTERVAL '24 hours'
        )
    )
    SELECT 
        COUNT(*)::BIGINT as matches,
        (SELECT COUNT(*)::BIGINT FROM special_clicks) as total_clicks
    FROM matched_clicks;
END;
$$ LANGUAGE plpgsql;

-- 3. Get business analytics summary (single query instead of multiple)
CREATE OR REPLACE FUNCTION get_business_analytics(business_uuid UUID)
RETURNS TABLE(
    total_reservations BIGINT,
    total_checkins BIGINT,
    total_special_clicks BIGINT,
    completion_rate NUMERIC,
    avg_party_size NUMERIC,
    total_loyalty_points_given INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM reservations WHERE business_id = business_uuid)::BIGINT,
        (SELECT COUNT(*) FROM checkins WHERE business_id = business_uuid)::BIGINT,
        (SELECT COUNT(*) FROM special_clicks WHERE business_id = business_uuid)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM reservations WHERE business_id = business_uuid) > 0
            THEN ROUND(
                (SELECT COUNT(*)::NUMERIC FROM checkins WHERE business_id = business_uuid) /
                (SELECT COUNT(*)::NUMERIC FROM reservations WHERE business_id = business_uuid) * 100,
                2
            )
            ELSE 0
        END,
        (SELECT COALESCE(AVG(party_size), 0) FROM checkins WHERE business_id = business_uuid),
        (SELECT COALESCE(SUM(loyalty_points_earned), 0) FROM checkins WHERE business_id = business_uuid)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- 4. Get user activity summary (optimized)
CREATE OR REPLACE FUNCTION get_user_analytics(user_uuid UUID)
RETURNS TABLE(
    total_reservations BIGINT,
    total_checkins BIGINT,
    total_reviews BIGINT,
    loyalty_points INTEGER,
    total_spend NUMERIC,
    favorite_business_id UUID,
    favorite_business_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM reservations WHERE user_id = user_uuid)::BIGINT,
        (SELECT COUNT(*) FROM checkins WHERE user_id = user_uuid)::BIGINT,
        (SELECT COUNT(*) FROM reviews WHERE user_id = user_uuid)::BIGINT,
        (SELECT loyalty_points FROM users WHERE id = user_uuid),
        (SELECT total_spend FROM users WHERE id = user_uuid),
        (
            SELECT business_id 
            FROM checkins 
            WHERE user_id = user_uuid 
            GROUP BY business_id 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ),
        (
            SELECT b.name
            FROM checkins c
            INNER JOIN businesses b ON c.business_id = b.id
            WHERE c.user_id = user_uuid
            GROUP BY b.id, b.name
            ORDER BY COUNT(*) DESC
            LIMIT 1
        );
END;
$$ LANGUAGE plpgsql;

-- 5. Search businesses with ranking (full-text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION search_businesses(search_query TEXT, max_results INTEGER DEFAULT 20)
RETURNS TABLE(
    id UUID,
    name TEXT,
    description TEXT,
    category TEXT,
    city TEXT,
    rating NUMERIC,
    review_count INTEGER,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.name,
        b.description,
        b.category,
        b.city,
        b.rating,
        b.review_count,
        (
            similarity(b.name, search_query) * 3 +
            similarity(COALESCE(b.description, ''), search_query) * 2 +
            similarity(COALESCE(b.category, ''), search_query)
        ) as relevance_score
    FROM businesses b
    WHERE 
        b.is_active = true
        AND (
            b.name ILIKE '%' || search_query || '%'
            OR b.description ILIKE '%' || search_query || '%'
            OR b.category ILIKE '%' || search_query || '%'
            OR b.city ILIKE '%' || search_query || '%'
        )
    ORDER BY relevance_score DESC, b.rating DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 6. Get top businesses by rating (cached-friendly)
CREATE OR REPLACE FUNCTION get_top_businesses(max_results INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    name TEXT,
    category TEXT,
    rating NUMERIC,
    review_count INTEGER,
    total_views INTEGER,
    city TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.name,
        b.category,
        b.rating,
        b.review_count,
        b.total_views,
        b.city
    FROM businesses b
    WHERE b.is_active = true
    ORDER BY 
        b.rating DESC,
        b.review_count DESC,
        b.total_views DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 7. Get nearby businesses (geolocation)
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE OR REPLACE FUNCTION get_nearby_businesses(
    user_lat DECIMAL,
    user_lng DECIMAL,
    radius_km INTEGER DEFAULT 10,
    max_results INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    category TEXT,
    rating NUMERIC,
    distance_km NUMERIC,
    address TEXT,
    city TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.name,
        b.category,
        b.rating,
        ROUND(
            (point(b.longitude, b.latitude) <@> point(user_lng, user_lat))::NUMERIC * 1.609344,
            2
        ) as distance_km,
        b.address,
        b.city
    FROM businesses b
    WHERE 
        b.is_active = true
        AND b.latitude IS NOT NULL
        AND b.longitude IS NOT NULL
        AND (point(b.longitude, b.latitude) <@> point(user_lng, user_lat)) * 1.609344 <= radius_km
    ORDER BY distance_km ASC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 8. Get trending specials (based on recent clicks)
CREATE OR REPLACE FUNCTION get_trending_specials(days_back INTEGER DEFAULT 7, max_results INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    business_id UUID,
    business_name TEXT,
    title TEXT,
    discount_percentage INTEGER,
    click_count INTEGER,
    recent_clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.business_id,
        b.name as business_name,
        s.title,
        s.discount_percentage,
        s.click_count,
        COUNT(sc.id)::BIGINT as recent_clicks
    FROM specials s
    INNER JOIN businesses b ON s.business_id = b.id
    LEFT JOIN special_clicks sc ON (
        s.id = sc.special_id 
        AND sc.clicked_at >= NOW() - (days_back || ' days')::INTERVAL
    )
    WHERE s.is_active = true AND b.is_active = true
    GROUP BY s.id, b.name
    ORDER BY recent_clicks DESC, s.click_count DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 9. Cleanup old analytics data (maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM special_clicks 
        WHERE clicked_at < NOW() - (days_to_keep || ' days')::INTERVAL
        RETURNING *
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    DELETE FROM analytics_clicks 
    WHERE clicked_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Batch update business stats (for nightly cron)
CREATE OR REPLACE FUNCTION update_all_business_stats()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    WITH stats AS (
        SELECT 
            b.id,
            COUNT(DISTINCT r.id) as reservation_count,
            COUNT(DISTINCT c.id) as checkin_count,
            COUNT(DISTINCT sc.id) as click_count
        FROM businesses b
        LEFT JOIN reservations r ON b.id = r.business_id
        LEFT JOIN checkins c ON b.id = c.business_id
        LEFT JOIN special_clicks sc ON b.id = sc.business_id
        GROUP BY b.id
    ),
    updated AS (
        UPDATE businesses b
        SET 
            daily_stats = jsonb_set(
                COALESCE(b.daily_stats, '{}'::jsonb),
                ARRAY[to_char(NOW(), 'YYYY-MM-DD')],
                to_jsonb(stats.click_count)
            ),
            updated_at = NOW()
        FROM stats
        WHERE b.id = stats.id
        RETURNING b.id
    )
    SELECT COUNT(*) INTO updated_count FROM updated;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERFORMANCE INDEXES (if not already created)
-- ============================================

-- Composite indexes for common JOIN patterns
CREATE INDEX IF NOT EXISTS idx_reservations_business_date ON reservations(business_id, reservation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_user_date ON reservations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_business_date ON checkins(business_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_special_clicks_match ON special_clicks(business_id, user_id, clicked_at);

-- Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_active_specials_business ON specials(business_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pending_reservations ON reservations(business_id, reservation_date) WHERE status = 'pending';

-- GIN index for JSONB searches (if using metadata heavily)
CREATE INDEX IF NOT EXISTS idx_businesses_daily_stats ON businesses USING gin(daily_stats);

-- ============================================
-- SCHEDULED JOBS (requires pg_cron extension)
-- ============================================
-- Uncomment if pg_cron is available

-- SELECT cron.schedule(
--     'update-business-stats',
--     '0 2 * * *',  -- Run at 2 AM daily
--     'SELECT update_all_business_stats();'
-- );

-- SELECT cron.schedule(
--     'cleanup-old-analytics',
--     '0 3 * * 0',  -- Run at 3 AM every Sunday
--     'SELECT cleanup_old_analytics(90);'
-- );

-- ============================================
-- READY FOR PRODUCTION
-- ============================================
