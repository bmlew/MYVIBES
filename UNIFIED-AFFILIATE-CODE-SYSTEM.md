# 🎯 Unified Affiliate/Influencer Code System

## Overview

Affiliates and influencers now share a **single base code** that can be used for both customer and business referrals with B/C prefixes.

---

## How It Works

### Code Format

Each partner gets **one base code** (e.g., `ABC1234`)

This code can be used in two ways:
- **Customer Referrals**: `C-ABC1234`
- **Business Referrals**: `B-ABC1234`

---

## Implementation Details

### 1. Partner Registration

When a partner registers, they receive a unified code:

```typescript
// Example Code Generation
const namePrefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
const randomDigits = Math.floor(1000 + Math.random() * 9000);
const code = `${namePrefix}${randomDigits}`; // e.g., "SMI7843"
```

**Partner receives:**
- Base Code: `SMI7843`
- Customer Code: `C-SMI7843` (for app downloads)
- Business Code: `B-SMI7843` (for business signups)

---

### 2. Customer Registration

When a customer signs up with a referral code:

```typescript
// Customer enters: C-SMI7843
// System:
1. Strips the C- prefix → baseCode = "SMI7843"
2. Finds affiliate with code "SMI7843"
3. Stores referral_code as "C-SMI7843"
4. Increments affiliate.total_customer_referrals
5. Creates referral tracking record with type: "customer"
```

**Earnings:**
- R20 per app download (Customer Download Bounty)

---

### 3. Business Registration

When a business signs up with a referral code:

```typescript
// Business enters: B-SMI7843
// System:
1. Strips the B- prefix → baseCode = "SMI7843"
2. Finds affiliate with code "SMI7843"
3. Stores affiliate_code as "B-SMI7843"
4. Increments affiliate.total_business_referrals
5. Creates referral tracking record with type: "business"
```

**Earnings:**
- Commission based on business subscription plan

---

## Database Changes

### Affiliate/Partner Record

```typescript
{
  id: "affiliate:123456",
  code: "SMI7843", // ✨ Base code without prefix
  name: "John Smith",
  email: "john@example.com",
  
  // ✨ NEW: Separate tracking
  total_referrals: 15, // Total (customers + businesses)
  total_customer_referrals: 10, // C- codes used
  total_business_referrals: 5, // B- codes used
  
  total_earnings: 500,
  pending_balance: 200,
  // ... other fields
}
```

### Customer Record

```typescript
{
  id: "customer:789",
  name: "Jane Doe",
  
  // ✨ Stores WITH prefix
  referral_code: "C-SMI7843",
  referral_type: "customer",
  referred_by: "affiliate:123456",
  // ... other fields
}
```

### Business Record

```typescript
{
  id: "business:456",
  name: "Cool Restaurant",
  
  // ✨ Stores WITH prefix
  affiliate_code: "B-SMI7843",
  referral_type: "business",
  referred_by: "affiliate:123456",
  // ... other fields
}
```

### Referral Tracking Record

```typescript
// For Customer Referral
{
  id: "referral:111",
  affiliate_id: "affiliate:123456",
  affiliate_code: "C-SMI7843",
  type: "customer",
  customer_id: "customer:789",
  customer_name: "Jane Doe",
  created_at: "2026-03-14T..."
}

// For Business Referral
{
  id: "referral:222",
  affiliate_id: "affiliate:123456",
  affiliate_code: "B-SMI7843",
  type: "business",
  business_id: "business:456",
  business_name: "Cool Restaurant",
  plan: "premium",
  created_at: "2026-03-14T..."
}
```

---

## API Endpoints

### New Endpoint: Get Referral Analytics

```
GET /make-server-175b2872/partners/:id/referrals
```

**Response:**
```json
{
  "summary": {
    "total_referrals": 15,
    "customer_referrals": 10,
    "business_referrals": 5,
    "customer_earnings": 200,
    "business_earnings": 300,
    "base_code": "SMI7843",
    "customer_code": "C-SMI7843",
    "business_code": "B-SMI7843"
  },
  "referrals": {
    "customers": [
      {
        "id": "referral:111",
        "customer_name": "Jane Doe",
        "created_at": "2026-03-14T..."
      }
    ],
    "businesses": [
      {
        "id": "referral:222",
        "business_name": "Cool Restaurant",
        "plan": "premium",
        "created_at": "2026-03-14T..."
      }
    ]
  }
}
```

---

## UI Updates

### Partner Dashboard (AffiliatePortal.tsx)

**Card 3: Customer Referrals**
- Shows app download count
- Displays `C-ABC1234` code
- Green button (customer-focused)
- Copy button for customer code

**Card 4: Business Referrals**
- Shows business referral count
- Displays `B-ABC1234` code
- Blue button (business-focused)
- Copy button for business code

**Both cards use the same base code with different prefixes!**

---

## Validation Rules

### Customer Registration
✅ Accepts: `C-ABC1234` or `ABC1234` (legacy)
❌ Rejects: `B-ABC1234` (business code)

### Business Registration
✅ Accepts: `B-ABC1234` or `ABC1234` (legacy)
❌ Rejects: `C-ABC1234` (customer code)

---

## Code Examples

### Checking if Code is Valid

```typescript
const trimmedCode = referral_code.toUpperCase().trim();

// Extract base code
let baseCode = trimmedCode;
let type = null;

if (trimmedCode.startsWith('C-')) {
  type = 'customer';
  baseCode = trimmedCode.substring(2);
} else if (trimmedCode.startsWith('B-')) {
  type = 'business';
  baseCode = trimmedCode.substring(2);
}

// Find affiliate by base code
const affiliate = affiliates.find(a => a.code === baseCode);
```

### Tracking Commission

```typescript
// Customer referral
const commission = {
  id: `comm:${Date.now()}`,
  affiliate_id: affiliate.id,
  customer_id: customerId,
  customer_name: name,
  amount: 20, // R20 download bounty
  type: 'Customer Download',
  referral_code: `C-${baseCode}`,
  status: 'pending',
  date: new Date().toISOString()
};

// Business referral
const commission = {
  id: `comm:${Date.now()}`,
  affiliate_id: affiliate.id,
  business_id: businessId,
  business_name: name,
  amount: 150, // Commission based on plan
  type: 'Business Subscription',
  referral_code: `B-${baseCode}`,
  status: 'pending',
  date: new Date().toISOString()
};
```

---

## Benefits

### For Partners
✅ **One code to remember** instead of two separate codes
✅ **Clear differentiation** between customer and business referrals
✅ **Separate tracking** for each type
✅ **Better analytics** - see breakdown by type

### For System
✅ **Simplified code management** - one code per partner
✅ **Easy attribution** - prefix shows intent
✅ **Better reporting** - separate customer/business metrics
✅ **Prevents confusion** - can't use wrong code type

### For Admins
✅ **Clear commission calculation** - separate by B/C prefix
✅ **Easy reconciliation** - one code, two streams
✅ **Better fraud detection** - wrong prefix = invalid

---

## Migration from Old System

### Existing Affiliates
- Keep their current code as base code
- Add `total_customer_referrals: 0`
- Add `total_business_referrals: 0`
- Legacy codes without prefix still work (assume customer for influencers, business for affiliates)

### New Partners
- Receive base code immediately
- Dashboard shows both C- and B- codes
- Can use either depending on target audience

---

## Testing Checklist

### Customer Registration
- [ ] Accepts `C-ABC1234` format
- [ ] Accepts legacy `ABC1234` format
- [ ] Rejects `B-ABC1234` format
- [ ] Creates referral tracking with type: "customer"
- [ ] Increments `total_customer_referrals`
- [ ] Awards R20 download bounty

### Business Registration
- [ ] Accepts `B-ABC1234` format
- [ ] Accepts legacy `ABC1234` format
- [ ] Rejects `C-ABC1234` format
- [ ] Creates referral tracking with type: "business"
- [ ] Increments `total_business_referrals`
- [ ] Calculates commission based on plan

### Partner Dashboard
- [ ] Shows both C- and B- codes
- [ ] Copy buttons work for both codes
- [ ] Separate counters for customer/business referrals
- [ ] Earnings breakdown by type

---

## Example User Journey

### Partner: John Smith (Code: SMI7843)

**Month 1:**
- Shares `C-SMI7843` on Instagram → 10 customers download app
- Shares `B-SMI7843` with restaurant owners → 2 businesses sign up

**Dashboard shows:**
- Customer Code: `C-SMI7843` (10 downloads)
- Business Code: `B-SMI7843` (2 referrals)
- Total Earnings: R200 + R300 = R500

**Database records:**
- `total_referrals: 12`
- `total_customer_referrals: 10`
- `total_business_referrals: 2`

---

## Commission Calculation Examples

### Customer Referral (C- code)
```
Code Used: C-SMI7843
Customer Downloads App
→ Award R20 instantly
→ Status: Pending
→ Type: Customer Download
```

### Business Referral (B- code)
```
Code Used: B-SMI7843
Business Signs Up (Premium Plan)
→ Calculate commission (e.g., R150)
→ Status: Pending
→ Type: Business Subscription
```

---

## Summary

✅ **ONE base code** per partner (e.g., `SMI7843`)
✅ **TWO use cases**: `C-` for customers, `B-` for businesses
✅ **SEPARATE tracking**: customer_referrals vs business_referrals
✅ **CLEAR attribution**: prefix shows referral type
✅ **SIMPLE UI**: Partner sees both codes on dashboard

**Result**: Clean, unified system that's easy to understand and track! 🎉
