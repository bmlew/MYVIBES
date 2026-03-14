import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, MoreHorizontal, Loader2, Plus
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

interface Subscription {
  id: string;
  business: string;
  plan: 'Pro Partner' | 'Promo Exception';
  billing: string;
  nextBill: string;
  status: string;
  amount: number;
}

export function GlobalSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`${API_URL}/admin/generate-test-subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to generate data');
      
      const data = await response.json();
      toast.success(data.message);
      fetchSubscriptions();
    } catch (err) {
      console.error('Error generating data:', err);
      toast.error('Failed to generate test data');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAction = (action: string, sub: Subscription) => {
    toast.success(`${action} for ${sub.business}`, {
      description: `Subscription ID: ${sub.id}`
    });
  };

  // Calculate Stats
  const totalMRR = subscriptions.reduce((sum, sub) => sum + (sub.status === 'Active' ? sub.amount : 0), 0);
  const activeSubscribers = subscriptions.filter(sub => sub.status === 'Active').length;
  
  // Calculate Distribution
  const distribution = [
    { 
      name: 'Promo Exception', 
      value: subscriptions.filter(s => s.plan === 'Promo Exception').length, 
      color: '#94a3b8' 
    },
    { 
      name: 'Pro Partner', 
      value: subscriptions.filter(s => s.plan === 'Pro Partner').length, 
      color: '#06b6d4' 
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Subscriptions Management</h2>
        {subscriptions.length === 0 && (
          <Button 
            variant="outline" 
            onClick={handleGenerateData} 
            disabled={isGenerating}
            className="gap-2 border-dashed border-cyan-500 text-cyan-600 hover:bg-cyan-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generate Test Data
          </Button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Monthly Recurring Revenue</p>
            <h3 className="text-3xl font-bold text-slate-900">R {totalMRR.toLocaleString()}</h3>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" /> +15.3% vs last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Active Subscribers</p>
            <h3 className="text-3xl font-bold text-slate-900">{activeSubscribers}</h3>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" /> +24 new this month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Churn Rate</p>
            <h3 className="text-3xl font-bold text-slate-900">2.4%</h3>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingDown className="w-4 h-4 mr-1" /> -0.5% vs last month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscriber List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Recent Subscribers</h3>
            <Button variant="outline" size="sm" onClick={() => toast.info("Viewing all subscribers...")}>View All</Button>
          </div>
          
          {loading ? (
            <div className="p-12 flex justify-center items-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading subscriptions...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p>No subscriptions found.</p>
              <Button 
                variant="link" 
                onClick={handleGenerateData}
                className="mt-2 text-cyan-600"
              >
                Generate Test Data
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Business</th>
                    <th className="px-6 py-4 font-medium">Plan</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Next Billing</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium">{sub.business}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={
                          sub.plan === 'Pro Partner' ? 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200' : 
                          'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        }>
                          {sub.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium
                          ${sub.status === 'Active' ? 'text-green-600' : 
                            sub.status === 'Past Due' ? 'text-orange-600' : 
                            'text-red-600'}`}>
                          {sub.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                          {sub.status === 'Past Due' && <AlertCircle className="w-3 h-3" />}
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{sub.nextBill}</td>
                      <td className="px-6 py-4 font-medium">R {sub.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer hover:bg-slate-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border-slate-200 z-50">
                            <DropdownMenuItem onClick={() => handleAction('View Details', sub)} className="cursor-pointer">
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Change Plan', sub)} className="cursor-pointer">
                              Change Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Cancel Subscription', sub)} className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50">
                              Cancel Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-900 mb-6">Plan Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`sub-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {distribution.map((item, i) => (
              <div key={`sub-dist-${i}`} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <div className="text-sm font-bold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}