# ⚡ Referral System Quick Start

## The Simple Version

### Partner gets ONE code: `SMI7843`

### That code works for BOTH:
- 👥 **Customers** downloading the app
- 🏢 **Businesses** signing up

### System tracks with B/C on the ID:
- Business uses code → creates `referral:B-business-123456`
- Customer uses code → creates `referral:C-customer:789012`

### Bonus: Partner visits their business
- Partner checks in at business they referred
- Gets 10 (normal) + 50 (bonus) = 60 points total!

---

## Key Points

| Item | Value |
|------|-------|
| **Code Format** | No prefix (e.g., `SMI7843`) |
| **Association ID** | Has B- or C- prefix |
| **Customer Bounty** | R20 per download |
| **Business Commission** | Based on plan |
| **Visit Bonus** | 50 extra points |

---

## Code Examples

### Check if business was referred by partner

```typescript
// Business ID: "business-123456"
const referral = await kv.get(`referral:B-business-123456`);

if (referral) {
  console.log('Referred by:', referral.affiliate_id);
  console.log('Code used:', referral.affiliate_code);
}
```

### Check if customer was referred by partner

```typescript
// Customer ID: "customer:789012"
const referral = await kv.get(`referral:C-customer:789012`);

if (referral) {
  console.log('Referred by:', referral.affiliate_id);
  console.log('Code used:', referral.affiliate_code);
}
```

### Check if partner is visiting their own business

```typescript
// On check-in
const businessReferral = await kv.get(`referral:B-${businessId}`);
const affiliate = await kv.get(businessReferral.affiliate_id);

if (affiliate.email === customer.email) {
  // Same person! Give bonus
  bonusPoints = 50;
}
```

---

## Quick Reference

### Data Structure

```
Partner
  ├─ code: "SMI7843"
  ├─ total_customer_referrals: 10
  └─ total_business_referrals: 5

Business (uses code SMI7843)
  ├─ id: "business-123456"
  ├─ affiliate_code: "SMI7843"
  └─ Tracking: referral:B-business-123456

Customer (uses code SMI7843)
  ├─ id: "customer:789012"
  ├─ referral_code: "SMI7843"
  └─ Tracking: referral:C-customer:789012

Partner Visit
  └─ partner_visit:affiliate:123:business-123456:timestamp
```

---

## Implementation Checklist

### Backend ✅
- [x] Universal code (no prefix)
- [x] B- prefix on business association IDs
- [x] C- prefix on customer association IDs
- [x] Separate counters (customer vs business)
- [x] Partner visit bonus tracking
- [x] Referral analytics endpoint

### Frontend ✅
- [x] Show universal code on partner dashboard
- [x] Separate stats for customers vs businesses
- [x] Copy button for code
- [x] Bonus message on check-in

### Features ✅
- [x] Customer downloads → R20 bounty
- [x] Business signup → commission
- [x] Partner visits business → 50 bonus points
- [x] Track all referrals separately
- [x] Analytics by type

---

## Testing

### Test Scenario 1: Customer Referral
1. Partner registers → gets code `SMI7843`
2. Customer signs up with code `SMI7843`
3. System creates `referral:C-customer:newid`
4. Partner earns R20
5. Check: `partner.total_customer_referrals` incremented

### Test Scenario 2: Business Referral
1. Partner has code `SMI7843`
2. Business registers with code `SMI7843`
3. System creates `referral:B-business:newid`
4. Partner earns commission
5. Check: `partner.total_business_referrals` incremented

### Test Scenario 3: Partner Visit Bonus
1. Partner referred business-123
2. Partner (as customer) checks in at business-123
3. System finds `referral:B-business-123`
4. Matches partner email to customer email
5. Awards 10 + 50 = 60 points
6. Creates `partner_visit:...` record

---

## Common Queries

### Get all businesses a partner referred
```typescript
const allReferrals = await kv.getByPrefix('referral:B-');
const partnerBusinesses = allReferrals.filter(
  r => r.affiliate_id === partnerId
);
```

### Get all customers a partner referred
```typescript
const allReferrals = await kv.getByPrefix('referral:C-');
const partnerCustomers = allReferrals.filter(
  r => r.affiliate_id === partnerId
);
```

### Get partner's visit bonuses
```typescript
const visits = await kv.getByPrefix(`partner_visit:${partnerId}:`);
const totalBonus = visits.reduce((sum, v) => sum + v.bonus_points, 0);
```

---

## Summary

✅ **Universal Code** - One code for everything
✅ **B/C Tracking** - Prefix on IDs, not codes
✅ **Dual Income** - Customers AND businesses
✅ **Visit Rewards** - Bonus for engagement
✅ **Clean Data** - Easy to query and report

Done! 🎉
