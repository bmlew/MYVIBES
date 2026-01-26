// Optimized seed with streaming approach and reduced memory footprint
// Creates 500 businesses with complete data in smaller, memory-efficient batches

import * as kv from './kv_store.tsx';

// Ultra-efficient batch write with immediate writes and small batches
async function streamWrite(entries: Array<{key: string, value: any}>, batchSize = 10) {
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    
    // Write immediately to reduce memory
    await Promise.all(batch.map(({key, value}) => kv.set(key, value)));
    
    // Clear batch from memory
    batch.length = 0;
    
    // Tiny delay to prevent overwhelming
    if (i + batchSize < entries.length && i % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }
}

export async function seedDatabase() {
  console.log('🌱 Starting memory-optimized database seeding...');
  
  const startTime = Date.now();
  const stats = {
    businesses: 0,
    customers: 0,
    reviews: 0,
    reservations: 0,
    menu_items: 0,
    specials: 0,
    events: 0,
    affiliates: 0,
    commissions: 0,
    transactions: 0,
    expenses: 0,
    behavior_logs: 0
  };

  // South African cities
  const cities = [
    { name: 'Johannesburg', province: 'Gauteng', lat: -26.2041, lng: 28.0473 },
    { name: 'Cape Town', province: 'Western Cape', lat: -33.9249, lng: 18.4241 },
    { name: 'Durban', province: 'KwaZulu-Natal', lat: -29.8587, lng: 31.0218 },
    { name: 'Pretoria', province: 'Gauteng', lat: -25.7479, lng: 28.2293 },
    { name: 'Port Elizabeth', province: 'Eastern Cape', lat: -33.9608, lng: 25.6022 },
    { name: 'Bloemfontein', province: 'Free State', lat: -29.0852, lng: 26.1596 },
    { name: 'Nelspruit', province: 'Mpumalanga', lat: -25.4745, lng: 30.9703 },
    { name: 'Polokwane', province: 'Limpopo', lat: -23.9045, lng: 29.4689 },
    { name: 'Sandton', province: 'Gauteng', lat: -26.1076, lng: 28.0567 }
  ];

  const businessNames = {
    restaurant: ['Ocean Basket', 'Nandos', 'Spur', 'Wimpy', 'Mugg & Bean', 'Vida e Caffè', 'Primi', 'Col\'Cacchio', 'Panarottis', 'Steers'],
    hotel: ['Southern Sun', 'Protea Hotel', 'City Lodge', 'Premier Hotel', 'Garden Court']
  };

  const cuisines = ['Italian', 'Seafood', 'Portuguese', 'Indian', 'Steakhouse', 'Fast Food', 'Sushi', 'African'];
  const ageGroups = ['18-25', '26-35', '36-45', '46-55', '55+'];

  // ============================================
  // STEP 1: Create 30 Affiliates (SMALL)
  // ============================================
  console.log('👥 Step 1/9: Creating 30 affiliates...');
  const affiliateIds = [];
  
  for (let i = 1; i <= 30; i++) {
    const affiliateId = `AFF${String(i).padStart(5, '0')}`;
    affiliateIds.push({
      id: affiliateId,
      code: `VIBES${String(i).padStart(3, '0')}`,
      total_referrals: 0,
      pending_commission: 0
    });
    
    await kv.set(`affiliate:${affiliateId}`, {
      id: affiliateId,
      code: `VIBES${String(i).padStart(3, '0')}`,
      name: `Affiliate ${i}`,
      email: `affiliate${i}@myvibes.co.za`,
      phone: `+2781${String(1000000 + i).substring(1)}`,
      status: i <= 25 ? 'approved' : 'pending',
      total_referrals: 0,
      total_commission_earned: 0,
      pending_commission: 0,
      paid_commission: 0,
      created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
    });
    stats.affiliates++;
  }
  console.log(`✅ Created ${stats.affiliates} affiliates`);

  // ============================================
  // STEP 2: Create 100 Businesses (REDUCED FROM 500)
  // ============================================
  console.log('🏢 Step 2/9: Creating 100 businesses (streaming)...');
  const businessIds = [];
  
  for (let i = 1; i <= 100; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const isRestaurant = Math.random() > 0.3;
    const type = isRestaurant ? 'restaurant' : 'hotel';
    const namePool = businessNames[type];
    const baseName = namePool[Math.floor(Math.random() * namePool.length)];
    
    const businessId = `BUS${String(i).padStart(5, '0')}`;
    businessIds.push(businessId);
    
    const hasAffiliate = Math.random() > 0.4;
    const affiliateRef = hasAffiliate ? affiliateIds[Math.floor(Math.random() * 25)] : null;
    const monthsPaid = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1;
    
    const business = {
      id: businessId,
      name: `${baseName} ${city.name}`,
      type,
      cuisine: isRestaurant ? cuisines[Math.floor(Math.random() * cuisines.length)] : 'Hospitality',
      email: `${baseName.toLowerCase().replace(/\s/g, '')}${i}@business.co.za`,
      phone: `+2721${String(4000000 + i).substring(1)}`,
      address: `${Math.floor(Math.random() * 500) + 1} Main Rd, ${city.name}`,
      city: city.name,
      province: city.province,
      latitude: city.lat + (Math.random() - 0.5) * 0.05,
      longitude: city.lng + (Math.random() - 0.5) * 0.05,
      subscription_status: 'active',
      payment_status: 'paid',
      is_active: true,
      rating: 3.5 + Math.random() * 1.5,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      referred_by: affiliateRef?.id || null,
      age_group_target: ageGroups[Math.floor(Math.random() * ageGroups.length)]
    };

    await kv.set(`business:${businessId}`, business);
    stats.businesses++;

    // Transaction
    await kv.set(`transaction:${Date.now()}-${i}`, {
      id: `transaction:${Date.now()}-${i}`,
      type: 'revenue',
      category: 'subscription',
      business_id: businessId,
      business_name: business.name,
      amount: 499 * monthsPaid,
      date: new Date().toISOString(),
      status: 'confirmed'
    });
    stats.transactions++;

    // Commission
    if (affiliateRef) {
      for (let m = 0; m < monthsPaid; m++) {
        const commissionId = `commission:${affiliateRef.id}:${businessId}:${m}`;
        await kv.set(commissionId, {
          id: commissionId,
          affiliate_id: affiliateRef.id,
          business_id: businessId,
          business_name: business.name,
          amount: 49.90,
          status: Math.random() > 0.3 ? 'paid' : 'pending',
          created_at: new Date().toISOString()
        });
        stats.commissions++;
        affiliateRef.total_referrals++;
        affiliateRef.pending_commission += 49.90;
      }
    }

    if (i % 20 === 0) {
      console.log(`  ✓ ${i}/100 businesses...`);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  console.log(`✅ Created ${stats.businesses} businesses, ${stats.transactions} transactions, ${stats.commissions} commissions`);

  // ============================================
  // STEP 3: Create 500 Customers (REDUCED FROM 2500)
  // ============================================
  console.log('👤 Step 3/9: Creating 500 customers (streaming)...');
  const customerIds = [];
  const firstNames = ['Thabo', 'Sipho', 'Nomsa', 'Sarah', 'Michael', 'Ayanda', 'Lerato'];
  const lastNames = ['Dlamini', 'Nkosi', 'Van Der Merwe', 'Smith', 'Mbeki', 'Zulu'];

  for (let i = 1; i <= 500; i++) {
    const customerId = `CUST${String(i).padStart(6, '0')}`;
    customerIds.push(customerId);
    const city = cities[Math.floor(Math.random() * cities.length)];

    await kv.set(`customer:${customerId}`, {
      id: customerId,
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      email: `customer${i}@email.co.za`,
      phone: `+2782${String(1000000 + i).substring(1)}`,
      city: city.name,
      age_group: ageGroups[Math.floor(Math.random() * ageGroups.length)],
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    });
    stats.customers++;

    if (i % 100 === 0) {
      console.log(`  ✓ ${i}/500 customers...`);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  console.log(`✅ Created ${stats.customers} customers`);

  // ============================================
  // STEP 4: Create 2000 Reviews (REDUCED FROM 15000)
  // ============================================
  console.log('⭐ Step 4/9: Creating 2000 reviews (streaming)...');
  const reviewTexts = ['Amazing food!', 'Great service!', 'Highly recommend!', 'Good experience', 'Decent place', 'Not bad'];

  for (let i = 1; i <= 2000; i++) {
    const businessId = businessIds[Math.floor(Math.random() * businessIds.length)];
    const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
    const rating = 3.5 + Math.random() * 1.5;
    
    await kv.set(`review:${businessId}:${i}`, {
      id: `review:${businessId}:${i}`,
      business_id: businessId,
      customer_id: customerId,
      rating: Math.round(rating * 10) / 10,
      comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
      created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      verified: true
    });
    stats.reviews++;

    if (i % 500 === 0) {
      console.log(`  ✓ ${i}/2000 reviews...`);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  console.log(`✅ Created ${stats.reviews} reviews`);

  // ============================================
  // STEP 5: Create 1500 Reservations (REDUCED FROM 8000)
  // ============================================
  console.log('📅 Step 5/9: Creating 1500 reservations (streaming)...');

  for (let i = 1; i <= 1500; i++) {
    const businessId = businessIds[Math.floor(Math.random() * businessIds.length)];
    const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
    const status = Math.random() > 0.2 ? 'completed' : 'confirmed';
    
    const reservationDate = new Date(Date.now() + (Math.random() - 0.5) * 60 * 24 * 60 * 60 * 1000);
    
    await kv.set(`reservation:${businessId}:${i}`, {
      id: `reservation:${businessId}:${i}`,
      business_id: businessId,
      customer_id: customerId,
      date: reservationDate.toISOString().split('T')[0],
      time: ['18:00', '19:00', '20:00'][Math.floor(Math.random() * 3)],
      party_size: Math.floor(Math.random() * 6) + 2,
      status,
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    });
    stats.reservations++;

    if (i % 500 === 0) {
      console.log(`  ✓ ${i}/1500 reservations...`);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  console.log(`✅ Created ${stats.reservations} reservations`);

  // ============================================
  // STEP 6: Create Menu Items (10 per restaurant)
  // ============================================
  console.log('🍽️ Step 6/9: Creating menu items (streaming)...');
  const menuCategories = ['Starters', 'Mains', 'Desserts', 'Drinks'];
  const dishNames = ['Calamari', 'Steak', 'Pasta', 'Pizza', 'Salad', 'Burger', 'Soup', 'Fish', 'Chicken', 'Ice Cream'];
  
  let menuCount = 0;
  for (const businessId of businessIds) {
    for (let j = 0; j < 10; j++) {
      const category = menuCategories[Math.floor(Math.random() * menuCategories.length)];
      const dishName = dishNames[Math.floor(Math.random() * dishNames.length)];
      
      await kv.set(`menu_item:${businessId}:${j}`, {
        id: `menu_item:${businessId}:${j}`,
        business_id: businessId,
        name: `${dishName} Special`,
        price: Math.floor(Math.random() * 150) + 50,
        category,
        is_available: true,
        created_at: new Date().toISOString()
      });
      menuCount++;
    }
    stats.menu_items = menuCount;

    if (menuCount % 200 === 0) {
      console.log(`  ✓ ${menuCount} menu items...`);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  console.log(`✅ Created ${stats.menu_items} menu items`);

  // ============================================
  // STEP 7: Create 100 Specials (REDUCED FROM 500)
  // ============================================
  console.log('🎉 Step 7/9: Creating 100 specials...');
  
  for (let i = 1; i <= 100; i++) {
    const businessId = businessIds[Math.floor(Math.random() * businessIds.length)];
    
    await kv.set(`special:${businessId}:${i}`, {
      id: `special:${businessId}:${i}`,
      business_id: businessId,
      title: ['Happy Hour', '2-for-1', 'Weekend Deal', 'Early Bird'][Math.floor(Math.random() * 4)],
      discount_percentage: Math.floor(Math.random() * 30) + 10,
      is_active: true,
      created_at: new Date().toISOString()
    });
    stats.specials++;
  }
  console.log(`✅ Created ${stats.specials} specials`);

  // ============================================
  // STEP 8: Create 50 Events (REDUCED FROM 200)
  // ============================================
  console.log('🎊 Step 8/9: Creating 50 events...');
  
  for (let i = 1; i <= 50; i++) {
    const businessId = businessIds[Math.floor(Math.random() * businessIds.length)];
    
    await kv.set(`event:${businessId}:${i}`, {
      id: `event:${businessId}:${i}`,
      business_id: businessId,
      title: ['Live Music', 'Wine Tasting', 'Theme Night'][Math.floor(Math.random() * 3)],
      event_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
      created_at: new Date().toISOString()
    });
    stats.events++;
  }
  console.log(`✅ Created ${stats.events} events`);

  // ============================================
  // STEP 9: Create 30 Expenses + 1000 Behavior Logs
  // ============================================
  console.log('💸 Step 9/9: Creating expenses and behavior logs...');
  
  // 30 Expenses
  const expenseCategories = ['marketing', 'software', 'operations'];
  for (let i = 1; i <= 30; i++) {
    await kv.set(`expense:${i}`, {
      id: `expense:${i}`,
      category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
      amount: Math.floor(Math.random() * 3000) + 500,
      date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString()
    });
    stats.expenses++;
  }

  // 1000 Behavior Logs (REDUCED FROM 5000)
  const actions = ['view_business', 'view_menu', 'click_call', 'share'];
  for (let i = 1; i <= 1000; i++) {
    const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
    const businessId = businessIds[Math.floor(Math.random() * businessIds.length)];
    
    await kv.set(`behavior:${customerId}:${i}`, {
      id: `behavior:${customerId}:${i}`,
      customer_id: customerId,
      business_id: businessId,
      action: actions[Math.floor(Math.random() * actions.length)],
      timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    });
    stats.behavior_logs++;

    if (i % 250 === 0) {
      console.log(`  ✓ ${i}/1000 behavior logs...`);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  console.log(`✅ Created ${stats.expenses} expenses and ${stats.behavior_logs} behavior logs`);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);

  console.log('\n🎉 DATABASE SEEDING COMPLETED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 STATISTICS:');
  console.log(`   🏢 Businesses: ${stats.businesses.toLocaleString()}`);
  console.log(`   👤 Customers: ${stats.customers.toLocaleString()}`);
  console.log(`   ⭐ Reviews: ${stats.reviews.toLocaleString()}`);
  console.log(`   📅 Reservations: ${stats.reservations.toLocaleString()}`);
  console.log(`   🍽️ Menu Items: ${stats.menu_items.toLocaleString()}`);
  console.log(`   🎉 Specials: ${stats.specials.toLocaleString()}`);
  console.log(`   🎊 Events: ${stats.events.toLocaleString()}`);
  console.log(`   👥 Affiliates: ${stats.affiliates.toLocaleString()}`);
  console.log(`   💰 Commissions: ${stats.commissions.toLocaleString()}`);
  console.log(`   💳 Transactions: ${stats.transactions.toLocaleString()}`);
  console.log(`   💸 Expenses: ${stats.expenses.toLocaleString()}`);
  console.log(`   📊 Behavior Logs: ${stats.behavior_logs.toLocaleString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   📦 TOTAL: ${totalRecords.toLocaleString()} records`);
  console.log(`   ⏱️ TIME: ${duration}s`);
  console.log(`   ⚡ SPEED: ${Math.floor(totalRecords / parseFloat(duration))} records/sec`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    success: true,
    message: `Database seeded with ${totalRecords.toLocaleString()} records in ${duration} seconds`,
    stats,
    performance: {
      duration_seconds: parseFloat(duration),
      total_records: totalRecords,
      records_per_second: Math.floor(totalRecords / parseFloat(duration))
    }
  };
}
