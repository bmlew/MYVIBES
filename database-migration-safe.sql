-- ============================================
-- SAFE MIGRATION - SKIPS EXISTING TABLES
-- ============================================
-- This version uses IF NOT EXISTS for safety
-- Run this instead of database-migration.sql
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT,
    city TEXT,
    date_of_birth DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'reviewing')),
    loyalty_points INTEGER DEFAULT 0,
    total_spend DECIMAL(10,2) DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    operating_hours JSONB,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    total_views INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    daily_stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SPECIALS TABLE
CREATE TABLE IF NOT EXISTS specials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_percentage INTEGER,
    original_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    image_url TEXT,
    days_of_week INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
    start_time TIME,
    end_time TIME,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    party_size INTEGER NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    special_requests TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),
    source_special_id UUID REFERENCES specials(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CHECK-INS TABLE
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    party_size INTEGER,
    loyalty_points_earned INTEGER DEFAULT 10,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SPECIAL_CLICKS TABLE
CREATE TABLE IF NOT EXISTS special_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    special_id UUID REFERENCES specials(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT,
    response_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    payment_type TEXT CHECK (payment_type IN ('subscription', 'one-time')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ANALYTICS_CLICKS TABLE
CREATE TABLE IF NOT EXISTS analytics_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    click_type TEXT NOT NULL CHECK (click_type IN ('carousel', 'ad', 'profile', 'search')),
    user_email TEXT,
    source_page TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. MENU_ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    category TEXT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_joined_at ON users(joined_at DESC);

-- Businesses indexes
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON businesses(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC);

-- Specials indexes
CREATE INDEX IF NOT EXISTS idx_specials_business ON specials(business_id);
CREATE INDEX IF NOT EXISTS idx_specials_active ON specials(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_specials_created_at ON specials(created_at DESC);

-- Reservations indexes
CREATE INDEX IF NOT EXISTS idx_reservations_business ON reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_source_special ON reservations(source_special_id);
CREATE INDEX IF NOT EXISTS idx_reservations_business_date ON reservations(business_id, reservation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_user_date ON reservations(user_id, created_at DESC);

-- Check-ins indexes
CREATE INDEX IF NOT EXISTS idx_checkins_business ON checkins(business_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_reservation ON checkins(reservation_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_business_date ON checkins(business_id, checked_in_at DESC);

-- Special clicks indexes
CREATE INDEX IF NOT EXISTS idx_special_clicks_special ON special_clicks(special_id);
CREATE INDEX IF NOT EXISTS idx_special_clicks_business ON special_clicks(business_id);
CREATE INDEX IF NOT EXISTS idx_special_clicks_user ON special_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_special_clicks_clicked_at ON special_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_special_clicks_match ON special_clicks(business_id, user_id, clicked_at);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_business ON events(business_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active) WHERE is_active = true;

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_business ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Analytics clicks indexes
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_business ON analytics_clicks(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_type ON analytics_clicks(click_type);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_clicked_at ON analytics_clicks(clicked_at DESC);

-- Menu items indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_business ON menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available) WHERE is_available = true;

-- Partial indexes
CREATE INDEX IF NOT EXISTS idx_active_specials_business ON specials(business_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pending_reservations ON reservations(business_id, reservation_date) WHERE status = 'pending';

-- GIN index for JSONB
CREATE INDEX IF NOT EXISTS idx_businesses_daily_stats ON businesses USING gin(daily_stats);

-- ============================================
-- Success message
-- ============================================
SELECT 'Schema migration complete! All tables and indexes created.' as status;
SELECT 'Next step: Run /data-migration.sql to transfer data' as next_step;
