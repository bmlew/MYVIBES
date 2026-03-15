/**
 * Dual Write Helper
 * Writes data to BOTH KV store and PostgreSQL tables simultaneously
 * This keeps the systems in sync during migration period
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

// ============================================
// HELPER: Get Supabase Client
// ============================================
function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

// ============================================
// CUSTOMER / USER OPERATIONS
// ============================================

export async function createCustomer(data: {
  username: string;
  name: string;
  email?: string;
  mobile?: string;
  city?: string;
  referredBy?: string;
  referralCode?: string;
}) {
  const customerId = `customer:${Date.now()}`;
  const userId = generateUUID();
  const now = new Date().toISOString();

  // Customer object for KV store
  const customer = {
    id: customerId,
    username: data.username.toLowerCase().trim(),
    name: data.name,
    email: data.email || '',
    mobile: data.mobile || '',
    city: data.city || 'Johannesburg',
    notificationPreference: 'email',
    joined_at: now,
    last_active: now,
    status: 'active',
    total_orders: 0,
    total_spend: 0,
    loyalty_points: 0,
    referred_by: data.referredBy || null,
    referral_code: data.referralCode || null,
  };

  // User object for PostgreSQL
  const user = {
    id: userId,
    email: data.email || null,
    full_name: data.name,
    username: data.username.toLowerCase().trim(),
    mobile: data.mobile || null,
    city: data.city || 'Johannesburg',
    role: 'customer',
    status: 'active',
    total_orders: 0,
    total_spend: 0,
    loyalty_points: 0,
    notification_preference: 'email',
    last_active: now,
    created_at: now,
    updated_at: now,
  };

  try {
    // Write to KV store
    await kv.set(customerId, customer);
    await kv.set(`customer_lookup:username:${data.username.toLowerCase().trim()}`, { id: customerId });

    // Write to PostgreSQL (non-blocking - log errors but don't fail)
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('users').insert(user);
    
    if (error) {
      console.error('⚠️ PostgreSQL insert failed (KV write succeeded):', error.message);
    } else {
      console.log('✅ Dual write successful: Customer saved to both KV and PostgreSQL');
    }

    // Store mapping for future reference
    await kv.set(`mapping:customer:${customerId}`, { userId });

    return { customer, userId, customerId };
  } catch (error) {
    console.error('❌ Dual write error:', error);
    throw error;
  }
}

// ============================================
// BUSINESS OPERATIONS
// ============================================

export async function createBusiness(data: {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  category: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  plan?: string;
  affiliateCode?: string;
}) {
  const businessId_KV = `business:${Date.now()}`;
  const businessId_PG = generateUUID();
  const ownerId = generateUUID();
  const now = new Date().toISOString();

  // Business object for KV store
  const business_KV = {
    id: businessId_KV,
    name: data.businessName,
    owner_name: data.ownerName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    postal_code: data.postalCode,
    category: data.category,
    description: data.description || '',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    plan: data.plan || 'standard',
    status: 'active',
    registered_at: now,
    subscription_start: now,
    subscription_end: null,
    average_rating: 0,
    total_reviews: 0,
    total_checkins: 0,
    total_revenue: 0,
    images: [],
  };

  try {
    // Write business to KV
    await kv.set(businessId_KV, business_KV);
    await kv.set(`business_lookup:email:${data.email.toLowerCase()}`, { id: businessId_KV });

    // Write owner to PostgreSQL users table
    const supabase = getSupabaseClient();
    const owner = {
      id: ownerId,
      email: data.email,
      full_name: data.ownerName,
      mobile: data.phone,
      role: 'business_owner',
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    await supabase.from('users').insert(owner);

    // Write business to PostgreSQL
    const business_PG = {
      id: businessId_PG,
      name: data.businessName,
      owner_id: ownerId,
      category: data.category,
      description: data.description || '',
      status: 'active',
      plan: data.plan || 'standard',
      average_rating: 0,
      total_reviews: 0,
      total_checkins: 0,
      total_revenue: 0,
      created_at: now,
      updated_at: now,
    };

    const { error: businessError } = await supabase.from('businesses').insert(business_PG);

    if (businessError) {
      console.error('⚠️ PostgreSQL business insert failed:', businessError.message);
    }

    // Write location to PostgreSQL
    if (data.latitude && data.longitude) {
      const location = {
        business_id: businessId_PG,
        address: data.address,
        city: data.city,
        postal_code: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        is_primary: true,
        created_at: now,
      };

      await supabase.from('business_locations').insert(location);
    }

    console.log('✅ Dual write successful: Business saved to both KV and PostgreSQL');

    // Store mapping
    await kv.set(`mapping:business:${businessId_KV}`, { businessId: businessId_PG, ownerId });

    return { business: business_KV, businessId_PG, ownerId };
  } catch (error) {
    console.error('❌ Dual write error:', error);
    throw error;
  }
}

// ============================================
// CHECK-IN OPERATIONS
// ============================================

export async function createCheckIn(data: {
  customerId: string;
  businessId: string;
  pointsEarned: number;
}) {
  const checkInId_KV = `checkin:${Date.now()}`;
  const now = new Date().toISOString();

  const checkIn_KV = {
    id: checkInId_KV,
    customer_id: data.customerId,
    business_id: data.businessId,
    timestamp: now,
    points_earned: data.pointsEarned,
  };

  try {
    // Write to KV
    await kv.set(checkInId_KV, checkIn_KV);

    // Get mapped IDs
    const userMapping = await kv.get(`mapping:customer:${data.customerId}`);
    const businessMapping = await kv.get(`mapping:business:${data.businessId}`);

    if (userMapping?.userId && businessMapping?.businessId) {
      const supabase = getSupabaseClient();
      
      // Write to PostgreSQL check_ins
      const checkIn_PG = {
        user_id: userMapping.userId,
        business_id: businessMapping.businessId,
        check_in_time: now,
        points_earned: data.pointsEarned,
        created_at: now,
      };

      await supabase.from('check_ins').insert(checkIn_PG);

      // Write to loyalty_points_ledger
      const pointsLedger = {
        user_id: userMapping.userId,
        business_id: businessMapping.businessId,
        points: data.pointsEarned,
        transaction_type: 'check_in',
        description: 'Check-in points',
        created_at: now,
      };

      await supabase.from('loyalty_points_ledger').insert(pointsLedger);

      console.log('✅ Dual write successful: Check-in saved to both KV and PostgreSQL');
    } else {
      console.warn('⚠️ Mapping not found - check-in only saved to KV');
    }

    return checkIn_KV;
  } catch (error) {
    console.error('❌ Dual write error:', error);
    // Don't throw - just log the error
    return checkIn_KV;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateUUID(): string {
  // Use crypto.randomUUID if available (Deno/modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
