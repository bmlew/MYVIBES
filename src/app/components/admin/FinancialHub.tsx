import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ArrowUpRight, ArrowDownLeft, Download, Filter, Search, 
  CreditCard, Wallet, AlertCircle, RefreshCw, Loader2, Plus
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Card } from '@/app/components/ui/card';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface Transaction {
  id: string;
  business: string;
  amount: number;
  type: string;
  status: string;
  date: string;
}

const REVENUE_HISTORY = [
  { month: 'Jun', revenue: 45000, payouts: 32000 },
  { month: 'Jul', revenue: 52000, payouts: 38000 },
  { month: 'Aug', revenue: 48000, payouts: 34000 },
  { month: 'Sep', revenue: 61000, payouts: 45000 },
  { month: 'Oct', revenue: 55000, payouts: 39000 },
  { month: 'Nov', revenue: 67000, payouts: 48000 },
];

export function FinancialHub() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/payments`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions(data.payments || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`${API_URL}/admin/generate-test-payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to generate data');
      
      const data = await response.json();
      toast.success(data.message);
      fetchTransactions();
    } catch (err) {
      console.error('Error generating data:', err);
      toast.error('Failed to generate test data');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.business.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort transactions by date (descending) but simply reverse for now as ID is somewhat chronological in sample
  const sortedTransactions = [...filteredTransactions].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Financial Hub</h2>
        <div className="flex gap-2">
          {transactions.length === 0 && (
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
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button className="bg-cyan-600 text-white hover:bg-cyan-700">
            Process Payouts
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm">Total Volume</p>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {transactions.length > 0 ? 'R 18,300' : 'R 0'}
          </h3>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-1" /> +12% this month
          </p>
        </Card>

        <Card className="p-6 border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm">Platform Revenue</p>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {transactions.length > 0 ? 'R 1,700' : 'R 0'}
          </h3>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-1" /> +8.5% this month
          </p>
        </Card>

        <Card className="p-6 border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm">Pending Payouts</p>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {transactions.length > 0 ? 'R 4,500' : 'R 0'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Next batch: Friday 12PM
          </p>
        </Card>

        <Card className="p-6 border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm">Failed Transactions</p>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {transactions.length > 0 ? 'R 450' : 'R 0'}
          </h3>
          <p className="text-xs text-red-600 flex items-center mt-1">
            <ArrowDownLeft className="w-3 h-3 mr-1" /> 1 requires attention
          </p>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 mb-6 rounded-lg w-full sm:w-auto flex">
          <TabsTrigger value="transactions" className="flex-1 sm:flex-none">Transactions</TabsTrigger>
          <TabsTrigger value="payouts" className="flex-1 sm:flex-none">Payouts</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 sm:flex-none">Revenue Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search transaction ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center items-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading transactions...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>No transactions found.</p>
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
                      <th className="px-6 py-4 font-medium">Transaction ID</th>
                      <th className="px-6 py-4 font-medium">Business</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-slate-600">{tx.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{tx.business}</td>
                        <td className="px-6 py-4 text-slate-600">{tx.type}</td>
                        <td className="px-6 py-4 text-slate-600">{tx.date}</td>
                        <td className={`px-6 py-4 font-bold ${tx.type === 'Payout' ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.type === 'Payout' ? '-' : '+'} R {tx.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${(tx.status === 'Completed' || tx.status === 'Processed') ? 'bg-green-50 text-green-700 border-green-200' : 
                              tx.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                              'bg-red-50 text-red-700 border-red-200'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-6 border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Revenue vs Payouts</h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_HISTORY}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="revenue" name="Revenue" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="payouts" name="Payouts" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}