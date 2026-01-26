import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';
import { seedDatabase } from './seed_data.tsx';
import { sendReservationConfirmation, sendBusinessNotification } from './notifications.tsx';
import { runMigration } from './migrate-kv-to-postgres.tsx';

const app = new Hono();

// ============================================
// MIDDLEWARE
// ============================================

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true,
}));

app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

let seedingInProgress = false;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function generateRecommendationReason(timeOfDay: string, isWeekend: boolean, score: number, special: any): string {
  const reasons = [];
  if (special.discount_percentage && special.discount_percentage > 20) {
    reasons.push(`${special.discount_percentage}% off`);
  }
  if (timeOfDay === 'morning' && special.title.toLowerCase().includes('breakfast')) {
    reasons.push('Perfect for breakfast');
  } else if (timeOfDay === 'afternoon' && special.title.toLowerCase().includes('lunch')) {
    reasons.push('Great lunch deal');
  } else if (timeOfDay === 'evening' && (special.title.toLowerCase().includes('dinner') || special.title.toLowerCase().includes('happy'))) {
    reasons.push('Evening special');
  }
  if (isWeekend && special.title.toLowerCase().includes('weekend')) {
    reasons.push('Weekend exclusive');
  }
  if (score > 80) {
    reasons.push('Highly recommended');
  } else if (score > 60) {
    reasons.push('Popular choice');
  }
  return reasons.length > 0 ? reasons.join(' • ') : 'Special offer available';
}

function generateTags(special: any, score: number, timeOfDay: string): string[] {
  const tags = [];
  if (special.discount_percentage && special.discount_percentage > 30) {
    tags.push('Best Deal');
  }
  if (score > 80) {
    tags.push('Top Pick');
  }
  if (timeOfDay === 'evening') {
    tags.push('Tonight');
  }
  if (special.title.toLowerCase().includes('new')) {
    tags.push('New');
  }
  return tags;
}

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Business Registration
app.post("/make-server-175b2872/auth/business/register", async (c) => {
  try {
    const body = await c.req.json();
    const { business_name, owner_name, email, phone, address, city, password, affiliate_code, plan } = body;

    if (!business_name || !owner_name || !email || !phone || !address || !city || !password) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    
    const selectedPlan = plan && (plan === 'premium' || plan === 'standard') ? plan : 'standard';
    const subscriptionPrice = selectedPlan === 'premium' ? 999 : 499;

    let validAffiliate = null;
    if (affiliate_code && affiliate_code.trim()) {
      const affiliates = await kv.getByPrefix('affiliate:');
      validAffiliate = affiliates.find(
        (aff: any) => aff.code === affiliate_code.toUpperCase().trim() && aff.status === 'approved'
      );
      
      if (!validAffiliate) {
        return c.json({ error: 'Invalid or inactive affiliate code. Please check and try again.' }, 400);
      }
      
      console.log(`✅ Valid affiliate code: ${affiliate_code} - Affiliate: ${validAffiliate.name}`);
    }

    const existingBusinesses = await kv.getByPrefix('business:');
    const emailExists = existingBusinesses.some((b: any) => b.email === email);
    
    if (emailExists) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { business_name, owner_name, phone }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return c.json({ error: 'Failed to create account' }, 500);
    }

    const businessId = `business-${Date.now()}`;
    const business = {
      id: businessId,
      user_id: authData.user.id,
      name: business_name,
      owner_name,
      email,
      phone,
      address,
      city,
      description: '',
      business_type: 'restaurant',
      cuisine_types: [],
      latitude: city.toLowerCase().includes('johannesburg') || city.toLowerCase().includes('sandton') 
        ? -26.1076 
        : city.toLowerCase().includes('cape town') 
        ? -33.9249 
        : city.toLowerCase().includes('durban')
        ? -29.8587
        : -26.1076,
      longitude: city.toLowerCase().includes('johannesburg') || city.toLowerCase().includes('sandton')
        ? 28.0567
        : city.toLowerCase().includes('cape town')
        ? 18.4241
        : city.toLowerCase().includes('durban')
        ? 31.0218
        : 28.0567,
      price_range: '$$',
      logo_url: null,
      cover_image_url: null,
      is_active: true,
      subscription_status: 'active',
      payment_status: 'paid',
      subscription_plan: selectedPlan,
      subscription_price: subscriptionPrice,
      next_payment_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_payment_date: new Date().toISOString(),
      average_rating: 0,
      total_reviews: 0,
      total_views: 0,
      affiliate_code: validAffiliate ? affiliate_code.toUpperCase().trim() : null,
      referred_by: validAffiliate ? validAffiliate.id : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`business:${businessId}`, business);

    if (validAffiliate) {
      validAffiliate.total_referrals = (validAffiliate.total_referrals || 0) + 1;
      await kv.set(`affiliate:${validAffiliate.id}`, validAffiliate);
      console.log(`💰 Affiliate ${validAffiliate.name} credited with new referral. Total: ${validAffiliate.total_referrals}`);
    }

    return c.json({
      success: true,
      message: 'Business registered successfully!',
      business_id: businessId,
      payment_required: false
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Business Sign In
app.post("/make-server-175b2872/auth/business/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const allBusinesses = await kv.getByPrefix('business:');
    const business = allBusinesses.find((b: any) => b.user_id === authData.user.id);

    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }

    return c.json({
      success: true,
      business_id: business.id,
      access_token: authData.session.access_token,
      business: business
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return c.json({ error: 'Sign in failed' }, 500);
  }
});

// Get current business
app.get("/make-server-175b2872/auth/business/me", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const allBusinesses = await kv.getByPrefix('business:');
    const business = allBusinesses.find((b: any) => b.user_id === user.id);

    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }

    return c.json({ business });
  } catch (error) {
    console.error('Auth verification error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// ============================================
// BUSINESS ROUTES
// ============================================

// Get all businesses
app.get("/make-server-175b2872/kv/businesses", async (c) => {
  try {
    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    
    const allBusinesses = await kv.getByPrefix('business:');
    
    const paidBusinesses = allBusinesses.filter((b: any) => 
      b.is_active === true && 
      (b.payment_status === 'paid' || b.payment_status === 'grace' || 
       b.subscription_status === 'active' || b.subscription_status === 'grace')
    );
    
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');
    
    const businessesWithDistance = paidBusinesses.map((b: any) => {
      if (lat && lng && b.latitude && b.longitude) {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          b.latitude,
          b.longitude
        );
        return { ...b, distance };
      }
      return b;
    });
    
    if (lat && lng) {
      businessesWithDistance.sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));
    }
    
    const total = businessesWithDistance.length;
    const paginatedData = businessesWithDistance.slice(offset, offset + limit);
    
    return c.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return c.json({ error: 'Failed to fetch businesses' }, 500);
  }
});

// Get business by ID
app.get("/make-server-175b2872/kv/businesses/:id", async (c) => {
  try {
    c.header('Cache-Control', 'public, max-age=10, must-revalidate');
    
    const id = c.req.param('id');
    const business = await kv.get(`business:${id}`);
    
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const [allSpecials, allEvents, oldMenuItems, newMenuItems, reviews] = await Promise.all([
      kv.getByPrefix(`special:${id}:`),
      kv.getByPrefix(`event:`),
      kv.getByPrefix(`menu:${id}:`),
      kv.getByPrefix(`menu_item:${id}:`),
      kv.getByPrefix(`review:${id}:`)
    ]);
    
    const events = allEvents.filter((event: any) => event.business_id === id);
    const menuItems = [...(oldMenuItems || []), ...(newMenuItems || [])];
    
    return c.json({
      business: business,
      specials: allSpecials || [],
      events: events || [],
      menu_items: menuItems,
      reviews: reviews || [],
      fetched_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    return c.json({ error: 'Failed to fetch business' }, 500);
  }
});

// Update business
app.put("/make-server-175b2872/kv/business/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existingBusiness = await kv.get(`business:${id}`);
    if (!existingBusiness) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const updatedBusiness = {
      ...existingBusiness,
      name: body.name || existingBusiness.name,
      address: body.address || existingBusiness.address,
      city: body.city || existingBusiness.city,
      phone: body.phone || existingBusiness.phone,
      email: body.email || existingBusiness.email,
      description: body.description || existingBusiness.description,
      logo_url: body.logo_url !== undefined ? body.logo_url : existingBusiness.logo_url,
      cover_image_url: body.cover_image_url !== undefined ? body.cover_image_url : existingBusiness.cover_image_url,
      latitude: body.latitude !== undefined ? body.latitude : existingBusiness.latitude,
      longitude: body.longitude !== undefined ? body.longitude : existingBusiness.longitude,
      opening_hours: body.opening_hours !== undefined ? body.opening_hours : existingBusiness.opening_hours,
      avg_price_min: body.avg_price_min !== undefined ? body.avg_price_min : existingBusiness.avg_price_min,
      avg_price_max: body.avg_price_max !== undefined ? body.avg_price_max : existingBusiness.avg_price_max,
      cuisine_types: body.cuisine_types !== undefined ? body.cuisine_types : existingBusiness.cuisine_types,
      age_groups: body.age_groups !== undefined ? body.age_groups : existingBusiness.age_groups,
      is_active: body.is_active !== undefined ? body.is_active : existingBusiness.is_active,
      payment_status: body.payment_status !== undefined ? body.payment_status : existingBusiness.payment_status,
      subscription_status: body.subscription_status !== undefined ? body.subscription_status : existingBusiness.subscription_status,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`business:${id}`, updatedBusiness);
    
    console.log(`✅ Business ${id} updated successfully`);
    
    return c.json({ success: true, business: updatedBusiness });
  } catch (error) {
    console.error('❌ Error updating business:', error);
    return c.json({ error: 'Failed to update business' }, 500);
  }
});

// Delete business
app.delete("/make-server-175b2872/kv/business/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const business = await kv.get(`business:${id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    await kv.del(`business:${id}`);
    
    console.log(`✅ Business ${id} deleted successfully`);
    
    return c.json({ success: true, message: 'Business deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting business:', error);
    return c.json({ error: 'Failed to delete business' }, 500);
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all businesses (admin view - no filters)
app.get("/make-server-175b2872/admin/businesses", async (c) => {
  try {
    const allBusinesses = await kv.getByPrefix('business:');
    
    console.log(`📊 Admin fetching ${allBusinesses.length} businesses`);
    
    return c.json({ 
      businesses: allBusinesses,
      total: allBusinesses.length 
    });
  } catch (error) {
    console.error('❌ Error fetching businesses for admin:', error);
    return c.json({ error: 'Failed to fetch businesses' }, 500);
  }
});

// Get admin statistics
app.get("/make-server-175b2872/admin/stats", async (c) => {
  try {
    const allBusinesses = await kv.getByPrefix('business:');
    const allPayments = await kv.getByPrefix('payment:');
    const allReviews = await kv.getByPrefix('review:');
    const allSpecials = await kv.getByPrefix('special:');
    const allEvents = await kv.getByPrefix('event:');
    
    // Calculate stats
    const activeBusinesses = allBusinesses.filter((b: any) => b.is_active === true).length;
    const totalRevenue = allPayments
      .filter((p: any) => p.status === 'completed' || p.status === 'paid')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    const totalReviews = allReviews.length;
    const avgRating = totalReviews > 0 
      ? allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews 
      : 0;
    
    const positiveReviews = allReviews.filter((r: any) => r.rating >= 4).length;
    const neutralReviews = allReviews.filter((r: any) => r.rating === 3).length;
    const negativeReviews = allReviews.filter((r: any) => r.rating <= 2).length;
    
    const stats = {
      total_businesses: allBusinesses.length,
      active_businesses: activeBusinesses,
      total_revenue: totalRevenue,
      monthly_revenue: totalRevenue, // Simplified for now
      subscriptions_received: activeBusinesses,
      outstanding_subscriptions: 0,
      overdue_subscriptions: 0,
      pending_payment: 0,
      subscription_revenue: totalRevenue,
      
      total_reviews: totalReviews,
      avg_rating: avgRating,
      positive_reviews: positiveReviews,
      neutral_reviews: neutralReviews,
      negative_reviews: negativeReviews,
      sentiment_score: totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0,
      
      active_specials: allSpecials.length,
      active_events: allEvents.length,
      
      total_views: 0,
      total_clicks: 0,
      ctr: 0,
      engagement_rate: 0,
      call_clicks: 0,
      direction_clicks: 0,
      menu_views: 0,
      
      current_month_signups: 0,
      last_month_signups: 0,
      mom_growth_percentage: 0,
      mom_growth_positive: true,
      
      total_customers: 0,
      total_transactions: 0,
      pending_payouts: 0,
      paid_subscriptions: activeBusinesses
    };
    
    return c.json({ stats });
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Get all payments for admin
app.get("/make-server-175b2872/admin/payments", async (c) => {
  try {
    const allPayments = await kv.getByPrefix('payment:');
    
    return c.json({ 
      payments: allPayments,
      total: allPayments.length 
    });
  } catch (error) {
    console.error('❌ Error fetching payments for admin:', error);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
});

// ============================================
// BUSINESS DIAGNOSTIC & FIX ROUTES
// ============================================

// Diagnostic: Check all businesses visibility status
app.get("/make-server-175b2872/admin/diagnose-businesses", async (c) => {
  try {
    const allBusinesses = await kv.getByPrefix('business:');
    
    const diagnosis = {
      total_businesses: allBusinesses.length,
      visible_in_customer_app: 0,
      hidden_businesses: [],
      issues_found: []
    };
    
    allBusinesses.forEach((business: any) => {
      const isActive = business.is_active === true;
      const hasPaidStatus = business.payment_status === 'paid' || business.subscription_status === 'active';
      const isVisible = isActive && hasPaidStatus;
      
      if (isVisible) {
        diagnosis.visible_in_customer_app++;
      } else {
        diagnosis.hidden_businesses.push({
          id: business.id,
          name: business.name,
          is_active: business.is_active,
          payment_status: business.payment_status,
          subscription_status: business.subscription_status,
          issues: [
            !isActive ? 'Not active' : null,
            !hasPaidStatus ? 'Missing payment/subscription status' : null
          ].filter(Boolean)
        });
      }
    });
    
    diagnosis.issues_found = diagnosis.hidden_businesses.map((b: any) => 
      `${b.name}: ${b.issues.join(', ')}`
    );
    
    return c.json(diagnosis);
  } catch (error) {
    console.error('Error diagnosing businesses:', error);
    return c.json({ error: 'Failed to diagnose businesses' }, 500);
  }
});

// Fix: Make a business visible in customer app
app.post("/make-server-175b2872/admin/fix-business-visibility/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const business = await kv.get(`business:${id}`);
    
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Fix the business by ensuring all required fields are set
    const fixedBusiness = {
      ...business,
      is_active: true,
      payment_status: 'paid',
      subscription_status: 'active',
      subscription_plan: business.subscription_plan || 'standard',
      subscription_price: business.subscription_price || 499,
      next_payment_due: business.next_payment_due || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_payment_date: business.last_payment_date || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`business:${id}`, fixedBusiness);
    
    console.log(`✅ Fixed business visibility: ${fixedBusiness.name} (${id})`);
    
    return c.json({ 
      success: true, 
      message: `Business "${fixedBusiness.name}" is now visible in customer app`,
      business: fixedBusiness
    });
  } catch (error) {
    console.error('❌ Error fixing business visibility:', error);
    return c.json({ error: 'Failed to fix business visibility' }, 500);
  }
});

// Fix: Make ALL businesses visible (bulk fix)
app.post("/make-server-175b2872/admin/fix-all-businesses", async (c) => {
  try {
    const allBusinesses = await kv.getByPrefix('business:');
    let fixedCount = 0;
    
    for (const business of allBusinesses) {
      const needsFix = !business.is_active || 
                      (business.payment_status !== 'paid' && business.subscription_status !== 'active');
      
      if (needsFix) {
        const fixedBusiness = {
          ...business,
          is_active: true,
          payment_status: 'paid',
          subscription_status: 'active',
          subscription_plan: business.subscription_plan || 'standard',
          subscription_price: business.subscription_price || 499,
          next_payment_due: business.next_payment_due || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_payment_date: business.last_payment_date || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await kv.set(`business:${business.id}`, fixedBusiness);
        fixedCount++;
        console.log(`✅ Fixed: ${fixedBusiness.name}`);
      }
    }
    
    return c.json({ 
      success: true, 
      message: `Fixed ${fixedCount} businesses`,
      total_businesses: allBusinesses.length,
      fixed_count: fixedCount
    });
  } catch (error) {
    console.error('❌ Error fixing businesses:', error);
    return c.json({ error: 'Failed to fix businesses' }, 500);
  }
});

// Override: Manually set business visibility settings (for grace periods, etc.)
app.put("/make-server-175b2872/admin/businesses/:id/override-visibility", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const business = await kv.get(`business:${id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Apply the override settings
    const updatedBusiness = {
      ...business,
      is_active: body.is_active ?? business.is_active,
      payment_status: body.payment_status || business.payment_status,
      subscription_status: body.subscription_status || business.subscription_status,
      override_applied: true,
      override_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`business:${id}`, updatedBusiness);
    
    console.log(`✅ Override applied to business: ${updatedBusiness.name} (${id})`);
    console.log(`   - is_active: ${updatedBusiness.is_active}`);
    console.log(`   - payment_status: ${updatedBusiness.payment_status}`);
    console.log(`   - subscription_status: ${updatedBusiness.subscription_status}`);
    
    return c.json({ 
      success: true, 
      message: `Visibility override applied to \"${updatedBusiness.name}\"`,
      business: updatedBusiness
    });
  } catch (error) {
    console.error('❌ Error applying visibility override:', error);
    return c.json({ error: 'Failed to apply visibility override' }, 500);
  }
});

// ============================================
// AFFILIATE ROUTES
// ============================================

// Get all affiliates
app.get("/make-server-175b2872/affiliates", async (c) => {
  try {
    const allAffiliates = await kv.getByPrefix('affiliate:');
    return c.json({ affiliates: allAffiliates });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return c.json({ error: 'Failed to fetch affiliates' }, 500);
  }
});

// Register affiliate
app.post("/make-server-175b2872/affiliates/register", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, company, website, experience } = body;

    if (!name || !email || !phone) {
      return c.json({ error: 'Name, email, and phone are required' }, 400);
    }

    const existingAffiliates = await kv.getByPrefix('affiliate:');
    const emailExists = existingAffiliates.some((aff: any) => aff.email === email);
    
    if (emailExists) {
      return c.json({ error: 'Email already registered as affiliate' }, 400);
    }

    const namePrefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const year = new Date().getFullYear();
    let affiliateCode = `${namePrefix}${year}`;
    
    let codeExists = existingAffiliates.some((aff: any) => aff.code === affiliateCode);
    let counter = 1;
    while (codeExists) {
      affiliateCode = `${namePrefix}${year}${counter}`;
      codeExists = existingAffiliates.some((aff: any) => aff.code === affiliateCode);
      counter++;
    }

    const affiliateId = `AFF${Date.now()}`;
    const affiliate = {
      id: affiliateId,
      code: affiliateCode,
      name,
      email,
      phone,
      company: company || null,
      website: website || null,
      experience: experience || null,
      status: 'pending',
      total_referrals: 0,
      total_earnings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`affiliate:${affiliateId}`, affiliate);

    console.log(`✅ Affiliate registered: ${name} (${affiliateCode})`);

    return c.json({
      success: true,
      message: 'Application submitted! You will be notified once approved.',
      affiliate_id: affiliateId,
      code: affiliateCode
    });
  } catch (error) {
    console.error('Affiliate registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Update affiliate
app.put("/make-server-175b2872/affiliates/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const affiliate = await kv.get(`affiliate:${id}`);
    if (!affiliate) {
      return c.json({ error: 'Affiliate not found' }, 404);
    }
    
    const updatedAffiliate = {
      ...affiliate,
      status: body.status || affiliate.status,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`affiliate:${id}`, updatedAffiliate);
    
    console.log(`✅ Affiliate ${id} status updated to: ${updatedAffiliate.status}`);
    
    return c.json({ success: true, affiliate: updatedAffiliate });
  } catch (error) {
    console.error('Error updating affiliate:', error);
    return c.json({ error: 'Failed to update affiliate' }, 500);
  }
});

// Get affiliate dashboard
app.get("/make-server-175b2872/affiliates/:id/dashboard", async (c) => {
  try {
    const id = c.req.param('id');
    
    const affiliate = await kv.get(`affiliate:${id}`);
    if (!affiliate) {
      return c.json({ error: 'Affiliate not found' }, 404);
    }
    
    const allBusinesses = await kv.getByPrefix('business:');
    const referredBusinesses = allBusinesses.filter((b: any) => b.referred_by === id);
    
    const allCommissions = await kv.getByPrefix('commission:');
    const affiliateCommissions = allCommissions.filter((c: any) => c.affiliate_id === id);
    
    const pendingEarnings = affiliateCommissions
      .filter((c: any) => c.status === 'pending')
      .reduce((sum: number, c: any) => sum + c.amount, 0);
    
    const paidEarnings = affiliateCommissions
      .filter((c: any) => c.status === 'paid')
      .reduce((sum: number, c: any) => sum + c.amount, 0);
    
    return c.json({
      affiliate,
      stats: {
        total_referrals: referredBusinesses.length,
        active_referrals: referredBusinesses.filter((b: any) => b.is_active).length,
        pending_earnings: pendingEarnings,
        paid_earnings: paidEarnings,
        total_earnings: pendingEarnings + paidEarnings
      },
      referred_businesses: referredBusinesses,
      commissions: affiliateCommissions
    });
  } catch (error) {
    console.error('Error fetching affiliate dashboard:', error);
    return c.json({ error: 'Failed to fetch dashboard data' }, 500);
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

// Track business profile view
app.post("/make-server-175b2872/analytics/track-view", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id } = body;
    
    if (!business_id) {
      return c.json({ error: 'business_id is required' }, 400);
    }
    
    // Increment view count for the business
    const business = await kv.get(`business:${business_id}`);
    if (business) {
      business.total_views = (business.total_views || 0) + 1;
      await kv.set(`business:${business_id}`, business);
    }
    
    // Store view event for analytics
    const viewId = `view:${business_id}:${Date.now()}`;
    const viewEvent = {
      id: viewId,
      business_id,
      event_type: 'view',
      timestamp: new Date().toISOString()
    };
    
    await kv.set(viewId, viewEvent);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return c.json({ error: 'Failed to track view' }, 500);
  }
});

// Track ad/carousel click
app.post("/make-server-175b2872/analytics/track-click", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, click_type, user_email, source_page } = body;
    
    if (!business_id) {
      return c.json({ error: 'business_id is required' }, 400);
    }
    
    // Store click event for analytics
    const clickId = `click:${business_id}:${Date.now()}`;
    const clickEvent = {
      id: clickId,
      business_id,
      event_type: 'click',
      click_type: click_type || 'general',
      user_email: user_email || null,
      source_page: source_page || null,
      timestamp: new Date().toISOString()
    };
    
    await kv.set(clickId, clickEvent);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    return c.json({ error: 'Failed to track click' }, 500);
  }
});

// Get business analytics
app.get("/make-server-175b2872/analytics/business/:businessId", async (c) => {
  try {
    const businessId = c.req.param('businessId');
    
    const business = await kv.get(`business:${businessId}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Get all analytics events for this business
    const [views, clicks, reservations, reviews] = await Promise.all([
      kv.getByPrefix(`view:${businessId}:`),
      kv.getByPrefix(`click:${businessId}:`),
      kv.getByPrefix('reservation:'),
      kv.getByPrefix(`review:${businessId}:`)
    ]);
    
    const businessReservations = reservations.filter((r: any) => r.business_id === businessId);
    
    const totalViews = views.length;
    const totalClicks = clicks.length;
    const totalReservations = businessReservations.length;
    const confirmedReservations = businessReservations.filter((r: any) => r.status === 'confirmed').length;
    
    // Calculate CTR (Click-Through Rate) and conversion rate
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalReservations / totalClicks) * 100 : 0;
    
    return c.json({
      business_id: businessId,
      metrics: {
        total_views: totalViews,
        total_clicks: totalClicks,
        total_reservations: totalReservations,
        confirmed_reservations: confirmedReservations,
        total_reviews: reviews.length,
        average_rating: business.average_rating || 0,
        ctr: Math.round(ctr * 10) / 10,
        conversion_rate: Math.round(conversionRate * 10) / 10
      },
      views_trend: views.slice(-30), // Last 30 views
      clicks_trend: clicks.slice(-30) // Last 30 clicks
    });
  } catch (error) {
    console.error('Error fetching business analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Get platform analytics (admin)
app.get("/make-server-175b2872/analytics/platform", async (c) => {
  try {
    const [businesses, views, clicks, reservations, reviews] = await Promise.all([
      kv.getByPrefix('business:'),
      kv.getByPrefix('view:'),
      kv.getByPrefix('click:'),
      kv.getByPrefix('reservation:'),
      kv.getByPrefix('review:')
    ]);
    
    return c.json({
      total_businesses: businesses.length,
      total_views: views.length,
      total_clicks: clicks.length,
      total_reservations: reservations.length,
      total_reviews: reviews.length,
      active_businesses: businesses.filter((b: any) => b.is_active).length
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    return c.json({ error: 'Failed to fetch platform analytics' }, 500);
  }
});

// Get admin stats
app.get("/make-server-175b2872/analytics/stats", async (c) => {
  try {
    const [businesses, reservations, affiliates, commissions] = await Promise.all([
      kv.getByPrefix('business:'),
      kv.getByPrefix('reservation:'),
      kv.getByPrefix('affiliate:'),
      kv.getByPrefix('commission:')
    ]);

    const totalBusinesses = businesses.length;
    const activeBusinesses = businesses.filter((b: any) => 
      b.is_active === true && b.payment_status === 'paid'
    ).length;
    const pendingBusinesses = businesses.filter((b: any) => 
      b.payment_status === 'pending'
    ).length;

    const totalRevenue = reservations
      .filter((r: any) => r.status === 'confirmed')
      .reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0);

    const monthlyRevenue = reservations
      .filter((r: any) => {
        const reservationDate = new Date(r.created_at);
        const now = new Date();
        return r.status === 'confirmed' && 
               reservationDate.getMonth() === now.getMonth() &&
               reservationDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0);

    const subscriptionRevenue = businesses
      .filter((b: any) => b.payment_status === 'paid')
      .reduce((sum: number, b: any) => sum + (b.subscription_price || 499), 0);

    const totalAffiliates = affiliates.length;
    const activeAffiliates = affiliates.filter((a: any) => a.status === 'approved').length;
    const pendingCommissions = commissions
      .filter((c: any) => c.status === 'pending')
      .reduce((sum: number, c: any) => sum + c.amount, 0);

    const businessRevenue = new Map();
    reservations
      .filter((r: any) => r.status === 'confirmed')
      .forEach((r: any) => {
        const current = businessRevenue.get(r.business_id) || 0;
        businessRevenue.set(r.business_id, current + (parseFloat(r.amount) || 0));
      });

    const topBusinesses = Array.from(businessRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([businessId, revenue]) => {
        const business = businesses.find((b: any) => b.id === businessId);
        return {
          id: businessId,
          name: business?.name || 'Unknown',
          revenue: revenue,
          reservations: reservations.filter((r: any) => 
            r.business_id === businessId && r.status === 'confirmed'
          ).length
        };
      });

    return c.json({
      overview: {
        total_businesses: totalBusinesses,
        active_businesses: activeBusinesses,
        pending_businesses: pendingBusinesses,
        total_revenue: totalRevenue,
        monthly_revenue: monthlyRevenue,
        subscription_revenue: subscriptionRevenue,
        total_reservations: reservations.length,
        confirmed_reservations: reservations.filter((r: any) => r.status === 'confirmed').length
      },
      affiliates: {
        total: totalAffiliates,
        active: activeAffiliates,
        pending: affiliates.filter((a: any) => a.status === 'pending').length,
        pending: affiliates.filter((a: any) => a.status === 'pending').length,
        pending_commissions: pendingCommissions
      },
      top_businesses: topBusinesses,
      recent_activity: {
        new_businesses_this_month: businesses.filter((b: any) => {
          const created = new Date(b.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && 
                 created.getFullYear() === now.getFullYear();
        }).length,
        new_reservations_today: reservations.filter((r: any) => {
          const created = new Date(r.created_at);
          const today = new Date();
          return created.toDateString() === today.toDateString();
        }).length
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Get reconciliation data
app.get("/make-server-175b2872/analytics/reconciliation", async (c) => {
  try {
    const commissions = await kv.getByPrefix('commission:');

    const affiliateMap = new Map();
    
    for (const commission of commissions) {
      if (commission.status === 'pending') {
        if (!affiliateMap.has(commission.affiliate_id)) {
          affiliateMap.set(commission.affiliate_id, {
            affiliate_id: commission.affiliate_id,
            affiliate_name: commission.affiliate_name,
            commissions: [],
            total_amount: 0
          });
        }
        
        const affiliateData = affiliateMap.get(commission.affiliate_id);
        affiliateData.commissions.push(commission);
        affiliateData.total_amount += commission.amount;
      }
    }

    const pendingPayouts = Array.from(affiliateMap.values());

    return c.json({
      pending_payouts: pendingPayouts,
      total_pending: pendingPayouts.reduce((sum, p) => sum + p.total_amount, 0),
      commission_count: commissions.filter((c: any) => c.status === 'pending').length
    });
  } catch (error) {
    console.error('Error fetching reconciliation data:', error);
    return c.json({ error: 'Failed to fetch reconciliation data' }, 500);
  }
});

// Pay commissions
app.post("/make-server-175b2872/analytics/pay-commissions", async (c) => {
  try {
    const body = await c.req.json();
    const { commission_ids } = body;

    if (!commission_ids || !Array.isArray(commission_ids)) {
      return c.json({ error: 'Invalid commission_ids' }, 400);
    }

    const updatedCommissions = [];
    for (const commissionId of commission_ids) {
      const commission = await kv.get(commissionId);
      if (commission && commission.status === 'pending') {
        commission.status = 'paid';
        commission.paid_at = new Date().toISOString();
        await kv.set(commissionId, commission);
        updatedCommissions.push(commission);
      }
    }

    console.log(`✅ Marked ${updatedCommissions.length} commissions as paid`);

    return c.json({
      success: true,
      paid_count: updatedCommissions.length,
      commissions: updatedCommissions
    });
  } catch (error) {
    console.error('Error paying commissions:', error);
    return c.json({ error: 'Failed to process payments' }, 500);
  }
});

// ============================================
// RESERVATION ROUTES
// ============================================

// Track reservation
app.post("/make-server-175b2872/analytics/track-reservation", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      business_id, 
      customer_name, 
      customer_email, 
      customer_phone, 
      reservation_date, 
      reservation_time, 
      party_size,
      special_requests,
      preferred_channel
    } = body;

    // Validate required fields
    if (!business_id || !customer_email || !reservation_date || !reservation_time || !party_size) {
      console.error('Missing required fields:', { business_id, customer_email, reservation_date, reservation_time, party_size });
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const reservationId = `reservation:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    // Get business to calculate estimated amount
    const business = await kv.get(`business:${business_id}`);
    const priceRange = business?.price_range || '$$';
    
    // Calculate estimated spend based on price range
    const pricePerPerson = priceRange === '$' ? 150 : 
                           priceRange === '$$' ? 300 : 
                           priceRange === '$$$' ? 500 : 800;
    const estimatedAmount = parseInt(party_size) * pricePerPerson;
    
    const reservation = {
      id: reservationId,
      business_id,
      customer_name: customer_name || 'Guest',
      customer_email,
      customer_phone: customer_phone || '',
      reservation_date,
      reservation_time,
      party_size: parseInt(party_size),
      special_requests: special_requests || '',
      preferred_channel: preferred_channel || 'email',
      amount: estimatedAmount,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    await kv.set(reservationId, reservation);
    
    // Send confirmation notification
    try {
      await sendReservationConfirmation(reservation, business);
      await sendBusinessNotification(business_id, reservation);
    } catch (notificationError) {
      console.error('Failed to send reservation notifications:', notificationError);
      // Don't fail the reservation if notifications fail
    }

    console.log('✅ Reservation tracked:', reservationId);

    return c.json({ 
      success: true, 
      reservation_id: reservationId,
      reservation 
    });
  } catch (error) {
    console.error('Error tracking reservation:', error);
    return c.json({ error: 'Failed to track reservation' }, 500);
  }
});

// Get all reservations
app.get("/make-server-175b2872/analytics/reservations", async (c) => {
  try {
    const allReservations = await kv.getByPrefix('reservation:');
    
    allReservations.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ reservations: allReservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return c.json({ error: 'Failed to fetch reservations' }, 500);
  }
});

// Get user reservations
app.get("/make-server-175b2872/reservations/user/:email", async (c) => {
  try {
    const userEmail = decodeURIComponent(c.req.param('email'));
    
    const allReservations = await kv.getByPrefix('reservation:');
    const userReservations = allReservations.filter((r: any) => r.customer_email === userEmail);
    
    userReservations.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return c.json({ reservations: userReservations });
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    return c.json({ error: 'Failed to fetch reservations' }, 500);
  }
});

// Cancel reservation
app.post("/make-server-175b2872/reservations/:reservationId/cancel", async (c) => {
  try {
    const reservationId = c.req.param('reservationId');
    
    const reservation = await kv.get(reservationId);
    if (!reservation) {
      return c.json({ error: 'Reservation not found' }, 404);
    }
    
    reservation.status = 'cancelled';
    reservation.cancelled_at = new Date().toISOString();
    
    await kv.set(reservationId, reservation);
    
    console.log(`✅ Reservation cancelled: ${reservationId}`);
    
    return c.json({ success: true, reservation });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return c.json({ error: 'Failed to cancel reservation' }, 500);
  }
});

// ============================================
// SPECIALS & EVENTS
// ============================================

// Get all specials
app.get("/make-server-175b2872/kv/specials", async (c) => {
  try {
    const specials = await kv.getByPrefix('special:');
    return c.json({ data: specials });
  } catch (error) {
    console.error('Error fetching specials:', error);
    return c.json({ error: 'Failed to fetch specials' }, 500);
  }
});

// Get all events
app.get("/make-server-175b2872/kv/events", async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    return c.json({ data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Mark interest in an event
app.post("/make-server-175b2872/kv/events/:eventId/interest", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const body = await c.req.json();
    const { user_id, status, user_email, user_name, user_phone } = body;
    
    if (!user_id || !status) {
      return c.json({ error: 'user_id and status are required' }, 400);
    }
    
    // Create interest record
    const interestId = `event_interest:${eventId}:${user_id}`;
    const interest = {
      id: interestId,
      event_id: eventId,
      user_id,
      user_email: user_email || user_id,
      user_name: user_name || null,
      user_phone: user_phone || null,
      status, // 'interested' or 'going'
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await kv.set(interestId, interest);
    
    console.log(`✅ Event interest marked: ${eventId} - ${user_id} (${status})`);
    
    return c.json({ success: true, interest });
  } catch (error) {
    console.error('Error marking event interest:', error);
    return c.json({ error: 'Failed to mark event interest' }, 500);
  }
});

// Check if user is interested in an event
app.get("/make-server-175b2872/kv/events/:eventId/interest/:userId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const userId = decodeURIComponent(c.req.param('userId'));
    
    const interestId = `event_interest:${eventId}:${userId}`;
    const interest = await kv.get(interestId);
    
    if (!interest) {
      return c.json({ 
        interested: false, 
        status: null 
      });
    }
    
    return c.json({ 
      interested: true, 
      status: interest.status,
      interest
    });
  } catch (error) {
    console.error('Error checking event interest:', error);
    return c.json({ error: 'Failed to check event interest' }, 500);
  }
});

// Remove interest from an event
app.delete("/make-server-175b2872/kv/events/:eventId/interest/:userId", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const userId = decodeURIComponent(c.req.param('userId'));
    
    const interestId = `event_interest:${eventId}:${userId}`;
    await kv.del(interestId);
    
    console.log(`✅ Event interest removed: ${eventId} - ${userId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing event interest:', error);
    return c.json({ error: 'Failed to remove event interest' }, 500);
  }
});

// Get all interests for an event (for business/admin to see who's interested)
app.get("/make-server-175b2872/kv/events/:eventId/interests", async (c) => {
  try {
    const eventId = c.req.param('eventId');
    
    const allInterests = await kv.getByPrefix(`event_interest:${eventId}:`);
    
    const summary = {
      total: allInterests.length,
      going: allInterests.filter((i: any) => i.status === 'going').length,
      interested: allInterests.filter((i: any) => i.status === 'interested').length,
      interests: allInterests
    };
    
    return c.json(summary);
  } catch (error) {
    console.error('Error fetching event interests:', error);
    return c.json({ error: 'Failed to fetch event interests' }, 500);
  }
});

// Create special
app.post("/make-server-175b2872/kv/specials", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, title, description, discount_percentage, time_end, days_of_week } = body;
    
    if (!business_id || !title) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const specialId = `special:${business_id}:${Date.now()}`;
    const special = {
      id: specialId,
      business_id,
      title,
      description: description || '',
      discount_percentage: discount_percentage || 0,
      time_end: time_end || null,
      days_of_week: days_of_week || [],
      created_at: new Date().toISOString()
    };
    
    await kv.set(specialId, special);
    
    console.log(`✅ Special created: ${specialId}`);
    
    return c.json({ success: true, special });
  } catch (error) {
    console.error('Error creating special:', error);
    return c.json({ error: 'Failed to create special' }, 500);
  }
});

// Delete special
app.delete("/make-server-175b2872/kv/specials/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    console.log(`✅ Special deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting special:', error);
    return c.json({ error: 'Failed to delete special' }, 500);
  }
});

// ============================================
// MENU ROUTES
// ============================================

// Create menu item
app.post("/make-server-175b2872/kv/menu", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, name, category, price, description } = body;
    
    if (!business_id || !name || !price) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const menuItemId = `menu_item:${business_id}:${Date.now()}`;
    const menuItem = {
      id: menuItemId,
      business_id,
      name,
      category: category || 'Uncategorized',
      price: parseFloat(price),
      description: description || '',
      created_at: new Date().toISOString()
    };
    
    await kv.set(menuItemId, menuItem);
    
    console.log(`✅ Menu item created: ${menuItemId}`);
    
    return c.json({ success: true, menu_item: menuItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return c.json({ error: 'Failed to create menu item' }, 500);
  }
});

// Delete menu item
app.delete("/make-server-175b2872/kv/menu/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    console.log(`✅ Menu item deleted: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return c.json({ error: 'Failed to delete menu item' }, 500);
  }
});

// ============================================
// REVIEWS
// ============================================

// Submit review
app.post("/make-server-175b2872/kv/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, customer_name, customer_email, rating, comment } = body;
    
    if (!business_id || !customer_name || !rating) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const reviewId = `review:${business_id}:${Date.now()}`;
    const review = {
      id: reviewId,
      business_id,
      customer_name,
      customer_email: customer_email || '',
      rating: parseInt(rating),
      comment: comment || '',
      created_at: new Date().toISOString()
    };
    
    await kv.set(reviewId, review);
    
    const business = await kv.get(`business:${business_id}`);
    if (business) {
      const allReviews = await kv.getByPrefix(`review:${business_id}:`);
      const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;
      business.average_rating = Math.round(avgRating * 10) / 10;
      business.total_reviews = allReviews.length;
      await kv.set(`business:${business_id}`, business);
    }
    
    console.log(`✅ Review submitted: ${reviewId}`);
    
    return c.json({ success: true, review });
  } catch (error) {
    console.error('Error submitting review:', error);
    return c.json({ error: 'Failed to submit review' }, 500);
  }
});

// ============================================
// PLATFORM SETTINGS
// ============================================

// Get settings
app.get("/make-server-175b2872/platform/settings", async (c) => {
  try {
    const settings = await kv.get('platform:settings') || {
      monthly_subscription_fee: 499,
      affiliate_commission_percentage: 10,
      ml_insights_enabled: true,
      data_brokerage_enabled: true
    };
    return c.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Update settings
app.put("/make-server-175b2872/platform/settings", async (c) => {
  try {
    const body = await c.req.json();
    const currentSettings = await kv.get('platform:settings') || {};
    
    const updatedSettings = {
      ...currentSettings,
      ...body,
      updated_at: new Date().toISOString()
    };
    
    await kv.set('platform:settings', updatedSettings);
    
    console.log('✅ Platform settings updated:', updatedSettings);
    
    return c.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ============================================
// AI RECOMMENDATIONS
// ============================================

// Get recommendations
app.post("/make-server-175b2872/kv/recommendations", async (c) => {
  try {
    const body = await c.req.json();
    const { lat, lng, timeOfDay } = body;
    
    const specials = await kv.getByPrefix('special:');
    const businesses = await kv.getByPrefix('business:');
    
    const now = new Date();
    const activeSpecials = specials.filter((s: any) => {
      if (!s.time_end) return true;
      const endTime = new Date(`${now.toDateString()} ${s.time_end}`);
      return now < endTime;
    });
    
    const recommendations = activeSpecials.map((special: any) => {
      const business = businesses.find((b: any) => b.id === special.business_id);
      if (!business) return null;
      
      let score = 50;
      
      if (lat && lng && business.latitude && business.longitude) {
        const distance = calculateDistance(lat, lng, business.latitude, business.longitude);
        score += Math.max(0, 30 - distance * 2);
      }
      
      if (business.average_rating) {
        score += business.average_rating * 4;
      }
      
      if (special.discount_percentage) {
        score += special.discount_percentage / 2;
      }
      
      return {
        ...special,
        business,
        score,
        reason: generateRecommendationReason(timeOfDay || 'evening', false, score, special),
        tags: generateTags(special, score, timeOfDay || 'evening')
      };
    }).filter(Boolean);
    
    recommendations.sort((a: any, b: any) => b.score - a.score);
    
    return c.json({ recommendations: recommendations.slice(0, 10) });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return c.json({ error: 'Failed to generate recommendations' }, 500);
  }
});

// ============================================
// NOTIFICATION ROUTES
// ============================================

// Get notifications for a user
app.get("/make-server-175b2872/kv/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    // Sort by timestamp (newest first)
    notifications.sort((a: any, b: any) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    });
    
    const unreadCount = notifications.filter((n: any) => !n.read).length;
    
    return c.json({ 
      notifications,
      unread_count: unreadCount 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ 
      notifications: [], 
      unread_count: 0 
    });
  }
});

// Get unread notification count
app.get("/make-server-175b2872/kv/notifications/:userId/unread-count", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    const unreadCount = notifications.filter((n: any) => !n.read).length;
    
    return c.json({ unread_count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return c.json({ unread_count: 0 });
  }
});

// Mark notification as read
app.put("/make-server-175b2872/kv/notifications/:userId/:notificationId/read", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notificationId = c.req.param('notificationId');
    const key = `notification:${userId}:${notificationId}`;
    
    const notification = await kv.get(key);
    if (notification) {
      notification.read = true;
      notification.read_at = new Date().toISOString();
      await kv.set(key, notification);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// Mark all notifications as read
app.put("/make-server-175b2872/kv/notifications/:userId/read-all", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    
    // Update all unread notifications
    for (const notification of notifications) {
      if (!notification.read) {
        const key = `notification:${userId}:${notification.id}`;
        notification.read = true;
        notification.read_at = new Date().toISOString();
        await kv.set(key, notification);
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return c.json({ error: 'Failed to mark all notifications as read' }, 500);
  }
});

// Delete a notification
app.delete("/make-server-175b2872/kv/notifications/:userId/:notificationId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notificationId = c.req.param('notificationId');
    const key = `notification:${userId}:${notificationId}`;
    
    await kv.del(key);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return c.json({ error: 'Failed to delete notification' }, 500);
  }
});

// ============================================
// UTILITY ROUTES
// ============================================

// Health check
app.get("/make-server-175b2872/health", (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Re-seed database
app.post("/make-server-175b2872/reseed", async (c) => {
  if (seedingInProgress) {
    return c.json({ message: 'Seeding already in progress' }, 429);
  }

  try {
    seedingInProgress = true;
    console.log('🌱 Manual re-seed triggered');
    
    await supabase.from('kv_store_175b2872').delete().like('key', 'menu_item:%');
    await supabase.from('kv_store_175b2872').delete().like('key', 'menu:%');
    
    console.log('✅ Old menu items cleared');
    
    const result = await seedDatabase();
    
    return c.json({ 
      success: true,
      message: 'Database re-seeded successfully',
      ...result
    });
  } catch (error) {
    console.error('❌ Error re-seeding database:', error);
    return c.json({ error: 'Failed to re-seed database' }, 500);
  } finally {
    seedingInProgress = false;
  }
});

// ============================================
// START SERVER
// ============================================

console.log('🚀 MYVIBES API Server starting...');
console.log('✅ Consolidated single-file architecture');

// ============================================
// DATA MIGRATION ENDPOINT (Run once to migrate KV data to Postgres)
// ============================================
app.post("/make-server-175b2872/migrate-data", async (c) => {
  console.log('🔄 Starting data migration from KV to Postgres...');
  
  try {
    const migrationResult = await runMigration();
    
    return c.json({
      success: migrationResult.success,
      message: migrationResult.success 
        ? '✅ Migration completed successfully!' 
        : '⚠️ Migration completed with errors',
      ...migrationResult
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return c.json({ 
      success: false,
      error: 'Migration failed',
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);