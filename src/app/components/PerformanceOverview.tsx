import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, Calendar, DollarSign } from 'lucide-react';
import { Card } from './ui/card';
import * as api from '@/utils/api';

interface AnalyticsData {
  date: string;
  revenue: number;
  bookings: number;
  views: number;
}

interface PopularTime {
  hour: string;
  bookings: number;
}

interface CuisineStats {
  name: string;
  orders: number;
  percentage: number;
}

interface Demographics {
  ageGroup: string;
  count: number;
  percentage: number;
}

interface RatingTrend {
  month: string;
  rating: number;
}

const COLORS = ['#FF6B35', '#F7931E', '#FDC830', '#9B59B6', '#3498DB', '#2ECC71'];

export function PerformanceOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [popularTimes, setPopularTimes] = useState<PopularTime[]>([]);
  const [cuisineStats, setCuisineStats] = useState<CuisineStats[]>([]);
  const [demographics, setDemographics] = useState<Demographics[]>([]);
  const [ratingTrends, setRatingTrends] = useState<RatingTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [analyticsData, popularTimesData, cuisineData, demographicsData, ratingsData] = await Promise.all([
          api.getAnalytics(),
          api.getPopularTimes(),
          api.getCuisineStats(),
          api.getDemographics(),
          api.getRatingTrends()
        ]);

        setAnalytics(analyticsData);
        setPopularTimes(popularTimesData);
        setCuisineStats(cuisineData);
        setDemographics(demographicsData);
        setRatingTrends(ratingsData);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalRevenue = analytics.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = analytics.reduce((sum, item) => sum + item.bookings, 0);
  const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
  const avgRating = ratingTrends[ratingTrends.length - 1]?.rating || 0;

  // Calculate trends
  const revenueChange = analytics.length >= 2
    ? ((analytics[analytics.length - 1].revenue - analytics[0].revenue) / analytics[0].revenue) * 100
    : 0;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Performance Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold">R{totalRevenue.toLocaleString()}</h3>
              <p className={`text-xs flex items-center gap-1 mt-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(revenueChange).toFixed(1)}% vs last period
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
              <h3 className="text-2xl font-bold">{totalBookings}</h3>
              <p className="text-xs text-gray-500 mt-1">Last 13 days</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Views</p>
              <h3 className="text-2xl font-bold">{totalViews.toLocaleString()}</h3>
              <p className="text-xs text-gray-500 mt-1">Platform visibility</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
              <h3 className="text-2xl font-bold">{avgRating.toFixed(1)}</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Improving
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue & Bookings Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue & Bookings Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9B59B6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9B59B6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="#888"
            />
            <YAxis yAxisId="left" stroke="#FF6B35" />
            <YAxis yAxisId="right" orientation="right" stroke="#9B59B6" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#FF6B35" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="Revenue (R)"
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="bookings" 
              stroke="#9B59B6" 
              fillOpacity={1} 
              fill="url(#colorBookings)"
              name="Bookings"
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Times */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Popular Booking Times</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularTimes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Bar dataKey="bookings" fill="#3498DB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </Card>

        {/* Rating Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rating Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis domain={[0, 5]} stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Line 
                type="monotone" 
                dataKey="rating" 
                stroke="#2ECC71" 
                strokeWidth={3}
                dot={{ fill: '#2ECC71', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </Card>

        {/* Cuisine Popularity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cuisine Popularity</h3>
          <div className="flex items-center justify-center h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cuisineStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="orders"
                >
                  {cuisineStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Customer Demographics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Demographics</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#888" />
              <YAxis dataKey="ageGroup" type="category" stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#9B59B6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
