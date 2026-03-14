import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';
import { seedDatabase } from './seed_data.tsx';
import { sendReservationConfirmation, sendBusinessNotification, sendEmail } from './notifications.tsx';
import { runMigration } from './migrate-kv-to-postgres.tsx';

const app = new Hono();

// ============================================
// MIDDLEWARE
// ============================================

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
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

// Generate UUID v4
function generateUUID(): string {
  return crypto.randomUUID();
}

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

// Helper: Sign business image URLs
async function signBusinessUrls(business: any) {
  if (!business) return business;
  
  const bucketName = 'make-175b2872-ads';
  let logo_url = business.logo_url;
  let cover_image_url = business.cover_image_url;
  
  // Sign Logo URL
  if (logo_url && logo_url.startsWith(`storage:${bucketName}:`)) {
     const path = logo_url.split(`storage:${bucketName}:`)[1];
     const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600 * 24); // 24 hours
     if (data?.signedUrl) logo_url = data.signedUrl;
  }
  
  // Sign Cover URL
  if (cover_image_url && cover_image_url.startsWith(`storage:${bucketName}:`)) {
     const path = cover_image_url.split(`storage:${bucketName}:`)[1];
     const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600 * 24); // 24 hours
     if (data?.signedUrl) cover_image_url = data.signedUrl;
  }
  
  return { ...business, logo_url, cover_image_url };
}

// Security Helper: Verify the authenticated user owns the business
// Returns the business object if authorized, throws error otherwise
async function verifyBusinessAccess(c: any, businessId: string) {
  // Allow test businesses for manual testing
  const TEST_IDS = ['palms', 'ocean-basket', 'marble', 'col-cacchio', 'tashas', 'nandos', 'karma', 'butchers-grill'];
  if (TEST_IDS.includes(businessId)) {
    console.log(`🔓 Allowing debug access to test business: ${businessId}`);
    let business = await kv.get(`business:${businessId}`);
    
    // If business doesn't exist in KV yet, return a mock so we can still add items
    if (!business) {
       business = { 
         id: businessId, 
         user_id: 'debug-user', 
         name: businessId.charAt(0).toUpperCase() + businessId.slice(1).replace('-', ' '),
         is_active: true
       };
    }
    
    return { user: { id: 'debug-user' }, business };
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Unauthorized: Invalid token');
  }

  // Fetch the business directly (Fast O(1) lookup)
  const business = await kv.get(`business:${businessId}`);
  if (!business) {
    throw new Error('Business not found');
  }

  // Strict ownership check
  if (business.user_id !== user.id) {
    console.error(`⛔ Access Denied: User ${user.id} tried to access business ${businessId} owned by ${business.user_id}`);
    throw new Error('Forbidden: You do not have permission to manage this business');
  }

  return { user, business };
}

// Security Helper: Verify the authenticated user owns the affiliate account (by email)
async function verifyAffiliateAccess(c: any, affiliateEmail: string) {
  // 1. Check Custom Session Header (Preferred for Partner Portal)
  const customToken = c.req.header('X-Session-Token');
  if (customToken && customToken.startsWith('sess_')) {
      const session = await kv.get(`session:${customToken}`);
      if (session && session.type === 'customer') {
          const customer = await kv.get(session.userId) || await kv.get(`customer:${session.userId}`);
          if (customer) {
               const emailMatch = (customer.email || '').toLowerCase().trim() === (affiliateEmail || '').toLowerCase().trim();
               if (emailMatch) {
                   console.log(`✅ verifyAffiliateAccess: Access granted for ${affiliateEmail} via X-Session-Token`);
                   return true;
               } else {
                   console.log(`⛔ verifyAffiliateAccess: Email mismatch in X-Session-Token. User: ${customer.email}, Affiliate: ${affiliateEmail}`);
               }
          }
      }
  }

  // 2. Fallback to Authorization Header (Supabase Auth or Legacy Custom Token in Auth Header)
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
      console.log('⛔ verifyAffiliateAccess: No Authorization header');
      return false;
  }
  const token = authHeader.replace('Bearer ', '');
  
  // 2a. Check Custom Session (sess_...) in Auth Header (Legacy/Direct Call)
  if (token.startsWith('sess_')) {
      const session = await kv.get(`session:${token}`);
      if (!session || session.type !== 'customer') {
          console.log(`⛔ verifyAffiliateAccess: Invalid or non-customer session for token ${token.substring(0, 10)}...`);
          return false;
      }
      
      // Fetch customer profile to verify email matches
      const customer = await kv.get(session.userId) || await kv.get(`customer:${session.userId}`);
      if (!customer) {
          console.log(`⛔ verifyAffiliateAccess: Customer profile not found for ID ${session.userId}`);
          return false;
      }
      
      const emailMatch = (customer.email || '').toLowerCase().trim() === (affiliateEmail || '').toLowerCase().trim();
      if (!emailMatch) {
          console.log(`⛔ verifyAffiliateAccess: Email mismatch. Session User: ${customer.email}, Affiliate: ${affiliateEmail}`);
      } else {
          console.log(`✅ verifyAffiliateAccess: Access granted for ${affiliateEmail} via Auth Header session`);
      }
      
      return emailMatch;
  }

  // 2b. Check Supabase Auth (Standard JWT)
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
      console.log(`⛔ verifyAffiliateAccess: Supabase Auth failed or invalid token`);
      return false;
  }
  
  // STRICT: Email must match
  const emailMatch = (user.email || '').toLowerCase().trim() === (affiliateEmail || '').toLowerCase().trim();
  if (!emailMatch) {
      console.log(`⛔ verifyAffiliateAccess: Supabase User Email mismatch. User: ${user.email}, Affiliate: ${affiliateEmail}`);
  } else {
      console.log(`✅ verifyAffiliateAccess: Access granted for ${affiliateEmail} via Supabase Auth`);
  }
  return emailMatch;
}

// Helper: Get business for a user (Optimized with Link Key)
async function getBusinessForUser(userId: string) {
  // 1. Try fast path: Look up the link key
  const linkKey = `link:user_business:${userId}`;
  const link = await kv.get(linkKey);

  if (link && link.businessId) {
    const business = await kv.get(`business:${link.businessId}`);
    if (business && business.user_id === userId) {
      return business;
    }
    // If business missing or ownership changed, fall through to slow path to self-heal
  }

  // 2. Slow path: Scan all businesses (Self-healing fallback)
  console.log(`⚠️ Cache miss for user ${userId}, scanning businesses...`);
  const allBusinesses = await kv.getByPrefix('business:');
  const business = allBusinesses.find((b: any) => b.user_id === userId);

  // 3. Update cache if found
  if (business) {
    await kv.set(linkKey, { businessId: business.id });
    console.log(`🔗 Created fast-lookup link for user ${userId} -> ${business.id}`);
  }

  return business;
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
      const trimmedCode = affiliate_code.toUpperCase().trim();
      
      const affiliates = await kv.getByPrefix('affiliate:');
      validAffiliate = affiliates.find(
        (aff: any) => aff.code === trimmedCode && aff.status === 'approved'
      );
      
      if (!validAffiliate) {
        return c.json({ error: 'Invalid or inactive affiliate code. Please check and try again.' }, 400);
      }
      
      console.log(`✅ Valid referral code: ${trimmedCode} - Partner: ${validAffiliate.name}`);
    }

    // Check email existence (This is still slow but acceptable for registration, 
    // ideally we'd have an email index)
    if (!supabase.auth.admin) {
      console.error('❌ Supabase Admin API not available. Check SUPABASE_SERVICE_ROLE_KEY.');
      return c.json({ error: 'Server configuration error: Auth Admin unavailable' }, 500);
    }

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { business_name, owner_name, phone }
    });

    if (authError) {
      // Clean handling for existing users without error spam
      if (authError.message?.includes('already been registered') || authError.code === 'email_exists') {
        return c.json({ error: 'This email is already registered. Please sign in instead.' }, 400);
      }
      
      console.error('❌ Auth error:', authError);
      return c.json({ error: authError.message || 'Failed to create account' }, 500);
    }

    // 2. Check for existing business (Dangling KV record recovery)
    const existingBusinesses = await kv.getByPrefix('business:');
    const existingBusiness = existingBusinesses.find((b: any) => b.email === email);
    
    // Use existing ID if recovering, else generate new UUID
    const businessId = existingBusiness ? existingBusiness.id : generateUUID();
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
      is_active: false,
      subscription_status: 'pending',
      payment_status: 'pending',
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

    // Store Business
    await kv.set(`business:${businessId}`, business);

    // OPTIMIZATION: Create Fast Link Key
    await kv.set(`link:user_business:${authData.user.id}`, { businessId: businessId });

    if (validAffiliate) {
      validAffiliate.total_referrals = (validAffiliate.total_referrals || 0) + 1;
      validAffiliate.total_business_referrals = (validAffiliate.total_business_referrals || 0) + 1;
      await kv.set(validAffiliate.id, validAffiliate);
      console.log(`💰 Partner ${validAffiliate.name} credited with BUSINESS referral. Total: ${validAffiliate.total_referrals} (${validAffiliate.total_business_referrals} business)`);
      
      // ✨ Create referral tracking with B- prefix on the ASSOCIATION ID
      const referralId = `referral:B-${businessId}`;
      await kv.set(referralId, {
        id: referralId,
        association_id: `B-${businessId}`, // ✨ B-prefix for business
        affiliate_id: validAffiliate.id,
        affiliate_code: validAffiliate.code,
        type: 'business',
        business_id: businessId,
        business_name: business_name,
        plan: selectedPlan,
        created_at: new Date().toISOString()
      });
    }

    return c.json({
      success: true,
      message: 'Business registered successfully!',
      business_id: businessId,
      payment_required: false
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return c.json({ error: `Registration failed: ${error.message || error}` }, 500);
  }
});

// ============================================
// CUSTOMER AUTH ROUTES
// ============================================

// Customer Sign In (Supports Supabase Auth & Custom Session)
app.get("/make-server-175b2872/auth/customer/me", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    let customerId;
    let customer;

    // 1. Check Custom Session (sess_...)
    if (token.startsWith('sess_')) {
      const session = await kv.get(`session:${token}`);
      if (!session || session.type !== 'customer') {
        return c.json({ error: 'Invalid session' }, 401);
      }
      customerId = session.userId;
      customer = await kv.get(customerId);
      
      // Fallback: Try prefixed if not found
      if (!customer && !customerId.startsWith('customer:')) {
          customer = await kv.get(`customer:${customerId}`);
      }
    } 
    // 2. Check Supabase Auth
    else {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return c.json({ error: 'Invalid token' }, 401);
      }
      customerId = user.id;
      // Fetch extended profile
      // Try prefixed first (standard for Supabase users)
      customer = await kv.get(`customer:${customerId}`);
      
      // Fallback: Try raw ID
      if (!customer) {
          customer = await kv.get(customerId);
      }
      
      // If first time via Supabase Auth, create a basic record
      if (!customer) {
        customer = {
          id: customerId,
          email: user.email,
          name: user.user_metadata?.name || '',
          mobile: user.user_metadata?.phone || '',
          username: user.email?.split('@')[0] || 'user'
        };
      }
    }

    if (!customer) return c.json({ error: 'User not found' }, 404);

    return c.json({ customer });
  } catch (error) {
    console.error('Customer auth check failed:', error);
    return c.json({ error: 'Auth check failed' }, 500);
  }
});

// Update Customer Profile (Supports Supabase Auth & Custom Session)
app.put("/make-server-175b2872/auth/customer/update", async (c) => {
  try {
    let token = c.req.header('X-Session-Token');
    let isCustomSession = false;

    // Fallback to Auth Header if no custom token
    if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader) token = authHeader.replace('Bearer ', '');
    }

    if (!token) return c.json({ error: 'Unauthorized' }, 401);
    
    // Ignore Anon Key if passed as token (it's just for gateway)
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    if (token === anonKey) {
        return c.json({ error: 'Unauthorized: Missing User Token' }, 401);
    }

    let customerId;

    console.log(`🔄 Update Profile Request - Token: ${token.substring(0, 10)}...`);

    // 1. Check Custom Session (sess_...)
    if (token.startsWith('sess_')) {
      const session = await kv.get(`session:${token}`);
      if (!session || session.type !== 'customer') {
        console.error('❌ Invalid session');
        return c.json({ error: 'Invalid session' }, 401);
      }
      customerId = session.userId;
      isCustomSession = true;
      console.log(`✅ Session Valid. Customer ID: ${customerId}`);
    }
    // 2. Check Supabase Auth
    else {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
         console.error('❌ Supabase Auth failed');
         return c.json({ error: 'Unauthorized' }, 401);
      }
      customerId = user.id;
      console.log(`✅ Supabase Auth Valid. Customer ID: ${customerId}`);
    }

    const body = await c.req.json();
    console.log(`📦 Update Body:`, JSON.stringify(body));

    // Fetch existing
    // Try raw ID first (works if ID is the Key, e.g. custom session users)
    let customer = await kv.get(customerId);
    console.log(`🔍 Lookup by raw ID '${customerId}': ${customer ? 'Found' : 'Not Found'}`);
    
    // If not found, try prepending 'customer:' (works if ID is UUID but Key has prefix, e.g. Supabase users)
    if (!customer) {
        console.log(`🔍 Trying prefix lookup 'customer:${customerId}'...`);
        customer = await kv.get(`customer:${customerId}`);
        console.log(`🔍 Lookup by prefix: ${customer ? 'Found' : 'Not Found'}`);
    }
    
    // Create if missing (should not happen usually but robust)
    if (!customer) {
      console.log('⚠️ Customer record missing, attempting recovery...');
      // If creating from scratch here, we might miss username if it wasn't provided
      // But for updates, we expect an existing user.
      // If Supabase Auth user, we can recover basics.
      if (!token.startsWith('sess_')) {
        const { data: { user } } = await supabase.auth.getUser(token);
        customer = {
            id: customerId,
            email: user?.email,
            username: user?.email?.split('@')[0] || 'user'
        };
        console.log('✅ Recovered Supabase user structure');
      } else {
         console.error('❌ Cannot recover guest user without record');
         return c.json({ error: 'Customer record missing' }, 404);
      }
    }

    // Update fields
    const updatedCustomer = {
      ...customer,
      name: body.name !== undefined ? body.name : customer.name,
      email: body.email !== undefined ? body.email : customer.email,
      mobile: body.mobile !== undefined ? body.mobile : customer.mobile,
      city: body.city !== undefined ? body.city : customer.city,
      birthday: body.birthday !== undefined ? body.birthday : customer.birthday,
      preferences: body.preferences !== undefined ? body.preferences : customer.preferences,
      notificationPreference: body.notificationPreference !== undefined ? body.notificationPreference : customer.notificationPreference,
      updated_at: new Date().toISOString()
    };
    
    // Determine storage key
    // If the ID itself starts with 'customer:', use it as key.
    // Otherwise, assume we need to prefix it.
    const storageKey = customerId.startsWith('customer:') ? customerId : `customer:${customerId}`;
    
    console.log(`💾 Saving to key: ${storageKey}`);

    // Ensure the ID inside the object matches the logic we want (optional but good)
    if (!updatedCustomer.id) {
        updatedCustomer.id = customerId;
    }

    await kv.set(storageKey, updatedCustomer);
    console.log('✅ Profile saved successfully');
    
    // Only update Supabase Auth metadata if it IS a Supabase Auth user
    if (!token.startsWith('sess_') && supabase.auth.admin) {
        try {
            await supabase.auth.admin.updateUserById(customerId, {
                user_metadata: { 
                    name: updatedCustomer.name,
                    phone: updatedCustomer.mobile,
                    city: updatedCustomer.city 
                }
            });
        } catch (e) {
            console.warn('⚠️ Failed to sync with Supabase Auth metadata', e);
        }
    }

    return c.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({ error: 'Update failed' }, 500);
  }
});

// ============================================
// PARTNER ROUTES (Renamed from Affiliate to avoid ad-blockers)
// ============================================

// Partner Registration
app.post("/make-server-175b2872/partners/register", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, bank_name, account_number, branch_code } = body;

    // Security & Profile Sync: Check for existing session to link
    const customToken = c.req.header('X-Session-Token');
    let sessionTokenToCheck = customToken;
    
    // Fallback: Check Auth header if no custom token
    if (!sessionTokenToCheck) {
        const authHeader = c.req.header('Authorization');
        if (authHeader) sessionTokenToCheck = authHeader.replace('Bearer ', '');
    }

    if (sessionTokenToCheck && sessionTokenToCheck.startsWith('sess_')) {
        const session = await kv.get(`session:${sessionTokenToCheck}`);
        if (session && session.type === 'customer') {
             // Fetch and update customer profile if email is missing
             let customer = await kv.get(session.userId) || await kv.get(`customer:${session.userId}`);
             if (customer && !customer.email) {
                 console.log(`🔗 Linking Partner Email ${email} to Guest Customer ${customer.username}`);
                 customer.email = email;
                 if (phone && !customer.mobile) customer.mobile = phone;
                 
                 // Save updated customer
                 const storageKey = session.userId.startsWith('customer:') ? session.userId : `customer:${session.userId}`;
                 await kv.set(storageKey, customer);
             }
        }
    }

    if (!name || !email) {
      return c.json({ error: 'Name and Email are required' }, 400);
    }

    // Check if email exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingAffiliates = await kv.getByPrefix('affiliate:');
    const existing = existingAffiliates.find((a: any) => (a.email || '').toLowerCase().trim() === normalizedEmail);

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (existing) {
        // If email already exists, just return it as success instead of error
        // This makes auto-join idempotent and robust against race conditions
        console.log(`♻️ Auto-join recovered existing partner: ${normalizedEmail}`);
        
        // Ensure we still generate/check session for existing user
        let authToken = c.req.header('Authorization')?.replace('Bearer ', '');
        let isNewSession = false;
        let sessionToken = '';
        
        if (!authToken || authToken === anonKey || authToken === 'undefined' || authToken === 'null') {
             const customers = await kv.getByPrefix('customer:');
             let customer = customers.find((c: any) => (c.email || '').toLowerCase().trim() === normalizedEmail);
             let customerId;
             
             if (!customer) {
                 customerId = generateUUID();
                 customer = {
                     id: customerId,
                     username: normalizedEmail.split('@')[0].replace(/[^a-z0-9]/g, ''),
                     name: existing.name,
                     email: normalizedEmail,
                     type: 'partner',
                     joined_at: new Date().toISOString()
                 };
                 await kv.set(customerId, customer);
             } else {
                 customerId = customer.id;
             }
             
             sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
             await kv.set(`session:${sessionToken}`, { userId: customerId, type: 'customer', created_at: new Date().toISOString() });
             isNewSession = true;
        }

        return c.json({ success: true, affiliate: existing, token: isNewSession ? sessionToken : undefined });
    }

    const affiliateId = `affiliate:${Date.now()}`;
    
    // ✨ NEW: Generate unified code (no B/C prefix yet - that's added during referral)
    // Format: FIRST3LETTERS + 4 RANDOM DIGITS
    const namePrefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const baseCode = `${namePrefix}${randomDigits}`;
    
    // Ensure code uniqueness
    let code = baseCode;
    let counter = 1;
    while (existingAffiliates.some((a: any) => a.code === code)) {
      code = `${namePrefix}${randomDigits + counter}`;
      counter++;
    }

    // Generate Session for New Partner if needed (Auto-Login)
    const now = new Date().toISOString();
    
    // Check if we already have a session
    let existingToken = c.req.header('X-Session-Token');
    if (!existingToken) {
        const authH = c.req.header('Authorization');
        if (authH) existingToken = authH.replace('Bearer ', '');
    }
    
    let isNewSession = false;
    let authToken = existingToken;
    // const anonKey is already defined above

    // Only generate new session if no token is provided OR token is invalid anon key/undefined
    if (!authToken || authToken === anonKey || authToken === 'undefined' || authToken === 'null') {
        // Find or Create Customer Account for Partner
        const customers = await kv.getByPrefix('customer:');
        let customer = customers.find((c: any) => c.email === email);
        let customerId;

        if (!customer) {
            customerId = generateUUID();
            customer = {
                id: customerId,
                username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
                name,
                email,
                mobile: phone || '',
                joined_at: now,
                last_active: now,
                type: 'partner'
            };
            await kv.set(customerId, customer);
        } else {
            customerId = customer.id;
        }
        
        // Generate Token
        const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        await kv.set(`session:${sessionToken}`, { userId: customerId, type: 'customer', created_at: now });
        authToken = sessionToken;
        isNewSession = true;
        console.log(`🔑 Created session for new partner: ${email} -> Token: ${authToken}`);
    }

    const newAffiliate = {
      id: affiliateId,
      name,
      email,
      phone,
      code, // ✨ Base code without prefix
      bank_details: {
          bank_name: bank_name || '',
          account_number: account_number || '',
          branch_code: branch_code || ''
      },
      status: 'approved',
      pending_balance: 0,
      total_earnings: 0,
      paid_earnings: 0,
      total_referrals: 0,
      total_customer_referrals: 0, // ✨ NEW: Track customer referrals separately
      total_business_referrals: 0, // ✨ NEW: Track business referrals separately
      app_downloads: 0,
      joined_at: new Date().toISOString()
    };

    await kv.set(affiliateId, newAffiliate);
    console.log(`✅ Partner registered with unified code: ${code} (can be used as C-${code} or B-${code})`);
    return c.json({ success: true, affiliate: newAffiliate, token: isNewSession ? authToken : undefined });
  } catch (error: any) {
    console.error('Partner registration error:', error);
    return c.json({ error: `Failed to register partner: ${error.message || error}` }, 500);
  }
});

// Get Partner by Email (Simple Login)
app.post("/make-server-175b2872/partners/login", async (c) => {
    try {
        const { email } = await c.req.json();
        
        let authToken = c.req.header('X-Session-Token');
        if (!authToken) {
             const h = c.req.header('Authorization');
             if (h) authToken = h.replace('Bearer ', '');
        }

        let isNewSession = false;
        let sessionToken = '';
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
        
        // Handle Guest/Unauthenticated Login
        if (!authToken || authToken === anonKey || authToken === 'undefined' || authToken === 'null') {
             const customers = await kv.getByPrefix('customer:');
             let customer = customers.find((c: any) => c.email === email);
             let customerId;
             
             if (!customer) {
                 // Create Basic Customer Record for Partner Login
                 customerId = generateUUID();
                 customer = {
                     id: customerId,
                     username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
                     name: email.split('@')[0],
                     email,
                     type: 'partner',
                     joined_at: new Date().toISOString()
                 };
                 await kv.set(customerId, customer);
             } else {
                 customerId = customer.id;
             }
             
             // Generate Session
             sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
             await kv.set(`session:${sessionToken}`, { userId: customerId, type: 'customer', created_at: new Date().toISOString() });
             isNewSession = true;
             console.log(`🔑 Generated login session for partner: ${email} -> ${sessionToken}`);
        } else if (authToken.startsWith('sess_')) {
            const session = await kv.get(`session:${authToken}`);
            if (session && session.type === 'customer') {
                 // Fetch customer profile
                 let customer = await kv.get(session.userId) || await kv.get(`customer:${session.userId}`);
                 if (customer && !customer.email) {
                     console.log(`🔗 Linking Partner Email ${email} to Guest Customer ${customer.username}`);
                     customer.email = email;
                     // Save updated customer
                     const storageKey = session.userId.startsWith('customer:') ? session.userId : `customer:${session.userId}`;
                     await kv.set(storageKey, customer);
                 }
            }
        }

        const affiliates = await kv.getByPrefix('affiliate:');
        const affiliate = affiliates.find((a: any) => a.email === email);
        
        if (!affiliate) return c.json({ error: 'Partner not found' }, 404);
        
        return c.json({ success: true, affiliate, token: isNewSession ? sessionToken : undefined });
    } catch (error: any) {
        console.error('Partner login error:', error);
        return c.json({ error: `Login failed: ${error.message || error}` }, 500);
    }
});

// Update Partner Bank Details
app.put("/make-server-175b2872/partners/:id/bank-details", async (c) => {
    try {
        const id = c.req.param('id');
        const { bank_name, account_number, branch_code } = await c.req.json();
        
        const affiliate = await kv.get(id);
        if (!affiliate) return c.json({ error: 'Partner not found' }, 404);
        
        // STRICT SECURITY: Must be logged in as the partner email owner
        if (!await verifyAffiliateAccess(c, affiliate.email)) {
             console.error(`⛔ Access Denied: Unauthorized bank details update for ${affiliate.email}`);
             return c.json({ error: 'Unauthorized: You must be logged in to update bank details' }, 401);
        }

        affiliate.bank_details = { bank_name, account_number, branch_code };
        await kv.set(id, affiliate);
        
        return c.json({ success: true, affiliate });
    } catch (error) {
        return c.json({ error: 'Update failed' }, 500);
    }
});

// Get Partner Commissions
app.get("/make-server-175b2872/partners/:id/commissions", async (c) => {
    try {
        const id = c.req.param('id');
        
        // Security Check: Verify ownership
        const affiliate = await kv.get(id);
        if (!affiliate) return c.json({ error: 'Partner not found' }, 404);
        
        if (!await verifyAffiliateAccess(c, affiliate.email)) {
            console.error(`⛔ Unauthorized commissions access for ${id}`);
            // Return empty list or error? Return error for security.
            return c.json({ error: 'Unauthorized', commissions: [] }, 401);
        }

        const commissions = await kv.getByPrefix('comm:');
        const myCommissions = commissions.filter((comm: any) => comm.affiliate_id === id);
        return c.json({ commissions: myCommissions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
    } catch (error) {
        return c.json({ error: 'Failed to fetch commissions' }, 500);
    }
});

// ✨ NEW: Get Partner Referral Analytics (B/C Association ID System)
app.get("/make-server-175b2872/partners/:id/referrals", async (c) => {
    try {
        const id = c.req.param('id');
        
        // Security Check: Verify ownership
        const affiliate = await kv.get(id);
        if (!affiliate) return c.json({ error: 'Partner not found' }, 404);
        
        if (!await verifyAffiliateAccess(c, affiliate.email)) {
            console.error(`⛔ Unauthorized referrals access for ${id}`);
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Get all referral tracking records (association IDs have B- or C- prefix)
        const allReferrals = await kv.getByPrefix('referral:');
        const myReferrals = allReferrals.filter((ref: any) => ref.affiliate_id === id);
        
        // Separate by association ID prefix
        const customerReferrals = myReferrals.filter((r: any) => 
          r.association_id && r.association_id.startsWith('C-')
        );
        const businessReferrals = myReferrals.filter((r: any) => 
          r.association_id && r.association_id.startsWith('B-')
        );
        
        // Calculate earnings by type
        const commissions = await kv.getByPrefix('comm:');
        const myCommissions = commissions.filter((comm: any) => comm.affiliate_id === id);
        
        const customerEarnings = myCommissions
          .filter((c: any) => c.type === 'Customer Download' || c.customer_id)
          .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
          
        const businessEarnings = myCommissions
          .filter((c: any) => c.type !== 'Customer Download' && !c.customer_id)
          .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
        
        // Get partner visits to referred businesses
        const allPartnerVisits = await kv.getByPrefix('partner_visit:');
        const myVisits = allPartnerVisits.filter((v: any) => v.affiliate_id === id);
        const totalBonusPoints = myVisits.reduce((sum: number, v: any) => sum + (v.bonus_points || 0), 0);
        
        return c.json({
          summary: {
            total_referrals: affiliate.total_referrals || 0,
            customer_referrals: affiliate.total_customer_referrals || 0,
            business_referrals: affiliate.total_business_referrals || 0,
            customer_earnings: customerEarnings,
            business_earnings: businessEarnings,
            universal_code: affiliate.code,
            partner_business_visits: myVisits.length,
            partner_visit_bonus_points: totalBonusPoints
          },
          referrals: {
            customers: customerReferrals.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ),
            businesses: businessReferrals.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          },
          partner_visits: myVisits.sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        });
    } catch (error) {
        console.error('Failed to fetch referrals:', error);
        return c.json({ error: 'Failed to fetch referrals' }, 500);
    }
});

// Admin: Get All Partners (Reconciliation)
app.get("/make-server-175b2872/admin/partners", async (c) => {
    try {
        const affiliates = await kv.getByPrefix('affiliate:');
        return c.json({ affiliates });
    } catch (error) {
        return c.json({ error: 'Failed to fetch partners' }, 500);
    }
});

// Admin: Mark Partner Paid
app.post("/make-server-175b2872/admin/partners/:id/pay", async (c) => {
    try {
        const id = c.req.param('id');
        const affiliate = await kv.get(id);
        if (!affiliate) return c.json({ error: 'Partner not found' }, 404);
        
        const amountToPay = affiliate.pending_balance;
        if (amountToPay <= 0) return c.json({ error: 'No pending balance' }, 400);
        
        // Update Affiliate
        affiliate.paid_earnings = (affiliate.paid_earnings || 0) + amountToPay;
        affiliate.pending_balance = 0;
        await kv.set(id, affiliate);
        
        // Record Payout Transaction
        const payoutId = `payout:${Date.now()}`;
        const payout = {
            id: payoutId,
            affiliate_id: id,
            amount: amountToPay,
            date: new Date().toISOString(),
            status: 'processed'
        };
        await kv.set(payoutId, payout);
        
        // Update Commissions to 'paid'
        const commissions = await kv.getByPrefix('comm:');
        const affiliateComms = commissions.filter((comm: any) => comm.affiliate_id === id && comm.status === 'pending');
        
        for (const comm of affiliateComms) {
            comm.status = 'paid';
            await kv.set(comm.id, comm);
        }
        
        return c.json({ success: true, affiliate, payout });
    } catch (error) {
        return c.json({ error: 'Payout failed' }, 500);
    }
});

// Admin: Batch Pay All Partners
app.post("/make-server-175b2872/admin/partners/pay-all", async (c) => {
    try {
        const affiliates = await kv.getByPrefix('affiliate:');
        const pendingAffiliates = affiliates.filter((a: any) => (a.pending_balance || 0) > 0 && a.bank_details?.bank_name);
        
        if (pendingAffiliates.length === 0) {
            return c.json({ message: 'No pending payouts to process' });
        }

        let totalPaid = 0;
        let count = 0;

        for (const affiliate of pendingAffiliates) {
            const amount = affiliate.pending_balance;
            
            // Update Affiliate
            affiliate.pending_balance = 0;
            affiliate.paid_earnings = (affiliate.paid_earnings || 0) + amount;
            affiliate.last_payout_date = new Date().toISOString();
            
            await kv.set(affiliate.id, affiliate);
            
            // Record Payout Transaction
            const payoutId = `payout:${Date.now()}_${count}`;
            const payout = {
                id: payoutId,
                business: 'Partner Payout Batch',
                affiliate_id: affiliate.id,
                amount: amount,
                type: 'Payout',
                status: 'Processed',
                date: new Date().toISOString(),
                recipient: affiliate.name
            };
            await kv.set(payoutId, payout);

            // Update Commissions
            const commissions = await kv.getByPrefix('comm:');
            const affiliateComms = commissions.filter((comm: any) => comm.affiliate_id === affiliate.id && comm.status === 'pending');
            for (const comm of affiliateComms) {
                comm.status = 'paid';
                await kv.set(comm.id, comm);
            }

            totalPaid += amount;
            count++;
        }

        return c.json({ success: true, count, totalPaid, message: `Successfully paid R${totalPaid} to ${count} partners` });
    } catch (error) {
        console.error('Batch payout error:', error);
        return c.json({ error: 'Batch payout failed' }, 500);
    }
});

// Process Monthly Subscription (Simulation)
app.post("/make-server-175b2872/admin/process-subscription", async (c) => {
    try {
        const { business_id, amount, is_promo } = await c.req.json();
        
        const business = await kv.get(business_id);
        if (!business) return c.json({ error: 'Business not found' }, 404);
        
        // Record Payment
        const paymentId = `pay:${Date.now()}`;
        const payment = {
            id: paymentId,
            business_id,
            business_name: business.name,
            amount,
            date: new Date().toISOString(),
            status: 'completed',
            type: 'Subscription'
        };
        await kv.set(paymentId, payment);
        
        // Handle Affiliate Commission
        let commission = null;
        if (business.referred_by && !is_promo && amount > 0) {
            const affiliate = await kv.get(business.referred_by);
            if (affiliate) {
                const commissionAmount = amount * 0.10;
                const commissionId = `comm:${Date.now()}`;
                commission = {
                    id: commissionId,
                    affiliate_id: affiliate.id,
                    business_id,
                    business_name: business.name,
                    amount: commissionAmount,
                    status: 'pending',
                    date: new Date().toISOString(),
                    type: 'Recurring Subscription'
                };
                await kv.set(commissionId, commission);
                
                affiliate.pending_balance = (affiliate.pending_balance || 0) + commissionAmount;
                affiliate.total_earnings = (affiliate.total_earnings || 0) + commissionAmount;
                await kv.set(affiliate.id, affiliate);
            }
        }
        
        return c.json({ success: true, payment, commission });
    } catch (error) {
        console.error('Processing failed', error);
        return c.json({ error: 'Processing failed' }, 500);
    }
});

// Admin Route: Seed Content
app.post("/make-server-175b2872/admin/seed-content", async (c) => {
  try {
    const body = await c.req.json();
    const { type, target_business_id, custom_data } = body;
    
    // Find a target business ID
    let businessId = target_business_id;
    if (!businessId) {
       const allBusinesses = await kv.getByPrefix('business:');
       // Try to find a demo business first
       const demo = allBusinesses.find((b: any) => b.name === 'Demo Business' || b.name === 'My Demo Venue');
       if (demo) {
         businessId = demo.id;
       } else if (allBusinesses.length > 0) {
         businessId = allBusinesses[0].id; // Fallback to first available
       } else {
         return c.json({ error: 'No businesses found to seed content into.' }, 404);
       }
    }
    
    console.log(`🌱 Seeding content of type '${type}' into business '${businessId}'`);
    
    let count = 0;
    
    if (type === 'menu' || type === 'bulk_menu') {
       let items = [];
       
       if (custom_data && Array.isArray(custom_data)) {
         items = custom_data;
       } else {
         items = type === 'menu' ? [
           { name: "Signature Vibe Burger", price: 120, description: "200g Wagyu beef patty, cheddar, caramelized onions, vibe sauce.", category: "Mains" },
           { name: "Loaded Fries", price: 65, description: "Crispy fries topped with cheese sauce, bacon bits, and jalapenos.", category: "Starters" },
           { name: "Vanilla Sky Shake", price: 45, description: "Classic vanilla milkshake with whipped cream and a cherry.", category: "Drinks" }
         ] : Array.from({ length: 20 }).map((_, i) => {
            const categories = ['Starters', 'Mains', 'Desserts', 'Drinks'];
            const category = categories[i % 4];
            return {
              name: `${category} Item ${i + 1}`,
              price: Math.floor(Math.random() * 200) + 40,
              description: `Delicious ${category.toLowerCase()} item prepared fresh daily.`,
              category
            };
         });
       }
       
       for (const item of items) {
          const itemId = item.id || `menu_item:${businessId}:${Date.now() + Math.random()}`;
          await kv.set(itemId, {
            id: itemId,
            business_id: businessId,
            ...item,
            image_url: item.image_url || null,
            created_at: new Date().toISOString()
          });
          count++;
       }
    } else if (type === 'specials' || type === 'bulk_specials') {
       let items = [];
       
       if (custom_data && Array.isArray(custom_data)) {
         items = custom_data;
       } else {
         items = type === 'specials' ? [
           { title: "Burger Tuesday", description: "Get 20% off all gourmet burgers every Tuesday.", discount_percentage: 20, days_of_week: [2] },
           { title: "Thirsty Thursday", description: "Half price on selected cocktails and drafts.", discount_percentage: 50, days_of_week: [4] },
           { title: "Family Feast", description: "Weekend combo: 2 large pizzas + 2 kids meals for R300.", discount_percentage: 15, days_of_week: [0, 6] }
         ] : [
           { title: "Date Night Special", description: "3-course meal for two including a bottle of wine.", discount_percentage: 10, days_of_week: [5] },
           { title: "Kids Eat Free", description: "One free kids meal with every adult main meal ordered.", discount_percentage: 100, days_of_week: [1, 3] },
           { title: "Pensioner Discount", description: "15% off total bill for pensioners (ID required).", discount_percentage: 15, days_of_week: [1, 2, 3, 4, 5] },
           { title: "Late Night Vibe", description: "2-for-1 shooters after 10 PM.", discount_percentage: 50, days_of_week: [5, 6] },
           { title: "Sunday Roast", description: "Traditional roast with all the trimmings.", discount_percentage: 0, days_of_week: [0] }
         ];
       }
       
       for (const item of items) {
          const specialId = item.id || generateUUID();
          await kv.set(specialId, {
            id: specialId,
            business_id: businessId,
            ...item,
            image_url: item.image_url || null,
            time_end: item.time_end || "22:00",
            created_at: new Date().toISOString(),
            view_count: item.view_count || 0
          });
          count++;
       }
    } else {
      return c.json({ error: 'Invalid seed type' }, 400);
    }
    
    return c.json({ success: true, message: `Successfully seeded ${type}`, count });
    
  } catch (error: any) {
    console.error('Seeding error:', error);
    return c.json({ error: `Seeding failed: ${error.message}` }, 500);
  }
});

// Business Sign In
app.post("/make-server-175b2872/auth/business/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    console.log('🔐 Business sign in attempt:', email);

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Auth error during sign in:', authError.message);
      
      // Provide more specific error messages
      if (authError.message?.includes('Invalid login credentials')) {
        return c.json({ 
          error: 'Invalid email or password. Please check your credentials and try again.' 
        }, 401);
      }
      
      if (authError.message?.includes('Email not confirmed')) {
        return c.json({ 
          error: 'Please verify your email address before signing in.' 
        }, 401);
      }
      
      return c.json({ 
        error: 'Sign in failed. Please try again or contact support.'
      }, 401);
    }
    
    console.log('✅ Auth successful for user:', authData.user.id);

    // OPTIMIZED: Use helper to find business (checks fast link first)
    const business = await getBusinessForUser(authData.user.id);

    if (!business) {
      console.error('❌ Business not found for user:', authData.user.id);
      return c.json({ error: 'Business account not found. Please register first.' }, 404);
    }

    console.log('✅ Business found:', business.id, business.name);

    const signedBusiness = await signBusinessUrls(business);

    return c.json({
      success: true,
      business_id: business.id,
      access_token: authData.session.access_token,
      business: signedBusiness
    });
  } catch (error: any) {
    console.error('❌ Sign in server error:', error);
    return c.json({ error: `Sign in failed: ${error.message || error}` }, 500);
  }
});

// Get current business (Optimized & Secure)
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

    // OPTIMIZED: Use helper
    const business = await getBusinessForUser(user.id);

    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }

    const signedBusiness = await signBusinessUrls(business);

    return c.json({ business: signedBusiness });
  } catch (error) {
    console.error('Auth verification error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// ============================================
// BUSINESS ROUTES
// ============================================

// Get all businesses (Public - Filtered)
app.get("/make-server-175b2872/kv/businesses", async (c) => {
  try {
    c.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    
    const allBusinesses = await kv.getByPrefix('business:');
    
    const isAdmin = c.req.query('admin') === 'true';

    const businessesToReturn = isAdmin ? allBusinesses : allBusinesses.filter((b: any) => 
      b.is_active === true && 
      (b.payment_status === 'paid' || b.payment_status === 'grace' || 
       b.subscription_status === 'active' || b.subscription_status === 'grace')
    );
    
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');
    const radius = parseFloat(c.req.query('radius') || '0');
    
    const businessesWithDistance = businessesToReturn.map((b: any) => {
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
    
    // Filter by radius if provided
    let filteredByDistance = businessesWithDistance;
    if (lat && lng && radius > 0) {
        filteredByDistance = businessesWithDistance.filter((b: any) => (b.distance || 0) <= radius);
    }

    if (lat && lng) {
      filteredByDistance.sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));
    }
    
    const total = filteredByDistance.length;
    const paginatedData = filteredByDistance.slice(offset, offset + limit);
    
    // Sign URLs for the paginated subset
    const signedData = await Promise.all(paginatedData.map(async (b: any) => await signBusinessUrls(b)));

    return c.json({
      data: signedData,
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

// Get business by ID (Public)
app.get("/make-server-175b2872/kv/businesses/:id", async (c) => {
  try {
    c.header('Cache-Control', 'public, max-age=10, must-revalidate');
    
    const id = c.req.param('id');
    const business = await kv.get(`business:${id}`);
    
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    const signedBusiness = await signBusinessUrls(business);

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
      business: signedBusiness,
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

// Update business (SECURED)
app.put("/make-server-175b2872/kv/business/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // SECURE: Verify ownership
    let existingBusiness;
    try {
      const result = await verifyBusinessAccess(c, id);
      existingBusiness = result.business;
    } catch (e: any) {
      return c.json({ error: e.message }, e.message.includes('found') ? 404 : 403);
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
    
    const signedBusiness = await signBusinessUrls(updatedBusiness);

    return c.json({ success: true, business: signedBusiness });
  } catch (error) {
    console.error('❌ Error updating business:', error);
    return c.json({ error: 'Failed to update business' }, 500);
  }
});

// Delete business (SECURED)
app.delete("/make-server-175b2872/kv/business/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    // SECURE: Verify ownership
    try {
      await verifyBusinessAccess(c, id);
    } catch (e: any) {
      return c.json({ error: e.message }, e.message.includes('found') ? 404 : 403);
    }
    
    await kv.del(`business:${id}`);
    // Also remove the link key if we can find it, but it's tricky without user ID handy
    // For now we leave the orphan link, it will just point to nothing, which is fine.
    
    console.log(`✅ Business ${id} deleted successfully`);
    
    return c.json({ success: true, message: 'Business deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting business:', error);
    return c.json({ error: 'Failed to delete business' }, 500);
  }
});

// ============================================
// RESOURCE ROUTES (Specials, Events, Menu, Reviews)
// ============================================

// --- SPECIALS ---

// Get all specials
app.get("/make-server-175b2872/kv/specials", async (c) => {
  try {
    const specials = await kv.getByPrefix('special:');
    return c.json({ specials });
  } catch (error) {
    console.error('Error fetching specials:', error);
    return c.json({ error: 'Failed to fetch specials' }, 500);
  }
});

// Create special
app.post("/make-server-175b2872/kv/specials", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id } = body;
    
    if (!business_id) {
      return c.json({ error: 'Business ID required' }, 400);
    }

    try {
      await verifyBusinessAccess(c, business_id);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    const specialId = generateUUID();
    const special = {
      ...body,
      id: specialId,
      created_at: new Date().toISOString(),
      view_count: 0
    };

    await kv.set(specialId, special);
    return c.json({ success: true, special });
  } catch (error) {
    console.error('Error creating special:', error);
    return c.json({ error: 'Failed to create special' }, 500);
  }
});

// Update special
app.put("/make-server-175b2872/kv/specials/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { business_id } = body;

    // Use business_id from body or extract from ID if possible, but body is safer for verify
    // Actually, verifyBusinessAccess needs business_id. The ID is `special:business_id:timestamp`.
    // We can extract business_id from the key if needed, or rely on body.
    // Let's rely on extracting from key to be safe against spoofing in body.
    const parts = id.split(':');
    if (parts.length < 2) {
       return c.json({ error: 'Invalid special ID format' }, 400);
    }
    const derivedBusinessId = parts[1]; // special:BUSINESS_ID:timestamp

    try {
      await verifyBusinessAccess(c, derivedBusinessId);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Special not found' }, 404);
    }

    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
    await kv.set(id, updated);
    return c.json({ success: true, special: updated });
  } catch (error) {
    console.error('Error updating special:', error);
    return c.json({ error: 'Failed to update special' }, 500);
  }
});

// Delete special
app.delete("/make-server-175b2872/kv/specials/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const parts = id.split(':');
    if (parts.length < 2) {
       return c.json({ error: 'Invalid special ID format' }, 400);
    }
    const derivedBusinessId = parts[1];

    try {
      await verifyBusinessAccess(c, derivedBusinessId);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting special:', error);
    return c.json({ error: 'Failed to delete special' }, 500);
  }
});

// --- EVENTS ---

// Get all events
app.get("/make-server-175b2872/kv/events", async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    return c.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Create event
app.post("/make-server-175b2872/kv/events", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id } = body;

    try {
      await verifyBusinessAccess(c, business_id);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    const eventId = `event:${Date.now()}`; // Events might not be namespaced by business in ID in previous code, but let's check. 
    // Previous code used `event:${id}` or something. Let's stick to simple IDs or namespaced.
    // Dashboard expects `id` to be returned.
    const event = {
      ...body,
      id: eventId,
      created_at: new Date().toISOString(),
      interested_count: 0
    };

    await kv.set(eventId, event);
    return c.json({ success: true, event });
  } catch (error) {
    console.error('Error creating event:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// Update event
app.put("/make-server-175b2872/kv/events/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existing = await kv.get(id); // For events, we need to fetch first to know business_id
    if (!existing) {
      return c.json({ error: 'Event not found' }, 404);
    }

    try {
      await verifyBusinessAccess(c, existing.business_id);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
    await kv.set(id, updated);
    return c.json({ success: true, event: updated });
  } catch (error) {
    console.error('Error updating event:', error);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

// Delete event
app.delete("/make-server-175b2872/kv/events/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Event not found' }, 404);
    }

    try {
      await verifyBusinessAccess(c, existing.business_id);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

// --- MENU ITEMS ---

// Get all menu items
app.get("/make-server-175b2872/kv/menu_items", async (c) => {
  try {
    const items = await kv.getByPrefix('menu_item:');
    return c.json({ menu_items: items });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return c.json({ error: 'Failed to fetch menu items' }, 500);
  }
});

// Create menu item
app.post("/make-server-175b2872/kv/menu_items", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id } = body;

    try {
      await verifyBusinessAccess(c, business_id);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    const itemId = `menu_item:${business_id}:${Date.now()}`;
    const item = {
      ...body,
      id: itemId,
      created_at: new Date().toISOString()
    };

    await kv.set(itemId, item);
    return c.json({ success: true, item });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return c.json({ error: 'Failed to create menu item' }, 500);
  }
});

// Update menu item
app.put("/make-server-175b2872/kv/menu_items/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Extract business_id from key
    const parts = id.split(':');
    // Expected: menu_item:BUSINESS_ID:timestamp
    if (parts.length < 3) {
       return c.json({ error: 'Invalid menu item ID format' }, 400);
    }
    const derivedBusinessId = parts[1];

    try {
      await verifyBusinessAccess(c, derivedBusinessId);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Menu item not found' }, 404);
    }

    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
    await kv.set(id, updated);
    return c.json({ success: true, item: updated });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return c.json({ error: 'Failed to update menu item' }, 500);
  }
});

// Delete menu item
app.delete("/make-server-175b2872/kv/menu_items/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const parts = id.split(':');
    if (parts.length < 3) {
       return c.json({ error: 'Invalid menu item ID format' }, 400);
    }
    const derivedBusinessId = parts[1];

    try {
      await verifyBusinessAccess(c, derivedBusinessId);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return c.json({ error: 'Failed to delete menu item' }, 500);
  }
});

// --- REVIEWS ---

// Submit a review
app.post("/make-server-175b2872/kv/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, user_name, rating, comment, user_phone, user_email } = body;

    if (!business_id || !rating || !comment) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const reviewId = `review:${business_id}:${Date.now()}`;
    const review = {
      id: reviewId,
      business_id,
      user_name: user_name || 'Anonymous',
      user_avatar: null,
      rating,
      comment,
      created_at: new Date().toISOString(),
      helpful_count: 0,
      user_phone: user_phone || null,
      user_email: user_email || null
    };

    await kv.set(reviewId, review);

    // Update business average rating
    try {
      const allReviews = await kv.getByPrefix(`review:${business_id}:`);
      const totalReviews = allReviews.length; // Includes the one we just added (kv.set is usually immediate in this context, or we just append)
      
      // Calculate new average
      // Note: KV might be eventually consistent, so let's use the local data + stored data
      // Filter out the one we just added to avoid double counting if it appears, or just recalculate
      // Actually simpler: fetch all, if it includes ours great, if not add it to calculation
      
      // Let's just trust the prefix scan returns it, or append it manually for calculation
      const reviewList = [...allReviews];
      if (!reviewList.find(r => r.id === reviewId)) {
        reviewList.push(review);
      }
      
      const sum = reviewList.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0);
      const avg = sum / reviewList.length;

      const business = await kv.get(`business:${business_id}`);
      if (business) {
        business.average_rating = Number(avg.toFixed(1));
        business.total_reviews = reviewList.length;
        await kv.set(`business:${business_id}`, business);
      }
    } catch (err) {
      console.error('Error updating business stats:', err);
      // Don't fail the request if stats update fails
    }

    return c.json({ success: true, review });
  } catch (error) {
    console.error('Error submitting review:', error);
    return c.json({ error: 'Failed to submit review' }, 500);
  }
});

// Get reviews for business
app.get("/make-server-175b2872/kv/reviews/:businessId", async (c) => {
  try {
    const businessId = c.req.param('businessId');
    // Reviews stored as review:BUSINESS_ID:REVIEW_ID
    const reviews = await kv.getByPrefix(`review:${businessId}:`);
    return c.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// Reply to review
app.post("/make-server-175b2872/kv/reviews/:reviewId/reply", async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    const body = await c.req.json();
    const { business_id, reply_text } = body;

    try {
      await verifyBusinessAccess(c, business_id);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    const existing = await kv.get(reviewId);
    if (!existing) {
      return c.json({ error: 'Review not found' }, 404);
    }

    const updated = {
      ...existing,
      business_reply: reply_text,
      business_reply_date: new Date().toISOString()
    };

    await kv.set(reviewId, updated);
    
    const whatsappLink = `https://wa.me/${existing.customer_mobile}?text=${encodeURIComponent(`Hi ${existing.customer_name}, thanks for your review! ${reply_text}`)}`;

    return c.json({ success: true, review: updated, whatsapp_link: whatsappLink });
  } catch (error) {
    console.error('Error replying to review:', error);
    return c.json({ error: 'Failed to reply to review' }, 500);
  }
});

// --- RECOMMENDATIONS ---

app.post("/make-server-175b2872/kv/recommendations", async (c) => {
  try {
    const body = await c.req.json();
    const { lat, lng, timeOfDay } = body;

    console.log('🤖 Generating recommendations (KV)...');

    // 1. Get all businesses and specials
    const allBusinesses = await kv.getByPrefix('business:');
    const allSpecials = await kv.getByPrefix('special:');
    
    // 2. Filter active businesses
    const activeBusinesses = allBusinesses.filter((b: any) => 
      b.is_active === true && 
      (b.payment_status === 'paid' || b.payment_status === 'grace' || 
       b.subscription_status === 'active' || b.subscription_status === 'grace')
    );
    
    // Map business ID to business object for easy lookup
    const businessMap = new Map();
    activeBusinesses.forEach((b: any) => businessMap.set(b.id, b));
    
    // 3. Filter valid specials
    const today = new Date().toISOString().split('T')[0];
    const validSpecials = allSpecials.filter((s: any) => {
      // Check if business exists and is active
      const parts = s.id.split(':'); // special:BUSINESS_ID:timestamp
      if (parts.length < 2) return false;
      
      // special object usually has business_id, fallback to ID extraction
      const bid = s.business_id || parts[1];
      
      if (!businessMap.has(bid)) return false;
      
      // Check date validity
      if (s.valid_until && s.valid_until < today) return false;
      
      return true;
    });

    if (validSpecials.length === 0) {
      return c.json({ recommendations: [] });
    }

    const recommendations = [];
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    // 4. Score specials
    for (const special of validSpecials) {
       let score = 50;
       
       // Get business
       const parts = special.id.split(':');
       const bid = special.business_id || parts[1];
       const business = businessMap.get(bid);
       if (!business) continue;

       // Time-based scoring
       const title = (special.title || '').toLowerCase();
       if (timeOfDay === 'morning' && title.includes('breakfast')) score += 30;
       if (timeOfDay === 'afternoon' && title.includes('lunch')) score += 30;
       if (timeOfDay === 'evening' && (title.includes('dinner') || title.includes('happy'))) score += 30;
       
       if (isWeekend && title.includes('weekend')) score += 20;
       
       if (special.discount_percentage) {
         score += Math.min(special.discount_percentage, 30);
       }
       
       // Location scoring if lat/lng provided
       if (lat && lng && business.latitude && business.longitude) {
         const distance = calculateDistance(lat, lng, business.latitude, business.longitude);
         if (distance < 5) score += 20;
         else if (distance < 10) score += 10;
         else if (distance > 50) score -= 20;
       }
       
       recommendations.push({
          id: special.id,
          business_id: business.id,
          business_name: business.name,
          business_logo: business.logo_url,
          business_city: business.city,
          business_type: business.business_type || 'restaurant',
          business_rating: business.average_rating || 0,
          special_title: special.title,
          special_description: special.description,
          special_image: special.image_url,
          discount_percentage: special.discount_percentage,
          valid_until: special.valid_until,
          score,
          reason: generateRecommendationReason(timeOfDay, isWeekend, score, special),
          tags: generateTags(special, score, timeOfDay)
       });
    }

    // 5. Sort and return
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, 10);
    
    // Sign URLs for the top recommendations
    const signedRecommendations = await Promise.all(topRecommendations.map(async (rec: any) => {
      let logo_url = rec.business_logo;
      let special_image = rec.special_image;
      const bucketName = 'make-175b2872-ads';
      
      if (logo_url && logo_url.startsWith(`storage:${bucketName}:`)) {
         const path = logo_url.split(`storage:${bucketName}:`)[1];
         const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600 * 24);
         if (data?.signedUrl) logo_url = data.signedUrl;
      }

      if (special_image && special_image.startsWith(`storage:${bucketName}:`)) {
         const path = special_image.split(`storage:${bucketName}:`)[1];
         const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600 * 24);
         if (data?.signedUrl) special_image = data.signedUrl;
      }
      
      return { ...rec, business_logo: logo_url, special_image };
    }));

    return c.json({
      recommendations: signedRecommendations,
      generated_at: new Date().toISOString(),
      count: signedRecommendations.length
    });

  } catch (error) {
    console.error('❌ Generate recommendations error:', error);
    return c.json({ error: 'Failed to generate recommendations' }, 500);
  }
});

// --- NOTIFICATIONS ---

// Get unread count
app.get("/make-server-175b2872/kv/notifications/:userId/unread-count", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    const unreadCount = notifications.filter((n: any) => !n.read).length;
    return c.json({ unread_count: unreadCount, count: unreadCount });
  } catch (error) {
    return c.json({ unread_count: 0, count: 0 });
  }
});

// Get notifications
app.get("/make-server-175b2872/kv/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notifications = await kv.getByPrefix(`notification:${userId}:`);
    return c.json({ notifications });
  } catch (error) {
    return c.json({ notifications: [] });
  }
});

// Mark notification as read
app.put("/make-server-175b2872/kv/notifications/:notificationId/read", async (c) => {
  try {
    const notificationId = c.req.param('notificationId');
    const notification = await kv.get(notificationId);
    if (notification) {
      notification.read = true;
      await kv.set(notificationId, notification);
    }
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to mark as read' }, 500);
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
    const allCustomers = await kv.getByPrefix('customer:');
    const allReservations = await kv.getByPrefix('reservation:');
    const allCheckIns = await kv.getByPrefix('checkin:');
    const allSpecialClicks = await kv.getByPrefix('special_click:');
    
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
      
      total_customers: allCustomers.length,
      total_transactions: 0,
      pending_payouts: 0,
      paid_subscriptions: activeBusinesses,
      
      // Reservation & Check-in Stats
      total_reservations: allReservations.length,
      total_checkins: allCheckIns.length,
      reservation_completion_rate: allReservations.length > 0 
        ? Math.round((allCheckIns.length / allReservations.length) * 100) 
        : 0,
      
      // Special Click Stats
      total_special_clicks: allSpecialClicks.length,
      // Match special clicks to reservations (within 24 hours)
      special_to_reservation_matches: (() => {
        let matches = 0;
        const MATCHING_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        allSpecialClicks.forEach((click: any) => {
          const clickTime = new Date(click.timestamp).getTime();
          const clickUserId = click.user_id;
          const clickUserEmail = click.user_email;
          const clickBusinessId = click.business_id;
          
          // Find if this user made a reservation within 24 hours after clicking
          const hasMatchingReservation = allReservations.some((rsv: any) => {
            const rsvTime = new Date(rsv.timestamp).getTime();
            const timeDiff = rsvTime - clickTime;
            
            // Check if reservation is within 24 hours after the click
            // AND matches the same business
            // AND matches the same user (by ID or email)
            return (
              timeDiff >= 0 && 
              timeDiff <= MATCHING_WINDOW &&
              rsv.businessId === clickBusinessId &&
              (rsv.userId === clickUserId || rsv.customerEmail === clickUserEmail)
            );
          });
          
          if (hasMatchingReservation) matches++;
        });
        
        return matches;
      })(),
      special_to_reservation_rate: allSpecialClicks.length > 0
        ? Math.round(((() => {
            let matches = 0;
            const MATCHING_WINDOW = 24 * 60 * 60 * 1000;
            allSpecialClicks.forEach((click: any) => {
              const clickTime = new Date(click.timestamp).getTime();
              const clickUserId = click.user_id;
              const clickUserEmail = click.user_email;
              const clickBusinessId = click.business_id;
              const hasMatchingReservation = allReservations.some((rsv: any) => {
                const rsvTime = new Date(rsv.timestamp).getTime();
                const timeDiff = rsvTime - clickTime;
                return (
                  timeDiff >= 0 && 
                  timeDiff <= MATCHING_WINDOW &&
                  rsv.businessId === clickBusinessId &&
                  (rsv.userId === clickUserId || rsv.customerEmail === clickUserEmail)
                );
              });
              if (hasMatchingReservation) matches++;
            });
            return matches;
          })() / allSpecialClicks.length) * 100)
        : 0
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
      message: 'Affiliate application submitted successfully!',
      affiliate_code: affiliateCode
    });
  } catch (error) {
    console.error('Affiliate registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Update affiliate code
app.post("/make-server-175b2872/affiliates/update-code", async (c) => {
  try {
    const body = await c.req.json();
    const { affiliate_id, new_code } = body;

    if (!affiliate_id || !new_code) {
      return c.json({ error: 'Affiliate ID and new code are required' }, 400);
    }

    const upperCode = new_code.toUpperCase().trim();

    // Check if new code already exists
    const existingAffiliates = await kv.getByPrefix('affiliate:');
    const codeExists = existingAffiliates.some((aff: any) => aff.code === upperCode && aff.id !== affiliate_id);
    
    if (codeExists) {
      return c.json({ error: 'Code already in use by another affiliate' }, 400);
    }

    // Get the affiliate
    const affiliate = await kv.get(affiliate_id);
    if (!affiliate) {
      return c.json({ error: 'Affiliate not found' }, 404);
    }

    const oldCode = affiliate.code;

    // Update the affiliate code
    affiliate.code = upperCode;
    affiliate.updated_at = new Date().toISOString();
    await kv.set(affiliate_id, affiliate);

    console.log(`✅ Affiliate code updated: ${oldCode} → ${upperCode} (${affiliate.name})`);

    return c.json({
      success: true,
      message: 'Affiliate code updated successfully',
      affiliate
    });
  } catch (error) {
    console.error('Error updating affiliate code:', error);
    return c.json({ error: 'Failed to update code' }, 500);
  }
});

// ============================================
// ADS MANAGEMENT ROUTES
// ============================================

// Get all ads (Admin)
app.get("/make-server-175b2872/ads/all", async (c) => {
  try {
    const ads = await kv.getByPrefix('ad:');
    
    // Sign URLs for admin view as well
    const bucketName = 'make-175b2872-ads';
    const signedAds = await Promise.all(ads.map(async (ad: any) => {
      let video_url = ad.video_url;
      let thumbnail_url = ad.thumbnail_url;
      
      if (video_url && video_url.startsWith(`storage:${bucketName}:`)) {
         const path = video_url.split(`storage:${bucketName}:`)[1];
         const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600);
         if (data?.signedUrl) video_url = data.signedUrl;
      }
      
      if (thumbnail_url && thumbnail_url.startsWith(`storage:${bucketName}:`)) {
         const path = thumbnail_url.split(`storage:${bucketName}:`)[1];
         const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600);
         if (data?.signedUrl) thumbnail_url = data.signedUrl;
      }
      
      return { ...ad, video_url, thumbnail_url };
    }));

    return c.json({ ads: signedAds.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return c.json({ error: 'Failed to fetch ads' }, 500);
  }
});

// Get approved ads (Public) - Includes Active Campaigns
app.get("/make-server-175b2872/ads/approved", async (c) => {
  try {
    const ads = await kv.getByPrefix('ad:');
    const approvedAds = ads.filter((ad: any) => ad.status === 'approved');
    
    // Fetch active campaigns
    const campaigns = await kv.getByPrefix('campaign:');
    const activeCampaigns = campaigns.filter((camp: any) => {
      // Include Active or Scheduled (if started)
      // For simplicity, just check if not "Ended"
      return camp.status !== 'Ended';
    });

    // Map campaigns to ad format
    const mappedCampaigns = activeCampaigns.map((camp: any) => {
      const isVideo = camp.media_url && (camp.media_url.match(/\.(mp4|mov|webm)/i));
      
      return {
        id: `camp-${camp.id}`,
        business_id: 'system',
        business_name: 'MYVIBES Official',
        platform: 'instagram', // Default to instagram style for now
        video_url: camp.media_url || '',
        title: camp.name,
        description: camp.message || '',
        thumbnail_url: !isVideo ? camp.media_url : '',
        status: 'approved',
        approved_at: camp.created_at,
        views: camp.reach || 0,
        clicks: camp.clicks || 0,
        is_campaign: true
      };
    });

    // Combine
    const allItems = [...approvedAds, ...mappedCampaigns];

    // Sign URLs
    const bucketName = 'make-175b2872-ads';
    const signedAds = await Promise.all(allItems.map(async (ad: any) => {
      let video_url = ad.video_url;
      let thumbnail_url = ad.thumbnail_url;
      
      if (video_url && video_url.startsWith(`storage:${bucketName}:`)) {
         const path = video_url.split(`storage:${bucketName}:`)[1];
         const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600);
         if (data?.signedUrl) video_url = data.signedUrl;
      }
      
      if (thumbnail_url && thumbnail_url.startsWith(`storage:${bucketName}:`)) {
         const path = thumbnail_url.split(`storage:${bucketName}:`)[1];
         const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600);
         if (data?.signedUrl) thumbnail_url = data.signedUrl;
      }
      
      return { ...ad, video_url, thumbnail_url };
    }));

    return c.json({ ads: signedAds.sort((a: any, b: any) => new Date(b.created_at || b.approved_at).getTime() - new Date(a.created_at || a.approved_at).getTime()) });
  } catch (error) {
    console.error('Error fetching approved ads:', error);
    return c.json({ error: 'Failed to fetch ads' }, 500);
  }
});

// Get ads for a specific business
app.get("/make-server-175b2872/ads/business/:id", async (c) => {
  try {
    const businessId = c.req.param('id');
    const ads = await kv.getByPrefix('ad:');
    const businessAds = ads.filter((ad: any) => ad.business_id === businessId);

    // Sign URLs
    const bucketName = 'make-175b2872-ads';
    const signedAds = await Promise.all(businessAds.map(async (ad: any) => {
      let video_url = ad.video_url;
      let thumbnail_url = ad.thumbnail_url;

      if (video_url && video_url.startsWith(`storage:${bucketName}:`)) {
         const path = video_url.split(`storage:${bucketName}:`)[1];
         const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600);
         if (data?.signedUrl) video_url = data.signedUrl;
      }

      if (thumbnail_url && thumbnail_url.startsWith(`storage:${bucketName}:`)) {
         const path = thumbnail_url.split(`storage:${bucketName}:`)[1];
         const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600);
         if (data?.signedUrl) thumbnail_url = data.signedUrl;
      }

      return { ...ad, video_url, thumbnail_url };
    }));

    return c.json({ ads: signedAds.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) });
  } catch (error) {
    console.error('Error fetching business ads:', error);
    return c.json({ error: 'Failed to fetch ads' }, 500);
  }
});

// Upload Media
app.post("/make-server-175b2872/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    const bucketName = 'make-175b2872-ads';
    
    // Create bucket if not exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === bucketName)) {
      await supabase.storage.createBucket(bucketName, { public: false });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      console.error('Storage upload error:', error);
      return c.json({ error: 'Upload failed' }, 500);
    }

    return c.json({ 
      success: true, 
      path: filePath,
      full_path: `storage:${bucketName}:${filePath}` 
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Upload Logo
app.post("/make-server-175b2872/businesses/:id/upload-logo", async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if business exists
    const business = await kv.get(`business:${id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }

    // Verify ownership
    try {
      await verifyBusinessAccess(c, id);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    const body = await c.req.parseBody();
    const file = body['logo'];
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No logo file uploaded' }, 400);
    }

    const bucketName = 'make-175b2872-ads'; // Using same bucket for simplicity
    
    // Create bucket if not exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === bucketName)) {
      await supabase.storage.createBucket(bucketName, { public: false });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      console.error('Storage upload error:', error);
      return c.json({ error: 'Upload failed' }, 500);
    }

    const fullPath = `storage:${bucketName}:${filePath}`;
    
    // Update business record
    const updatedBusiness = {
      ...business,
      logo_url: fullPath,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`business:${id}`, updatedBusiness);

    // Get signed URL for response
    const { data: signedData } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 3600 * 24 * 365); // 1 year

    return c.json({ 
      success: true, 
      logo_url: signedData?.signedUrl || fullPath,
      full_path: fullPath
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Upload Cover Image
app.post("/make-server-175b2872/businesses/:id/upload-cover", async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if business exists
    const business = await kv.get(`business:${id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }

    // Verify ownership
    try {
      await verifyBusinessAccess(c, id);
    } catch (e: any) {
      return c.json({ error: e.message }, 403);
    }

    const body = await c.req.parseBody();
    const file = body['cover'];
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No cover file uploaded' }, 400);
    }

    const bucketName = 'make-175b2872-ads';
    
    // Create bucket if not exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === bucketName)) {
      await supabase.storage.createBucket(bucketName, { public: false });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `cover_${id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      console.error('Storage upload error:', error);
      return c.json({ error: 'Upload failed' }, 500);
    }

    const fullPath = `storage:${bucketName}:${filePath}`;
    
    // Update business record
    const updatedBusiness = {
      ...business,
      cover_image_url: fullPath,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`business:${id}`, updatedBusiness);

    // Get signed URL for response
    const { data: signedData } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 3600 * 24 * 365); // 1 year

    return c.json({ 
      success: true, 
      cover_image_url: signedData?.signedUrl || fullPath,
      full_path: fullPath
    });

  } catch (error) {
    console.error('Cover upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Create Ad (Business)
app.post("/make-server-175b2872/ads", async (c) => {
  try {
    const body = await c.req.json();
    const { business_id, business_name, title, description, video_url, platform, thumbnail_url } = body;

    if (!business_id || !title || !video_url || !platform) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const adId = `ad:${Date.now()}`;
    const ad = {
      id: adId,
      business_id,
      business_name: business_name || 'Unknown Business',
      title,
      description: description || '',
      video_url,
      platform,
      thumbnail_url: thumbnail_url || null,
      status: 'pending',
      views: 0,
      clicks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(adId, ad);
    return c.json({ success: true, ad });
  } catch (error) {
    console.error('Error creating ad:', error);
    return c.json({ error: 'Failed to create ad' }, 500);
  }
});

// Approve Ad (Admin)
app.patch("/make-server-175b2872/ads/:id/approve", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { admin_name } = body;

    const ad = await kv.get(id);
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404);
    }

    const updatedAd = {
      ...ad,
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: admin_name || 'Admin',
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null,
      updated_at: new Date().toISOString()
    };

    await kv.set(id, updatedAd);
    return c.json({ success: true, ad: updatedAd });
  } catch (error) {
    console.error('Error approving ad:', error);
    return c.json({ error: 'Failed to approve ad' }, 500);
  }
});

// Reject Ad (Admin)
app.patch("/make-server-175b2872/ads/:id/reject", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { admin_name, reason } = body;

    const ad = await kv.get(id);
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404);
    }

    const updatedAd = {
      ...ad,
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: admin_name || 'Admin',
      rejection_reason: reason || 'Does not meet guidelines',
      approved_at: null,
      approved_by: null,
      updated_at: new Date().toISOString()
    };

    await kv.set(id, updatedAd);
    return c.json({ success: true, ad: updatedAd });
  } catch (error) {
    console.error('Error rejecting ad:', error);
    return c.json({ error: 'Failed to reject ad' }, 500);
  }
});

// ============================================
// CUSTOMER ROUTES
// ============================================

// ============================================
// CUSTOMER AUTH ROUTES (Username-based, No Password)
// ============================================

// Check if username exists
app.post("/make-server-175b2872/auth/customer/check-username", async (c) => {
  try {
    const { username } = await c.req.json();
    if (!username) return c.json({ error: 'Username is required' }, 400);

    const cleanUsername = username.toLowerCase().trim();
    const lookupKey = `customer_lookup:username:${cleanUsername}`;
    const existingId = await kv.get(lookupKey);

    return c.json({ exists: !!existingId });
  } catch (error) {
    return c.json({ error: 'Check failed' }, 500);
  }
});

// Recover Username
app.post("/make-server-175b2872/auth/customer/recover-username", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ error: 'Email is required' }, 400);

    const cleanEmail = email.toLowerCase().trim();
    
    // Scan for customer with this email
    // Note: In a production DB, this should use an index. For KV, we have to scan or maintain a reverse index.
    // For MVP/Prototype, scanning is acceptable if dataset is small, but let's try to be smart.
    // We didn't maintain an email index during registration, so we must scan.
    
    const allCustomers = await kv.getByPrefix('customer:');
    const customer = allCustomers.find((cust: any) => cust.email && cust.email.toLowerCase() === cleanEmail);

    if (customer) {
      const htmlMessage = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Username Recovery</h2>
          <p>Hi ${customer.name || 'there'},</p>
          <p>You requested your username for MYVIBES.</p>
          <p>Your username is: <strong>${customer.username}</strong></p>
          <p>You can use this to sign in at any time.</p>
          <p>Keep on vibing,<br>The MYVIBES Team</p>
        </body>
        </html>
      `;

      await sendEmail({
        to: customer.email,
        subject: 'Your MYVIBES Username',
        html: htmlMessage
      });
      
      console.log(`📧 Sent username recovery email to ${cleanEmail}`);
    } else {
       console.log(`⚠️ Username recovery requested for unknown email: ${cleanEmail}`);
    }

    // Always return success to prevent email enumeration
    return c.json({ 
      success: true, 
      message: 'If an account exists with this email, we have sent the username to you.' 
    });

  } catch (error) {
    console.error('Recovery error:', error);
    return c.json({ error: 'Recovery failed' }, 500);
  }
});

// Continue with Name (Guest/Quick Access)
app.post("/make-server-175b2872/auth/customer/continue-guest", async (c) => {
  try {
    const { name } = await c.req.json();
    
    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }

    // Guest flow - always create new or we can't track them without another identifier
    // We will generate a unique identifier
    const customerId = `customer:${Date.now()}`;
    const now = new Date().toISOString();
    
    // Format: guest_TIMESTAMP_RANDOM
    const username = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const email = `${username}@guest.myvibes.local`; // Placeholder

    const customer = {
      id: customerId,
      username,
      name,
      email,
      mobile: '',
      city: 'Johannesburg',
      notificationPreference: 'none',
      joined_at: now,
      last_active: now,
      status: 'active',
      total_orders: 0,
      total_spend: 0,
      loyalty_points: 0
    };

    await kv.set(customerId, customer);
    
    // Generate Session
    const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await kv.set(`session:${token}`, { userId: customerId, type: 'customer', created_at: now });

    console.log(`👤 Guest registered: ${name}`);

    return c.json({ 
      success: true, 
      token, 
      customer 
    });

  } catch (error) {
    console.error('Guest auth error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// Continue with Email (Register or Login)
app.post("/make-server-175b2872/auth/customer/continue-with-email", async (c) => {
  try {
    const { email, name } = await c.req.json();
    
    if (!email || !name) {
      return c.json({ error: 'Email and Name are required' }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    
    // 1. Try to find existing customer by email lookup
    const lookupKey = `customer_lookup:email:${cleanEmail}`;
    let customerId = null;
    let lookup = await kv.get(lookupKey);
    
    if (lookup && lookup.id) {
      customerId = lookup.id;
    } else {
      // 2. Fallback: Scan (Backward compatibility)
      const allCustomers = await kv.getByPrefix('customer:');
      const found = allCustomers.find((cust: any) => cust.email && cust.email.toLowerCase() === cleanEmail);
      
      if (found) {
        customerId = found.id;
        // Self-heal: Create lookup for next time
        await kv.set(lookupKey, { id: customerId });
      }
    }

    const now = new Date().toISOString();
    let customer;

    if (customerId) {
      // LOGIN EXISTING
      customer = await kv.get(customerId);
      if (!customer) {
        // Data inconsistency, treat as new? Or error? Let's treat as new to be safe/recover.
        customerId = null; 
      } else {
        // Update last active
        customer.last_active = now;
        if (name && (!customer.name || customer.name !== name)) {
           // Optional: Update name if provided and different? 
           // Maybe user wants to update their name. Let's update it.
           customer.name = name;
        }
        await kv.set(customer.id, customer);
        console.log(`👤 Customer logged in via email: ${cleanEmail}`);
      }
    }

    if (!customerId) {
      // REGISTER NEW
      customerId = `customer:${Date.now()}`;
      
      // Generate a username
      // Format: user_TIMESTAMP_RANDOM
      const username = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      customer = {
        id: customerId,
        username, // Placeholder username
        name,
        email: cleanEmail,
        mobile: '',
        city: 'Johannesburg', // Default
        notificationPreference: 'email',
        joined_at: now,
        last_active: now,
        status: 'active',
        total_orders: 0,
        total_spend: 0,
        loyalty_points: 0
      };

      await kv.set(customerId, customer);
      
      // Set Lookups
      await kv.set(lookupKey, { id: customerId });
      await kv.set(`customer_lookup:username:${username}`, { id: customerId });
      
      console.log(`👤 Customer registered via email: ${name} (${cleanEmail})`);
    }

    // Generate Session
    const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await kv.set(`session:${token}`, { userId: customerId, type: 'customer', created_at: now });

    return c.json({ 
      success: true, 
      token, 
      customer 
    });

  } catch (error) {
    console.error('Email auth error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// Register Customer
app.post("/make-server-175b2872/auth/customer/register", async (c) => {
  try {
    const { username, name, referral_code } = await c.req.json();
    
    if (!username || !name) {
      return c.json({ error: 'Username and Name are required' }, 400);
    }

    const cleanUsername = username.toLowerCase().trim();
    const lookupKey = `customer_lookup:username:${cleanUsername}`;
    
    // Check uniqueness
    const existingId = await kv.get(lookupKey);
    if (existingId) {
      return c.json({ error: 'Username is already taken' }, 400);
    }
    
    // ✨ Handle Referral / Influencer Code (universal code)
    let referredBy = null;
    let validAffiliate = null;
    
    if (referral_code) {
       const trimmedCode = referral_code.toUpperCase().trim();
       
       const affiliates = await kv.getByPrefix('affiliate:');
       validAffiliate = affiliates.find((a: any) => a.code === trimmedCode);
       if (validAffiliate) {
           referredBy = validAffiliate.id;
           console.log(`📢 Customer ${name} referred by Partner: ${validAffiliate.name} using code ${trimmedCode}`);
       }
    }

    const customerId = `customer:${Date.now()}`;
    const now = new Date().toISOString();

    const customer = {
      id: customerId,
      username: cleanUsername,
      name,
      email: '', // Optional details filled later
      mobile: '',
      city: 'Johannesburg',
      notificationPreference: 'email',
      joined_at: now,
      last_active: now,
      status: 'active',
      total_orders: 0,
      total_spend: 0,
      loyalty_points: 0,
      referred_by: referredBy,
      referral_code: referral_code ? referral_code.toUpperCase().trim() : null
    };

    // Store customer and lookup
    await kv.set(customerId, customer);
    await kv.set(lookupKey, { id: customerId });
    
    // ✨ Increment Influencer Stats (Customer Referral)
    if (validAffiliate) {
        // Get configurable download bounty
        const platformSettings = await getPlatformSettings();
        const DOWNLOAD_BOUNTY = platformSettings.rewards.customer_download_bounty;
        
        validAffiliate.app_downloads = (validAffiliate.app_downloads || 0) + 1;
        validAffiliate.total_referrals = (validAffiliate.total_referrals || 0) + 1;
        validAffiliate.total_customer_referrals = (validAffiliate.total_customer_referrals || 0) + 1;
        validAffiliate.pending_balance = (validAffiliate.pending_balance || 0) + DOWNLOAD_BOUNTY;
        validAffiliate.total_earnings = (validAffiliate.total_earnings || 0) + DOWNLOAD_BOUNTY;
        
        await kv.set(validAffiliate.id, validAffiliate);
        console.log(`📈 Partner ${validAffiliate.name} CUSTOMER referral counted. +R${DOWNLOAD_BOUNTY}. Total: ${validAffiliate.total_referrals} (${validAffiliate.total_customer_referrals} customers)`);
        
        // ✨ Record Commission Transaction
        const commissionId = `comm:${Date.now()}`;
        const commission = {
            id: commissionId,
            affiliate_id: validAffiliate.id,
            customer_id: customerId,
            customer_name: name,
            business_name: 'App Download',
            amount: DOWNLOAD_BOUNTY,
            status: 'pending',
            date: now,
            type: 'Customer Download',
            referral_code: validAffiliate.code
        };
        await kv.set(commissionId, commission);
        
        // ✨ Create referral tracking with C- prefix on the ASSOCIATION ID
        const referralId = `referral:C-${customerId}`;
        await kv.set(referralId, {
          id: referralId,
          association_id: `C-${customerId}`, // ✨ C-prefix for customer
          affiliate_id: validAffiliate.id,
          affiliate_code: validAffiliate.code,
          type: 'customer',
          customer_id: customerId,
          customer_name: name,
          created_at: now
        });
    }

    // Generate Session
    const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await kv.set(`session:${token}`, { userId: customerId, type: 'customer', created_at: now });

    console.log(`👤 Customer registered: ${name} (${cleanUsername})`);
    
    return c.json({ 
      success: true, 
      token, 
      customer 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Login Customer
app.post("/make-server-175b2872/auth/customer/login", async (c) => {
  try {
    const { username } = await c.req.json();
    
    if (!username) {
      return c.json({ error: 'Username is required' }, 400);
    }

    const cleanUsername = username.toLowerCase().trim();
    const lookupKey = `customer_lookup:username:${cleanUsername}`;
    
    const lookup = await kv.get(lookupKey);
    if (!lookup || !lookup.id) {
      return c.json({ error: 'Username not found' }, 404);
    }

    const customer = await kv.get(lookup.id);
    if (!customer) {
      return c.json({ error: 'Customer record missing' }, 404);
    }

    // Generate Session
    const now = new Date().toISOString();
    const token = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await kv.set(`session:${token}`, { userId: customer.id, type: 'customer', created_at: now });

    // Update last active
    customer.last_active = now;
    await kv.set(customer.id, customer);

    console.log(`👤 Customer logged in: ${cleanUsername}`);

    return c.json({ 
      success: true, 
      token, 
      customer 
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Create or Update Customer Profile (Sync with KV)
app.post("/make-server-175b2872/auth/customer/profile", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, mobile, city, notificationPreference, birthday, preferences } = body;

    if (!email || !name) {
      return c.json({ error: 'Email and Name are required' }, 400);
    }

    if (!mobile) {
      return c.json({ error: 'Mobile number is required' }, 400);
    }

    // Clean inputs
    const cleanEmail = email.toLowerCase().trim();
    const cleanMobile = mobile.trim();

    // Check if customer exists
    const existingCustomers = await kv.getByPrefix('customer:');
    let customer = existingCustomers.find((c: any) => c.email === cleanEmail);

    const now = new Date().toISOString();

    if (customer) {
      // Update existing - check if mobile is being changed to a duplicate
      if (cleanMobile !== customer.mobile) {
        const mobileExists = existingCustomers.find((c: any) => 
          c.mobile === cleanMobile && c.id !== customer.id
        );
        if (mobileExists) {
          return c.json({ 
            error: 'Mobile number already registered',
            field: 'mobile'
          }, 400);
        }
      }

      customer = {
        ...customer,
        name,
        mobile: cleanMobile,
        city: city || customer.city || 'Unknown',
        notificationPreference: notificationPreference || customer.notificationPreference || 'email',
        birthday: birthday || customer.birthday,
        preferences: preferences || customer.preferences,
        last_active: now,
        updated_at: now
      };
      // Key is likely the ID if created properly
      await kv.set(customer.id, customer);
    } else {
      // Create new - Check for duplicate email and mobile
      const emailExists = existingCustomers.find((c: any) => c.email === cleanEmail);
      if (emailExists) {
        return c.json({ 
          error: 'Email address already registered',
          field: 'email'
        }, 400);
      }

      const mobileExists = existingCustomers.find((c: any) => c.mobile === cleanMobile);
      if (mobileExists) {
        return c.json({ 
          error: 'Mobile number already registered',
          field: 'mobile'
        }, 400);
      }

      const customerId = `customer:${Date.now()}`;
      customer = {
        id: customerId,
        name,
        email: cleanEmail,
        mobile: cleanMobile,
        city: city || 'Johannesburg', // Default if not provided
        notificationPreference: notificationPreference || 'email',
        birthday: birthday || null,
        preferences: preferences || [],
        joined_at: now,
        last_active: now,
        status: 'active',
        total_orders: 0,
        total_spend: 0,
        loyalty_points: 0
      };
      await kv.set(customerId, customer);
    }

    console.log(`👤 Customer profile synced: ${name} (${cleanEmail})`);
    return c.json({ success: true, customer });
  } catch (error) {
    console.error('Error saving customer profile:', error);
    return c.json({ error: 'Failed to save customer profile' }, 500);
  }
});

// Get all customers (Admin)
app.get("/make-server-175b2872/admin/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix('customer:');
    return c.json({ customers: customers.sort((a: any, b: any) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()) });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return c.json({ error: 'Failed to fetch customers' }, 500);
  }
});

// Get customer analytics (Admin)
app.get("/make-server-175b2872/admin/customers/analytics", async (c) => {
  try {
    const customers = await kv.getByPrefix('customer:');
    
    const totalCustomers = customers.length;
    const totalSpend = customers.reduce((sum: number, c: any) => sum + (c.total_spend || 0), 0);
    const avgSpend = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
    const activeCustomers = customers.filter((c: any) => c.status === 'active').length;
    const inactiveCustomers = customers.filter((c: any) => c.status !== 'active').length;

    // City distribution
    const cityDistribution = customers.reduce((acc: any, c: any) => {
      acc[c.city] = (acc[c.city] || 0) + 1;
      return acc;
    }, {});

    // Top spenders
    const topSpenders = [...customers]
      .sort((a: any, b: any) => (b.total_spend || 0) - (a.total_spend || 0))
      .slice(0, 5);

    // Recent activity (mock logic for now, using last_active)
    const recentActivity = customers
      .filter((c: any) => {
        if (!c.last_active) return false;
        const lastActive = new Date(c.last_active);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActive >= thirtyDaysAgo;
      })
      .length;

    return c.json({
      analytics: {
        total_customers: totalCustomers,
        total_spend: totalSpend,
        average_spend: avgSpend,
        active_count: activeCustomers,
        inactive_count: inactiveCustomers,
        recent_activity_count: recentActivity,
        city_distribution: cityDistribution,
        top_spenders: topSpenders
      }
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    return c.json({ error: 'Failed to fetch customer analytics' }, 500);
  }
});

// Update customer (Admin)
app.put("/make-server-175b2872/admin/customers/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const customer = await kv.get(id);
    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    const updatedCustomer = {
      ...customer,
      name: body.name || customer.name,
      email: body.email || customer.email,
      mobile: body.mobile || customer.mobile,
      city: body.city || customer.city,
      status: body.status || customer.status,
      updated_at: new Date().toISOString()
    };

    await kv.set(id, updatedCustomer);
    
    return c.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return c.json({ error: 'Failed to update customer' }, 500);
  }
});

// Toggle Customer Status (Admin)
app.put("/make-server-175b2872/admin/customers/:id/status", async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!status || !['active', 'suspended', 'reviewing'].includes(status)) {
       return c.json({ error: 'Invalid status. Must be active, suspended, or reviewing.' }, 400);
    }

    const customer = await kv.get(id);
    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    customer.status = status;
    customer.updated_at = new Date().toISOString();

    await kv.set(id, customer);
    
    return c.json({ success: true, customer });
  } catch (error) {
    console.error('Error updating customer status:', error);
    return c.json({ error: 'Failed to update status' }, 500);
  }
});

// Delete Customer (Admin)
app.delete("/make-server-175b2872/admin/customers/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const customer = await kv.get(id);
    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    // Delete the customer from the KV store
    await kv.del(id);
    
    return c.json({ 
      success: true, 
      message: 'Customer deleted successfully',
      deletedCustomer: customer 
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return c.json({ error: 'Failed to delete customer' }, 500);
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

// Track ad/carousel click
app.post("/make-server-175b2872/analytics/track-click", async (c) => {
  try {
    const body = await c.req.json();
    // Support both camelCase and snake_case for robustness
    const businessId = body.businessId || body.business_id;
    const clickType = body.clickType || body.click_type;
    const userEmail = body.userEmail || body.user_email || 'anonymous';
    const sourcePage = body.sourcePage || body.source_page || 'unknown';

    if (!businessId || !clickType) {
      console.error('❌ Track click missing fields. Received:', body);
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // 1. Store individual click event
    const eventId = `click:${Date.now()}:${Math.random().toString(36).substr(2, 5)}`;
    const event = {
      id: eventId,
      businessId,
      type: clickType, // 'carousel', 'ad', 'profile'
      userEmail,
      sourcePage,
      timestamp: new Date().toISOString()
    };
    await kv.set(eventId, event);

    // 2. Update Business Stats
    const business = await kv.get(businessId);
    if (business) {
      business.total_views = (business.total_views || 0) + 1;
      
      // Weekly stats tracking (simplified)
      const today = new Date().toISOString().split('T')[0];
      if (!business.daily_stats) business.daily_stats = {};
      business.daily_stats[today] = (business.daily_stats[today] || 0) + 1;

      await kv.set(businessId, business);
    }

    return c.json({ success: true, eventId });
  } catch (error) {
    console.error('Analytics error:', error);
    return c.json({ error: 'Failed to track click' }, 500);
  }
});

// Track reservation request
app.post("/make-server-175b2872/analytics/track-reservation", async (c) => {
  try {
    const body = await c.req.json();
    
    // Extract fields matching api.ts structure
    const businessId = body.business_id || body.businessId;
    const userId = body.user_id || body.userId;
    const customerName = body.customer_name || body.customerName;
    const customerEmail = body.customer_email || body.customerEmail;
    const partySize = body.party_size || body.partySize || body.pax;
    const reservationDate = body.reservation_date || body.reservationDate || body.date;
    const reservationTime = body.reservation_time || body.reservationTime;
    
    if (!businessId || !customerName) {
         return c.json({ error: 'Missing required fields' }, 400);
    }

    const eventId = `rsv:${Date.now()}`;
    const event = {
      id: eventId,
      businessId,
      userId,
      customerName,
      customerEmail,
      partySize,
      reservationDate,
      reservationTime,
      timestamp: new Date().toISOString(),
      status: 'pending' // pending, confirmed, cancelled
    };
    await kv.set(eventId, event);
    
    // Also add to business specific reservation list if needed in future
    // For now, just tracking the event

    return c.json({ success: true, reservationId: eventId });
  } catch (error) {
    console.error('Reservation track error:', error);
    return c.json({ error: 'Failed to track reservation' }, 500);
  }
});

// Track special click
app.post("/make-server-175b2872/analytics/track-special-click", async (c) => {
  try {
    const body = await c.req.json();
    
    const specialId = body.special_id || body.specialId;
    const businessId = body.business_id || body.businessId;
    const userId = body.user_id || body.userId;
    const userEmail = body.user_email || body.userEmail || 'anonymous';
    
    if (!specialId || !businessId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Record the click event
    const clickEventId = generateUUID();
    const clickEvent = {
      id: clickEventId,
      special_id: specialId,
      business_id: businessId,
      user_id: userId || null,
      user_email: userEmail,
      timestamp: new Date().toISOString()
    };
    await kv.set(clickEventId, clickEvent);
    
    // Update special's click count
    const special = await kv.get(specialId);
    if (special) {
      special.click_count = (special.click_count || 0) + 1;
      await kv.set(specialId, special);
    }

    return c.json({ success: true, clickEventId });
  } catch (error) {
    console.error('Special click track error:', error);
    return c.json({ error: 'Failed to track special click' }, 500);
  }
});

// Get User Reservations
app.get("/make-server-175b2872/reservations/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Get all reservations
    const allReservations = await kv.getByPrefix('rsv:');
    
    // Filter by userId - we need to match userId from customerName or a dedicated user_id field
    // For now, let's add user_id to the reservation tracking
    const userReservations = allReservations.filter((rsv: any) => rsv.userId === userId);
    
    // Transform to match frontend interface
    const formattedReservations = await Promise.all(
      userReservations.map(async (rsv: any) => {
        // Get business details
        const business = await kv.get(`business:${rsv.businessId}`);
        const signedBusiness = await signBusinessUrls(business);
        
        return {
          id: rsv.id,
          venue_id: rsv.businessId,
          venue_name: signedBusiness?.name || rsv.businessId,
          venue_location: signedBusiness?.address || '',
          guest_count: rsv.partySize || 1,
          date: rsv.reservationDate,
          time: rsv.reservationTime,
          status: rsv.status || 'pending',
          created_at: rsv.timestamp
        };
      })
    );

    return c.json(formattedReservations);
  } catch (error) {
    console.error('Failed to fetch user reservations:', error);
    return c.json({ error: 'Failed to fetch reservations' }, 500);
  }
});

// Get Business Analytics
app.get("/make-server-175b2872/analytics/business/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const clicks = await kv.getByPrefix('click:');
    const businessClicks = clicks.filter((clk: any) => clk.businessId === id);
    
    // Aggregate by type
    const byType = businessClicks.reduce((acc: any, curr: any) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {});

    return c.json({ 
      total_clicks: businessClicks.length,
      breakdown: byType,
      recent_events: businessClicks.slice(-20) 
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// ============================================
// UTILITY ROUTES
// ============================================

// Geocode Address
app.post("/make-server-175b2872/geocode", async (c) => {
  try {
    const { address, city, country } = await c.req.json();
    
    if (!address || !city) {
      return c.json({ error: 'Address and city are required' }, 400);
    }
    
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('❌ GOOGLE_MAPS_API_KEY not found in environment');
      return c.json({ error: 'Server configuration error: Geocoding API key missing' }, 500);
    }
    
    const fullAddress = `${address}, ${city}, ${country || 'South Africa'}`;
    console.log(`🗺️ Geocoding address: ${fullAddress}`);
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const formatted_address = data.results[0].formatted_address;
      
      console.log(`✅ Geocode success: ${formatted_address} (${location.lat}, ${location.lng})`);
      
      return c.json({
        success: true,
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: formatted_address,
        place_id: data.results[0].place_id
      });
    } else {
      console.error(`❌ Geocode failed: ${data.status} - ${data.error_message || ''}`);
      return c.json({ error: `Geocoding failed: ${data.status}`, details: data.error_message }, 400);
    }
    
  } catch (error) {
    console.error('Geocoding error:', error);
    return c.json({ error: 'Geocoding failed due to server error' }, 500);
  }
});

// ============================================
// PLATFORM SETTINGS ROUTES
// ============================================

// Helper: Get platform settings with defaults
async function getPlatformSettings() {
  let settings = await kv.get('platform:settings');
  
  if (!settings) {
    // Default configuration
    settings = {
      rewards: {
        // Customer Referral Settings
        customer_download_bounty: 20, // R20 per download (immediate)
        customer_checkin_threshold: 100, // Every 100 check-ins = 1 customer reward
        customer_checkin_reward: 200, // R200 reward per threshold reached
        
        // Business Referral Settings
        business_subscription_commission_percentage: 15, // 15% of subscription price
        business_recurring_commission: true, // Pay partner every time business pays
        
        // Partner Visit Bonuses
        partner_visit_bonus_points: 50, // Points when visiting referred business
        
        // General Settings
        checkin_points: 10, // Points per check-in
        checkin_cooldown_hours: 1 // Hours before next check-in allowed
      },
      updated_at: new Date().toISOString()
    };
    
    // Save defaults
    await kv.set('platform:settings', settings);
    console.log('✅ Created default platform settings');
  }
  
  return settings;
}

// Get Platform Settings
app.get("/make-server-175b2872/settings", async (c) => {
  try {
    const settings = await getPlatformSettings();
    return c.json({ config: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Save Platform Settings
app.post("/make-server-175b2872/settings", async (c) => {
  try {
    const { config } = await c.req.json();
    
    if (!config) {
      return c.json({ error: 'Configuration is required' }, 400);
    }

    await kv.set('platform:settings', config);
    console.log('✅ Platform settings updated');
    
    return c.json({ success: true, config });
  } catch (error) {
    console.error('Error saving settings:', error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

// ============================================
// BUSINESS SUBSCRIPTION PAYMENT ROUTES
// ============================================

// Process Business Subscription Payment (with Partner Commission)
app.post("/make-server-175b2872/payments/subscription", async (c) => {
  try {
    const { business_id, amount, payment_method, transaction_id } = await c.req.json();
    
    if (!business_id || !amount) {
      return c.json({ error: 'Business ID and amount are required' }, 400);
    }
    
    // Get business
    const business = await kv.get(`business:${business_id}`);
    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
    
    // Get platform settings
    const platformSettings = await getPlatformSettings();
    
    // Record payment
    const paymentId = `payment:${Date.now()}`;
    const payment = {
      id: paymentId,
      business_id: business_id,
      business_name: business.name,
      amount: amount,
      payment_method: payment_method || 'card',
      transaction_id: transaction_id || `txn_${Date.now()}`,
      status: 'completed',
      date: new Date().toISOString(),
      type: 'subscription',
      plan: business.subscription_plan || 'standard'
    };
    await kv.set(paymentId, payment);
    
    // Update business subscription status
    business.subscription_status = 'active';
    business.payment_status = 'paid';
    business.last_payment_date = new Date().toISOString();
    business.next_payment_due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    await kv.set(`business:${business_id}`, business);
    
    console.log(`💳 Subscription payment processed: ${business.name} - R${amount}`);
    
    // ✨ NEW: Award partner recurring commission if business was referred
    let partnerCommission = null;
    
    if (business.referred_by && platformSettings.rewards.business_recurring_commission) {
      const referral = await kv.get(`referral:B-${business_id}`);
      
      if (referral && referral.affiliate_id) {
        const affiliate = await kv.get(referral.affiliate_id);
        
        if (affiliate) {
          // Calculate commission
          const commissionPercentage = platformSettings.rewards.business_subscription_commission_percentage;
          const commissionAmount = Math.round((amount * commissionPercentage) / 100);
          
          // Update affiliate earnings
          affiliate.pending_balance = (affiliate.pending_balance || 0) + commissionAmount;
          affiliate.total_earnings = (affiliate.total_earnings || 0) + commissionAmount;
          await kv.set(affiliate.id, affiliate);
          
          // Record commission
          const commissionId = `comm:${Date.now()}_subscription`;
          const commission = {
            id: commissionId,
            affiliate_id: affiliate.id,
            business_id: business_id,
            business_name: business.name,
            amount: commissionAmount,
            base_amount: amount,
            commission_percentage: commissionPercentage,
            status: 'pending',
            date: new Date().toISOString(),
            type: 'Business Subscription (Recurring)',
            payment_id: paymentId,
            referral_code: affiliate.code
          };
          await kv.set(commissionId, commission);
          
          partnerCommission = {
            partner_name: affiliate.name,
            commission_amount: commissionAmount,
            commission_percentage: commissionPercentage
          };
          
          console.log(`💰 Recurring commission: Partner ${affiliate.name} earned R${commissionAmount} (${commissionPercentage}% of R${amount})`);
        }
      }
    }
    
    return c.json({
      success: true,
      payment: payment,
      partner_commission: partnerCommission,
      message: partnerCommission 
        ? `Payment processed! Partner ${partnerCommission.partner_name} earned R${partnerCommission.commission_amount}`
        : 'Payment processed successfully!'
    });
    
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return c.json({ error: `Payment failed: ${error.message}` }, 500);
  }
});

// ============================================
// SEEDING ROUTES
// ============================================

app.post("/make-server-175b2872/seed", async (c) => {
  if (seedingInProgress) {
    return c.json({ message: 'Seeding already in progress' }, 409);
  }

  seedingInProgress = true;
  try {
    const result = await seedDatabase();
    seedingInProgress = false;
    return c.json(result);
  } catch (error) {
    seedingInProgress = false;
    console.error('Seeding error:', error);
    return c.json({ error: 'Seeding failed' }, 500);
  }
});

app.post("/make-server-175b2872/migrate-kv-to-postgres", async (c) => {
  try {
    const result = await runMigration();
    return c.json(result);
  } catch (error) {
    console.error('Migration error:', error);
    return c.json({ error: 'Migration failed' }, 500);
  }
});

// Reset Database (Admin)
app.delete("/make-server-175b2872/admin/reset-database", async (c) => {
  try {
    const { error } = await supabase.from('kv_store_175b2872').delete().neq('key', '00000000');
    if (error) throw error;
    
    console.log('⚠️ Database reset by admin');
    return c.json({ success: true, message: "Database cleared successfully" });
  } catch (error) {
    console.error('Reset error:', error);
    return c.json({ error: 'Failed to reset database' }, 500);
  }
});

// Generate Test Payments (for demo purposes)
app.post("/make-server-175b2872/admin/generate-test-payments", async (c) => {
  try {
    const testPayments = [
      { id: 'TX-1001', business: 'The Burger Joint', amount: 4500, type: 'Payout', status: 'Pending', date: '2023-11-20' },
      { id: 'TX-1002', business: 'Ocean View Bar', amount: 1250, type: 'Subscription', status: 'Completed', date: '2023-11-19' },
      { id: 'TX-1003', business: 'NightOwl Club', amount: 8900, type: 'Ad Campaign', status: 'Completed', date: '2023-11-19' },
      { id: 'TX-1004', business: 'Café Del Sol', amount: 3200, type: 'Payout', status: 'Processed', date: '2023-11-18' },
      { id: 'TX-1005', business: 'Pizza Express', amount: 450, type: 'Subscription', status: 'Failed', date: '2023-11-18' },
    ];

    for (const payment of testPayments) {
      await kv.set(`payment:${payment.id}`, payment);
    }
    
    return c.json({ success: true, message: "Test payments generated", count: testPayments.length });
  } catch (error) {
    console.error('Error generating payments:', error);
    return c.json({ error: 'Failed to generate payments' }, 500);
  }
});

// Get Subscriptions (Admin)
app.get("/make-server-175b2872/admin/subscriptions", async (c) => {
  try {
    const subscriptions = await kv.getByPrefix('subscription:');
    // Sort by creation or ID
    return c.json({ subscriptions: subscriptions.sort((a: any, b: any) => b.id.localeCompare(a.id)) });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return c.json({ error: 'Failed to fetch subscriptions' }, 500);
  }
});

// Generate Test Subscriptions
app.post("/make-server-175b2872/admin/generate-test-subscriptions", async (c) => {
  try {
    const testSubscriptions = [
      { id: 'S-001', business: 'The Burger Joint', plan: 'Pro Partner', billing: 'Monthly', nextBill: '2023-11-24', status: 'Active', amount: 499 },
      { id: 'S-002', business: 'Ocean View Bar', plan: 'Promo Exception', billing: '-', nextBill: '-', status: 'Active', amount: 0 },
      { id: 'S-004', business: 'Café Del Sol', plan: 'Pro Partner', billing: 'Monthly', nextBill: '2023-11-24', status: 'Past Due', amount: 499 },
      { id: 'S-005', business: 'Pizza Express', plan: 'Pro Partner', billing: 'Monthly', nextBill: '2023-11-26', status: 'Cancelled', amount: 499 },
      // Add more to match the stats in the screenshot roughly (365 subscribers)
      // We won't generate 365 records, but enough to make the chart look interesting
      { id: 'S-006', business: 'Mama Africa', plan: 'Pro Partner', billing: 'Monthly', nextBill: '2023-11-25', status: 'Active', amount: 499 },
      { id: 'S-007', business: 'Cape Town Fish Market', plan: 'Promo Exception', billing: '-', nextBill: '-', status: 'Active', amount: 0 },
    ];

    for (const sub of testSubscriptions) {
      await kv.set(`subscription:${sub.id}`, sub);
    }
    
    return c.json({ success: true, message: "Test subscriptions generated", count: testSubscriptions.length });
  } catch (error) {
    console.error('Error generating subscriptions:', error);
    return c.json({ error: 'Failed to generate subscriptions' }, 500);
  }
});

// Get Campaigns (Admin)
app.get("/make-server-175b2872/admin/campaigns", async (c) => {
  try {
    const campaigns = await kv.getByPrefix('campaign:');
    // Sort by id or name
    return c.json({ campaigns: campaigns.sort((a: any, b: any) => a.id - b.id) });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return c.json({ error: 'Failed to fetch campaigns' }, 500);
  }
});

// Create Campaign (Admin)
app.post("/make-server-175b2872/admin/campaigns", async (c) => {
  try {
    const body = await c.req.json();
    const { name, type, message, start_date, budget, media_url } = body;

    if (!name || !type) {
      return c.json({ error: 'Name and Type are required' }, 400);
    }

    const campaignId = Date.now();
    const campaign = {
      id: campaignId,
      name,
      type,
      message,
      start_date,
      budget: Number(budget) || 0,
      media_url,
      status: 'Scheduled',
      reach: 0,
      clicks: 0,
      spend: 0,
      created_at: new Date().toISOString()
    };

    await kv.set(`campaign:${campaignId}`, campaign);
    return c.json({ success: true, campaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return c.json({ error: 'Failed to create campaign' }, 500);
  }
});

// Generate Test Campaigns
app.post("/make-server-175b2872/admin/generate-test-campaigns", async (c) => {
  try {
    const testCampaigns = [
      { id: 1, name: 'Summer Vibes 2024', status: 'Active', reach: 45000, clicks: 3200, spend: 12500, type: 'Global Promo' },
      { id: 2, name: 'New Feature Announcement', status: 'Scheduled', reach: 0, clicks: 0, spend: 0, type: 'System Notification' },
      { id: 3, name: 'Black Friday Boost', status: 'Ended', reach: 85000, clicks: 12500, spend: 45000, type: 'Global Promo' },
    ];

    for (const campaign of testCampaigns) {
      await kv.set(`campaign:${campaign.id}`, campaign);
    }
    
    return c.json({ success: true, message: "Test campaigns generated", count: testCampaigns.length });
  } catch (error) {
    console.error('Error generating campaigns:', error);
    return c.json({ error: 'Failed to generate campaigns' }, 500);
  }
});

// Get Users (Admin)
app.get("/make-server-175b2872/admin/users", async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    // Sort by id or name
    return c.json({ users: users.sort((a: any, b: any) => a.id - b.id) });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Generate Test Users
app.post("/make-server-175b2872/admin/generate-test-users", async (c) => {
  try {
    const testUsers = [
      { id: 1, name: 'Sarah Jenkins', email: 'sarah.j@example.com', role: 'Customer', status: 'Active', joined: 'Oct 24, 2023', spend: 4200, lastActive: '2 hours ago' },
      { id: 2, name: 'Mike Ross', email: 'mike.ross@example.com', role: 'Business Owner', status: 'Active', joined: 'Nov 12, 2023', spend: 12500, lastActive: '5 mins ago' },
      { id: 3, name: 'Jessica Pearson', email: 'jessica.p@example.com', role: 'Admin', status: 'Active', joined: 'Sep 05, 2023', spend: 0, lastActive: 'Just now' },
      { id: 4, name: 'Harvey Specter', email: 'harvey@example.com', role: 'Business Owner', status: 'Reviewing', joined: 'Jan 15, 2024', spend: 8900, lastActive: '1 day ago' },
      { id: 5, name: 'Louis Litt', email: 'louis@example.com', role: 'Customer', status: 'Suspended', joined: 'Dec 01, 2023', spend: 150, lastActive: '3 weeks ago' },
      { id: 6, name: 'Rachel Zane', email: 'rachel@example.com', role: 'Customer', status: 'Active', joined: 'Feb 10, 2024', spend: 3200, lastActive: '1 hour ago' },
    ];

    for (const user of testUsers) {
      await kv.set(`user:${user.id}`, user);
    }
    
    return c.json({ success: true, message: "Test users generated", count: testUsers.length });
  } catch (error) {
    console.error('Error generating users:', error);
    return c.json({ error: 'Failed to generate users' }, 500);
  }
});

// Generate Test Customers
app.post("/make-server-175b2872/admin/generate-test-customers", async (c) => {
  try {
    const testCustomers = [
      { 
        id: `customer:${Date.now()}-1`, 
        name: 'Sarah Jenkins', 
        email: 'sarah.j@example.com', 
        mobile: '082 123 4567',
        city: 'Cape Town',
        status: 'active', 
        joined_at: new Date(Date.now() - 86400000 * 20).toISOString(), 
        total_spend: 4200, 
        last_active: new Date().toISOString() 
      },
      { 
        id: `customer:${Date.now()}-2`, 
        name: 'Mike Ross', 
        email: 'mike.ross@example.com', 
        mobile: '083 987 6543',
        city: 'Johannesburg',
        status: 'active', 
        joined_at: new Date(Date.now() - 86400000 * 5).toISOString(), 
        total_spend: 12500, 
        last_active: new Date().toISOString() 
      },
      { 
        id: `customer:${Date.now()}-3`, 
        name: 'Jessica Pearson', 
        email: 'jessica.p@example.com', 
        mobile: '072 555 1234',
        city: 'Durban',
        status: 'active', 
        joined_at: new Date(Date.now() - 86400000 * 60).toISOString(), 
        total_spend: 0, 
        last_active: new Date().toISOString() 
      }
    ];

    for (const cust of testCustomers) {
      await kv.set(cust.id, cust);
    }
    
    return c.json({ success: true, message: "Test customers generated", count: testCustomers.length });
  } catch (error) {
    console.error('Error generating customers:', error);
    return c.json({ error: 'Failed to generate customers' }, 500);
  }
});

// TEMPORARY CLEANUP ROUTE FOR support@get-digital.co.za
app.get("/make-server-175b2872/admin/cleanup-digital-user", async (c) => {
  try {
    const targetEmail = 'support@get-digital.co.za';
    const normalizedTarget = targetEmail.toLowerCase().trim();
    let deletedCount = 0;
    const deletedItems = [];
    const debugLog = [];

    debugLog.push(`Targeting: ${normalizedTarget}`);

    // 0. CLEANUP SUPABASE AUTH (The most likely culprit for "User already exists")
    if (supabase.auth.admin) {
      // Pagination handling to ensure we find the user
      let allUsers = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: page, perPage: 1000 });
        if (error || !users || users.length === 0) {
          hasMore = false;
        } else {
          allUsers = [...allUsers, ...users];
          page++;
          // Safety break
          if (page > 10) hasMore = false; 
        }
      }

      const authUser = allUsers.find(u => u.email?.toLowerCase().trim() === normalizedTarget);
      
      if (authUser) {
         const { error: delError } = await supabase.auth.admin.deleteUser(authUser.id);
         if (!delError) {
           deletedItems.push(`auth_user:${authUser.id}`);
           deletedCount++;
           debugLog.push(`✅ Deleted Supabase Auth user: ${authUser.id}`);
         } else {
           debugLog.push(`❌ Failed to delete Supabase Auth user: ${delError.message}`);
         }
      } else {
         debugLog.push(`ℹ️ User not found in Supabase Auth list (checked ${allUsers.length} users)`);
      }
    } else {
      debugLog.push('❌ Supabase Admin API not available');
    }

    // 1. Scan and delete from Businesses (Loose Match)
    const allBusinesses = await kv.getByPrefix('business:');
    const businessesToDelete = allBusinesses.filter((b: any) => 
      b.email?.toLowerCase().trim() === normalizedTarget
    );
    
    for (const b of businessesToDelete) {
      await kv.del(`business:${b.id}`);
      // Also delete the link key if possible
      await kv.del(`link:user_business:${b.user_id}`);
      
      deletedItems.push(`business:${b.id}`);
      deletedCount++;
      debugLog.push(`✅ Deleted KV Business: ${b.name}`);
    }

    // 2. Scan and delete from Customers (Loose Match)
    const allCustomers = await kv.getByPrefix('customer:');
    const customersToDelete = allCustomers.filter((cust: any) => 
      cust.email?.toLowerCase().trim() === normalizedTarget
    );
    
    for (const cust of customersToDelete) {
      await kv.del(`customer:${cust.id}`);
      deletedItems.push(`customer:${cust.id}`);
      
      // Also remove lookups
      if (cust.username) {
         await kv.del(`customer_lookup:username:${cust.username}`);
      }
      await kv.del(`customer_lookup:email:${normalizedTarget}`);
      
      deletedCount++;
      debugLog.push(`✅ Deleted KV Customer: ${cust.name}`);
    }
    
    // 3. Scan and delete from Users (Admin Users table if it exists)
    const allUsers = await kv.getByPrefix('user:');
    const usersToDelete = allUsers.filter((u: any) => 
      u.email?.toLowerCase().trim() === normalizedTarget
    );
    
    for (const u of usersToDelete) {
      await kv.del(`user:${u.id}`);
      deletedItems.push(`user:${u.id}`);
      deletedCount++;
      debugLog.push(`✅ Deleted KV User: ${u.name}`);
    }
    
    // 4. Scan and delete Affiliate
    const allAffiliates = await kv.getByPrefix('affiliate:');
    const affiliatesToDelete = allAffiliates.filter((a: any) => 
      a.email?.toLowerCase().trim() === normalizedTarget
    );
    
    for (const a of affiliatesToDelete) {
       await kv.del(`affiliate:${a.id}`);
       deletedItems.push(`affiliate:${a.id}`);
       deletedCount++;
       debugLog.push(`✅ Deleted KV Affiliate: ${a.name}`);
    }

    return c.json({ 
      success: true, 
      message: `Deleted ${deletedCount} records for ${targetEmail}`,
      deleted: deletedItems,
      debug_log: debugLog
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return c.json({ error: 'Cleanup failed', details: error.message }, 500);
  }
});

// ============================================
// CHECK-IN & GAMIFICATION ROUTES
// ============================================

app.post("/make-server-175b2872/check-in", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const customToken = c.req.header('X-Session-Token');
    
    // Prioritize custom token, fallback to Auth header
    const token = customToken || (authHeader ? authHeader.replace('Bearer ', '') : null);
    
    if (!token) {
      return c.json({ error: 'Unauthorized: Please log in to check in' }, 401);
    }

    // Ignore Anon Key if passed as token
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    if (token === anonKey) {
        return c.json({ error: 'Unauthorized: Please log in to check in' }, 401);
    }

    let customerId;
    let customer;

    // 1. Validate Session/User
    if (token.startsWith('sess_')) {
      const session = await kv.get(`session:${token}`);
      if (!session || session.type !== 'customer') {
        return c.json({ error: 'Invalid session' }, 401);
      }
      customerId = session.userId;
      customer = await kv.get(customerId) || await kv.get(`customer:${customerId}`);
    } else {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return c.json({ error: 'Invalid token' }, 401);
      }
      customerId = user.id;
      customer = await kv.get(`customer:${customerId}`) || await kv.get(customerId);
      
      // Construct basic customer if missing (Supabase Auth fallback)
      if (!customer) {
         customer = {
             id: customerId,
             email: user.email,
             name: user.user_metadata?.name || '',
             mobile: user.user_metadata?.phone || '',
             username: user.email?.split('@')[0] || 'user',
             loyalty_points: 0
         };
      }
    }

    // 2. Guest Check
    // If ID starts with 'guest-', they are definitely a guest
    if (customerId.startsWith('guest-') || (customer.username && customer.username.startsWith('guest_'))) {
        return c.json({ error: 'Guest accounts cannot check in. Please complete your profile.' }, 403);
    }

    // 3. Profile Completion Check
    if (!customer) {
        return c.json({ error: 'Profile not found. Please complete your profile.' }, 404);
    }

    const { name, email, mobile } = customer;
    const isProfileComplete = name && email && mobile;

    if (!isProfileComplete) {
        return c.json({ 
            error: 'Incomplete profile', 
            message: 'Please complete your profile (Name, Email, Mobile) to check in.',
            missing_fields: {
                name: !name,
                email: !email,
                mobile: !mobile
            }
        }, 403);
    }

    // 4. Parse Request
    const body = await c.req.json();
    const { businessId, location } = body;

    if (!businessId) {
        return c.json({ error: 'Business ID is required' }, 400);
    }

    // 5. Verify Business Exists
    const business = await kv.get(`business:${businessId}`);
    if (!business) {
        return c.json({ error: 'Business not found' }, 404);
    }

    // Get platform settings
    const platformSettings = await getPlatformSettings();
    
    // Check Cooldown (prevent spamming points)
    const lastCheckInKey = `last_checkin:${customerId}:${businessId}`;
    const lastCheckIn = await kv.get(lastCheckInKey);
    const nowTimestamp = Date.now();
    const COOLDOWN = platformSettings.rewards.checkin_cooldown_hours * 3600 * 1000;
    
    if (lastCheckIn && (nowTimestamp - lastCheckIn < COOLDOWN)) {
       const remainingMinutes = Math.ceil((COOLDOWN - (nowTimestamp - lastCheckIn)) / 60000);
       return c.json({ error: `Already checked in. Try again in ${remainingMinutes} minutes.` }, 429);
    }

    // 6. Record Check-in
    const checkInId = `checkin:${businessId}:${nowTimestamp}`;
    // Also include customerId in key to allow fetching user's checkins easily if needed
    // checkin:BUSINESS_ID:TIMESTAMP_RANDOM
    
    const POINTS_PER_CHECKIN = platformSettings.rewards.checkin_points;
    
    // Update Customer Points
    customer.loyalty_points = (customer.loyalty_points || 0) + POINTS_PER_CHECKIN;
    // Save customer
    const storageKey = customerId.startsWith('customer:') ? customerId : `customer:${customerId}`;
    await kv.set(storageKey, customer);

    const checkInData = {
        id: checkInId,
        business_id: businessId,
        user_id: customerId,
        user_name: name,
        user_avatar: customer.avatar || null,
        timestamp: new Date().toISOString(),
        location: location || null,
        points_earned: POINTS_PER_CHECKIN
    };

    await kv.set(checkInId, checkInData);
    await kv.set(lastCheckInKey, nowTimestamp);
    
    // Update analytics (simple counter)
    const statsKey = `stats:checkins:${businessId}`;
    const currentStats = await kv.get(statsKey) || { total: 0, last_checkin: null };
    await kv.set(statsKey, {
        total: (currentStats.total || 0) + 1,
        last_checkin: new Date().toISOString()
    });

    // Update Leaderboard Stats (User-Business Aggregate)
    const leaderboardKey = `leaderboard:${businessId}:${customerId}`;
    const stats = await kv.get(leaderboardKey) || { 
      user_id: customerId, 
      user_name: name, 
      checkin_count: 0, 
      total_points: 0 
    };
    
    stats.checkin_count += 1;
    stats.total_points += POINTS_PER_CHECKIN;
    stats.last_checkin = new Date().toISOString();
    await kv.set(leaderboardKey, stats);

    // ✨ NEW: Check if customer is a partner/influencer visiting their referred business
    let bonusMessage = null;
    let bonusPoints = 0;
    let thresholdReward = null;
    
    // Check if this customer referred this business
    const referralCheck = await kv.get(`referral:B-${businessId}`);
    if (referralCheck && referralCheck.affiliate_id) {
      // Get the affiliate/partner record
      const affiliate = await kv.get(referralCheck.affiliate_id);
      
      // Check if the customer checking in is the same person as the affiliate
      if (affiliate && affiliate.email && customer.email && 
          affiliate.email.toLowerCase() === customer.email.toLowerCase()) {
        // Partner is visiting their own referred business!
        const PARTNER_BONUS = platformSettings.rewards.partner_visit_bonus_points;
        bonusPoints = PARTNER_BONUS;
        
        customer.loyalty_points = (customer.loyalty_points || 0) + PARTNER_BONUS;
        await kv.set(storageKey, customer);
        
        bonusMessage = `🎉 Bonus! You referred this business. +${PARTNER_BONUS} extra points!`;
        console.log(`🌟 Partner ${affiliate.name} visited their referred business ${business.name}. Bonus: +${PARTNER_BONUS} points!`);
        
        // Track partner visit to referred business
        const visitKey = `partner_visit:${referralCheck.affiliate_id}:${businessId}:${nowTimestamp}`;
        await kv.set(visitKey, {
          id: visitKey,
          affiliate_id: referralCheck.affiliate_id,
          business_id: businessId,
          business_name: business.name,
          bonus_points: PARTNER_BONUS,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // ✨ NEW: Track check-ins for referred customers and award threshold rewards
    if (customer.referred_by) {
      // This customer was referred by a partner
      const customerReferral = await kv.get(`referral:C-${customerId}`);
      
      if (customerReferral && customerReferral.affiliate_id) {
        // Track check-in count for this referred customer
        const checkinTrackingKey = `customer_checkins:${customerReferral.affiliate_id}:${customerId}`;
        let checkinTracking = await kv.get(checkinTrackingKey) || {
          affiliate_id: customerReferral.affiliate_id,
          customer_id: customerId,
          customer_name: customer.name,
          total_checkins: 0,
          rewards_earned: 0,
          last_checkin: null
        };
        
        checkinTracking.total_checkins += 1;
        checkinTracking.last_checkin = new Date().toISOString();
        
        // Check if threshold reached
        const threshold = platformSettings.rewards.customer_checkin_threshold;
        const previousThresholds = Math.floor((checkinTracking.total_checkins - 1) / threshold);
        const currentThresholds = Math.floor(checkinTracking.total_checkins / threshold);
        
        if (currentThresholds > previousThresholds) {
          // Threshold reached! Award partner
          const thresholdRewardAmount = platformSettings.rewards.customer_checkin_reward;
          const affiliate = await kv.get(customerReferral.affiliate_id);
          
          if (affiliate) {
            affiliate.pending_balance = (affiliate.pending_balance || 0) + thresholdRewardAmount;
            affiliate.total_earnings = (affiliate.total_earnings || 0) + thresholdRewardAmount;
            await kv.set(affiliate.id, affiliate);
            
            // Record commission
            const commissionId = `comm:${Date.now()}_threshold`;
            await kv.set(commissionId, {
              id: commissionId,
              affiliate_id: affiliate.id,
              customer_id: customerId,
              customer_name: customer.name,
              business_name: `Customer Check-in Milestone (${checkinTracking.total_checkins} check-ins)`,
              amount: thresholdRewardAmount,
              status: 'pending',
              date: new Date().toISOString(),
              type: 'Customer Check-in Threshold',
              referral_code: affiliate.code
            });
            
            checkinTracking.rewards_earned += 1;
            thresholdReward = { partner: affiliate.name, amount: thresholdRewardAmount };
            
            console.log(`🎯 Threshold reached! Partner ${affiliate.name} earned R${thresholdRewardAmount} (Customer ${customer.name} reached ${checkinTracking.total_checkins} check-ins)`);
          }
        }
        
        await kv.set(checkinTrackingKey, checkinTracking);
      }
    }

    console.log(`📍 User ${name} (${customerId}) checked in at ${business.name}. +${POINTS_PER_CHECKIN} points.`);

    return c.json({ 
        success: true, 
        message: bonusMessage || `Checked in at ${business.name}!`,
        points_earned: POINTS_PER_CHECKIN + bonusPoints,
        bonus_points: bonusPoints,
        bonus_message: bonusMessage,
        total_points: customer.loyalty_points,
        check_in: checkInData
    });

  } catch (error: any) {
    console.error('Check-in error:', error);
    return c.json({ error: `Check-in failed: ${error.message}` }, 500);
  }
});

// Get Recent Check-Ins for Business
app.get("/make-server-175b2872/check-in/recent/:businessId", async (c) => {
  try {
    const businessId = c.req.param('businessId');
    // Scan for check-ins
    const allCheckIns = await kv.getByPrefix(`checkin:${businessId}:`);
    
    // Sort by timestamp descending
    const recent = allCheckIns
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return c.json({ checkins: recent });
  } catch (error) {
     return c.json({ error: 'Failed to fetch check-ins' }, 500);
  }
});

// Get Leaderboard for Business
app.get("/make-server-175b2872/check-in/leaderboard/:businessId", async (c) => {
  try {
    const businessId = c.req.param('businessId');
    const stats = await kv.getByPrefix(`leaderboard:${businessId}:`);
    
    const leaderboard = stats
      .sort((a: any, b: any) => b.checkin_count - a.checkin_count)
      .slice(0, 10);

    return c.json({ leaderboard });
  } catch (error) {
     return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// ============================================
// REWARDS & REDEMPTION ROUTES
// ============================================

// Redeem a reward
app.post("/make-server-175b2872/rewards/redeem", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const customToken = c.req.header('X-Session-Token');
    
    // Get the user session
    let customerId: string | null = null;
    let customer: any = null;
    
    if (customToken && customToken.startsWith('sess_')) {
      const session = await kv.get(`session:${customToken}`);
      if (session && session.type === 'customer') {
        customerId = session.userId;
        customer = await kv.get(customerId) || await kv.get(`customer:${customerId}`);
      }
    }
    
    if (!customer && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user) {
        customerId = user.id;
        customer = await kv.get(`customer:${customerId}`);
      }
    }
    
    if (!customer) {
      return c.json({ error: 'Unauthorized. Please log in.' }, 401);
    }
    
    const body = await c.req.json();
    const { rewardId, pointsCost } = body;
    
    if (!rewardId || !pointsCost) {
      return c.json({ error: 'Missing rewardId or pointsCost' }, 400);
    }
    
    // Check if user has enough points
    const currentPoints = customer.loyalty_points || 0;
    if (currentPoints < pointsCost) {
      return c.json({ 
        error: 'Insufficient points',
        current: currentPoints,
        required: pointsCost
      }, 400);
    }
    
    // Deduct points
    customer.loyalty_points = currentPoints - pointsCost;
    
    // Save customer
    const storageKey = customerId.startsWith('customer:') ? customerId : `customer:${customerId}`;
    await kv.set(storageKey, customer);
    
    // Record redemption
    const redemptionId = `redemption:${customerId}:${Date.now()}`;
    const redemption = {
      id: redemptionId,
      user_id: customerId,
      reward_id: rewardId,
      points_cost: pointsCost,
      redeemed_at: new Date().toISOString(),
      status: 'active', // can be 'active', 'used', 'expired'
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
    
    await kv.set(redemptionId, redemption);
    
    console.log(`🎁 User ${customer.name} redeemed ${rewardId} for ${pointsCost} points`);
    
    return c.json({
      success: true,
      redemption,
      remaining_points: customer.loyalty_points
    });
    
  } catch (error: any) {
    console.error('Reward redemption error:', error);
    return c.json({ error: `Redemption failed: ${error.message}` }, 500);
  }
});

// Get user's active rewards
app.get("/make-server-175b2872/rewards/my-rewards", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const customToken = c.req.header('X-Session-Token');
    
    let customerId: string | null = null;
    
    if (customToken && customToken.startsWith('sess_')) {
      const session = await kv.get(`session:${customToken}`);
      if (session && session.type === 'customer') {
        customerId = session.userId;
      }
    }
    
    if (!customerId && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user) {
        customerId = user.id;
      }
    }
    
    if (!customerId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get all redemptions for this user
    const allRedemptions = await kv.getByPrefix(`redemption:${customerId}:`);
    
    // Filter active (non-expired, non-used)
    const now = new Date().toISOString();
    const activeRewards = allRedemptions.filter((r: any) => 
      r.status === 'active' && r.expires_at > now
    );
    
    return c.json({ rewards: activeRewards });
    
  } catch (error) {
    return c.json({ error: 'Failed to fetch rewards' }, 500);
  }
});

Deno.serve(app.fetch);
