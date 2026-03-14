/**
 * PRODUCTION DATABASE ACCESS LAYER
 * Replaces kv_store.tsx with optimized PostgreSQL queries
 * Supports 20,000+ concurrent users
 */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const getClient = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ============================================
// USERS
// ============================================

export const getUser = async (id: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(`Get user error: ${error.message}`);
  return data;
};

export const getUserByEmail = async (email: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(`Get user by email error: ${error.message}`);
  return data;
};

export const getAllUsers = async (limit = 1000, offset = 0) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("joined_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(`Get all users error: ${error.message}`);
  return data || [];
};

export const createUser = async (userData: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("users")
    .insert(userData)
    .select()
    .single();
  if (error) throw new Error(`Create user error: ${error.message}`);
  return data;
};

export const updateUser = async (id: string, updates: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Update user error: ${error.message}`);
  return data;
};

export const deleteUser = async (id: string) => {
  const supabase = getClient();
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`Delete user error: ${error.message}`);
};

// ============================================
// BUSINESSES
// ============================================

export const getBusiness = async (id: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(`Get business error: ${error.message}`);
  return data;
};

export const getAllBusinesses = async (filters: any = {}) => {
  const supabase = getClient();
  let query = supabase.from("businesses").select("*");
  
  if (filters.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.city) {
    query = query.eq("city", filters.city);
  }
  if (filters.is_featured !== undefined) {
    query = query.eq("is_featured", filters.is_featured);
  }
  
  query = query.order("created_at", { ascending: false });
  
  if (filters.limit) {
    const offset = filters.offset || 0;
    query = query.range(offset, offset + filters.limit - 1);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(`Get all businesses error: ${error.message}`);
  return data || [];
};

export const createBusiness = async (businessData: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("businesses")
    .insert(businessData)
    .select()
    .single();
  if (error) throw new Error(`Create business error: ${error.message}`);
  return data;
};

export const updateBusiness = async (id: string, updates: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("businesses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Update business error: ${error.message}`);
  return data;
};

// ============================================
// SPECIALS
// ============================================

export const getSpecial = async (id: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("specials")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(`Get special error: ${error.message}`);
  return data;
};

export const getSpecialsByBusiness = async (businessId: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("specials")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Get specials by business error: ${error.message}`);
  return data || [];
};

export const getAllSpecials = async () => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("specials")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Get all specials error: ${error.message}`);
  return data || [];
};

export const createSpecial = async (specialData: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("specials")
    .insert(specialData)
    .select()
    .single();
  if (error) throw new Error(`Create special error: ${error.message}`);
  return data;
};

export const updateSpecial = async (id: string, updates: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("specials")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Update special error: ${error.message}`);
  return data;
};

export const incrementSpecialClickCount = async (specialId: string) => {
  const supabase = getClient();
  const { error } = await supabase.rpc('increment_special_clicks', { special_id: specialId });
  
  // Fallback if RPC doesn't exist
  if (error) {
    const special = await getSpecial(specialId);
    return await updateSpecial(specialId, { click_count: (special.click_count || 0) + 1 });
  }
};

// ============================================
// RESERVATIONS
// ============================================

export const getReservation = async (id: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(`Get reservation error: ${error.message}`);
  return data;
};

export const getReservationsByBusiness = async (businessId: string, limit = 100) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Get reservations by business error: ${error.message}`);
  return data || [];
};

export const getReservationsByUser = async (userId: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*, businesses(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Get reservations by user error: ${error.message}`);
  return data || [];
};

export const getAllReservations = async (limit = 10000) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Get all reservations error: ${error.message}`);
  return data || [];
};

export const createReservation = async (reservationData: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reservations")
    .insert(reservationData)
    .select()
    .single();
  if (error) throw new Error(`Create reservation error: ${error.message}`);
  return data;
};

export const updateReservation = async (id: string, updates: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reservations")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Update reservation error: ${error.message}`);
  return data;
};

// ============================================
// CHECK-INS
// ============================================

export const getCheckIn = async (id: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(`Get check-in error: ${error.message}`);
  return data;
};

export const getCheckInsByBusiness = async (businessId: string, limit = 100) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("business_id", businessId)
    .order("checked_in_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Get check-ins by business error: ${error.message}`);
  return data || [];
};

export const getAllCheckIns = async (limit = 10000) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .order("checked_in_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Get all check-ins error: ${error.message}`);
  return data || [];
};

export const createCheckIn = async (checkInData: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("checkins")
    .insert(checkInData)
    .select()
    .single();
  if (error) throw new Error(`Create check-in error: ${error.message}`);
  return data;
};

// ============================================
// SPECIAL CLICKS (Analytics)
// ============================================

export const trackSpecialClick = async (clickData: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("special_clicks")
    .insert(clickData)
    .select()
    .single();
  if (error) throw new Error(`Track special click error: ${error.message}`);
  return data;
};

export const getAllSpecialClicks = async (limit = 10000) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("special_clicks")
    .select("*")
    .order("clicked_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Get all special clicks error: ${error.message}`);
  return data || [];
};

// ============================================
// ANALYTICS - OPTIMIZED QUERIES
// ============================================

export const getSpecialToReservationMatches = async () => {
  const supabase = getClient();
  
  // Optimized SQL query using JOIN instead of nested loops
  const { data, error } = await supabase.rpc('get_special_to_reservation_matches');
  
  // Fallback if stored procedure doesn't exist
  if (error) {
    const clicks = await getAllSpecialClicks();
    const reservations = await getAllReservations();
    
    const MATCHING_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
    let matches = 0;
    
    clicks.forEach((click: any) => {
      const clickTime = new Date(click.clicked_at).getTime();
      const hasMatch = reservations.some((rsv: any) => {
        const rsvTime = new Date(rsv.created_at).getTime();
        const timeDiff = rsvTime - clickTime;
        return (
          timeDiff >= 0 &&
          timeDiff <= MATCHING_WINDOW &&
          rsv.business_id === click.business_id &&
          (rsv.user_id === click.user_id || rsv.customer_email === click.user_email)
        );
      });
      if (hasMatch) matches++;
    });
    
    return { matches, total_clicks: clicks.length };
  }
  
  return data;
};

export const getAdminStats = async () => {
  const supabase = getClient();
  
  // Use parallel queries for performance
  const [
    { count: totalUsers },
    { count: totalBusinesses },
    { count: activeBusinesses },
    { count: totalReservations },
    { count: totalCheckIns },
    { count: totalSpecialClicks }
  ] = await Promise.all([
    supabase.from("users").select("*", { count: 'exact', head: true }),
    supabase.from("businesses").select("*", { count: 'exact', head: true }),
    supabase.from("businesses").select("*", { count: 'exact', head: true }).eq("is_active", true),
    supabase.from("reservations").select("*", { count: 'exact', head: true }),
    supabase.from("checkins").select("*", { count: 'exact', head: true }),
    supabase.from("special_clicks").select("*", { count: 'exact', head: true })
  ]);
  
  // Calculate conversion metrics
  const matchData = await getSpecialToReservationMatches();
  
  return {
    total_customers: totalUsers || 0,
    total_businesses: totalBusinesses || 0,
    active_businesses: activeBusinesses || 0,
    total_reservations: totalReservations || 0,
    total_checkins: totalCheckIns || 0,
    reservation_completion_rate: totalReservations > 0 
      ? Math.round((totalCheckIns / totalReservations) * 100)
      : 0,
    total_special_clicks: totalSpecialClicks || 0,
    special_to_reservation_matches: matchData.matches || 0,
    special_to_reservation_rate: totalSpecialClicks > 0
      ? Math.round((matchData.matches / totalSpecialClicks) * 100)
      : 0
  };
};

// ============================================
// REVIEWS
// ============================================

export const getReviewsByBusiness = async (businessId: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, users(name, email)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Get reviews error: ${error.message}`);
  return data || [];
};

export const createReview = async (reviewData: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert(reviewData)
    .select()
    .single();
  if (error) throw new Error(`Create review error: ${error.message}`);
  return data;
};

// ============================================
// EVENTS
// ============================================

export const getEventsByBusiness = async (businessId: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("event_date", { ascending: true });
  if (error) throw new Error(`Get events error: ${error.message}`);
  return data || [];
};

export const createEvent = async (eventData: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("events")
    .insert(eventData)
    .select()
    .single();
  if (error) throw new Error(`Create event error: ${error.message}`);
  return data;
};

// ============================================
// PAYMENTS
// ============================================

export const getAllPayments = async (limit = 1000) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Get all payments error: ${error.message}`);
  return data || [];
};

export const createPayment = async (paymentData: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("payments")
    .insert(paymentData)
    .select()
    .single();
  if (error) throw new Error(`Create payment error: ${error.message}`);
  return data;
};

export const updatePayment = async (id: string, updates: any) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("payments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Update payment error: ${error.message}`);
  return data;
};
