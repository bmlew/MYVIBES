# 🔧 Migration Error Fix

## Error Message
```
ERROR: 42703: column "owner_id" does not exist
```

## ✅ Solution

This error occurs when tables already exist or were created in the wrong order. Here's how to fix it:

---

## Option 1: Drop Existing Tables (Clean Start) ⭐ RECOMMENDED

Run this in Supabase SQL Editor **BEFORE** running the migration:

```sql
-- ⚠️ WARNING: This will delete ALL data in these tables!
-- Only run this if you're okay with losing existing data
-- or if you've backed up your data

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

-- Also drop views
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
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS update_loyalty_points_on_checkin CASCADE;
DROP FUNCTION IF EXISTS update_business_rating CASCADE;
DROP FUNCTION IF EXISTS update_partner_stats_on_referral CASCADE;
DROP FUNCTION IF EXISTS update_partner_earnings_on_commission CASCADE;
DROP FUNCTION IF EXISTS track_partner_visit_bonus CASCADE;
```

**Then run the migrations in order:**
1. `database-migration.sql`
2. `database-referral-system.sql`
3. `database-stored-procedures.sql`

---

## Option 2: Keep Existing Data (Advanced)

If you have existing data you want to keep:

### Step 1: Check what tables exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Step 2: If `users` table exists but `businesses` doesn't
```sql
-- Just create businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    -- ... rest of the fields
);
```

### Step 3: If both exist but you're getting the error
The issue might be that `businesses` was created BEFORE `users`. Fix:

```sql
-- Drop only the businesses table
DROP TABLE IF EXISTS businesses CASCADE;

-- Then run database-migration.sql again
-- It will recreate businesses in the correct order
```

---

## Option 3: Alter Existing Table (If Possible)

If `businesses` exists without the `owner_id` column:

```sql
-- Add the missing column
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
```

---

## ✅ Recommended Migration Process

### Clean Slate Approach (Safest)

```sql
-- Step 1: Backup your data (export to CSV if needed)
-- Step 2: Drop all tables (use Option 1 above)
-- Step 3: Run migrations in order:
```

**1. Run `database-migration.sql`**
```sql
-- This creates:
-- ✅ users (first)
-- ✅ businesses (references users)
-- ✅ All other tables in correct order
```

**2. Run `database-referral-system.sql`**
```sql
-- This creates:
-- ✅ partners
-- ✅ referrals
-- ✅ partner_visits
-- ✅ partner_earnings
-- ✅ partner_payouts
```

**3. Run `database-stored-procedures.sql`**
```sql
-- This creates:
-- ✅ All performance procedures
```

**4. Verify**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Should show 16 tables
```

---

## Common Causes of This Error

### 1. ❌ Tables created out of order
**Fix:** Drop tables and run migration in correct order

### 2. ❌ Partial migration ran
**Fix:** Complete the full migration or start fresh

### 3. ❌ Running scripts multiple times
**Fix:** Drop all tables and run once

### 4. ❌ Old schema conflicts
**Fix:** Clean slate with DROP TABLE CASCADE

---

## What Changed in the Fixed Version

I've updated `database-migration.sql` to:

✅ **Enable extensions first** (uuid-ossp, cube, earthdistance)  
✅ **Create users table FIRST** (before businesses)  
✅ **Clear comments** showing dependency order  
✅ **Proper CASCADE handling** on foreign keys  

---

## Quick Fix Command (Full Reset)

**Copy and paste this entire block:**

```sql
-- ============================================
-- FULL DATABASE RESET
-- ⚠️ WARNING: DELETES ALL DATA
-- ============================================

-- Drop all tables
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

-- ✅ Ready for fresh migration!
-- Now run: database-migration.sql
```

---

## After Running the Fix

1. ✅ Verify all tables dropped
2. ✅ Run `database-migration.sql`
3. ✅ Run `database-referral-system.sql`
4. ✅ Run `database-stored-procedures.sql`
5. ✅ Verify 16 tables exist
6. ✅ Test with example queries

---

## Still Having Issues?

### Check Supabase Logs
Dashboard → Logs → Look for detailed error messages

### Verify PostgreSQL Version
```sql
SELECT version();
-- Should be PostgreSQL 14+ for all features
```

### Check Extensions
```sql
SELECT * FROM pg_extension;
-- Should show: uuid-ossp, cube, earthdistance
```

---

## ✅ Success Indicators

After successful migration, you should see:

```sql
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as table_count,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE schemaname = 'public') as index_count,
  (SELECT COUNT(*) FROM pg_proc p
   JOIN pg_namespace n ON p.pronamespace = n.oid
   WHERE n.nspname = 'public') as function_count;
```

**Expected:**
- `table_count`: 16
- `index_count`: 52+
- `function_count`: 15+

---

## 🎯 You're All Set!

After running the fix, your migration should complete successfully! 🚀
