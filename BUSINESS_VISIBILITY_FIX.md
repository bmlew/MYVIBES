# 🔧 Business Visibility Fix Guide

## Problem
Manually created businesses ("Chef and the Fatman" and "Mr Restaurant") are not appearing in the customer app.

## Root Cause
The customer app only displays businesses that meet BOTH of these criteria:
1. `is_active === true`
2. `payment_status === 'paid'` OR `subscription_status === 'active'`

When you manually create businesses, these fields may not be set properly, causing them to be hidden from customers.

## Solution Options

### Option 1: Use the Admin Dashboard (Recommended - Easiest)

1. **Navigate to Admin Dashboard**
   - Click the "🛡️ Admin" button in the top-right corner

2. **Use the Business Visibility Diagnostic Tool**
   - You'll see a blue "Business Visibility Diagnostic" panel at the top of the Overview section
   - Click "Run Diagnosis" to see which businesses are hidden and why

3. **Fix the Issues**
   - Click "Fix All" to make all businesses visible at once
   - Or click "Fix" next to individual businesses

4. **Refresh the Customer App**
   - Return to the customer app and refresh
   - Your manually created businesses should now appear!

### Option 2: Use Browser Console Commands

Open your browser's developer console (F12) and run:

```javascript
// Quick fix - diagnose and fix all businesses
quickFix()

// Or run individually:
diagnoseBusinesses()  // See which businesses are hidden
fixAllBusinesses()    // Fix all businesses at once
```

### Option 3: Manual API Call

You can call the fix endpoint directly:

```bash
POST https://[your-project].supabase.co/functions/v1/make-server-175b2872/admin/fix-all-businesses
Authorization: Bearer [your-anon-key]
```

## What the Fix Does

The fix automatically sets these required fields for all businesses:
- `is_active: true`
- `payment_status: 'paid'`
- `subscription_status: 'active'`
- `subscription_plan: 'standard'` (if not set)
- `subscription_price: 499` (if not set)
- `next_payment_due: [30 days from now]` (if not set)
- `last_payment_date: [current date]` (if not set)

## Verification

After running the fix:
1. Open the Customer App
2. Search for "Chef and the Fatman" or "Mr Restaurant"
3. They should now appear in search results and business listings

## Prevention

When creating businesses manually in the future, always include:
```json
{
  "is_active": true,
  "payment_status": "paid",
  "subscription_status": "active",
  "subscription_plan": "standard",
  "subscription_price": 499
}
```

## Technical Details

**Server Endpoint:** `/supabase/functions/server/index.tsx` (lines 288-291)

**Filter Logic:**
```typescript
const paidBusinesses = allBusinesses.filter((b: any) => 
  b.is_active === true && 
  (b.payment_status === 'paid' || b.subscription_status === 'active')
);
```

**Diagnostic Endpoints:**
- `/make-server-175b2872/admin/diagnose-businesses` - Check visibility status
- `/make-server-175b2872/admin/fix-business-visibility/:id` - Fix single business
- `/make-server-175b2872/admin/fix-all-businesses` - Fix all businesses

## Support

If you continue to have issues:
1. Check browser console for errors
2. Run `diagnoseBusinesses()` to see current status
3. Verify the business IDs are correct
4. Clear browser cache and refresh

---

**Last Updated:** January 25, 2026
**Platform:** MYVIBES
**Version:** 2.0
