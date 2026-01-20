import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar,
  Clock,
  Target,
  Award,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Eye,
  MousePointer
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Business {
  id: string;
  name: string;
  type: string;
  city: string;
  cuisine_types?: string[];
  is_active: boolean;
  subscription_status: string;
  created_at: string;
  total_clicks?: number;
  total_reservations?: number;
  estimated_revenue_generated?: number;
  total_views?: number;
}

interface AdvancedInsightsProps {
  businesses: Business[];
  platformAnalytics: any;
  allReservations: any[];
}

export const AdvancedInsights: React.FC<AdvancedInsightsProps> = ({
  businesses,
  platformAnalytics,
  allReservations
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'reservations' | 'engagement'>('revenue');
  const [resetting, setResetting] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const resetAnalytics = async () => {
    if (!confirm('Are you sure you want to reset all analytics data? This will set all views, clicks, and reservations to 0.')) {
      return;
    }

    setResetting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/reset-analytics`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Analytics reset successfully! ${data.businesses_reset} businesses updated.`);
        window.location.reload(); // Reload to show updated data
      } else {
        throw new Error('Failed to reset analytics');
      }
    } catch (error) {
      console.error('Reset failed:', error);
      alert('❌ Failed to reset analytics. Check console for details.');
    } finally {
      setResetting(false);
    }
  };

  const reseedAnalytics = async () => {
    if (!confirm('Are you sure you want to reseed the database? This will clear old events and reload with fresh 2026 data.')) {
      return;
    }

    setReseeding(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/reseed`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Database reseeded successfully! Fresh data loaded.`);
        window.location.reload(); // Reload to show updated data
      } else {
        throw new Error('Failed to reseed database');
      }
    } catch (error) {
      console.error('Reseed failed:', error);
      alert('❌ Failed to reseed database. Check console for details.');
    } finally {
      setReseeding(false);
    }
  };

  // Calculate establishment insights
  const activeEstablishments = businesses.filter(b => b.is_active);
  const inactiveEstablishments = businesses.filter(b => !b.is_active);
  
  // City-based analytics
  const cityAnalytics = businesses.reduce((acc: any, business) => {
    const city = business.city || 'Unknown';
    if (!acc[city]) {
      acc[city] = {
        count: 0,
        revenue: 0,
        reservations: 0,
        clicks: 0,
        activeCount: 0
      };
    }
    acc[city].count++;
    if (business.is_active) acc[city].activeCount++;
    acc[city].revenue += business.estimated_revenue_generated || 0;
    acc[city].reservations += business.total_reservations || 0;
    acc[city].clicks += business.total_clicks || 0;
    return acc;
  }, {});

  const topCities = Object.entries(cityAnalytics)
    .map(([city, data]: [string, any]) => ({ city, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Cuisine type analytics
  const cuisineAnalytics = businesses.reduce((acc: any, business) => {
    const cuisines = business.cuisine_types || ['Other'];
    cuisines.forEach(cuisine => {
      if (!acc[cuisine]) {
        acc[cuisine] = {
          count: 0,
          revenue: 0,
          reservations: 0,
          avgRevenuePerVenue: 0
        };
      }
      acc[cuisine].count++;
      acc[cuisine].revenue += business.estimated_revenue_generated || 0;
      acc[cuisine].reservations += business.total_reservations || 0;
    });
    return acc;
  }, {});

  Object.keys(cuisineAnalytics).forEach(cuisine => {
    cuisineAnalytics[cuisine].avgRevenuePerVenue = 
      cuisineAnalytics[cuisine].revenue / cuisineAnalytics[cuisine].count;
  });

  const topCuisines = Object.entries(cuisineAnalytics)
    .map(([cuisine, data]: [string, any]) => ({ cuisine, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Performance tiers
  const highPerformers = businesses.filter(b => 
    (b.estimated_revenue_generated || 0) > 50000
  ).length;
  
  const mediumPerformers = businesses.filter(b => 
    (b.estimated_revenue_generated || 0) >= 10000 && 
    (b.estimated_revenue_generated || 0) <= 50000
  ).length;
  
  const lowPerformers = businesses.filter(b => 
    (b.estimated_revenue_generated || 0) < 10000
  ).length;

  // At-risk establishments (low engagement)
  const atRiskEstablishments = businesses.filter(b => {
    const clicks = b.total_clicks || 0;
    const views = b.total_views || 0;
    const reservations = b.total_reservations || 0;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    
    return b.is_active && (clicks < 10 || ctr < 2 || reservations === 0);
  }).sort((a, b) => (a.total_clicks || 0) - (b.total_clicks || 0));

  // Rising stars (high growth potential)
  const risingStars = businesses.filter(b => {
    const clicks = b.total_clicks || 0;
    const views = b.total_views || 0;
    const reservations = b.total_reservations || 0;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;
    
    return b.is_active && ctr > 5 && reservations > 5;
  }).sort((a, b) => {
    const aCtr = (a.total_views || 0) > 0 ? ((a.total_clicks || 0) / (a.total_views || 0)) * 100 : 0;
    const bCtr = (b.total_views || 0) > 0 ? ((b.total_clicks || 0) / (b.total_views || 0)) * 100 : 0;
    return bCtr - aCtr;
  });

  // Average metrics
  const avgRevenuePerEstablishment = businesses.length > 0
    ? businesses.reduce((sum, b) => sum + (b.estimated_revenue_generated || 0), 0) / businesses.length
    : 0;

  const avgReservationsPerEstablishment = businesses.length > 0
    ? businesses.reduce((sum, b) => sum + (b.total_reservations || 0), 0) / businesses.length
    : 0;

  const avgClicksPerEstablishment = businesses.length > 0
    ? businesses.reduce((sum, b) => sum + (b.total_clicks || 0), 0) / businesses.length
    : 0;

  // Platform-wide CTR
  const totalViews = businesses.reduce((sum, b) => sum + (b.total_views || 0), 0);
  const totalClicks = businesses.reduce((sum, b) => sum + (b.total_clicks || 0), 0);
  const platformCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

  // Reservation conversion rate
  const totalReservations = businesses.reduce((sum, b) => sum + (b.total_reservations || 0), 0);
  const reservationConversionRate = totalClicks > 0 ? (totalReservations / totalClicks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Advanced Establishment Insights</h2>
          <p className="text-gray-600">Deep analytics and performance metrics across all establishments</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeRange === range
                  ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{platformCTR.toFixed(2)}%</h3>
          <p className="text-sm opacity-90">Platform CTR</p>
          <p className="text-xs opacity-75 mt-2">{totalClicks.toLocaleString()} clicks / {totalViews.toLocaleString()} views</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{reservationConversionRate.toFixed(1)}%</h3>
          <p className="text-sm opacity-90">Conversion Rate</p>
          <p className="text-xs opacity-75 mt-2">Clicks → Reservations</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold mb-1">R{avgRevenuePerEstablishment.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}</h3>
          <p className="text-sm opacity-90">Avg Revenue/Venue</p>
          <p className="text-xs opacity-75 mt-2">Platform value per establishment</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 opacity-80" />
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold mb-1">{avgReservationsPerEstablishment.toFixed(1)}</h3>
          <p className="text-sm opacity-90">Avg Bookings/Venue</p>
          <p className="text-xs opacity-75 mt-2">Customer engagement</p>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Establishment Performance Distribution
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                {highPerformers}
              </div>
              <div>
                <p className="text-sm text-gray-600">High Performers</p>
                <p className="text-xs text-gray-500">&gt; R50,000</p>
              </div>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(highPerformers / businesses.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">{((highPerformers / businesses.length) * 100).toFixed(1)}% of total</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                {mediumPerformers}
              </div>
              <div>
                <p className="text-sm text-gray-600">Medium Performers</p>
                <p className="text-xs text-gray-500">R10k - R50k</p>
              </div>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(mediumPerformers / businesses.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">{((mediumPerformers / businesses.length) * 100).toFixed(1)}% of total</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                {lowPerformers}
              </div>
              <div>
                <p className="text-sm text-gray-600">Developing</p>
                <p className="text-xs text-gray-500">&lt; R10,000</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-400 h-2 rounded-full" 
                style={{ width: `${(lowPerformers / businesses.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">{((lowPerformers / businesses.length) * 100).toFixed(1)}% of total</p>
          </div>
        </div>
      </div>

      {/* Geographic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            Top Performing Cities
          </h3>
          
          <div className="space-y-3">
            {topCities.map((city, index) => (
              <div key={city.city} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                    index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400' :
                    'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{city.city}</p>
                    <p className="text-xs text-gray-500">
                      {city.activeCount} active / {city.count} total venues
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">R{city.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{city.reservations} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cuisine Type Analytics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Top Performing Cuisine Types
          </h3>
          
          <div className="space-y-3">
            {topCuisines.map((cuisine, index) => (
              <div key={cuisine.cuisine} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{cuisine.cuisine}</p>
                  <p className="font-bold text-green-600">R{cuisine.revenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{cuisine.count} venues • {cuisine.reservations} bookings</span>
                  <span className="text-purple-600 font-semibold">
                    R{cuisine.avgRevenuePerVenue.toLocaleString()} avg/venue
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(cuisine.revenue / topCuisines[0].revenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rising Stars */}
      {risingStars.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Rising Stars - High Potential Establishments
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These establishments show exceptional engagement rates and growth potential
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {risingStars.slice(0, 6).map(business => {
              const ctr = (business.total_views || 0) > 0 
                ? ((business.total_clicks || 0) / (business.total_views || 0)) * 100 
                : 0;
              
              return (
                <div key={business.id} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{business.name}</p>
                      <p className="text-xs text-gray-500">{business.city}</p>
                    </div>
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">CTR</p>
                      <p className="font-bold text-green-600">{ctr.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bookings</p>
                      <p className="font-bold">{business.total_reservations || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Clicks</p>
                      <p className="font-bold">{business.total_clicks || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-bold text-green-600">R{(business.estimated_revenue_generated || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* At-Risk Establishments */}
      {atRiskEstablishments.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            At-Risk Establishments - Need Attention
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These active establishments have low engagement and may benefit from support or optimization
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Business</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Location</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">Views</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">Clicks</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">CTR</th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-600">Reservations</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-600">Issue</th>
                </tr>
              </thead>
              <tbody>
                {atRiskEstablishments.slice(0, 10).map(business => {
                  const views = business.total_views || 0;
                  const clicks = business.total_clicks || 0;
                  const reservations = business.total_reservations || 0;
                  const ctr = views > 0 ? (clicks / views) * 100 : 0;
                  
                  const issues = [];
                  if (clicks < 10) issues.push('Low clicks');
                  if (ctr < 2) issues.push('Low CTR');
                  if (reservations === 0) issues.push('No bookings');
                  
                  return (
                    <tr key={business.id} className="border-b border-red-100 hover:bg-white/50">
                      <td className="p-3 font-medium">{business.name}</td>
                      <td className="p-3 text-sm text-gray-600">{business.city}</td>
                      <td className="p-3 text-right">{views}</td>
                      <td className="p-3 text-right">{clicks}</td>
                      <td className="p-3 text-right">
                        <span className={`font-semibold ${ctr < 2 ? 'text-red-600' : ''}`}>
                          {ctr.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={reservations === 0 ? 'text-red-600 font-semibold' : ''}>
                          {reservations}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {issues.map(issue => (
                            <span key={issue} className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {issue}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engagement Benchmarks */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Engagement Benchmarks
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{avgClicksPerEstablishment.toFixed(1)}</p>
            <p className="text-sm text-gray-600 mt-1">Avg Clicks per Venue</p>
            <p className="text-xs text-gray-500 mt-2">Industry benchmark: 50+</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <MousePointer className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{platformCTR.toFixed(2)}%</p>
            <p className="text-sm text-gray-600 mt-1">Platform CTR</p>
            <p className="text-xs text-gray-500 mt-2">Industry benchmark: 3-5%</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{reservationConversionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
            <p className="text-xs text-gray-500 mt-2">Industry benchmark: 20-40%</p>
          </div>
        </div>
      </div>

      {/* Admin Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={resetAnalytics}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            resetting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
          }`}
          disabled={resetting}
        >
          {resetting ? 'Resetting...' : '🔄 Reset Analytics'}
        </button>
        <button
          onClick={reseedAnalytics}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            reseeding ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={reseeding}
        >
          {reseeding ? 'Reseeding...' : '🌱 Reseed Database'}
        </button>
      </div>
    </div>
  );
};