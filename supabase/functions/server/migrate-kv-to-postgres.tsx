import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

// Get Supabase client (lazy initialization to avoid boot-time errors)
function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

interface MigrationResult {
  success: boolean;
  message: string;
  stats: {
    users: number;
    businesses: number;
    locations: number;
    reservations: number;
    checkIns: number;
    events: number;
    loyaltyTransactions: number;
    achievements: number;
    rewards: number;
    partners: number;
    referralCodes: number;
    referrals: number;
    commissions: number;
    notifications: number;
    specialClicks: number;
  };
  errors: string[];
}

export const runMigration = async (): Promise<MigrationResult> => {
  // Initialize Supabase client inside function to avoid boot-time errors
  const supabase = getSupabaseClient();
  
  const stats = {
    users: 0,
    businesses: 0,
    locations: 0,
    reservations: 0,
    checkIns: 0,
    events: 0,
    loyaltyTransactions: 0,
    achievements: 0,
    rewards: 0,
    partners: 0,
    referralCodes: 0,
    referrals: 0,
    commissions: 0,
    notifications: 0,
    specialClicks: 0,
  };
  const errors: string[] = [];

  console.log('🚀 Starting KV to PostgreSQL migration...');
  console.log('================================================');
  
  // ============================================
  // 0. VERIFY SCHEMA EXISTS
  // ============================================
  console.log('\n🔍 Step 0: Verifying PostgreSQL schema...');
  try {
    // Test if users table exists by attempting a simple query
    const { error: schemaError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (schemaError && schemaError.message.includes('does not exist')) {
      const errorMsg = '❌ CRITICAL: PostgreSQL tables do not exist! Please run schema.sql in Supabase SQL Editor first.';
      console.error(errorMsg);
      console.error('📄 The schema.sql file has been created at /supabase/functions/server/schema.sql');
      console.error('📋 Copy the contents and run it in: Supabase Dashboard → SQL Editor → New Query');
      errors.push(errorMsg);
      return {
        success: false,
        message: 'Schema not found. Please run schema.sql in Supabase SQL Editor first.',
        stats,
        errors
      };
    }
    
    console.log('✅ PostgreSQL schema verified!');
  } catch (err: any) {
    errors.push(`Schema verification failed: ${err.message}`);
    return {
      success: false,
      message: 'Failed to verify schema',
      stats,
      errors
    };
  }

  try {
    // ============================================
    // 1. MIGRATE CUSTOMERS TO USERS TABLE
    // ============================================
    console.log('\n📊 Step 1: Migrating Customers to Users table...');
    const customers = await kv.getByPrefix('customer:');
    console.log(`Found ${customers.length} customers in KV store`);

    for (const customer of customers) {
      try {
        // Check if user already exists (by username or email)
        let userId: string | null = null;
        
        if (customer.username || customer.email) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .or(`username.eq.${customer.username || 'null'},email.eq.${customer.email || 'null'}`)
            .single();
          
          if (existingUser) {
            userId = existingUser.id;
            console.log(`ℹ️ User ${customer.username || customer.email} already exists, using existing ID`);
          }
        }
        
        // Generate new ID only if user doesn't exist
        if (!userId) {
          userId = crypto.randomUUID();
        }
        
        const userData = {
          id: userId,
          email: customer.email || null,
          full_name: customer.name || 'Unknown User',
          username: customer.username || null,
          mobile: customer.mobile || null,
          city: customer.city || 'Johannesburg',
          role: 'customer',
          status: customer.status || 'active',
          total_orders: customer.total_orders || 0,
          total_spend: customer.total_spend || 0,
          loyalty_points: customer.loyalty_points || 0,
          notification_preference: customer.notificationPreference || 'email',
          last_active: customer.last_active || customer.joined_at || new Date().toISOString(),
          created_at: customer.joined_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('users')
          .upsert(userData, { onConflict: 'id' });

        if (error) {
          console.error(`❌ Error migrating customer ${customer.username}:`, error.message);
          errors.push(`Customer ${customer.username}: ${error.message}`);
        } else {
          stats.users++;
          console.log(`✅ Migrated customer: ${customer.username} → User ID: ${userId}`);
          
          // Store mapping for later use
          await kv.set(`migration:customer:${customer.id}:userId`, userId);

          // Migrate loyalty points as a transaction
          if (customer.loyalty_points > 0) {
            // Check if migration transaction already exists
            const { data: existingLoyalty } = await supabase
              .from('loyalty_points_ledger')
              .select('id')
              .eq('user_id', userId)
              .eq('transaction_type', 'migration')
              .single();
            
            if (!existingLoyalty) {
              const { error: pointsError } = await supabase
                .from('loyalty_points_ledger')
                .insert({
                  user_id: userId,
                  points: customer.loyalty_points,
                  transaction_type: 'migration',
                  description: 'Initial balance from KV migration',
                  created_at: customer.joined_at || new Date().toISOString(),
                });

              if (!pointsError) {
                stats.loyaltyTransactions++;
              }
            } else {
              console.log(`  ℹ️ Loyalty points already migrated for ${customer.username}`);
            }
          }
        }
      } catch (err) {
        console.error(`❌ Exception migrating customer:`, err);
        errors.push(`Customer migration exception: ${err.message}`);
      }
    }

    // ============================================
    // 2. MIGRATE BUSINESSES
    // ============================================
    console.log('\n🏢 Step 2: Migrating Businesses...');
    const businesses = await kv.getByPrefix('business:');
    console.log(`Found ${businesses.length} businesses in KV store`);

    for (const business of businesses) {
      try {
        // Generate slug from business name
        const generateSlug = (name: string, id: string): string => {
          const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 50);
          // Add a short unique suffix to avoid conflicts
          const uniqueSuffix = id.substring(0, 8);
          return `${baseSlug}-${uniqueSuffix}`;
        };
        
        // Check if business already exists (by email or name)
        let businessId: string | null = null;
        let businessSlug: string | null = null;
        
        if (business.email || business.name) {
          const { data: existingBusiness } = await supabase
            .from('businesses')
            .select('id, slug')
            .or(business.email ? `email.eq.${business.email},name.eq.${business.name || 'null'}` : `name.eq.${business.name}`)
            .single();
          
          if (existingBusiness) {
            businessId = existingBusiness.id;
            businessSlug = existingBusiness.slug;
            console.log(`ℹ️ Business "${business.name}" already exists, using existing ID`);
          }
        }
        
        // Generate new IDs only if business doesn't exist
        if (!businessId) {
          businessId = crypto.randomUUID();
          businessSlug = business.slug || generateSlug(business.name || 'business', businessId);
        }
        
        const businessEmail = business.email || `business-${businessId.substring(0, 8)}@myvibes.placeholder`;
        
        // Create business owner user first - check if already exists
        let ownerId: string | null = null;
        
        if (business.email || businessEmail) {
          const { data: existingOwner } = await supabase
            .from('users')
            .select('id')
            .eq('email', business.email || businessEmail)
            .single();
          
          if (existingOwner) {
            ownerId = existingOwner.id;
            console.log(`  ℹ️ Business owner ${business.email || businessEmail} already exists, using existing ID`);
          }
        }
        
        // Generate new owner ID only if doesn't exist
        if (!ownerId) {
          ownerId = crypto.randomUUID();
        }
        
        const ownerData = {
          id: ownerId,
          email: business.email || businessEmail,
          full_name: business.owner_name || business.name || 'Business Owner',
          mobile: business.phone || null,
          role: 'business_owner',
          status: business.status || 'active',
          created_at: business.registered_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: ownerError } = await supabase
          .from('users')
          .upsert(ownerData, { onConflict: 'id' });

        if (ownerError) {
          console.error(`❌ Error creating business owner for ${business.name}:`, ownerError.message);
          errors.push(`Business owner ${business.email}: ${ownerError.message}`);
          continue;
        }

        // Create/update business
        const businessData = {
          id: businessId,
          name: business.name || 'Unknown Business',
          slug: businessSlug,
          email: businessEmail,
          phone: business.phone || null,
          description: business.description || '',
          address: business.address || null,
          city: business.city || null,
          province: business.province || null,
          postal_code: business.postal_code || null,
          latitude: business.latitude || null,
          longitude: business.longitude || null,
          logo_url: business.logo_url || business.images?.[0] || null,
          owner_id: ownerId,
          category: business.category || 'restaurant',
          business_type: business.category || business.business_type || 'restaurant',
          status: business.status || 'active',
          subscription_status: business.subscription_status || 'trial',
          plan: business.plan || 'standard',
          average_rating: business.average_rating || 0,
          total_reviews: business.total_reviews || 0,
          total_checkins: business.total_checkins || 0,
          total_revenue: business.total_revenue || 0,
          created_at: business.registered_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: businessError } = await supabase
          .from('businesses')
          .upsert(businessData, { onConflict: 'id' });

        if (businessError) {
          console.error(`❌ Error migrating business ${business.name}:`, businessError.message);
          errors.push(`Business ${business.name}: ${businessError.message}`);
          continue;
        }

        stats.businesses++;
        console.log(`✅ Migrated business: ${business.name} → Business ID: ${businessId} (${businessSlug})`);
        
        // Store mapping
        await kv.set(`migration:business:${business.id}:businessId`, businessId);
        await kv.set(`migration:business:${business.id}:ownerId`, ownerId);

        // Create business location (upsert to avoid duplicates)
        if (business.latitude && business.longitude) {
          // Check if primary location already exists
          const { data: existingLocation } = await supabase
            .from('business_locations')
            .select('id')
            .eq('business_id', businessId)
            .eq('is_primary', true)
            .single();
          
          if (!existingLocation) {
            const locationData = {
              business_id: businessId,
              address: business.address || '',
              city: business.city || '',
              postal_code: business.postal_code || '',
              latitude: business.latitude,
              longitude: business.longitude,
              is_primary: true,
              created_at: business.registered_at || new Date().toISOString(),
            };

            const { error: locationError } = await supabase
              .from('business_locations')
              .insert(locationData);

            if (!locationError) {
              stats.locations++;
              console.log(`  ✅ Created location for ${business.name}`);
            }
          } else {
            console.log(`  ℹ️ Location already exists for ${business.name}`);
          }
        }

        // Migrate business media (images) - check for existing media first
        if (business.images && Array.isArray(business.images) && business.images.length > 0) {
          // Get existing media for this business
          const { data: existingMedia } = await supabase
            .from('business_media')
            .select('media_url')
            .eq('business_id', businessId);
          
          const existingUrls = new Set(existingMedia?.map(m => m.media_url) || []);
          
          // Only insert new images
          const newImages = business.images.filter((url: string) => !existingUrls.has(url));
          
          if (newImages.length > 0) {
            const mediaInserts = newImages.map((imageUrl: string, index: number) => ({
              business_id: businessId,
              media_type: 'image',
              media_url: imageUrl,
              is_primary: existingMedia.length === 0 && index === 0, // Only first is primary if no existing media
              created_at: new Date().toISOString(),
            }));

            await supabase.from('business_media').insert(mediaInserts);
            console.log(`  ✅ Added ${newImages.length} new images for ${business.name}`);
          } else {
            console.log(`  ℹ️ All media already exists for ${business.name}`);
          }
        }

      } catch (err) {
        console.error(`❌ Exception migrating business:`, err);
        errors.push(`Business migration exception: ${err.message}`);
      }
    }

    // ============================================
    // 3. MIGRATE RESERVATIONS
    // ============================================
    console.log('\n📅 Step 3: Migrating Reservations...');
    const reservations = await kv.getByPrefix('reservation:');
    console.log(`Found ${reservations.length} reservations in KV store`);

    for (const reservation of reservations) {
      try {
        // Get mapped IDs
        const userId = await kv.get(`migration:customer:${reservation.customer_id}:userId`);
        const businessId = await kv.get(`migration:business:${reservation.business_id}:businessId`);

        if (!userId || !businessId) {
          console.warn(`⚠️ Skipping reservation - missing user or business mapping`);
          continue;
        }

        const reservationData = {
          user_id: userId,
          business_id: businessId,
          party_size: reservation.party_size || 2,
          reservation_date: reservation.date || new Date().toISOString().split('T')[0],
          reservation_time: reservation.time || '18:00',
          status: reservation.status === 'rejected' ? 'cancelled' : (reservation.status || 'pending'),
          special_requests: reservation.special_requests || null,
          created_at: reservation.created_at || new Date().toISOString(),
          updated_at: reservation.updated_at || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('reservations')
          .insert(reservationData);

        if (error) {
          console.error(`❌ Error migrating reservation:`, error.message);
          errors.push(`Reservation: ${error.message}`);
        } else {
          stats.reservations++;
        }
      } catch (err) {
        console.error(`❌ Exception migrating reservation:`, err);
        errors.push(`Reservation exception: ${err.message}`);
      }
    }

    // ============================================
    // 4. MIGRATE CHECK-INS
    // ============================================
    console.log('\n✅ Step 4: Migrating Check-ins...');
    const checkIns = await kv.getByPrefix('checkin:');
    console.log(`Found ${checkIns.length} check-ins in KV store`);

    for (const checkIn of checkIns) {
      try {
        const userId = await kv.get(`migration:customer:${checkIn.customer_id}:userId`);
        const businessId = await kv.get(`migration:business:${checkIn.business_id}:businessId`);

        if (!userId || !businessId) {
          console.warn(`⚠️ Skipping check-in - missing user or business mapping`);
          continue;
        }

        const checkInData = {
          user_id: userId,
          business_id: businessId,
          check_in_time: checkIn.timestamp || new Date().toISOString(),
          points_earned: checkIn.points_earned || 10,
          created_at: checkIn.timestamp || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('check_ins')
          .insert(checkInData);

        if (!error) {
          stats.checkIns++;
        }
      } catch (err) {
        console.error(`❌ Exception migrating check-in:`, err);
      }
    }

    // ============================================
    // 5. MIGRATE EVENTS
    // ============================================
    console.log('\n🎉 Step 5: Migrating Events...');
    const events = await kv.getByPrefix('event:');
    console.log(`Found ${events.length} events in KV store`);

    for (const event of events) {
      try {
        const businessId = await kv.get(`migration:business:${event.business_id}:businessId`);

        if (!businessId) {
          console.warn(`⚠️ Skipping event - missing business mapping`);
          continue;
        }

        const eventData = {
          business_id: businessId,
          title: event.title || 'Untitled Event',
          description: event.description || '',
          event_date: event.event_date || new Date().toISOString().split('T')[0],
          start_time: event.start_time || '18:00',
          end_time: event.end_time || '22:00',
          location: event.location || null,
          max_attendees: event.max_attendees || null,
          ticket_price: event.ticket_price || 0,
          status: event.status || 'upcoming',
          created_at: event.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (!error) {
          stats.events++;
        }
      } catch (err) {
        console.error(`❌ Exception migrating event:`, err);
      }
    }

    // ============================================
    // 6. MIGRATE PARTNERS (AFFILIATES)
    // ============================================
    console.log('\n🤝 Step 6: Migrating Partners/Affiliates...');
    const affiliates = await kv.getByPrefix('affiliate:');
    console.log(`Found ${affiliates.length} partners in KV store`);

    for (const affiliate of affiliates) {
      try {
        // Check if partner already exists by email
        let partnerId: string | null = null;
        
        if (affiliate.email) {
          const { data: existingPartner } = await supabase
            .from('partners')
            .select('id')
            .eq('email', affiliate.email)
            .single();
          
          if (existingPartner) {
            partnerId = existingPartner.id;
            console.log(`ℹ️ Partner ${affiliate.email} already exists, using existing ID`);
          }
        }
        
        // Generate new ID only if partner doesn't exist
        if (!partnerId) {
          partnerId = crypto.randomUUID();
        }
        
        const partnerData = {
          id: partnerId,
          name: affiliate.name || 'Unknown Partner',
          email: affiliate.email || null,
          phone: affiliate.phone || null,
          status: affiliate.status || 'active',
          total_earnings: affiliate.total_earnings || 0,
          available_balance: affiliate.available_balance || 0,
          pending_balance: affiliate.pending_balance || 0,
          total_referrals: affiliate.total_referrals || 0,
          total_business_referrals: affiliate.total_business_referrals || 0,
          total_customer_referrals: affiliate.total_customer_referrals || 0,
          app_downloads: affiliate.app_downloads || 0,
          joined_at: affiliate.joined_at || new Date().toISOString(),
          created_at: affiliate.joined_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('partners')
          .upsert(partnerData, { onConflict: 'id' });

        if (error) {
          console.error(`❌ Error migrating partner ${affiliate.name}:`, error.message);
          errors.push(`Partner ${affiliate.name}: ${error.message}`);
        } else {
          stats.partners++;
          console.log(`✅ Migrated partner: ${affiliate.name} → Partner ID: ${partnerId}`);
          
          // Store mapping
          await kv.set(`migration:affiliate:${affiliate.id}:partnerId`, partnerId);

          // Create referral code (check if exists first)
          if (affiliate.code) {
            const { data: existingCode } = await supabase
              .from('referral_codes')
              .select('id')
              .eq('partner_id', partnerId)
              .eq('code', affiliate.code)
              .single();
            
            if (!existingCode) {
              const codeData = {
                partner_id: partnerId,
                code: affiliate.code,
                is_active: true,
                created_at: affiliate.joined_at || new Date().toISOString(),
              };

              const { error: codeError } = await supabase
                .from('referral_codes')
                .insert(codeData);

              if (!codeError) {
                stats.referralCodes++;
              }
            } else {
              console.log(`  ℹ️ Referral code already exists for ${affiliate.name}`);
            }
          }
        }
      } catch (err) {
        console.error(`❌ Exception migrating partner:`, err);
        errors.push(`Partner exception: ${err.message}`);
      }
    }

    // ============================================
    // 7. MIGRATE COMMISSIONS
    // ============================================
    console.log('\n💰 Step 7: Migrating Commissions...');
    const commissions = await kv.getByPrefix('comm:');
    console.log(`Found ${commissions.length} commissions in KV store`);

    for (const commission of commissions) {
      try {
        const partnerId = await kv.get(`migration:affiliate:${commission.affiliate_id}:partnerId`);

        if (!partnerId) {
          console.warn(`⚠️ Skipping commission - missing partner mapping`);
          continue;
        }

        const commissionData = {
          partner_id: partnerId,
          amount: commission.amount || 0,
          commission_type: commission.type || 'customer_download',
          description: commission.business_name || commission.customer_name || 'Commission',
          status: commission.status || 'pending',
          created_at: commission.date || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('partner_commissions')
          .insert(commissionData);

        if (!error) {
          stats.commissions++;
        }
      } catch (err) {
        console.error(`❌ Exception migrating commission:`, err);
      }
    }

    // ============================================
    // 8. MIGRATE NOTIFICATIONS
    // ============================================
    console.log('\n🔔 Step 8: Migrating Notifications...');
    const notifications = await kv.getByPrefix('notif:');
    console.log(`Found ${notifications.length} notifications in KV store`);

    for (const notification of notifications) {
      try {
        let userId = null;
        
        if (notification.customer_id) {
          userId = await kv.get(`migration:customer:${notification.customer_id}:userId`);
        } else if (notification.business_id) {
          userId = await kv.get(`migration:business:${notification.business_id}:ownerId`);
        }

        if (!userId) {
          console.warn(`⚠️ Skipping notification - missing user mapping`);
          continue;
        }

        const notificationData = {
          user_id: userId,
          title: notification.title || 'Notification',
          message: notification.message || '',
          type: notification.type || 'info',
          is_read: notification.read || false,
          created_at: notification.timestamp || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('notifications')
          .insert(notificationData);

        if (!error) {
          stats.notifications++;
        }
      } catch (err) {
        console.error(`❌ Exception migrating notification:`, err);
      }
    }

    // ============================================
    // 9. MIGRATE SPECIAL CLICKS
    // ============================================
    console.log('\n🖱️ Step 9: Migrating Special Clicks...');
    const specialClicks = await kv.getByPrefix('special_click:');
    console.log(`Found ${specialClicks.length} special clicks in KV store`);

    for (const click of specialClicks) {
      try {
        const businessId = await kv.get(`migration:business:${click.business_id}:businessId`);

        if (!businessId) {
          console.warn(`⚠️ Skipping special click - missing business mapping`);
          continue;
        }

        const clickData = {
          business_id: businessId,
          click_type: click.type || 'call',
          created_at: click.timestamp || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('special_clicks')
          .insert(clickData);

        if (!error) {
          stats.specialClicks++;
        }
      } catch (err) {
        console.error(`❌ Exception migrating special click:`, err);
      }
    }

    // ============================================
    // MIGRATION COMPLETE
    // ============================================
    console.log('\n================================================');
    console.log('✅ Migration Complete!');
    console.log('================================================');
    console.log('📊 Migration Statistics:');
    console.log(`  Users: ${stats.users}`);
    console.log(`  Businesses: ${stats.businesses}`);
    console.log(`  Locations: ${stats.locations}`);
    console.log(`  Reservations: ${stats.reservations}`);
    console.log(`  Check-ins: ${stats.checkIns}`);
    console.log(`  Events: ${stats.events}`);
    console.log(`  Loyalty Transactions: ${stats.loyaltyTransactions}`);
    console.log(`  Partners: ${stats.partners}`);
    console.log(`  Referral Codes: ${stats.referralCodes}`);
    console.log(`  Commissions: ${stats.commissions}`);
    console.log(`  Notifications: ${stats.notifications}`);
    console.log(`  Special Clicks: ${stats.specialClicks}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️ Errors encountered: ${errors.length}`);
      errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more errors`);
      }
    }

    return {
      success: true,
      message: `Migration completed successfully. Migrated ${stats.users} users, ${stats.businesses} businesses, ${stats.reservations} reservations, and more.`,
      stats,
      errors,
    };

  } catch (error) {
    console.error('❌ Migration failed with error:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
      stats,
      errors: [...errors, error.message],
    };
  }
};