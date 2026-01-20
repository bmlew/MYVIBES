// External data integration utilities

// 1. WEATHER DATA - OpenWeatherMap API
export async function getWeatherData(lat: number, lng: number) {
  const API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
  
  if (!API_KEY) {
    console.warn('OpenWeatherMap API key not set');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      condition: data.weather[0].main, // Clear, Clouds, Rain, etc.
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

// 2. TRENDING DATA - Google Trends (unofficial API)
export async function getTrendingFoodTopics(region: string = 'ZA') {
  try {
    // Using SerpApi for Google Trends data
    const API_KEY = Deno.env.get('SERPAPI_KEY');
    
    if (!API_KEY) return null;
    
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google_trends&q=restaurants,food&geo=${region}&api_key=${API_KEY}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.interest_over_time?.timeline_data || [];
  } catch (error) {
    console.error('Error fetching trends:', error);
    return null;
  }
}

// 3. PUBLIC HOLIDAYS - Calendarific API
export async function getPublicHolidays(year: number, country: string = 'ZA') {
  const API_KEY = Deno.env.get('CALENDARIFIC_API_KEY');
  
  if (!API_KEY) return null;
  
  try {
    const response = await fetch(
      `https://calendarific.com/api/v2/holidays?api_key=${API_KEY}&country=${country}&year=${year}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const today = new Date();
    
    // Find upcoming holidays in next 7 days
    return data.response.holidays.filter((holiday: any) => {
      const holidayDate = new Date(holiday.date.iso);
      const daysDiff = Math.floor((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return null;
  }
}

// 4. SPORTS EVENTS - TheSportsDB API (free)
export async function getSportsEvents(city: string) {
  try {
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(city)}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const today = new Date();
    
    // Get events happening today or in next 3 days
    return data.event?.filter((event: any) => {
      const eventDate = new Date(event.dateEvent);
      const daysDiff = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 3;
    }) || [];
  } catch (error) {
    console.error('Error fetching sports events:', error);
    return null;
  }
}

// 5. LOCAL NEWS/EVENTS - NewsAPI
export async function getLocalEvents(city: string) {
  const API_KEY = Deno.env.get('NEWSAPI_KEY');
  
  if (!API_KEY) return null;
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${city}+events+OR+festival+OR+concert&language=en&sortBy=publishedAt&apiKey=${API_KEY}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.articles?.slice(0, 5) || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

// 6. SENTIMENT ANALYSIS - OpenAI GPT (for review sentiment)
export async function analyzeSentiment(reviews: any[]) {
  const API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!API_KEY || reviews.length === 0) return null;
  
  try {
    const reviewTexts = reviews.slice(0, 10).map(r => r.comment).join('\n');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Analyze the sentiment and extract trending topics from these restaurant reviews:\n${reviewTexts}\n\nReturn JSON with: overall_sentiment (positive/neutral/negative), trending_dishes (array), common_complaints (array), common_praises (array)`
        }],
        temperature: 0.3
      })
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return null;
  }
}

// 7. COMPETITOR ANALYSIS - Yelp API
export async function getCompetitorData(lat: number, lng: number, category: string = 'restaurants') {
  const API_KEY = Deno.env.get('YELP_API_KEY');
  
  if (!API_KEY) return null;
  
  try {
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}&categories=${category}&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Calculate market insights
    const avgPrice = data.businesses.reduce((sum: number, b: any) => 
      sum + (b.price?.length || 2), 0) / data.businesses.length;
    
    const avgRating = data.businesses.reduce((sum: number, b: any) => 
      sum + b.rating, 0) / data.businesses.length;
    
    return {
      competitors: data.businesses,
      marketAveragePrice: avgPrice,
      marketAverageRating: avgRating,
      totalCompetitors: data.total,
      popularCategories: extractPopularCategories(data.businesses)
    };
  } catch (error) {
    console.error('Error fetching competitor data:', error);
    return null;
  }
}

function extractPopularCategories(businesses: any[]) {
  const categories: Record<string, number> = {};
  
  businesses.forEach(b => {
    b.categories?.forEach((cat: any) => {
      categories[cat.title] = (categories[cat.title] || 0) + 1;
    });
  });
  
  return Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

// 8. TRAFFIC DATA - Google Maps API
export async function getTrafficConditions(lat: number, lng: number) {
  const API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
  
  if (!API_KEY) return null;
  
  try {
    // Use Google Maps Distance Matrix to estimate traffic
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${lat},${lng}&departure_time=now&key=${API_KEY}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      trafficLevel: data.rows[0]?.elements[0]?.duration_in_traffic ? 'heavy' : 'normal',
      travelTimeRatio: data.rows[0]?.elements[0]?.duration_in_traffic?.value / 
                       data.rows[0]?.elements[0]?.duration?.value || 1
    };
  } catch (error) {
    console.error('Error fetching traffic:', error);
    return null;
  }
}

// 9. HISTORICAL DATA - Internal analytics
export async function getHistoricalPatterns(businessId: string, kv: any) {
  try {
    // Get all reviews for pattern analysis
    const reviews = await kv.getByPrefix(`review:${businessId}:`);
    
    // Analyze patterns
    const patterns = {
      peakHours: analyzePeakHours(reviews),
      popularDays: analyzePopularDays(reviews),
      seasonalTrends: analyzeSeasonalTrends(reviews),
      repeatCustomerRate: calculateRepeatRate(reviews)
    };
    
    return patterns;
  } catch (error) {
    console.error('Error analyzing historical patterns:', error);
    return null;
  }
}

function analyzePeakHours(reviews: any[]) {
  const hourCounts: Record<number, number> = {};
  
  reviews.forEach(r => {
    const hour = new Date(r.date).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  return Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
}

function analyzePopularDays(reviews: any[]) {
  const dayCounts: Record<number, number> = {};
  
  reviews.forEach(r => {
    const day = new Date(r.date).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  
  return Object.entries(dayCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([day]) => parseInt(day));
}

function analyzeSeasonalTrends(reviews: any[]) {
  const monthCounts: Record<number, number> = {};
  
  reviews.forEach(r => {
    const month = new Date(r.date).getMonth();
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  
  return monthCounts;
}

function calculateRepeatRate(reviews: any[]) {
  const customers = new Set(reviews.map(r => r.customer_email || r.customer_mobile));
  const totalReviews = reviews.length;
  
  return customers.size > 0 ? (totalReviews - customers.size) / totalReviews : 0;
}
