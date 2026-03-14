-- ============================================
-- MYVIBES COMPLETE DATABASE MIGRATION
-- Fresh Installation - All Tables & Features
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ============================================

-- ============================================
-- STEP 1: CLEAN SLATE (Drop existing tables)
-- ============================================

DROP TABLE IF EXISTS partner_payouts CASCADE;
DROP TABLE IF EXISTS partner_earnings CASCADE;
DROP TABLE IF EXISTS partner_visits CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
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
DROP VIEW IF EXISTS referral_activity CASCADE;
DROP VIEW IF EXISTS partner_performance CASCADE;
DROP VIEW IF EXISTS user_activity_summary CASCADE;
DROP VIEW IF EXISTS business_performance CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS validate_partner_code CASCADE;
DROP FUNCTION IF EXISTS get_partner_analytics CASCADE;
DROP FUNCTION IF EXISTS check_partner_visit_bonus CASCADE;
DROP FUNCTION IF EXISTS create_business_referral CASCADE;
DROP FUNCTION IF EXISTS create_customer_referral CASCADE;
DROP FUNCTION IF EXISTS update_all_business_stats CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_analytics CASCADE;
DROP FUNCTION IF EXISTS get_trending_specials CASCADE;
DROP FUNCTION IF EXISTS get_nearby_businesses CASCADE;
DROP FUNCTION IF EXISTS get_top_businesses CASCADE;
DROP FUNCTION IF EXISTS search_businesses CASCADE;
DROP FUNCTION IF EXISTS get_user_analytics CASCADE;
DROP FUNCTION IF EXISTS get_business_analytics CASCADE;
DROP FUNCTION IF EXISTS get_special_to_reservation_matches CASCADE;
DROP FUNCTION IF EXISTS increment_special_clicks CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS update_loyalty_points_on_checkin CASCADE;
DROP FUNCTION IF EXISTS update_business_rating CASCADE;
DROP FUNCTION IF EXISTS update_partner_stats_on_referral CASCADE;
DROP FUNCTION IF EXISTS update_partner_earnings_on_commission CASCADE;
DROP FUNCTION IF EXISTS track_partner_visit_bonus CASCADE;

-- ============================================
-- STEP 2: ENABLE EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- ============================================
-- STEP 3: CREATE CORE TABLES
-- ============================================

-- 1. USERS TABLE (must be first - referenced by others)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT,
    city TEXT,
    date_of_birth DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'reviewing')),
    loyalty_points INTEGER DEFAULT 0,
    total_spend DECIMAL(10,2) DEFAULT 0,
    
    -- Referral fields (added later by referral system)
    referral_code TEXT,
    referred_by UUID, -- FK added after partners table created
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BUSINESSES TABLE
CREATE TABLE businesses (
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
    
    -- Referral fields (added later by referral system)
    affiliate_code TEXT,
    referred_by UUID, -- FK added after partners table created
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SPECIALS TABLE
CREATE TABLE specials (
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
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    special_requests TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),
    source_special_id UUID REFERENCES specials(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CHECKINS TABLE
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    party_size INTEGER,
    loyalty_points_earned INTEGER DEFAULT 10,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SPECIAL CLICKS TABLE
CREATE TABLE special_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    special_id UUID REFERENCES specials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    click_type TEXT CHECK (click_type IN ('view', 'reserve', 'share')),
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REVIEWS TABLE
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. EVENTS TABLE
CREATE TABLE events (
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
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    billing_period_start DATE,
    billing_period_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ANALYTICS CLICKS TABLE
CREATE TABLE analytics_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    click_type TEXT NOT NULL,
    target_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. MENU ITEMS TABLE
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 4: PARTNER/INFLUENCER REFERRAL SYSTEM
-- ============================================

-- 12. PARTNERS TABLE
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Partner Identity
    code TEXT UNIQUE NOT NULL, -- Universal code (e.g., "SMI7843")
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
    is_active BOOLEAN DEFAULT true,
    
    -- Referral Tracking
    total_referrals INTEGER DEFAULT 0,
    total_customer_referrals INTEGER DEFAULT 0,
    total_business_referrals INTEGER DEFAULT 0,
    
    -- Earnings (in cents)
    total_earnings_cents INTEGER DEFAULT 0,
    pending_balance_cents INTEGER DEFAULT 0,
    paid_earnings_cents INTEGER DEFAULT 0,
    
    -- Engagement
    app_downloads INTEGER DEFAULT 0,
    partner_business_visits INTEGER DEFAULT 0,
    partner_visit_bonus_points INTEGER DEFAULT 0,
    
    -- Bank Details
    bank_name TEXT,
    account_holder TEXT,
    account_number TEXT,
    branch_code TEXT,
    
    -- Metadata
    notes TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. REFERRALS TABLE (Universal Tracking with B-/C- prefixes)
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Association ID with B-/C- prefix
    association_id TEXT UNIQUE NOT NULL, -- "B-{business_id}" or "C-{customer_id}"
    
    -- Partner Info
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    partner_code TEXT NOT NULL,
    
    -- Referral Type
    type TEXT NOT NULL CHECK (type IN ('customer', 'business')),
    
    -- Customer Referral Fields
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_email TEXT,
    
    -- Business Referral Fields
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    business_name TEXT,
    business_plan TEXT,
    
    -- Earnings
    commission_cents INTEGER DEFAULT 0,
    commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid', 'cancelled')),
    commission_approved_at TIMESTAMP WITH TIME ZONE,
    commission_paid_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. PARTNER VISITS TABLE (Bonus System)
CREATE TABLE partner_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    checkin_id UUID REFERENCES checkins(id) ON DELETE CASCADE,
    bonus_points INTEGER DEFAULT 50,
    regular_points INTEGER DEFAULT 10,
    total_points INTEGER DEFAULT 60,
    is_verified BOOLEAN DEFAULT true,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. PARTNER EARNINGS TABLE
CREATE TABLE partner_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
    earning_type TEXT NOT NULL CHECK (earning_type IN ('customer_download', 'business_signup', 'recurring_commission', 'bonus')),
    amount_cents INTEGER NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method TEXT,
    payment_reference TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. PARTNER PAYOUTS TABLE
CREATE TABLE partner_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    period_start DATE,
    period_end DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_method TEXT,
    payment_reference TEXT,
    bank_name TEXT,
    account_number TEXT,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign keys to users and businesses for referrals
ALTER TABLE users ADD CONSTRAINT fk_users_referred_by FOREIGN KEY (referred_by) REFERENCES partners(id) ON DELETE SET NULL;
ALTER TABLE businesses ADD CONSTRAINT fk_businesses_referred_by FOREIGN KEY (referred_by) REFERENCES partners(id) ON DELETE SET NULL;

-- ============================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_loyalty_points ON users(loyalty_points DESC);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);

-- Businesses indexes
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_active ON businesses(is_active) WHERE is_active = true;
CREATE INDEX idx_businesses_featured ON businesses(is_featured) WHERE is_featured = true;
CREATE INDEX idx_businesses_location ON businesses USING gist(ll_to_earth(latitude, longitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_businesses_subscription ON businesses(subscription_status);
CREATE INDEX idx_businesses_rating ON businesses(rating DESC);
CREATE INDEX idx_businesses_affiliate_code ON businesses(affiliate_code);
CREATE INDEX idx_businesses_referred_by ON businesses(referred_by);

-- Specials indexes
CREATE INDEX idx_specials_business ON specials(business_id);
CREATE INDEX idx_specials_active ON specials(is_active) WHERE is_active = true;
CREATE INDEX idx_specials_created ON specials(created_at DESC);

-- Reservations indexes
CREATE INDEX idx_reservations_business ON reservations(business_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_special ON reservations(source_special_id);

-- Checkins indexes
CREATE INDEX idx_checkins_business ON checkins(business_id);
CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_email ON checkins(customer_email);
CREATE INDEX idx_checkins_created ON checkins(created_at DESC);
CREATE INDEX idx_checkins_reservation ON checkins(reservation_id);

-- Special clicks indexes
CREATE INDEX idx_special_clicks_special ON special_clicks(special_id);
CREATE INDEX idx_special_clicks_user ON special_clicks(user_id);
CREATE INDEX idx_special_clicks_type ON special_clicks(click_type);
CREATE INDEX idx_special_clicks_created ON special_clicks(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- Events indexes
CREATE INDEX idx_events_business ON events(business_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_active ON events(is_active) WHERE is_active = true;

-- Payments indexes
CREATE INDEX idx_payments_business ON payments(business_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- Analytics clicks indexes
CREATE INDEX idx_analytics_business ON analytics_clicks(business_id);
CREATE INDEX idx_analytics_user ON analytics_clicks(user_id);
CREATE INDEX idx_analytics_type ON analytics_clicks(click_type);
CREATE INDEX idx_analytics_created ON analytics_clicks(created_at DESC);

-- Menu items indexes
CREATE INDEX idx_menu_business ON menu_items(business_id);
CREATE INDEX idx_menu_available ON menu_items(is_available) WHERE is_available = true;

-- Partners indexes
CREATE INDEX idx_partners_code ON partners(code);
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_active ON partners(is_active) WHERE is_active = true;

-- Referrals indexes
CREATE INDEX idx_referrals_partner ON referrals(partner_id);
CREATE INDEX idx_referrals_association_id ON referrals(association_id);
CREATE INDEX idx_referrals_type ON referrals(type);
CREATE INDEX idx_referrals_customer ON referrals(customer_id);
CREATE INDEX idx_referrals_business ON referrals(business_id);
CREATE INDEX idx_referrals_partner_code ON referrals(partner_code);
CREATE INDEX idx_referrals_commission_status ON referrals(commission_status);
CREATE INDEX idx_referrals_created_at ON referrals(created_at DESC);
CREATE INDEX idx_referrals_partner_type ON referrals(partner_id, type);
CREATE INDEX idx_referrals_partner_status ON referrals(partner_id, commission_status);

-- Partner visits indexes
CREATE INDEX idx_partner_visits_partner ON partner_visits(partner_id);
CREATE INDEX idx_partner_visits_business ON partner_visits(business_id);
CREATE INDEX idx_partner_visits_checkin ON partner_visits(checkin_id);
CREATE INDEX idx_partner_visits_verified ON partner_visits(is_verified) WHERE is_verified = true;
CREATE INDEX idx_partner_visits_date ON partner_visits(visited_at DESC);

-- Partner earnings indexes
CREATE INDEX idx_partner_earnings_partner ON partner_earnings(partner_id);
CREATE INDEX idx_partner_earnings_referral ON partner_earnings(referral_id);
CREATE INDEX idx_partner_earnings_type ON partner_earnings(earning_type);
CREATE INDEX idx_partner_earnings_status ON partner_earnings(status);
CREATE INDEX idx_partner_earnings_created_at ON partner_earnings(created_at DESC);
CREATE INDEX idx_partner_earnings_partner_status ON partner_earnings(partner_id, status);

-- Partner payouts indexes
CREATE INDEX idx_partner_payouts_partner ON partner_payouts(partner_id);
CREATE INDEX idx_partner_payouts_status ON partner_payouts(status);
CREATE INDEX idx_partner_payouts_created_at ON partner_payouts(created_at DESC);

-- ============================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 7: CREATE TRIGGERS
-- ============================================

-- Auto-update timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_specials_updated_at BEFORE UPDATE ON specials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_earnings_updated_at BEFORE UPDATE ON partner_earnings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_payouts_updated_at BEFORE UPDATE ON partner_payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Loyalty points on check-in
CREATE OR REPLACE FUNCTION update_loyalty_points_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        loyalty_points = loyalty_points + NEW.loyalty_points_earned,
        last_active = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_loyalty_points_on_checkin
AFTER INSERT ON checkins
FOR EACH ROW
EXECUTE FUNCTION update_loyalty_points_on_checkin();

-- Business rating on review
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses
    SET 
        rating = (SELECT AVG(rating) FROM reviews WHERE business_id = NEW.business_id),
        review_count = (SELECT COUNT(*) FROM reviews WHERE business_id = NEW.business_id)
    WHERE id = NEW.business_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_rating();

-- Partner stats on referral
CREATE OR REPLACE FUNCTION update_partner_stats_on_referral()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'customer' THEN
        UPDATE partners
        SET 
            total_customer_referrals = total_customer_referrals + 1,
            total_referrals = total_referrals + 1,
            app_downloads = app_downloads + 1,
            last_active = NOW()
        WHERE id = NEW.partner_id;
    ELSIF NEW.type = 'business' THEN
        UPDATE partners
        SET 
            total_business_referrals = total_business_referrals + 1,
            total_referrals = total_referrals + 1,
            last_active = NOW()
        WHERE id = NEW.partner_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_stats_on_referral
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION update_partner_stats_on_referral();

-- Partner earnings on commission
CREATE OR REPLACE FUNCTION update_partner_earnings_on_commission()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.commission_status = 'approved' AND OLD.commission_status != 'approved' THEN
        UPDATE partners
        SET 
            pending_balance_cents = pending_balance_cents + NEW.commission_cents,
            total_earnings_cents = total_earnings_cents + NEW.commission_cents
        WHERE id = NEW.partner_id;
    END IF;
    
    IF NEW.commission_status = 'paid' AND OLD.commission_status != 'paid' THEN
        UPDATE partners
        SET 
            pending_balance_cents = pending_balance_cents - NEW.commission_cents,
            paid_earnings_cents = paid_earnings_cents + NEW.commission_cents
        WHERE id = NEW.partner_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_earnings_on_commission
AFTER UPDATE ON referrals
FOR EACH ROW
WHEN (OLD.commission_status IS DISTINCT FROM NEW.commission_status)
EXECUTE FUNCTION update_partner_earnings_on_commission();

-- Partner visit bonus
CREATE OR REPLACE FUNCTION track_partner_visit_bonus()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partners
    SET 
        partner_business_visits = partner_business_visits + 1,
        partner_visit_bonus_points = partner_visit_bonus_points + NEW.bonus_points,
        last_active = NOW()
    WHERE id = NEW.partner_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_partner_visit_bonus
AFTER INSERT ON partner_visits
FOR EACH ROW
EXECUTE FUNCTION track_partner_visit_bonus();

-- ============================================
-- STEP 8: CREATE STORED PROCEDURES
-- ============================================

-- 1. Create customer referral
CREATE OR REPLACE FUNCTION create_customer_referral(
    p_partner_code TEXT,
    p_customer_id UUID,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_commission_cents INTEGER DEFAULT 2000
)
RETURNS UUID AS $$
DECLARE
    v_partner_id UUID;
    v_referral_id UUID;
    v_association_id TEXT;
BEGIN
    SELECT id INTO v_partner_id FROM partners WHERE code = p_partner_code AND is_active = true;
    
    IF v_partner_id IS NULL THEN
        RAISE EXCEPTION 'Partner code % not found or inactive', p_partner_code;
    END IF;
    
    v_association_id := 'C-' || p_customer_id::text;
    
    INSERT INTO referrals (
        association_id, partner_id, partner_code, type,
        customer_id, customer_name, customer_email, commission_cents
    ) VALUES (
        v_association_id, v_partner_id, p_partner_code, 'customer',
        p_customer_id, p_customer_name, p_customer_email, p_commission_cents
    ) RETURNING id INTO v_referral_id;
    
    UPDATE users SET referral_code = p_partner_code, referred_by = v_partner_id WHERE id = p_customer_id;
    
    INSERT INTO partner_earnings (partner_id, referral_id, earning_type, amount_cents, description)
    VALUES (v_partner_id, v_referral_id, 'customer_download', p_commission_cents, 'Customer download: ' || p_customer_name);
    
    RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Create business referral
CREATE OR REPLACE FUNCTION create_business_referral(
    p_partner_code TEXT,
    p_business_id UUID,
    p_business_name TEXT,
    p_business_plan TEXT DEFAULT 'trial',
    p_commission_cents INTEGER DEFAULT 15000
)
RETURNS UUID AS $$
DECLARE
    v_partner_id UUID;
    v_referral_id UUID;
    v_association_id TEXT;
BEGIN
    SELECT id INTO v_partner_id FROM partners WHERE code = p_partner_code AND is_active = true;
    
    IF v_partner_id IS NULL THEN
        RAISE EXCEPTION 'Partner code % not found or inactive', p_partner_code;
    END IF;
    
    v_association_id := 'B-' || p_business_id::text;
    
    INSERT INTO referrals (
        association_id, partner_id, partner_code, type,
        business_id, business_name, business_plan, commission_cents
    ) VALUES (
        v_association_id, v_partner_id, p_partner_code, 'business',
        p_business_id, p_business_name, p_business_plan, p_commission_cents
    ) RETURNING id INTO v_referral_id;
    
    UPDATE businesses SET affiliate_code = p_partner_code, referred_by = v_partner_id WHERE id = p_business_id;
    
    INSERT INTO partner_earnings (partner_id, referral_id, earning_type, amount_cents, description)
    VALUES (v_partner_id, v_referral_id, 'business_signup', p_commission_cents, 'Business signup: ' || p_business_name);
    
    RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Check partner visit bonus
CREATE OR REPLACE FUNCTION check_partner_visit_bonus(
    p_checkin_id UUID,
    p_business_id UUID,
    p_customer_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_partner_id UUID;
    v_partner_email TEXT;
    v_bonus_points INTEGER := 50;
    v_regular_points INTEGER := 10;
BEGIN
    SELECT r.partner_id, p.email INTO v_partner_id, v_partner_email
    FROM referrals r
    INNER JOIN partners p ON r.partner_id = p.id
    WHERE r.business_id = p_business_id AND r.type = 'business';
    
    IF v_partner_id IS NULL THEN
        RETURN false;
    END IF;
    
    IF v_partner_email != p_customer_email THEN
        RETURN false;
    END IF;
    
    INSERT INTO partner_visits (partner_id, business_id, business_name, checkin_id, bonus_points, regular_points, total_points)
    SELECT v_partner_id, p_business_id, b.name, p_checkin_id, v_bonus_points, v_regular_points, v_bonus_points + v_regular_points
    FROM businesses b WHERE b.id = p_business_id;
    
    UPDATE users SET loyalty_points = loyalty_points + v_bonus_points WHERE email = p_customer_email;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 4. Validate partner code
CREATE OR REPLACE FUNCTION validate_partner_code(p_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, partner_id UUID, partner_name TEXT, message TEXT) AS $$
DECLARE
    v_partner RECORD;
BEGIN
    SELECT * INTO v_partner FROM partners WHERE code = p_code;
    
    IF v_partner IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Code not found';
        RETURN;
    END IF;
    
    IF NOT v_partner.is_active THEN
        RETURN QUERY SELECT false, v_partner.id, v_partner.name, 'Partner account is inactive';
        RETURN;
    END IF;
    
    IF v_partner.status != 'approved' THEN
        RETURN QUERY SELECT false, v_partner.id, v_partner.name, 'Partner account not approved';
        RETURN;
    END IF;
    
    RETURN QUERY SELECT true, v_partner.id, v_partner.name, 'Code is valid';
END;
$$ LANGUAGE plpgsql;

-- 5. Get partner analytics
CREATE OR REPLACE FUNCTION get_partner_analytics(p_partner_id UUID)
RETURNS TABLE(
    total_referrals INTEGER,
    customer_referrals INTEGER,
    business_referrals INTEGER,
    total_earnings_rands NUMERIC,
    pending_balance_rands NUMERIC,
    paid_earnings_rands NUMERIC,
    app_downloads INTEGER,
    business_visits INTEGER,
    visit_bonus_points INTEGER,
    pending_commissions INTEGER,
    approved_commissions INTEGER,
    paid_commissions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.total_referrals,
        p.total_customer_referrals,
        p.total_business_referrals,
        ROUND((p.total_earnings_cents::NUMERIC / 100), 2),
        ROUND((p.pending_balance_cents::NUMERIC / 100), 2),
        ROUND((p.paid_earnings_cents::NUMERIC / 100), 2),
        p.app_downloads,
        p.partner_business_visits,
        p.partner_visit_bonus_points,
        (SELECT COUNT(*)::INTEGER FROM referrals WHERE partner_id = p_partner_id AND commission_status = 'pending'),
        (SELECT COUNT(*)::INTEGER FROM referrals WHERE partner_id = p_partner_id AND commission_status = 'approved'),
        (SELECT COUNT(*)::INTEGER FROM referrals WHERE partner_id = p_partner_id AND commission_status = 'paid')
    FROM partners p
    WHERE p.id = p_partner_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 9: CREATE VIEWS
-- ============================================

-- Business performance view
CREATE OR REPLACE VIEW business_performance AS
SELECT 
    b.id,
    b.name,
    b.category,
    b.city,
    b.rating,
    b.review_count,
    b.subscription_status,
    COUNT(DISTINCT r.id) as total_reservations,
    COUNT(DISTINCT c.id) as total_checkins,
    COUNT(DISTINCT s.id) as total_specials,
    COUNT(DISTINCT rv.id) as total_reviews,
    b.created_at
FROM businesses b
LEFT JOIN reservations r ON b.id = r.business_id
LEFT JOIN checkins c ON b.id = c.business_id
LEFT JOIN specials s ON b.id = s.business_id
LEFT JOIN reviews rv ON b.id = rv.business_id
GROUP BY b.id;

-- User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.loyalty_points,
    u.status,
    COUNT(DISTINCT c.id) as total_checkins,
    COUNT(DISTINCT r.id) as total_reservations,
    COUNT(DISTINCT rv.id) as total_reviews,
    u.joined_at,
    u.last_active
FROM users u
LEFT JOIN checkins c ON u.id = c.user_id
LEFT JOIN reservations r ON u.id = r.user_id
LEFT JOIN reviews rv ON u.id = rv.user_id
GROUP BY u.id;

-- Partner performance view
CREATE OR REPLACE VIEW partner_performance AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.email,
    p.status,
    p.total_referrals,
    p.total_customer_referrals,
    p.total_business_referrals,
    ROUND((p.total_earnings_cents::NUMERIC / 100), 2) as total_earnings,
    ROUND((p.pending_balance_cents::NUMERIC / 100), 2) as pending_balance,
    ROUND((p.paid_earnings_cents::NUMERIC / 100), 2) as paid_earnings,
    p.app_downloads,
    p.partner_business_visits,
    p.partner_visit_bonus_points,
    COUNT(DISTINCT r.id) FILTER (WHERE r.type = 'customer') as customer_count,
    COUNT(DISTINCT r.id) FILTER (WHERE r.type = 'business') as business_count,
    COUNT(DISTINCT pv.id) as visit_count,
    p.joined_at,
    p.last_active
FROM partners p
LEFT JOIN referrals r ON p.id = r.partner_id
LEFT JOIN partner_visits pv ON p.id = pv.partner_id
GROUP BY p.id;

-- Referral activity view
CREATE OR REPLACE VIEW referral_activity AS
SELECT 
    r.id,
    r.association_id,
    r.type,
    p.code as partner_code,
    p.name as partner_name,
    CASE 
        WHEN r.type = 'customer' THEN r.customer_name
        WHEN r.type = 'business' THEN r.business_name
    END as referred_name,
    ROUND((r.commission_cents::NUMERIC / 100), 2) as commission,
    r.commission_status,
    r.created_at
FROM referrals r
INNER JOIN partners p ON r.partner_id = p.id
ORDER BY r.created_at DESC;

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================

-- Verify migration
SELECT 
    'Tables Created' as status,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Show all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
