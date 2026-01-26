-- =====================================================
-- MYVIBES Platform Database Schema
-- Target: 10,000+ customers, 3,000+ establishments
-- =====================================================

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS analytics_events CASCADE;
-- DROP TABLE IF EXISTS ledger_entries CASCADE;
-- DROP TABLE IF EXISTS commissions CASCADE;
-- DROP TABLE IF EXISTS affiliates CASCADE;
-- DROP TABLE IF EXISTS reservations CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS specials CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS businesses CASCADE;
-- DROP TABLE IF EXISTS platform_settings CASCADE;

-- =====================================================
-- 1. BUSINESSES TABLE (Core)
-- =====================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  type TEXT, -- 'restaurant', 'hotel', 'bar', 'cafe', etc.
  description TEXT,
  cuisine_type TEXT,
  price_range TEXT, -- '$', '$$', '$$$', '$$$$'
  age_group TEXT, -- 'family', 'young_adults', 'mature', 'all_ages'
  
  -- Payment & Subscription
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'standard', 'premium'
  subscription_status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'suspended', 'grace_period'
  payment_status TEXT DEFAULT 'unpaid', -- 'paid', 'unpaid', 'overdue'
  monthly_fee DECIMAL(10, 2) DEFAULT 499.00,
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  subscription_start_date TIMESTAMP,
  
  -- Visibility Controls
  is_active BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  visibility_override TEXT, -- 'force_visible', 'force_hidden', null
  override_reason TEXT,
  grace_period_until TIMESTAMP,
  grace_period_reason TEXT,
  
  -- Affiliate Program
  affiliate_code TEXT,
  referred_by TEXT, -- Affiliate code that referred this business
  
  -- Media & Branding
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images JSONB, -- Array of image URLs
  
  -- Contact & Social Media
  website TEXT,
  facebook TEXT,
  instagram TEXT,
  twitter TEXT,
  tiktok TEXT,
  linkedin TEXT,
  
  -- Operating Hours (JSON structure)
  operating_hours JSONB, -- { "monday": { "open": "09:00", "close": "17:00", "closed": false }, ... }
  
  -- Features & Amenities
  features JSONB, -- ["wifi", "parking", "outdoor_seating", "wheelchair_accessible"]
  
  -- Location Coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- Soft delete
  
  -- Constraints
  CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'standard', 'premium')),
  CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'grace_period')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('paid', 'unpaid', 'overdue')),
  CONSTRAINT valid_visibility_override CHECK (visibility_override IN ('force_visible', 'force_hidden', NULL))
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_province ON businesses(province);
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(type);
CREATE INDEX IF NOT EXISTS idx_businesses_subscription_status ON businesses(subscription_status);
CREATE INDEX IF NOT EXISTS idx_businesses_payment_status ON businesses(payment_status);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_subscription_tier ON businesses(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_next_payment_date ON businesses(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_businesses_referred_by ON businesses(referred_by);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_businesses_name_search ON businesses USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_businesses_description_search ON businesses USING gin(to_tsvector('english', COALESCE(description, '')));

-- Geolocation index for nearby searches
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);

-- =====================================================
-- 2. REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_id UUID, -- If logged in
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Review Metadata
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  response_from_owner TEXT,
  response_date TIMESTAMP,
  
  -- Status
  is_approved BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_email ON reviews(customer_email);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

-- =====================================================
-- 3. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_method TEXT, -- 'card', 'eft', 'yoco', 'manual'
  
  -- Transaction Info
  transaction_id TEXT,
  payment_reference TEXT,
  payment_date TIMESTAMP,
  
  -- Subscription Info
  subscription_month DATE, -- Which month this payment covers
  subscription_tier TEXT, -- 'standard', 'premium'
  
  -- Additional Info
  notes TEXT,
  receipt_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_business_id ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_month ON payments(subscription_month);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- =====================================================
-- 4. SPECIALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Special Details
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  special_price DECIMAL(10, 2),
  
  -- Validity
  valid_from DATE,
  valid_until DATE,
  days_of_week JSONB, -- ["monday", "friday"]
  
  -- Media
  image_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  claims_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_specials_business_id ON specials(business_id);
CREATE INDEX IF NOT EXISTS idx_specials_is_active ON specials(is_active);
CREATE INDEX IF NOT EXISTS idx_specials_valid_dates ON specials(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_specials_created_at ON specials(created_at DESC);

-- =====================================================
-- 5. EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Event Details
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location TEXT,
  
  -- Ticketing
  ticket_price DECIMAL(10, 2),
  tickets_available INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  
  -- Media
  image_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_business_id ON events(business_id);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- =====================================================
-- 6. AFFILIATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal Information
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  
  -- Affiliate Details
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- Percentage
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'suspended', 'rejected'
  
  -- Bank Details
  bank_name TEXT,
  account_number TEXT,
  account_holder_name TEXT,
  branch_code TEXT,
  
  -- Performance Metrics
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  pending_earnings DECIMAL(10, 2) DEFAULT 0,
  paid_earnings DECIMAL(10, 2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_affiliate_status CHECK (status IN ('pending', 'approved', 'suspended', 'rejected'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_created_at ON affiliates(created_at DESC);

-- =====================================================
-- 7. COMMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  
  -- Commission Details
  amount DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  base_amount DECIMAL(10, 2) NOT NULL, -- The subscription amount
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
  
  -- Payment Info
  paid_date TIMESTAMP,
  payment_reference TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_commission_status CHECK (status IN ('pending', 'approved', 'paid', 'cancelled'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_business_id ON commissions(business_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_paid_date ON commissions(paid_date);

-- =====================================================
-- 8. RESERVATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_id UUID, -- If logged in
  
  -- Reservation Details
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  reservation_date TIMESTAMP NOT NULL,
  special_requests TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
  cancellation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_reservation_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reservations_business_id ON reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email ON reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);

-- =====================================================
-- 9. ANALYTICS EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type TEXT NOT NULL, -- 'view', 'click', 'call', 'direction', 'menu_view', 'website_click', 'special_view'
  event_category TEXT, -- 'engagement', 'conversion', 'navigation'
  
  -- User Info
  user_id UUID,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Location
  city TEXT,
  country TEXT,
  
  -- Additional Data
  metadata JSONB, -- Flexible field for event-specific data
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_business_id ON analytics_events(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);

-- Partition by month for better performance (optional, for high volume)
-- CREATE TABLE analytics_events_y2025m01 PARTITION OF analytics_events
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- =====================================================
-- 10. LEDGER ENTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entry Details
  entry_type TEXT NOT NULL, -- 'revenue', 'commission_payout', 'refund', 'expense'
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  
  -- Description
  description TEXT,
  
  -- Reference
  reference_id UUID, -- Links to payments, commissions, etc.
  reference_type TEXT, -- 'payment', 'commission', 'expense', 'refund'
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_entry_type CHECK (entry_type IN ('revenue', 'commission_payout', 'refund', 'expense'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ledger_entry_type ON ledger_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON ledger_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_reference ON ledger_entries(reference_id, reference_type);

-- =====================================================
-- 11. PLATFORM SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);

-- =====================================================
-- 12. INSERT DEFAULT PLATFORM SETTINGS
-- =====================================================
INSERT INTO platform_settings (key, value, description) VALUES
  ('subscription_standard_price', '499', 'Monthly price for Standard tier (ZAR)'),
  ('subscription_premium_price', '999', 'Monthly price for Premium tier (ZAR)'),
  ('affiliate_commission_rate', '10', 'Default affiliate commission rate (%)'),
  ('grace_period_days', '7', 'Default grace period for missed payments (days)'),
  ('payment_reminder_days', '3', 'Days before payment due to send reminder'),
  ('featured_listings_limit', '10', 'Number of featured businesses on homepage')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 13. CREATE UPDATE TIMESTAMP TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specials_updated_at BEFORE UPDATE ON specials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. ROW LEVEL SECURITY (RLS) - Optional but recommended
-- =====================================================

-- Enable RLS on tables
-- ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
-- CREATE POLICY "Public read access for active businesses"
--   ON businesses FOR SELECT
--   USING (is_active = true AND payment_status = 'paid');

-- CREATE POLICY "Business owners can update their own business"
--   ON businesses FOR UPDATE
--   USING (auth.uid()::text = id::text);

-- =====================================================
-- COMPLETE!
-- =====================================================

-- Summary:
-- ✅ 11 tables created
-- ✅ 50+ indexes for performance
-- ✅ Full-text search enabled
-- ✅ Geolocation support
-- ✅ Automated timestamp updates
-- ✅ Data integrity constraints
-- ✅ Default platform settings

-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Run the migration script to move KV data to tables
-- 3. Update server endpoints to use new tables
-- 4. Test thoroughly

COMMENT ON TABLE businesses IS 'Core table for all restaurants, hotels, and establishments';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings';
COMMENT ON TABLE payments IS 'Subscription payments and transaction history';
COMMENT ON TABLE specials IS 'Special offers and promotions';
COMMENT ON TABLE events IS 'Events hosted by businesses';
COMMENT ON TABLE affiliates IS 'Affiliate partners who refer businesses';
COMMENT ON TABLE commissions IS 'Commission tracking for affiliates';
COMMENT ON TABLE reservations IS 'Customer reservations and bookings';
COMMENT ON TABLE analytics_events IS 'User interaction and engagement tracking';
COMMENT ON TABLE ledger_entries IS 'Financial transaction ledger';
COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings';
