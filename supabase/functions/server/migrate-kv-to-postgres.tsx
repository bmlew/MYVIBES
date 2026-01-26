/**
 * MYVIBES Data Migration Script
 * 
 * This script migrates data from the KV store to proper Postgres tables.
 * 
 * IMPORTANT: Run this AFTER executing database-schema.sql
 * 
 * Usage:
 * 1. Ensure database-schema.sql has been executed in Supabase
 * 2. Deploy this as a one-time Edge Function
 * 3. Call it once: POST https://xxx.supabase.co/functions/v1/make-server-175b2872/migrate-data
 * 4. Monitor the console logs for progress
 * 5. Verify data in Supabase dashboard
 * 
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface MigrationResult {
  table: string;
  migrated: number;
  skipped: number;
  errors: string[];
}

/**
 * Migrate businesses from KV to Postgres
 */
async function migrateBusinesses(): Promise<MigrationResult> {
  console.log('📦 Starting businesses migration...');
  const result: MigrationResult = { table: 'businesses', migrated: 0, skipped: 0, errors: [] };
  
  try {
    // Get all businesses from KV store
    const kvBusinesses = await kv.getByPrefix('business:');
    console.log(`Found ${kvBusinesses.length} businesses in KV store`);
    
    for (const kvBusiness of kvBusinesses) {
      try {
        // Check if already migrated
        const { data: existing } = await supabase
          .from('businesses')
          .select('id')
          .eq('email', kvBusiness.email)
          .single();
        
        if (existing) {
          console.log(`⏭️  Skipping ${kvBusiness.name} - already exists`);
          result.skipped++;
          continue;
        }
        
        // Map KV structure to Postgres structure
        const businessData = {
          id: kvBusiness.id,
          name: kvBusiness.name || 'Unknown Business',
          email: kvBusiness.email,
          phone: kvBusiness.phone || null,
          address: kvBusiness.address || null,
          city: kvBusiness.city || null,
          province: kvBusiness.province || null,
          postal_code: kvBusiness.postalCode || null,
          type: kvBusiness.type || 'restaurant',
          description: kvBusiness.description || null,
          cuisine_type: kvBusiness.cuisineType || null,
          price_range: kvBusiness.priceRange || null,
          age_group: kvBusiness.ageGroup || null,
          
          subscription_tier: kvBusiness.subscriptionTier || 'free',
          subscription_status: kvBusiness.subscriptionStatus || 'inactive',
          payment_status: kvBusiness.paymentStatus || 'unpaid',
          monthly_fee: kvBusiness.monthlyFee || 499.00,
          last_payment_date: kvBusiness.lastPaymentDate || null,
          next_payment_date: kvBusiness.nextPaymentDate || null,
          subscription_start_date: kvBusiness.subscriptionStartDate || null,
          
          is_active: kvBusiness.isActive ?? false,
          is_verified: kvBusiness.isVerified ?? false,
          visibility_override: kvBusiness.visibilityOverride || null,
          override_reason: kvBusiness.overrideReason || null,
          grace_period_until: kvBusiness.gracePeriodUntil || null,
          grace_period_reason: kvBusiness.gracePeriodReason || null,
          
          affiliate_code: kvBusiness.affiliateCode || null,
          referred_by: kvBusiness.referredBy || null,
          
          logo_url: kvBusiness.logoUrl || null,
          cover_image_url: kvBusiness.coverImageUrl || null,
          gallery_images: kvBusiness.galleryImages ? JSON.stringify(kvBusiness.galleryImages) : null,
          
          website: kvBusiness.website || null,
          facebook: kvBusiness.facebook || null,
          instagram: kvBusiness.instagram || null,
          twitter: kvBusiness.twitter || null,
          tiktok: kvBusiness.tiktok || null,
          linkedin: kvBusiness.linkedin || null,
          
          operating_hours: kvBusiness.operatingHours ? JSON.stringify(kvBusiness.operatingHours) : null,
          features: kvBusiness.features ? JSON.stringify(kvBusiness.features) : null,
          
          latitude: kvBusiness.latitude || null,
          longitude: kvBusiness.longitude || null,
          
          created_at: kvBusiness.createdAt || new Date().toISOString(),
          updated_at: kvBusiness.updatedAt || new Date().toISOString()
        };
        
        // Insert into Postgres
        const { error } = await supabase
          .from('businesses')
          .insert(businessData);
        
        if (error) {
          console.error(`❌ Error migrating ${kvBusiness.name}:`, error.message);
          result.errors.push(`${kvBusiness.name}: ${error.message}`);
        } else {
          console.log(`✅ Migrated: ${kvBusiness.name}`);
          result.migrated++;
        }
        
      } catch (itemError) {
        console.error(`❌ Error processing business:`, itemError);
        result.errors.push(`Processing error: ${itemError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error in businesses migration:', error);
    result.errors.push(`Fatal: ${error.message}`);
  }
  
  return result;
}

/**
 * Migrate reviews from KV to Postgres
 */
async function migrateReviews(): Promise<MigrationResult> {
  console.log('⭐ Starting reviews migration...');
  const result: MigrationResult = { table: 'reviews', migrated: 0, skipped: 0, errors: [] };
  
  try {
    const kvReviews = await kv.getByPrefix('review:');
    console.log(`Found ${kvReviews.length} reviews in KV store`);
    
    for (const kvReview of kvReviews) {
      try {
        const reviewData = {
          id: kvReview.id,
          business_id: kvReview.businessId,
          customer_name: kvReview.customerName || 'Anonymous',
          customer_email: kvReview.customerEmail || null,
          customer_id: kvReview.customerId || null,
          rating: kvReview.rating,
          comment: kvReview.comment || null,
          helpful_count: kvReview.helpfulCount || 0,
          verified_purchase: kvReview.verifiedPurchase ?? false,
          response_from_owner: kvReview.responseFromOwner || null,
          response_date: kvReview.responseDate || null,
          is_approved: kvReview.isApproved ?? true,
          is_flagged: kvReview.isFlagged ?? false,
          created_at: kvReview.createdAt || new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('reviews')
          .insert(reviewData);
        
        if (error) {
          result.errors.push(`Review ${kvReview.id}: ${error.message}`);
        } else {
          result.migrated++;
        }
        
      } catch (itemError) {
        result.errors.push(`Processing error: ${itemError.message}`);
      }
    }
    
  } catch (error) {
    result.errors.push(`Fatal: ${error.message}`);
  }
  
  return result;
}

/**
 * Migrate payments from KV to Postgres
 */
async function migratePayments(): Promise<MigrationResult> {
  console.log('💳 Starting payments migration...');
  const result: MigrationResult = { table: 'payments', migrated: 0, skipped: 0, errors: [] };
  
  try {
    const kvPayments = await kv.getByPrefix('payment:');
    console.log(`Found ${kvPayments.length} payments in KV store`);
    
    for (const kvPayment of kvPayments) {
      try {
        const paymentData = {
          id: kvPayment.id,
          business_id: kvPayment.businessId,
          amount: kvPayment.amount,
          currency: kvPayment.currency || 'ZAR',
          status: kvPayment.status || 'pending',
          payment_method: kvPayment.paymentMethod || null,
          transaction_id: kvPayment.transactionId || null,
          payment_reference: kvPayment.paymentReference || null,
          payment_date: kvPayment.paymentDate || null,
          subscription_month: kvPayment.subscriptionMonth || null,
          subscription_tier: kvPayment.subscriptionTier || null,
          notes: kvPayment.notes || null,
          receipt_url: kvPayment.receiptUrl || null,
          created_at: kvPayment.createdAt || new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('payments')
          .insert(paymentData);
        
        if (error) {
          result.errors.push(`Payment ${kvPayment.id}: ${error.message}`);
        } else {
          result.migrated++;
        }
        
      } catch (itemError) {
        result.errors.push(`Processing error: ${itemError.message}`);
      }
    }
    
  } catch (error) {
    result.errors.push(`Fatal: ${error.message}`);
  }
  
  return result;
}

/**
 * Migrate specials from KV to Postgres
 */
async function migrateSpecials(): Promise<MigrationResult> {
  console.log('🎁 Starting specials migration...');
  const result: MigrationResult = { table: 'specials', migrated: 0, skipped: 0, errors: [] };
  
  try {
    const kvSpecials = await kv.getByPrefix('special:');
    console.log(`Found ${kvSpecials.length} specials in KV store`);
    
    for (const kvSpecial of kvSpecials) {
      try {
        const specialData = {
          id: kvSpecial.id,
          business_id: kvSpecial.businessId,
          title: kvSpecial.title,
          description: kvSpecial.description || null,
          discount_percentage: kvSpecial.discountPercentage || null,
          discount_amount: kvSpecial.discountAmount || null,
          original_price: kvSpecial.originalPrice || null,
          special_price: kvSpecial.specialPrice || null,
          valid_from: kvSpecial.validFrom || null,
          valid_until: kvSpecial.validUntil || null,
          days_of_week: kvSpecial.daysOfWeek ? JSON.stringify(kvSpecial.daysOfWeek) : null,
          image_url: kvSpecial.imageUrl || null,
          is_active: kvSpecial.isActive ?? true,
          views_count: kvSpecial.viewsCount || 0,
          claims_count: kvSpecial.claimsCount || 0,
          created_at: kvSpecial.createdAt || new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('specials')
          .insert(specialData);
        
        if (error) {
          result.errors.push(`Special ${kvSpecial.id}: ${error.message}`);
        } else {
          result.migrated++;
        }
        
      } catch (itemError) {
        result.errors.push(`Processing error: ${itemError.message}`);
      }
    }
    
  } catch (error) {
    result.errors.push(`Fatal: ${error.message}`);
  }
  
  return result;
}

/**
 * Migrate events from KV to Postgres
 */
async function migrateEvents(): Promise<MigrationResult> {
  console.log('🎪 Starting events migration...');
  const result: MigrationResult = { table: 'events', migrated: 0, skipped: 0, errors: [] };
  
  try {
    const kvEvents = await kv.getByPrefix('event:');
    console.log(`Found ${kvEvents.length} events in KV store`);
    
    for (const kvEvent of kvEvents) {
      try {
        const eventData = {
          id: kvEvent.id,
          business_id: kvEvent.businessId,
          title: kvEvent.title,
          description: kvEvent.description || null,
          event_date: kvEvent.eventDate,
          end_date: kvEvent.endDate || null,
          location: kvEvent.location || null,
          ticket_price: kvEvent.ticketPrice || null,
          tickets_available: kvEvent.ticketsAvailable || null,
          tickets_sold: kvEvent.ticketsSold || 0,
          image_url: kvEvent.imageUrl || null,
          is_active: kvEvent.isActive ?? true,
          is_featured: kvEvent.isFeatured ?? false,
          views_count: kvEvent.viewsCount || 0,
          interested_count: kvEvent.interestedCount || 0,
          created_at: kvEvent.createdAt || new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('events')
          .insert(eventData);
        
        if (error) {
          result.errors.push(`Event ${kvEvent.id}: ${error.message}`);
        } else {
          result.migrated++;
        }
        
      } catch (itemError) {
        result.errors.push(`Processing error: ${itemError.message}`);
      }
    }
    
  } catch (error) {
    result.errors.push(`Fatal: ${error.message}`);
  }
  
  return result;
}

/**
 * Migrate affiliates from KV to Postgres
 */
async function migrateAffiliates(): Promise<MigrationResult> {
  console.log('🤝 Starting affiliates migration...');
  const result: MigrationResult = { table: 'affiliates', migrated: 0, skipped: 0, errors: [] };
  
  try {
    const kvAffiliates = await kv.getByPrefix('affiliate:');
    console.log(`Found ${kvAffiliates.length} affiliates in KV store`);
    
    for (const kvAffiliate of kvAffiliates) {
      try {
        // Check if already exists by email
        const { data: existing } = await supabase
          .from('affiliates')
          .select('id')
          .eq('email', kvAffiliate.email)
          .single();
        
        if (existing) {
          result.skipped++;
          continue;
        }
        
        const affiliateData = {
          id: kvAffiliate.id,
          name: kvAffiliate.name,
          email: kvAffiliate.email,
          phone: kvAffiliate.phone || null,
          affiliate_code: kvAffiliate.affiliateCode,
          commission_rate: kvAffiliate.commissionRate || 10.00,
          status: kvAffiliate.status || 'pending',
          bank_name: kvAffiliate.bankName || null,
          account_number: kvAffiliate.accountNumber || null,
          account_holder_name: kvAffiliate.accountHolderName || null,
          branch_code: kvAffiliate.branchCode || null,
          total_referrals: kvAffiliate.totalReferrals || 0,
          active_referrals: kvAffiliate.activeReferrals || 0,
          total_earnings: kvAffiliate.totalEarnings || 0,
          pending_earnings: kvAffiliate.pendingEarnings || 0,
          paid_earnings: kvAffiliate.paidEarnings || 0,
          created_at: kvAffiliate.createdAt || new Date().toISOString(),
          approved_at: kvAffiliate.approvedAt || null
        };
        
        const { error } = await supabase
          .from('affiliates')
          .insert(affiliateData);
        
        if (error) {
          result.errors.push(`Affiliate ${kvAffiliate.email}: ${error.message}`);
        } else {
          result.migrated++;
        }
        
      } catch (itemError) {
        result.errors.push(`Processing error: ${itemError.message}`);
      }
    }
    
  } catch (error) {
    result.errors.push(`Fatal: ${error.message}`);
  }
  
  return result;
}

/**
 * Migrate commissions from KV to Postgres
 */
async function migrateCommissions(): Promise<MigrationResult> {
  console.log('💰 Starting commissions migration...');
  const result: MigrationResult = { table: 'commissions', migrated: 0, skipped: 0, errors: [] };
  
  try {
    const kvCommissions = await kv.getByPrefix('commission:');
    console.log(`Found ${kvCommissions.length} commissions in KV store`);
    
    for (const kvCommission of kvCommissions) {
      try {
        const commissionData = {
          id: kvCommission.id,
          affiliate_id: kvCommission.affiliateId,
          business_id: kvCommission.businessId,
          payment_id: kvCommission.paymentId || null,
          amount: kvCommission.amount,
          commission_rate: kvCommission.commissionRate || 10.00,
          base_amount: kvCommission.baseAmount || kvCommission.amount * 10,
          status: kvCommission.status || 'pending',
          paid_date: kvCommission.paidDate || null,
          payment_reference: kvCommission.paymentReference || null,
          notes: kvCommission.notes || null,
          created_at: kvCommission.createdAt || new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('commissions')
          .insert(commissionData);
        
        if (error) {
          result.errors.push(`Commission ${kvCommission.id}: ${error.message}`);
        } else {
          result.migrated++;
        }
        
      } catch (itemError) {
        result.errors.push(`Processing error: ${itemError.message}`);
      }
    }
    
  } catch (error) {
    result.errors.push(`Fatal: ${error.message}`);
  }
  
  return result;
}

/**
 * Main migration function
 */
export async function runMigration(): Promise<{
  success: boolean;
  results: MigrationResult[];
  summary: {
    total_migrated: number;
    total_skipped: number;
    total_errors: number;
  };
}> {
  console.log('🚀 Starting MYVIBES data migration from KV to Postgres...\n');
  const startTime = Date.now();
  
  const results: MigrationResult[] = [];
  
  // Run migrations in sequence to avoid overwhelming the database
  results.push(await migrateBusinesses());
  results.push(await migrateAffiliates());
  results.push(await migratePayments());
  results.push(await migrateReviews());
  results.push(await migrateSpecials());
  results.push(await migrateEvents());
  results.push(await migrateCommissions());
  
  const summary = {
    total_migrated: results.reduce((sum, r) => sum + r.migrated, 0),
    total_skipped: results.reduce((sum, r) => sum + r.skipped, 0),
    total_errors: results.reduce((sum, r) => sum + r.errors.length, 0)
  };
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n✅ Migration completed!');
  console.log(`⏱️  Duration: ${duration} seconds`);
  console.log(`📊 Total migrated: ${summary.total_migrated}`);
  console.log(`⏭️  Total skipped: ${summary.total_skipped}`);
  console.log(`❌ Total errors: ${summary.total_errors}`);
  
  return {
    success: summary.total_errors === 0,
    results,
    summary
  };
}
