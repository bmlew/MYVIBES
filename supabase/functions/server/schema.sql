-- MYVIBES Production Database Schema
-- Optimized for 20,000+ concurrent users with comprehensive indexing
-- Run this in the Supabase SQL Editor to create all tables

-- ============================================
-- 1. USERS TABLE (Customers & Business Owners)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  mobile TEXT,
  city TEXT DEFAULT 'Johannesburg',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'business_owner', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  total_orders INTEGER DEFAULT 0,
  total_spend NUMERIC(10,2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  notification_preference TEXT DEFAULT 'email' CHECK (notification_preference IN ('email', 'sms', 'push', 'none')),
  last_active TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_loyalty_points ON users(loyalty_points DESC);

-- ============================================
-- 2. BUSINESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  province TEXT DEFAULT 'Gauteng',
  postal_code TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  hours JSONB,
  images TEXT[],
  logo TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  features TEXT[],
  amenities TEXT[],
  capacity INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  subscription_price NUMERIC(10,2),
  yoco_customer_id TEXT,
  yoco_subscription_id TEXT,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  total_reservations INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for businesses
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON businesses(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_businesses_subscription ON businesses(subscription_status);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING gist(point(longitude, latitude));

-- ============================================
-- 3. BUSINESS_LOCATIONS TABLE (Additional locations)
-- ============================================
CREATE TABLE IF NOT EXISTS business_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  phone TEXT,
  hours JSONB,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_business ON business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_locations_city ON business_locations(city);

-- ============================================
-- 4. SPECIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  original_price NUMERIC(10,2),
  special_price NUMERIC(10,2),
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  days_active TEXT[],
  terms TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  redemption_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specials_business ON specials(business_id);
CREATE INDEX IF NOT EXISTS idx_specials_active ON specials(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_specials_valid_until ON specials(valid_until);
CREATE INDEX IF NOT EXISTS idx_specials_clicks ON specials(click_count DESC);

-- ============================================
-- 5. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  image_url TEXT,
  ticket_price NUMERIC(10,2),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_business ON events(business_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active) WHERE is_active = true;

-- ============================================
-- 6. RESERVATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  confirmation_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_business ON reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_confirmation ON reservations(confirmation_code);

-- ============================================
-- 7. CHECK-INS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  points_earned INTEGER DEFAULT 10,
  bonus_points INTEGER DEFAULT 0,
  bonus_reason TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_business ON checkins(business_id);
CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON checkins(checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_user_business ON checkins(user_id, business_id);

-- ============================================
-- 8. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response TEXT,
  response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- ============================================
-- 9. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  yoco_payment_id TEXT,
  yoco_checkout_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_business ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_yoco ON payments(yoco_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

-- ============================================
-- 10. LOYALTY_TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_business ON loyalty_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_type ON loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_created ON loyalty_transactions(created_at DESC);

-- ============================================
-- 11. ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  points_awarded INTEGER DEFAULT 0,
  metadata JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);

-- ============================================
-- 12. REWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  value NUMERIC(10,2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  redemption_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_business ON rewards(business_id);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_rewards_points ON rewards(points_required);

-- ============================================
-- 13. PARTNERS TABLE (Influencers/Ambassadors)
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT,
  username TEXT UNIQUE,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_channel TEXT,
  total_followers INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  total_earnings NUMERIC(10,2) DEFAULT 0,
  available_balance NUMERIC(10,2) DEFAULT 0,
  pending_balance NUMERIC(10,2) DEFAULT 0,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  bank_branch_code TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_username ON partners(username);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_earnings ON partners(total_earnings DESC);

-- ============================================
-- 14. REFERRAL_CODES TABLE (Universal codes)
-- ============================================
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_partner ON referral_codes(partner_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active) WHERE is_active = true;

-- ============================================
-- 15. REFERRALS TABLE (Both customer & business)
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  referral_code_id UUID REFERENCES referral_codes(id) ON DELETE CASCADE,
  referral_type TEXT NOT NULL CHECK (referral_type IN ('customer', 'business')),
  tracking_id TEXT UNIQUE NOT NULL,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referred_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  referred_entity_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_referrals_partner ON referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referrals_type ON referrals(referral_type);
CREATE INDEX IF NOT EXISTS idx_referrals_tracking ON referrals(tracking_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_business ON referrals(referred_business_id);

-- ============================================
-- 16. COMMISSIONS TABLE (Partner earnings)
-- ============================================
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  commission_type TEXT NOT NULL CHECK (commission_type IN (
    'customer_download_bounty',
    'customer_checkin_threshold',
    'business_subscription',
    'business_recurring',
    'partner_visit_bonus'
  )),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'paid', 'cancelled')),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  metadata JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_referral ON commissions(referral_id);
CREATE INDEX IF NOT EXISTS idx_commissions_type ON commissions(commission_type);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_earned ON commissions(earned_at DESC);

-- ============================================
-- 17. SPECIAL_CLICKS TABLE (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS special_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  special_id UUID REFERENCES specials(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,
  device_info JSONB,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_special_clicks_special ON special_clicks(special_id);
CREATE INDEX IF NOT EXISTS idx_special_clicks_business ON special_clicks(business_id);
CREATE INDEX IF NOT EXISTS idx_special_clicks_user ON special_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_special_clicks_timestamp ON special_clicks(clicked_at DESC);

-- ============================================
-- 18. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'reservation_confirmed',
    'reservation_reminder',
    'special_new',
    'event_new',
    'loyalty_milestone',
    'system'
  )),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business ON notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- STORED PROCEDURES & FUNCTIONS
-- ============================================

-- Increment special click count
CREATE OR REPLACE FUNCTION increment_special_clicks(special_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE specials
  SET click_count = click_count + 1
  WHERE id = special_id;
END;
$$ LANGUAGE plpgsql;

-- Get special-to-reservation conversion matches
CREATE OR REPLACE FUNCTION get_special_to_reservation_matches()
RETURNS TABLE(matches BIGINT, total_clicks BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT sc.id)::BIGINT as matches,
    (SELECT COUNT(*)::BIGINT FROM special_clicks) as total_clicks
  FROM special_clicks sc
  INNER JOIN reservations r ON (
    r.business_id = sc.business_id
    AND (r.user_id = sc.user_id OR r.customer_email = sc.user_email)
    AND r.created_at >= sc.clicked_at
    AND r.created_at <= sc.clicked_at + INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql;

-- Update business rating from reviews
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
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_business_rating();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_timestamp BEFORE UPDATE ON businesses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specials_timestamp BEFORE UPDATE ON specials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_timestamp BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_timestamp BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_timestamp BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL SYSTEM DATA
-- ============================================

-- Insert default admin user if not exists
INSERT INTO users (id, email, full_name, username, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@myvibes.co.za',
  'MYVIBES Admin',
  'admin',
  'admin'
) ON CONFLICT (email) DO NOTHING;

COMMENT ON DATABASE postgres IS 'MYVIBES Production Database - Optimized for 20,000+ concurrent users';
