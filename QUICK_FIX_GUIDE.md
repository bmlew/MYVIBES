# Quick Fix: Make "Chef and the Fatman" Visible in Customer App

## ⚡ 3-Step Quick Fix

### Step 1: Open Admin Dashboard
1. Navigate to your MYVIBES admin panel
2. Click on the **"Admin"** button in the navigation

### Step 2: Go to Settings
1. In the Admin Dashboard, click the **"Settings"** tab (gear icon)
2. Scroll down to find the **"Business Visibility Diagnostic"** section (cyan/blue card)

### Step 3: Fix All Businesses
1. Click the **"🔍 Run Diagnostic"** button
   - This will show you that "Chef and the Fatman" is hidden
   - You'll see something like: "0/1 businesses visible"
   
2. Click the **"✅ Fix All Businesses"** button
   - Confirm when prompted
   - Wait for the success message
   
3. Done! ✅
   - "Chef and the Fatman" is now visible in the customer app
   - All other businesses are also fixed automatically

## What This Does

The fix button automatically sets these required fields for ALL businesses:
- ✅ `is_active: true` (Business is active)
- ✅ `payment_status: 'paid'` (Subscription is paid)
- ✅ `subscription_status: 'active'` (Subscription is active)
- ✅ `subscription_plan: 'standard'` (R499/month plan)

## Verify It Worked

### Method 1: Check Diagnostic Again
1. Click **"🔍 Run Diagnostic"** again
2. You should now see "1/1 businesses visible" (or higher if you have more businesses)

### Method 2: Check Customer App
1. Open the **Customer App** 
2. Look in the "Nearby" or "Explore" section
3. Search for "Chef and the Fatman"
4. The restaurant should now appear! 🎉

## Why This Happened

When creating a business manually or through certain flows, the payment/subscription status fields might not be set automatically. The customer app only shows businesses that have:
- Active status AND
- Valid payment/subscription status

Without these fields, businesses remain hidden even though they appear active in the business portal.

## Will This Happen Again?

**No** - All new businesses registered through the standard registration form automatically get these fields set correctly. This fix is only needed for:
- Businesses created before this fix was implemented
- Businesses created through non-standard methods
- Imported or migrated businesses

---

**Need Help?** Check the full technical documentation in `/BUSINESS_VISIBILITY_FIX.md`
