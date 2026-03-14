# 🎯 Universal Referral System - SQL Quick Reference

## Table Structure

### Partners Table
```sql
partners (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,              -- "SMI7843" (no prefix!)
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',          -- pending, approved, suspended
  total_referrals INTEGER DEFAULT 0,
  total_customer_referrals INTEGER DEFAULT 0,
  total_business_referrals INTEGER DEFAULT 0,
  total_earnings_cents INTEGER DEFAULT 0,
  pending_balance_cents INTEGER DEFAULT 0,
  paid_earnings_cents INTEGER DEFAULT 0,
  partner_business_visits INTEGER DEFAULT 0,
  partner_visit_bonus_points INTEGER DEFAULT 0
)
```

### Referrals Table
```sql
referrals (
  id UUID PRIMARY KEY,
  association_id TEXT UNIQUE NOT NULL,    -- "B-{business_id}" or "C-{customer_id}"
  partner_id UUID REFERENCES partners(id),
  partner_code TEXT NOT NULL,
  type TEXT NOT NULL,                     -- 'customer' or 'business'
  
  -- If type = 'customer':
  customer_id UUID REFERENCES users(id),
  customer_name TEXT,
  customer_email TEXT,
  
  -- If type = 'business':
  business_id UUID REFERENCES businesses(id),
  business_name TEXT,
  business_plan TEXT,
  
  commission_cents INTEGER DEFAULT 0,
  commission_status TEXT DEFAULT 'pending' -- pending, approved, paid, cancelled
)
```

### Partner Visits Table
```sql
partner_visits (
  id UUID PRIMARY KEY,
  partner_id UUID REFERENCES partners(id),
  business_id UUID REFERENCES businesses(id),
  checkin_id UUID REFERENCES checkins(id),
  bonus_points INTEGER DEFAULT 50,
  regular_points INTEGER DEFAULT 10,
  total_points INTEGER DEFAULT 60,
  visited_at TIMESTAMP DEFAULT NOW()
)
```

---

## Common Queries

### 1. Create a Partner
```sql
INSERT INTO partners (code, name, email, status)
VALUES ('SMI7843', 'John Smith', 'john@example.com', 'approved')
RETURNING *;
```

### 2. Validate Partner Code
```sql
SELECT * FROM validate_partner_code('SMI7843');
-- Returns: is_valid, partner_id, partner_name, message
```

### 3. Customer Sign-Up with Referral Code
```sql
-- First create the customer
INSERT INTO users (email, name)
VALUES ('jane@example.com', 'Jane Doe')
RETURNING id;

-- Then create the referral (use returned customer ID)
SELECT * FROM create_customer_referral(
  'SMI7843',                    -- partner_code
  'customer-uuid',              -- customer_id
  'Jane Doe',                   -- customer_name
  'jane@example.com',           -- customer_email
  2000                          -- commission_cents (R20.00)
);
```

### 4. Business Sign-Up with Referral Code
```sql
-- First create the business
INSERT INTO businesses (name, email, owner_name)
VALUES ('Cool Restaurant', 'restaurant@example.com', 'Mike Owner')
RETURNING id;

-- Then create the referral (use returned business ID)
SELECT * FROM create_business_referral(
  'SMI7843',                    -- partner_code
  'business-uuid',              -- business_id
  'Cool Restaurant',            -- business_name
  'premium',                    -- business_plan
  15000                         -- commission_cents (R150.00)
);
```

### 5. Check Partner Visit Bonus (During Check-In)
```sql
-- When customer checks in at a business
-- First create the check-in
INSERT INTO checkins (business_id, user_id, customer_email, party_size)
VALUES (
  'business-uuid',
  'customer-uuid',
  'john@example.com',           -- This could be the partner's email
  4
)
RETURNING id;

-- Then check for partner visit bonus
SELECT * FROM check_partner_visit_bonus(
  'checkin-uuid',               -- checkin_id (from above)
  'business-uuid',              -- business_id
  'john@example.com'            -- customer_email
);
-- Returns: true if bonus awarded, false otherwise
```

### 6. Get Partner Analytics
```sql
SELECT * FROM get_partner_analytics('partner-uuid');

-- Returns:
-- total_referrals, customer_referrals, business_referrals,
-- total_earnings_rands, pending_balance_rands, paid_earnings_rands,
-- app_downloads, business_visits, visit_bonus_points,
-- pending_commissions, approved_commissions, paid_commissions
```

### 7. Get All Customer Referrals for a Partner
```sql
SELECT 
  r.association_id,
  r.customer_name,
  r.customer_email,
  r.commission_cents / 100.0 as commission_rands,
  r.commission_status,
  r.created_at
FROM referrals r
WHERE r.partner_id = 'partner-uuid'
  AND r.type = 'customer'
ORDER BY r.created_at DESC;
```

### 8. Get All Business Referrals for a Partner
```sql
SELECT 
  r.association_id,
  r.business_name,
  r.business_plan,
  r.commission_cents / 100.0 as commission_rands,
  r.commission_status,
  r.created_at
FROM referrals r
WHERE r.partner_id = 'partner-uuid'
  AND r.type = 'business'
ORDER BY r.created_at DESC;
```

### 9. Get Partner's Business Visits
```sql
SELECT 
  pv.business_name,
  pv.bonus_points,
  pv.regular_points,
  pv.total_points,
  pv.visited_at
FROM partner_visits pv
WHERE pv.partner_id = 'partner-uuid'
ORDER BY pv.visited_at DESC;
```

### 10. Approve Partner Commission
```sql
UPDATE referrals
SET 
  commission_status = 'approved',
  commission_approved_at = NOW()
WHERE id = 'referral-uuid';

-- This automatically triggers:
-- - Updates partner pending_balance_cents
-- - Updates partner total_earnings_cents
```

### 11. Mark Commission as Paid
```sql
UPDATE referrals
SET 
  commission_status = 'paid',
  commission_paid_at = NOW()
WHERE id = 'referral-uuid';

-- This automatically triggers:
-- - Reduces partner pending_balance_cents
-- - Increases partner paid_earnings_cents
```

### 12. Get Partner Dashboard Stats
```sql
SELECT 
  p.code as referral_code,
  p.name,
  p.status,
  p.total_referrals,
  p.total_customer_referrals,
  p.total_business_referrals,
  ROUND((p.total_earnings_cents / 100.0), 2) as total_earnings,
  ROUND((p.pending_balance_cents / 100.0), 2) as pending_balance,
  ROUND((p.paid_earnings_cents / 100.0), 2) as paid_earnings,
  p.partner_business_visits,
  p.partner_visit_bonus_points,
  (
    SELECT COUNT(*) 
    FROM referrals r 
    WHERE r.partner_id = p.id AND r.commission_status = 'pending'
  ) as pending_commissions,
  (
    SELECT COUNT(*) 
    FROM referrals r 
    WHERE r.partner_id = p.id AND r.commission_status = 'approved'
  ) as approved_commissions,
  p.joined_at,
  p.last_active
FROM partners p
WHERE p.id = 'partner-uuid';
```

### 13. Find Partner by Code
```sql
SELECT * FROM partners
WHERE code = 'SMI7843'
  AND is_active = true
  AND status = 'approved';
```

### 14. Check if Customer Used Referral Code
```sql
SELECT 
  u.id,
  u.name,
  u.email,
  u.referral_code,
  p.name as referred_by_name,
  p.code as partner_code
FROM users u
LEFT JOIN partners p ON u.referred_by = p.id
WHERE u.email = 'customer@example.com';
```

### 15. Check if Business Used Referral Code
```sql
SELECT 
  b.id,
  b.name,
  b.email,
  b.affiliate_code,
  p.name as referred_by_name,
  p.code as partner_code
FROM businesses b
LEFT JOIN partners p ON b.referred_by = p.id
WHERE b.email = 'business@example.com';
```

---

## Partner Performance Views

### View All Partner Performance
```sql
SELECT * FROM partner_performance
ORDER BY total_earnings DESC;

-- Shows:
-- id, code, name, email, status,
-- total_referrals, customer_count, business_count,
-- total_earnings, pending_balance, paid_earnings,
-- visit_count, joined_at, last_active
```

### View Recent Referral Activity
```sql
SELECT * FROM referral_activity
ORDER BY created_at DESC
LIMIT 50;

-- Shows:
-- id, association_id, type, partner_code, partner_name,
-- referred_name, commission, commission_status, created_at
```

---

## Lookup Patterns

### By Association ID

```sql
-- Find customer referral by customer ID
SELECT * FROM referrals
WHERE association_id = 'C-' || 'customer-uuid';

-- Find business referral by business ID
SELECT * FROM referrals
WHERE association_id = 'B-' || 'business-uuid';
```

### By Type

```sql
-- All customer referrals
SELECT * FROM referrals WHERE type = 'customer';

-- All business referrals
SELECT * FROM referrals WHERE type = 'business';
```

### By Commission Status

```sql
-- Pending commissions
SELECT * FROM referrals WHERE commission_status = 'pending';

-- Approved but unpaid
SELECT * FROM referrals WHERE commission_status = 'approved';

-- Paid commissions
SELECT * FROM referrals WHERE commission_status = 'paid';
```

---

## Aggregation Queries

### Total Earnings by Partner
```sql
SELECT 
  p.name,
  p.code,
  COUNT(r.id) as total_referrals,
  SUM(CASE WHEN r.type = 'customer' THEN 1 ELSE 0 END) as customer_refs,
  SUM(CASE WHEN r.type = 'business' THEN 1 ELSE 0 END) as business_refs,
  SUM(r.commission_cents) / 100.0 as total_commission_rands,
  SUM(CASE WHEN r.commission_status = 'pending' THEN r.commission_cents ELSE 0 END) / 100.0 as pending_rands,
  SUM(CASE WHEN r.commission_status = 'paid' THEN r.commission_cents ELSE 0 END) / 100.0 as paid_rands
FROM partners p
LEFT JOIN referrals r ON p.id = r.partner_id
WHERE p.status = 'approved'
GROUP BY p.id, p.name, p.code
ORDER BY total_commission_rands DESC;
```

### Top Performing Partners
```sql
SELECT 
  p.name,
  p.code,
  p.total_referrals,
  ROUND((p.total_earnings_cents / 100.0), 2) as earnings,
  p.partner_business_visits as visits,
  p.joined_at
FROM partners p
WHERE p.status = 'approved'
ORDER BY p.total_earnings_cents DESC
LIMIT 10;
```

### Monthly Referral Stats
```sql
SELECT 
  DATE_TRUNC('month', r.created_at) as month,
  COUNT(*) as total_referrals,
  COUNT(CASE WHEN r.type = 'customer' THEN 1 END) as customer_refs,
  COUNT(CASE WHEN r.type = 'business' THEN 1 END) as business_refs,
  SUM(r.commission_cents) / 100.0 as total_commission
FROM referrals r
WHERE r.created_at >= NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month DESC;
```

---

## Important Rules

### ✅ DO:
- Store partner code WITHOUT prefix: `SMI7843`
- Store association_id WITH prefix: `B-{id}` or `C-{id}`
- Use cents for all monetary values
- Check partner status before creating referrals
- Use stored procedures for complex operations

### ❌ DON'T:
- Add prefixes to partner codes
- Use floating-point for money (use cents as integers)
- Create referrals for inactive partners
- Manually update partner stats (triggers handle it)
- Skip validation of partner codes

---

## Commission Amounts (in cents)

```typescript
// Standard commissions
const CUSTOMER_DOWNLOAD = 2000;    // R20.00
const BUSINESS_BASIC = 10000;      // R100.00
const BUSINESS_PREMIUM = 15000;    // R150.00
const PARTNER_VISIT_BONUS = 50;    // 50 points (not cents)

// To convert from rands to cents:
const cents = rands * 100;

// To convert from cents to rands:
const rands = cents / 100;
```

---

## Complete Example: Customer Journey

```sql
-- 1. Partner registers
INSERT INTO partners (code, name, email, status)
VALUES ('SMI7843', 'John Smith', 'john@example.com', 'approved')
RETURNING id;
-- Returns: partner_id

-- 2. Customer signs up with code
INSERT INTO users (email, name)
VALUES ('jane@example.com', 'Jane Doe')
RETURNING id;
-- Returns: customer_id

SELECT * FROM create_customer_referral(
  'SMI7843', 
  'customer_id', 
  'Jane Doe', 
  'jane@example.com', 
  2000
);
-- Creates referral with association_id: C-{customer_id}
-- Partner earns R20

-- 3. Customer checks in at business
INSERT INTO checkins (business_id, user_id, customer_email, party_size)
VALUES ('business_id', 'customer_id', 'jane@example.com', 2)
RETURNING id;
-- Customer earns 10 loyalty points

-- 4. Partner (also a customer) checks in at business they referred
INSERT INTO checkins (business_id, user_id, customer_email, party_size)
VALUES ('referred_business_id', 'partner_as_customer_id', 'john@example.com', 2)
RETURNING id;

SELECT * FROM check_partner_visit_bonus(
  'checkin_id',
  'referred_business_id',
  'john@example.com'
);
-- Partner earns 10 + 50 = 60 points!
```

---

## Admin Operations

### Approve All Pending Commissions for a Partner
```sql
UPDATE referrals
SET 
  commission_status = 'approved',
  commission_approved_at = NOW()
WHERE partner_id = 'partner-uuid'
  AND commission_status = 'pending';
```

### Calculate Total Pending Payouts
```sql
SELECT 
  SUM(pending_balance_cents) / 100.0 as total_pending_rands
FROM partners
WHERE status = 'approved';
```

### Find Partners Ready for Payout (over R500)
```sql
SELECT 
  p.id,
  p.name,
  p.email,
  ROUND((p.pending_balance_cents / 100.0), 2) as pending_rands
FROM partners p
WHERE p.pending_balance_cents >= 50000  -- R500.00
  AND p.status = 'approved'
ORDER BY p.pending_balance_cents DESC;
```

---

## 🎯 Ready to Use!

All queries are production-ready and optimized for performance with proper indexes.
