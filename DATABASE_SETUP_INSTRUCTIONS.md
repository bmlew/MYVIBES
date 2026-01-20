# 🗄️ VIBESPOT Database Setup Instructions

## Step-by-Step Guide to Set Up Your PostgreSQL Database

### **Prerequisites**
- You must have a Supabase account
- You must have created a Supabase project
- You need access to your Supabase dashboard

---

## **STEP 1: Access Your Supabase Project**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your VIBESPOT project (or create a new one)

---

## **STEP 2: Open the SQL Editor**

1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New Query"** button (top right)
3. You'll see an empty SQL editor

---

## **STEP 3: Copy the Migration Script**

1. Open the file: `/supabase/migrations/001_vibespot_schema.sql`
2. Copy the **ENTIRE** contents of the file (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor (Ctrl+V)

---

## **STEP 4: Run the Migration**

1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for the execution to complete (should take 2-5 seconds)
3. You should see: ✅ **"Success. No rows returned"**

---

## **STEP 5: Verify Tables Were Created**

1. In the left sidebar, click on **"Table Editor"**
2. You should now see these tables:
   - ✅ `platform_config`
   - ✅ `platform_admins`
   - ✅ `businesses`
   - ✅ `subscription_plans`
   - ✅ `payments`
   - ✅ `menu_items`
   - ✅ `specials`
   - ✅ `events`
   - ✅ `customers`
   - ✅ `customer_favorites`
   - ✅ `customer_event_interests`
   - ✅ `business_analytics`
   - ✅ `platform_analytics`
   - ✅ `audit_logs`

---

## **STEP 6: Add Sample Data for Testing**

1. Go back to **SQL Editor** → **New Query**
2. Paste this SQL to add test data:

```sql
-- Add sample businesses
INSERT INTO businesses (name, email, phone, address, city, province, latitude, longitude, business_type, cuisine_types, price_range, subscription_status, trial_ends_at, slug) VALUES
('The Palms Restaurant & Bar', 'info@thepalms.co.za', '+27 11 123 4567', '123 Rivonia Road, Sandton', 'Sandton', 'Gauteng', -26.107407, 28.056229, 'restaurant', ARRAY['International', 'Grill'], 3, 'trial', NOW() + INTERVAL '14 days', 'the-palms'),
('Skybar Rooftop Lounge', 'contact@skybar.co.za', '+27 11 234 5678', '56 West Street, Sandton', 'Sandton', 'Gauteng', -26.104533, 28.052826, 'bar', ARRAY['Cocktails', 'Tapas'], 3, 'active', NULL, 'skybar'),
('Delicious Bistro', 'hello@delicious.co.za', '+27 11 345 6789', '89 Katherine Street, Sandton', 'Sandton', 'Gauteng', -26.109871, 28.058234, 'restaurant', ARRAY['Contemporary', 'Fusion'], 2, 'trial', NOW() + INTERVAL '10 days', 'delicious'),
('Italian Delights', 'info@italiandelights.co.za', '+27 11 456 7890', '45 Maude Street, Sandton', 'Sandton', 'Gauteng', -26.102356, 28.049127, 'restaurant', ARRAY['Italian', 'Pizza'], 2, 'active', NULL, 'italian-delights'),
('Herbstore Restaurant', 'contact@herbstore.co.za', '+27 11 567 8901', '12 Alice Lane, Sandton', 'Sandton', 'Gauteng', -26.111234, 28.061456, 'restaurant', ARRAY['Health Food', 'Organic'], 2, 'trial', NOW() + INTERVAL '7 days', 'herbstore');

-- Add sample specials
INSERT INTO specials (business_id, title, description, original_price, special_price, discount_percentage, start_date, end_date, start_time, end_time, is_active)
SELECT id, '2-for-1 Cocktails', 'Buy one cocktail, get one free during happy hour', 90.00, 45.00, 50.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '17:00', '19:00', true
FROM businesses WHERE slug = 'skybar';

INSERT INTO specials (business_id, title, description, original_price, special_price, start_date, end_date, start_time, end_time, is_active)
SELECT id, 'Friday Buffet', 'All-you-can-eat buffet every Friday night', 450.00, 350.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '18:00', '22:00', true
FROM businesses WHERE slug = 'the-palms';

INSERT INTO specials (business_id, title, description, original_price, special_price, discount_percentage, start_date, end_date, is_active)
SELECT id, 'Pizza Special', 'Any large pizza for only R99', 180.00, 99.00, 45.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true
FROM businesses WHERE slug = 'italian-delights';

INSERT INTO specials (business_id, title, description, special_price, start_date, end_date, start_time, end_time, is_active)
SELECT id, 'Wine Pairing Dinner', 'Five-course dinner with wine pairings', 550.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', '19:00', '22:00', true
FROM businesses WHERE slug = 'the-palms';

-- Add sample events
INSERT INTO events (business_id, title, description, event_type, event_date, start_time, end_time, ticket_price, max_attendees, is_active)
SELECT id, 'Live Jazz Night', 'Enjoy live jazz music with dinner and drinks', 'live_music', CURRENT_DATE + INTERVAL '7 days', '19:00', '23:00', 150.00, 100, true
FROM businesses WHERE slug = 'the-palms';

INSERT INTO events (business_id, title, description, event_type, event_date, start_time, ticket_price, is_free, is_active)
SELECT id, 'Wine Tasting Evening', 'Sample our finest wines with sommelier guidance', 'wine_tasting', CURRENT_DATE + INTERVAL '15 days', '18:00', 250.00, false, true
FROM businesses WHERE slug = 'the-palms';

INSERT INTO events (business_id, title, description, event_type, event_date, start_time, end_time, is_free, is_active)
SELECT id, 'Sunday Brunch', 'Lazy Sunday brunch with live acoustic music', 'brunch', CURRENT_DATE + INTERVAL '21 days', '10:00', '14:00', true, true
FROM businesses WHERE slug = 'delicious';

INSERT INTO events (business_id, title, description, event_type, event_date, start_time, ticket_price, max_attendees, is_active)
SELECT id, 'BBQ & Beats', 'Outdoor BBQ with DJ and cocktails', 'themed_night', CURRENT_DATE + INTERVAL '25 days', '16:00', 200.00, 150, true
FROM businesses WHERE slug = 'skybar';

-- Add sample menu items
INSERT INTO menu_items (business_id, name, description, category, price, is_available)
SELECT id, 'Bruschetta', 'Toasted bread with tomatoes, garlic, and basil', 'starters', 85.00, true FROM businesses WHERE slug = 'the-palms';

INSERT INTO menu_items (business_id, name, description, category, price, is_available)
SELECT id, 'Calamari', 'Crispy fried calamari with aioli', 'starters', 95.00, true FROM businesses WHERE slug = 'the-palms';

INSERT INTO menu_items (business_id, name, description, category, price, is_available)
SELECT id, 'Greek Salad', 'Fresh vegetables with feta and olives', 'starters', 75.00, true FROM businesses WHERE slug = 'the-palms';

-- Add a completed payment for testing
INSERT INTO payments (business_id, amount, currency, status, payment_method, description, period_start, period_end, is_reconciled)
SELECT id, 299.00, 'ZAR', 'completed', 'yoco_card', 'Monthly subscription - January 2026', '2026-01-01', '2026-01-31', false
FROM businesses WHERE slug = 'skybar';

-- Add a pending payment for testing
INSERT INTO payments (business_id, amount, currency, status, payment_method, description, period_start, period_end, is_reconciled)
SELECT id, 299.00, 'ZAR', 'pending', 'yoco_card', 'Monthly subscription - January 2026', '2026-01-01', '2026-01-31', false
FROM businesses WHERE slug = 'the-palms';

-- Add platform analytics data
INSERT INTO platform_analytics (date, total_revenue, successful_payments, active_subscriptions, new_subscriptions, total_app_users, active_app_users)
VALUES 
(CURRENT_DATE - INTERVAL '7 days', 1495.00, 5, 2, 2, 45, 32),
(CURRENT_DATE - INTERVAL '6 days', 1794.00, 6, 2, 0, 52, 38),
(CURRENT_DATE - INTERVAL '5 days', 2093.00, 7, 3, 1, 58, 41),
(CURRENT_DATE - INTERVAL '4 days', 2392.00, 8, 3, 0, 63, 45),
(CURRENT_DATE - INTERVAL '3 days', 2691.00, 9, 3, 0, 71, 52),
(CURRENT_DATE - INTERVAL '2 days', 2990.00, 10, 4, 1, 78, 58),
(CURRENT_DATE - INTERVAL '1 day', 3289.00, 11, 4, 0, 85, 63),
(CURRENT_DATE, 3588.00, 12, 5, 1, 92, 71);
```

3. Click **Run**
4. You should see: ✅ **"Success"**

---

## **STEP 7: Verify Sample Data**

1. Go to **Table Editor**
2. Click on `businesses` table → You should see 5 businesses
3. Click on `specials` table → You should see 4 specials
4. Click on `events` table → You should see 4 events
5. Click on `payments` table → You should see 2 payments
6. Click on `platform_config` table → You should see subscription price R299.00

---

## **STEP 8: Set Up Yoco API Key**

1. Sign up at [https://portal.yoco.com](https://portal.yoco.com)
2. Go to **Settings** → **API Keys**
3. Copy your **Secret Key** (starts with `sk_test_` for test mode)
4. In Supabase dashboard, go to **Settings** → **Edge Functions** (or **Project Settings**)
5. Look for **Secrets** or **Environment Variables**
6. Add new secret:
   - **Name:** `YOCO_SECRET_KEY`
   - **Value:** Your Yoco secret key
7. Click **Save**

---

## **STEP 9: Test the Platform Admin**

1. Go back to your VIBESPOT app
2. Click **🛡️ Platform Admin** in the top-right
3. You should now see:
   - ✅ Total Revenue: R299.00
   - ✅ Active Subscriptions: 2
   - ✅ Businesses listed
   - ✅ Payments showing

---

## **Troubleshooting**

### ❌ **Error: "relation does not exist"**
**Solution:** The migration didn't run successfully. Go back to Step 3 and ensure you ran the ENTIRE SQL script.

### ❌ **Error: "duplicate key value violates unique constraint"**
**Solution:** You're trying to run the sample data twice. Skip Step 6 or delete existing data first:
```sql
TRUNCATE businesses, specials, events, payments, menu_items CASCADE;
```

### ❌ **Platform Admin shows no data**
**Solution:** 
1. Check that migration ran successfully (Step 4-5)
2. Check that sample data was inserted (Step 6-7)
3. Open browser console (F12) and check for API errors

### ❌ **Yoco payments not working**
**Solution:**
1. Verify YOCO_SECRET_KEY is set in Supabase (Step 8)
2. Check you're using a valid Yoco test card: `5200 0000 0000 1096`
3. Check Supabase Edge Function logs for errors

---

## **Next Steps After Database Setup**

1. ✅ Database is now ready
2. ✅ Sample data is loaded
3. ✅ Platform Admin can view data
4. 🔄 Next: Connect the Customer App to fetch real data from API
5. 🔄 Next: Implement business registration form
6. 🔄 Next: Add authentication for platform admin

---

## **Quick Reference: Important Tables**

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `platform_config` | Global settings | `subscription_price`, `trial_days` |
| `businesses` | Restaurants/Hotels | `name`, `subscription_status`, `latitude`, `longitude` |
| `payments` | Payment history | `amount`, `status`, `is_reconciled` |
| `specials` | Daily deals | `title`, `special_price`, `start_date`, `end_date` |
| `events` | Upcoming events | `title`, `event_date`, `ticket_price` |
| `subscription_plans` | Plan tiers | `name`, `price` (Basic R299, Pro R499, Enterprise R999) |

---

## **Support**

If you encounter any issues:
1. Check the Supabase Edge Function logs (Dashboard → Edge Functions → Logs)
2. Check browser console for frontend errors (F12 → Console)
3. Verify all environment variables are set correctly
4. Make sure you're using the correct Supabase project URL and keys

**Your database is now ready for production! 🎉**
