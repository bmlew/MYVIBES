-- VIBESPOT Database Schema
-- Version: 1.0
-- Idempotent: Uses IF NOT EXISTS for safe re-runs

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- GLOBAL PLATFORM ADMIN & CONFIGURATION
-- ============================================

-- Platform configuration table
CREATE TABLE IF NOT EXISTS platform_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_price DECIMAL(10, 2) NOT NULL DEFAULT 299.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
  trial_days INTEGER NOT NULL DEFAULT 14,
  yoco_public_key TEXT,
  yoco_secret_key TEXT,
  platform_fee_percentage DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration (only if not exists)
INSERT INTO platform_config (subscription_price, currency, trial_days) 
SELECT 299.00, 'ZAR', 14
WHERE NOT EXISTS (SELECT 1 FROM platform_config LIMIT 1);

-- Platform admin users
CREATE TABLE IF NOT EXISTS platform_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin', -- admin, super_admin, finance
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- UNIFIED USERS TABLE
-- ============================================

-- Unified users table (supports both customers and business owners)
-- Must be created before businesses table due to foreign key reference
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(50),
  city VARCHAR(100),
  
  -- User type and status
  role VARCHAR(50) NOT NULL DEFAULT 'customer', -- customer, business_owner, admin
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
  
  -- Customer-specific fields
  total_orders INTEGER DEFAULT 0,
  total_spend DECIMAL(10, 2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  notification_preference VARCHAR(50) DEFAULT 'email',
  
  -- Preferences
  favorite_cuisines TEXT[],
  dietary_preferences TEXT[],
  
  -- Location
  last_latitude DECIMAL(10, 8),
  last_longitude DECIMAL(11, 8),
  
  -- Timestamps
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status, role);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city) WHERE role = 'customer';

-- ============================================
-- BUSINESS/VENUE MANAGEMENT
-- ============================================

-- Business accounts (restaurants/hotels)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  
  -- Business details
  business_type VARCHAR(50) DEFAULT 'restaurant', -- restaurant, bar, hotel, cafe
  cuisine_types TEXT[], -- array of cuisines
  price_range INTEGER DEFAULT 2, -- 1-4 scale
  opening_hours JSONB, -- flexible JSON for hours
  
  -- Subscription status
  subscription_status VARCHAR(50) DEFAULT 'trial', -- trial, active, suspended, cancelled
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Contact person
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  owner_name VARCHAR(255),
  owner_email VARCHAR(255),
  owner_phone VARCHAR(50),
  
  -- Migration and business metrics
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  plan VARCHAR(50) DEFAULT 'standard',
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  total_views INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for businesses
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(subscription_status);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);

-- Additional performance indexes for 5000+ records
CREATE INDEX IF NOT EXISTS idx_businesses_status_active ON businesses(subscription_status, is_active) 
WHERE subscription_status IN ('trial', 'active') AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_businesses_city_type ON businesses(city, business_type) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_businesses_search ON businesses 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_businesses_created ON businesses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

-- Business locations
CREATE TABLE IF NOT EXISTS business_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_locations_business ON business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_business_locations_primary ON business_locations(business_id, is_primary);

-- Business media (images, videos)
CREATE TABLE IF NOT EXISTS business_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  media_type VARCHAR(50) NOT NULL, -- image, video
  media_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_media_business ON business_media(business_id);
CREATE INDEX IF NOT EXISTS idx_business_media_primary ON business_media(business_id, is_primary);

-- Enable PostGIS earthdistance for fast geolocation
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ============================================
-- SUBSCRIPTION & PAYMENT MANAGEMENT
-- ============================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly
  features JSONB,
  max_specials INTEGER,
  max_events INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, billing_period)
);

-- Insert default plans (only if they don't exist)
INSERT INTO subscription_plans (name, price, billing_period, max_specials, max_events, features) VALUES
('Basic', 299.00, 'monthly', 10, 5, '{"analytics": true, "support": "email"}'),
('Pro', 499.00, 'monthly', 999, 999, '{"analytics": true, "support": "priority", "featured": true}'),
('Enterprise', 999.00, 'monthly', 999, 999, '{"analytics": true, "support": "dedicated", "featured": true, "api_access": true}')
ON CONFLICT (name, billing_period) DO NOTHING;

-- Payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(50), -- yoco_card, eft, manual
  
  -- Yoco integration
  yoco_payment_id TEXT,
  yoco_checkout_id TEXT,
  yoco_response JSONB,
  
  -- Transaction details
  description TEXT,
  invoice_number VARCHAR(100),
  receipt_url TEXT,
  
  -- Period covered
  period_start DATE,
  period_end DATE,
  
  -- Reconciliation
  is_reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMP WITH TIME ZONE,
  reconciled_by UUID REFERENCES platform_admins(id),
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_business ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);

-- ============================================
-- MENUS, SPECIALS & EVENTS
-- ============================================

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- starters, mains, desserts, drinks
  price DECIMAL(10, 2),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  dietary_info TEXT[], -- vegan, vegetarian, gluten-free, etc.
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_business ON menu_items(business_id);

-- Daily specials
CREATE TABLE IF NOT EXISTS specials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  original_price DECIMAL(10, 2),
  special_price DECIMAL(10, 2),
  discount_percentage DECIMAL(5, 2),
  image_url TEXT,
  
  -- Schedule
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  days_of_week INTEGER[], -- 0-6 (Sunday-Saturday)
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specials_business ON specials(business_id);
CREATE INDEX IF NOT EXISTS idx_specials_dates ON specials(start_date, end_date);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(100), -- live_music, wine_tasting, brunch, etc.
  image_url TEXT,
  
  -- Schedule
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  
  -- Capacity
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  
  -- Pricing
  ticket_price DECIMAL(10, 2),
  is_free BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_business ON events(business_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- ============================================
-- CUSTOMER MANAGEMENT
-- ============================================

-- Loyalty points ledger for tracking all point transactions
CREATE TABLE IF NOT EXISTS loyalty_points_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- earned, redeemed, expired, bonus, migration
  description TEXT,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_user ON loyalty_points_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_date ON loyalty_points_ledger(created_at DESC);

-- Customers (app users)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  full_name VARCHAR(255),
  
  -- Location
  last_latitude DECIMAL(10, 8),
  last_longitude DECIMAL(11, 8),
  last_city VARCHAR(100),
  
  -- Preferences
  favorite_cuisines TEXT[],
  dietary_preferences TEXT[],
  
  -- Auth
  auth_provider VARCHAR(50) DEFAULT 'email',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer favorites
CREATE TABLE IF NOT EXISTS customer_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, business_id)
);

-- Customer event interests
CREATE TABLE IF NOT EXISTS customer_event_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, event_id)
);

-- ============================================
-- RESERVATIONS & CHECK-INS
-- ============================================

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_business ON reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Check-ins
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  points_earned INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_check_ins_user ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_business ON check_ins(business_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_time ON check_ins(check_in_time DESC);

-- ============================================
-- PARTNERS & REFERRALS
-- ============================================

-- Partners (affiliates/influencers)
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, inactive
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  available_balance DECIMAL(10, 2) DEFAULT 0,
  pending_balance DECIMAL(10, 2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  total_business_referrals INTEGER DEFAULT 0,
  total_customer_referrals INTEGER DEFAULT 0,
  app_downloads INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);

-- Referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_partner ON referral_codes(partner_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- Partner commissions
CREATE TABLE IF NOT EXISTS partner_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  commission_type VARCHAR(50) NOT NULL, -- customer_download, business_referral, visit_bonus
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner ON partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON partner_commissions(status);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_date ON partner_commissions(created_at DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error, promo
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications(created_at DESC);

-- ============================================
-- SPECIAL TRACKING
-- ============================================

-- Special clicks tracking
CREATE TABLE IF NOT EXISTS special_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  click_type VARCHAR(50) NOT NULL, -- call, directions, website, menu
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_special_clicks_business ON special_clicks(business_id);
CREATE INDEX IF NOT EXISTS idx_special_clicks_type ON special_clicks(business_id, click_type);
CREATE INDEX IF NOT EXISTS idx_special_clicks_date ON special_clicks(created_at DESC);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

-- Business analytics
CREATE TABLE IF NOT EXISTS business_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Metrics
  profile_views INTEGER DEFAULT 0,
  menu_views INTEGER DEFAULT 0,
  special_views INTEGER DEFAULT 0,
  event_views INTEGER DEFAULT 0,
  direction_clicks INTEGER DEFAULT 0,
  call_clicks INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  new_favorites INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, date)
);

-- Platform-wide analytics
CREATE TABLE IF NOT EXISTS platform_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  
  -- Revenue
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  successful_payments INTEGER DEFAULT 0,
  failed_payments INTEGER DEFAULT 0,
  
  -- Subscriptions
  active_subscriptions INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  cancelled_subscriptions INTEGER DEFAULT 0,
  trial_conversions INTEGER DEFAULT 0,
  
  -- User engagement
  total_app_users INTEGER DEFAULT 0,
  active_app_users INTEGER DEFAULT 0,
  total_searches INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUDIT & LOGS
-- ============================================

-- Audit log for admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES platform_admins(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_platform_config_updated_at BEFORE UPDATE ON platform_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_specials_updated_at BEFORE UPDATE ON specials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GEOLOCATION FUNCTIONS FOR SCALE
-- ============================================

-- Fast geolocation search for 5000+ businesses
CREATE OR REPLACE FUNCTION get_nearby_businesses(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10,
  max_results INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  city VARCHAR,
  business_type VARCHAR,
  cuisine_types TEXT[],
  price_range INTEGER,
  logo_url TEXT,
  distance_km NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.slug,
    b.latitude,
    b.longitude,
    b.city,
    b.business_type,
    b.cuisine_types,
    b.price_range,
    b.logo_url,
    ROUND(
      (earth_distance(
        ll_to_earth(b.latitude, b.longitude),
        ll_to_earth(user_lat, user_lng)
      ) / 1000)::numeric, 
      2
    ) as distance_km
  FROM businesses b
  WHERE 
    b.is_active = true
    AND b.subscription_status IN ('trial', 'active')
    AND earth_box(ll_to_earth(user_lat, user_lng), radius_km * 1000) @> 
        ll_to_earth(b.latitude, b.longitude)
  ORDER BY distance_km
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;