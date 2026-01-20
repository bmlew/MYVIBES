import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Eye,
  MousePointer,
  Bell,
  Star,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Target,
  Award
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
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

interface CustomerAnalyticsProps {
  allReservations: any[];
  businesses: any[];
}

export function CustomerAnalytics({ allReservations, businesses }: CustomerAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    calculateCustomerAnalytics();
  }, [allReservations, timeRange]);

  const calculateCustomerAnalytics = () => {
    const now = new Date();
    const cutoffDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 999999;
    const cutoffDate = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);

    // Filter reservations by time range
    const filteredReservations = allReservations.filter(r => 
      new Date(r.created_at) >= cutoffDate
    );

    // Calculate unique customers
    const uniqueCustomers = new Set(filteredReservations.map(r => r.user_email));
    const totalCustomers = uniqueCustomers.size;

    // Previous period for comparison
    const previousCutoffDate = new Date(cutoffDate.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
    const previousReservations = allReservations.filter(r => 
      new Date(r.created_at) >= previousCutoffDate && new Date(r.created_at) < cutoffDate
    );
    const previousCustomers = new Set(previousReservations.map(r => r.user_email)).size;
    const customerGrowth = previousCustomers > 0 ? ((totalCustomers - previousCustomers) / previousCustomers * 100) : 100;

    // Calculate reservation patterns
    const avgReservationsPerCustomer = totalCustomers > 0 ? filteredReservations.length / totalCustomers : 0;
    
    // Calculate customer value
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + (r.estimated_value || 0), 0);
    const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Time-based patterns - reservations by day of week
    const dayOfWeekData = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    filteredReservations.forEach(r => {
      const day = new Date(r.reservation_date).getDay();
      dayOfWeekData[day]++;
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeekChart = dayNames.map((name, idx) => ({
      day: name,
      reservations: dayOfWeekData[idx]
    }));

    // Hour-based patterns (from reservation_time)
    const hourData: number[] = Array(24).fill(0);
    filteredReservations.forEach(r => {
      if (r.reservation_time) {
        const hour = parseInt(r.reservation_time.split(':')[0]);
        if (hour >= 0 && hour < 24) {
          hourData[hour]++;
        }
      }
    });

    const peakHours = hourData
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Party size distribution
    const partySizeData: Record<number, number> = {};
    filteredReservations.forEach(r => {
      const size = r.party_size || 2;
      partySizeData[size] = (partySizeData[size] || 0) + 1;
    });

    const partySizeChart = Object.entries(partySizeData)
      .map(([size, count]) => ({
        size: `${size} ${parseInt(size) === 1 ? 'person' : 'people'}`,
        count
      }))
      .sort((a, b) => parseInt(a.size) - parseInt(b.size));

    // Reservation status breakdown
    const statusData = filteredReservations.reduce((acc: any, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const statusChart = Object.entries(statusData).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count as number
    }));

    // Geographic distribution (by city)
    const cityData: Record<string, number> = {};
    filteredReservations.forEach(r => {
      const business = businesses.find(b => b.id === r.business_id);
      if (business) {
        cityData[business.city] = (cityData[business.city] || 0) + 1;
      }
    });

    const topCities = Object.entries(cityData)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Customer retention - repeat customers
    const customerReservationCount: Record<string, number> = {};
    filteredReservations.forEach(r => {
      customerReservationCount[r.user_email] = (customerReservationCount[r.user_email] || 0) + 1;
    });

    const repeatCustomers = Object.values(customerReservationCount).filter(count => count > 1).length;
    const repeatCustomerRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers * 100) : 0;

    // Customer segments
    const vipCustomers = Object.entries(customerReservationCount)
      .filter(([_, count]) => count >= 5)
      .length;
    const regularCustomers = Object.entries(customerReservationCount)
      .filter(([_, count]) => count >= 2 && count < 5)
      .length;
    const newCustomers = totalCustomers - regularCustomers - vipCustomers;

    // Trend data - last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const trendData = last7Days.map(date => {
      const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const dayReservations = allReservations.filter(r => {
        const rDate = new Date(r.created_at);
        return rDate >= date && rDate < nextDay;
      });
      
      const dayCustomers = new Set(dayReservations.map(r => r.user_email)).size;
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        customers: dayCustomers,
        reservations: dayReservations.length,
        revenue: dayReservations.reduce((sum, r) => sum + (r.estimated_value || 0), 0)
      };
    });

    // Customer lifetime predictions
    const avgMonthlyReservationsPerCustomer = avgReservationsPerCustomer * (30 / cutoffDays);
    const projectedAnnualValue = avgCustomerValue * (365 / cutoffDays);

    setCustomerData({
      totalCustomers,
      customerGrowth,
      avgReservationsPerCustomer,
      avgCustomerValue,
      totalRevenue,
      dayOfWeekChart,
      hourData,
      peakHours,
      partySizeChart,
      statusChart,
      topCities,
      repeatCustomers,
      repeatCustomerRate,
      vipCustomers,
      regularCustomers,
      newCustomers,
      trendData,
      avgMonthlyReservationsPerCustomer,
      projectedAnnualValue
    });
  };

  if (!customerData) {
    return <div className="animate-pulse">Loading customer analytics...</div>;
  }

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-600" />
            Customer Analytics & Insights
          </h2>
          <p className="text-sm text-gray-600 mt-1">Advanced patterns, trends, and predictive insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            {customerData.customerGrowth > 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <div className="text-3xl font-bold mb-1">{customerData.totalCustomers.toLocaleString()}</div>
          <div className="text-sm opacity-90">Total Customers</div>
          <div className="text-xs opacity-75 mt-2">
            {customerData.customerGrowth >= 0 ? '+' : ''}{customerData.customerGrowth.toFixed(1)}% vs previous period
          </div>
        </div>

        {/* Avg Customer Value */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold mb-1">R{customerData.avgCustomerValue.toFixed(0)}</div>
          <div className="text-sm opacity-90">Avg Customer Value</div>
          <div className="text-xs opacity-75 mt-2">
            R{customerData.projectedAnnualValue.toFixed(0)} projected annual
          </div>
        </div>

        {/* Repeat Customer Rate */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 opacity-80" />
            <Target className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold mb-1">{customerData.repeatCustomerRate.toFixed(1)}%</div>
          <div className="text-sm opacity-90">Repeat Customer Rate</div>
          <div className="text-xs opacity-75 mt-2">
            {customerData.repeatCustomers} returning customers
          </div>
        </div>

        {/* Avg Reservations Per Customer */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold mb-1">{customerData.avgReservationsPerCustomer.toFixed(1)}</div>
          <div className="text-sm opacity-90">Reservations / Customer</div>
          <div className="text-xs opacity-75 mt-2">
            {customerData.avgMonthlyReservationsPerCustomer.toFixed(1)} per month avg
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-600" />
          Customer Segments
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-700 mb-1">{customerData.vipCustomers}</div>
            <div className="text-sm font-semibold text-yellow-800">VIP Customers</div>
            <div className="text-xs text-yellow-600 mt-1">5+ reservations</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-700 mb-1">{customerData.regularCustomers}</div>
            <div className="text-sm font-semibold text-blue-800">Regular Customers</div>
            <div className="text-xs text-blue-600 mt-1">2-4 reservations</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-700 mb-1">{customerData.newCustomers}</div>
            <div className="text-sm font-semibold text-green-800">New Customers</div>
            <div className="text-xs text-green-600 mt-1">1 reservation</div>
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          Customer Activity Trends (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={customerData.trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
            <YAxis stroke="#666" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="customers" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="New Customers" />
            <Area type="monotone" dataKey="reservations" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} name="Reservations" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Day of Week Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            Booking Patterns by Day of Week
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={customerData.dayOfWeekChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px' 
                }}
              />
              <Bar dataKey="reservations" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-900">
              <strong>💡 Insight:</strong> Most popular day is <strong>{customerData.dayOfWeekChart.sort((a: any, b: any) => b.reservations - a.reservations)[0].day}</strong>
            </p>
          </div>
        </div>

        {/* Party Size Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            Party Size Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={customerData.partySizeChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ size, percent }) => `${size}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {customerData.partySizeChart.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900">
              <strong>💡 Insight:</strong> Most common is <strong>{customerData.partySizeChart[0]?.size}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-600" />
          Peak Reservation Hours
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {customerData.peakHours.map((peak: any, idx: number) => (
            <div key={idx} className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700 mb-1">
                {peak.hour}:00 - {peak.hour + 1}:00
              </div>
              <div className="text-sm text-orange-600">{peak.count} reservations</div>
              <div className="text-xs text-orange-500 mt-1">
                {idx === 0 ? '🔥 Peak Time' : `#${idx + 1} Most Popular`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-600" />
          Top Cities by Customer Activity
        </h3>
        <div className="space-y-3">
          {customerData.topCities.map((city: any, idx: number) => {
            const percentage = (city.count / customerData.trendData.reduce((sum: number, d: any) => sum + d.reservations, 0) * 100);
            return (
              <div key={city.city} className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-400 w-8">#{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{city.city}</span>
                    <span className="text-sm text-gray-600">{city.count} reservations</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reservation Status Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-cyan-600" />
          Reservation Status Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RePieChart>
            <Pie
              data={customerData.statusChart}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {customerData.statusChart.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RePieChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights Summary */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-600" />
          AI-Powered Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border border-cyan-200">
            <div className="text-sm font-semibold text-cyan-900 mb-2">📈 Growth Opportunity</div>
            <p className="text-sm text-gray-700">
              {customerData.repeatCustomerRate < 30 
                ? `Low repeat rate (${customerData.repeatCustomerRate.toFixed(1)}%). Consider loyalty programs to boost retention.`
                : `Strong repeat rate (${customerData.repeatCustomerRate.toFixed(1)}%). Focus on VIP customer experiences.`}
            </p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <div className="text-sm font-semibold text-blue-900 mb-2">⏰ Timing Optimization</div>
            <p className="text-sm text-gray-700">
              Peak hours: {customerData.peakHours[0]?.hour}:00-{customerData.peakHours[0]?.hour + 1}:00. 
              Encourage off-peak bookings with special offers.
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <div className="text-sm font-semibold text-purple-900 mb-2">👥 Customer Value</div>
            <p className="text-sm text-gray-700">
              Avg value: R{customerData.avgCustomerValue.toFixed(0)}. 
              VIP customers ({customerData.vipCustom