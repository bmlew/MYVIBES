// Advanced AI Recommendation Engine with External Data Integration
import * as externalData from './externalData.ts';

interface EnhancedRecommendationContext {
  userLocation?: { lat: number; lng: number };
  currentTime: Date;
  weather?: any;
  holidays?: any[];
  sportsEvents?: any[];
  localEvents?: any[];
  traffic?: any;
  competitorData?: any;
}

export async function generateAdvancedRecommendations(
  allSpecials: any[],
  businesses: any[],
  context: EnhancedRecommendationContext,
  kv: any
) {
  const { userLocation, currentTime } = context;
  const currentHour = currentTime.getHours();
  const currentDay = currentTime.getDay();
  const isWeekend = currentDay === 0 || currentDay === 6;
  
  // Fetch all external data in parallel for speed
  const externalDataPromises = [];
  
  // Skip weather - removed per user request
  if (userLocation) {
    externalDataPromises.push(
      externalData.getTrafficConditions(userLocation.lat, userLocation.lng),
      externalData.getCompetitorData(userLocation.lat, userLocation.lng)
    );
  }
  
  externalDataPromises.push(
    externalData.getPublicHolidays(currentTime.getFullYear()),
    externalData.getSportsEvents('Johannesburg') // Make dynamic based on user city
  );
  
  const [traffic, competitors, holidays, sportsEvents] = await Promise.allSettled(
    externalDataPromises
  );
  
  // Create business lookup with enhanced data
  const businessMap = new Map();
  
  for (const business of businesses) {
    // Get historical patterns for each business
    const patterns = await externalData.getHistoricalPatterns(business.id, kv);
    
    businessMap.set(business.id, {
      ...business,
      patterns
    });
  }
  
  // Score each special with external data context
  const scoredRecommendations = allSpecials.map((special: any) => {
    let score = 0;
    const business = businessMap.get(special.business_id);
    const reasons: string[] = [];
    
    // ========== 1. CORE SCORING (Original) ==========
    
    // Time-based scoring
    if (currentHour >= 6 && currentHour < 11 && special.title?.toLowerCase().includes('breakfast')) {
      score += 30;
      reasons.push('Perfect breakfast timing');
    }
    if (currentHour >= 11 && currentHour < 15 && special.title?.toLowerCase().includes('lunch')) {
      score += 30;
      reasons.push('Ideal for lunch');
    }
    if (currentHour >= 17 && currentHour <= 19 && special.title?.toLowerCase().includes('happy hour')) {
      score += 40;
      reasons.push('Happy hour is on now');
    }
    
    // Day-based scoring
    if (isWeekend && special.title?.toLowerCase().includes('weekend')) {
      score += 25;
      reasons.push('Weekend special active');
    }
    if (!isWeekend && (special.title?.toLowerCase().includes('weekday') || special.title?.toLowerCase().includes('business'))) {
      score += 25;
      reasons.push('Great weekday deal');
    }
    
    // Popularity & rating (original)
    score += Math.min((special.view_count || 0) / 10, 20);
    if (business?.average_rating) {
      const ratingBonus = (business.average_rating / 5) * 20;
      score += ratingBonus;
      if (business.average_rating >= 4.5) {
        reasons.push('Highly rated venue');
      }
    }
    
    // ========== 2. HOLIDAY-BASED SCORING (NEW) ==========
    if (holidays.status === 'fulfilled' && holidays.value && holidays.value.length > 0) {
      const upcomingHoliday = holidays.value[0];
      
      if (special.title?.toLowerCase().match(/family|celebration|special occasion/)) {
        score += 40;
        reasons.push(`Great for ${upcomingHoliday.name} celebration`);
      }
      
      // Public holiday boost
      if (currentDay === new Date(upcomingHoliday.date.iso).getDay()) {
        score += 25;
        reasons.push(`Perfect for ${upcomingHoliday.name} today`);
      }
    }
    
    // ========== 3. SPORTS EVENTS BOOST (NEW) ==========
    if (sportsEvents.status === 'fulfilled' && sportsEvents.value && sportsEvents.value.length > 0) {
      if (special.title?.toLowerCase().match(/sports|game day|big screen|watch party/)) {
        score += 45;
        reasons.push('Big game on - sports viewing available');
      }
      
      if (special.title?.toLowerCase().match(/group|sharing|party/)) {
        score += 30;
        reasons.push('Perfect for watching the game with friends');
      }
    }
    
    // ========== 4. TRAFFIC-BASED SCORING (NEW) ==========
    if (traffic.status === 'fulfilled' && traffic.value) {
      const trafficRatio = traffic.value.travelTimeRatio;
      
      // Heavy traffic - boost nearby venues
      if (trafficRatio > 1.5 && userLocation && business?.latitude && business?.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          business.latitude,
          business.longitude
        );
        
        if (distance < 3) {
          score += 25;
          reasons.push('Close by - avoid heavy traffic');
        }
      }
    }
    
    // ========== 5. COMPETITOR ANALYSIS (NEW) ==========
    if (competitors.status === 'fulfilled' && competitors.value) {
      const marketAvgRating = competitors.value.marketAverageRating;
      
      // Above market rating boost
      if (business?.average_rating > marketAvgRating) {
        score += 20;
        reasons.push('Rated above market average');
      }
      
      // Unique offering boost
      const isUnique = !competitors.value.competitors.some((c: any) => 
        c.categories?.some((cat: any) => 
          special.title?.toLowerCase().includes(cat.title.toLowerCase())
        )
      );
      
      if (isUnique) {
        score += 15;
        reasons.push('Unique offering in the area');
      }
    }
    
    // ========== 6. HISTORICAL PATTERNS (NEW) ==========
    if (business?.patterns) {
      // Peak hour boost
      if (business.patterns.peakHours?.includes(currentHour)) {
        score += 15;
        reasons.push('Venue is popular at this time');
      }
      
      // High repeat customer rate
      if (business.patterns.repeatCustomerRate > 0.3) {
        score += 20;
        reasons.push('Customers love coming back here');
      }
    }
    
    // ========== 7. DISTANCE SCORING (Original with enhancement) ==========
    if (userLocation && business?.latitude && business?.longitude) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        business.latitude,
        business.longitude
      );
      
      if (distance < 2) {
        score += 25;
        reasons.push(`Just ${distance.toFixed(1)} km away`);
      } else if (distance < 5) {
        score += 15;
        reasons.push(`Only ${distance.toFixed(1)} km from you`);
      } else if (distance < 10) {
        score += 10;
      } else if (distance < 20) {
        score += 5;
      }
    }
    
    // ========== 8. TIME-DECAY SCORING (NEW) ==========
    // Boost specials that are ending soon
    if (special.end_date) {
      const endDate = new Date(special.end_date);
      const daysUntilEnd = Math.floor((endDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilEnd <= 1) {
        score += 30;
        reasons.push('Ending soon - last chance!');
      } else if (daysUntilEnd <= 3) {
        score += 15;
        reasons.push('Limited time offer');
      }
    }
    
    // ========== GENERATE AI REASON ==========
    const aiReason = reasons.length > 0 
      ? reasons.slice(0, 3).join('. ') + '.'
      : generateBasicReason(special);
    
    return {
      id: special.id || `${special.business_id}-${special.title}-${Date.now()}`,
      type: 'special',
      title: special.title,
      venue: business?.name || 'Unknown',
      reason: aiReason,
      confidence: Math.min(Math.round(score), 100),
      image: special.image_url || business?.cover_image_url || '',
      tags: generateAdvancedTags(special, score, null, holidays.value),
      metadata: {
        distance: userLocation && business?.latitude && business?.longitude
          ? calculateDistance(userLocation.lat, userLocation.lng, business.latitude, business.longitude)
          : null,
        weatherBoost: false,
        eventBoost: (sportsEvents.status === 'fulfilled' && sportsEvents.value?.length > 0) ||
                   (holidays.status === 'fulfilled' && holidays.value?.length > 0)
      }
    };
  });
  
  // Sort by confidence and return top recommendations
  return scoredRecommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5); // Return top 5 instead of 3 with richer data
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateBasicReason(special: any): string {
  return `Popular special at ${special.venue}. Great value and highly recommended by customers.`;
}

function generateAdvancedTags(special: any, score: number, weather: any, holidays: any[]): string[] {
  const tags: string[] = [];
  
  // Score-based tags
  if (score >= 90) tags.push('🔥 Trending');
  if (score >= 80) tags.push('⭐ Top Pick');
  
  // Weather tags
  if (weather) {
    if (weather.temperature > 28) tags.push('☀️ Hot Day Special');
    if (weather.temperature < 15) tags.push('🧥 Cozy Weather');
    if (weather.condition === 'Rain') tags.push('☔ Rainy Day Pick');
    if (weather.condition === 'Clear') tags.push('🌤️ Sunny Day');
  }
  
  // Holiday tags
  if (holidays && holidays.length > 0) {
    tags.push(`🎉 ${holidays[0].name}`);
  }
  
  // Type tags
  if (special.discount_percentage && special.discount_percentage > 30) {
    tags.push('💰 Big Savings');
  }
  
  return tags.slice(0, 3); // Limit to 3 tags
}