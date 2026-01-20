import React, { useState } from 'react';
import { Brain, MapPin, Sparkles, BarChart3, Target, Zap, ChevronRight, ChevronDown, TrendingDown, TrendingUp, Star, Users, DollarSign, Calendar, Clock, TrendingUp as Growth, AlertTriangle, Award, ChefHat, Utensils, Tag, Shield, CheckCircle } from 'lucide-react';

interface MLInsightsDashboardProps {
  stats: any;
  businesses: any[];
}

// Mock data for ML/AI insights
const provinces = [
  { id: 'gauteng', name: 'Gauteng', businesses: 45, revenue: 127500, growth: 12.5 },
  { id: 'western-cape', name: 'Western Cape', businesses: 38, revenue: 98000, growth: 8.3 },
  { id: 'kwazulu-natal', name: 'KwaZulu-Natal', businesses: 22, revenue: 56000, growth: -2.1 }
];

const cities = {
  gauteng: [
    { id: 'johannesburg', name: 'Johannesburg', businesses: 25, revenue: 75000, growth: 15.2 },
    { id: 'pretoria', name: 'Pretoria', businesses: 12, revenue: 35000, growth: 10.1 },
    { id: 'sandton', name: 'Sandton', businesses: 8, revenue: 17500, growth: 8.9 }
  ],
  'western-cape': [
    { id: 'cape-town', name: 'Cape Town', businesses: 28, revenue: 78000, growth: 9.5 },
    { id: 'stellenbosch', name: 'Stellenbosch', businesses: 7, revenue: 15000, growth: 5.2 },
    { id: 'paarl', name: 'Paarl', businesses: 3, revenue: 5000, growth: 3.1 }
  ],
  'kwazulu-natal': [
    { id: 'durban', name: 'Durban', businesses: 18, revenue: 45000, growth: -1.5 },
    { id: 'pietermaritzburg', name: 'Pietermaritzburg', businesses: 4, revenue: 11000, growth: -4.2 }
  ]
};

const suburbs = {
  johannesburg: [
    { id: 'sandton-cbd', name: 'Sandton CBD', businesses: 8, revenue: 24000, ctr: 14.2, engagement: 22.5, avgRating: 4.5, topSpecials: ['2-for-1 Burgers', 'Happy Hour'] },
    { id: 'rosebank', name: 'Rosebank', businesses: 6, revenue: 18500, ctr: 12.8, engagement: 19.3, avgRating: 4.3, topSpecials: ['Lunch Specials', 'Wine Tasting'] },
    { id: 'melville', name: 'Melville', businesses: 5, revenue: 15000, ctr: 13.5, engagement: 21.0, avgRating: 4.6, topSpecials: ['Craft Beer Night', 'Live Music'] },
    { id: 'braamfontein', name: 'Braamfontein', businesses: 4, revenue: 12000, ctr: 11.9, engagement: 18.2, avgRating: 4.2, topSpecials: ['Student Discounts', 'Breakfast Deals'] },
    { id: 'fourways', name: 'Fourways', businesses: 2, revenue: 5500, ctr: 10.5, engagement: 16.5, avgRating: 4.0, topSpecials: ['Family Specials', 'Weekend Brunch'] }
  ],
  pretoria: [
    { id: 'hatfield', name: 'Hatfield', businesses: 5, revenue: 14000, ctr: 13.1, engagement: 20.2, avgRating: 4.4, topSpecials: ['Student Deals', '2-for-1 Pizza'] },
    { id: 'brooklyn', name: 'Brooklyn', businesses: 4, revenue: 11000, ctr: 12.5, engagement: 19.0, avgRating: 4.3, topSpecials: ['Coffee Combo', 'Lunch Specials'] },
    { id: 'menlyn', name: 'Menlyn', businesses: 3, revenue: 10000, ctr: 11.8, engagement: 17.8, avgRating: 4.1, topSpecials: ['Weekend Deals', 'Happy Hour'] }
  ],
  'cape-town': [
    { id: 'waterfront', name: 'V&A Waterfront', businesses: 10, revenue: 30000, ctr: 15.5, engagement: 24.2, avgRating: 4.7, topSpecials: ['Seafood Platter', 'Sunset Cocktails'] },
    { id: 'camps-bay', name: 'Camps Bay', businesses: 8, revenue: 24000, ctr: 14.8, engagement: 23.0, avgRating: 4.6, topSpecials: ['Beach Brunch', 'Sundowner Specials'] },
    { id: 'stellenbosch-cbd', name: 'Stellenbosch', businesses: 6, revenue: 16000, ctr: 13.2, engagement: 21.5, avgRating: 4.5, topSpecials: ['Wine Pairing', 'Local Cuisine'] },
    { id: 'newlands', name: 'Newlands', businesses: 4, revenue: 8000, ctr: 11.5, engagement: 18.5, avgRating: 4.2, topSpecials: ['Craft Beer', 'Sports Specials'] }
  ],
  durban: [
    { id: 'umhlanga', name: 'Umhlanga', businesses: 7, revenue: 20000, ctr: 13.8, engagement: 21.2, avgRating: 4.4, topSpecials: ['Seafood Special', 'Beach Dining'] },
    { id: 'durban-cbd', name: 'Durban CBD', businesses: 6, revenue: 15000, ctr: 12.2, engagement: 19.0, avgRating: 4.1, topSpecials: ['Bunny Chow Deals', 'Curry Special'] },
    { id: 'morningside', name: 'Morningside', businesses: 5, revenue: 10000, ctr: 11.0, engagement: 17.5, avgRating: 4.0, topSpecials: ['Brunch', 'Coffee Deals'] }
  ]
};

// AI Recommended Specials by Area
const aiRecommendations = {
  'sandton-cbd': [
    { special: 'Executive Lunch Special', confidence: 94, predictedLift: 35, reason: 'High office worker density, peak lunch traffic' },
    { special: 'After-Work Cocktails', confidence: 89, predictedLift: 28, reason: 'Strong evening footfall, corporate clientele' },
    { special: 'Business Breakfast', confidence: 85, predictedLift: 22, reason: 'Morning meetings common in area' }
  ],
  rosebank: [
    { special: 'Weekend Brunch Specials', confidence: 92, predictedLift: 40, reason: 'High weekend traffic, lifestyle-oriented customers' },
    { special: 'Artisan Coffee & Pastry', confidence: 88, predictedLift: 30, reason: 'Trendy area with coffee culture' },
    { special: 'Happy Hour Wine', confidence: 82, predictedLift: 25, reason: 'Upmarket demographic, wine appreciation' }
  ],
  melville: [
    { special: 'Live Music Nights', confidence: 93, predictedLift: 45, reason: 'Bohemian area, strong arts scene' },
    { special: 'Craft Beer Tasting', confidence: 90, predictedLift: 38, reason: 'Young professional demographic' },
    { special: 'Vegan/Vegetarian Options', confidence: 86, predictedLift: 32, reason: 'Health-conscious, progressive community' }
  ],
  waterfront: [
    { special: 'Seafood Platter for 2', confidence: 95, predictedLift: 50, reason: 'Tourist hotspot, seafood demand' },
    { special: 'Sunset Cocktail Hour', confidence: 91, predictedLift: 42, reason: 'Scenic views, tourism traffic' },
    { special: 'Family Meal Deals', confidence: 87, predictedLift: 35, reason: 'High family visitor numbers' }
  ],
  'camps-bay': [
    { special: 'Champagne Brunch', confidence: 94, predictedLift: 48, reason: 'Upmarket beach location, luxury market' },
    { special: 'Sunset Tapas', confidence: 90, predictedLift: 40, reason: 'Perfect sunset spot, social dining' },
    { special: 'Premium Seafood', confidence: 88, predictedLift: 36, reason: 'Coastal location, affluent customers' }
  ],
  umhlanga: [
    { special: 'Ocean View Dining', confidence: 92, predictedLift: 44, reason: 'Beachfront location, tourist appeal' },
    { special: 'Sundowner Specials', confidence: 89, predictedLift: 38, reason: 'Beach culture, evening traffic' },
    { special: 'Fresh Seafood Platters', confidence: 85, predictedLift: 30, reason: 'Coastal cuisine demand' }
  ]
};

const MLInsightsDashboard: React.FC<MLInsightsDashboardProps> = ({ stats, businesses }) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [insightTimeframe, setInsightTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [appliedPrices, setAppliedPrices] = useState<Set<string>>(new Set());
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentCities = selectedProvince ? cities[selectedProvince as keyof typeof cities] || [] : [];
  const currentSuburbs = selectedCity ? suburbs[selectedCity as keyof typeof suburbs] || [] : [];
  const currentRecommendations = selectedSuburb ? aiRecommendations[selectedSuburb as keyof typeof aiRecommendations] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">ML/AI Insights Dashboard</h2>
              <p className="text-white/90 text-sm">Advanced analytics & AI-powered recommendations for establishments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/20 rounded-lg text-center">
              <p className="text-xs opacity-80">Included in Subscription</p>
              <p className="text-lg font-bold">R499/month</p>
            </div>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setInsightTimeframe(timeframe as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                insightTimeframe === timeframe
                  ? 'bg-white text-purple-600 font-medium'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {timeframe === '7d' && 'Last 7 Days'}
              {timeframe === '30d' && 'Last 30 Days'}
              {timeframe === '90d' && 'Last 90 Days'}
              {timeframe === '1y' && 'Last Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Geographic Drill-Down Breadcrumb */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <button 
            onClick={() => {
              setSelectedProvince('');
              setSelectedCity('');
              setSelectedSuburb('');
            }}
            className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
          >
            🇿🇦 South Africa
          </button>
          {selectedProvince && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button 
                onClick={() => {
                  setSelectedCity('');
                  setSelectedSuburb('');
                }}
                className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                {provinces.find(p => p.id === selectedProvince)?.name}
              </button>
            </>
          )}
          {selectedCity && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button 
                onClick={() => setSelectedSuburb('')}
                className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                {currentCities.find(c => c.id === selectedCity)?.name}
              </button>
            </>
          )}
          {selectedSuburb && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 font-medium text-purple-700">
                {currentSuburbs.find(s => s.id === selectedSuburb)?.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* No Location Selected - Show Provinces */}
      {!selectedProvince && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-purple-600" />
              Provincial Performance
            </h3>
            <p className="text-sm text-gray-600">Click to drill down</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {provinces.map((province) => (
              <button
                key={province.id}
                onClick={() => setSelectedProvince(province.id)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {province.name}
                  </h4>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Businesses</p>
                    <p className="text-2xl font-bold text-purple-600">{province.businesses}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Revenue</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(province.revenue)}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  {province.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${province.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {province.growth >= 0 ? '+' : ''}{province.growth}% MoM Growth
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Province Selected - Show Cities */}
      {selectedProvince && !selectedCity && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-purple-600" />
              Cities in {provinces.find(p => p.id === selectedProvince)?.name}
            </h3>
            <p className="text-sm text-gray-600">Click to drill down to suburbs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {city.name}
                  </h4>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Businesses</p>
                    <p className="text-2xl font-bold text-purple-600">{city.businesses}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Revenue</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(city.revenue)}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  {city.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${city.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {city.growth >= 0 ? '+' : ''}{city.growth}% MoM Growth
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* City Selected - Show Suburbs */}
      {selectedCity && !selectedSuburb && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-purple-600" />
              Suburbs in {currentCities.find(c => c.id === selectedCity)?.name}
            </h3>
            <p className="text-sm text-gray-600">Click for detailed AI insights</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {currentSuburbs.map((suburb) => (
              <button
                key={suburb.id}
                onClick={() => setSelectedSuburb(suburb.id)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {suburb.name}
                  </h4>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Businesses</p>
                    <p className="text-2xl font-bold text-purple-600">{suburb.businesses}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Revenue</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(suburb.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">CTR</p>
                    <p className="text-lg font-bold text-blue-600">{suburb.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Engagement</p>
                    <p className="text-lg font-bold text-orange-600">{suburb.engagement}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Avg Rating</p>
                    <p className="text-lg font-bold text-yellow-600 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      {suburb.avgRating}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-600">Top Performing:</span>
                  {suburb.topSpecials.map((special, idx) => (
                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {special}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suburb Selected - Show Detailed AI Insights */}
      {selectedSuburb && (
        <div className="space-y-6">
          {/* Establishment Context Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-white/80 mb-1">Currently Analyzing</p>
                <h2 className="text-2xl font-bold mb-2">The Grill House - Sandton</h2>
                <div className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    Restaurant
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    {currentSuburbs.find(s => s.id === selectedSuburb)?.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80 mb-1">Your Rating</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">{currentSuburbs.find(s => s.id === selectedSuburb)?.avgRating}</span>
                </div>
              </div>
            </div>
            
            {/* Cuisine and Price Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-xs text-white/70 mb-1">Cuisine Type</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                    Steakhouse
                  </span>
                  <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                    Grill
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-white/70 mb-1">Average Price Per Person</p>
                <p className="text-2xl font-bold">R285</p>
              </div>
            </div>
          </div>

          {/* Suburb Overview */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-7 h-7 text-purple-600" />
              {currentSuburbs.find(s => s.id === selectedSuburb)?.name} - Detailed Insights
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'CTR', value: `${currentSuburbs.find(s => s.id === selectedSuburb)?.ctr}%`, icon: BarChart3, color: 'blue' },
                { label: 'Engagement', value: `${currentSuburbs.find(s => s.id === selectedSuburb)?.engagement}%`, icon: Users, color: 'orange' },
                { label: 'Avg Rating', value: currentSuburbs.find(s => s.id === selectedSuburb)?.avgRating, icon: Star, color: 'yellow' },
                { label: 'Revenue', value: formatCurrency(currentSuburbs.find(s => s.id === selectedSuburb)?.revenue || 0), icon: DollarSign, color: 'green' }
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className={`p-2 bg-${metric.color}-100 rounded-lg w-fit mb-2`}>
                      <Icon className={`w-5 h-5 text-${metric.color}-600`} />
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI-Powered Recommendations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI-Powered Special Recommendations
              </h3>
              <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-xs font-medium">
                ML Algorithm v2.1
              </div>
            </div>

            <div className="space-y-4">
              {currentRecommendations.map((rec, idx) => {
                const isImplemented = appliedRecommendations.has(rec.special);
                return (
                  <div 
                    key={idx} 
                    className={`rounded-lg p-5 transition-all ${
                      isImplemented
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400'
                        : 'border border-gray-200 hover:border-purple-400 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{rec.special}</h4>
                        <p className="text-sm text-gray-600">{rec.reason}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="px-3 py-1 bg-green-100 rounded-full">
                          <span className="text-green-700 text-sm font-bold">{rec.confidence}% Confidence</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <span className="text-orange-600 text-sm font-medium">+{rec.predictedLift}% Predicted Lift</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance Prediction Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Expected Performance</span>
                        <span className="font-medium">High Impact</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    {isImplemented ? (
                      <div className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Special Implemented Successfully
                      </div>
                    ) : (
                      <button 
                        className="mt-4 w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                        onClick={() => {
                          setAppliedRecommendations(new Set([...appliedRecommendations, rec.special]));
                          setSuccessMessage(`🎉 "${rec.special}" has been added to your specials! Expected revenue lift: +${rec.predictedLift}%. This special will now be visible to customers in your area.`);
                          setShowSuccessModal(true);
                          setTimeout(() => setShowSuccessModal(false), 4000);
                        }}
                      >
                        Implement This Special →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Time to Post */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Optimal Posting Times
              </h4>
              <div className="space-y-3">
                {[
                  { day: 'Monday - Thursday', time: '11:00 AM - 12:30 PM', reason: 'Lunch planning peak' },
                  { day: 'Thursday - Friday', time: '4:00 PM - 6:00 PM', reason: 'Weekend planning starts' },
                  { day: 'Weekend', time: '9:00 AM - 11:00 AM', reason: 'Brunch/lunch searches' }
                ].map((slot, idx) => (
                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-semibold text-gray-900">{slot.day}</p>
                    <p className="text-purple-600 font-medium text-sm">{slot.time}</p>
                    <p className="text-xs text-gray-600 mt-1">{slot.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Customer Demographics
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Age 25-34</span>
                    <span className="text-sm font-bold text-purple-600">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Age 35-44</span>
                    <span className="text-sm font-bold text-purple-600">31%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{ width: '31%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Age 45+</span>
                    <span className="text-sm font-bold text-purple-600">27%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{ width: '27%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-800 font-medium mb-1">Primary Audience</p>
                <p className="text-lg font-bold text-purple-700">Young Professionals & Families</p>
              </div>
            </div>
          </div>

          {/* Competitor Analysis & Benchmarking */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Competitive Analysis in {currentSuburbs.find(s => s.id === selectedSuburb)?.name}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 mb-1">Your Performance</p>
                <p className="text-2xl font-bold text-blue-600">Top 25%</p>
                <p className="text-xs text-gray-600 mt-1">Better than 75% of competitors</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-800 mb-1">Market Share</p>
                <p className="text-2xl font-bold text-orange-600">18.5%</p>
                <p className="text-xs text-gray-600 mt-1">+2.3% vs last month</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-800 mb-1">Growth Rank</p>
                <p className="text-2xl font-bold text-green-600">#3</p>
                <p className="text-xs text-gray-600 mt-1">Fastest growing in area</p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-semibold text-gray-900 text-sm">Top Competitors in Area</h5>
              {[
                { name: 'The Bistro', rating: 4.6, avgPrice: 185, footfall: 'High', trend: 'up', strength: 'Premium pricing' },
                { name: 'Corner Cafe', rating: 4.4, avgPrice: 145, footfall: 'Medium', trend: 'stable', strength: 'Fast service' },
                { name: 'Urban Eats', rating: 4.3, avgPrice: 165, footfall: 'High', trend: 'up', strength: 'Diverse menu' }
              ].map((comp, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{comp.name}</p>
                        <p className="text-xs text-gray-600">Key Strength: {comp.strength}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {comp.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {comp.trend === 'stable' && <span className="w-4 h-0.5 bg-gray-400"></span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Rating</p>
                      <p className="text-sm font-bold text-yellow-600">{comp.rating} ⭐</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Avg Price</p>
                      <p className="text-sm font-bold text-green-600">R{comp.avgPrice}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Footfall</p>
                      <p className="text-sm font-bold text-purple-600">{comp.footfall}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Optimization AI */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              AI Price Optimization Recommendations
            </h4>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-gray-900">Revenue Opportunity Identified</p>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Our ML model predicts a <span className="font-bold text-green-700">R4,200 monthly revenue increase</span> with strategic price adjustments
              </p>
            </div>

            <div className="space-y-3">
              {[
                { 
                  item: 'Signature Burger', 
                  currentPrice: 125, 
                  suggestedPrice: 135, 
                  impact: '+8.2%', 
                  reason: 'High demand, low price sensitivity',
                  confidence: 91
                },
                { 
                  item: 'Coffee & Pastry Combo', 
                  currentPrice: 65, 
                  suggestedPrice: 59, 
                  impact: '+12.5%', 
                  reason: 'Volume play, increase frequency',
                  confidence: 88
                },
                { 
                  item: 'Weekend Brunch Special', 
                  currentPrice: 185, 
                  suggestedPrice: 199, 
                  impact: '+6.8%', 
                  reason: 'Premium positioning opportunity',
                  confidence: 85
                }
              ].map((item, idx) => {
                const isApplied = appliedPrices.has(item.item);
                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg transition-all ${
                      isApplied 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400' 
                        : 'bg-white border border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-1">{item.item}</h5>
                        <p className="text-xs text-gray-600">{item.reason}</p>
                      </div>
                      <div className="px-2 py-1 bg-green-100 rounded-full">
                        <span className="text-green-700 text-xs font-bold">{item.confidence}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Current</p>
                        <p className={`text-lg font-bold ${isApplied ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          R{item.currentPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Suggested</p>
                        <p className={`text-lg font-bold ${isApplied ? 'text-green-600' : 'text-purple-600'}`}>
                          R{item.suggestedPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Revenue Impact</p>
                        <p className="text-lg font-bold text-green-600">{item.impact}</p>
                      </div>
                    </div>

                    {isApplied ? (
                      <div className="mt-3 w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Price Change Applied
                      </div>
                    ) : (
                      <button 
                        className="mt-3 w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                        onClick={() => {
                          setAppliedPrices(new Set([...appliedPrices, item.item]));
                          setSuccessMessage(`✅ Price for "${item.item}" has been updated from R${item.currentPrice} to R${item.suggestedPrice}. Expected revenue lift: ${item.impact}`);
                          setShowSuccessModal(true);
                          setTimeout(() => setShowSuccessModal(false), 3000);
                        }}
                      >
                        Apply Price Change
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Menu Optimization */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-purple-600" />
              AI Menu Optimization Insights
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best Performers */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  Star Performers
                </h5>
                <div className="space-y-2">
                  {[
                    { item: 'Craft Beer Burger', sales: 245, margin: '68%', trend: 'up' },
                    { item: 'Artisan Pizza', sales: 198, margin: '72%', trend: 'up' },
                    { item: 'Signature Salad', sales: 156, margin: '65%', trend: 'stable' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm">{item.item}</p>
                        {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{item.sales} sales/month</span>
                        <span className="text-green-700 font-bold">{item.margin} margin</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Underperformers */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Action Required
                </h5>
                <div className="space-y-2">
                  {[
                    { item: 'Pasta Carbonara', sales: 32, action: 'Remove or revamp', reason: 'Low volume' },
                    { item: 'Greek Salad', sales: 28, action: 'Reduce price by 15%', reason: 'Price sensitivity' },
                    { item: 'Fish Tacos', sales: 41, action: 'Promote more', reason: 'Hidden gem' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm">{item.item}</p>
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{item.sales} sales/month</p>
                      <p className="text-xs font-semibold text-orange-700">💡 {item.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-purple-200">
              <h5 className="font-semibold text-gray-900 mb-2">🎯 Menu Gap Analysis</h5>
              <p className="text-sm text-gray-700 mb-3">
                Based on competitor analysis and customer search behavior, consider adding:
              </p>
              <div className="flex flex-wrap gap-2">
                {['Vegan Bowl Options', 'Kids Menu', 'Keto-Friendly Dishes', 'Local Craft Beverages'].map((gap, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-purple-300 rounded-full text-xs font-medium text-purple-700">
                    + {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Demand Forecasting */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Growth className="w-5 h-5 text-purple-600" />
              AI Demand Forecasting - Next 30 Days
            </h4>

            <div className="space-y-4">
              {/* Peak Days Prediction */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Predicted Peak Days
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {[
                    { date: 'Jan 25 (Sat)', traffic: '+65%', reason: 'Weekend + Payday' },
                    { date: 'Jan 31 (Fri)', traffic: '+48%', reason: 'Month-end Friday' },
                    { date: 'Feb 14 (Sat)', traffic: '+85%', reason: 'Valentine\'s Day' },
                    { date: 'Feb 28 (Sat)', traffic: '+52%', reason: 'Month-end weekend' }
                  ].map((peak, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-blue-300">
                      <p className="text-xs font-semibold text-blue-900">{peak.date}</p>
                      <p className="text-lg font-bold text-blue-600 my-1">{peak.traffic}</p>
                      <p className="text-xs text-gray-600">{peak.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slow Days Warning */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Low Traffic Days - Action Needed
                </h5>
                <div className="space-y-2 mt-3">
                  {[
                    { date: 'Jan 20-24 (Mon-Fri)', traffic: '-25%', suggestion: 'Launch weekday lunch special' },
                    { date: 'Feb 3-7 (Mon-Fri)', traffic: '-18%', suggestion: 'Run 2-for-1 promotion' }
                  ].map((slow, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-yellow-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900">{slow.date}</p>
                        <span className="text-sm font-bold text-orange-600">{slow.traffic}</span>
                      </div>
                      <p className="text-xs text-gray-700">💡 <span className="font-semibold">AI Suggestion:</span> {slow.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Planning */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-green-600" />
                  Smart Inventory Planning
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  {[
                    { item: 'Fresh Produce', quantity: '+30%', reason: 'Valentine\'s surge' },
                    { item: 'Premium Cuts', quantity: '+45%', reason: 'Feb 14 demand' },
                    { item: 'Desserts', quantity: '+60%', reason: 'Romance packages' }
                  ].map((inv, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-green-300">
                      <p className="text-sm font-semibold text-gray-900 mb-1">{inv.item}</p>
                      <p className="text-lg font-bold text-green-600">{inv.quantity}</p>
                      <p className="text-xs text-gray-600 mt-1">{inv.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-bold text-gray-900">Success!</h5>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-700">{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLInsightsDashboard;