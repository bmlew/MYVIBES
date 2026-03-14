# 🎛️ Configurable Rewards System

## Overview

The MYVIBES platform features a **fully configurable rewards system** where all partner/influencer commissions, bonuses, and thresholds can be adjusted in real-time through the Admin Portal.

---

## Admin Portal Configuration

### Location
**Admin Portal → Platform Settings & Configuration → Partner & Influencer Rewards**

### Configurable Settings

#### 1. Customer Referral Rewards

| Setting | Default | Description |
|---------|---------|-------------|
| **Download Bounty** | R20 | Paid immediately when customer downloads app |
| **Check-in Threshold** | 100 | Number of check-ins required for reward |
| **Threshold Reward** | R200 | Amount paid when threshold is reached |

**How it works:**
- Partner shares code → Customer downloads → Partner gets **R20** instantly
- Every **100 check-ins** by that customer → Partner gets **R200** more
- Ongoing reward for active customer engagement!

**Example:**
```
Customer downloads app with code ABC123
→ Partner earns R20 (immediate)

Customer makes 100 check-ins total
→ Partner earns R200 (milestone 1)

Customer makes 200 check-ins total
→ Partner earns R200 (milestone 2)

Total earned: R20 + R200 + R200 = R420
```

---

#### 2. Business Subscription Commissions

| Setting | Default | Description |
|---------|---------|-------------|
| **Commission Percentage** | 15% | % of subscription payment |
| **Recurring Commission** | ✅ Enabled | Pay on every payment (not just first) |

**How it works:**
- Business signs up with partner code
- Business pays subscription (e.g., R499/month)
- Partner earns **15% of R499 = R75**
- If recurring enabled: Partner earns **R75 EVERY MONTH** the business pays!

**Example (Recurring Enabled):**
```
Month 1: Business pays R499 → Partner earns R75
Month 2: Business pays R499 → Partner earns R75
Month 3: Business pays R499 → Partner earns R75
...
Month 12: Business pays R499 → Partner earns R75

Total Year 1: R75 × 12 = R900
```

**Example (Recurring Disabled):**
```
Month 1: Business pays R499 → Partner earns R75
Month 2: Business pays R499 → Partner earns R0
Month 3: Business pays R499 → Partner earns R0

Total: R75 (one-time only)
```

---

#### 3. Partner Engagement Bonuses

| Setting | Default | Description |
|---------|---------|-------------|
| **Partner Visit Bonus** | 50 points | Extra points when visiting referred business |
| **Regular Check-in Points** | 10 points | Points for any check-in |

**How it works:**
- Normal customer checks in → **10 points**
- Partner checks in at ANY business → **10 points**
- Partner checks in at THEIR referred business → **10 + 50 = 60 points**

**Example:**
```
Sarah (partner) referred Coffee Shop ABC

Sarah checks in at Restaurant XYZ → 10 points
Sarah checks in at Coffee Shop ABC → 60 points (🎉 bonus!)
Regular customer checks in → 10 points
```

---

#### 4. General Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Check-in Cooldown** | 1 hour | Time before next check-in allowed |

---

## Backend Implementation

### Settings Storage

Settings are stored in the key-value store:
```typescript
{
  id: 'platform:settings',
  rewards: {
    customer_download_bounty: 20,
    customer_checkin_threshold: 100,
    customer_checkin_reward: 200,
    business_subscription_commission_percentage: 15,
    business_recurring_commission: true,
    partner_visit_bonus_points: 50,
    checkin_points: 10,
    checkin_cooldown_hours: 1
  },
  updated_at: "2026-03-14T..."
}
```

### Helper Function

```typescript
async function getPlatformSettings() {
  let settings = await kv.get('platform:settings');
  
  if (!settings) {
    // Returns default settings
    settings = {
      rewards: {
        customer_download_bounty: 20,
        customer_checkin_threshold: 100,
        customer_checkin_reward: 200,
        business_subscription_commission_percentage: 15,
        business_recurring_commission: true,
        partner_visit_bonus_points: 50,
        checkin_points: 10,
        checkin_cooldown_hours: 1
      }
    };
    await kv.set('platform:settings', settings);
  }
  
  return settings;
}
```

---

## How Each Feature Uses Settings

### 1. Customer Registration (Download Bounty)

```typescript
// Customer registers with partner code
const platformSettings = await getPlatformSettings();
const DOWNLOAD_BOUNTY = platformSettings.rewards.customer_download_bounty;

affiliate.pending_balance += DOWNLOAD_BOUNTY;
affiliate.total_earnings += DOWNLOAD_BOUNTY;

// Commission record
{
  type: 'Customer Download',
  amount: DOWNLOAD_BOUNTY, // R20 (configurable)
  status: 'pending'
}
```

---

### 2. Check-in Threshold Tracking

```typescript
// Customer checks in (referred customer)
const platformSettings = await getPlatformSettings();
const threshold = platformSettings.rewards.customer_checkin_threshold;
const thresholdReward = platformSettings.rewards.customer_checkin_reward;

// Track total check-ins
checkinTracking.total_checkins += 1;

// Check if crossed threshold
const previousThresholds = Math.floor((total_checkins - 1) / threshold);
const currentThresholds = Math.floor(total_checkins / threshold);

if (currentThresholds > previousThresholds) {
  // Award partner!
  affiliate.pending_balance += thresholdReward;
  affiliate.total_earnings += thresholdReward;
  
  // Commission record
  {
    type: 'Customer Check-in Threshold',
    amount: thresholdReward, // R200 (configurable)
    business_name: `Customer Check-in Milestone (${total_checkins} check-ins)`
  }
}
```

**Example tracking:**
```
Check-in #1   → 0 thresholds
Check-in #50  → 0 thresholds
Check-in #99  → 0 thresholds
Check-in #100 → 1 threshold ✅ Award R200!
Check-in #150 → 1 threshold
Check-in #200 → 2 thresholds ✅ Award R200!
```

---

### 3. Business Subscription Payment (Recurring Commission)

```typescript
// Business pays monthly subscription
const platformSettings = await getPlatformSettings();
const commissionPercentage = platformSettings.rewards.business_subscription_commission_percentage;
const recurringEnabled = platformSettings.rewards.business_recurring_commission;

if (business.referred_by && recurringEnabled) {
  const commissionAmount = Math.round((amount * commissionPercentage) / 100);
  
  affiliate.pending_balance += commissionAmount;
  affiliate.total_earnings += commissionAmount;
  
  // Commission record
  {
    type: 'Business Subscription (Recurring)',
    amount: commissionAmount, // R75 if 15% of R499
    base_amount: amount,
    commission_percentage: commissionPercentage,
    payment_id: paymentId
  }
}
```

**This happens EVERY time the business pays** if recurring is enabled!

---

### 4. Check-in with Configurable Points

```typescript
const platformSettings = await getPlatformSettings();
const POINTS_PER_CHECKIN = platformSettings.rewards.checkin_points;
const COOLDOWN = platformSettings.rewards.checkin_cooldown_hours * 3600 * 1000;

// Award points
customer.loyalty_points += POINTS_PER_CHECKIN;
```

---

### 5. Partner Visit Bonus

```typescript
const platformSettings = await getPlatformSettings();
const PARTNER_BONUS = platformSettings.rewards.partner_visit_bonus_points;

// If partner visiting their own referred business
if (isPartnerVisitingTheirBusiness) {
  customer.loyalty_points += PARTNER_BONUS;
  
  // Track visit
  {
    type: 'partner_visit',
    bonus_points: PARTNER_BONUS // 50 (configurable)
  }
}
```

---

## API Endpoints

### Get Settings
```
GET /make-server-175b2872/settings

Response:
{
  "config": {
    "rewards": {
      "customer_download_bounty": 20,
      "customer_checkin_threshold": 100,
      "customer_checkin_reward": 200,
      "business_subscription_commission_percentage": 15,
      "business_recurring_commission": true,
      "partner_visit_bonus_points": 50,
      "checkin_points": 10,
      "checkin_cooldown_hours": 1
    }
  }
}
```

### Update Settings
```
POST /make-server-175b2872/settings

Body:
{
  "config": {
    "rewards": {
      "customer_download_bounty": 30,  // Changed from 20
      "customer_checkin_threshold": 50, // Changed from 100
      ...
    }
  }
}
```

### Process Subscription Payment (with auto commission)
```
POST /make-server-175b2872/payments/subscription

Body:
{
  "business_id": "business-123",
  "amount": 499,
  "payment_method": "card",
  "transaction_id": "txn_abc123"
}

Response:
{
  "success": true,
  "payment": {
    "id": "payment:...",
    "amount": 499,
    "status": "completed"
  },
  "partner_commission": {
    "partner_name": "John Smith",
    "commission_amount": 75,
    "commission_percentage": 15
  },
  "message": "Payment processed! Partner John Smith earned R75"
}
```

---

## Use Cases

### Use Case 1: Increase Customer Engagement

**Scenario:** Too few customers are checking in

**Admin Action:**
1. Open Admin Portal → Platform Settings
2. Reduce **Check-in Threshold** from 100 to 50
3. Increase **Threshold Reward** from R200 to R300
4. Save

**Result:**
- Partners now earn R300 every 50 check-ins (instead of R200/100)
- Partners promote check-ins more aggressively
- Customer engagement increases!

---

### Use Case 2: Boost Business Referrals

**Scenario:** Need more businesses on platform

**Admin Action:**
1. Open Admin Portal → Platform Settings
2. Increase **Commission Percentage** from 15% to 25%
3. Ensure **Recurring Commission** is enabled
4. Save

**Result:**
- Partners now earn R125/month instead of R75/month (25% of R499)
- Partners focus on business referrals
- More businesses join!

---

### Use Case 3: Seasonal Promotion

**Scenario:** December holiday promotion

**Admin Action:**
1. Increase **Download Bounty** from R20 to R50
2. Increase **Partner Visit Bonus** from 50 to 100 points
3. Run promotion for December
4. January 1st: Reset to original values

**Result:**
- Massive spike in customer downloads
- Partners earn more during promotion
- Easy to reset after promotion ends

---

### Use Case 4: Reduce Partner Payouts (Cost Control)

**Scenario:** Partner commissions too high

**Admin Action:**
1. Reduce **Commission Percentage** from 15% to 10%
2. Disable **Recurring Commission**
3. Increase **Check-in Threshold** from 100 to 150

**Result:**
- Lower ongoing costs
- One-time payments only
- Higher bar for threshold rewards

---

## Data Tracking

### Customer Check-in Tracking

```typescript
// Stored per referred customer per partner
{
  id: "customer_checkins:affiliate:123:customer:456",
  affiliate_id: "affiliate:123",
  customer_id: "customer:456",
  customer_name: "Jane Doe",
  total_checkins: 157,
  rewards_earned: 1, // (100 threshold reached once)
  last_checkin: "2026-03-14T..."
}
```

**Tracking milestones:**
- At 100 check-ins → Award R200 → `rewards_earned: 1`
- At 200 check-ins → Award R200 → `rewards_earned: 2`
- At 300 check-ins → Award R200 → `rewards_earned: 3`

---

### Commission Records

```typescript
// Download bounty
{
  id: "comm:1710432000000",
  type: "Customer Download",
  amount: 20,
  status: "pending"
}

// Check-in threshold
{
  id: "comm:1710432100000_threshold",
  type: "Customer Check-in Threshold",
  amount: 200,
  business_name: "Customer Check-in Milestone (100 check-ins)"
}

// Recurring subscription
{
  id: "comm:1710432200000_subscription",
  type: "Business Subscription (Recurring)",
  amount: 75,
  base_amount: 499,
  commission_percentage: 15,
  payment_id: "payment:..."
}
```

---

## Admin Dashboard Calculations

### Real-Time Impact Calculator

When admin changes settings, show:

```
┌────────────────────────────────────────┐
│  Commission Change Impact              │
├────────────────────────────────────────┤
│  Current: 15% of R499 = R75/month      │
│  New:     25% of R499 = R125/month     │
│                                        │
│  Difference: +R50/month per business   │
│  Active Businesses: 50                 │
│  Additional Monthly Cost: +R2,500      │
└────────────────────────────────────────┘
```

---

## Migration & Compatibility

### Existing Commissions

Already-created commissions are **NOT** affected by settings changes:
- They maintain their original amounts
- Only NEW events use new settings

### Backward Compatibility

```typescript
// Code always checks for settings existence
const platformSettings = await getPlatformSettings();
const amount = platformSettings?.rewards?.customer_download_bounty || 20;

// Defaults to 20 if settings missing
```

---

## Security & Validation

### Input Validation

```typescript
// Min/max bounds in UI
customer_download_bounty: min=0
customer_checkin_threshold: min=1
business_subscription_commission_percentage: min=0, max=100
checkin_cooldown_hours: min=0, step=0.5
```

### Admin-Only Access

Settings endpoint should verify admin access:
```typescript
app.post("/make-server-175b2872/settings", async (c) => {
  // Verify admin token
  const isAdmin = await verifyAdminAccess(c);
  if (!isAdmin) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // Save settings...
});
```

---

## Benefits

### For Platform Owners
✅ **Full Control** - Adjust all rewards in real-time  
✅ **No Code Changes** - Update values without deploying  
✅ **A/B Testing** - Try different reward structures  
✅ **Cost Management** - Reduce payouts when needed  
✅ **Promotions** - Boost specific metrics temporarily

### For Partners
✅ **Transparent** - See current reward structure  
✅ **Fair** - Same rules for everyone  
✅ **Motivating** - Clear goals and rewards  
✅ **Lucrative** - Multiple income streams

### For Development
✅ **Flexible** - Easy to add new reward types  
✅ **Maintainable** - Settings in one place  
✅ **Testable** - Mock different configurations  
✅ **Scalable** - Handles growth gracefully

---

## Summary

The configurable rewards system allows complete control over:

1. **Customer Referrals**
   - Download bounty (immediate)
   - Check-in threshold rewards (ongoing)

2. **Business Referrals**
   - Commission percentage
   - Recurring vs one-time payments

3. **Engagement Bonuses**
   - Partner visit rewards
   - Check-in points

4. **Platform Rules**
   - Check-in cooldowns
   - Threshold milestones

All managed through an intuitive Admin Portal UI with real-time updates! 🎛️🎯
