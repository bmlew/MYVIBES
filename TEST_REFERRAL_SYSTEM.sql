-- ============================================
-- TEST MYVIBES REFERRAL SYSTEM
-- ============================================
-- Run this to verify everything works!
-- ============================================

-- 1. Create a test partner
INSERT INTO partners (code, name, email, status)
VALUES ('DEMO2024', 'Demo Partner', 'demo@myvibes.com', 'approved')
RETURNING 
    id,
    code,
    name,
    status,
    total_referrals,
    total_earnings_cents / 100.0 as earnings_rands;

-- 2. Validate the partner code
SELECT * FROM validate_partner_code('DEMO2024');
-- Expected: is_valid = true

-- 3. Create a test customer
INSERT INTO users (email, name, city)
VALUES ('customer@test.com', 'Test Customer', 'Johannesburg')
RETURNING id, email, name, loyalty_points;

-- 4. Create a customer referral (use the customer ID from above)
-- Replace 'CUSTOMER_ID_HERE' with the actual UUID returned above
/*
SELECT * FROM create_customer_referral(
    'DEMO2024',
    'CUSTOMER_ID_HERE',
    'Test Customer',
    'customer@test.com',
    2000  -- R20.00 commission
);
*/

-- 5. Create a test business
INSERT INTO businesses (name, email, city, category, owner_id)
VALUES ('Test Restaurant', 'restaurant@test.com', 'Cape Town', 'Restaurant', 
        (SELECT id FROM users WHERE email = 'customer@test.com'))
RETURNING id, name, email, subscription_status;

-- 6. Create a business referral (use the business ID from above)
-- Replace 'BUSINESS_ID_HERE' with the actual UUID returned above
/*
SELECT * FROM create_business_referral(
    'DEMO2024',
    'BUSINESS_ID_HERE',
    'Test Restaurant',
    'premium',
    15000  -- R150.00 commission
);
*/

-- 7. Check partner stats after referrals
SELECT 
    code,
    name,
    total_referrals,
    total_customer_referrals,
    total_business_referrals,
    total_earnings_cents / 100.0 as total_earnings_rands,
    app_downloads,
    status
FROM partners 
WHERE code = 'DEMO2024';

-- 8. View all referrals for this partner
SELECT 
    association_id,
    type,
    CASE 
        WHEN type = 'customer' THEN customer_name
        WHEN type = 'business' THEN business_name
    END as referred_name,
    commission_cents / 100.0 as commission_rands,
    commission_status,
    created_at
FROM referrals
WHERE partner_code = 'DEMO2024'
ORDER BY created_at DESC;

-- 9. Get full partner analytics
SELECT * FROM get_partner_analytics(
    (SELECT id FROM partners WHERE code = 'DEMO2024')
);

-- 10. View partner performance summary
SELECT * FROM partner_performance
WHERE code = 'DEMO2024';

-- ============================================
-- COMPLETE TEST FLOW
-- ============================================
-- Copy this section and update the IDs as you go

DO $$
DECLARE
    v_partner_id UUID;
    v_customer_id UUID;
    v_business_id UUID;
    v_referral1_id UUID;
    v_referral2_id UUID;
BEGIN
    -- Create partner
    INSERT INTO partners (code, name, email, status)
    VALUES ('AUTO2024', 'Auto Test Partner', 'auto@test.com', 'approved')
    RETURNING id INTO v_partner_id;
    RAISE NOTICE 'Partner created: %', v_partner_id;
    
    -- Create customer
    INSERT INTO users (email, name)
    VALUES ('autocust@test.com', 'Auto Customer')
    RETURNING id INTO v_customer_id;
    RAISE NOTICE 'Customer created: %', v_customer_id;
    
    -- Create customer referral
    SELECT * INTO v_referral1_id FROM create_customer_referral(
        'AUTO2024',
        v_customer_id,
        'Auto Customer',
        'autocust@test.com',
        2000
    );
    RAISE NOTICE 'Customer referral created: %', v_referral1_id;
    
    -- Create business
    INSERT INTO businesses (name, email, owner_id)
    VALUES ('Auto Business', 'autobiz@test.com', v_customer_id)
    RETURNING id INTO v_business_id;
    RAISE NOTICE 'Business created: %', v_business_id;
    
    -- Create business referral
    SELECT * INTO v_referral2_id FROM create_business_referral(
        'AUTO2024',
        v_business_id,
        'Auto Business',
        'premium',
        15000
    );
    RAISE NOTICE 'Business referral created: %', v_referral2_id;
    
    -- Show results
    RAISE NOTICE '=== PARTNER STATS ===';
    RAISE NOTICE 'Total Referrals: %', (SELECT total_referrals FROM partners WHERE id = v_partner_id);
    RAISE NOTICE 'Customer Referrals: %', (SELECT total_customer_referrals FROM partners WHERE id = v_partner_id);
    RAISE NOTICE 'Business Referrals: %', (SELECT total_business_referrals FROM partners WHERE id = v_partner_id);
    RAISE NOTICE 'Total Earnings: R%', (SELECT total_earnings_cents / 100.0 FROM partners WHERE id = v_partner_id);
    
    RAISE NOTICE '=== TEST COMPLETE ===';
END $$;

-- ============================================
-- VERIFY REFERRAL SYSTEM
-- ============================================

-- Check all partners
SELECT code, name, total_referrals, 
       total_earnings_cents / 100.0 as earnings 
FROM partners;

-- Check all referrals
SELECT association_id, type, partner_code,
       commission_cents / 100.0 as commission
FROM referrals;

-- Check referral activity view
SELECT * FROM referral_activity;

-- Check partner performance view
SELECT * FROM partner_performance;

-- ============================================
-- SUCCESS! ✅
-- ============================================
-- If you see data above, your referral system works!
