import { ArrowLeft, MapPin, Clock, Star, Heart, Share2, Phone, Navigation, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { SpecialCard } from './SpecialCard';
import { RatingReview } from './RatingReview';
import { PhoneModal } from './PhoneModal';
import { useState, useEffect } from 'react';
import * as api from '@/utils/api';

interface VenueDetailProps {
  venueId: string;
  onBack: () => void;
  onReserve: () => void;
  onGetDirections: () => void;
  distance?: number;
  onVenueDataLoaded?: (business: Business) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available?: boolean;
}

interface Special {
  id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  time_end?: string;
  image_url?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  price?: number;
}

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  cover_image_url?: string;
  logo_url?: string;
  average_rating?: number;
  total_reviews?: number;
  cuisine_types?: string[];
  business_type?: string;
  price_range: string;
  opening_hours?: Record<string, string>;
  age_group?: string; // Backward compatibility - old format
  age_groups?: string[]; // New format - multiple selection
}

interface VenueData {
  business: Business;
  menu_items: MenuItem[];
  specials: Special[];
  events: Event[];
}

export function VenueDetail({ venueId, onBack, onReserve, onGetDirections, distance, onVenueDataLoaded, isFavorite, onToggleFavorite }: VenueDetailProps) {
  const [venueData, setVenueData] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [eventInterests, setEventInterests] = useState<Record<string, 'interested' | 'going' | null>>({});

  useEffect(() => {
    async function fetchVenueData() {
      try {
        setLoading(true);
        
        const data = await api.getBusinessById(venueId, true);
        
        if (data && data.business) {
          setVenueData(data);
          setError(null);
          
          // Track the view for analytics
          api.trackBusinessView(data.business.id).catch(() => {
            // Silently ignore tracking failures
          });
          
          if (onVenueDataLoaded) {
            onVenueDataLoaded(data.business);
          }
        } else if (data) {
          console.error(`[VenueDetail] Invalid data structure:`, data);
          setError('Invalid venue data received');
        } else {
          console.error(`[VenueDetail] No data received for venue: ${venueId}`);
          setError('Venue not found');
        }
      } catch (err) {
        console.error(`[VenueDetail] Error fetching venue ${venueId}:`, err);
        setError('Failed to load venue details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchVenueData();
  }, [venueId]); // Only depend on venueId to prevent infinite loop

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error || !venueData) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-gray-600 mb-4">{error || 'Venue not found'}</p>
            <Button onClick={onBack} variant="outline">Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const { business, menu_items, specials, events } = venueData;

  // Add safety check for business data
  if (!business) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-gray-600 mb-4">Business data not available</p>
            <Button onClick={onBack} variant="outline">Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  // Backward compatibility: Convert old age_group (string) to age_groups (array)
  const displayAgeGroups = business.age_groups || (business.age_group ? [business.age_group] : []);

  // Group menu items by category - SHOW ALL ITEMS including unavailable ones
  const menuByCategory = (menu_items || [])
    .reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

  // Get logo initial
  const logoInitial = business.logo_url || business.name.charAt(0).toUpperCase();

  // Check if logo_url is a valid URL (for DiceBear SVG, image URLs, figma:asset, etc.)
  const isLogoUrl = business.logo_url && (
    business.logo_url.startsWith('http://') || 
    business.logo_url.startsWith('https://') ||
    business.logo_url.startsWith('data:') ||
    business.logo_url.startsWith('figma:asset') ||
    business.logo_url.startsWith('blob:')
  );

  console.log(`🖼️ [VenueDetail] Logo for ${business.name}:`, { 
    logo_url: business.logo_url, 
    isLogoUrl,
    logoPreview: business.logo_url?.substring(0, 80)
  });

  // Format opening hours
  const formatOpeningHours = () => {
    if (!business.opening_hours) {
      return <span>Hours not available</span>;
    }
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const todayHours = business.opening_hours[today];
    
    if (!todayHours) {
      return <span>Hours not available</span>;
    }
    
    // Handle new format with open/close/closed fields
    if (typeof todayHours === 'object') {
      if (todayHours.closed) {
        return <span className="text-red-600">Closed today</span>;
      }
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      const isOpen = currentTimeStr >= todayHours.open && currentTimeStr <= todayHours.close;
      
      return (
        <span className={isOpen ? 'text-green-600' : 'text-orange-600'}>
          {isOpen ? 'Open now' : 'Closed'} • {todayHours.open} - {todayHours.close}
        </span>
      );
    }
    
    // Handle old string format for backward compatibility
    return <span>Open now • {todayHours}</span>;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Image */}
      <div className="relative h-48">
        <img 
          src={business.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) {
                onToggleFavorite();
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isFavorite 
                ? 'bg-red-500 text-white scale-110' 
                : 'bg-white text-gray-600 hover:scale-105'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        {/* Logo Badge */}
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg overflow-hidden">
            {isLogoUrl ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              logoInitial
            )}
          </div>
        </div>
      </div>

      {/* Venue Info */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold mb-1">{business.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{business.average_rating?.toFixed(1) || 'N/A'}</span>
              <span>({business.total_reviews || 0} reviews)</span>
            </div>
          </div>
        </div>
        
        {/* Establishment Type & Cuisine Tags */}
        {(business.business_type || (business.cuisine_types && business.cuisine_types.length > 0) || displayAgeGroups.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {business.business_type && (
              <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-xs font-semibold capitalize">
                {business.business_type}
              </span>
            )}
            {displayAgeGroups.map((ageGroup) => (
              <span key={ageGroup} className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full text-xs font-semibold">
                {ageGroup === 'all-ages' && '👨‍👩‍👧‍👦 All Ages'}
                {ageGroup === 'family-with-pets' && '🐕 Pet Friendly'}
                {ageGroup === 'adults-18+' && '🔞 Adults 18+'}
                {ageGroup === 'adults-21+' && '🍸 Adults 21+'}
                {ageGroup === 'events-held' && '🎉 Events Held'}
                {ageGroup === 'other' && '✨ Special Atmosphere'}
              </span>
            ))}
            {business.cuisine_types && business.cuisine_types.slice(0, 3).map((cuisine) => (
              <span key={cuisine} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {cuisine}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{business.address}, {business.city}</span>
          {distance && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{distance.toFixed(1)} km</span>}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          {formatOpeningHours()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-3 border-b border-gray-100 flex gap-2">
        <Button 
          onClick={onReserve}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        >
          Reserve Table
        </Button>
        <Button 
          onClick={onGetDirections}
          variant="outline"
          className="flex-1"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Directions
        </Button>
        {business.phone && (
          <Button 
            variant="outline"
            size="icon"
            onClick={() => setShowPhoneModal(true)}
          >
            <Phone className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="menu" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b border-gray-100 bg-white px-6">
          <TabsTrigger value="menu" className="data-[state=active]:border-purple-600 data-[state=active]:text-purple-600">
            Menu
          </TabsTrigger>
          <TabsTrigger value="specials" className="data-[state=active]:border-purple-600 data-[state=active]:text-purple-600">
            Specials
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:border-purple-600 data-[state=active]:text-purple-600">
            Events
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:border-purple-600 data-[state=active]:text-purple-600">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:border-purple-600 data-[state=active]:text-purple-600">
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="flex-1 overflow-y-auto p-6 mt-0">
          {Object.keys(menuByCategory).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Menu not available</p>
            </div>
          ) : (
            Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h3 className="font-bold text-lg mb-3 capitalize">{category}</h3>
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const isUnavailable = item.is_available === false;
                    return (
                      <div 
                        key={item.id || `${category}-${index}`} 
                        className={`flex justify-between items-start py-2 border-b border-gray-100 last:border-0 ${
                          isUnavailable ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${
                              isUnavailable ? 'text-gray-500 line-through' : ''
                            }`}>
                              {item.name}
                            </h4>
                            {isUnavailable && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                Unavailable
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${
                            isUnavailable ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                        <span className={`font-semibold text-sm ml-4 ${
                          isUnavailable ? 'text-gray-400 line-through' : ''
                        }`}>
                          R{item.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="specials" className="p-6 mt-0">
          <h3 className="font-bold text-lg mb-4">Today's Specials</h3>
          {specials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No specials available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {specials.map((special, index) => (
                <SpecialCard 
                  key={special.id || `special-${index}`}
                  image={special.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'}
                  title={special.title}
                  venue={business.name}
                  endTime={special.time_end || 'All day'}
                  badge={special.discount_percentage ? `${special.discount_percentage}% OFF` : undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="p-6 mt-0">
          <h3 className="font-bold text-lg mb-4">Upcoming Events</h3>
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => {
                const eventDate = new Date(event.event_date);
                const day = eventDate.getDate();
                const month = eventDate.toLocaleString('en-US', { month: 'short' });
                const eventId = event.id || `event-${index}`;
                const currentInterest = eventInterests[eventId];
                
                return (
                  <div key={eventId} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg w-14 h-14 flex-shrink-0">
                        <div className="text-lg font-bold leading-none">{day}</div>
                        <div className="text-xs uppercase">{month}</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{event.title}</h4>
                        <p className="text-xs text-gray-600 mb-1">
                          {event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}
                        </p>
                        <p className="text-xs text-gray-500">{event.description}</p>
                        {event.price && (
                          <p className="text-xs text-gray-600 mt-1">R{event.price} per person</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Interest Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEventInterests(prev => ({
                          ...prev,
                          [eventId]: prev[eventId] === 'interested' ? null : 'interested'
                        }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          currentInterest === 'interested'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-cyan-400 hover:bg-cyan-50'
                        }`}
                      >
                        {currentInterest === 'interested' ? '✓ Interested' : '⭐ Interested'}
                      </button>
                      <button
                        onClick={() => setEventInterests(prev => ({
                          ...prev,
                          [eventId]: prev[eventId] === 'going' ? null : 'going'
                        }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          currentInterest === 'going'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {currentInterest === 'going' ? '✓ Going' : '🎉 Going'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="p-6 mt-0 h-full overflow-y-auto">
          <RatingReview businessId={venueId} />
        </TabsContent>

        <TabsContent value="about" className="p-6 mt-0">
          <h3 className="font-bold text-lg mb-4">About {business.name}</h3>
          <p className="text-sm text-gray-600 mb-6">
            {business.description}
          </p>
          
          <div className="space-y-4">
            {business.opening_hours && Object.keys(business.opening_hours).length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Opening Hours
                </h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(business.opening_hours).map(([day, hours]) => {
                    // Handle new format
                    if (typeof hours === 'object' && 'open' in hours && 'close' in hours) {
                      return (
                        <div key={day} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                          <span className="capitalize font-medium text-gray-700">{day}</span>
                          {hours.closed ? (
                            <span className="text-red-600 font-medium">Closed</span>
                          ) : (
                            <span className="text-gray-600">{hours.open} - {hours.close}</span>
                          )}
                        </div>
                      );
                    }
                    // Handle old string format
                    return (
                      <div key={day} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                        <span className="capitalize font-medium text-gray-700">{day}</span>
                        <span className="text-gray-600">{hours}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-sm mb-2">Contact</h4>
              <div className="space-y-1 text-sm text-gray-600">
                {business.phone && (
                  <div>📞 {business.phone}</div>
                )}
                {business.email && (
                  <div>✉️ {business.email}</div>
                )}
                {business.website && (
                  <div>🌐 {business.website}</div>
                )}
              </div>
            </div>

            {business.business_type && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Establishment Type</h4>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                    {business.business_type}
                  </span>
                </div>
              </div>
            )}

            {business.cuisine_types && business.cuisine_types.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Cuisine</h4>
                <div className="flex flex-wrap gap-2">
                  {business.cuisine_types.map((cuisine) => (
                    <span key={cuisine} className="px-3 py-1 bg-gray-100 rounded-full text-xs">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-sm mb-2">Price Range</h4>
              <div className="text-sm text-gray-600">{business.price_range}</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Phone Modal */}
      {showPhoneModal && (
        <PhoneModal 
          phoneNumber={business.phone || ''} 
          venueName={business.name}
          onClose={() => setShowPhoneModal(false)}
        />
      )}
    </div>
  );
}