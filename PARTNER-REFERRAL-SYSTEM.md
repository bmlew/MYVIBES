# 🎯 Universal Partner/Influencer Referral System

## Overview

Partners and influencers receive **ONE universal code** that works for both customer and business referrals. The system tracks associations using **B/C prefixes on the tracking IDs**, not on the code itself.

---

## How It Works

### Universal Code System

Each partner gets **one code** (e.g., `SMI7843`)

This same code can be used by:
- **Customers** downloading the app
- **Businesses** signing up

The system automatically tracks which type of referral it is.

---

## Association ID System

### Key Concept: B/C Prefixes on TRACKING, not the CODE

**Partner Code:** `SMI7843` (no prefix)

**Tracking IDs:**
- Business referral → `referral:B-business-123456`
- Customer referral → `referral:C-customer:789012`

The **B/C prefix is on the association ID**, which links the referral back to the partner.

---

## Implementation Details

### 1. Partner Registration

```typescript
// Partner registers
const code = generateCode(name); // e.g., "SMI7843"

const partner = {
  id: "affiliate:123",
  code: "SMI7843", // ✅ No prefix on code
  name: "John Smith",
  email: "john@example.com",
  
  total_referrals: 0,
  total_customer_referrals: 0,
  total_business_referrals: 0,
  
  // ... other fields
};
```

---

### 2. Business Registration with Code

```typescript
// Business enters code: SMI7843
// System:
1. Find partner with code === "SMI7843"
2. Create business with ID: "business-123456"
3. Store: business.affiliate_code = "SMI7843"
4. Create tracking record:
   
   referral:B-business-123456 → {
     id: "referral:B-business-123456",
     association_id: "B-business-123456", // ✅ B- prefix on tracking ID
     affiliate_id: "affiliate:123",
     affiliate_code: "SMI7843",
     type: "business",
     business_id: "business-123456",
     business_name: "Cool Restaurant",
     plan: "premium"
   }

5. Increment partner.total_business_referrals
```

**Key Pattern:**
- Code is universal: `SMI7843`
- Association ID has prefix: `B-business-123456`
- This links the business to the partner

---

### 3. Customer Registration with Code

```typescript
// Customer enters code: SMI7843
// System:
1. Find partner with code === "SMI7843"
2. Create customer with ID: "customer:789012"
3. Store: customer.referral_code = "SMI7843"
4. Create tracking record:
   
   referral:C-customer:789012 → {
     id: "referral:C-customer:789012",
     association_id: "C-customer:789012", // ✅ C- prefix on tracking ID
     affiliate_id: "affiliate:123",
     affiliate_code: "SMI7843",
     type: "customer",
     customer_id: "customer:789012",
     customer_name: "Jane Doe"
   }

5. Increment partner.total_customer_referrals
6. Award R20 download bounty
```

**Key Pattern:**
- Code is universal: `SMI7843`
- Association ID has prefix: `C-customer:789012`
- This links the customer to the partner

---

### 4. Partner Visits Referred Business (Bonus Feature!)

```typescript
// Partner who is ALSO a customer checks in at business they referred

When check-in happens:
1. Get business ID: "business-123456"
2. Look up: referral:B-business-123456
3. Check if affiliate's email matches customer's email
4. If YES:
   - Award 50 bonus points (on top of regular 10)
   - Create partner_visit tracking:
     
     partner_visit:affiliate:123:business-123456:timestamp → {
       affiliate_id: "affiliate:123",
       business_id: "business-123456",
       business_name: "Cool Restaurant",
       bonus_points: 50,
       timestamp: "2026-03-14T..."
     }
   
   - Show message: "🎉 Bonus! You referred this business. +50 extra points!"
```

**This incentivizes partners to:**
- Actually visit the businesses they refer
- Build real relationships
- Stay engaged with the ecosystem

---

## Database Schema

### Partner/Affiliate Record

```typescript
{
  id: "affiliate:123",
  code: "SMI7843", // ✅ Universal code (no prefix)
  name: "John Smith",
  email: "john@example.com",
  phone: "+27...",
  
  // Tracking
  total_referrals: 15,
  total_customer_referrals: 10, // Using same code
  total_business_referrals: 5,  // Using same code
  
  // Earnings
  total_earnings: 500,
  pending_balance: 200,
  paid_earnings: 300,
  app_downloads: 10,
  
  status: "approved",
  joined_at: "2026-01-15T..."
}
```

---

### Customer Record

```typescript
{
  id: "customer:789012",
  username: "janedoe",
  name: "Jane Doe",
  email: "jane@example.com",
  
  // Referral tracking
  referral_code: "SMI7843", // ✅ Code used (no prefix)
  referred_by: "affiliate:123",
  
  loyalty_points: 120,
  joined_at: "2026-03-14T..."
}
```

---

### Business Record

```typescript
{
  id: "business-123456",
  name: "Cool Restaurant",
  owner_name: "Mike Owner",
  email: "mike@coolrestaurant.com",
  
  // Referral tracking
  affiliate_code: "SMI7843", // ✅ Code used (no prefix)
  referred_by: "affiliate:123",
  
  subscription_plan: "premium",
  is_active: true,
  created_at: "2026-02-20T..."
}
```

---

### Referral Tracking Record (Business)

```typescript
{
  id: "referral:B-business-123456",
  association_id: "B-business-123456", // ✅ B- prefix shows it's a business
  
  affiliate_id: "affiliate:123",
  affiliate_code: "SMI7843",
  type: "business",
  
  business_id: "business-123456",
  business_name: "Cool Restaurant",
  plan: "premium",
  
  created_at: "2026-02-20T..."
}
```

---

### Referral Tracking Record (Customer)

```typescript
{
  id: "referral:C-customer:789012",
  association_id: "C-customer:789012", // ✅ C- prefix shows it's a customer
  
  affiliate_id: "affiliate:123",
  affiliate_code: "SMI7843",
  type: "customer",
  
  customer_id: "customer:789012",
  customer_name: "Jane Doe",
  
  created_at: "2026-03-14T..."
}
```

---

### Partner Visit Record

```typescript
{
  id: "partner_visit:affiliate:123:business-123456:1710432000000",
  
  affiliate_id: "affiliate:123",
  business_id: "business-123456",
  business_name: "Cool Restaurant",
  
  bonus_points: 50,
  timestamp: "2026-03-14T..."
}
```

---

## Earnings & Rewards

### Customer Referral (App Download)
```
Code Used: SMI7843
Customer Downloads App
→ R20 download bounty (instant)
→ Status: Pending
→ Type: Customer Download
```

### Business Referral
```
Code Used: SMI7843
Business Signs Up (Premium Plan)
→ Calculate commission (e.g., R150)
→ Status: Pending
→ Type: Business Subscription
```

### Partner Visit Bonus
```
Partner checks in at their referred business
→ Regular check-in: 10 points
→ Bonus for being the referrer: 50 points
→ Total: 60 points
→ Message: "🎉 Bonus! You referred this business"
```

---

## API Endpoints

### Get Partner Referrals & Analytics

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
    "business_earnings": 750,
    "universal_code": "SMI7843",
    "partner_business_visits": 3,
    "partner_visit_bonus_points": 150
  },
  "referrals": {
    "customers": [
      {
        "id": "referral:C-customer:789012",
        "association_id": "C-customer:789012",
        "customer_name": "Jane Doe",
        "created_at": "2026-03-14T..."
      }
    ],
    "businesses": [
      {
        "id": "referral:B-business-123456",
        "association_id": "B-business-123456",
        "business_name": "Cool Restaurant",
        "plan": "premium",
        "created_at": "2026-02-20T..."
      }
    ]
  },
  "partner_visits": [
    {
      "business_name": "Cool Restaurant",
      "bonus_points": 50,
      "timestamp": "2026-03-14T..."
    }
  ]
}
```

---

## UI/UX

### Partner Dashboard

**Universal Code Display:**
```
┌──────────────────────────────────┐
│   Your Universal Referral Code   │
│                                   │
│         SMI7843 📋               │
│                                   │
│  Use for both customers & businesses │
└──────────────────────────────────┘
```

**Stats Cards:**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Pending  │  │  Total   │  │ Customer │  │ Business │
│ Payout   │  │ Earnings │  │Referrals │  │Referrals │
│          │  │          │  │          │  │          │
│ R 200    │  │ R 950    │  │    10    │  │    5     │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Bonus Tracking:**
```
┌────────────────────────────────────────┐
│  🌟 Partner Visit Bonuses              │
│                                        │
│  Visits to your businesses:  3         │
│  Total bonus points earned:  150       │
│                                        │
│  Keep visiting to earn more rewards!   │
└────────────────────────────────────────┘
```

---

## Customer Experience

### Using Referral Code (Customer Side)

**Sign Up Screen:**
```
┌──────────────────────────┐
│  Join MYVIBES            │
│                          │
│  Username: ________      │
│  Name:     ________      │
│                          │
│  Referral Code (opt):    │
│  [ SMI7843        ]      │
│                          │
│  [  Sign Up  ]          │
└──────────────────────────┘
```

When they enter `SMI7843`:
- ✅ System finds partner
- ✅ Creates association: `C-customer:newid`
- ✅ Awards partner R20
- ✅ Customer gets normal account

---

### Check-In at Referred Business

**Normal Customer Check-In:**
```
✅ Checked in at Cool Restaurant!
+10 points
Total: 120 points
```

**Partner Checking In at Their Own Referred Business:**
```
🎉 Checked in at Cool Restaurant!
+10 points (check-in)
+50 points (referral bonus!)
You referred this business - enjoy your visit!
Total: 180 points
```

---

## Business Experience

### Using Referral Code (Business Side)

**Registration Screen:**
```
┌──────────────────────────────┐
│  Register Your Business      │
│                              │
│  Business Name: ________     │
│  Owner Name:    ________     │
│  Email:         ________     │
│  ...                         │
│                              │
│  Partner Code (opt):         │
│  [ SMI7843           ]       │
│                              │
│  [  Create Account  ]        │
└──────────────────────────────┘
```

When they enter `SMI7843`:
- ✅ System finds partner
- ✅ Creates association: `B-business:newid`
- ✅ Awards partner commission
- ✅ Business gets normal account

---

## Tracking & Analytics

### For Partners

**See who they referred:**
```sql
// Get all their referrals
SELECT * FROM referrals WHERE affiliate_id = 'affiliate:123'

// Filter by type
- association_id starts with 'B-' → Business
- association_id starts with 'C-' → Customer
```

**See their business visits:**
```sql
SELECT * FROM partner_visits WHERE affiliate_id = 'affiliate:123'
```

### For Admin

**Find referrals for a business:**
```sql
// Get business
business_id = 'business-123456'

// Find tracking
referral_id = 'referral:B-business-123456'

// Get partner
affiliate_id from referral record
```

**Find referrals for a customer:**
```sql
// Get customer
customer_id = 'customer:789012'

// Find tracking
referral_id = 'referral:C-customer:789012'

// Get partner
affiliate_id from referral record
```

---

## Benefits

### For Partners
✅ **One code to remember** - use everywhere
✅ **Dual income streams** - customers AND businesses
✅ **Visit bonuses** - rewards for engagement
✅ **Clear tracking** - separate stats for each type
✅ **Compound benefits** - be both partner AND customer

### For Customers
✅ **Simple sign-up** - just enter code
✅ **Normal experience** - no difference vs non-referred
✅ **Partner support** - referred by someone they trust

### For Businesses
✅ **Simple sign-up** - same easy code entry
✅ **Partner visibility** - partner may visit them
✅ **Network effect** - partner promotes them

### For System
✅ **Clean tracking** - B/C prefix on IDs, not codes
✅ **Easy queries** - filter by association_id prefix
✅ **Scalable** - one code, multiple use cases
✅ **Engagement tracking** - partner visits add value

---

## Example User Journey

### Partner: John Smith (Code: SMI7843)

**Month 1 - Influencer Activity:**
- Posts code `SMI7843` on Instagram
- 10 customers download app using his code
- System creates: `referral:C-customer:001`, `referral:C-customer:002`, etc.
- Earns: 10 × R20 = R200

**Month 2 - Business Outreach:**
- Refers 2 restaurants using same code `SMI7843`
- System creates: `referral:B-business-001`, `referral:B-business-002`
- Earns: 2 × R150 = R300

**Month 3 - Customer Engagement:**
- Visits restaurant he referred (B-business-001)
- Checks in as customer
- Gets 10 + 50 bonus points
- System creates: `partner_visit:...`

**Dashboard shows:**
```
Total Referrals: 12
├─ Customers: 10 (R200)
└─ Businesses: 2 (R300)

Business Visits: 1 (50 bonus points)

Total Earnings: R500
```

---

## Summary

🎯 **ONE universal code** per partner (e.g., `SMI7843`)

🔖 **B/C prefixes on TRACKING IDs**:
- `referral:B-business-123` (business association)
- `referral:C-customer:456` (customer association)

📊 **Separate tracking**:
- `total_customer_referrals`
- `total_business_referrals`

🌟 **Bonus system**:
- Partners get extra points when visiting their referred businesses
- Encourages real engagement

✨ **Result**: Clean, flexible system that tracks everything perfectly! 🚀
