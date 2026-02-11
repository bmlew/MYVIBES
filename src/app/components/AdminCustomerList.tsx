import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Users, DollarSign, Activity, MapPin, Search, Filter, Download } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  total_orders: number;
  total_spend: number;
  last_active: string;
  joined_at: string;
  status: 'active' | 'inactive';
}

interface CustomerAnalytics {
  total_customers: number;
  total_spend: number;
  average_spend: number;
  active_count: number;
  inactive_count: number;
  recent_activity_count: number;
  city_distribution: Record<string, number>;
  top_spenders: Customer[];
}

export function AdminCustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch customers
      const customersResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/customers`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      
      if (customersResponse.ok) {
        const data = await customersResponse.json();
        setCustomers(data.customers || []);
      }

      // Fetch analytics
      const analyticsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/customers/analytics`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (analyticsResponse.ok) {
        const data = await analyticsResponse.json();
        setAnalytics(data.analytics);
      }

    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-500">View and manage global platform customers</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            const csv = [
              ['Name', 'Email', 'Phone', 'City', 'Total Orders', 'Total Spend', 'Status', 'Joined'],
              ...customers.map(c => [
                c.name, c.email, c.phone, c.city, c.total_orders, c.total_spend, c.status, c.joined_at
              ])
            ].map(row => row.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'customers.csv';
            a.click();
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Customers</p>
                <h3 className="text-3xl font-bold">{analytics.total_customers}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold">{formatCurrency(analytics.total_spend)}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg. Spend / User</p>
                <h3 className="text-3xl font-bold">{formatCurrency(analytics.average_spend)}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Top City</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {Object.entries(analytics.city_distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                </h3>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spend</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{customer.city}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{formatCurrency(customer.total_spend)}</p>
                          <p className="text-xs text-gray-500">{customer.total_orders} orders</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(customer.joined_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          {/* Top Spenders */}
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-500" />
              Top Spenders
            </h3>
            <div className="space-y-4">
              {analytics?.top_spenders.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.city}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 text-sm">
                    {formatCurrency(customer.total_spend)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Demographics / Distribution */}
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Geographic Distribution
            </h3>
            <div className="space-y-3">
              {analytics && Object.entries(analytics.city_distribution).map(([city, count]) => (
                <div key={city}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{city}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / analytics.total_customers) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
