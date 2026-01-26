# MYVIBES Platform Scalability Plan
## Target: 10,000 Customers + 3,000 Establishments

---

## 🚨 PHASE 1: Critical Database Migration (URGENT)

### Current Issue
Your KV store loads ALL data into memory on every request. This will crash at ~200+ establishments.

### Action Items

#### 1.1 Migrate to Proper Postgres Tables (Week 1)

**Create these tables in Supabase:**

```sql
-- Businesses Table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  type TEXT, -- 'restaurant', 'hotel', 'bar', etc.
  description TEXT,
  cuisine_type TEXT,
  price_range TEXT,
  age_group TEXT,
  
  -- Payment & Subscription
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'standard', 'premium'
  subscription_status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'suspended', 'grace_period'
  payment_status TEXT DEFAULT 'unpaid', -- 'paid', 'unpaid', 'overdue'
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  
  -- Visibility Controls
  is_active BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  visibility_override TEXT, -- 'force_visible', 'force_hidden', null
  grace_period_until TIMESTAMP,
  
  -- Affiliate
  affiliate_code TEXT,
  referred_by TEXT,
  
  -- Media
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images JSONB,
  
  -- Contact & Social
  website TEXT,
  facebook TEXT,
  instagram TEXT,
  twitter TEXT,
  
  -- Operating Hours
  operating_hours JSONB,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_type ON businesses(type);
CREATE INDEX idx_businesses_subscription_status ON businesses(subscription_status);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);
CREATE INDEX idx_businesses_payment_status ON businesses(payment_status);
CREATE INDEX idx_businesses_name_search ON businesses USING gin(to_tsvector('english', name));
CREATE INDEX idx_businesses_created_at ON businesses(created_at DESC);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_method TEXT,
  transaction_id TEXT,
  payment_date TIMESTAMP,
  subscription_month DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);

-- Specials Table
CREATE TABLE specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  valid_from DATE,
  valid_until DATE,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_specials_business_id ON specials(business_id);
CREATE INDEX idx_specials_valid_dates ON specials(valid_from, valid_until);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location TEXT,
  ticket_price DECIMAL(10, 2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_business_id ON events(business_id);
CREATE INDEX idx_events_event_date ON events(event_date);

-- Affiliates Table
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  affiliate_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'suspended'
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliates_email ON affiliates(email);

-- Commissions Table
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id),
  business_id UUID REFERENCES businesses(id),
  payment_id UUID REFERENCES payments(id),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid'
  paid_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_commissions_affiliate_id ON commissions(affiliate_id);
CREATE INDEX idx_commissions_status ON commissions(status);

-- Reservations Table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  party_size INTEGER,
  reservation_date TIMESTAMP NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservations_business_id ON reservations(business_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Analytics Table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  event_type TEXT NOT NULL, -- 'view', 'click', 'call', 'direction', 'menu_view'
  user_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_business_id ON analytics_events(business_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- Platform Settings (Keep as KV or single row table)
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions Ledger
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL, -- 'revenue', 'payout', 'expense'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT, -- 'payment', 'commission', 'expense'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ledger_type ON ledger_entries(entry_type);
CREATE INDEX idx_ledger_date ON ledger_entries(created_at DESC);
```

#### 1.2 Update Server to Use Postgres Tables

**Replace this pattern:**
```typescript
// ❌ OLD - Loads everything into memory
const allBusinesses = await kv.getByPrefix('business:');
```

**With this:**
```typescript
// ✅ NEW - Paginated query
const { data: businesses, error } = await supabase
  .from('businesses')
  .select('*')
  .eq('is_active', true)
  .eq('payment_status', 'paid')
  .range(0, 49) // First 50 results
  .order('created_at', { ascending: false });
```

#### 1.3 Data Migration Script

Create a migration script to move existing KV data to tables:

```typescript
// Run this once to migrate existing data
async function migrateKVToTables() {
  const businesses = await kv.getByPrefix('business:');
  
  for (const business of businesses) {
    await supabase.from('businesses').insert({
      id: business.id,
      name: business.name,
      email: business.email,
      // ... map all fields
    });
  }
  
  console.log(`Migrated ${businesses.length} businesses`);
}
```

---

## 🔧 PHASE 2: Implement Pagination (Week 2)

### 2.1 Backend Pagination

**Update all API endpoints to support pagination:**

```typescript
// Customer app - Get businesses
app.get("/make-server-175b2872/businesses", async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const city = c.req.query('city');
  const type = c.req.query('type');
  
  let query = supabase
    .from('businesses')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .in('payment_status', ['paid'])
    .in('subscription_status', ['active', 'grace_period']);
  
  if (city) query = query.eq('city', city);
  if (type) query = query.eq('type', type);
  
  const { data, count, error } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });
  
  return c.json({
    businesses: data,
    total: count,
    page,
    limit,
    total_pages: Math.ceil(count / limit)
  });
});
```

### 2.2 Frontend Infinite Scroll

Replace "load all" with infinite scroll:

```typescript
const [businesses, setBusinesses] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const response = await fetch(
    `${API_URL}/businesses?page=${page}&limit=20&city=${selectedCity}`
  );
  const data = await response.json();
  
  setBusinesses([...businesses, ...data.businesses]);
  setHasMore(page < data.total_pages);
  setPage(page + 1);
};

// Use react-infinite-scroll-component or Intersection Observer
```

---

## 🚀 PHASE 3: Caching Strategy (Week 3)

### 3.1 Edge Caching (Supabase has this built-in)

Add cache headers to static endpoints:

```typescript
app.get("/make-server-175b2872/businesses/:id", async (c) => {
  const business = await supabase
    .from('businesses')
    .select('*')
    .eq('id', c.req.param('id'))
    .single();
  
  // Cache for 5 minutes
  c.header('Cache-Control', 'public, max-age=300');
  return c.json(business);
});
```

### 3.2 CDN for Images

**Current:** Images served directly from Supabase Storage
**Improvement:** Use Supabase's CDN features + transform URLs

```typescript
// Optimize image URLs
const optimizedImageUrl = `${baseUrl}/image.jpg?width=400&quality=80`;
```

### 3.3 Browser Caching

Update PWA service worker to cache:
- Business listings (5 minutes)
- Business details (15 minutes)
- Images (7 days)
- Static assets (30 days)

---

## 🔍 PHASE 4: Search Optimization (Week 3)

### 4.1 Full-Text Search

```sql
-- Already created above
CREATE INDEX idx_businesses_name_search 
  ON businesses USING gin(to_tsvector('english', name));
```

### 4.2 Search Query

```typescript
app.get("/make-server-175b2872/businesses/search", async (c) => {
  const query = c.req.query('q');
  
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .textSearch('name', query)
    .limit(20);
  
  return c.json({ results: data });
});
```

### 4.3 Add Search Filters

- Location-based search (nearby establishments)
- Category filters
- Price range filters
- Rating filters
- Age group filters

---

## 📊 PHASE 5: Monitoring & Analytics (Week 4)

### 5.1 Add Performance Monitoring

```bash
# Install in your Supabase project
npm install @supabase/supabase-js
```

### 5.2 Track Key Metrics

```typescript
// Add to critical endpoints
const startTime = Date.now();
// ... do work ...
const duration = Date.now() - startTime;

console.log(`[PERFORMANCE] ${endpoint} took ${duration}ms`);

// Log slow queries (> 500ms)
if (duration > 500) {
  console.warn(`[SLOW QUERY] ${endpoint} took ${duration}ms`);
}
```

### 5.3 Set Up Alerts

Monitor:
- API response times > 1 second
- Error rates > 1%
- Database connection pool usage > 80%
- Memory usage > 80%

---

## 🛡️ PHASE 6: Security & Rate Limiting (Week 4)

### 6.1 Rate Limiting

```typescript
// Simple rate limiter
const rateLimiter = new Map();

app.use('*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown';
  const key = `${ip}:${c.req.path}`;
  
  const requests = rateLimiter.get(key) || [];
  const now = Date.now();
  const recentRequests = requests.filter(time => now - time < 60000); // 1 minute
  
  if (recentRequests.length >= 60) { // 60 requests per minute
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }
  
  rateLimiter.set(key, [...recentRequests, now]);
  await next();
});
```

### 6.2 API Key Protection

Protect admin endpoints with proper auth:

```typescript
const requireAdmin = async (c, next) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (!user || user.email !== 'admin@myvibes.co.za') {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  await next();
};

app.use('/make-server-175b2872/admin/*', requireAdmin);
```

---

## 📱 PHASE 7: Frontend Optimization (Week 5)

### 7.1 Code Splitting

```typescript
// Lazy load components
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const BusinessDashboard = lazy(() => import('./BusinessDashboard'));
```

### 7.2 Image Optimization

```typescript
// Use ImageWithFallback with loading states
<ImageWithFallback
  src={business.logo_url}
  alt={business.name}
  loading="lazy"
  width="200"
  height="200"
/>
```

### 7.3 Memoization

```typescript
const filteredBusinesses = useMemo(() => {
  return businesses.filter(b => 
    b.city === selectedCity && b.type === selectedType
  );
}, [businesses, selectedCity, selectedType]);
```

---

## 🧪 PHASE 8: Load Testing (Week 5)

### 8.1 Test Scenarios

```bash
# Install k6 load testing tool
brew install k6

# Create test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 500 }, // Ramp up to 500 users
    { duration: '5m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function () {
  // Test customer app
  let res = http.get('https://your-app.vercel.app/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  // Test API
  res = http.get('https://xxx.supabase.co/functions/v1/make-server-175b2872/businesses?page=1&limit=20');
  check(res, {
    'API status is 200': (r) => r.status === 200,
    'API response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
EOF

# Run test
k6 run load-test.js
```

### 8.2 Performance Benchmarks

Target metrics for 10K customers + 3K establishments:
- **Homepage Load:** < 2 seconds
- **Search Results:** < 500ms
- **Business Detail Page:** < 1 second
- **Admin Dashboard:** < 3 seconds
- **API Response Time (p95):** < 300ms
- **Concurrent Users:** 500+
- **Database Query Time:** < 100ms

---

## 💰 PHASE 9: Cost Optimization

### 9.1 Supabase Pricing Tiers

**Current (Free Tier):**
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 5 GB/month
- Edge Function Invocations: 500K/month

**Required for 10K customers + 3K establishments:**

**Pro Plan ($25/month):**
- Database: 8 GB (enough)
- Storage: 100 GB (enough)
- Bandwidth: 250 GB/month
- Edge Function Invocations: 2M/month

**Estimated Monthly Costs:**
- Supabase Pro: $25/month
- CDN/Bandwidth overages: ~$20/month
- Total: **~$45-60/month**

### 9.2 Revenue vs Costs

**Your Revenue (3K establishments):**
- Standard tier (70%): 2,100 × R499 = R1,047,900/month
- Premium tier (30%): 900 × R999 = R899,100/month
- **Total Revenue: R1,947,000/month (~$108,000)**
- **Infrastructure Cost: R1,080/month (~$60)**
- **Profit Margin: 99.9%** ✅

---

## 📋 PHASE 10: Maintenance Checklist

### Daily
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Review rate limit hits

### Weekly
- [ ] Database backup verification
- [ ] Performance metrics review
- [ ] Security audit logs

### Monthly
- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Review and clean up old data
- [ ] Update dependencies
- [ ] Cost analysis

---

## 🎯 SUMMARY: CRITICAL PATH

### Must Do (Priority 1 - Week 1-2):
1. ✅ **Migrate to Postgres tables** (This is THE most critical task)
2. ✅ **Implement pagination everywhere**
3. ✅ **Add database indexes**

### Should Do (Priority 2 - Week 3-4):
4. ✅ Add caching headers
5. ✅ Implement search optimization
6. ✅ Add rate limiting
7. ✅ Set up monitoring

### Nice to Have (Priority 3 - Week 5+):
8. ✅ Frontend code splitting
9. ✅ Advanced analytics
10. ✅ Load testing

---

## ⚡ QUICK WINS (Can Do Today)

### 1. Add Pagination to Customer App (2 hours)
Update `/businesses` endpoint and frontend to load 20 at a time

### 2. Add Database Indexes (30 minutes)
Run the SQL index creation commands

### 3. Optimize Images (1 hour)
Add lazy loading and width/height attributes

### 4. Add Loading States (1 hour)
Show skeletons instead of blank screens

---

## 🚫 WHAT NOT TO DO

❌ Don't try to scale the KV store - it won't work
❌ Don't add Redis yet - Postgres is sufficient for now
❌ Don't over-engineer - start simple
❌ Don't optimize prematurely - measure first
❌ Don't forget backups - set up automated backups

---

## ✅ SUCCESS CRITERIA

You'll know you're ready for 10K customers when:
- [ ] All API endpoints paginated
- [ ] Database properly indexed
- [ ] No `getByPrefix()` calls that load > 100 records
- [ ] Customer app loads in < 2 seconds
- [ ] Search returns results in < 500ms
- [ ] Admin dashboard loads in < 3 seconds
- [ ] Load test passes with 500 concurrent users
- [ ] Error rate < 1%
- [ ] Database queries < 100ms average

---

## 📞 Need Help?

If you get stuck on any of these phases, ask me for:
1. Detailed code implementations
2. SQL migration scripts
3. Performance optimization help
4. Load testing assistance
5. Cost optimization strategies

**Your current architecture will fail at ~200 establishments. The database migration is CRITICAL and should be your #1 priority.**
