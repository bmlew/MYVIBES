import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, DollarSign, Activity, TrendingUp, TrendingDown, AlertCircle, Server, Database, Globe, Loader2, CalendarCheck, UserCheck, CheckCircle2, Sparkles, MousePointerClick
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// --- Reusing Mock Data from Dashboard ---
const REVENUE_DATA = [
  { id: 'jan', name: 'Jan', revenue: 45000, profit: 32000 },
  { id: 'feb', name: 'Feb', revenue: 52000, profit: 38000 },
  { id: 'mar', name: 'Mar', revenue: 48000, profit: 34000 },
  { id: 'apr', name: 'Apr', revenue: 61000, profit: 45000 },
  { id: 'may', name: 'May', revenue: 55000, profit: 39000 },
  { id: 'jun', name: 'Jun', revenue: 67000, profit: 48000 },
  { id: 'jul', name: 'Jul', revenue: 72000, profit: 53000 },
];

const StatCard = ({ title, value, trend, icon: Icon, trendUp, loading }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-lg">
        <Icon className="w-6 h-6 text-slate-700" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
        {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {trend}
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <div className="text-3xl font-bold text-slate-900">
      {loading ? (
        <div className="h-9 w-24 bg-slate-100 rounded animate-pulse" />
      ) : (
        value
      )}
    </div>
  </div>
);

export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_customers: 0,
    active_businesses: 0,
    total_revenue: 0,
    churn_rate: 0,
    total_reservations: 0,
    total_checkins: 0,
    reservation_completion_rate: 0,
    total_special_clicks: 0,
    special_to_reservation_matches: 0,
    special_to_reservation_rate: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/stats`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.stats) {
            setStats({
              total_customers: data.stats.total_customers || 0,
              active_businesses: data.stats.active_businesses || 0,
              total_revenue: data.stats.total_revenue || 0,
              churn_rate: 2.4, // Still mock for now as we don't have historical churn data yet
              total_reservations: data.stats.total_reservations || 0,
              total_checkins: data.stats.total_checkins || 0,
              reservation_completion_rate: data.stats.reservation_completion_rate || 0,
              total_special_clicks: data.stats.total_special_clicks || 0,
              special_to_reservation_matches: data.stats.special_to_reservation_matches || 0,
              special_to_reservation_rate: data.stats.special_to_reservation_rate || 0
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.total_customers.toLocaleString()} 
          trend="+12.5%" 
          icon={Users} 
          trendUp={true} 
          loading={loading}
        />
        <StatCard 
          title="Active Businesses" 
          value={stats.active_businesses.toLocaleString()} 
          trend="+5.2%" 
          icon={Building2} 
          trendUp={true} 
          loading={loading}
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.total_revenue)} 
          trend="+18.4%" 
          icon={DollarSign} 
          trendUp={true} 
          loading={loading}
        />
        <StatCard 
          title="Churn Rate" 
          value={`${stats.churn_rate}%`} 
          trend="-0.5%" 
          icon={Activity} 
          trendUp={true} 
          loading={loading}
        />
      </div>

      {/* Reservation & Check-in Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Reservations" 
          value={stats.total_reservations.toLocaleString()} 
          trend="+8.3%" 
          icon={CalendarCheck} 
          trendUp={true} 
          loading={loading}
        />
        <StatCard 
          title="Total Check-ins" 
          value={stats.total_checkins.toLocaleString()} 
          trend="+15.7%" 
          icon={UserCheck} 
          trendUp={true} 
          loading={loading}
        />
        <StatCard 
          title="Completion Rate" 
          value={`${stats.reservation_completion_rate}%`} 
          trend={stats.reservation_completion_rate >= 50 ? '+2.1%' : '-1.5%'} 
          icon={CheckCircle2} 
          trendUp={stats.reservation_completion_rate >= 50} 
          loading={loading}
        />
      </div>

      {/* Special Click Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Special Clicks" 
          value={stats.total_special_clicks.toLocaleString()} 
          trend="+22.4%" 
          icon={MousePointerClick} 
          trendUp={true} 
          loading={loading}
        />
        <StatCard 
          title="Special → Reservations" 
          value={stats.special_to_reservation_matches.toLocaleString()} 
          trend="+11.8%" 
          icon={Sparkles} 
          trendUp={true} 
          loading={loading}
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${stats.special_to_reservation_rate}%`} 
          trend={stats.special_to_reservation_rate >= 30 ? '+3.2%' : '-2.1%'} 
          icon={CheckCircle2} 
          trendUp={stats.special_to_reservation_rate >= 30} 
          loading={loading}
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100" key="admin-revenue-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Platform Revenue</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="adminOverviewColorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid key="admin-grid" strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis key="admin-x-axis" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis key="admin-y-axis" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  key="admin-tooltip"
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Area 
                  key="admin-revenue-area"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#06b6d4" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#adminOverviewColorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100" key="system-health-card">
          <h3 className="text-lg font-bold text-slate-900 mb-6">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-green-600" />
                <span className="font-medium text-slate-900">Database</span>
              </div>
              <span className="text-xs font-bold text-green-600 px-2 py-1 bg-white rounded-full">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-green-600" />
                <span className="font-medium text-slate-900">API Gateway</span>
              </div>
              <span className="text-xs font-bold text-green-600 px-2 py-1 bg-white rounded-full">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-600" />
                <span className="font-medium text-slate-900">CDN / Assets</span>
              </div>
              <span className="text-xs font-bold text-green-600 px-2 py-1 bg-white rounded-full">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-slate-900">Email Service</span>
              </div>
              <span className="text-xs font-bold text-yellow-600 px-2 py-1 bg-white rounded-full">Degraded</span>
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-400 text-center">
            Last check: 2 minutes ago
          </div>
        </div>
      </div>
    </div>
  );
}