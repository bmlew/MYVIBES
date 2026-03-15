# MYVIBES Database Migration Instructions

## ⚠️ CRITICAL: Run Schema First!

Before running the migration in the Admin Portal, you **MUST** create the PostgreSQL tables first.

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your MYVIBES project
3. Click on **SQL Editor** in the left sidebar

### 2. Run the Schema
1. Click **"New Query"**
2. Open the file `/supabase/functions/server/schema.sql` in this project
3. **Copy the entire contents** of `schema.sql`
4. **Paste** into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

### 3. Verify Schema Creation
After running the schema, you should see success messages indicating:
- ✅ 18 tables created
- ✅ 60+ indexes created  
- ✅ Stored procedures created
- ✅ Triggers created

### 4. Run the Migration
NOW you can use the Admin Portal Migration Panel:
1. Navigate to **Admin Dashboard → Platform Settings**
2. Scroll to the **Migration Panel**
3. Click **"Run Migration"**
4. Wait for completion (may take several minutes for large datasets)

## Database Schema Overview

The migration creates these tables:

### Core Tables
- **users** - Customer and business owner accounts
- **businesses** - Business profiles and settings
- **business_locations** - Physical locations for businesses

### Operations
- **reservations** - Table bookings
- **checkins** - Customer check-ins with points
- **reviews** - Customer reviews and ratings
- **events** - Business events and promotions
- **specials** - Special offers and deals

### Payments & Subscriptions
- **payments** - Payment transactions (Yoco integration)

### Loyalty & Gamification
- **loyalty_transactions** - Points earned/redeemed
- **achievements** - User achievements and milestones
- **rewards** - Redeemable rewards catalog

### Partner/Influencer System
- **partners** - Influencer/affiliate accounts
- **referral_codes** - Universal partner codes
- **referrals** - Customer & business referrals
- **commissions** - Partner earnings and payouts

### Analytics
- **special_clicks** - Click tracking for conversion analytics
- **notifications** - Push notifications and alerts

## Performance Optimizations

The schema includes:
- **60+ strategic indexes** for sub-100ms queries
- **Stored procedures** for complex analytics
- **Automatic triggers** for data integrity
- **Optimized for 20,000+ concurrent users**

## Troubleshooting

### Error: "relation does not exist"
**Solution:** You forgot to run `schema.sql` in Supabase SQL Editor

### Error: "column does not exist"  
**Solution:** The schema version doesn't match. Re-run `schema.sql`

### Migration stuck or slow
**Solution:** Check Supabase logs. Large datasets (10,000+ records) may take 5-10 minutes

## Post-Migration

After successful migration:
1. ✅ All KV store data is preserved in PostgreSQL
2. ✅ The system automatically switches to PostgreSQL queries
3. ✅ KV store remains as backup (do not delete yet)
4. ✅ Verify data in Supabase Dashboard → Table Editor

## Support

If you encounter issues:
1. Check Edge Function logs in Supabase Dashboard
2. Review migration error messages in Admin Portal
3. Verify all tables exist in Table Editor
4. Ensure all environment variables are set correctly

---

**Need help?** Check the Supabase documentation or contact support.
