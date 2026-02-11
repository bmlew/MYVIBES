# 🗑️ Clear All Data Guide

## ✅ ENABLED - Clear Data Button Now Active

I've enabled the "Clear All Data" functionality in your Admin Dashboard.

---

## 📍 How to Clear All Seeded Data

### Option 1: Using Admin Dashboard (Recommended)

1. **Navigate to Admin Dashboard**
   - Go to your app
   - Click "Admin" or navigate to `/admin`
   - Log in if required

2. **Scroll to Bottom**
   - The "Clear All Data" button is at the very bottom of the page
   - It's in a **RED box** with warning messages

3. **Click "Clear All Data"**
   - A confirmation dialog will appear
   - Click **"Yes, Delete Everything"** to confirm
   - Or click **"Cancel"** to abort

4. **Wait for Completion**
   - The button will show "Clearing..."
   - When done, you'll see a success message
   - Page will auto-reload after 2 seconds

---

## 🚨 What Gets Deleted

The clear data operation removes **EVERYTHING** from your database:

### Database Tables Cleared:
- ✅ **businesses** - All restaurant/hotel data
- ✅ **specials** - All special offers
- ✅ **events** - All event listings
- ✅ **reviews** - All customer reviews
- ✅ **reservations** - All booking data
- ✅ **payments** - All payment records
- ✅ **affiliates** - All affiliate accounts
- ✅ **analytics_events** - All tracking data

### Also Cleared:
- ✅ **Auth users** - All registered accounts
- ✅ **KV store** - All cached data

---

## ⚠️ Important Warnings

### This Action:
- ❌ **CANNOT be undone**
- ❌ **Deletes ALL data permanently**
- ❌ **Removes all user accounts**
- ❌ **Clears all business profiles**
- ❌ **Erases all transactions**

### When to Use:
- ✅ Testing new seed data
- ✅ Resetting development environment
- ✅ Clearing old demo data
- ✅ Starting fresh

### When NOT to Use:
- ❌ In production with real users
- ❌ If you need to keep any data
- ❌ Without a backup plan
- ❌ Unless you're absolutely sure

---

## 🔄 After Clearing Data

Once data is cleared, your database is completely empty. To add data back:

### 1. Re-seed the Database
   - Open CustomerApp
   - The app will automatically seed with default data
   - Or use the Debug Panel to force re-seed

### 2. Re-register Businesses
   - Businesses need to register again
   - Go to Business Registration
   - Fill in all details

### 3. Re-create Admin Account
   - Admin login credentials are cleared
   - You may need to create a new admin user

---

## 🔧 Technical Details

### Server Endpoint:
```
POST /make-server-175b2872/admin/clear-all-data
```

### Response Format:
```json
{
  "success": true,
  "message": "✅ All data cleared!",
  "cleared": [
    "payments",
    "reservations",
    "analytics_events",
    "reviews",
    "events",
    "specials",
    "affiliates",
    "businesses",
    "auth.users (5 users)",
    "kv_store (47 entries)"
  ],
  "errors": [],
  "timestamp": "2026-01-27T12:00:00.000Z"
}
```

---

## 💻 Alternative: Manual SQL Clear

If you prefer direct database access:

```sql
-- WARNING: This deletes everything!

-- Clear all tables
DELETE FROM payments;
DELETE FROM reservations;
DELETE FROM analytics_events;
DELETE FROM reviews;
DELETE FROM events;
DELETE FROM specials;
DELETE FROM affiliates;
DELETE FROM businesses;

-- Clear KV store
DELETE FROM kv_store_175b2872;

-- Note: Auth users must be cleared via Supabase Auth API
```

---

## 📊 Verification

### After clearing, verify data is gone:

1. **Check Admin Dashboard:**
   - Total Businesses: 0
   - Total Revenue: R0
   - All lists should be empty

2. **Check Customer App:**
   - "No venues found" message
   - Empty special/events sections

3. **Check Console:**
   - Should see "🌱 Seeding database..." on next load

---

## 🛡️ Safety Features

The clear data button has built-in safety:

1. **Two-step Confirmation**
   - Must click button twice
   - Prevents accidental clicks

2. **Visual Warning**
   - Red background
   - Clear warning messages
   - Lists what will be deleted

3. **Result Display**
   - Shows what was cleared
   - Shows any errors
   - Displays timestamp

4. **Loading State**
   - Disables button during operation
   - Shows "Clearing..." status
   - Prevents double-submission

---

## 🐛 Troubleshooting

### Button Not Visible?
- Make sure you're on the Admin Dashboard
- Scroll to the very bottom
- Check if `<ClearDataButton />` is enabled in code

### Operation Failed?
- Check browser console for errors
- Verify you have admin permissions
- Check network connection
- Try refreshing and trying again

### Partial Clear?
- Check the result JSON for errors
- Some tables may have foreign key constraints
- Re-run the clear operation
- Check Supabase logs

### Data Still There?
- Hard refresh browser (Ctrl+Shift+R)
- Clear localStorage: `localStorage.clear()`
- Check you're not looking at cached data

---

## 📝 Changelog

**Latest Update:**
- ✅ Enabled ClearDataButton in AdminDashboard.tsx
- ✅ Button is now visible at bottom of admin page
- ✅ Fully functional and tested

---

## ✅ Quick Summary

**To clear all data:**
1. Go to Admin Dashboard
2. Scroll to bottom
3. Click "Clear All Data" button (red box)
4. Confirm "Yes, Delete Everything"
5. Wait for completion
6. Page will auto-reload

**Remember:** This is **PERMANENT** and **IRREVERSIBLE**!

---

**Need Help?**
- Check browser console for detailed logs
- Look for error messages in the result JSON
- Verify database permissions in Supabase

**Status:** ✅ Clear Data Feature ENABLED and READY TO USE