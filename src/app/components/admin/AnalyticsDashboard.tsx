import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Users, Building2, DollarSign, 
  MapPin, Calendar, Download, Eye, MousePointerClick, Star, 
  CheckCircle2, Clock, Filter, ChevronRight, Activity, Sparkles,
  UserCheck, CalendarCheck, Share2, BarChart3, PieChart
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface AnalyticsDashboardProps {
  onBack?: () => void;
}

type ViewType = 'overview' | 'customers' | 'businesses' | 'partners' | 'engagement' | 'revenue' | 'geography';

interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
  drillDownView?: ViewType;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/analytics?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView analytics={analytics} onDrillDown={setCurrentView} loading={loading} />;
      case 'customers':
        return <CustomersView analytics={analytics} loading={loading} />;
      case 'businesses':
        return <BusinessesView analytics={analytics} loading={loading} />;
      case 'partners':
        return <PartnersView analytics={analytics} loading={loading} />;
      case 'engagement':
        return <EngagementView analytics={analytics} loading={loading} />;
      case 'revenue':
        return <RevenueView analytics={analytics} loading={loading} />;
      case 'geography':
        return <GeographyView analytics={analytics} loading={loading} />;
      default:
        return <OverviewView analytics={analytics} onDrillDown={setCurrentView} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {currentView !== 'overview' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('overview')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Overview
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-cyan-600" />
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  {currentView === 'overview' ? 'Complete platform insights' : getViewTitle(currentView)}
                </p>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 outline-none focus:border-cyan-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={fetchAnalytics}
              >
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {renderView()}
      </div>
    </div>
  );
}

function getViewTitle(view: ViewType): string {
  const titles: Record<ViewType, string> = {
    overview: 'Overview',
    customers: 'Customer Analytics',
    businesses: 'Business Performance',
    partners: 'Partner & Influencer Metrics',
    engagement: 'User Engagement Analysis',
    revenue: 'Revenue & Financial Insights',
    geography: 'Geographic Distribution'
  };
  return titles[view];
}

// ============================================
// OVERVIEW VIEW
// ============================================
function OverviewView({ analytics, onDrillDown, loading }: any) {
  // Memoize chart data to prevent duplicate key errors
  const revenueData = React.useMemo(() => 
    analytics?.revenue?.sources || generateMockRevenueData(),
    [analytics?.revenue?.sources]
  );

  const metrics: MetricCard[] = [
    {
      id: 'total_customers',
      label: 'Total Customers',
      value: analytics?.overview?.total_customers || 0,
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'cyan',
      drillDownView: 'customers'
    },
    {
      id: 'active_businesses',
      label: 'Active Businesses',
      value: analytics?.overview?.active_businesses || 0,
      change: '+8.3%',
      trend: 'up',
      icon: Building2,
      color: 'purple',
      drillDownView: 'businesses'
    },
    {
      id: 'total_partners',
      label: 'Active Partners',
      value: analytics?.overview?.total_partners || 0,
      change: '+18.2%',
      trend: 'up',
      icon: Share2,
      color: 'pink',
      drillDownView: 'partners'
    },
    {
      id: 'total_revenue',
      label: 'Total Revenue',
      value: `R ${(analytics?.overview?.total_revenue || 0).toLocaleString()}`,
      change: '+15.7%',
      trend: 'up',
      icon: DollarSign,
      color: 'green',
      drillDownView: 'revenue'
    },
    {
      id: 'total_checkins',
      label: 'Total Check-ins',
      value: analytics?.overview?.total_checkins || 0,
      change: '+22.4%',
      trend: 'up',
      icon: UserCheck,
      color: 'blue',
      drillDownView: 'engagement'
    },
    {
      id: 'total_reservations',
      label: 'Reservations',
      value: analytics?.overview?.total_reservations || 0,
      change: '+9.1%',
      trend: 'up',
      icon: CalendarCheck,
      color: 'orange',
      drillDownView: 'engagement'
    }
  ];

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card
            key={metric.id}
            className="p-6 cursor-pointer hover:shadow-lg transition-all border-slate-100 group"
            onClick={() => metric.drillDownView && onDrillDown(metric.drillDownView)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${metric.color}-50`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${metric.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                  {metric.change}
                </span>
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{metric.label}</h3>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-slate-900">{metric.value}</div>
              {metric.drillDownView && (
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trend */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">User Growth Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.trends?.user_growth || generateMockTrendData()}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.map((entry: any, index: number) => (
                    <Cell key={`revenue-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {revenueData.map((item: any, index: number) => (
              <div key={`revenue-legend-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="p-6 border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Platform Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem 
            icon={Eye} 
            label="Total Views" 
            value={(analytics?.activity?.total_views || 12845).toLocaleString()} 
            color="blue"
          />
          <StatItem 
            icon={MousePointerClick} 
            label="Special Clicks" 
            value={(analytics?.activity?.special_clicks || 3421).toLocaleString()} 
            color="purple"
          />
          <StatItem 
            icon={Star} 
            label="Total Reviews" 
            value={(analytics?.activity?.total_reviews || 892).toLocaleString()} 
            color="yellow"
          />
          <StatItem 
            icon={Sparkles} 
            label="Active Specials" 
            value={(analytics?.activity?.active_specials || 156).toLocaleString()} 
            color="pink"
          />
        </div>
      </Card>
    </div>
  );
}

// ============================================
// CUSTOMERS DRILL-DOWN VIEW
// ============================================
function CustomersView({ analytics, loading }: any) {
  if (loading) return <LoadingSkeleton />;

  const customerData = analytics?.customers || {};
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Customers"
          value={customerData.total || 0}
          change="+12.5%"
          trend="up"
          icon={Users}
          iconColor="cyan"
        />
        <MetricCard
          label="Active (30d)"
          value={customerData.active_30d || 0}
          change="+8.3%"
          trend="up"
          icon={Activity}
          iconColor="green"
        />
        <MetricCard
          label="New This Month"
          value={customerData.new_this_month || 0}
          change="+18.7%"
          trend="up"
          icon={TrendingUp}
          iconColor="blue"
        />
        <MetricCard
          label="Avg Check-ins"
          value={customerData.avg_checkins || 0}
          change="+5.2%"
          trend="up"
          icon={CheckCircle2}
          iconColor="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Acquisition */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Acquisition</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerData.acquisition || generateMockAcquisitionData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="organic" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  name="Organic"
                />
                <Line 
                  type="monotone" 
                  dataKey="referred" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  name="Referred"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Customer Segments */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Segments</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData.segments || generateMockSegmentData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card className="border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Top Customers by Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check-ins</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(customerData.top_customers || generateMockTopCustomers()).map((customer: any, index: number) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-semibold text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{customer.name}</div>
                        <div className="text-xs text-slate-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{customer.checkins}</td>
                  <td className="px-6 py-4">
                    <span className="text-cyan-600 font-semibold">{customer.points}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{customer.last_active}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================
// BUSINESSES DRILL-DOWN VIEW
// ============================================
function BusinessesView({ analytics, loading }: any) {
  if (loading) return <LoadingSkeleton />;

  const businessData = analytics?.businesses || {};
  
  // Memoize chart data to prevent duplicate key errors
  const subscriptionData = React.useMemo(() => 
    businessData.subscriptions || generateMockSubscriptionData(),
    [businessData.subscriptions]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Businesses"
          value={businessData.total || 0}
          change="+8.3%"
          trend="up"
          icon={Building2}
          iconColor="purple"
        />
        <MetricCard
          label="Active Businesses"
          value={businessData.active || 0}
          change="+5.7%"
          trend="up"
          icon={Activity}
          iconColor="green"
        />
        <MetricCard
          label="Avg Rating"
          value={businessData.avg_rating || 4.5}
          change="+0.3"
          trend="up"
          icon={Star}
          iconColor="yellow"
        />
        <MetricCard
          label="Total Specials"
          value={businessData.total_specials || 0}
          change="+12.1%"
          trend="up"
          icon={Sparkles}
          iconColor="pink"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Categories */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Business Categories</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={businessData.categories || generateMockCategoryData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="category" type="category" tick={{fill: '#64748b', fontSize: 12}} width={100} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subscription Distribution */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Subscription Plans</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionData.map((entry: any, index: number) => (
                    <Cell key={`subscription-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {subscriptionData.map((item: any, index: number) => (
              <div key={`subscription-legend-${index}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Businesses Table */}
      <Card className="border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Top Performing Businesses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check-ins</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(businessData.top_businesses || generateMockTopBusinesses()).map((business: any, index: number) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {business.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{business.name}</div>
                        <div className="text-xs text-slate-500">{business.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{business.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-slate-900">{business.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{business.checkins}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">R{business.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================
// PARTNERS DRILL-DOWN VIEW
// ============================================
function PartnersView({ analytics, loading }: any) {
  if (loading) return <LoadingSkeleton />;

  const partnerData = analytics?.partners || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Partner Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Partners"
          value={partnerData.total || 0}
          change="+18.2%"
          trend="up"
          icon={Share2}
          iconColor="pink"
        />
        <MetricCard
          label="Customer Referrals"
          value={partnerData.customer_referrals || 0}
          change="+24.5%"
          trend="up"
          icon={Users}
          iconColor="cyan"
        />
        <MetricCard
          label="Business Referrals"
          value={partnerData.business_referrals || 0}
          change="+15.3%"
          trend="up"
          icon={Building2}
          iconColor="purple"
        />
        <MetricCard
          label="Total Commissions"
          value={`R${(partnerData.total_commissions || 0).toLocaleString()}`}
          change="+21.8%"
          trend="up"
          icon={DollarSign}
          iconColor="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Performance */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Partner Referral Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={partnerData.trends || generateMockPartnerTrends()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  name="Customer Referrals"
                />
                <Line 
                  type="monotone" 
                  dataKey="businesses" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Business Referrals"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Commission Distribution */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Commission Types</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partnerData.commission_types || generateMockCommissionTypes()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{fill: '#64748b', fontSize: 11}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="amount" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Partners Table */}
      <Card className="border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Top Earning Partners</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Partner</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer Refs</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Business Refs</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Earned</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(partnerData.top_partners || generateMockTopPartners()).map((partner: any, index: number) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-semibold text-sm">
                        {partner.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{partner.name}</div>
                        <div className="text-xs text-slate-500">{partner.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-cyan-600">{partner.code}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{partner.customer_refs}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{partner.business_refs}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">R{partner.total_earned.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-orange-600">R{partner.pending.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================
// ENGAGEMENT DRILL-DOWN VIEW
// ============================================
function EngagementView({ analytics, loading }: any) {
  if (loading) return <LoadingSkeleton />;

  const engagementData = analytics?.engagement || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Check-ins"
          value={engagementData.total_checkins || 0}
          change="+22.4%"
          trend="up"
          icon={UserCheck}
          iconColor="blue"
        />
        <MetricCard
          label="Reservations"
          value={engagementData.total_reservations || 0}
          change="+9.1%"
          trend="up"
          icon={CalendarCheck}
          iconColor="orange"
        />
        <MetricCard
          label="Completion Rate"
          value={`${engagementData.completion_rate || 0}%`}
          change="+2.3%"
          trend="up"
          icon={CheckCircle2}
          iconColor="green"
        />
        <MetricCard
          label="Avg Session Time"
          value={`${engagementData.avg_session || 0}m`}
          change="+1.5m"
          trend="up"
          icon={Clock}
          iconColor="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Daily Activity Pattern</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData.daily_pattern || generateMockDailyActivity()}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="checkins" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fill="url(#colorActivity)" 
                  name="Check-ins"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Special Clicks vs Reservations */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Special Clicks → Reservations</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData.conversion_funnel || generateMockConversionData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend />
                <Bar dataKey="clicks" fill="#ec4899" radius={[8, 8, 0, 0]} name="Special Clicks" />
                <Bar dataKey="reservations" fill="#10b981" radius={[8, 8, 0, 0]} name="Reservations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-pink-50">
              <MousePointerClick className="w-5 h-5 text-pink-600" />
            </div>
            <h4 className="font-semibold text-slate-900">Special Clicks</h4>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {(engagementData.special_clicks || 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-500">
            {engagementData.special_conversion_rate || 0}% conversion to reservations
          </div>
        </Card>

        <Card className="p-6 border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-yellow-50">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <h4 className="font-semibold text-slate-900">Reviews</h4>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {(engagementData.total_reviews || 0).toLocaleString()}
          </div>
          <div className="text-sm text-slate-500">
            Average rating: {engagementData.avg_rating || 4.5} stars
          </div>
        </Card>

        <Card className="p-6 border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-50">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-900">Active Specials</h4>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {engagementData.active_specials || 0}
          </div>
          <div className="text-sm text-slate-500">
            {engagementData.avg_clicks_per_special || 0} avg clicks per special
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// REVENUE DRILL-DOWN VIEW
// ============================================
function RevenueView({ analytics, loading }: any) {
  if (loading) return <LoadingSkeleton />;

  const revenueData = analytics?.revenue || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={`R${(revenueData.total || 0).toLocaleString()}`}
          change="+15.7%"
          trend="up"
          icon={DollarSign}
          iconColor="green"
        />
        <MetricCard
          label="MRR"
          value={`R${(revenueData.mrr || 0).toLocaleString()}`}
          change="+8.2%"
          trend="up"
          icon={TrendingUp}
          iconColor="blue"
        />
        <MetricCard
          label="Avg Order Value"
          value={`R${(revenueData.aov || 0).toLocaleString()}`}
          change="+3.1%"
          trend="up"
          icon={Activity}
          iconColor="purple"
        />
        <MetricCard
          label="Partner Payouts"
          value={`R${(revenueData.partner_payouts || 0).toLocaleString()}`}
          change="+21.5%"
          trend="up"
          icon={Share2}
          iconColor="pink"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Revenue</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData.monthly_trend || generateMockRevenuetrend()}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Sources */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.breakdown || generateMockRevenueBreakdown()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="source" tick={{fill: '#64748b', fontSize: 11}} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// GEOGRAPHY DRILL-DOWN VIEW
// ============================================
function GeographyView({ analytics, loading }: any) {
  if (loading) return <LoadingSkeleton />;

  const geoData = analytics?.geography || {};
  
  // Memoize chart data to prevent duplicate key errors
  const customerCityData = React.useMemo(() => 
    geoData.customer_cities || generateMockCustomerCityData(),
    [geoData.customer_cities]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Geographic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Cities"
          value={geoData.total_cities || 0}
          change="+3"
          trend="up"
          icon={MapPin}
          iconColor="red"
        />
        <MetricCard
          label="Top City"
          value={geoData.top_city || 'Cape Town'}
          change="+12.5%"
          trend="up"
          icon={TrendingUp}
          iconColor="blue"
        />
        <MetricCard
          label="Avg per City"
          value={geoData.avg_per_city || 0}
          change="+8.3%"
          trend="up"
          icon={Building2}
          iconColor="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cities Distribution */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Businesses by City</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoData.cities || generateMockCityData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis dataKey="city" type="category" tick={{fill: '#64748b', fontSize: 12}} width={120} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="businesses" fill="#06b6d4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Customer Distribution */}
        <Card className="p-6 border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Distribution</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={customerCityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerCityData.map((entry: any, index: number) => (
                    <Cell key={`geo-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {customerCityData.map((item: any, index: number) => (
              <div key={`geo-legend-${index}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================
function MetricCard({ label, value, change, trend, icon: Icon, iconColor }: any) {
  const colorClasses: any = {
    cyan: 'bg-cyan-50 text-cyan-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <Card className="p-6 border-slate-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[iconColor]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </Card>
  );
}

function StatItem({ icon: Icon, label, value, color }: any) {
  const colorClasses: any = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    pink: 'bg-pink-50 text-pink-600'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 h-96" />
        ))}
      </div>
    </div>
  );
}

function renderPieLabel(entry: any) {
  return `${entry.name}: ${entry.value}`;
}

// ============================================
// MOCK DATA GENERATORS
// ============================================
function generateMockTrendData() {
  return [
    { date: 'Jan', customers: 1200 },
    { date: 'Feb', customers: 1450 },
    { date: 'Mar', customers: 1680 },
    { date: 'Apr', customers: 1920 },
    { date: 'May', customers: 2150 },
    { date: 'Jun', customers: 2480 }
  ];
}

function generateMockRevenueData() {
  return [
    { name: 'Subscriptions', value: 45000 },
    { name: 'Commissions', value: 12000 },
    { name: 'Ads', value: 8500 },
    { name: 'Other', value: 3200 }
  ];
}

function generateMockAcquisitionData() {
  return [
    { week: 'Week 1', organic: 45, referred: 23 },
    { week: 'Week 2', organic: 52, referred: 31 },
    { week: 'Week 3', organic: 48, referred: 28 },
    { week: 'Week 4', organic: 61, referred: 35 }
  ];
}

function generateMockSegmentData() {
  return [
    { segment: 'Power Users', count: 320 },
    { segment: 'Regular', count: 580 },
    { segment: 'Occasional', count: 420 },
    { segment: 'New', count: 180 }
  ];
}

function generateMockTopCustomers() {
  return [
    { name: 'Sarah Johnson', email: 'sarah@example.com', checkins: 47, points: 470, last_active: '2 hours ago', status: 'Active' },
    { name: 'Michael Chen', email: 'michael@example.com', checkins: 42, points: 420, last_active: '1 day ago', status: 'Active' },
    { name: 'Emma Williams', email: 'emma@example.com', checkins: 38, points: 380, last_active: '3 days ago', status: 'Active' },
    { name: 'David Brown', email: 'david@example.com', checkins: 35, points: 350, last_active: '5 hours ago', status: 'Active' }
  ];
}

function generateMockCategoryData() {
  return [
    { category: 'Restaurants', count: 45 },
    { category: 'Cafes', count: 32 },
    { category: 'Bars & Pubs', count: 28 },
    { category: 'Nightclubs', count: 15 },
    { category: 'Other', count: 12 }
  ];
}

function generateMockSubscriptionData() {
  return [
    { name: 'Standard', value: 68 },
    { name: 'Premium', value: 42 },
    { name: 'Enterprise', value: 22 }
  ];
}

function generateMockTopBusinesses() {
  return [
    { name: 'The Lighthouse', location: 'Cape Town', category: 'Restaurant', rating: 4.8, checkins: 342, revenue: 15800 },
    { name: 'Brew & Co', location: 'Johannesburg', category: 'Cafe', rating: 4.7, checkins: 298, revenue: 12500 },
    { name: 'Sunset Lounge', location: 'Durban', category: 'Bar', rating: 4.6, checkins: 256, revenue: 10200 },
    { name: 'Urban Kitchen', location: 'Pretoria', category: 'Restaurant', rating: 4.9, checkins: 234, revenue: 9800 }
  ];
}

function generateMockPartnerTrends() {
  return [
    { month: 'Jan', customers: 45, businesses: 12 },
    { month: 'Feb', customers: 62, businesses: 18 },
    { month: 'Mar', customers: 78, businesses: 15 },
    { month: 'Apr', customers: 95, businesses: 22 },
    { month: 'May', customers: 112, businesses: 28 },
    { month: 'Jun', customers: 138, businesses: 31 }
  ];
}

function generateMockCommissionTypes() {
  return [
    { type: 'Download Bounty', amount: 8400 },
    { type: 'Check-in Milestone', amount: 12600 },
    { type: 'Business Subs', amount: 15200 },
    { type: 'Visit Bonus', amount: 3800 }
  ];
}

function generateMockTopPartners() {
  return [
    { name: 'Alex Thompson', email: 'alex@influencer.com', code: 'ALX2847', customer_refs: 124, business_refs: 8, total_earned: 18400, pending: 2200 },
    { name: 'Jessica Lee', email: 'jess@social.com', code: 'JLE9231', customer_refs: 98, business_refs: 12, total_earned: 21600, pending: 3400 },
    { name: 'Ryan Martinez', email: 'ryan@promo.com', code: 'RMZ4563', customer_refs: 87, business_refs: 6, total_earned: 14200, pending: 1800 }
  ];
}

function generateMockDailyActivity() {
  return [
    { day: 'Mon', checkins: 245 },
    { day: 'Tue', checkins: 312 },
    { day: 'Wed', checkins: 289 },
    { day: 'Thu', checkins: 356 },
    { day: 'Fri', checkins: 478 },
    { day: 'Sat', checkins: 521 },
    { day: 'Sun', checkins: 398 }
  ];
}

function generateMockConversionData() {
  return [
    { week: 'W1', clicks: 456, reservations: 142 },
    { week: 'W2', clicks: 523, reservations: 178 },
    { week: 'W3', clicks: 489, reservations: 156 },
    { week: 'W4', clicks: 612, reservations: 201 }
  ];
}

function generateMockRevenuetrend() {
  return [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 }
  ];
}

function generateMockRevenueBreakdown() {
  return [
    { source: 'Subscriptions', amount: 45000 },
    { source: 'Ads', amount: 12000 },
    { source: 'Commissions', amount: 8500 },
    { source: 'Other', amount: 2200 }
  ];
}

function generateMockCityData() {
  return [
    { city: 'Cape Town', businesses: 68 },
    { city: 'Johannesburg', businesses: 52 },
    { city: 'Durban', businesses: 38 },
    { city: 'Pretoria', businesses: 28 },
    { city: 'Port Elizabeth', businesses: 18 },
    { city: 'Bloemfontein', businesses: 12 }
  ];
}

function generateMockCustomerCityData() {
  return [
    { name: 'Cape Town', value: 1248 },
    { name: 'Johannesburg', value: 982 },
    { name: 'Durban', value: 756 },
    { name: 'Pretoria', value: 524 },
    { name: 'Other', value: 312 }
  ];
}
