import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Realistic South African restaurant data
const seedBusinesses = [
  {
    id: 'palms',
    name: 'The Palms',
    description: 'Upscale restaurant with ocean views and fresh seafood specialties',
    business_type: 'restaurant',
    cuisine_types: ['Seafood', 'Fine Dining'],
    address: '123 Beach Road, Camps Bay, Cape Town',
    city: 'Cape Town',
    latitude: -33.9509,
    longitude: 18.3773,
    phone: '+27 21 438 0044',
    email: 'info@thepalms.co.za',
    website: 'https://thepalms.co.za',
    price_range: '$$$$',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=The%20Palms&backgroundColor=ff6b35&textColor=ffffff',
    cover_image_url: 'https://images.unsplash.com/photo-1759050483129-512154ddd640?w=1200&h=600&fit=crop',
    is_active: true,
    subscription_status: 'active',
    average_rating: 4.7,
    total_reviews: 142,
    total_views: 0,
    total_clicks: 0,
    total_reservations: 0,
    estimated_revenue_generated: 0
  },
  {
    id: 'ocean-basket',
    name: 'Ocean Basket',
    description: 'Casual seafood restaurant with Mediterranean-inspired dishes',
    business_type: 'restaurant',
    cuisine_types: ['Seafood', 'Mediterranean'],
    address: '45 Kloof Street, Gardens, Cape Town',
    city: 'Cape Town',
    latitude: -33.9304,
    longitude: 18.4105,
    phone: '+27 21 422 0322',
    email: 'kloof@oceanbasket.com',
    price_range: '$$',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Ocean%20Basket&backgroundColor=4A90E2&textColor=ffffff',
    cover_image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop',
    is_active: true,
    subscription_status: 'active',
    average_rating: 4.3,
    total_reviews: 89,
    total_views: 0,
    total_clicks: 0,
    total_reservations: 0,
    estimated_revenue_generated: 0
  },
  {
    id: 'marble',
    name: 'Marble Restaurant',
    description: 'Contemporary steakhouse with live music and artisanal cocktails',
    business_type: 'restaurant',
    cuisine_types: ['Steakhouse', 'Contemporary'],
    address: 'Keyes Art Mile, Rosebank, Johannesburg',
    city: 'Johannesburg',
    latitude: -26.1467,
    longitude: 28.0436,
    phone: '+27 11 880 0906',
    email: 'reservations@marble.restaurant',
    price_range: '$$$',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Marble&backgroundColor=8B4513&textColor=ffffff',
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
    is_active: true,
    subscription_status: 'active',
    average_rating: 4.8,
    total_reviews: 201,
    total_views: 0,
    total_clicks: 0,
    total_reservations: 0,
    estimated_revenue_generated: 0
  },
  {
    id: 'col-cacchio',
    name: "Col'Cacchio Pizzeria",
    description: 'Authentic Italian pizzeria with fresh ingredients and family-friendly atmosphere',
    business_type: 'restaurant',
    cuisine_types: ['Italian', 'Pizza'],
    address: '129 Main Road, Sea Point, Cape Town',
    city: 'Cape Town',
    latitude: -33.9192,
    longitude: 18.3873,
    phone: '+27 21 434 6624',
    email: 'seapoint@colcacchio.co.za',
    price_range: '$$',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=ColCacchio&backgroundColor=C13832&textColor=ffffff',
    cover_image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=600&fit=crop',
    is_active: true,
    subscription_status: 'active',
    average_rating: 4.5,
    total_reviews: 156,
    total_views: 0,
    total_clicks: 0,
    total_reservations: 0,
    estimated_revenue_generated: 0
  },
  {
    id: 'tashas',
    name: "Tashas",
    description: 'Chic café serving breakfast, brunch and gourmet coffee',
    business_type: 'restaurant',
    cuisine_types: ['Cafe', 'Breakfast'],
    address: 'Atholl Square, Sandton, Johannesburg',
    city: 'Johannesburg',
    latitude: -26.1076,
    longitude: 28.0567,
    phone: '+27 11 784 9696',
    email: 'atholl@tashas.co.za',
    price_range: '$$$',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Tashas&backgroundColor=E91E63&textColor=ffffff',
    cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=600&fit=crop',
    is_active: true,
    subscription_status: 'active',
    average_rating: 4.6,
    total_reviews: 178,
    total_views: 0,
    total_clicks: 0,
    total_reservations: 0,
    estimated_revenue_generated: 0
  },
  {
    id: 'nandos',
    name: "Nando's Peri-Peri",
    description: 'South African flame-grilled chicken with signature peri-peri sauce',
    business_type: 'restaurant',
    cuisine_types: ['Portuguese', 'Chicken'],
    address: 'V&A Waterfront, Cape Town',
    city: 'Cape Town',
    latitude: -33.9025,
    longitude: 18.4187,
    phone: '+27 21 418 3735',
    email: 'waterfront@nandos.co.za',
    price_range: '$',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Nandos&backgroundColor=A52A2A&textColor=ffffff',
    cover_image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=1200&h=600&fit=crop',
    is_active: true,
    subscription_status: 'active',
    average_rating: 4.2,
    total_reviews: 312,
    total_views: 0,
    total_clicks: 0,
    total_reservations: 0,
    estimated_revenue_generated: 0
  },
  {
    id: 'karma',
    name: 'Karma Restaurant & Bar',
    description: 'Modern Asian fusion with rooftop bar and city views',
    business_type: 'restaurant',
    cuisine_types: ['Asian Fusion', 'Sushi'],
    address: '32 Gradwell Street, Braamfontein, Johannesburg',
    city: 'Johannesburg',
    latitude: -26.1929,
    longitude: 28.0336,
    phone: '+27 11 403 5147',
    email: 'info@karma.co.za',
    price_range: '$$$',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Karma&backgroundColor=9C27B0&textColor=ffffff',
    cover_image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=600&fit=crop',
    is_active: true,
    subscription_status: 'active',
    average_rating: 4.4,
    total_reviews: 134,
    total_views: 0,
    total_clicks: 0,
    total_reservations: 0,
    estimated_revenue_generated: 0
  },
  {
    id: 'butchers-grill',
    name: "The Butcher's Grill",
    description: 'Premium steakhouse specializing in dry-aged beef and craft beer',
    business_type: 'restaurant',
    cuisine_types: ['Steakhouse', 'Grill'],
    address: '56 Bree Street, Cape Town City Centre',
    city: 'Cape Town',
    latitude: -33.9221,
    longitude: 18.4232,
    phone: '+27 21 424 2712',
    email: 'info@butchersgrill.co.za',
    price_range: '$$$$',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Butchers%20Grill&backgroundColor=2C3E50&textColor=ffffff',
    cover_image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=600&fit=crop',
    is_active: true,
    subscription_status: 'active',
    average_rating: 4.9,
    total_reviews: 267,
    total_views: 0,
    total_clicks: 0,
    total_reservations: 0,
    estimated_revenue_generated: 0
  }
];

const seedSpecials = [
  {
    business_id: 'palms',
    title: 'Happy Hour - 50% Off Cocktails',
    description: 'Enjoy half-price cocktails and tapas between 5-7pm daily',
    discount_percentage: 50,
    start_date: '2026-01-01',
    end_date: '2026-03-31',
    days_of_week: [1, 2, 3, 4, 5],
    time_start: '17:00',
    time_end: '19:00',
    is_active: true,
    view_count: 456,
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop'
  },
  {
    business_id: 'ocean-basket',
    title: 'Business Lunch Special',
    description: 'Three-course seafood lunch for R199. Monday to Friday only.',
    discount_percentage: 30,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    days_of_week: [1, 2, 3, 4, 5],
    time_start: '12:00',
    time_end: '15:00',
    is_active: true,
    view_count: 823,
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'
  },
  {
    business_id: 'marble',
    title: 'Sunday Brunch Experience',
    description: 'All-you-can-eat brunch buffet with bottomless mimosas R395pp',
    discount_percentage: 0,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    days_of_week: [0],
    time_start: '10:00',
    time_end: '14:00',
    is_active: true,
    view_count: 612,
    image_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&h=600&fit=crop'
  },
  {
    business_id: 'col-cacchio',
    title: 'Two-for-Tuesday Pizza Deal',
    description: 'Buy one pizza, get the second at 50% off every Tuesday',
    discount_percentage: 50,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    days_of_week: [2],
    is_active: true,
    view_count: 934,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop'
  },
  {
    business_id: 'tashas',
    title: 'Weekend Breakfast Special',
    description: 'Full breakfast with free coffee. Saturdays & Sundays 8-11am',
    discount_percentage: 20,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    days_of_week: [6, 0],
    time_start: '08:00',
    time_end: '11:00',
    is_active: true,
    view_count: 701,
    image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=600&fit=crop'
  },
  {
    business_id: 'nandos',
    title: 'Family Feast for R299',
    description: 'Full chicken, 4 sides, 1.5L drink. Available all day',
    discount_percentage: 25,
    start_date: '2026-01-01',
    end_date: '2026-06-30',
    is_active: true,
    view_count: 1245,
    image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&h=600&fit=crop'
  },
  {
    business_id: 'karma',
    title: 'Sushi Happy Hour',
    description: '40% off all sushi platters from 4-6pm weekdays',
    discount_percentage: 40,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    days_of_week: [1, 2, 3, 4, 5],
    time_start: '16:00',
    time_end: '18:00',
    is_active: true,
    view_count: 567,
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop'
  },
  {
    business_id: 'butchers-grill',
    title: 'Steak & Wine Wednesday',
    description: 'Premium steak with paired wine for R450. Wednesdays only',
    discount_percentage: 35,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    days_of_week: [3],
    is_active: true,
    view_count: 489,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop'
  }
];

const seedEvents = [
  {
    id: 'live-jazz-night',
    business_id: 'marble',
    title: 'Live Jazz Night',
    description: 'Enjoy smooth jazz with our resident band every Friday',
    event_date: '2026-01-24', // Updated to Friday, Jan 24
    start_time: '20:00',
    end_time: '23:00',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop'
  },
  {
    id: 'wine-tasting-evening',
    business_id: 'palms',
    title: 'Wine Tasting Evening',
    description: 'Sample premium Western Cape wines with cheese pairings',
    event_date: '2026-01-27', // Updated to Tuesday, Jan 27
    start_time: '18:00',
    end_time: '21:00',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop'
  },
  {
    id: 'sushi-making-workshop',
    business_id: 'karma',
    title: 'Sushi Making Workshop',
    description: 'Learn to make sushi with our head chef',
    event_date: '2026-02-01', // Updated to Sunday, Feb 1
    start_time: '15:00',
    end_time: '18:00',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop'
  },
  {
    id: 'live-jazz-night-kloof',
    business_id: 'kloof-street-house',
    title: 'Live Jazz Night',
    description: 'Intimate jazz performance with our house band',
    event_date: '2026-01-31', // Friday, Jan 31
    start_time: '19:30',
    end_time: '22:30',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop'
  }
];

const seedMenuItems = [
  // The Palms
  { business_id: 'palms', category: 'Starters', name: 'Seafood Platter', description: 'Fresh oysters, prawns, and mussels', price: 285, is_available: true },
  { business_id: 'palms', category: 'Mains', name: 'Grilled Linefish', description: 'Catch of the day with lemon butter', price: 320, is_available: true },
  { business_id: 'palms', category: 'Desserts', name: 'Malva Pudding', description: 'Traditional South African dessert', price: 85, is_available: true },
  
  // Ocean Basket
  { business_id: 'ocean-basket', category: 'Starters', name: 'Calamari Strips', description: 'Crispy fried calamari', price: 95, is_available: true },
  { business_id: 'ocean-basket', category: 'Mains', name: 'Hake & Chips', description: 'Classic fish and chips', price: 145, is_available: true },
  { business_id: 'ocean-basket', category: 'Mains', name: 'Prawn Platter', description: 'Grilled or fried prawns', price: 195, is_available: true },
  
  // Marble
  { business_id: 'marble', category: 'Starters', name: 'Beef Carpaccio', description: 'Thinly sliced raw beef', price: 125, is_available: true },
  { business_id: 'marble', category: 'Mains', name: 'Tomahawk Steak', description: '1.2kg aged beef', price: 625, is_available: true },
  { business_id: 'marble', category: 'Sides', name: 'Truffle Fries', description: 'Hand-cut fries with truffle oil', price: 65, is_available: true },
  
  // Col'Cacchio
  { business_id: 'col-cacchio', category: 'Pizza', name: 'Margherita', description: 'Tomato, mozzarella, basil', price: 110, is_available: true },
  { business_id: 'col-cacchio', category: 'Pizza', name: 'Quattro Formaggi', description: 'Four cheese blend', price: 145, is_available: true },
  { business_id: 'col-cacchio', category: 'Pasta', name: 'Carbonara', description: 'Creamy bacon pasta', price: 125, is_available: true },
  
  // Tashas
  { business_id: 'tashas', category: 'Breakfast', name: 'Eggs Benedict', description: 'Poached eggs with hollandaise', price: 95, is_available: true },
  { business_id: 'tashas', category: 'Breakfast', name: 'Avocado Toast', description: 'Smashed avo on sourdough', price: 85, is_available: true },
  { business_id: 'tashas', category: 'Beverages', name: 'Cappuccino', description: 'Artisan coffee', price: 38, is_available: true }
];

const seedReviews = [
  {
    business_id: 'palms',
    rating: 5,
    comment: 'Absolutely stunning views and the freshest seafood in Cape Town! The service was impeccable.',
    user_name: 'Sarah Thompson',
    is_approved: true,
    helpful_count: 23,
    created_at: '2026-01-05T14:30:00Z'
  },
  {
    business_id: 'palms',
    rating: 4,
    comment: 'Great food and atmosphere. A bit pricey but worth it for special occasions.',
    user_name: 'John Mbeki',
    is_approved: true,
    helpful_count: 12,
    created_at: '2026-01-08T19:15:00Z'
  },
  {
    business_id: 'marble',
    rating: 5,
    comment: 'Best steak I have ever had! The jazz nights are a fantastic bonus.',
    user_name: 'Lisa van der Merwe',
    is_approved: true,
    helpful_count: 45,
    created_at: '2026-01-10T20:00:00Z'
  },
  {
    business_id: 'ocean-basket',
    rating: 4,
    comment: 'Always reliable for fresh seafood. The lunch special is excellent value.',
    user_name: 'David Naidoo',
    is_approved: true,
    helpful_count: 18,
    created_at: '2026-01-06T12:45:00Z'
  },
  {
    business_id: 'col-cacchio',
    rating: 5,
    comment: 'Authentic Italian pizza! The Tuesday deal is unbeatable.',
    user_name: 'Emma Botha',
    is_approved: true,
    helpful_count: 31,
    created_at: '2026-01-09T18:30:00Z'
  },
  {
    business_id: 'tashas',
    rating: 4,
    comment: 'Love the weekend breakfast special. Coffee is outstanding!',
    user_name: 'Michael Chen',
    is_approved: true,
    helpful_count: 15,
    created_at: '2026-01-11T09:20:00Z'
  },
  {
    business_id: 'nandos',
    rating: 4,
    comment: 'Classic South African experience. The peri-peri sauce never disappoints.',
    user_name: 'Zanele Dlamini',
    is_approved: true,
    helpful_count: 27,
    created_at: '2026-01-07T13:00:00Z'
  },
  {
    business_id: 'butchers-grill',
    rating: 5,
    comment: 'Incredible steaks and the wine pairing was perfect. Highly recommended!',
    user_name: 'Peter Williams',
    is_approved: true,
    helpful_count: 38,
    created_at: '2026-01-12T19:45:00Z'
  }
];

// Analytics data for performance dashboards
const seedAnalytics = [
  // Revenue data - last 30 days
  {
    date: '2026-01-01',
    revenue: 45000,
    bookings: 120,
    views: 1250
  },
  {
    date: '2026-01-02',
    revenue: 38000,
    bookings: 95,
    views: 980
  },
  {
    date: '2026-01-03',
    revenue: 52000,
    bookings: 135,
    views: 1450
  },
  {
    date: '2026-01-04',
    revenue: 48000,
    bookings: 125,
    views: 1320
  },
  {
    date: '2026-01-05',
    revenue: 41000,
    bookings: 110,
    views: 1100
  },
  {
    date: '2026-01-06',
    revenue: 55000,
    bookings: 145,
    views: 1580
  },
  {
    date: '2026-01-07',
    revenue: 62000,
    bookings: 165,
    views: 1720
  },
  {
    date: '2026-01-08',
    revenue: 47000,
    bookings: 118,
    views: 1280
  },
  {
    date: '2026-01-09',
    revenue: 51000,
    bookings: 132,
    views: 1390
  },
  {
    date: '2026-01-10',
    revenue: 58000,
    bookings: 148,
    views: 1610
  },
  {
    date: '2026-01-11',
    revenue: 64000,
    bookings: 172,
    views: 1850
  },
  {
    date: '2026-01-12',
    revenue: 69000,
    bookings: 180,
    views: 1920
  },
  {
    date: '2026-01-13',
    revenue: 71000,
    bookings: 185,
    views: 2010
  }
];

// Popular times data (hourly bookings)
const seedPopularTimes = [
  { hour: '8am', bookings: 12 },
  { hour: '9am', bookings: 18 },
  { hour: '10am', bookings: 25 },
  { hour: '11am', bookings: 35 },
  { hour: '12pm', bookings: 68 },
  { hour: '1pm', bookings: 82 },
  { hour: '2pm', bookings: 45 },
  { hour: '3pm', bookings: 22 },
  { hour: '4pm', bookings: 18 },
  { hour: '5pm', bookings: 38 },
  { hour: '6pm', bookings: 95 },
  { hour: '7pm', bookings: 125 },
  { hour: '8pm', bookings: 142 },
  { hour: '9pm', bookings: 88 },
  { hour: '10pm', bookings: 35 }
];

// Cuisine popularity
const seedCuisineStats = [
  { name: 'Seafood', orders: 342, percentage: 28 },
  { name: 'Italian', orders: 298, percentage: 24 },
  { name: 'Steakhouse', orders: 265, percentage: 22 },
  { name: 'African', orders: 189, percentage: 15 },
  { name: 'Asian Fusion', orders: 134, percentage: 11 }
];

// Customer demographics
const seedDemographics = [
  { ageGroup: '18-24', count: 145, percentage: 15 },
  { ageGroup: '25-34', count: 380, percentage: 39 },
  { ageGroup: '35-44', count: 285, percentage: 29 },
  { ageGroup: '45-54', count: 120, percentage: 12 },
  { ageGroup: '55+', count: 48, percentage: 5 }
];

// Rating trends
const seedRatingTrends = [
  { month: 'Dec', rating: 4.7 },
  { month: 'Jan', rating: 4.8 }
];

// Platform Settings
const platformSettings = {
  monthly_subscription_fee: 499,
  affiliate_commission_percentage: 10,
  ml_insights_enabled: true,
  data_brokerage_enabled: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-19T00:00:00Z'
};

// Seed Affiliates
const seedAffiliates = [
  {
    id: 'AFF001',
    name: 'John Marketing',
    email: 'john@marketing.co.za',
    phone: '+27 82 555 1234',
    code: 'JOHM2026',
    status: 'approved',
    total_referrals: 3,
    total_commission_earned: 149.70,
    pending_commission: 0,
    paid_commission: 149.70,
    created_at: '2025-12-01T00:00:00Z',
    approved_at: '2025-12-02T10:00:00Z',
    approved_by: 'admin@myvibe.co.za'
  },
  {
    id: 'AFF002',
    name: 'Sarah Business Solutions',
    email: 'sarah@bizsolve.co.za',
    phone: '+27 83 777 5678',
    code: 'SARAH2026',
    status: 'approved',
    total_referrals: 5,
    total_commission_earned: 249.50,
    pending_commission: 49.90,
    paid_commission: 199.60,
    created_at: '2025-11-15T00:00:00Z',
    approved_at: '2025-11-16T14:30:00Z',
    approved_by: 'admin@myvibe.co.za'
  }
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed platform settings
    console.log('⚙️ Seeding platform settings...');
    await kv.set('platform:settings', platformSettings);
    
    // Seed affiliates
    console.log('👥 Seeding affiliates...');
    for (const affiliate of seedAffiliates) {
      await kv.set(`affiliate:${affiliate.id}`, affiliate);
    }
    
    // Seed businesses using KV store
    console.log('📍 Seeding businesses...');
    for (const business of seedBusinesses) {
      // Check if business already exists to preserve analytics data
      const existingBusiness = await kv.get(`business:${business.id}`);
      
      // Add payment_status to all seeded businesses so they are active and visible
      const businessWithPayment = {
        ...business,
        payment_status: 'paid',
        last_payment_date: new Date().toISOString(),
        next_payment_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        // Preserve existing analytics data if business exists
        total_views: existingBusiness?.total_views || business.total_views || 0,
        total_clicks: existingBusiness?.total_clicks || business.total_clicks || 0,
        total_reservations: existingBusiness?.total_reservations || business.total_reservations || 0,
        estimated_revenue_generated: existingBusiness?.estimated_revenue_generated || business.estimated_revenue_generated || 0,
        last_viewed_at: existingBusiness?.last_viewed_at || business.last_viewed_at,
        last_click_at: existingBusiness?.last_click_at || business.last_click_at,
        last_reservation_at: existingBusiness?.last_reservation_at || business.last_reservation_at
      };
      await kv.set(`business:${business.id}`, businessWithPayment);
      console.log(`  ✓ ${existingBusiness ? 'Updated' : 'Added'}: ${business.name} (Views: ${businessWithPayment.total_views}, Clicks: ${businessWithPayment.total_clicks})`);
    }
    
    // Seed specials
    console.log('🎯 Seeding specials...');
    for (let i = 0; i < seedSpecials.length; i++) {
      const special = seedSpecials[i];
      const specialId = `special:${special.business_id}:${i}`;
      // Add ID to the special object so it can be edited later
      const specialWithId = {
        ...special,
        id: specialId
      };
      await kv.set(specialId, specialWithId);
      console.log(`  ✓ Added special for: ${special.business_id}`);
    }
    
    // Seed events
    console.log('📅 Seeding events...');
    for (let i = 0; i < seedEvents.length; i++) {
      const event = seedEvents[i];
      // Store events with business_id prefix so they can be queried by business
      const eventKey = `event:${event.business_id}:${event.id}`;
      await kv.set(eventKey, event);
      console.log(`  ✓ Added event: ${event.title} (${eventKey})`);
    }
    
    // Seed menu items
    console.log('🍽️ Seeding menu items...');
    for (let i = 0; i < seedMenuItems.length; i++) {
      const item = seedMenuItems[i];
      const menuItemId = `menu-item-seed-${i}`;
      const menuItemWithId = {
        ...item,
        id: menuItemId,
        created_at: new Date().toISOString()
      };
      // Store with new format: menu_item:{business_id}:{id}
      await kv.set(`menu_item:${item.business_id}:${menuItemId}`, menuItemWithId);
      console.log(`  ✓ Added menu item: ${item.name} for ${item.business_id} (${menuItemId})`);
    }
    
    // Seed reviews
    console.log('⭐ Seeding reviews...');
    for (let i = 0; i < seedReviews.length; i++) {
      const review = seedReviews[i];
      await kv.set(`review:${review.business_id}:${i}`, review);
      console.log(`  ✓ Added review for: ${review.business_id}`);
    }
    
    // Seed analytics data
    console.log('📊 Seeding analytics data...');
    for (let i = 0; i < seedAnalytics.length; i++) {
      const analytics = seedAnalytics[i];
      await kv.set(`analytics:${i}`, analytics);
      console.log(`  ✓ Added analytics for: ${analytics.date}`);
    }

    // Seed popular times
    console.log('🕒 Seeding popular times...');
    for (let i = 0; i < seedPopularTimes.length; i++) {
      const popularTime = seedPopularTimes[i];
      await kv.set(`popular-times:${i}`, popularTime);
      console.log(`  ✓ Added popular time for: ${popularTime.hour}`);
    }

    // Seed cuisine stats
    console.log('🍽️ Seeding cuisine stats...');
    for (let i = 0; i < seedCuisineStats.length; i++) {
      const cuisineStat = seedCuisineStats[i];
      await kv.set(`cuisine-stats:${i}`, cuisineStat);
      console.log(`  ✓ Added cuisine stat for: ${cuisineStat.name}`);
    }

    // Seed demographics
    console.log('👥 Seeding demographics...');
    for (let i = 0; i < seedDemographics.length; i++) {
      const demographic = seedDemographics[i];
      await kv.set(`demographics:${i}`, demographic);
      console.log(`  ✓ Added demographic for: ${demographic.ageGroup}`);
    }

    // Seed rating trends
    console.log('⭐ Seeding rating trends...');
    for (let i = 0; i < seedRatingTrends.length; i++) {
      const ratingTrend = seedRatingTrends[i];
      await kv.set(`rating-trends:${i}`, ratingTrend);
      console.log(`  ✓ Added rating trend for: ${ratingTrend.month}`);
    }
    
    // Store metadata
    await kv.set('seed:metadata', {
      seeded_at: new Date().toISOString(),
      businesses_count: seedBusinesses.length,
      specials_count: seedSpecials.length,
      events_count: seedEvents.length,
      menu_items_count: seedMenuItems.length,
      reviews_count: seedReviews.length,
      analytics_count: seedAnalytics.length,
      popular_times_count: seedPopularTimes.length,
      cuisine_stats_count: seedCuisineStats.length,
      demographics_count: seedDemographics.length,
      rating_trends_count: seedRatingTrends.length
    });
    
    console.log('✅ Database seeding completed successfully!');
    return {
      success: true,
      counts: {
        businesses: seedBusinesses.length,
        specials: seedSpecials.length,
        events: seedEvents.length,
        menu_items: seedMenuItems.length,
        reviews: seedReviews.length,
        analytics: seedAnalytics.length,
        popular_times: seedPopularTimes.length,
        cuisine_stats: seedCuisineStats.length,
        demographics: seedDemographics.length,
        rating_trends: seedRatingTrends.length
      }
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}