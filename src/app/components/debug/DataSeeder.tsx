import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { publicAnonKey, projectId } from '/utils/supabase/info';
import { useToast } from '@/app/components/Toast';

// Business IDs and metadata from ESTABLISHMENT_IDS.md
const BUSINESSES = [
  { id: 'palms', name: 'The Palms' },
  { id: 'ocean-basket', name: 'Ocean Basket' },
  { id: 'marble', name: 'Marble Restaurant' },
  { id: 'col-cacchio', name: "Col'Cacchio Pizzeria" },
  { id: 'tashas', name: 'Tashas' },
  { id: 'nandos', name: "Nando's Peri-Peri" },
  { id: 'karma', name: 'Karma Restaurant & Bar' },
  { id: 'butchers-grill', name: "The Butcher's Grill" }
];

// Specials Data from MANUAL_MENU_AND_SPECIALS.md
const SPECIALS_DATA = [
  {
    business_id: 'palms',
    title: 'Happy Hour - 50% Off Cocktails',
    description: 'Enjoy half-price cocktails and tapas between 5-7pm daily',
    discount_percentage: 50,
    price: 0, // Not specified in markdown, assuming 0 or irrelevant for discount
    days_of_week: [1, 2, 3, 4, 5],
    time_start: '17:00',
    time_end: '19:00',
    start_date: '2024-01-01', // Default valid range
    end_date: '2024-12-31'
  },
  {
    business_id: 'ocean-basket',
    title: 'Business Lunch Special',
    description: 'Three-course seafood lunch for R199. Monday to Friday only.',
    discount_percentage: 30,
    price: 199,
    days_of_week: [1, 2, 3, 4, 5],
    time_start: '12:00',
    time_end: '15:00',
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    business_id: 'marble',
    title: 'Sunday Brunch Experience',
    description: 'All-you-can-eat brunch buffet with bottomless mimosas R395pp',
    discount_percentage: 0,
    price: 395,
    days_of_week: [0], // Sunday
    time_start: '10:00',
    time_end: '14:00',
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    business_id: 'col-cacchio',
    title: 'Two-for-Tuesday Pizza Deal',
    description: 'Buy one pizza, get the second at 50% off every Tuesday',
    discount_percentage: 50,
    price: 0,
    days_of_week: [2], // Tuesday
    time_start: '00:00',
    time_end: '23:59',
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    business_id: 'tashas',
    title: 'Weekend Breakfast Special',
    description: 'Full breakfast with free coffee. Saturdays & Sundays 8-11am',
    discount_percentage: 20,
    price: 0,
    days_of_week: [6, 0], // Sat, Sun
    time_start: '08:00',
    time_end: '11:00',
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    business_id: 'nandos',
    title: 'Family Feast for R299',
    description: 'Full chicken, 4 sides, 1.5L drink. Available all day',
    discount_percentage: 25,
    price: 299,
    days_of_week: [0, 1, 2, 3, 4, 5, 6], // All week
    time_start: '00:00',
    time_end: '23:59',
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    business_id: 'karma',
    title: 'Sushi Happy Hour',
    description: '40% off all sushi platters from 4-6pm weekdays',
    discount_percentage: 40,
    price: 0,
    days_of_week: [1, 2, 3, 4, 5],
    time_start: '16:00',
    time_end: '18:00',
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    business_id: 'butchers-grill',
    title: 'Steak & Wine Wednesday',
    description: 'Premium steak with paired wine for R450. Wednesdays only',
    discount_percentage: 35,
    price: 450,
    days_of_week: [3], // Wednesday
    time_start: '00:00',
    time_end: '23:59',
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  }
];

// Menu Items Data from MANUAL_MENU_AND_SPECIALS.md
const MENU_DATA = [
  // The Palms
  { business_id: 'palms', category: 'starters', name: 'Seafood Platter', description: 'Fresh oysters, prawns, and mussels', price: 285 },
  { business_id: 'palms', category: 'mains', name: 'Grilled Linefish', description: 'Catch of the day with lemon butter', price: 320 },
  { business_id: 'palms', category: 'desserts', name: 'Malva Pudding', description: 'Traditional South African dessert', price: 85 },
  
  // Ocean Basket
  { business_id: 'ocean-basket', category: 'starters', name: 'Calamari Strips', description: 'Crispy fried calamari', price: 95 },
  { business_id: 'ocean-basket', category: 'mains', name: 'Hake & Chips', description: 'Classic fish and chips', price: 145 },
  { business_id: 'ocean-basket', category: 'mains', name: 'Prawn Platter', description: 'Grilled or fried prawns', price: 195 },
  
  // Marble Restaurant
  { business_id: 'marble', category: 'starters', name: 'Beef Carpaccio', description: 'Thinly sliced raw beef', price: 125 },
  { business_id: 'marble', category: 'mains', name: 'Tomahawk Steak', description: '1.2kg aged beef', price: 625 },
  { business_id: 'marble', category: 'starters', name: 'Truffle Fries', description: 'Hand-cut fries with truffle oil', price: 65 }, // Using starters/sides as generic
  
  // Col'Cacchio
  { business_id: 'col-cacchio', category: 'mains', name: 'Margherita', description: 'Tomato, mozzarella, basil', price: 110 },
  { business_id: 'col-cacchio', category: 'mains', name: 'Quattro Formaggi', description: 'Four cheese blend', price: 145 },
  { business_id: 'col-cacchio', category: 'mains', name: 'Carbonara', description: 'Creamy bacon pasta', price: 125 },
  
  // Tashas
  { business_id: 'tashas', category: 'starters', name: 'Eggs Benedict', description: 'Poached eggs with hollandaise', price: 95 },
  { business_id: 'tashas', category: 'starters', name: 'Avocado Toast', description: 'Smashed avo on sourdough', price: 85 },
  { business_id: 'tashas', category: 'drinks', name: 'Cappuccino', description: 'Artisan coffee', price: 38 },

  // Nando's
  { business_id: 'nandos', category: 'mains', name: 'Full Chicken', description: 'Flame-grilled whole chicken with peri-peri sauce', price: 219 },
  { business_id: 'nandos', category: 'mains', name: '1/4 Chicken Meal', description: 'Quarter chicken with chips and a roll', price: 89 },
  { business_id: 'nandos', category: 'starters', name: 'Spicy Rice', description: 'Savoury spicy rice with peppers', price: 45 },

  // Karma
  { business_id: 'karma', category: 'starters', name: 'Salmon Roses', description: 'Salmon wrapped around rice topped with mayo and caviar', price: 95 },
  { business_id: 'karma', category: 'mains', name: 'Dragon Roll', description: 'Tempura prawn and avocado topped with eel sauce', price: 145 },
  { business_id: 'karma', category: 'mains', name: 'Prawn Tempura', description: 'Crispy fried prawns with sweet chilli sauce', price: 110 },

  // The Butcher's Grill
  { business_id: 'butchers-grill', category: 'mains', name: '300g Rump Steak', description: 'Aged rump steak served with chips or salad', price: 220 },
  { business_id: 'butchers-grill', category: 'mains', name: 'Lamb Chops', description: 'Grilled lamb chops with rosemary and garlic', price: 240 },
  { business_id: 'butchers-grill', category: 'starters', name: 'Beef Carpaccio', description: 'Thinly sliced raw beef with parmesan and balsamic', price: 115 }
];

export function DataSeeder() {
  const { toast, showSuccess, showError } = useToast();
  const [seeding, setSeeding] = useState(false);
  const currentBusinessId = localStorage.getItem('business_id');

  const getAuthToken = () => {
    // Check if we're using a test business ID
    const businessId = localStorage.getItem('business_id');
    // ESTABLISHMENT_IDS.md
    const TEST_IDS = ['palms', 'ocean-basket', 'marble', 'col-cacchio', 'tashas', 'nandos', 'karma', 'butchers-grill'];
    
    // Always use anon key for test businesses to avoid invalid JWT errors from stale/garbage tokens
    if (businessId && TEST_IDS.includes(businessId)) {
      return publicAnonKey;
    }

    const token = localStorage.getItem('business_auth_token');
    
    // Validate token format (basic JWT check: 3 parts)
    if (token && token !== 'undefined' && token !== 'null' && token.split('.').length === 3) {
      return token;
    }
    
    return publicAnonKey;
  };

  const seedSpecials = async (targetBusinessId: string) => {
    const businessSpecials = SPECIALS_DATA.filter(s => s.business_id === targetBusinessId);
    if (businessSpecials.length === 0) {
      showError(`No specials data found for ${targetBusinessId}`);
      return;
    }

    setSeeding(true);

    try {
      const formattedSpecials = businessSpecials.map(special => ({
        ...special,
        is_active: true,
        view_count: 0
      }));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/seed-content`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'specials',
            target_business_id: targetBusinessId,
            custom_data: formattedSpecials
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        showSuccess(`Seeded ${result.count} specials for ${targetBusinessId}`);
        // Clear cache
        localStorage.removeItem('business_specials');
      } else {
        console.error(`Failed to seed specials`, await response.text());
        showError('Failed to seed specials');
      }
    } catch (error) {
      console.error('Seeding error:', error);
      showError('Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  const seedMenu = async (targetBusinessId: string) => {
    const businessMenu = MENU_DATA.filter(m => m.business_id === targetBusinessId);
    if (businessMenu.length === 0) {
      showError(`No menu data found for ${targetBusinessId}`);
      return;
    }

    setSeeding(true);

    try {
      const formattedMenuItems = businessMenu.map(item => ({
        ...item,
        is_available: true
      }));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/seed-content`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'menu',
            target_business_id: targetBusinessId,
            custom_data: formattedMenuItems
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        showSuccess(`Seeded ${result.count} menu items for ${targetBusinessId}`);
        // Clear cache
        const cacheKey = `vibespot_cache_businesses_${targetBusinessId}`;
        localStorage.removeItem(cacheKey);
        localStorage.removeItem('business_menu_items');
      } else {
        console.error(`Failed to seed menu items`, await response.text());
        showError('Failed to seed menu items');
      }
    } catch (error) {
      console.error('Seeding error:', error);
      showError('Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manual Data Seeder</CardTitle>
          <CardDescription>
            Quickly populate menu and specials data for testing purposes.
            Current Business ID: <span className="font-mono font-bold">{currentBusinessId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUSINESSES.map(biz => (
              <Card key={biz.id} className={`border ${currentBusinessId === biz.id ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{biz.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{biz.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => seedMenu(biz.id)}
                    disabled={seeding}
                  >
                    🌱 Seed Menu
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => seedSpecials(biz.id)}
                    disabled={seeding}
                  >
                    🏷️ Seed Specials
                  </Button>
                  {currentBusinessId !== biz.id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => {
                        localStorage.setItem('business_id', biz.id);
                        window.location.reload();
                      }}
                    >
                      Switch to this Business
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
