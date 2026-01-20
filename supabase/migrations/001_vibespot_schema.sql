-- VIBESPOT Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- GLOBAL PLATFORM ADMIN & CONFIGURATION
-- ============================================

-- Platform configuration table
CREATE TABLE platform_config (
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

-- Insert default configuration
INSERT INTO platform_config (subscription_price, currency, trial_days) 
VALUES (299.00, 'ZAR', 14);

-- Platform admin users
CREATE TABLE platform_admins (
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
-- BUSINESS/VENUE MANAGEMENT
-- ============================================

-- Business accounts (restaurants/hotels)
CREATE TABLE businesses (
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
  owner_name VARCHAR(255),
  owner_email VARCHAR(255),
  owner_phone VARCHAR(50),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  total_views INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for businesses
CREATE INDEX idx_businesses_location ON businesses USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX idx_businesses_status ON businesses(subscription_status);
CREATE INDEX idx_businesses_city ON businesses(city);

-- Additional performance indexes for 5000+ records
CREATE INDEX idx_businesses_status_active ON businesses(subscription_status, is_active) 
WHERE subscription_status IN ('trial', 'active') AND is_active = true;

CREATE INDEX idx_businesses_city_type ON businesses(city, business_type) 
WHERE is_active = true;

CREATE INDEX idx_businesses_search ON businesses 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_businesses_created ON businesses(created_at DESC);

-- Enable PostGIS earthdistance for fast geolocation
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ============================================
-- SUBSCRIPTION & PAYMENT MANAGEMENT
-- ============================================

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly
  features JSONB,
  max_specials INTEGER,
  max_events INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, price, billing_period, max_specials, max_events, features) VALUES
('Basic', 299.00, 'monthly', 10, 5, '{"analytics": true, "support": "email"}'),
('Pro', 499.00, 'monthly', 999, 999, '{"analytics": true, "support": "priority", "featured": true}'),
('Enterprise', 999.00, 'monthly', 999, 999, '{"analytics": true, "support": "dedicated", "featured": true, "api_access": true}');

-- Payment transactions
CREATE TABLE payments (
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

CREATE INDEX idx_payments_business ON payments(business_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(created_at);

-- ============================================
-- MENUS, SPECIALS & EVENTS
-- ============================================

-- Menu items
CREATE TABLE menu_items (
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

CREATE INDEX idx_menu_items_business ON menu_items(business_id);

-- Daily specials
CREATE TABLE specials (
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

CREATE INDEX idx_specials_business ON specials(business_id);
CREATE INDEX idx_specials_dates ON specials(start_date, end_date);

-- Events
CREATE TABLE events (
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

CREATE INDEX idx_events_business ON events(business_id);
CREATE INDEX idx_events_date ON events(event_date);

-- ============================================
-- CUSTOMER MANAGEMENT
-- ============================================

-- Customers (app users)
CREATE TABLE customers (
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
CREATE TABLE customer_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, business_id)
);

-- Customer event interests
CREATE TABLE customer_event_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, event_id)
);

-- ============================================
-- ANALYTICS & TRACKING
-- ============================================

-- Business analytics
CREATE TABLE business_analytics (
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
CREATE TABLE platform_analytics (
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
CREATE TABLE audit_logs (
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

CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

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