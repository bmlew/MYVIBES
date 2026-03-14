-- ============================================
-- MYVIBES UNIVERSAL PARTNER/INFLUENCER REFERRAL SYSTEM
-- ============================================
-- Run this after database-migration.sql
-- Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ============================================

-- ============================================
-- 1. PARTNERS/AFFILIATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Partner Identity
    code TEXT UNIQUE NOT NULL, -- Universal code (e.g., "SMI7843")
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    
    -- Authentication (optional - if partners need to log in)
    password_hash TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
    is_active BOOLEAN DEFAULT true,
    
    -- Referral Tracking
    total_referrals INTEGER DEFAULT 0,
    total_customer_referrals INTEGER DEFAULT 0,
    total_business_referrals INTEGER DEFAULT 0,
    
    -- Earnings (in cents to avoid floating point issues)
    total_earnings_cents INTEGER DEFAULT 0, -- Total earned (all time)
    pending_balance_cents INTEGER DEFAULT 0, -- Pending approval
    paid_earnings_cents INTEGER DEFAULT 0, -- Already paid out
    
    -- Engagement
    app_downloads INTEGER DEFAULT 0, -- Customer referrals that downloaded app
    partner_business_visits INTEGER DEFAULT 0, -- Times they visited their referred businesses
    partner_visit_bonus_points INTEGER DEFAULT 0, -- Total bonus points from visits
    
    -- Bank Details (for payouts)
    bank_name TEXT,
    account_holder TEXT,
    account_number TEXT,
    branch_code TEXT,
    
    -- Metadata
    notes TEXT, -- Admin notes
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. REFERRALS TABLE (Universal Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Association ID with B-/C- prefix
    association_id TEXT UNIQUE NOT NULL, -- "B-{business_id}" or "C-{customer_id}"
    
    -- Partner Info
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    partner_code TEXT NOT NULL, -- Denormalized for quick lookups
    
    -- Referral Type
    type TEXT NOT NULL CHECK (type IN ('customer', 'business')),
    
    -- Customer Referral Fields (if type = 'customer')
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_email TEXT,
    
    -- Business Referral Fields (if type = 'business')
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    business_name TEXT,
    business_plan TEXT, -- trial, basic, premium, etc.
    
    -- Earnings
    commission_cents INTEGER DEFAULT 0, -- Commission amount in cents
    commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid', 'cancelled')),
    commission_approved_at TIMESTAMP WITH TIME ZONE,
    commission_paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Flexible data storage
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. PARTNER VISITS TABLE (Bonus System)
-- ============================================

CREATE TABLE IF NOT EXISTS partner_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Partner & Business
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    
    -- Check-in Reference
    checkin_id UUID REFERENCES checkins(id) ON DELETE CASCADE,
    
    -- Bonus Tracking
    bonus_points INTEGER DEFAULT 50, -- Extra points awarded
    regular_points INTEGER DEFAULT 10, -- Regular check-in points
    total_points INTEGER DEFAULT 60, -- regular_points + bonus_points
    
    -- Verification
    is_verified BOOLEAN DEFAULT true, -- Admin can mark as fraudulent
    
    -- Timestamps
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. PARTNER EARNINGS TABLE (Detailed Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS partner_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Partner
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    
    -- Referral Link (optional)
    referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
    
    -- Earning Details
    earning_type TEXT NOT NULL CHECK (earning_type IN ('customer_download', 'business_signup', 'recurring_commission', 'bonus')),
    amount_cents INTEGER NOT NULL, -- Amount in cents
    description TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    
    -- Payment Tracking
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method TEXT, -- eft, paypal, etc.
    payment_reference TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. PARTNER PAYOUTS TABLE (Batch Payments)
-- ============================================

CREATE TABLE IF NOT EXISTS partner_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Partner
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    
    -- Payout Details
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    
    -- Period
    period_start DATE,
    period_end DATE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Payment Details
    payment_method TEXT, -- eft, paypal, etc.
    payment_reference TEXT,
    bank_name TEXT,
    account_number TEXT,
    
    -- Processing
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Failure Tracking
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    notes TEXT, -- Admin notes
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Partners indexes
CREATE INDEX IF NOT EXISTS idx_partners_code ON partners(code);
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(is_active) WHERE is_active = true;

-- Referrals indexes
CREATE INDEX IF NOT EXISTS idx_referrals_partner ON referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_referrals_association_id ON referrals(association_id);
CREATE INDEX IF NOT EXISTS idx_referrals_type ON referrals(type);
CREATE INDEX IF NOT EXISTS idx_referrals_customer ON referrals(customer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_business ON referrals(business_id);
CREATE INDEX IF NOT EXISTS idx_referrals_partner_code ON referrals(partner_code);
CREATE INDEX IF NOT EXISTS idx_referrals_commission_status ON referrals(commission_status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

-- Partner visits indexes
CREATE INDEX IF NOT EXISTS idx_partner_visits_partner ON partner_visits(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_visits_business ON partner_visits(business_id);
CREATE INDEX IF NOT EXISTS idx_partner_visits_checkin ON partner_visits(checkin_id);
CREATE INDEX IF NOT EXISTS idx_partner_visits_verified ON partner_visits(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_partner_visits_date ON partner_visits(visited_at DESC);

-- Partner earnings indexes
CREATE INDEX IF NOT EXISTS idx_partner_earnings_partner ON partner_earnings(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_earnings_referral ON partner_earnings(referral_id);
CREATE INDEX IF NOT EXISTS idx_partner_earnings_type ON partner_earnings(earning_type);
CREATE INDEX IF NOT EXISTS idx_partner_earnings_status ON partner_earnings(status);
CREATE INDEX IF NOT EXISTS idx_partner_earnings_created_at ON partner_earnings(created_at DESC);

-- Partner payouts indexes
CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner ON partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_status ON partner_payouts(status);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_created_at ON partner_payouts(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_referrals_partner_type ON referrals(partner_id, type);
CREATE INDEX IF NOT EXISTS idx_referrals_partner_status ON referrals(partner_id, commission_status);
CREATE INDEX IF NOT EXISTS idx_partner_earnings_partner_status ON partner_earnings(partner_id, status);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================

CREATE TRIGGER update_partners_updated_at 
BEFORE UPDATE ON partners 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at 
BEFORE UPDATE ON referrals 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_earnings_updated_at 
BEFORE UPDATE ON partner_earnings 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_payouts_updated_at 
BEFORE UPDATE ON partner_payouts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Update partner stats on new referral
-- ============================================

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

-- ============================================
-- TRIGGER: Update partner earnings on commission approval
-- ============================================

CREATE OR REPLACE FUNCTION update_partner_earnings_on_commission()
RETURNS TRIGGER AS $$
BEGIN
    -- When commission is approved
    IF NEW.commission_status = 'approved' AND OLD.commission_status != 'approved' THEN
        UPDATE partners
        SET 
            pending_balance_cents = pending_balance_cents + NEW.commission_cents,
            total_earnings_cents = total_earnings_cents + NEW.commission_cents
        WHERE id = NEW.partner_id;
    END IF;
    
    -- When commission is paid
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

-- ============================================
-- TRIGGER: Track partner visit bonus
-- ============================================

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
-- STORED PROCEDURES FOR REFERRAL SYSTEM
-- ============================================

-- 1. Create customer referral
CREATE OR REPLACE FUNCTION create_customer_referral(
    p_partner_code TEXT,
    p_customer_id UUID,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_commission_cents INTEGER DEFAULT 2000 -- R20.00 default
)
RETURNS UUID AS $$
DECLARE
    v_partner_id UUID;
    v_referral_id UUID;
    v_association_id TEXT;
BEGIN
    -- Find partner by code
    SELECT id INTO v_partner_id FROM partners WHERE code = p_partner_code AND is_active = true;
    
    IF v_partner_id IS NULL THEN
        RAISE EXCEPTION 'Partner code % not found or inactive', p_partner_code;
    END IF;
    
    -- Create association ID with C- prefix
    v_association_id := 'C-' || p_customer_id::text;
    
    -- Create referral record
    INSERT INTO referrals (
        association_id,
        partner_id,
        partner_code,
        type,
        customer_id,
        customer_name,
        customer_email,
        commission_cents
    ) VALUES (
        v_association_id,
        v_partner_id,
        p_partner_code,
        'customer',
        p_customer_id,
        p_customer_name,
        p_customer_email,
        p_commission_cents
    ) RETURNING id INTO v_referral_id;
    
    -- Update customer record with referral info
    UPDATE users
    SET 
        referral_code = p_partner_code,
        referred_by = v_partner_id
    WHERE id = p_customer_id;
    
    -- Create earning record
    INSERT INTO partner_earnings (
        partner_id,
        referral_id,
        earning_type,
        amount_cents,
        description
    ) VALUES (
        v_partner_id,
        v_referral_id,
        'customer_download',
        p_commission_cents,
        'Customer download: ' || p_customer_name
    );
    
    RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Create business referral
CREATE OR REPLACE FUNCTION create_business_referral(
    p_partner_code TEXT,
    p_business_id UUID,
    p_business_name TEXT,
    p_business_plan TEXT DEFAULT 'trial',
    p_commission_cents INTEGER DEFAULT 15000 -- R150.00 default
)
RETURNS UUID AS $$
DECLARE
    v_partner_id UUID;
    v_referral_id UUID;
    v_association_id TEXT;
BEGIN
    -- Find partner by code
    SELECT id INTO v_partner_id FROM partners WHERE code = p_partner_code AND is_active = true;
    
    IF v_partner_id IS NULL THEN
        RAISE EXCEPTION 'Partner code % not found or inactive', p_partner_code;
    END IF;
    
    -- Create association ID with B- prefix
    v_association_id := 'B-' || p_business_id::text;
    
    -- Create referral record
    INSERT INTO referrals (
        association_id,
        partner_id,
        partner_code,
        type,
        business_id,
        business_name,
        business_plan,
        commission_cents
    ) VALUES (
        v_association_id,
        v_partner_id,
        p_partner_code,
        'business',
        p_business_id,
        p_business_name,
        p_business_plan,
        p_commission_cents
    ) RETURNING id INTO v_referral_id;
    
    -- Update business record with referral info
    UPDATE businesses
    SET 
        affiliate_code = p_partner_code,
        referred_by = v_partner_id
    WHERE id = p_business_id;
    
    -- Create earning record
    INSERT INTO partner_earnings (
        partner_id,
        referral_id,
        earning_type,
        amount_cents,
        description
    ) VALUES (
        v_partner_id,
        v_referral_id,
        'business_signup',
        p_commission_cents,
        'Business signup: ' || p_business_name
    );
    
    RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Check and award partner visit bonus
CREATE OR REPLACE FUNCTION check_partner_visit_bonus(
    p_checkin_id UUID,
    p_business_id UUID,
    p_customer_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_partner_id UUID;
    v_referral_record RECORD;
    v_bonus_points INTEGER := 50;
    v_regular_points INTEGER := 10;
BEGIN
    -- Find if this business was referred and get the partner
    SELECT r.partner_id, p.email INTO v_partner_id, v_referral_record
    FROM referrals r
    INNER JOIN partners p ON r.partner_id = p.id
    WHERE r.business_id = p_business_id 
      AND r.type = 'business';
    
    IF v_partner_id IS NULL THEN
        RETURN false; -- Business not referred
    END IF;
    
    -- Check if the customer checking in is the partner
    IF v_referral_record.email != p_customer_email THEN
        RETURN false; -- Not the partner
    END IF;
    
    -- Award bonus! Create partner visit record
    INSERT INTO partner_visits (
        partner_id,
        business_id,
        business_name,
        checkin_id,
        bonus_points,
        regular_points,
        total_points
    )
    SELECT 
        v_partner_id,
        p_business_id,
        b.name,
        p_checkin_id,
        v_bonus_points,
        v_regular_points,
        v_bonus_points + v_regular_points
    FROM businesses b
    WHERE b.id = p_business_id;
    
    -- Award extra loyalty points to the partner (as a customer)
    UPDATE users
    SET loyalty_points = loyalty_points + v_bonus_points
    WHERE email = p_customer_email;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 4. Get partner analytics
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
        ROUND((p.total_earnings_cents::NUMERIC / 100), 2) as total_earnings_rands,
        ROUND((p.pending_balance_cents::NUMERIC / 100), 2) as pending_balance_rands,
        ROUND((p.paid_earnings_cents::NUMERIC / 100), 2) as paid_earnings_rands,
        p.app_downloads,
        p.partner_business_visits,
        p.partner_visit_bonus_points,
        (SELECT COUNT(*) FROM referrals WHERE partner_id = p_partner_id AND commission_status = 'pending')::INTEGER,
        (SELECT COUNT(*) FROM referrals WHERE partner_id = p_partner_id AND commission_status = 'approved')::INTEGER,
        (SELECT COUNT(*) FROM referrals WHERE partner_id = p_partner_id AND commission_status = 'paid')::INTEGER
    FROM partners p
    WHERE p.id = p_partner_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Validate partner code
CREATE OR REPLACE FUNCTION validate_partner_code(p_code TEXT)
RETURNS TABLE(
    is_valid BOOLEAN,
    partner_id UUID,
    partner_name TEXT,
    message TEXT
) AS $$
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

-- ============================================
-- ALTER EXISTING TABLES TO ADD REFERRAL FIELDS
-- ============================================

-- Add referral fields to users table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_code') THEN
        ALTER TABLE users ADD COLUMN referral_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referred_by') THEN
        ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES partners(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add referral fields to businesses table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='affiliate_code') THEN
        ALTER TABLE businesses ADD COLUMN affiliate_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='referred_by') THEN
        ALTER TABLE businesses ADD COLUMN referred_by UUID REFERENCES partners(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add indexes for referral lookups
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_businesses_affiliate_code ON businesses(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_businesses_referred_by ON businesses(referred_by);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

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
-- MIGRATION COMPLETE
-- ============================================
-- Partner/Influencer Referral System Ready! 🚀
-- ============================================
