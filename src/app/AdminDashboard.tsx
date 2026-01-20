import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, LayoutDashboard, Building2, CreditCard, FileCheck, Settings, TrendingUp, Users, DollarSign, Calendar, Search, Filter, Download, Eye, Ban, CheckCircle, XCircle, MoreVertical, RefreshCw, Bell, Send, ExternalLink, AlertCircle, Brain, BarChart3, Video } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import MLInsightsDashboard from '@/app/components/MLInsightsDashboard';
import { AdvancedInsights } from '@/app/components/AdvancedInsights';
import { AdminAdsManagement } from '@/app/components/AdminAdsManagement';

// Types
interface Business {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  city: string;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  total_revenue: number;
  total_orders: number;
  rating: number;
  is_active: boolean;
  // Subscription billing fields
  subscription_start_date?: string;
  last_payment_date?: string;
  next_payment_due?: string;
  payment_status?: 'paid' | 'pending' | 'overdue' | 'reminder_sent';
  payment_link?: string;
}

interface Payment {
  id: string;
  business_id: string;
  business_name: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  customer_name?: string;
  payment_method?: string;
}

interface PlatformStats {
  total_businesses: number;
  active_businesses: number;
  subscriptions_received: number;
  outstanding_subscriptions: number;
  overdue_subscriptions: number;
  pending_payment: number;
  subscription_revenue: number;
  current_month_signups: number;
  last_month_signups: number;
  mom_growth_percentage: number;
  mom_growth_positive: boolean;
  
  // Analytics & Engagement Metrics
  total_reviews: number;
  avg_rating: number;
  positive_reviews: number;
  neutral_reviews: number;
  negative_reviews: number;
  sentiment_score: number;
  
  total_views: number;
  total_clicks: number;
  ctr: number;
  engagement_rate: number;
  call_clicks: number;
  direction_clicks: number;
  menu_views: number;
  
  active_specials: number;
  active_events: number;
  
  // Legacy
  total_customers: number;
  total_revenue: number;
  monthly_revenue: number;
  total_transactions: number;
  pending_payouts: number;
  paid_subscriptions: number;
}

interface PlatformSettings {
  monthly_subscription_fee: number;
  auto_approve_businesses: boolean;
  reminder_days_before_due: number;
  overdue_grace_period: number;
}

interface AdminDashboardProps {
  onBack?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [currentSection, setCurrentSection] = useState<'overview' | 'businesses' | 'payments' | 'settings' | 'subscriptions' | 'ml-insights' | 'advanced-insights' | 'affiliates' | 'ads'>('overview');
  const [stats, setStats] = useState<PlatformStats>({
    total_businesses: 0,
    active_businesses: 0,
    subscriptions_received: 0,
    outstanding_subscriptions: 0,
    overdue_subscriptions: 0,
    pending_payment: 0,
    subscription_revenue: 0,
    current_month_signups: 0,
    last_month_signups: 0,
    mom_growth_percentage: 0,
    mom_growth_positive: false,
    
    // Analytics & Engagement Metrics
    total_reviews: 0,
    avg_rating: 0,
    positive_reviews: 0,
    neutral_reviews: 0,
    negative_reviews: 0,
    sentiment_score: 0,
    
    total_views: 0,
    total_clicks: 0,
    ctr: 0,
    engagement_rate: 0,
    call_clicks: 0,
    direction_clicks: 0,
    menu_views: 0,
    
    active_specials: 0,
    active_events: 0,
    
    // Legacy
    total_customers: 0,
    total_revenue: 0,
    monthly_revenue: 0,
    total_transactions: 0,
    pending_payouts: 0,
    paid_subscriptions: 0
  });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  
  // Platform analytics state
  const [platformAnalytics, setPlatformAnalytics] = useState<any>(null);
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    monthly_subscription_fee: 299,
    auto_approve_businesses: false,
    reminder_days_before_due: 7,
    overdue_grace_period: 5
  });

  const fetchAffiliates = useCallback(async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/affiliates`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAffiliates(data.affiliates || []);
      }

      // Fetch all commissions
      const commissionsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/commissions/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (commissionsResponse.ok) {
        const commissionsData = await commissionsResponse.json();
        setCommissions(commissionsData.commissions || []);
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    }
  }, []); // Empty dependencies since it only uses constants

  useEffect(() => {
    fetchAdminData();
  }, []); // Only run once on mount

  useEffect(() => {
    if (currentSection === 'affiliates') {
      fetchAffiliates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection]); // Fetch affiliates when switching to that section

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch all businesses
      const businessesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/businesses`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (businessesResponse.ok) {
        const businessesData = await businessesResponse.json();
        setBusinesses(businessesData.businesses || []);
      }

      // Fetch platform stats
      const statsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        // Ensure all stat values are numbers with fallback to 0
        const receivedStats = statsData.stats || {};
        setStats({
          total_businesses: receivedStats.total_businesses || 0,
          active_businesses: receivedStats.active_businesses || 0,
          subscriptions_received: receivedStats.subscriptions_received || 0,
          outstanding_subscriptions: receivedStats.outstanding_subscriptions || 0,
          overdue_subscriptions: receivedStats.overdue_subscriptions || 0,
          pending_payment: receivedStats.pending_payment || 0,
          subscription_revenue: receivedStats.subscription_revenue || 0,
          current_month_signups: receivedStats.current_month_signups || 0,
          last_month_signups: receivedStats.last_month_signups || 0,
          mom_growth_percentage: receivedStats.mom_growth_percentage || 0,
          mom_growth_positive: receivedStats.mom_growth_positive || false,
          
          // Analytics & Engagement Metrics
          total_reviews: receivedStats.total_reviews || 0,
          avg_rating: receivedStats.avg_rating || 0,
          positive_reviews: receivedStats.positive_reviews || 0,
          neutral_reviews: receivedStats.neutral_reviews || 0,
          negative_reviews: receivedStats.negative_reviews || 0,
          sentiment_score: receivedStats.sentiment_score || 0,
          
          total_views: receivedStats.total_views || 0,
          total_clicks: receivedStats.total_clicks || 0,
          ctr: receivedStats.ctr || 0,
          engagement_rate: receivedStats.engagement_rate || 0,
          call_clicks: receivedStats.call_clicks || 0,
          direction_clicks: receivedStats.direction_clicks || 0,
          menu_views: receivedStats.menu_views || 0,
          
          active_specials: receivedStats.active_specials || 0,
          active_events: receivedStats.active_events || 0,
          
          // Legacy
          total_customers: receivedStats.total_customers || 0,
          total_revenue: receivedStats.total_revenue || 0,
          monthly_revenue: receivedStats.monthly_revenue || 0,
          total_transactions: receivedStats.total_transactions || 0,
          pending_payouts: receivedStats.pending_payouts || 0,
          paid_subscriptions: receivedStats.paid_subscriptions || 0
        });
      }

      // Fetch all payments
      const paymentsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/payments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      }

      // Fetch platform analytics
      try {
        const analyticsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/analytics/platform`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          console.log('[Admin] Platform analytics loaded:', analyticsData);
          setPlatformAnalytics(analyticsData);
        }
      } catch (error) {
        console.error('Error fetching platform analytics:', error);
      }

      // Fetch all reservations
      try {
        const reservationsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/analytics/reservations`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          console.log('[Admin] Reservations loaded:', reservationsData.total_count);
          setAllReservations(reservationsData.reservations || []);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }

      setLoadingAnalytics(false);

      // Fetch platform settings
      try {
        const settingsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/settings`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          console.log('[Admin] Platform settings loaded:', settingsData);
          setPlatformSettings(settingsData.settings);
        }
      } catch (error) {
        console.error('Error fetching platform settings:', error);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAffiliate = async (affiliateId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/affiliates/${affiliateId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        alert('✅ Affiliate approved successfully!');
        fetchAffiliates(); // Refresh list
      } else {
        alert('❌ Failed to approve affiliate');
      }
    } catch (error) {
      console.error('Error approving affiliate:', error);
      alert('❌ Network error');
    }
  };

  const handleMarkCommissionPaid = async (commissionId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/commissions/${commissionId}/mark-paid`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        alert('✅ Commission marked as paid!');
        fetchAffiliates(); // Refresh data
      } else {
        alert('❌ Failed to mark commission as paid');
      }
    } catch (error) {
      console.error('Error marking commission as paid:', error);
      alert('❌ Network error');
    }
  };

  const handleToggleBusinessStatus = async (businessId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/businesses/${businessId}/toggle-status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_active: !currentStatus })
        }
      );

      if (response.ok) {
        // Update local state
        setBusinesses(prev => prev.map(b => 
          b.id === businessId ? { ...b, is_active: !currentStatus } : b
        ));
        
        // Update selected business if it's the one being toggled
        if (selectedBusiness?.id === businessId) {
          setSelectedBusiness({ ...selectedBusiness, is_active: !currentStatus });
        }
        
        // Silent success - no alert needed
        console.log(`✅ Business ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        console.error('Failed to update business status');
      }
    } catch (error) {
      console.error('Error toggling business status:', error);
    }
  };

  const handleExportData = () => {
    const csvContent = businesses.map(b => 
      `${b.name},${b.type},${b.email},${b.subscription_plan},${b.subscription_status},R${b.total_revenue}`
    ).join('\n');
    
    const blob = new Blob([`Name,Type,Email,Plan,Status,Revenue\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibespot-businesses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/settings`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(platformSettings)
        }
      );

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  const handleViewFullProfile = (business: Business) => {
    // Navigate to subscriptions section with this business highlighted
    setSelectedBusiness(null);
    setCurrentSection('businesses');
    // Set search to filter for this specific business
    setSearchQuery(business.name);
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && b.is_active) ||
                         (filterStatus === 'inactive' && !b.is_active) ||
                         (filterStatus === b.subscription_status);
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Overview Section
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Primary Subscription Metrics - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Establishments */}
        <button
          onClick={() => setCurrentSection('businesses')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              {stats.total_businesses}
            </span>
          </div>
          <h3 className="text-gray-900 text-lg font-semibold mb-1">Total Establishments</h3>
          <p className="text-sm text-gray-500">Click to view all businesses</p>
        </button>

        {/* Subscriptions Received */}
        <button
          onClick={() => setCurrentSection('businesses')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-green-600">
              {stats.subscriptions_received}
            </span>
          </div>
          <h3 className="text-gray-900 text-lg font-semibold mb-1">Subscriptions Received</h3>
          <p className="text-sm text-green-600 font-medium">Paid & Active</p>
        </button>

        {/* Outstanding Subscriptions */}
        <button
          onClick={() => setCurrentSection('businesses')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-cyan-600">
              {stats.outstanding_subscriptions}
            </span>
          </div>
          <h3 className="text-gray-900 text-lg font-semibold mb-1">Outstanding Subscriptions</h3>
          <p className="text-sm text-cyan-600 font-medium">{stats.overdue_subscriptions} overdue</p>
        </button>

        {/* Month-on-Month Growth */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${
              stats.mom_growth_positive 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                : 'bg-gradient-to-br from-red-500 to-pink-600'
            }`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className={`text-3xl font-bold ${
              stats.mom_growth_positive ? 'text-blue-600' : 'text-red-600'
            }`}>
              {stats.mom_growth_positive ? '+' : ''}{stats.mom_growth_percentage.toFixed(1)}%
            </span>
          </div>
          <h3 className="text-gray-900 text-lg font-semibold mb-1">MoM Growth</h3>
          <p className="text-sm text-gray-500">
            {stats.current_month_signups} this month vs {stats.last_month_signups} last month
          </p>
        </div>
      </div>

      {/* Revenue and Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
          <div className="flex items-end justify-between h-64">
            {[45000, 52000, 48000, 61000, 58000, 67000].map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t-lg mx-1"
                  style={{ height: `${(value / 70000) * 100}%` }}
                />
                <span className="text-xs text-gray-500 mt-2">
                  {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Top Performing Businesses</h3>
          <div className="space-y-4">
            {businesses.slice(0, 5).map((business, index) => (
              <div key={business.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{business.name}</p>
                    <p className="text-xs text-gray-500">{business.city}</p>
                  </div>
                </div>
                <span className="font-semibold text-green-600 text-sm">
                  {formatCurrency(business.total_revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Analytics - Click Tracking & Reservations */}
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <BarChart3 className="w-7 h-7" />
          Platform Value & Engagement Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Total Clicks</p>
            <p className="text-3xl font-bold">{loadingAnalytics ? '...' : (platformAnalytics?.platform_metrics.total_clicks || 0).toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">Carousel & venue clicks</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Platform CTR</p>
            <p className="text-3xl font-bold">{loadingAnalytics ? '...' : (platformAnalytics?.platform_metrics.platform_ctr || 0)}%</p>
            <p className="text-xs opacity-75 mt-1">{loadingAnalytics ? '' : `${(platformAnalytics?.platform_metrics.total_views || 0).toLocaleString()} total views`}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Total Reservations</p>
            <p className="text-3xl font-bold">{loadingAnalytics ? '...' : (platformAnalytics?.platform_metrics.total_reservations || 0)}</p>
            <p className="text-xs opacity-75 mt-1">{loadingAnalytics ? '' : `${platformAnalytics?.platform_metrics.reservation_conversion || 0}% conversion`}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90 mb-1">Total Value Created</p>
            <p className="text-3xl font-bold">R{loadingAnalytics ? '...' : (platformAnalytics?.platform_metrics.total_estimated_revenue || 0).toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">Estimated revenue generated</p>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <h4 className="font-semibold mb-3">Conversion Funnel</h4>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <p className="opacity-75">Views</p>
              <p className="text-2xl font-bold">{loadingAnalytics ? '...' : (platformAnalytics?.platform_metrics.total_views || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/60" style={{ width: `${platformAnalytics?.platform_metrics.platform_ctr || 0}%` }}></div>
              </div>
              <span className="ml-2 opacity-75">{platformAnalytics?.platform_metrics.platform_ctr || 0}%</span>
            </div>
            <div>
              <p className="opacity-75">Clicks</p>
              <p className="text-2xl font-bold">{loadingAnalytics ? '...' : (platformAnalytics?.platform_metrics.total_clicks || 0).toLocaleString()}</p>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/60" style={{ width: `${platformAnalytics?.platform_metrics.reservation_conversion || 0}%` }}></div>
              </div>
              <span className="ml-2 opacity-75">{platformAnalytics?.platform_metrics.reservation_conversion || 0}%</span>
            </div>
            <div>
              <p className="opacity-75">Reservations</p>
              <p className="text-2xl font-bold">{loadingAnalytics ? '...' : (platformAnalytics?.platform_metrics.total_reservations || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Businesses by Revenue */}
      {!loadingAnalytics && platformAnalytics?.top_businesses && platformAnalytics.top_businesses.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            Top 10 Performing Businesses (by Revenue Generated)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Rank</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Business</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">Clicks</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">Reservations</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {platformAnalytics.top_businesses.map((biz: any, index: number) => (
                  <tr key={biz.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-cyan-400 to-cyan-500' :
                        'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{biz.name}</td>
                    <td className="p-3 text-right">{biz.clicks.toLocaleString()}</td>
                    <td className="p-3 text-right">{biz.reservations}</td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-green-600">R{biz.revenue.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Reservations Table */}
      {!loadingAnalytics && allReservations.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            All Platform Reservations ({allReservations.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Business</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Date & Time</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">Party Size</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">Est. Value</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {allReservations.slice(0, 50).map((res: any) => (
                  <tr key={res.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-sm">{res.customer_name}</p>
                        <p className="text-xs text-gray-500">{res.customer_email}</p>
                        <p className="text-xs text-gray-400">{res.customer_phone}</p>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-sm">{res.business_name}</td>
                    <td className="p-3 text-sm">
                      {new Date(res.reservation_date).toLocaleDateString('en-ZA', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })} at {res.reservation_time}
                    </td>
                    <td className="p-3 text-right">{res.party_size}</td>
                    <td className="p-3 text-right">
                      <span className="font-semibold text-green-600">R{res.estimated_value.toLocaleString()}</span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white">
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="text-3xl font-bold mb-1">{formatCurrency(stats.monthly_revenue)}</h3>
          <p className="text-sm opacity-90">This Month's Revenue</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="text-3xl font-bold mb-1">{stats.total_reviews.toLocaleString()}</h3>
          <p className="text-sm opacity-90">Total Reviews · {stats.avg_rating.toFixed(1)} ⭐ Avg</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <FileCheck className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="text-3xl font-bold mb-1">{stats.sentiment_score.toFixed(0)}%</h3>
          <p className="text-sm opacity-90">Sentiment Score · {stats.positive_reviews} Positive</p>
        </div>
      </div>

      {/* Analytics Metrics - Revenue Stream Opportunity */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">📊 Analytics & Insights Platform</h3>
            <p className="text-white/90 text-sm">Premium data-driven insights for establishments to boost sales</p>
          </div>
          <div className="px-4 py-2 bg-white/20 rounded-lg">
            <p className="text-xs opacity-80">Revenue Opportunity</p>
            <p className="text-lg font-bold">R149/month</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-xs mb-1">Click-Through Rate</p>
            <p className="text-2xl font-bold">{stats.ctr.toFixed(1)}%</p>
            <p className="text-xs text-white/60 mt-1">{stats.total_clicks.toLocaleString()} clicks</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-xs mb-1">Engagement Rate</p>
            <p className="text-2xl font-bold">{stats.engagement_rate.toFixed(1)}%</p>
            <p className="text-xs text-white/60 mt-1">{stats.total_views.toLocaleString()} views</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-xs mb-1">Call Actions</p>
            <p className="text-2xl font-bold">{stats.call_clicks.toLocaleString()}</p>
            <p className="text-xs text-white/60 mt-1">Direct calls</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white/70 text-xs mb-1">Menu Views</p>
            <p className="text-2xl font-bold">{stats.menu_views.toLocaleString()}</p>
            <p className="text-xs text-white/60 mt-1">Total menu opens</p>
          </div>
        </div>
      </div>

      {/* Content Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Content Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {stats.active_specials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Active Specials</p>
                  <p className="text-xs text-gray-500">Running promotions</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {stats.active_events}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Active Events</p>
                  <p className="text-xs text-gray-500">Upcoming events</p>
                </div>
              </div>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {stats.direction_clicks.toLocaleString()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Direction Clicks</p>
                  <p className="text-xs text-gray-500">Navigation requests</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Sentiment Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Positive Reviews</span>
                <span className="text-sm font-bold text-green-600">
                  {stats.positive_reviews} ({((stats.positive_reviews / (stats.total_reviews || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                  style={{ width: `${(stats.positive_reviews / (stats.total_reviews || 1)) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Neutral Reviews</span>
                <span className="text-sm font-bold text-yellow-600">
                  {stats.neutral_reviews} ({((stats.neutral_reviews / (stats.total_reviews || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2 rounded-full"
                  style={{ width: `${(stats.neutral_reviews / (stats.total_reviews || 1)) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Negative Reviews</span>
                <span className="text-sm font-bold text-red-600">
                  {stats.negative_reviews} ({((stats.negative_reviews / (stats.total_reviews || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-pink-600 h-2 rounded-full"
                  style={{ width: `${(stats.negative_reviews / (stats.total_reviews || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-xs text-blue-800 font-medium mb-1">Overall Sentiment Health</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {stats.sentiment_score.toFixed(0)}% Positive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Businesses Section
  const renderBusinesses = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses by name, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="premium">Premium</option>
            <option value="standard">Standard</option>
            <option value="free">Free</option>
          </select>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading businesses...
                  </td>
                </tr>
              ) : filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No businesses found
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{business.name}</p>
                        <p className="text-sm text-gray-500">{business.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{business.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{business.city}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        business.subscription_plan === 'premium' 
                          ? 'bg-blue-100 text-blue-800'
                          : business.subscription_plan === 'standard'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {business.subscription_plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      {formatCurrency(business.total_revenue)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-sm font-medium ${
                        business.is_active ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {business.is_active ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {business.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBusiness(business)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleToggleBusinessStatus(business.id, business.is_active)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={business.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {business.is_active ? (
                            <Ban className="w-4 h-4 text-red-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Payments Section
  const renderPayments = () => (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {payments.length}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.slice(0, 20).map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{payment.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.business_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.customer_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(payment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Reconciliation Section
  const renderReconciliation = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <FileCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Financial Reconciliation</h3>
        <p className="text-gray-600 mb-6">
          Match and reconcile platform transactions with bank statements
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
          Start Reconciliation Process
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Unreconciled Transactions</h3>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-cyan-600 mb-2">0</p>
            <p className="text-sm text-gray-600">All transactions reconciled</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Next Payout Date</h3>
          <div className="text-center py-8">
            <p className="text-2xl font-bold text-blue-600 mb-2">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-600">Weekly payout schedule</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Section
  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6">Platform Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Monthly Subscription Fee</h4>
              <p className="text-sm text-gray-600">Flat fee per establishment per month</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">R</span>
              <input 
                type="number" 
                value={platformSettings.monthly_subscription_fee}
                onChange={(e) => setPlatformSettings({...platformSettings, monthly_subscription_fee: Number(e.target.value)})}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-right"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Auto-approve Businesses</h4>
              <p className="text-sm text-gray-600">Automatically approve new business registrations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={platformSettings.auto_approve_businesses}
                onChange={(e) => setPlatformSettings({...platformSettings, auto_approve_businesses: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Reminder Days Before Due</h4>
              <p className="text-sm text-gray-600">Number of days before subscription payment is due</p>
            </div>
            <input 
              type="number" 
              value={platformSettings.reminder_days_before_due}
              onChange={(e) => setPlatformSettings({...platformSettings, reminder_days_before_due: Number(e.target.value)})}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right"
            />
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Overdue Grace Period</h4>
              <p className="text-sm text-gray-600">Number of days after due date before subscription is considered overdue</p>
            </div>
            <input 
              type="number" 
              value={platformSettings.overdue_grace_period}
              onChange={(e) => setPlatformSettings({...platformSettings, overdue_grace_period: Number(e.target.value)})}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right"
            />
          </div>

          <button onClick={handleSaveSettings} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  // Business Details Modal
  const renderBusinessDetailsModal = () => {
    if (!selectedBusiness) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBusiness(null)}>
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedBusiness.name}</h2>
              <button onClick={() => setSelectedBusiness(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium">{selectedBusiness.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="font-medium">{selectedBusiness.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="font-medium">{selectedBusiness.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">City</p>
                <p className="font-medium">{selectedBusiness.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Subscription</p>
                <p className="font-medium capitalize">{selectedBusiness.subscription_plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className={`font-medium ${selectedBusiness.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedBusiness.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="font-medium text-green-600">{formatCurrency(selectedBusiness.total_revenue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="font-medium">{selectedBusiness.total_orders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Rating</p>
                <p className="font-medium">⭐ {selectedBusiness.rating ? selectedBusiness.rating.toFixed(1) : '0.0'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Joined</p>
                <p className="font-medium">{formatDate(selectedBusiness.created_at)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleViewFullProfile(selectedBusiness)}
                className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                View Full Profile
              </button>
              <button 
                onClick={() => handleToggleBusinessStatus(selectedBusiness.id, selectedBusiness.is_active)}
                className="flex-1 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                {selectedBusiness.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Affiliates Section
  const renderAffiliates = () => {
    const pendingAffiliates = affiliates.filter(a => a.status === 'pending');
    const approvedAffiliates = affiliates.filter(a => a.status === 'approved');
    const pendingCommissions = commissions.filter(c => c.status === 'pending');
    const paidCommissions = commissions.filter(c => c.status === 'paid');

    const totalPendingCommissions = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
    const totalPaidCommissions = paidCommissions.reduce((sum, c) => sum + c.amount, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Affiliate Program Management</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total Affiliates</span>
            </div>
            <p className="text-3xl font-bold">{affiliates.length}</p>
            <p className="text-xs text-gray-500 mt-1">{pendingAffiliates.length} pending approval</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Active Affiliates</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{approvedAffiliates.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-cyan-600" />
              <span className="text-sm text-gray-600">Pending Commissions</span>
            </div>
            <p className="text-3xl font-bold text-cyan-600">R{totalPendingCommissions.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{pendingCommissions.length} payments due</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total Paid Out</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">R{totalPaidCommissions.toFixed(2)}</p>
          </div>
        </div>

        {/* Pending Approvals */}
        {pendingAffiliates.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-bold text-yellow-900">Pending Approvals ({pendingAffiliates.length})</h3>
            </div>
            <div className="space-y-3">
              {pendingAffiliates.map(affiliate => (
                <div key={affiliate.id} className="bg-white p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{affiliate.name}</p>
                      <p className="text-sm text-gray-600">{affiliate.email}</p>
                      {affiliate.company && (
                        <p className="text-xs text-gray-500">Company: {affiliate.company}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Applied: {new Date(affiliate.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveAffiliate(affiliate.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </div>
                  {affiliate.experience && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 font-medium mb-1">Why they want to join:</p>
                      <p className="text-sm text-gray-700">{affiliate.experience}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Affiliates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold">Active Affiliates</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {approvedAffiliates.map(affiliate => (
                  <tr key={affiliate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{affiliate.name}</p>
                        <p className="text-sm text-gray-500">{affiliate.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">
                        {affiliate.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{affiliate.total_referrals || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">
                        R{(affiliate.total_commission_earned || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-cyan-600">
                        R{(affiliate.pending_commission || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600">
                        R{(affiliate.paid_commission || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {affiliate.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {approvedAffiliates.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No active affiliates yet
              </div>
            )}
          </div>
        </div>

        {/* Pending Commissions */}
        {pendingCommissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold">Pending Commission Payments</h3>
              <span className="text-sm text-gray-600">
                Total: R{totalPendingCommissions.toFixed(2)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingCommissions.map(commission => (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{commission.affiliate_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{commission.business_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">
                          R{commission.amount.toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-500">{commission.commission_percentage}% commission</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleMarkCommissionPaid(commission.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all text-sm"
                        >
                          Mark Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button 
            onClick={() => onBack ? onBack() : window.location.href = '/'}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Customer App
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">MYVIBES Global Platform Admin</h1>
              <p className="text-white/90">Advanced ML Analytics & Data Brokerage Platform</p>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all text-sm">
                Landing
              </button>
              <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all text-sm">
                Customer
              </button>
              <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all text-sm">
                Business
              </button>
              <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all text-sm">
                ROI
              </button>
              <button className="px-4 py-2 bg-white rounded-lg text-blue-600 font-medium shadow-lg text-sm">
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setCurrentSection('overview')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  currentSection === 'overview'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Overview
              </button>
              
              <button
                onClick={() => setCurrentSection('businesses')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  currentSection === 'businesses'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-5 h-5" />
                Businesses
              </button>
              
              <button
                onClick={() => setCurrentSection('payments')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  currentSection === 'payments'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Payments
              </button>
              
              <button
                onClick={() => setCurrentSection('reconciliation')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  currentSection === 'reconciliation'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileCheck className="w-5 h-5" />
                Reconciliation
              </button>
              
              <button
                onClick={() => setCurrentSection('settings')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  currentSection === 'settings'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
              
              <button
                onClick={() => setCurrentSection('ml-insights')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  currentSection === 'ml-insights'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Brain className="w-5 h-5" />
                ML Insights
              </button>
              
              <button
                onClick={() => setCurrentSection('advanced-insights')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  currentSection === 'advanced-insights'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Advanced Insights
              </button>
              
              <button
                onClick={() => setCurrentSection('affiliates')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  currentSection === 'affiliates'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Affiliates
              </button>

              <button
                onClick={() => setCurrentSection('ads')}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  currentSection === 'ads'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Video className="w-5 h-5" />
                Social Media Ads
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {currentSection === 'overview' && renderOverview()}
            {currentSection === 'businesses' && renderBusinesses()}
            {currentSection === 'payments' && renderPayments()}
            {currentSection === 'reconciliation' && renderReconciliation()}
            {currentSection === 'settings' && renderSettings()}
            {currentSection === 'ml-insights' && <MLInsightsDashboard stats={stats} businesses={businesses} />}
            {currentSection === 'ads' && <AdminAdsManagement />}
            {currentSection === 'advanced-insights' && (
              <AdvancedInsights 
                businesses={businesses}
                platformAnalytics={platformAnalytics}
                allReservations={allReservations}
              />
            )}
            {currentSection === 'affiliates' && renderAffiliates()}
          </main>
        </div>
      </div>

      {/* Business Details Modal */}
      {renderBusinessDetailsModal()}
    </div>
  );
};

export default AdminDashboard;