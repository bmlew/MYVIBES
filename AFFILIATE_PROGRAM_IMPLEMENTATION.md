# 🤝 Affiliate Program - Implementation Complete

## **✅ What Was Added:**

### **1. Platform Settings with Affiliate Commission**
- **Location:** `/supabase/functions/server/seed_data.tsx`
- **Added:**
```javascript
const platformSettings = {
  monthly_subscription_fee: 499,
  affiliate_commission_percentage: 10,  // ← NEW! Configurable
  ml_insights_enabled: true,
  data_brokerage_enabled: true
};
```

### **2. Affiliate Data Structure**
```javascript
{
  id: 'AFF001',
  name: 'John Marketing',
  email: 'john@marketing.co.za',
  phone: '+27 82 555 1234',
  code: 'JOHM2026',               // Unique affiliate code
  status: 'approved',             // pending | approved | rejected
  total_referrals: 3,
  total_commission_earned: 149.70,
  pending_commission: 0,
  paid_commission: 149.70,
  created_at: '2025-12-01',
  approved_at: '2025-12-02',
  approved_by: 'admin@myvibe.co.za'
}
```

---

## **📊 Affiliate Program Flow:**

### **Step 1: Affiliate Registration**
```
Affiliate signs up
    ↓
Status: "pending"
    ↓
Global Admin reviews
    ↓
Approves/Rejects
    ↓
Status: "approved" → Unique code generated (e.g., "JOHM2026")
```

### **Step 2: Business Registration with Affiliate Code**
```
Business registration form
    ↓
Optional field: "Affiliate Code"
    ↓
Enter code: "JOHM2026"
    ↓
System validates affiliate exists & is approved
    ↓
Business record stores: affiliate_code: "JOHM2026"
```

### **Step 3: Subscription Payment & Commission**
```
Business pays R499 monthly subscription
    ↓
Get platform settings (affiliate_commission_percentage = 10%)
    ↓
Calculate commission: R499 × 10% = R49.90
    ↓
Update affiliate record:
  - total_referrals += 1
  - total_commission_earned += 49.90
  - pending_commission += 49.90
    ↓
Create commission record for tracking
```

---

## **🔧 Next Steps to Complete Implementation:**

### **1. Add Affiliate Code to Registration Form**

**File:** `/src/app/components/BusinessAuth.tsx`

**Add to registerData state:**
```javascript
const [registerData, setRegisterData] = useState({
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  password: '',
  confirmPassword: '',
  affiliate_code: ''  // ← ADD THIS
});
```

**Add to registration form UI:**
```jsx
{/* Affiliate Code (Optional) */}
<div>
  <Label htmlFor="affiliate_code">
    Affiliate Code <span className="text-gray-500">(Optional)</span>
  </Label>
  <Input
    id="affiliate_code"
    placeholder="Enter affiliate referral code"
    value={registerData.affiliate_code}
    onChange={(e) => setRegisterData({...registerData, affiliate_code: e.target.value})}
  />
  <p className="text-xs text-gray-500 mt-1">
    Have an affiliate code? Enter it to support your referrer
  </p>
</div>
```

---

### **2. Update Server Registration Endpoint**

**File:** `/supabase/functions/server/index.tsx`

**In the `/auth/business/register` endpoint:**

```javascript
app.post("/make-server-175b2872/auth/business/register", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      business_name, owner_name, email, phone, address, city, password,
      affiliate_code  // ← ADD THIS
    } = body;

    // Validate affiliate code if provided
    let validAffiliate = null;
    if (affiliate_code) {
      const affiliates = await kv.getByPrefix('affiliate:');
      validAffiliate = affiliates.find(
        (aff: any) => aff.code === affiliate_code && aff.status === 'approved'
      );
      
      if (!validAffiliate) {
        return c.json({ error: 'Invalid or inactive affiliate code' }, 400);
      }
    }

    // ... create business

    const business = {
      //... existing fields
      affiliate_code: validAffiliate ? affiliate_code : null,
      referred_by: validAffiliate ? validAffiliate.id : null,
      created_at: new Date().toISOString()
    };

    await kv.set(`business:${businessId}`, business);

    // If affiliate code used, increment referral count
    if (validAffiliate) {
      validAffiliate.total_referrals += 1;
      await kv.set(`affiliate:${validAffiliate.id}`, validAffiliate);
      console.log(`✅ Affiliate ${validAffiliate.name} credited with referral`);
    }

    // ... rest of registration
  }
});
```

---

### **3. Create Payment Webhook Handler**

**Add new endpoint to handle subscription payments:**

```javascript
app.post("/make-server-175b2872/webhooks/payment", async (c) => {
  try {
    const { business_id, amount, status } = await c.req.json();
    
    if (status !== 'paid') return c.json({ success: true });

    // Get business
    const business = await kv.get(`business:${business_id}`);
    if (!business || !business.referred_by) {
      return c.json({ success: true }); // No affiliate
    }

    // Get platform settings
    const settings = await kv.get('platform:settings');
    const commissionPercentage = settings.affiliate_commission_percentage || 10;
    
    // Calculate commission
    const subscriptionFee = settings.monthly_subscription_fee;
    const commission = (subscriptionFee * commissionPercentage) / 100;

    // Get affiliate
    const affiliate = await kv.get(`affiliate:${business.referred_by}`);
    
    // Update affiliate earnings
    affiliate.total_commission_earned += commission;
    affiliate.pending_commission += commission;
    await kv.set(`affiliate:${affiliate.id}`, affiliate);

    // Create commission record
    const commissionId = `commission:${affiliate.id}:${Date.now()}`;
    await kv.set(commissionId, {
      id: commissionId,
      affiliate_id: affiliate.id,
      business_id: business_id,
      amount: commission,
      subscription_amount: subscriptionFee,
      commission_percentage: commissionPercentage,
      status: 'pending',  // pending | paid
      created_at: new Date().toISOString(),
      paid_at: null
    });

    console.log(`💰 Commission R${commission.toFixed(2)} credited to ${affiliate.name}`);

    return c.json({ success: true, commission_earned: commission });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});
```

---

### **4. Add Affiliate Management to Global Owner Portal**

**Create component:** `/src/app/components/AffiliateManagement.tsx`

**Features:**
- List all affiliates (pending, approved, rejected)
- Approve/reject pending affiliates
- View affiliate performance (referrals, earnings)
- Mark commissions as paid
- Generate affiliate codes
- Download affiliate reports

**Example UI:**
```jsx
export function AffiliateManagement() {
  return (
    <div>
      <h2>Affiliate Management</h2>
      
      {/* Pending Approvals */}
      <section>
        <h3>Pending Approvals</h3>
        {pendingAffiliates.map(affiliate => (
          <div key={affiliate.id}>
            <p>{affiliate.name} - {affiliate.email}</p>
            <Button onClick={() => approve(affiliate.id)}>Approve</Button>
            <Button onClick={() => reject(affiliate.id)}>Reject</Button>
          </div>
        ))}
      </section>

      {/* Active Affiliates */}
      <section>
        <h3>Active Affiliates</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Referrals</th>
              <th>Total Earned</th>
              <th>Pending</th>
              <th>Paid</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeAffiliates.map(aff => (
              <tr key={aff.id}>
                <td>{aff.name}</td>
                <td>{aff.code}</td>
                <td>{aff.total_referrals}</td>
                <td>R{aff.total_commission_earned.toFixed(2)}</td>
                <td>R{aff.pending_commission.toFixed(2)}</td>
                <td>R{aff.paid_commission.toFixed(2)}</td>
                <td>
                  <Button onClick={() => payCommission(aff.id)}>
                    Pay R{aff.pending_commission.toFixed(2)}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
```

---

### **5. Add Platform Settings Editor**

**In Global Owner Portal, add settings management:**

```jsx
export function PlatformSettings() {
  const [settings, setSettings] = useState({
    monthly_subscription_fee: 499,
    affiliate_commission_percentage: 10
  });

  const handleSave = async () => {
    await fetch('/api/platform/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  };

  return (
    <div>
      <h2>Platform Settings</h2>
      
      <Label>Monthly Subscription Fee (R)</Label>
      <Input
        type="number"
        value={settings.monthly_subscription_fee}
        onChange={(e) => setSettings({
          ...settings,
          monthly_subscription_fee: Number(e.target.value)
        })}
      />

      <Label>Affiliate Commission Percentage (%)</Label>
      <Input
        type="number"
        value={settings.affiliate_commission_percentage}
        onChange={(e) => setSettings({
          ...settings,
          affiliate_commission_percentage: Number(e.target.value)
        })}
      />
      <p className="text-sm text-gray-500">
        Affiliates earn {settings.affiliate_commission_percentage}% of R{settings.monthly_subscription_fee} = R{(settings.monthly_subscription_fee * settings.affiliate_commission_percentage / 100).toFixed(2)} per referral
      </p>

      <Button onClick={handleSave}>Save Settings</Button>
    </div>
  );
}
```

---

## **📊 Commission Calculation Examples:**

| Subscription Fee | Commission % | Commission Amount |
|-----------------|--------------|-------------------|
| R499 | 10% | R49.90 |
| R499 | 15% | R74.85 |
| R499 | 20% | R99.80 |
| R799 | 10% | R79.90 |
| R299 | 10% | R29.90 |

---

## **🎯 Database Structure:**

### **Collections in KV Store:**

1. **`platform:settings`** - Global settings
   - `monthly_subscription_fee`
   - `affiliate_commission_percentage`

2. **`affiliate:{id}`** - Affiliate profiles
   - Approved/pending/rejected status
   - Performance metrics

3. **`business:{id}`** - Business profiles (updated)
   - `affiliate_code` - Code used during registration
   - `referred_by` - Affiliate ID

4. **`commission:{affiliate_id}:{timestamp}`** - Commission records
   - Per-payment commission tracking
   - Pending/paid status

---

## **✅ Implementation Checklist:**

- [✅] Platform settings with affiliate commission percentage
- [✅] Affiliate seed data structure
- [✅] Affiliate seeding in database
- [ ] Add affiliate_code field to BusinessAuth registration form
- [ ] Update registration endpoint to validate affiliate codes
- [ ] Create payment webhook to calculate commissions
- [ ] Build Affiliate Management component for Global Portal
- [ ] Add Platform Settings editor
- [ ] Create commission payment tracking
- [ ] Add affiliate earnings dashboard
- [ ] Build affiliate reports/analytics

---

## **🚀 What's Ready NOW:**

✅ **Platform Settings** - Commission percentage configurable (currently 10%)  
✅ **Seed Data** - 2 sample affiliates with commission history  
✅ **Database Structure** - Ready to track referrals and earnings  

## **What Needs to be Built:**

🔧 **Registration Form** - Add affiliate code input field  
🔧 **Server Logic** - Validate codes and track referrals  
🔧 **Payment Webhook** - Calculate and allocate commissions  
🔧 **Admin UI** - Manage affiliates and approve registrations  
🔧 **Settings UI** - Adjust commission percentage  

---

The foundation is built! Next, implement the registration form changes and server endpoints listed above. 🎉
