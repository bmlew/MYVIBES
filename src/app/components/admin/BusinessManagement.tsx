import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Filter, MoreHorizontal, CheckCircle2, XCircle, 
  MapPin, Calendar, DollarSign, Mail, Phone, ExternalLink, Activity, Loader2, Trash2
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

interface Business {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  subscription_status: string;
  subscription_plan: string;
  created_at: string;
  city: string;
  average_rating: number;
  is_active: boolean;
}

export function BusinessManagement() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      // Add timestamp to prevent caching
      const response = await fetch(`${API_URL}/kv/businesses?limit=100&admin=true&_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();
      setBusinesses(data.data || []);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Failed to load businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessStatus = async (id: string, updates: any) => {
    try {
      const response = await fetch(`${API_URL}/admin/businesses/${id}/override-visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update business status');
      
      const data = await response.json();
      toast.success(data.message);
      // Wait a moment for propagation then fetch
      setTimeout(() => fetchBusinesses(), 500); 
    } catch (err) {
      console.error('Error updating business:', err);
      toast.error('Failed to update business status');
    }
  };

  const handleAction = (action: string, biz: Business) => {
    if (action === 'Approve Business') {
      updateBusinessStatus(biz.id, { 
        is_active: true, 
        subscription_status: 'active',
        payment_status: 'paid' 
      });
    } else if (action === 'Suspend Business') {
      updateBusinessStatus(biz.id, { 
        is_active: false 
      });
    } else {
      toast.success(`${action} for ${biz.name}`, {
        description: `Business ID: ${biz.id}`
      });
    }
  };

  const handleResetSystem = async () => {
    if (!window.confirm("ARE YOU SURE? This will DELETE ALL DATA from the system. This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/reset-database`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to reset system');
      
      const data = await response.json();
      toast.success(data.message);
      setBusinesses([]);
    } catch (err) {
      console.error('Error resetting system:', err);
      toast.error('Failed to reset system');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'active') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'pending') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getPlanName = (plan: string) => {
    switch(plan) {
      case 'premium': return 'Enterprise';
      case 'standard': return 'Pro Partner';
      default: return 'Basic';
    }
  };

  const filteredBusinesses = businesses.filter(biz => 
    biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    biz.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    biz.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search businesses, owners, or IDs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="destructive" 
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
            onClick={handleResetSystem}
          >
            <Trash2 className="w-4 h-4" /> Reset System
          </Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            Export CSV
          </Button>
          <Button className="bg-cyan-600 text-white hover:bg-cyan-700">
            + Add Business
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-orange-500">
              {businesses.filter(b => b.subscription_status === 'pending').length}
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <Building2 className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Verified Partners</p>
            <p className="text-2xl font-bold text-green-600">
              {businesses.filter(b => b.is_active).length}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Platform Revenue</p>
            <p className="text-2xl font-bold text-slate-900">R 0</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center items-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading businesses...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            {error}
            <Button variant="outline" className="mt-2" onClick={fetchBusinesses}>Retry</Button>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No businesses found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Business Details</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Revenue (YTD)</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBusinesses.map((biz) => (
                  <tr key={biz.id} className="hover:bg-slate-50/50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                          {biz.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{biz.name || 'Unknown Business'}</div>
                          <div className="text-slate-500 text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {biz.owner_name || 'No Owner'}
                          </div>
                          <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                            <span className="text-xs opacity-70">{biz.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="outline" 
                        className={
                          biz.subscription_plan === 'premium' ? 'bg-slate-900 text-white border-transparent hover:bg-slate-800' : 
                          biz.subscription_plan === 'standard' ? 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200' : 
                          'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        }
                      >
                        {getPlanName(biz.subscription_plan)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      R 0
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(biz.subscription_status, biz.is_active)}`}>
                        {biz.is_active ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {!biz.is_active ? 'Suspended' : (biz.subscription_status || 'Pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {biz.city || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer hover:bg-slate-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border-slate-200 z-50">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleAction('View Profile', biz)} className="cursor-pointer">
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('View Financials', biz)} className="cursor-pointer">
                            View Financials
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {biz.subscription_status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleAction('Approve Business', biz)} className="text-green-600 cursor-pointer focus:text-green-700 focus:bg-green-50">
                              Approve Business
                            </DropdownMenuItem>
                          )}
                          {!biz.is_active && biz.subscription_status !== 'pending' && (
                            <DropdownMenuItem onClick={() => handleAction('Approve Business', biz)} className="text-green-600 cursor-pointer focus:text-green-700 focus:bg-green-50">
                              Re-activate Business
                            </DropdownMenuItem>
                          )}
                          {biz.is_active && (
                            <DropdownMenuItem onClick={() => handleAction('Suspend Business', biz)} className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50">
                              Suspend Business
                            </DropdownMenuItem>
                          )}
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
    </div>
  );
}