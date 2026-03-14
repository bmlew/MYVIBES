import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { PriceRecommendations } from '@/app/components/PriceRecommendations';
import { SUBSCRIPTION_CONFIG } from '@/config/subscription';
import { 
  Menu, 
  X, 
  Home, 
  UtensilsCrossed, 
  Percent, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus,
  Eye,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  LogOut,
  LayoutDashboard,
  Menu as MenuIcon,
  Brain,
  Zap,
  Upload,
  FileDown,
  MapPin,
  RefreshCw,
  Clock,
  Trash2,
  Image as ImageIcon,
  Video,
  Database
} from 'lucide-react';
import { PerformanceOverview } from '@/app/components/PerformanceOverview';
import { RecentCheckIns } from '@/app/components/RecentCheckIns';
import { Leaderboard } from '@/app/components/Leaderboard';
import { DataSeeder } from '@/app/components/debug/DataSeeder';
import { AIInsights } from '@/app/components/AIInsights';
import { AnalyticsCharts } from '@/app/components/AnalyticsCharts';
import { BusinessProfileChecklist } from '@/app/components/BusinessProfileChecklist';
import { SocialMediaAdsManager } from '@/app/components/SocialMediaAdsManager';
import { ReservationsManager } from '@/app/components/ReservationsManager';
import { BusinessProfileSettings } from '@/app/components/BusinessProfileSettings';
import { Toast, useToast } from '@/app/components/Toast';
import { MyVibesLogo } from '@/app/components/MyVibesLogo';
import { projectId, publicAnonKey } from '/utils/supabase/info';

type DashboardView = 'overview' | 'menu' | 'specials' | 'events' | 'analytics' | 'reviews' | 'settings' | 'ml-insights' | 'ads' | 'reservations' | 'debug';

interface Special {
  id?: string;
  business_id: string;
  title: string;
  description: string;
  price?: string | number;
  discount_percentage?: number;
  start_date: string;
  end_date: string;
  time_start?: string;
  time_end?: string;
  days_of_week?: number[];
  is_active: boolean;
  view_count: number;
  image_url?: string;
}

interface MenuItem {
  id?: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  category: 'starters' | 'mains' | 'drinks' | 'desserts';
  is_available: boolean;
  image_url?: string;
}

interface Event {
  id?: string;
  business_id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location?: string;
  interested_count: number;
  is_active: boolean;
  image_url?: string;
}

interface Review {
  id: string;
  business_id: string;
  customer_name: string;
  customer_email?: string;
  customer_mobile?: string;
  customer_avatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful_count?: number;
  business_reply?: string;
  business_reply_date?: string;
}

interface SocialMediaAd {
  id: string;
  business_id: string;
  business_name: string;
  platform: 'tiktok' | 'instagram' | 'facebook' | 'google';
  video_url: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;
  views: number;
  clicks: number;
}

interface BusinessDashboardProps {
  onLogout?: () => void;
  businessName?: string;
}

// Default opening hours constant to prevent object recreation
const DEFAULT_OPENING_HOURS = {
  monday: { open: '09:00', close: '22:00', closed: false },
  tuesday: { open: '09:00', close: '22:00', closed: false },
  wednesday: { open: '09:00', close: '22:00', closed: false },
  thursday: { open: '09:00', close: '22:00', closed: false },
  friday: { open: '09:00', close: '23:00', closed: false },
  saturday: { open: '10:00', close: '23:00', closed: false },
  sunday: { open: '10:00', close: '21:00', closed: false }
};

export function BusinessDashboard({ onLogout, businessName }: BusinessDashboardProps) {
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast();
  const businessId = localStorage.getItem('business_id');

  const getAuthToken = () => {
    // Check if we're using a test business ID
    const businessId = localStorage.getItem('business_id');
    const TEST_IDS = ['palms', 'ocean-basket', 'marble', 'col-cacchio', 'tashas', 'nandos', 'karma', 'butchers-grill'];
    
    // Always use anon key for test businesses
    if (businessId && TEST_IDS.includes(businessId)) {
      return publicAnonKey;
    }

    const token = localStorage.getItem('business_auth_token');
    
    // Validate token format (basic JWT check: 3 parts)
    // This prevents sending garbage tokens that cause 401 Invalid JWT errors from the Gateway
    if (token && token !== 'undefined' && token !== 'null' && token.split('.').length === 3) {
      // Check for token expiration to avoid 401 from Gateway
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.warn('Token expired');
          return null;
        }
      } catch (e) {
        console.error('Error parsing token:', e);
        return null;
      }
      return token;
    }
    
    // No valid token found
    return null;
  };

  // Helper to handle API errors globally
  const handleApiError = (response: Response, action: string) => {
    if (response.status === 401 || response.status === 403) {
      console.error(`Auth error during ${action}: ${response.status}`);
      showError('Session expired. Please log in again.');
      if (onLogout) onLogout();
      return true; // Handled
    }
    return false; // Not handled
  };

  useEffect(() => {
    if (!businessId && onLogout) {
      onLogout();
    }
  }, [businessId, onLogout]);

  const [subscriptionPrice, setSubscriptionPrice] = useState(SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED);
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [showAddSpecialForm, setShowAddSpecialForm] = useState(false);
  const [showAddMenuItemForm, setShowAddMenuItemForm] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingSpecial, setEditingSpecial] = useState<Special | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [specialImagePreview, setSpecialImagePreview] = useState<string | null>(null);
  const [menuImagePreview, setMenuImagePreview] = useState<string | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [specials, setSpecials] = useState<Special[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [ads, setAds] = useState<SocialMediaAd[]>([]);
  const [showAddAdForm, setShowAddAdForm] = useState(false);
  const [adFormData, setAdFormData] = useState({
    platform: 'instagram' as 'tiktok' | 'instagram' | 'facebook' | 'google',
    video_url: '',
    title: '',
    description: ''
  });
  const [submittingAd, setSubmittingAd] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingSpecials, setLoadingSpecials] = useState(true);
  const [loadingMenuItems, setLoadingMenuItems] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [savingSpecial, setSavingSpecial] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [replyingToReview, setReplyingToReview] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState(false);
  
  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [specialFormData, setSpecialFormData] = useState({
    title: '',
    description: '',
    price: '',
    percentage: '',
    discountType: 'fixed_price' as 'fixed_price' | 'percentage',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    daysOfWeek: [] as number[]
  });
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'mains' as 'starters' | 'mains' | 'drinks' | 'desserts'
  });
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: ''
  });
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    viewsData: [] as Array<{ date: string; views: number; clicks: number }>,
    categoryData: [] as Array<{ name: string; value: number }>,
    performanceData: [] as Array<{ name: string; engagement: number; revenue: number }>
  });
  const [settingsFormData, setSettingsFormData] = useState({
    name: 'The Palms Restaurant & Bar',
    address: '123 Rivonia Road, Sandton',
    phone: '+27 11 123 4567',
    email: 'info@thepalms.co.za',
    description: 'A contemporary restaurant and bar in the heart of Sandton...',
    logo_url: '',
    cover_image_url: '',
    city: 'Johannesburg',
    business_type: 'restaurant',
    age_group: 'all-ages',
    age_groups: [] as string[],
    cuisine_types: [] as string[],
    latitude: 0,
    longitude: 0,
    opening_hours: DEFAULT_OPENING_HOURS,
    avg_price_min: 0,
    avg_price_max: 0
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [logoImagePreview, setLogoImagePreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; formatted_address?: string } | null>(null);
  const [showProfileChecklist, setShowProfileChecklist] = useState(false);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
  
  // Image loading states
  const [logoImageLoading, setLogoImageLoading] = useState(false);
  const [coverImageLoading, setCoverImageLoading] = useState(false);
  const [logoImageError, setLogoImageError] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  
  // ML Insights subscription state - Always active as part of R499 subscription
  const [mlInsightsSubscribed, setMlInsightsSubscribed] = useState(true);
  const [mlInsightsData, setMlInsightsData] = useState<any>(null);
  const [loadingMlInsights, setLoadingMlInsights] = useState(false);
  const [creatingSpecialIndex, setCreatingSpecialIndex] = useState<number | null>(null);

  // Initialize default business_id if not set
  useEffect(() => {
    if (!localStorage.getItem('business_id')) {
      localStorage.setItem('business_id', 'palms');
      console.log('Initialized default business_id: palms');
    }
    
    // ML Insights is now always included - set to true in localStorage
    localStorage.setItem('ml_insights_subscribed', 'true');
    
    // Fetch platform settings to get current subscription price
    const fetchPlatformSettings = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/platform/settings`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        if (response.ok) {
          const settings = await response.json();
          if (settings.monthly_subscription_fee) {
            setSubscriptionPrice(`R${settings.monthly_subscription_fee}`);
          }
        }
      } catch (error) {
        console.error('Error fetching platform settings:', error);
        // Keep default SUBSCRIPTION_CONFIG value
      }
    };
    
    fetchPlatformSettings();
  }, []);

  // Helper function to filter valid menu items
  const filterValidMenuItems = (items: MenuItem[]): MenuItem[] => {
    const businessId = localStorage.getItem('business_id') || 'palms';
    return items.filter((item: MenuItem) => {
      if (!item) return false;
      if (!item.id) {
        console.warn('Skipping menu item without ID:', item);
        return false;
      }
      if (item.business_id !== businessId) {
        return false;
      }
      return true;
    });
  };

  // Load business settings from backend on mount
  useEffect(() => {
    if (hasLoadedSettings) return; // Prevent multiple loads
    
    const fetchBusinessSettings = async () => {
      try {
        const businessId = localStorage.getItem('business_id');
        if (!businessId) return;

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/businesses/${businessId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Loaded business settings from backend:', data);
          
          // Extract business object from response
          const business = data.business || data;
          
          setSettingsFormData({
            name: business.name || '',
            address: business.address || '',
            phone: business.phone || '',
            email: business.email || '',
            description: business.description || '',
            logo_url: business.logo_url || '',
            cover_image_url: business.cover_image_url || '',
            city: business.city || 'Johannesburg',
            business_type: business.business_type || 'restaurant',
            latitude: business.latitude || 0,
            longitude: business.longitude || 0,
            opening_hours: business.opening_hours || DEFAULT_OPENING_HOURS,
            avg_price_min: business.avg_price_min || 0,
            avg_price_max: business.avg_price_max || 0,
            cuisine_types: business.cuisine_types || [],
            age_groups: business.age_groups || [],
            age_group: business.age_group || ''
          } as any);
          
          if (business.logo_url) {
            setLogoImagePreview(business.logo_url);
            setLogoImageLoading(true);
            setLogoImageError(false);
          }
          
          if (business.cover_image_url) {
            setCoverImagePreview(business.cover_image_url);
            setCoverImageLoading(true);
            setCoverImageError(false);
          }
          
          // Load existing coordinates if available
          if (business.latitude && business.longitude) {
            setCoordinates({
              latitude: business.latitude,
              longitude: business.longitude
            });
          }
          
          // Cache for offline viewing
          localStorage.setItem('business_settings_cache', JSON.stringify({
            name: business.name,
            address: business.address,
            city: business.city,
            phone: business.phone,
            email: business.email,
            description: business.description,
            logo_url: business.logo_url,
            cover_image_url: business.cover_image_url,
            latitude: business.latitude || 0,
            longitude: business.longitude || 0,
            opening_hours: business.opening_hours,
            avg_price_min: business.avg_price_min || 0,
            avg_price_max: business.avg_price_max || 0,
            cuisine_types: business.cuisine_types || [],
            age_groups: business.age_groups || []
          }));
          
          setHasLoadedSettings(true);
        } else {
          // Fallback to cached data if backend fails
          const cached = localStorage.getItem('business_settings_cache');
          if (cached) {
            const parsed = JSON.parse(cached);
            setSettingsFormData({
              ...parsed,
              opening_hours: parsed.opening_hours || DEFAULT_OPENING_HOURS
            });
            if (parsed.logo_url) {
              setLogoImagePreview(parsed.logo_url);
            }
            if (parsed.cover_image_url) {
              setCoverImagePreview(parsed.cover_image_url);
            }
            console.log('Loaded settings from cache (backend unavailable)');
          }
          setHasLoadedSettings(true);
        }
      } catch (error) {
        console.error('Error fetching business settings:', error);
        // Fallback to cached data
        const cached = localStorage.getItem('business_settings_cache');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setSettingsFormData({
              ...parsed,
              opening_hours: parsed.opening_hours || DEFAULT_OPENING_HOURS
            });
            if (parsed.logo_url) {
              setLogoImagePreview(parsed.logo_url);
            }
            if (parsed.cover_image_url) {
              setCoverImagePreview(parsed.cover_image_url);
            }
            console.log('Loaded settings from cache (network error)');
          } catch (e) {
            console.error('Error parsing cached settings:', e);
          }
        }
        setHasLoadedSettings(true);
      }
    };

    fetchBusinessSettings();
  }, [hasLoadedSettings]);

  // Fetch specials from API
  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        setLoadingSpecials(true);
        const businessId = localStorage.getItem('business_id');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          // Filter specials to only show this business's specials
          const mySpecials = (data.specials || []).filter((s: Special) => s && s.business_id === businessId);
          console.log(`[BusinessDashboard] Loaded ${mySpecials.length} specials for business ${businessId}`);
          setSpecials(mySpecials);
        }
      } catch (error) {
        console.error('Error fetching specials:', error);
        // Offline mode - use cached data
        const cached = localStorage.getItem('business_specials');
        if (cached) {
          setSpecials(JSON.parse(cached));
        }
      } finally {
        setLoadingSpecials(false);
      }
    };

    if (currentView === 'specials') {
      fetchSpecials();
    }
  }, [currentView]);

  // Cache specials when they change
  useEffect(() => {
    if (specials.length > 0) {
      localStorage.setItem('business_specials', JSON.stringify(specials));
    }
  }, [specials]);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoadingMenuItems(true);
        const businessId = localStorage.getItem('business_id');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          // Filter menu items to only show this business's items
          const myMenuItems = (data.menu_items || []).filter((item: MenuItem) => item && item.business_id === businessId);
          const validMenuItems = filterValidMenuItems(myMenuItems);
          console.log(`[BusinessDashboard] Loaded ${validMenuItems.length} valid menu items for business ${businessId}`);
          setMenuItems(validMenuItems);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        // Offline mode - use cached data
        const cached = localStorage.getItem('business_menu_items');
        if (cached) {
          setMenuItems(JSON.parse(cached));
        }
      } finally {
        setLoadingMenuItems(false);
      }
    };

    // Load menu items on overview, menu view, or ml-insights view
    if (currentView === 'menu' || currentView === 'overview' || currentView === 'ml-insights') {
      fetchMenuItems();
    }
  }, [currentView]);

  // Cache menu items when they change
  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem('business_menu_items', JSON.stringify(menuItems));
    }
  }, [menuItems]);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const businessId = localStorage.getItem('business_id');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/events`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          // Filter events to only show this business's events
          const myEvents = (data.events || []).filter((event: Event) => event && event.business_id === businessId);
          console.log(`[BusinessDashboard] Loaded ${myEvents.length} events for business ${businessId}`);
          setEvents(myEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Offline mode - use cached data
        const cached = localStorage.getItem('business_events');
        if (cached) {
          setEvents(JSON.parse(cached));
        }
      } finally {
        setLoadingEvents(false);
      }
    };

    if (currentView === 'events') {
      fetchEvents();
    }
  }, [currentView]);

  // Cache events when they change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('business_events', JSON.stringify(events));
    }
  }, [events]);

  // Fetch reviews from API - load on mount and when viewing reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const businessId = localStorage.getItem('business_id');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/reviews/${businessId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log('[BusinessDashboard] Loaded reviews:', data.reviews?.length || 0);
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Offline mode - use cached data
        const cached = localStorage.getItem('business_reviews');
        if (cached) {
          setReviews(JSON.parse(cached));
        }
      } finally {
        setLoadingReviews(false);
      }
    };

    // Load reviews on mount and when viewing reviews tab
    fetchReviews();
  }, []);

  // Cache reviews when they change
  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem('business_reviews', JSON.stringify(reviews));
    }
  }, [reviews]);

  // Fetch analytics from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        const businessId = localStorage.getItem('business_id');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/analytics/business/${businessId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log('[BusinessDashboard] Loaded analytics:', data);
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    // Load analytics when viewing overview or analytics tab
    if (currentView === 'overview' || currentView === 'analytics') {
      fetchAnalytics();
    }
  }, [currentView]);

  // Handle reply to review
  const handleReplyToReview = async (reviewId: string) => {
    const reply = replyText[reviewId];
    
    if (!reply || !reply.trim()) {
      showError('Please enter a reply');
      return;
    }

    try {
      setSendingReply(true);
      const businessId = localStorage.getItem('business_id');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/reviews/${reviewId}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            business_id: businessId,
            reply_text: reply
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      const result = await response.json();
      
      // Update local reviews state
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { ...review, business_reply: reply, business_reply_date: new Date().toISOString() }
            : review
        )
      );

      // Clear reply text
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      setReplyingToReview(null);

      // If WhatsApp link was generated, open it
      if (result.whatsapp_link) {
        window.open(result.whatsapp_link, '_blank');
        showSuccess('Reply sent! WhatsApp notification opened in new tab');
      } else {
        showSuccess('Reply sent successfully');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      showError('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Fetch AI insights and analytics when analytics view is opened
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (currentView !== 'analytics') return;

      try {
        setLoadingInsights(true);

        // Fetch AI insights from business insights endpoint
        const businessId = localStorage.getItem('business_id');
        const insightsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/businesses/${businessId}/insights`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          setAiInsights(insightsData);
        }

        // Generate mock analytics data (in production, fetch from real analytics endpoint)
        const mockViewsData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          mockViewsData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: Math.floor(Math.random() * 500) + 300,
            clicks: Math.floor(Math.random() * 200) + 50
          });
        }

        const mockCategoryData = [
          { name: 'Menu', value: 3450 },
          { name: 'Specials', value: 2150 },
          { name: 'Events', value: 1890 },
          { name: 'Reviews', value: 1200 },
          { name: 'Direct', value: 850 }
        ];

        const mockPerformanceData = [
          { name: 'Specials', engagement: 85, revenue: 92 },
          { name: 'Events', engagement: 78, revenue: 84 },
          { name: 'Menu', engagement: 91, revenue: 88 },
          { name: 'Happy Hour', engagement: 95, revenue: 96 }
        ];

        setAnalyticsData({
          viewsData: mockViewsData,
          categoryData: mockCategoryData,
          performanceData: mockPerformanceData
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchAnalytics();
  }, [currentView]);

  // Load ML Insights when view is opened
  useEffect(() => {
    if (currentView === 'ml-insights' && mlInsightsSubscribed && loadingMlInsights) {
      // Simulate loading ML insights
      const timer = setTimeout(() => {
        setLoadingMlInsights(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentView, mlInsightsSubscribed]); // Removed loadingMlInsights from dependencies

  const handleEndSpecial = async (specialId: string) => {
    if (!confirm('Are you sure you want to end this special?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials/${specialId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (handleApiError(response, 'end special')) return;

      if (response.ok) {
        // Remove from state
        setSpecials(specials.filter(s => s.id !== specialId));
        alert('Special ended successfully!');
      } else {
        alert('Failed to end special. Please try again.');
      }
    } catch (error) {
      console.error('Error ending special:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSpecialImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishSpecial = async () => {
    // Prevent multiple simultaneous saves
    if (savingSpecial) {
      console.log('Save already in progress, ignoring duplicate click');
      return;
    }

    // Validate required fields
    if (!specialFormData.title || !specialFormData.startDate || !specialFormData.endDate) {
      showError('Please fill in all required fields (Title, Start Date, End Date)');
      return;
    }

    // Validate price or percentage based on discount type
    if (specialFormData.discountType === 'fixed_price' && !specialFormData.price) {
      showError('Please enter a price for the special');
      return;
    }

    if (specialFormData.discountType === 'percentage' && !specialFormData.percentage) {
      showError('Please enter a discount percentage');
      return;
    }

    // If editing, verify we have a valid special ID
    if (editingSpecial && !editingSpecial.id) {
      console.error('Cannot update special without ID:', editingSpecial);
      showError('Cannot update special: Missing ID. Please refresh and try again.');
      return;
    }

    try {
      setSavingSpecial(true);
      const businessId = localStorage.getItem('business_id');
      
      const specialData = {
        business_id: businessId,
        title: specialFormData.title,
        description: specialFormData.description,
        price: specialFormData.discountType === 'fixed_price' ? specialFormData.price : null,
        discount_percentage: specialFormData.discountType === 'percentage' ? Number(specialFormData.percentage) : null,
        start_date: specialFormData.startDate,
        end_date: specialFormData.endDate,
        time_start: specialFormData.startTime || null,
        time_end: specialFormData.endTime || null,
        days_of_week: specialFormData.daysOfWeek.length > 0 ? specialFormData.daysOfWeek : null,
        image_url: specialImagePreview
      };

      console.log('Saving special:', specialData);
      if (editingSpecial) {
        console.log('Editing special ID:', editingSpecial.id);
      }

      const url = editingSpecial
        ? `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials/${editingSpecial.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials`;
      
      const method = editingSpecial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(specialData)
      });

      if (handleApiError(response, 'save special')) return;

      if (response.ok) {
        const data = await response.json();
        console.log('Special saved successfully:', data);
        
        // Refresh specials list
        const specialsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (specialsResponse.ok) {
          const specialsData = await specialsResponse.json();
          const mySpecials = (specialsData.specials || []).filter((s: Special) => s && s.business_id === businessId);
          setSpecials(mySpecials);
          localStorage.setItem('business_specials', JSON.stringify(mySpecials));
        }
        
        showSuccess(editingSpecial ? 'Special updated successfully!' : 'Special published successfully!');
        
        // Reset form
        setShowAddSpecialForm(false);
        setEditingSpecial(null);
        setSpecialImagePreview(null);
        setSpecialFormData({
          title: '',
          description: '',
          price: '',
          percentage: '',
          discountType: 'fixed_price',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
          daysOfWeek: []
        });
      } else {
        const error = await response.json();
        console.error('Failed to save special:', error);
        showError(`❌ ${error.error || 'Failed to save special'}: ${editingSpecial?.id || 'new'}`);
      }
    } catch (error) {
      console.error('Error saving special:', error);
      showError('Network error. Please check your connection and try again.');
    } finally {
      setSavingSpecial(false);
    }
  };

  const handleEditSpecial = (special: Special) => {
    console.log('=== Edit Special ===');
    console.log('Special object:', special);
    console.log('Special ID:', special.id);
    console.log('Special price:', special.price);
    console.log('Special discount_percentage:', special.discount_percentage);
    
    setEditingSpecial(special);
    setSpecialFormData({
      title: special.title || '',
      description: special.description || '',
      price: special.price ? String(special.price) : '',
      percentage: special.discount_percentage ? String(special.discount_percentage) : '',
      discountType: (special.discount_percentage && special.discount_percentage > 0) ? 'percentage' : 'fixed_price',
      startDate: special.start_date || '',
      endDate: special.end_date || '',
      startTime: special.time_start || '',
      endTime: special.time_end || '',
      daysOfWeek: special.days_of_week || []
    });
    setSpecialImagePreview(special.image_url || null);
    setShowAddSpecialForm(true);
  };

  const handleAddMenuItem = async () => {
    // Validate required fields
    if (!menuFormData.name || !menuFormData.price || !menuFormData.category) {
      alert('Please fill in all required fields (Name, Price, Category)');
      return;
    }

    // Validate category
    if (!['starters', 'mains', 'drinks', 'desserts'].includes(menuFormData.category)) {
      alert('Invalid category. Must be one of: starters, mains, drinks, desserts');
      return;
    }

    // Validate price
    const priceNum = parseFloat(menuFormData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Invalid price. Please enter a valid number.');
      return;
    }

    try {
      const businessId = localStorage.getItem('business_id');
      
      // Prepare menu item data
      const menuItemData = {
        business_id: businessId,
        name: menuFormData.name.trim(),
        description: menuFormData.description.trim(),
        price: priceNum,
        category: menuFormData.category,
        is_available: true,
        image_url: menuImagePreview || undefined
      };

      console.log('Adding menu item:', menuItemData);

      // Send to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(menuItemData)
        }
      );

      if (handleApiError(response, 'add menu item')) return;

      if (response.ok) {
        // Clear business cache to force fresh data fetch by customer app
        const cacheKey = `vibespot_cache_businesses_${businessId}`;
        localStorage.removeItem(cacheKey);
        console.log(`✅ Cleared cache for business: ${businessId}`);
        
        alert('Menu item added successfully!');
        
        // Refresh menu items
        const refreshResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const myMenuItems = (data.menu_items || []).filter((item: MenuItem) => item && item.business_id === businessId);
          setMenuItems(filterValidMenuItems(myMenuItems));
        }
        
        // Reset form
        setShowAddMenuItemForm(false);
        setMenuImagePreview(null);
        setMenuFormData({
          name: '',
          description: '',
          price: '',
          category: 'mains' as 'starters' | 'mains' | 'drinks' | 'desserts'
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to add menu item:', errorData);
        alert('Failed to add menu item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleDeleteMenuItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items/${itemId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (handleApiError(response, 'delete menu item')) return;

      if (response.ok) {
        // Clear business cache to force fresh data fetch by customer app
        const businessId = localStorage.getItem('business_id');
        const cacheKey = `vibespot_cache_businesses_${businessId}`;
        localStorage.removeItem(cacheKey);
        console.log(`✅ Cleared cache for business: ${businessId}`);
        
        alert('Menu item deleted successfully!');
        
        // Refresh menu items
        const refreshResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const businessId = localStorage.getItem('business_id') || 'palms';
          const myMenuItems = (data.menu_items || []).filter((item: MenuItem) => item && item.business_id === businessId);
          setMenuItems(filterValidMenuItems(myMenuItems));
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to delete menu item:', errorData);
        alert('Failed to delete menu item. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleDeleteCategory = async (category: 'starters' | 'mains' | 'drinks' | 'desserts') => {
    const itemsInCategory = menuItems.filter(item => item.category === category);
    
    if (itemsInCategory.length === 0) {
      alert(`No items in ${category} to delete.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL ${itemsInCategory.length} items in ${category}? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = itemsInCategory.map(item => 
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items/${item.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`
            }
          }
        )
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.ok).length;

      if (successCount === itemsInCategory.length) {
        alert(`Successfully deleted all ${successCount} items from ${category}!`);
      } else {
        alert(`Partially deleted: ${successCount} of ${itemsInCategory.length} items deleted.`);
      }

      // Refresh menu items
      const refreshResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const businessId = localStorage.getItem('business_id');
        const myMenuItems = (data.menu_items || []).filter((item: MenuItem) => item && item.business_id === businessId);
        setMenuItems(filterValidMenuItems(myMenuItems));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleDeleteAllMenuItems = async () => {
    if (menuItems.length === 0) {
      alert('No menu items to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL ${menuItems.length} menu items? This action cannot be undone.`)) {
      return;
    }

    // Double confirmation for safety
    if (!confirm(`FINAL WARNING: This will permanently delete your entire menu (${menuItems.length} items). Are you absolutely sure?`)) {
      return;
    }

    try {
      const deletePromises = menuItems.map(item => 
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items/${item.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`
            }
          }
        )
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.ok).length;

      if (successCount === menuItems.length) {
        alert(`Successfully deleted all ${successCount} menu items!`);
        setMenuItems([]);
      } else {
        alert(`Partially deleted: ${successCount} of ${menuItems.length} items deleted.`);
        
        // Refresh menu items to see what's left
        const refreshResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const businessId = localStorage.getItem('business_id') || 'palms';
          const myMenuItems = (data.menu_items || []).filter((item: MenuItem) => item && item.business_id === businessId);
          setMenuItems(filterValidMenuItems(myMenuItems));
        }
      }
    } catch (error) {
      console.error('Error deleting all menu items:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleEditMenuItem = (item: MenuItem) => {
    console.log('Editing menu item:', item);
    setEditingMenuItem(item);
    setMenuFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price ? String(item.price) : '',
      category: item.category as 'starters' | 'mains' | 'drinks' | 'desserts'
    });
    setMenuImagePreview(item.image_url || null);
    setShowAddMenuItemForm(true);
  };

  const handleUpdateMenuItem = async () => {
    // Validate required fields
    if (!menuFormData.name || !menuFormData.price || !menuFormData.category) {
      alert('Please fill in all required fields (Name, Price, Category)');
      return;
    }

    // Validate category
    if (!['starters', 'mains', 'drinks', 'desserts'].includes(menuFormData.category)) {
      alert('Invalid category. Must be one of: starters, mains, drinks, desserts');
      return;
    }

    // Validate price
    const priceNum = parseFloat(menuFormData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Invalid price. Please enter a valid number.');
      return;
    }

    if (!editingMenuItem || !editingMenuItem.id) {
      alert('Error: Menu item ID is missing');
      return;
    }

    try {
      const businessId = localStorage.getItem('business_id');
      
      // Prepare menu item data
      const menuItemData = {
        business_id: businessId,
        name: menuFormData.name.trim(),
        description: menuFormData.description.trim(),
        price: priceNum,
        category: menuFormData.category,
        is_available: editingMenuItem.is_available,
        image_url: menuImagePreview || undefined
      };

      console.log('Updating menu item:', menuItemData);

      // Send to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items/${editingMenuItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(menuItemData)
        }
      );

      if (handleApiError(response, 'update menu item')) return;

      if (response.ok) {
        // Clear business cache to force fresh data fetch by customer app
        const businessId = localStorage.getItem('business_id');
        const cacheKey = `vibespot_cache_businesses_${businessId}`;
        localStorage.removeItem(cacheKey);
        console.log(`✅ Cleared cache for business: ${businessId}`);
        
        alert('Menu item updated successfully!');
        
        // Refresh menu items
        const refreshResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const businessId = localStorage.getItem('business_id') || 'palms';
          const myMenuItems = (data.menu_items || []).filter((item: MenuItem) => item && item.business_id === businessId);
          setMenuItems(filterValidMenuItems(myMenuItems));
        }
        
        // Reset form
        setShowAddMenuItemForm(false);
        setEditingMenuItem(null);
        setMenuImagePreview(null);
        setMenuFormData({
          name: '',
          description: '',
          price: '',
          category: 'mains'
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to update menu item:', errorData);
        alert('Failed to update menu item. Please try again.');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleToggleMenuItemStatus = async (item: MenuItem) => {
    if (!item.id) {
      alert('Error: Menu item ID is missing');
      return;
    }

    try {
      const businessId = localStorage.getItem('business_id');
      const newStatus = !item.is_available;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items/${item.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            business_id: businessId,
            ...item,
            is_available: newStatus
          })
        }
      );

      if (response.ok) {
        // Clear business cache to force fresh data fetch by customer app
        const cacheKey = `vibespot_cache_businesses_${businessId}`;
        localStorage.removeItem(cacheKey);
        console.log(`✅ Cleared cache for business: ${businessId}`);
        
        // Update local state
        setMenuItems(menuItems.map(i => 
          i.id === item.id ? { ...i, is_available: newStatus } : i
        ));
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle menu item status:', errorData);
        alert('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling menu item status:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  // ============================================
  // EVENT MANAGEMENT HANDLERS
  // ============================================
  // NOTE: If you encounter "Event not found" errors when editing:
  // 1. Click "Refresh Events" to reload from database
  // 2. Check browser console for event IDs
  // 3. Old cached events may have incorrect IDs
  // 4. Delete and recreate events if needed

  const handleAddEvent = async () => {
    // Prevent multiple simultaneous saves
    if (savingEvent) {
      console.log('Save already in progress, ignoring duplicate click');
      return;
    }

    // Validate required fields
    if (!eventFormData.title || !eventFormData.eventDate || !eventFormData.eventTime) {
      alert('Please fill in all required fields (Title, Event Date, Event Time)');
      return;
    }

    try {
      setSavingEvent(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            business_id: localStorage.getItem('business_id') || 'palms',
            title: eventFormData.title,
            description: eventFormData.description,
            event_date: eventFormData.eventDate,
            event_time: eventFormData.eventTime,
            location: eventFormData.location,
            image_url: eventImagePreview
          })
        }
      );

      if (handleApiError(response, 'create event')) return;

      if (response.ok) {
        const data = await response.json();
        console.log('Event created successfully:', data.event);
        
        // Add new event to state
        const updatedEvents = [...events, data.event];
        setEvents(updatedEvents);
        
        // Cache updated events
        localStorage.setItem('business_events', JSON.stringify(updatedEvents));
        
        // Clear customer app events cache to force refresh
        localStorage.removeItem('vibespot_events');
        
        // Show success message
        showSuccess('Event created successfully!');
        
        // Reset form
        setShowAddEventForm(false);
        setEventImagePreview(null);
        setEventFormData({
          title: '',
          description: '',
          eventDate: '',
          eventTime: '',
          location: ''
        });
      } else {
        const error = await response.json();
        showError(`Failed to create event: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showError('Network error. Please check your connection and try again.');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent) return;

    // Prevent multiple simultaneous saves
    if (savingEvent) {
      console.log('Save already in progress, ignoring duplicate click');
      return;
    }

    // Validate required fields
    if (!eventFormData.title || !eventFormData.eventDate || !eventFormData.eventTime) {
      alert('Please fill in all required fields (Title, Event Date, Event Time)');
      return;
    }

    try {
      setSavingEvent(true);
      console.log('=== Edit Event Debug ===');
      console.log('Editing event object:', editingEvent);
      console.log('Event ID:', editingEvent.id);
      console.log('Event business_id:', editingEvent.business_id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/events/${editingEvent.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: eventFormData.title,
            description: eventFormData.description,
            event_date: eventFormData.eventDate,
            event_time: eventFormData.eventTime,
            location: eventFormData.location,
            image_url: eventImagePreview
          })
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Update successful, received data:', data);
        
        // Update event in state
        setEvents(events.map(e => e.id === editingEvent.id ? data.event : e));
        
        // Cache updated events
        const updatedEvents = events.map(e => e.id === editingEvent.id ? data.event : e);
        localStorage.setItem('business_events', JSON.stringify(updatedEvents));
        
        // Clear customer app events cache to force refresh
        localStorage.removeItem('vibespot_events');
        
        // Show success message
        showSuccess('Event updated successfully!');
        
        // Reset form
        setShowAddEventForm(false);
        setEventImagePreview(null);
        setEventFormData({
          title: '',
          description: '',
          eventDate: '',
          eventTime: '',
          location: ''
        });
        setEditingEvent(null);
      } else {
        const error = await response.json();
        console.error('Failed to update event:', error);
        console.error('Response body:', error);
        
        // Show detailed error message
        let errorMessage = `Failed to update event: ${error.error || 'Unknown error'}`;
        
        if (error.debug) {
          console.error('Debug info from server:', error.debug);
          errorMessage += `\n\nDebug Info:\n`;
          errorMessage += `- Requested ID: ${error.debug.requestedId}\n`;
          errorMessage += `- Total events in DB: ${error.debug.totalEvents}\n`;
          if (error.debug.availableIds && error.debug.availableIds.length > 0) {
            errorMessage += `- Available event IDs: ${error.debug.availableIds.join(', ')}`;
          }
        }
        
        errorMessage += `\n\nThis event may not exist in the database. Please try creating a new event instead.`;
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      console.log('Deleting event with ID:', eventId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );

      if (response.ok) {
        console.log('Event deleted successfully');
        
        // Remove from state
        const updatedEvents = events.filter(e => e.id !== eventId);
        setEvents(updatedEvents);
        
        // Update cache
        localStorage.setItem('business_events', JSON.stringify(updatedEvents));
        
        alert('Event deleted successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to delete event:', error);
        alert('Failed to delete event. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = 'name,description,price,category\nBruschetta,Fresh tomato and basil on toasted bread,85,starters\nCaprese Salad,Tomato mozzarella and basil,95,starters\nGrilled Salmon,Atlantic salmon with vegetables,245,mains\nRibeye Steak,Premium aged beef 300g,325,mains\nTiramisu,Classic Italian dessert,75,desserts\nCappuccino,Italian espresso with steamed milk,45,drinks';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'menu_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleImportCSV = async () => {
    if (!importFile) {
      alert('Please select a CSV file to import');
      return;
    }

    setImporting(true);

    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      const itemsToImport: any[] = [];
      const errors: string[] = [];

      // Helper function to parse CSV line properly (handles quoted fields with commas)
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        // Add the last field
        result.push(current.trim());
        
        return result;
      };

      dataLines.forEach((line, index) => {
        const fields = parseCSVLine(line);
        const [name, description, price, category] = fields;
        
        // Validate
        if (!name || !price || !category) {
          errors.push(`Line ${index + 2}: Missing required fields (name, price, or category)`);
          return;
        }

        if (!['starters', 'mains', 'drinks', 'desserts'].includes(category)) {
          errors.push(`Line ${index + 2}: Invalid category "${category}". Must be one of: starters, mains, drinks, desserts`);
          return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
          errors.push(`Line ${index + 2}: Invalid price "${price}"`);
          return;
        }

        itemsToImport.push({
          name,
          description: description || '',
          price: priceNum,
          category,
          is_available: true
        });
      });

      if (errors.length > 0) {
        alert(`Import failed with errors:\n\n${errors.join('\n')}`);
        setImporting(false);
        return;
      }

      // Import all items
      const businessId = localStorage.getItem('business_id');
      const promises = itemsToImport.map(item => 
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...item,
              business_id: businessId
            })
          }
        )
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;

      if (successCount === itemsToImport.length) {
        alert(`Successfully imported ${successCount} menu items!`);
        
        // Refresh menu items
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/menu_items`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          const myMenuItems = (data.menu_items || []).filter((item: MenuItem) => item.business_id === businessId);
          setMenuItems(filterValidMenuItems(myMenuItems));
        }
        
        // Close modal and reset
        setShowImportModal(false);
        setImportFile(null);
      } else {
        alert(`Partially imported: ${successCount} of ${itemsToImport.length} items succeeded`);
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Failed to import CSV file. Please check the format and try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);
    setLogoImageError(false);
    try {
      const businessId = localStorage.getItem('business_id');
      const formData = new FormData();
      formData.append('logo', logoFile);

      console.log('📤 Uploading logo...', { size: logoFile.size, type: logoFile.type });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/businesses/${businessId}/upload-logo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Logo uploaded successfully:', data.logo_url);
        setLogoImagePreview(data.logo_url);
        setSettingsFormData(prev => ({ ...prev, logo_url: data.logo_url }));
        setLogoFile(null);
        
        // Update cache immediately
        const cached = localStorage.getItem('business_settings_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.logo_url = data.logo_url;
          localStorage.setItem('business_settings_cache', JSON.stringify(parsed));
        }
        
        showSuccess('Logo uploaded successfully!');
      } else {
        const error = await response.json();
        console.error('❌ Logo upload failed:', error);
        setLogoImageError(true);
        showError(error.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('❌ Error uploading logo:', error);
      setLogoImageError(true);
      showError('Network error while uploading logo. Please check your connection.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverImageUpload = async () => {
    if (!coverFile) return;

    setUploadingCover(true);
    setCoverImageError(false);
    try {
      const businessId = localStorage.getItem('business_id');
      const formData = new FormData();
      formData.append('cover', coverFile);

      console.log('📤 Uploading cover image...', { size: coverFile.size, type: coverFile.type });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/businesses/${businessId}/upload-cover`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cover image uploaded successfully:', data.cover_image_url);
        setCoverImagePreview(data.cover_image_url);
        setSettingsFormData(prev => ({ ...prev, cover_image_url: data.cover_image_url }));
        setCoverFile(null);
        
        // Update cache immediately
        const cached = localStorage.getItem('business_settings_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.cover_image_url = data.cover_image_url;
          localStorage.setItem('business_settings_cache', JSON.stringify(parsed));
        }
        
        showSuccess('Cover image uploaded successfully!');
      } else {
        const error = await response.json();
        console.error('❌ Cover image upload failed:', error);
        setCoverImageError(true);
        showError(error.error || 'Failed to upload cover image');
      }
    } catch (error) {
      console.error('❌ Error uploading cover image:', error);
      setCoverImageError(true);
      showError('Network error while uploading cover image. Please check your connection.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGeocodeAddress = async () => {
    if (!settingsFormData.address || !settingsFormData.city) {
      showError('Please enter both address and city first');
      return;
    }

    setGeocoding(true);
    try {
      console.log('🗺️ Frontend: Geocoding request:', {
        address: settingsFormData.address,
        city: settingsFormData.city
      });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/geocode`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: settingsFormData.address,
            city: settingsFormData.city,
            country: 'South Africa'
          })
        }
      );

      console.log('📡 Frontend: Geocoding response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Frontend: Geocoding data received:', data);
        
        const newCoordinates = {
          latitude: data.latitude,
          longitude: data.longitude,
          formatted_address: data.formatted_address
        };
        
        setCoordinates(newCoordinates);
        
        // Update settingsFormData with coordinates
        setSettingsFormData(prev => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude
        }));
        
        // Also update the business record with the coordinates
        const businessId = localStorage.getItem('business_id') || 'palms';
        const updateResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/business/${businessId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              latitude: data.latitude,
              longitude: data.longitude
            })
          }
        );
        
        if (updateResponse.ok) {
          const successMsg = data.formatted_address 
            ? `Coordinates found and saved!\n${data.formatted_address}\n(${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)})`
            : `Coordinates found and saved: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`;
          showSuccess(successMsg);
        } else {
          showError('Coordinates found but failed to save to business profile');
        }
      } else {
        const error = await response.json();
        console.error('❌ Frontend: Geocoding error:', error);
        showError(error.error || error.details || 'Failed to geocode address');
      }
    } catch (error) {
      console.error('💥 Frontend: Error geocoding address:', error);
      showError('Network error while geocoding address');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);

    try {
      // Validate required fields
      if (!settingsFormData.name || !settingsFormData.email) {
        showError('Please fill in Business Name and Email');
        setSavingSettings(false);
        return;
      }

      // Get business ID from localStorage
      const businessId = localStorage.getItem('business_id') || 'palms';

      // Auto-geocode if coordinates don't exist and address is provided
      let finalLatitude = settingsFormData.latitude;
      let finalLongitude = settingsFormData.longitude;
      
      if (settingsFormData.address && settingsFormData.city && 
          (!finalLatitude || finalLatitude === 0) && (!finalLongitude || finalLongitude === 0)) {
        console.log('🌍 Auto-geocoding address before saving...');
        try {
          const geocodeResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/geocode`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                address: settingsFormData.address,
                city: settingsFormData.city,
                country: 'South Africa'
              })
            }
          );

          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json();
            finalLatitude = geocodeData.latitude;
            finalLongitude = geocodeData.longitude;
            console.log('✅ Auto-geocoded coordinates:', { finalLatitude, finalLongitude });
            
            // Update state with new coordinates
            setCoordinates({ latitude: finalLatitude, longitude: finalLongitude });
            setSettingsFormData(prev => ({
              ...prev,
              latitude: finalLatitude,
              longitude: finalLongitude
            }));
          } else {
            console.warn('⚠️ Auto-geocoding failed, saving without coordinates');
          }
        } catch (error) {
          console.error('Error auto-geocoding:', error);
          console.warn('⚠️ Continuing to save without coordinates');
        }
      }

      const updatePayload = {
        name: settingsFormData.name,
        address: settingsFormData.address,
        city: settingsFormData.city,
        phone: settingsFormData.phone,
        email: settingsFormData.email,
        description: settingsFormData.description,
        logo_url: logoImagePreview || settingsFormData.logo_url,
        cover_image_url: coverImagePreview || settingsFormData.cover_image_url,
        // Always include coordinates (0 if not set)
        latitude: finalLatitude || 0,
        longitude: finalLongitude || 0,
        opening_hours: settingsFormData.opening_hours,
        avg_price_min: settingsFormData.avg_price_min || 0,
        avg_price_max: settingsFormData.avg_price_max || 0,
        business_type: (settingsFormData as any).business_type || 'restaurant',
        cuisine_types: (settingsFormData as any).cuisine_types || [],
        age_groups: (settingsFormData as any).age_groups || []
      };

      console.log('💾 Saving business settings:', { businessId, payload: updatePayload });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/business/${businessId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Settings saved successfully:', {
          saved: settingsFormData,
          response: data
        });
        
        // Show success message with coordinate info if applicable
        if (finalLatitude && finalLongitude && finalLatitude !== 0 && finalLongitude !== 0) {
          showSuccess(`Settings saved! GPS coordinates: ${finalLatitude.toFixed(4)}, ${finalLongitude.toFixed(4)}`);
        } else {
          showSuccess('Settings saved successfully to backend!');
        }
        
        // Update business name in localStorage if changed
        if (settingsFormData.name) {
          localStorage.setItem('business_name', settingsFormData.name);
        }
        
        // Optional: Keep a local cache for offline viewing
        localStorage.setItem('business_settings_cache', JSON.stringify(settingsFormData));
      } else {
        const error = await response.json();
        console.error('Backend error:', error);
        showError(`Failed to save settings: ${error.error || 'Unknown error'}. Please try again.`);
      }
    } catch (error) {
      console.error('Error saving settings to backend:', error);
      showError('Network error. Could not connect to server. Please check your internet connection.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MyVibesLogo variant="white" />
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile Overlay */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-cyan-500 via-cyan-600 to-blue-600 text-white p-6 z-40 transition-transform duration-300
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-8">
          {logoImagePreview ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                <img 
                  src={logoImagePreview} 
                  alt="Business logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">{settingsFormData.name || 'MYVIBES'}</h1>
                <p className="text-xs opacity-75">Business Portal</p>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <MyVibesLogo variant="white" />
            </div>
          )}
        </div>

        <nav className="space-y-2 overflow-y-auto pb-48 max-h-[calc(100vh-200px)]">
          <button
            onClick={() => setCurrentView('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'overview' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setCurrentView('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'menu' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <MenuIcon className="w-5 h-5" />
            <span>Menu</span>
          </button>
          <button
            onClick={() => setCurrentView('specials')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'specials' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>Specials & Deals</span>
          </button>
          <button
            onClick={() => setCurrentView('events')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'events' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Events</span>
          </button>
          <button
            onClick={() => setCurrentView('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'analytics' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setCurrentView('ml-insights')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'ml-insights' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Brain className="w-5 h-5" />
            <span>ML Insights</span>
            {mlInsightsSubscribed && (
              <span className="ml-auto px-2 py-0.5 bg-green-400 text-green-900 text-xs rounded-full font-semibold">
                PRO
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentView('reviews')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'reviews' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Star className="w-5 h-5" />
            <span>Reviews</span>
          </button>
          <button
            onClick={() => setCurrentView('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'reservations' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Reservations</span>
          </button>
          <button
            onClick={() => setCurrentView('ads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'ads' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>Social Media Ads</span>
          </button>
          <button
            onClick={() => setCurrentView('debug')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'debug' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Database className="w-5 h-5" />
            <span>Debug Tools</span>
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === 'settings' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold mb-1">Subscription Status</p>
            <p className="font-bold">Active</p>
            <p className="text-xs opacity-75 mt-1">{subscriptionPrice}/month</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-0 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">
            {currentView === 'overview' && 'Dashboard Overview'}
            {currentView === 'menu' && 'Menu Management'}
            {currentView === 'specials' && 'Specials & Deals'}
            {currentView === 'events' && 'Events Calendar'}
            {currentView === 'analytics' && 'Analytics'}
            {currentView === 'ml-insights' && 'ML Insights'}
            {currentView === 'reviews' && 'Reviews & Ratings'}
            {currentView === 'reservations' && 'Reservations'}
            {currentView === 'ads' && 'Social Media Ads'}
            {currentView === 'debug' && 'Debug Tools'}
            {currentView === 'settings' && 'Business Settings'}
          </h2>
          <p className="text-gray-600">{businessName || settingsFormData.name}</p>
        </div>

        {/* Overview */}
        {currentView === 'overview' && (
          <div>
            {/* Business Profile Reminder - Subtle notification */}
            {(!logoImagePreview || !coverImagePreview) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {!logoImagePreview && !coverImagePreview 
                        ? 'Tip: Upload your logo and cover image in Settings to complete your profile.'
                        : !logoImagePreview
                        ? 'Tip: Upload your business logo in Settings.'
                        : 'Tip: Upload a cover image in Settings.'}
                    </p>
                    <button
                      onClick={() => setCurrentView('settings')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                    >
                      Go to Settings →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Analytics Cards */}
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Total Clicks</p>
                  <Eye className="w-5 h-5 opacity-75" />
                </div>
                <p className="text-4xl font-bold">{loadingAnalytics ? '...' : (analytics?.metrics?.total_clicks || 0).toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">Carousel & venue clicks</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Click-Through Rate</p>
                  <TrendingUp className="w-5 h-5 opacity-75" />
                </div>
                <p className="text-4xl font-bold">{loadingAnalytics ? '...' : (analytics?.metrics?.ctr || 0).toFixed(1)}%</p>
                <p className="text-xs opacity-75 mt-2">{loadingAnalytics ? '' : `${analytics?.metrics?.total_views || 0} total views`}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Reservations</p>
                  <Calendar className="w-5 h-5 opacity-75" />
                </div>
                <p className="text-4xl font-bold">{loadingAnalytics ? '...' : (analytics?.metrics?.total_reservations || 0)}</p>
                <p className="text-xs opacity-75 mt-2">{loadingAnalytics ? '' : `${analytics?.metrics?.conversion_rate || 0}% conversion`}</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Revenue Generated</p>
                  <DollarSign className="w-5 h-5 opacity-75" />
                </div>
                <p className="text-4xl font-bold">R{loadingAnalytics ? '...' : (analytics?.metrics?.estimated_revenue || 0).toLocaleString()}</p>
                <p className="text-xs opacity-75 mt-2">Platform value delivered</p>
              </div>
            </div>



            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    onClick={() => setCurrentView('specials')}
                    className="w-full justify-start bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Special
                  </Button>
                  <Button 
                    onClick={() => setCurrentView('events')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                  <Button 
                    onClick={() => setCurrentView('menu')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <MenuIcon className="w-4 h-4 mr-2" />
                    Update Menu
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  {reviews.length > 0 && reviews.slice(0, 1).map(review => {
                    const reviewDate = new Date(review.date);
                    const now = new Date();
                    const minutesAgo = Math.floor((now.getTime() - reviewDate.getTime()) / 1000 / 60);
                    const timeAgo = minutesAgo < 60 
                      ? `${minutesAgo} minutes ago`
                      : minutesAgo < 1440
                      ? `${Math.floor(minutesAgo / 60)} hours ago`
                      : `${Math.floor(minutesAgo / 1440)} days ago`;
                    
                    return (
                      <div key={review.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                        <div>
                          <p className="font-medium">New review posted by {review.customer_name}</p>
                          <p className="text-xs text-gray-500">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {specials.filter(s => s.is_active).length > 0 && (
                    <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="font-medium">{specials.reduce((sum, s) => sum + (s.view_count || 0), 0)} people viewed your menu</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>
                  )}
                  
                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const endingSoon = specials.find(s => s.is_active && s.end_date === today);
                    if (endingSoon) {
                      return (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1.5"></div>
                          <div>
                            <p className="font-medium">"{endingSoon.title}" ending soon</p>
                            <p className="text-xs text-gray-500">Ends today at {endingSoon.time_end || '23:59'}</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                        <div>
                          <p className="font-medium">{menuItems.filter(m => m.is_available !== false).length} menu items available</p>
                          <p className="text-xs text-gray-500">All systems running</p>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {reviews.length === 0 && specials.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      <p className="text-sm">No recent activity</p>
                      <p className="text-xs mt-1">Start by posting a special or adding menu items!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Management */}
        {currentView === 'menu' && (
          <div>
            {/* Add/Edit Menu Item Form */}
            {showAddMenuItemForm && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-bold mb-4">{editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="menu-name">Item Name *</Label>
                    <Input 
                      id="menu-name" 
                      placeholder="e.g., Grilled Salmon" 
                      value={menuFormData.name} 
                      onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="menu-description">Description</Label>
                    <Textarea 
                      id="menu-description" 
                      placeholder="Describe your menu item..." 
                      rows={3} 
                      value={menuFormData.description} 
                      onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="menu-price">Price *</Label>
                      <Input 
                        id="menu-price" 
                        type="text" 
                        placeholder="R120" 
                        value={menuFormData.price} 
                        onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="menu-category">Category *</Label>
                      <select 
                        id="menu-category" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3B5166] focus:border-transparent"
                        value={menuFormData.category} 
                        onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value as 'starters' | 'mains' | 'drinks' | 'desserts' })} 
                      >
                        <option value="starters">Starters</option>
                        <option value="mains">Mains</option>
                        <option value="drinks">Drinks</option>
                        <option value="desserts">Desserts</option>
                      </select>
                    </div>
                  </div>

                  {/* Image Upload with Preview */}
                  <div className="border-t pt-4 mt-4">
                    <Label htmlFor="menu-image">Upload Image</Label>
                    <Input 
                      id="menu-image" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleMenuImageUpload}
                      className="cursor-pointer"
                    />
                    {menuImagePreview && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <div className="relative inline-block">
                          <img 
                            src={menuImagePreview} 
                            alt="Menu Item Preview" 
                            className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200" 
                          />
                          <button
                            onClick={() => setMenuImagePreview(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            type="button"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" 
                      onClick={editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem}
                    >
                      {editingMenuItem ? 'Update Menu Item' : 'Add Menu Item'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddMenuItemForm(false);
                        setEditingMenuItem(null);
                        setMenuImagePreview(null);
                        setMenuFormData({
                          name: '',
                          description: '',
                          price: '',
                          category: 'mains'
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Your Menu Items</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={downloadCSVTemplate}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowImportModal(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleDeleteAllMenuItems}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      disabled={menuItems.length === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All Menu
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                      onClick={() => {
                        setEditingMenuItem(null);
                        setMenuImagePreview(null);
                        setMenuFormData({
                          name: '',
                          description: '',
                          price: '',
                          category: 'mains'
                        });
                        setShowAddMenuItemForm(!showAddMenuItemForm);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="starters" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="starters">Starters</TabsTrigger>
                    <TabsTrigger value="mains">Mains</TabsTrigger>
                    <TabsTrigger value="drinks">Drinks</TabsTrigger>
                    <TabsTrigger value="desserts">Desserts</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="starters" className="space-y-3 mt-6">
                  {loadingMenuItems ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B5166] mx-auto"></div>
                    </div>
                  ) : menuItems.filter(item => item.category === 'starters').length === 0 ? (
                    <p className="text-sm text-gray-500">No starters added yet.</p>
                  ) : (
                    <>
                      <div className="flex justify-end mb-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCategory('starters')}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete All Starters
                        </Button>
                      </div>
                      {menuItems.filter(item => item.category === 'starters').map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-gray-600">R{item.price}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleMenuItemStatus(item)}
                              className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                                item.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditMenuItem(item)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteMenuItem(item.id || '', item.name)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="mains" className="space-y-3 mt-6">
                  {loadingMenuItems ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B5166] mx-auto"></div>
                    </div>
                  ) : menuItems.filter(item => item.category === 'mains').length === 0 ? (
                    <p className="text-sm text-gray-500">No main courses added yet.</p>
                  ) : (
                    <>
                      <div className="flex justify-end mb-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCategory('mains')}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete All Mains
                        </Button>
                      </div>
                      {menuItems.filter(item => item.category === 'mains').map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-gray-600">R{item.price}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleMenuItemStatus(item)}
                              className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                                item.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditMenuItem(item)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteMenuItem(item.id || '', item.name)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="drinks" className="space-y-3 mt-6">
                  {loadingMenuItems ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B5166] mx-auto"></div>
                    </div>
                  ) : menuItems.filter(item => item.category === 'drinks').length === 0 ? (
                    <p className="text-sm text-gray-500">No drinks added yet.</p>
                  ) : (
                    <>
                      <div className="flex justify-end mb-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCategory('drinks')}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete All Drinks
                        </Button>
                      </div>
                      {menuItems.filter(item => item.category === 'drinks').map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-gray-600">R{item.price}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleMenuItemStatus(item)}
                              className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                                item.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditMenuItem(item)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteMenuItem(item.id || '', item.name)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="desserts" className="space-y-3 mt-6">
                  {loadingMenuItems ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B5166] mx-auto"></div>
                    </div>
                  ) : menuItems.filter(item => item.category === 'desserts').length === 0 ? (
                    <p className="text-sm text-gray-500">No desserts added yet.</p>
                  ) : (
                    <>
                      <div className="flex justify-end mb-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCategory('desserts')}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete All Desserts
                        </Button>
                      </div>
                      {menuItems.filter(item => item.category === 'desserts').map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-gray-600">R{item.price}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleMenuItemStatus(item)}
                              className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                                item.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditMenuItem(item)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteMenuItem(item.id || '', item.name)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Import CSV Modal */}
            {showImportModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Import Menu Items</h3>
                      <button 
                        onClick={() => {
                          setShowImportModal(false);
                          setImportFile(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        Import multiple menu items at once using a CSV file. Download our template to get started.
                      </p>
                      
                      <Button 
                        variant="outline" 
                        onClick={downloadCSVTemplate}
                        className="mb-4 w-full"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Download CSV Template
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="csv-file">Select CSV File</Label>
                      <Input 
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        className="mt-2"
                      />
                      {importFile && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {importFile.name}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">CSV Format Requirements:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Column headers: name, description, price, category</li>
                        <li>• Categories must be: starters, mains, drinks, or desserts</li>
                        <li>• Price should be a number (without currency symbol)</li>
                        <li>• Description is optional</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 border-t bg-gray-50 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                      }}
                      disabled={importing}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImportCSV}
                      disabled={!importFile || importing}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white disabled:opacity-50"
                    >
                      {importing ? 'Importing...' : 'Import Items'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Specials & Deals */}
        {currentView === 'specials' && (
          <div>
            <div className="mb-6 flex gap-3">
              <Button 
                onClick={() => {
                  setEditingSpecial(null);
                  setShowAddSpecialForm(!showAddSpecialForm);
                  setSpecialFormData({
                    title: '',
                    description: '',
                    price: '',
                    percentage: '',
                    discountType: 'fixed_price',
                    startDate: '',
                    endDate: '',
                    startTime: '',
                    endTime: '',
                    daysOfWeek: []
                  });
                  setSpecialImagePreview(null);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Special
              </Button>
              <Button 
                onClick={() => {
                  // Prevent multiple simultaneous refreshes
                  if (loadingSpecials) {
                    console.log('Refresh already in progress');
                    return;
                  }
                  
                  // Force refresh specials from server
                  const fetchSpecials = async () => {
                    try {
                      setLoadingSpecials(true);
                      
                      // Clear cache first
                      localStorage.removeItem('business_specials');
                      console.log('Cleared cached specials');
                      
                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials`,
                        {
                          headers: {
                            'Authorization': `Bearer ${publicAnonKey}`
                          }
                        }
                      );
                      if (response.ok) {
                        const data = await response.json();
                        const businessId = localStorage.getItem('business_id') || 'palms';
                        const mySpecials = (data.specials || []).filter((s: Special) => s.business_id === businessId);
                        console.log('Refreshed specials from server:', mySpecials);
                        setSpecials(mySpecials);
                        localStorage.setItem('business_specials', JSON.stringify(mySpecials));
                        showSuccess(`Specials refreshed! Found ${mySpecials.length} special(s).`);
                      } else {
                        showError('Failed to refresh specials');
                      }
                    } catch (error) {
                      console.error('Error refreshing specials:', error);
                      showError('Network error while refreshing specials');
                    } finally {
                      setLoadingSpecials(false);
                    }
                  };
                  fetchSpecials();
                }}
                variant="outline"
                disabled={loadingSpecials}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingSpecials ? 'animate-spin' : ''}`} />
                {loadingSpecials ? 'Refreshing...' : 'Refresh Specials'}
              </Button>
            </div>

            {showAddSpecialForm && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">
                    {editingSpecial ? `Edit Special: ${editingSpecial.title}` : 'Create New Special'}
                  </h3>
                  {editingSpecial && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      ID: {editingSpecial.id}
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="special-title">Special Title *</Label>
                    <Input 
                      id="special-title" 
                      placeholder="e.g., 2-for-1 Cocktails" 
                      value={specialFormData.title} 
                      onChange={(e) => setSpecialFormData({ ...specialFormData, title: e.target.value })} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="special-description">Description</Label>
                    <Textarea 
                      id="special-description" 
                      placeholder="Describe your special offer..." 
                      rows={3} 
                      value={specialFormData.description} 
                      onChange={(e) => setSpecialFormData({ ...specialFormData, description: e.target.value })} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Discount Type</Label>
                      <div className="flex bg-gray-100 p-1 rounded-lg h-10 items-center">
                        <button
                          type="button"
                          onClick={() => setSpecialFormData({ ...specialFormData, discountType: 'fixed_price' })}
                          className={`flex-1 h-8 text-sm rounded-md transition-all ${
                            specialFormData.discountType === 'fixed_price'
                              ? 'bg-white text-black shadow-sm font-medium'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Fixed Price
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpecialFormData({ ...specialFormData, discountType: 'percentage' })}
                          className={`flex-1 h-8 text-sm rounded-md transition-all ${
                            specialFormData.discountType === 'percentage'
                              ? 'bg-white text-black shadow-sm font-medium'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Percentage
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      {specialFormData.discountType === 'fixed_price' ? (
                        <>
                          <Label htmlFor="special-price">Price *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                            <Input 
                              id="special-price" 
                              type="number" 
                              placeholder="50" 
                              className="pl-8"
                              value={specialFormData.price} 
                              onChange={(e) => setSpecialFormData({ ...specialFormData, price: e.target.value })} 
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <Label htmlFor="special-percentage">Discount Percentage *</Label>
                          <div className="relative">
                            <Input 
                              id="special-percentage" 
                              type="number" 
                              placeholder="50" 
                              min="1"
                              max="100"
                              value={specialFormData.percentage} 
                              onChange={(e) => setSpecialFormData({ ...specialFormData, percentage: e.target.value })} 
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Date and Time Range */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3 text-sm">Validity Period *</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="special-start-date">Start Date *</Label>
                        <Input 
                          id="special-start-date" 
                          type="date" 
                          value={specialFormData.startDate} 
                          onChange={(e) => setSpecialFormData({ ...specialFormData, startDate: e.target.value })} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="special-start-time">Start Time</Label>
                        <Input 
                          id="special-start-time" 
                          type="time" 
                          value={specialFormData.startTime} 
                          onChange={(e) => setSpecialFormData({ ...specialFormData, startTime: e.target.value })} 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label htmlFor="special-end-date">End Date *</Label>
                        <Input 
                          id="special-end-date" 
                          type="date" 
                          value={specialFormData.endDate} 
                          onChange={(e) => setSpecialFormData({ ...specialFormData, endDate: e.target.value })} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="special-end-time">End Time</Label>
                        <Input 
                          id="special-end-time" 
                          type="time" 
                          value={specialFormData.endTime} 
                          onChange={(e) => setSpecialFormData({ ...specialFormData, endTime: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recurring Days */}
                  <div className="border-t pt-4 mt-4">
                    <Label className="mb-3 block">Recurring Days (Optional)</Label>
                    <p className="text-sm text-gray-600 mb-3">Select specific days when this special is active</p>
                    <div className="grid grid-cols-7 gap-2">
                      {[
                        { day: 'Sun', value: 0 },
                        { day: 'Mon', value: 1 },
                        { day: 'Tue', value: 2 },
                        { day: 'Wed', value: 3 },
                        { day: 'Thu', value: 4 },
                        { day: 'Fri', value: 5 },
                        { day: 'Sat', value: 6 }
                      ].map(({ day, value }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            const isSelected = specialFormData.daysOfWeek.includes(value);
                            setSpecialFormData({
                              ...specialFormData,
                              daysOfWeek: isSelected
                                ? specialFormData.daysOfWeek.filter(d => d !== value)
                                : [...specialFormData.daysOfWeek, value].sort()
                            });
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            specialFormData.daysOfWeek.includes(value)
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    {specialFormData.daysOfWeek.length > 0 && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ Special will repeat on {specialFormData.daysOfWeek.map(d => 
                          ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]
                        ).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Image Upload with Preview */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="special-image">Special Image (Optional)</Label>
                      {editingSpecial?.image_url && !specialImagePreview && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          🤖 AI-Generated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a custom image to make this special stand out
                    </p>
                    <Input 
                      id="special-image" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    {specialImagePreview && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <div className="relative inline-block">
                          <img 
                            src={specialImagePreview} 
                            alt="Special Preview" 
                            className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200" 
                          />
                          <button
                            onClick={() => setSpecialImagePreview(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            type="button"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {editingSpecial?.image_url && !specialImagePreview && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Current Image (AI-Generated):</p>
                        <div className="relative inline-block">
                          <img 
                            src={editingSpecial.image_url} 
                            alt="Current Special" 
                            className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-blue-200 opacity-70" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                            <span className="text-white text-xs font-semibold bg-blue-600 px-3 py-1 rounded-full">
                              🤖 AI Generated - Upload to replace
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" 
                      onClick={handlePublishSpecial}
                      disabled={savingSpecial}
                    >
                      {savingSpecial ? 'Saving...' : editingSpecial ? 'Update Special' : 'Publish Special'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddSpecialForm(false);
                        setEditingSpecial(null);
                        setSpecialImagePreview(null);
                        setSpecialFormData({
                          title: '',
                          description: '',
                          price: '',
                          startDate: '',
                          endDate: '',
                          startTime: '',
                          endTime: '',
                          daysOfWeek: []
                        });
                      }}
                      disabled={savingSpecial}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold">Active Specials</h3>
              </div>
              <div className="p-6 space-y-4">
                {loadingSpecials ? (
                  <p className="text-sm text-gray-500">Loading specials...</p>
                ) : specials.length === 0 ? (
                  <p className="text-sm text-gray-500">No active specials. Create one to get started!</p>
                ) : (
                  specials.map((special, idx) => (
                    <div key={special.id || idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{special.title}</h4>
                          {special.discount_percentage ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              {special.discount_percentage}% OFF
                            </span>
                          ) : special.price ? (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                              R{special.price}
                            </span>
                          ) : null}
                          {special.image_url && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              🤖 AI Image
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {special.time_end ? `Ends at ${special.time_end}` : `Ends on ${special.end_date}`}
                        </p>
                        {special.days_of_week && special.days_of_week.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dayIdx) => (
                              <div 
                                key={dayIdx}
                                className={`w-6 h-6 flex items-center justify-center rounded text-xs font-semibold ${
                                  special.days_of_week?.includes(dayIdx)
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-400'
                                }`}
                              >
                                {day}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">ID: {special.id}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{special.view_count} views</p>
                          <p className="text-xs text-gray-500">total</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditSpecial(special)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600" 
                          onClick={() => handleEndSpecial(special.id || '')}
                        >
                          End
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events */}
        {currentView === 'events' && (
          <div>
            <div className="mb-6 flex gap-3">
              <Button 
                onClick={() => {
                  if (!showAddEventForm) {
                    // Pre-fill location from business settings if available and location is empty
                    const defaultLocation = settingsFormData.address 
                      ? `${settingsFormData.address}${settingsFormData.city ? `, ${settingsFormData.city}` : ''}`
                      : settingsFormData.city || '';
                    
                    if (!eventFormData.location && defaultLocation) {
                      setEventFormData(prev => ({
                        ...prev,
                        location: defaultLocation
                      }));
                    }
                  }
                  setShowAddEventForm(!showAddEventForm);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
              <Button 
                onClick={() => {
                  // Prevent multiple simultaneous refreshes
                  if (loadingEvents) {
                    console.log('Refresh already in progress');
                    return;
                  }
                  
                  // Force refresh events from server
                  const fetchEvents = async () => {
                    try {
                      setLoadingEvents(true);
                      
                      // Clear cache first
                      localStorage.removeItem('business_events');
                      console.log('Cleared cached events');
                      
                      const response = await fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/events`,
                        {
                          headers: {
                            'Authorization': `Bearer ${publicAnonKey}`
                          }
                        }
                      );
                      if (response.ok) {
                        const data = await response.json();
                        const businessId = localStorage.getItem('business_id') || 'palms';
                        const myEvents = (data.events || []).filter((event: Event) => event.business_id === businessId);
                        console.log('Refreshed events from server:', myEvents);
                        setEvents(myEvents);
                        localStorage.setItem('business_events', JSON.stringify(myEvents));
                        showSuccess(`Events refreshed! Found ${myEvents.length} event(s).`);
                      } else {
                        showError('Failed to refresh events');
                      }
                    } catch (error) {
                      console.error('Error refreshing events:', error);
                      showError('Network error while refreshing events');
                    } finally {
                      setLoadingEvents(false);
                    }
                  };
                  fetchEvents();
                }}
                variant="outline"
                disabled={loadingEvents}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingEvents ? 'animate-spin' : ''}`} />
                {loadingEvents ? 'Refreshing...' : 'Refresh Events'}
              </Button>
            </div>

            {showAddEventForm && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">
                    {editingEvent ? `Edit Event: ${editingEvent.title}` : 'Create New Event'}
                  </h3>
                  {editingEvent && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      ID: {editingEvent.id}
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Event Title *</Label>
                    <Input 
                      id="event-title" 
                      placeholder="e.g., Live Jazz Night" 
                      value={eventFormData.title} 
                      onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea 
                      id="event-description" 
                      placeholder="Describe your event..." 
                      rows={3} 
                      value={eventFormData.description} 
                      onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-date">Event Date *</Label>
                      <Input 
                        id="event-date" 
                        type="date" 
                        value={eventFormData.eventDate} 
                        onChange={(e) => setEventFormData({ ...eventFormData, eventDate: e.target.value })} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-time">Event Time *</Label>
                      <Input 
                        id="event-time" 
                        type="time" 
                        value={eventFormData.eventTime} 
                        onChange={(e) => setEventFormData({ ...eventFormData, eventTime: e.target.value })} 
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="event-location">Location</Label>
                      <button 
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        onClick={() => {
                          const address = settingsFormData.address 
                            ? `${settingsFormData.address}${settingsFormData.city ? `, ${settingsFormData.city}` : ''}`
                            : settingsFormData.city || '';
                          if (address) setEventFormData(prev => ({...prev, location: address}));
                          else showInfo("No business address found in settings");
                        }}
                      >
                        Use Business Address
                      </button>
                    </div>
                    <Input 
                      id="event-location" 
                      placeholder="e.g., Main Hall" 
                      value={eventFormData.location} 
                      onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })} 
                    />
                  </div>

                  {/* Image Upload with Preview */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="event-image">Event Image (Optional)</Label>
                      {editingEvent?.image_url && !eventImagePreview && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          🤖 AI-Generated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Upload a custom image to make this event stand out
                    </p>
                    <Input 
                      id="event-image" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleEventImageUpload}
                      className="cursor-pointer"
                    />
                    {eventImagePreview && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <div className="relative inline-block">
                          <img 
                            src={eventImagePreview} 
                            alt="Event Preview" 
                            className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200" 
                          />
                          <button
                            onClick={() => setEventImagePreview(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            type="button"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {editingEvent?.image_url && !eventImagePreview && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Current Image (AI-Generated):</p>
                        <div className="relative inline-block">
                          <img 
                            src={editingEvent.image_url} 
                            alt="Current Event" 
                            className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-blue-200 opacity-70" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                            <span className="text-white text-xs font-semibold bg-blue-600 px-3 py-1 rounded-full">
                              🤖 AI Generated - Upload to replace
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    {editingEvent ? (
                      <Button 
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" 
                        onClick={handleEditEvent}
                        disabled={savingEvent}
                      >
                        {savingEvent ? 'Updating...' : 'Update Event'}
                      </Button>
                    ) : (
                      <Button 
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" 
                        onClick={handleAddEvent}
                        disabled={savingEvent}
                      >
                        {savingEvent ? 'Adding...' : 'Add Event'}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddEventForm(false);
                        setEventImagePreview(null);
                        setEventFormData({
                          title: '',
                          description: '',
                          eventDate: '',
                          eventTime: '',
                          location: ''
                        });
                        setEditingEvent(null);
                      }}
                      disabled={savingEvent}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold">Events Management</h3>
              </div>
              <div className="p-6 space-y-6">
                {loadingEvents ? (
                  <p className="text-sm text-gray-500">Loading events...</p>
                ) : (() => {
                  // Filter events into upcoming and past
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  const upcomingEvents = events.filter(event => {
                    const eventDate = new Date(event.event_date);
                    return eventDate >= today;
                  });
                  
                  const pastEvents = events.filter(event => {
                    const eventDate = new Date(event.event_date);
                    return eventDate < today;
                  });

                  return (
                    <>
                      {/* Upcoming Events */}
                      <div>
                        <h4 className="font-semibold text-lg mb-3 text-cyan-700">Upcoming Events</h4>
                        {upcomingEvents.length === 0 ? (
                          <p className="text-sm text-gray-500">No upcoming events. Create one to get started!</p>
                        ) : (
                          <div className="space-y-3">
                            {upcomingEvents.map((event, idx) => (
                              <div key={event.id || idx} className="flex items-center justify-between p-4 border-2 border-cyan-200 bg-cyan-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{event.title}</h4>
                                    {event.image_url && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        🤖 AI Image
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    📅 {event.event_date} {event.event_time && `• 🕐 ${event.event_time}`}
                                  </p>
                                  {event.location && (
                                    <p className="text-sm text-gray-600 mt-0.5">
                                      📍 {event.location}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-cyan-700">{event.interested_count || 0} interested</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                      setEditingEvent(event);
                                      setShowAddEventForm(true);
                                      setEventFormData({
                                        title: event.title || '',
                                        description: event.description || '',
                                        eventDate: event.event_date || '',
                                        eventTime: event.event_time || '',
                                        location: event.location || ''
                                      });
                                      setEventImagePreview(event.image_url || null);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:bg-red-50" 
                                    onClick={() => handleDeleteEvent(event.id || '')}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Past Events */}
                      {pastEvents.length > 0 && (
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="font-semibold text-lg mb-3 text-gray-600">Past Events</h4>
                          <div className="space-y-3">
                            {pastEvents.map((event, idx) => (
                              <div key={event.id || idx} className="flex items-center justify-between p-4 border border-gray-300 bg-gray-100 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-700">{event.title}</h4>
                                    <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full font-medium">
                                      PAST
                                    </span>
                                    {event.image_url && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        🤖 AI Image
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    📅 {event.event_date} {event.event_time && `• 🕐 ${event.event_time}`}
                                  </p>
                                  {event.location && (
                                    <p className="text-sm text-gray-500 mt-0.5">
                                      📍 {event.location}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">{event.interested_count || 0} interested</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                                    onClick={() => {
                                      setEditingEvent(event);
                                      setShowAddEventForm(true);
                                      setEventFormData({
                                        title: event.title || '',
                                        description: event.description || '',
                                        eventDate: event.event_date || '',
                                        eventTime: event.event_time || '',
                                        location: event.location || ''
                                      });
                                      setEventImagePreview(event.image_url || null);
                                    }}
                                  >
                                    ↻ Edit & Reactivate
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:bg-red-50" 
                                    onClick={() => handleDeleteEvent(event.id || '')}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {currentView === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2">Total Profile Views</p>
                <p className="text-3xl font-bold mb-1">12,847</p>
                <p className="text-xs text-green-600">↑ 18% this month</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2">Menu Views</p>
                <p className="text-3xl font-bold mb-1">8,234</p>
                <p className="text-xs text-green-600">↑ 14% this month</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-sm text-gray-600 mb-2">Special Clicks</p>
                <p className="text-3xl font-bold mb-1">1,456</p>
                <p className="text-xs text-green-600">↑ 22% this month</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-4">Performance Overview</h3>
              <PerformanceOverview />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
              <h3 className="font-bold mb-4">Recent Check-Ins</h3>
              <RecentCheckIns businessId={businessId || ''} />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>🏆</span> Top Visitors Leaderboard
              </h3>
              <Leaderboard businessId={businessId || ''} />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-4">Popular Items</h3>
              <div className="space-y-3">
                {[
                  { item: '2-for-1 Cocktails', clicks: 456 },
                  { item: 'Friday Buffet', clicks: 389 },
                  { item: 'Wine Pairing', clicks: 312 },
                  { item: 'Live Jazz Night', clicks: 289 },
                ].map((data, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{data.item}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" 
                          style={{ width: `${(data.clicks / 500) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{data.clicks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {loadingInsights ? (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 animate-pulse text-blue-600" />
                    <p className="text-gray-600">Loading AI insights...</p>
                  </div>
                </div>
              </div>
            ) : aiInsights ? (
              <>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold">AI-Powered Business Insights</h3>
                  </div>
                  <AIInsights insights={aiInsights} />
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-cyan-500" />
                    <h3 className="font-bold">Advanced Analytics</h3>
                  </div>
                  <AnalyticsCharts 
                    viewsData={analyticsData.viewsData}
                    categoryData={analyticsData.categoryData}
                    performanceData={analyticsData.performanceData}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 text-center py-12">
                  No analytics data available. Create some specials and events to see AI insights!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ML Insights */}
        {currentView === 'ml-insights' && (
          <div className="space-y-6">
            {!mlInsightsSubscribed ? (
              <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-xl p-8 border-2 border-cyan-200 shadow-lg">
                <div className="text-center max-w-3xl mx-auto">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    Unlock ML-Powered Insights
                  </h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Get AI-driven recommendations to optimize your menu pricing, create data-backed specials, 
                    and maximize your revenue with intelligent business insights tailored specifically to your establishment.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold">Smart Pricing</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        AI-optimized pricing suggestions based on market trends, competition, and customer preferences
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="w-5 h-5 text-cyan-600" />
                        <h4 className="font-semibold">Special Recommendations</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Data-driven special offers and promotions tailored to your business type and location
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold">Performance Insights</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Advanced analytics showing peak hours, popular items, and revenue optimization opportunities
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 mb-6 shadow-md max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">R149/month</p>
                        <p className="text-sm text-gray-600">Billed monthly • Cancel anytime</p>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        Save 25%
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-left mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Unlimited ML-powered insights</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>AI-generated special suggestions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Dynamic pricing recommendations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Weekly performance reports</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => setMlInsightsSubscribed(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold"
                  >
                    Subscribe to ML Insights
                  </Button>
                  <p className="text-xs text-gray-500 mt-4">
                    30-day money-back guarantee • No long-term commitment
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">ML Insights Included</p>
                      <p className="text-sm text-green-700">Part of your {subscriptionPrice}/month subscription</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLoadingMlInsights(true)}
                    disabled={loadingMlInsights}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingMlInsights ? 'animate-spin' : ''}`} />
                    Refresh Insights
                  </Button>
                </div>

                {loadingMlInsights ? (
                  <div className="bg-white rounded-lg p-12 shadow-sm">
                    <div className="flex flex-col items-center justify-center">
                      <Brain className="w-12 h-12 animate-pulse text-blue-600 mb-4" />
                      <p className="text-gray-600 text-lg mb-2">Analyzing your business data...</p>
                      <p className="text-sm text-gray-500">This may take a few moments</p>
                    </div>
                  </div>
                  ) : (
                    <>
                      {/* Price Recommendations Component */}
                      <PriceRecommendations 
                        businessId={localStorage.getItem('business_id') || undefined}
                        onSuccess={showSuccess}
                        onError={showError}
                      />

                      {/* Performance Insights */}
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Performance Insights</h3>
                            <p className="text-sm text-gray-600">Key metrics and opportunities</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Peak Hours</p>
                            <p className="text-2xl font-bold text-blue-600 mb-2">7PM - 9PM</p>
                            <p className="text-xs text-gray-600">Friday & Saturday have 3x more traffic</p>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Most Popular Item</p>
                            <p className="text-2xl font-bold text-green-600 mb-2">
                              {menuItems[0]?.name || 'Signature Dish'}
                            </p>
                            <p className="text-xs text-gray-600">42% of customers order this</p>
                          </div>
                          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Revenue Opportunity</p>
                            <p className="text-2xl font-bold text-cyan-600 mb-2">R12,450</p>
                            <p className="text-xs text-gray-600">Potential monthly increase</p>
                          </div>
                        </div>
                      </div>

                    {/* Special Recommendations */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                            <Percent className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">AI-Generated Special Suggestions</h3>
                            <p className="text-sm text-gray-600">Personalized for {settingsFormData.name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          {
                            title: "Weekend Brunch Special",
                            description: `Perfect for ${settingsFormData.city} weekend crowd. 2-for-1 breakfast items from 9AM-12PM`,
                            discount: 50,
                            expectedImpact: "+28% weekend revenue",
                            reason: "High foot traffic on weekends in your area",
                            daysOfWeek: [0, 6], // Saturday & Sunday
                            timeStart: "09:00",
                            timeEnd: "12:00"
                          },
                          {
                            title: "Happy Hour Cocktail Deal",
                            description: "Buy 2 cocktails, get 1 free. Monday-Thursday 5PM-7PM",
                            discount: 33,
                            expectedImpact: "+45% early evening visits",
                            reason: "Low traffic period needs boost",
                            daysOfWeek: [1, 2, 3, 4], // Monday-Thursday
                            timeStart: "17:00",
                            timeEnd: "19:00"
                          },
                          {
                            title: "Lunch Express Menu",
                            description: "Quick lunch options R99. Perfect for nearby office workers",
                            discount: 25,
                            expectedImpact: "+60% weekday lunch sales",
                            reason: "Capitalize on business district location",
                            daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
                            timeStart: "11:00",
                            timeEnd: "14:00"
                          },
                          {
                            title: "Date Night Package",
                            description: "3-course meal for 2 + bottle of wine. Friday & Saturday evenings",
                            discount: 20,
                            expectedImpact: "+35% couple bookings",
                            reason: "High demand for romantic dining experiences",
                            daysOfWeek: [5, 6], // Friday & Saturday
                            timeStart: "18:00",
                            timeEnd: "22:00"
                          }
                        ].map((suggestion, idx) => (
                          <div key={idx} className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-bold text-gray-900">{suggestion.title}</h4>
                              <span className="px-2 py-1 bg-cyan-500 text-white text-xs rounded-full font-semibold">
                                {suggestion.discount}% OFF
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                            {suggestion.daysOfWeek && suggestion.daysOfWeek.length > 0 && (
                              <div className="flex gap-1 mb-3">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dayIdx) => (
                                  <div 
                                    key={dayIdx}
                                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold ${
                                      suggestion.daysOfWeek.includes(dayIdx)
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}
                                  >
                                    {day}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="bg-white rounded p-2 mb-3">
                              <p className="text-xs text-gray-600 mb-1">Expected Impact:</p>
                              <p className="text-sm font-semibold text-green-600">{suggestion.expectedImpact}</p>
                            </div>
                            <div className="bg-blue-50 rounded p-2 mb-3">
                              <p className="text-xs text-blue-900">
                                <span className="font-semibold">Why:</span> {suggestion.reason}
                              </p>
                            </div>
                            <Button 
                              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                              disabled={creatingSpecialIndex === idx}
                              onClick={async () => {
                                try {
                                  setCreatingSpecialIndex(idx);
                                  const businessId = localStorage.getItem('business_id') || 'palms';
                                  
                                  // Generate image URL based on special title
                                  let imageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                                  const title = suggestion.title.toLowerCase();
                                  
                                  if (title.includes('lunch') || title.includes('business')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400';
                                  } else if (title.includes('date') || title.includes('romantic') || title.includes('night')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400';
                                  } else if (title.includes('brunch')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400';
                                  } else if (title.includes('happy hour') || title.includes('drinks')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400';
                                  } else if (title.includes('wine')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400';
                                  } else if (title.includes('breakfast')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400';
                                  } else if (title.includes('seafood')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1559737558-2f5a3f3e2f9d?w=400';
                                  } else if (title.includes('steak') || title.includes('meat')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1558030006-450675393462?w=400';
                                  } else if (title.includes('pizza')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400';
                                  } else if (title.includes('sushi')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400';
                                  } else if (title.includes('dessert') || title.includes('sweet')) {
                                    imageUrl = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400';
                                  }
                                  
                                  console.log(`🖼️ Using image for "${title}": ${imageUrl}`);
                                  
                                  const specialData = {
                                    business_id: businessId,
                                    title: suggestion.title,
                                    description: suggestion.description,
                                    price: '',
                                    discount_percentage: suggestion.discount,
                                    start_date: new Date().toISOString().split('T')[0],
                                    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    time_start: suggestion.timeStart || '09:00',
                                    time_end: suggestion.timeEnd || '22:00',
                                    days_of_week: suggestion.daysOfWeek || null,
                                    is_active: true,
                                    view_count: 0,
                                    image_url: imageUrl
                                  };

                                  const response = await fetch(
                                    `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials`,
                                    {
                                      method: 'POST',
                                      headers: {
                                        'Authorization': `Bearer ${publicAnonKey}`,
                                        'Content-Type': 'application/json'
                                      },
                                      body: JSON.stringify(specialData)
                                    }
                                  );

                                  if (response.ok) {
                                    showSuccess(`✅ "${suggestion.title}" created successfully!`);
                                    
                                    // Refresh specials list
                                    const refreshResponse = await fetch(
                                      `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/specials`,
                                      {
                                        headers: {
                                          'Authorization': `Bearer ${publicAnonKey}`
                                        }
                                      }
                                    );
                                    
                                    if (refreshResponse.ok) {
                                      const data = await refreshResponse.json();
                                      const mySpecials = (data.specials || []).filter((s: Special) => s.business_id === businessId);
                                      setSpecials(mySpecials);
                                    }
                                  } else {
                                    const error = await response.json();
                                    showError(`Failed to create special: ${error.error || 'Unknown error'}`);
                                  }
                                } catch (error) {
                                  console.error('Error creating special:', error);
                                  showError('Network error. Please check your connection.');
                                } finally {
                                  setCreatingSpecialIndex(null);
                                }
                              }}
                            >
                              {creatingSpecialIndex === idx ? 'Creating...' : 'Create This Special'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Performance Insights</h3>
                          <p className="text-sm text-gray-600">Key metrics and opportunities</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Peak Hours</p>
                          <p className="text-2xl font-bold text-blue-600 mb-2">7PM - 9PM</p>
                          <p className="text-xs text-gray-600">Friday & Saturday have 3x more traffic</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Most Popular Item</p>
                          <p className="text-2xl font-bold text-green-600 mb-2">
                            {menuItems[0]?.name || 'Signature Dish'}
                          </p>
                          <p className="text-xs text-gray-600">42% of customers order this</p>
                        </div>
                        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Revenue Opportunity</p>
                          <p className="text-2xl font-bold text-cyan-600 mb-2">R12,450</p>
                          <p className="text-xs text-gray-600">Potential monthly increase</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Reviews */}
        {currentView === 'reviews' && (
          <div className="space-y-6">
            {/* Reviews Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-600">Overall Rating</h3>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold">
                    {reviews.length > 0 
                      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                      : '4.8'}
                  </p>
                  <p className="text-gray-500 mb-1">/ 5.0</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">Based on {reviews.length} reviews</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-600">Total Reviews</h3>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-4xl font-bold">{reviews.length}</p>
                <p className="text-sm text-green-600 mt-1">+12 this month</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-600">Response Rate</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-4xl font-bold">87%</p>
                <p className="text-sm text-gray-500 mt-1">Avg response time: 2h</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = reviews.filter(r => r.rating === stars).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{stars}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WhatsApp Review Request */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-sm border border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Request Reviews via WhatsApp 📱</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Send personalized review requests to your customers through WhatsApp. They can submit their review with just one click!
                  </p>
                  <button
                    onClick={() => {
                      const customerName = prompt('Enter customer name:');
                      if (!customerName) return;
                      
                      const customerPhone = prompt('Enter customer WhatsApp number (e.g., +27821234567):');
                      if (!customerPhone) return;
                      
                      // Generate WhatsApp review request
                      const businessId = localStorage.getItem('business_id');
                      if (!businessId) {
                        alert('Business ID not found');
                        return;
                      }
                      
                      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/send-review-request`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${getAuthToken()}`
                        },
                        body: JSON.stringify({
                          business_id: businessId,
                          customer_name: customerName,
                          customer_phone: customerPhone
                        })
                      })
                      .then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          // Open WhatsApp with the pre-filled message
                          window.open(data.whatsapp_link, '_blank');
                        } else {
                          alert('Failed to generate review request: ' + (data.error || 'Unknown error'));
                        }
                      })
                      .catch(error => {
                        console.error('Error:', error);
                        alert('Failed to send review request');
                      });
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Send WhatsApp Review Request
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold">Customer Reviews</h3>
                <p className="text-sm text-gray-500">Recent feedback from your customers</p>
              </div>
              
              {loadingReviews ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5166] mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-12 text-center">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Reviews Yet</h3>
                  <p className="text-gray-500">Your customer reviews will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {review.customer_name ? review.customer_name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <h4 className="font-semibold">{review.customer_name || 'Anonymous'}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating 
                                      ? 'text-yellow-500 fill-yellow-500' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.date ? new Date(review.date).toLocaleDateString('en-ZA', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Recent'}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3 ml-13">{review.comment}</p>
                      
                      {/* Business Reply */}
                      {review.business_reply && (
                        <div className="ml-13 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                          <div className="flex items-start gap-2">
                            <div className="text-blue-600 font-semibold text-sm">Business Reply:</div>
                          </div>
                          <p className="text-gray-700 text-sm mt-1">{review.business_reply}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {review.business_reply_date ? new Date(review.business_reply_date).toLocaleDateString('en-ZA', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'Recent'}
                          </p>
                        </div>
                      )}
                      
                      {/* Reply Form */}
                      {replyingToReview === review.id && !review.business_reply && (
                        <div className="ml-13 bg-gray-50 rounded-lg p-4 mb-3">
                          <textarea
                            value={replyText[review.id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                            placeholder="Write your reply..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleReplyToReview(review.id)}
                              disabled={sendingReply}
                              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
                            >
                              {sendingReply ? 'Sending...' : 'Send Reply'}
                            </button>
                            <button
                              onClick={() => {
                                setReplyingToReview(null);
                                setReplyText(prev => ({ ...prev, [review.id]: '' }));
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 ml-13">
                        <button className="text-sm text-gray-500 hover:text-[#3B5166] transition-colors">
                          👍 Helpful ({review.helpful_count || 0})
                        </button>
                        {!review.business_reply && (
                          <button
                            onClick={() => setReplyingToReview(replyingToReview === review.id ? null : review.id)}
                            className="text-sm text-[#3B5166] hover:text-[#2d3f4f] font-medium transition-colors"
                          >
                            {replyingToReview === review.id ? 'Cancel Reply' : 'Reply'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reservations */}
        {currentView === 'reservations' && (
          <ReservationsManager 
            businessId={businessId}
            businessName={businessName || settingsFormData.name}
          />
        )}

        {/* Social Media Ads */}
        {currentView === 'ads' && (
          <SocialMediaAdsManager 
            businessId={businessId}
            businessName={businessName || settingsFormData.name}
          />
        )}

        {/* Debug Tools */}
        {currentView === 'debug' && (
          <div className="space-y-6">
            <DataSeeder />
          </div>
        )}

        {/* Settings */}
        {currentView === 'settings' && (
          <div className="space-y-6">
            {/* Business Profile: Establishment Type, Cuisine & Age Group */}
            <BusinessProfileSettings
              establishmentType={(settingsFormData as any).business_type || 'restaurant'}
              cuisineTypes={(settingsFormData as any).cuisine_types || []}
              ageGroups={(settingsFormData as any).age_groups || []}
              onEstablishmentTypeChange={(type) => setSettingsFormData({ ...settingsFormData, business_type: type } as any)}
              onCuisineTypesChange={(cuisines) => setSettingsFormData({ ...settingsFormData, cuisine_types: cuisines } as any)}
              onAgeGroupsChange={(ageGroups) => setSettingsFormData({ ...settingsFormData, age_groups: ageGroups } as any)}
            />

            {/* Business Logo - Prominent Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {logoImagePreview ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                      {logoImageLoading && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
                        </div>
                      )}
                      {logoImageError ? (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Failed to load</p>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={logoImagePreview} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover"
                          onLoad={() => setLogoImageLoading(false)}
                          onError={() => {
                            setLogoImageLoading(false);
                            setLogoImageError(true);
                            console.error('Failed to load logo image:', logoImagePreview);
                          }}
                          onLoadStart={() => setLogoImageLoading(true)}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white border-4 border-dashed border-cyan-300 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-cyan-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Business Logo</h3>
                  <p className="text-gray-700 text-sm mb-4">
                    Upload a professional logo for your establishment. This will appear in the sidebar, customer app, and across the platform.
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input 
                        id="business-logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setLogoFile(file);
                            // Create preview
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLogoImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="flex-1"
                      />
                      {logoFile && (
                        <Button
                          onClick={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white min-w-[120px]"
                        >
                          {uploadingLogo ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      )}
                      {logoImagePreview && !logoFile && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setLogoImagePreview(null);
                            setLogoImageError(false);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {logoFile && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ Selected: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                    {logoImageError && (
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ Failed to load image. Please try uploading again or choose a different image.
                      </p>
                    )}
                    <p className="text-xs text-gray-600">
                      <strong>Recommended:</strong> Square image (1:1 ratio), minimum 200x200px, PNG or JPG format
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Cover Image */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-cyan-200 rounded-xl p-6 shadow-lg">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Restaurant Cover Image</h3>
                  <p className="text-gray-700 text-sm mb-4">
                    Upload a stunning cover photo that showcases your restaurant's ambiance, signature dishes, or interior. This image will be prominently displayed on your business profile.
                  </p>
                </div>
                
                {coverImagePreview && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border-4 border-white shadow-xl">
                    {coverImageLoading && (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      </div>
                    )}
                    {coverImageError ? (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Failed to load cover image</p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                        onLoad={() => setCoverImageLoading(false)}
                        onError={() => {
                          setCoverImageLoading(false);
                          setCoverImageError(true);
                          console.error('Failed to load cover image:', coverImagePreview);
                        }}
                        onLoadStart={() => setCoverImageLoading(true)}
                      />
                    )}
                  </div>
                )}
                
                {!coverImagePreview && (
                  <div className="w-full h-64 rounded-lg bg-white border-4 border-dashed border-cyan-300 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No cover image yet</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverFile(file);
                          // Create preview
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCoverImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="flex-1"
                    />
                    {coverFile && (
                      <Button
                        onClick={handleCoverImageUpload}
                        disabled={uploadingCover}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white min-w-[120px]"
                      >
                        {uploadingCover ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    )}
                    {coverImagePreview && !coverFile && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCoverImagePreview(null);
                          setCoverImageError(false);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {coverFile && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Selected: {coverFile.name} ({(coverFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                  {coverImageError && (
                    <p className="text-sm text-red-600 font-medium">
                      ⚠️ Failed to load image. Please try uploading again or choose a different image.
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    <strong>Recommended:</strong> Landscape image (16:9 ratio), minimum 1200x675px, PNG or JPG format
                  </p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-4">Business Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input 
                    id="business-name" 
                    value={settingsFormData.name}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="business-address">Address</Label>
                  <Input 
                    id="business-address" 
                    value={settingsFormData.address}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, address: e.target.value })}
                    placeholder="e.g., Fourways Mall, Montecasino Boulevard"
                  />
                  <p className="text-xs text-gray-500 mt-1">💡 Tip: Use specific landmarks or street names for best results</p>
                </div>
                <div>
                  <Label htmlFor="business-city">City</Label>
                  <Input 
                    id="business-city" 
                    value={settingsFormData.city}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, city: e.target.value })}
                    placeholder="e.g., Sandton"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-blue-900">GPS Coordinates</h4>
                        <p className="text-xs text-blue-700 mt-1">Auto-generate coordinates from your address for location-based features</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={handleGeocodeAddress}
                      disabled={geocoding || !settingsFormData.address || !settingsFormData.city}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      {geocoding ? 'Finding...' : 'Get Coordinates'}
                    </Button>
                  </div>
                  {(coordinates || (settingsFormData.latitude !== 0 && settingsFormData.longitude !== 0)) && (
                    <div className="bg-white p-3 rounded border border-blue-300 space-y-2">
                      {coordinates?.formatted_address && (
                        <div className="pb-2 border-b border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">📍 Found Location:</p>
                          <p className="text-xs text-gray-900">{coordinates.formatted_address}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Latitude:</span> {(coordinates?.latitude || settingsFormData.latitude).toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Longitude:</span> {(coordinates?.longitude || settingsFormData.longitude).toFixed(6)}
                        </p>
                      </div>
                      <p className="text-xs text-green-600 mt-2">✓ Coordinates will be saved when you click "Save Settings"</p>
                    </div>
                  )}
                  {!coordinates && settingsFormData.latitude === 0 && settingsFormData.longitude === 0 && (
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-300 space-y-1">
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">⚠️ No GPS coordinates set</span>
                      </p>
                      <p className="text-xs text-yellow-700">
                        Click "Get Coordinates" above, or they will be auto-generated when you save settings
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-phone">Phone</Label>
                    <Input 
                      id="business-phone" 
                      value={settingsFormData.phone}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="business-email">Email</Label>
                    <Input 
                      id="business-email" 
                      type="email" 
                      value={settingsFormData.email}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="business-description">Description</Label>
                  <Textarea 
                    id="business-description" 
                    rows={4} 
                    value={settingsFormData.description}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, description: e.target.value })}
                  />
                </div>

                {/* Average Price Per Person */}
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <Label className="text-base font-semibold mb-3 block">Average Price Per Person</Label>
                  <p className="text-sm text-gray-600 mb-4">Help customers understand your pricing by setting an estimated price range per person</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="avg-price-min">From (R)</Label>
                      <Input 
                        id="avg-price-min" 
                        type="number"
                        min="0"
                        placeholder="e.g., 150"
                        value={settingsFormData.avg_price_min || ''}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, avg_price_min: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="avg-price-max">To (R)</Label>
                      <Input 
                        id="avg-price-max" 
                        type="number"
                        min="0"
                        placeholder="e.g., 350"
                        value={settingsFormData.avg_price_max || ''}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, avg_price_max: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  {settingsFormData.avg_price_min > 0 && settingsFormData.avg_price_max > 0 && (
                    <p className="text-sm text-green-700 mt-2">
                      ✓ Price range: R{settingsFormData.avg_price_min} - R{settingsFormData.avg_price_max} per person
                    </p>
                  )}
                </div>

                {/* Opening Hours */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <Label className="text-base font-semibold">Opening Hours</Label>
                  </div>
                  <p className="text-sm text-gray-600">Set your business hours for each day of the week</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const dayData = settingsFormData.opening_hours?.[day] || { open: '09:00', close: '22:00', closed: false };
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <div className="w-24">
                            <span className="text-sm font-medium capitalize">{day}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={dayData.open || ''}
                              onChange={(e) => setSettingsFormData({
                                ...settingsFormData,
                                opening_hours: {
                                  ...settingsFormData.opening_hours,
                                  [day]: {
                                    ...dayData,
                                    open: e.target.value
                                  }
                                }
                              })}
                              disabled={dayData.closed}
                              className="w-32"
                            />
                            <span className="text-sm text-gray-500">to</span>
                            <Input
                              type="time"
                              value={dayData.close || ''}
                              onChange={(e) => setSettingsFormData({
                                ...settingsFormData,
                                opening_hours: {
                                  ...settingsFormData.opening_hours,
                                  [day]: {
                                    ...dayData,
                                    close: e.target.value
                                  }
                                }
                              })}
                              disabled={dayData.closed}
                              className="w-32"
                            />
                            <label className="flex items-center gap-2 ml-auto">
                              <input
                                type="checkbox"
                                checked={dayData.closed || false}
                                onChange={(e) => setSettingsFormData({
                                  ...settingsFormData,
                                  opening_hours: {
                                    ...settingsFormData.opening_hours,
                                    [day]: {
                                      ...dayData,
                                      closed: e.target.checked
                                    }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-600">Closed</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {settingsFormData.address && settingsFormData.city && 
                 settingsFormData.latitude === 0 && settingsFormData.longitude === 0 && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-xs text-blue-800">
                      💡 <span className="font-semibold">Tip:</span> GPS coordinates will be automatically generated from your address when you save
                    </p>
                  </div>
                )}
                
                <Button 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white disabled:opacity-50"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold mb-4">Subscription & Billing</h3>
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-lg">Active Subscription</p>
                    <p className="text-sm text-gray-600">{subscriptionPrice}/month</p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Active
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✓ Unlimited specials & events</p>
                  <p>✓ Advanced analytics & AI insights</p>
                  <p>✓ Priority support</p>
                </div>
                <div className="mt-4 pt-4 border-t border-cyan-200">
                  <p className="text-xs text-gray-500">Next billing date: Feb 14, 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}