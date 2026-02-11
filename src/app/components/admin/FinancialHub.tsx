import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ArrowUpRight, ArrowDownLeft, Download, Filter, Search, 
  CreditCard, Wallet, AlertCircle, RefreshCw, Loader2, Plus
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Card } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
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

export function FinancialHub() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [processingPayout, setProcessingPayout] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'revenue' | 'payouts' | 'failed' | null>(null);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  useEffect(() => {
    fetchTransactions();
    fetchAffiliates();
  }, []);

  const chartData = React.useMemo(() => {
    const data: Record<string, { month: string; revenue: number; payouts: number; sortTime: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      if (isNaN(date.getTime())) return;

      // Group by Year-Month to handle multi-year data correctly, but display Month
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!data[key]) {
        data[key] = { 
          month: months[date.getMonth()], 
          revenue: 0, 
          payouts: 0,
          sortTime: date.getTime()
        };
      }

      const amount = Number(tx.amount) || 0;
      if (tx.type === 'Payout') {
        data[key].payouts += amount;
      } else if (tx.status !== 'Failed') {
        // Assume all non-payout non-failed transactions count as revenue volume
        data[key].revenue += amount;
      }
    });

    return Object.values(data)
      .sort((a, b) => a.sortTime - b.sortTime)
      .map(({ month, revenue, payouts }) => ({ month, revenue, payouts }));
  }, [transactions]);

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

  const fetchAffiliates = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/affiliates`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setAffiliates(data.affiliates || []);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    }
  };

  const handleProcessPayout = async (affiliateId: string) => {
    setProcessingPayout(affiliateId);
    try {
      const response = await fetch(`${API_URL}/admin/affiliates/${affiliateId}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (!response.ok) throw new Error('Payout failed');
      
      toast.success('Payout processed successfully');
      fetchAffiliates(); // Refresh list
      fetchTransactions(); // Refresh transactions
    } catch (error) {
      toast.error('Failed to process payout');
    } finally {
      setProcessingPayout(null);
    }
  };

  const handleBatchPayout = async () => {
    if (!confirm('Are you sure you want to process all pending payouts?')) return;
    
    setIsProcessingBatch(true);
    try {
      const response = await fetch(`${API_URL}/admin/affiliates/pay-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.message === 'No pending payouts to process') {
             toast.info(data.message);
             return;
        }
        throw new Error('Batch payout failed');
      }
      
      toast.success(data.message || 'Batch payout processed successfully');
      fetchAffiliates();
      fetchTransactions();
    } catch (error) {
      console.error(error);
      toast.error('Failed to process batch payout');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleExportReport = () => {
    if (transactions.length === 0) {
        toast.error("No data to export");
        return;
    }
    
    const headers = ["ID", "Business", "Type", "Amount", "Status", "Date"];
    const csvContent = [
        headers.join(","),
        ...transactions.map(t => [t.id, t.business, t.type, t.amount, t.status, t.date].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report exported");
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

  // Calculations
  const totalVolume = transactions.reduce((sum, tx) => sum + (tx.type !== 'Payout' ? (Number(tx.amount) || 0) : 0), 0);
  const platformRevenue = Math.floor(totalVolume * 0.10); 
  const pendingPayouts = affiliates.reduce((sum, aff) => sum + (Number(aff.pending_balance) || 0), 0);
  const failedTransactions = transactions.filter(tx => tx.status === 'Failed');
  const failedAmount = failedTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  // Drill down content renderer
  const renderDrillDownContent = () => {
    switch (selectedMetric) {
      case 'volume': {
        const volumeTransactions = transactions.filter(tx => tx.type !== 'Payout');
        return (
          <>
            <DialogHeader>
              <DialogTitle>Total Volume Details</DialogTitle>
              <DialogDescription>
                All incoming transactions contributing to total volume.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                    <th className="px-4 py-3 font-medium">Business</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volumeTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-600">{tx.id}</td>
                      <td className="px-4 py-3 text-slate-900">{tx.business}</td>
                      <td className="px-4 py-3 text-slate-600">{tx.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-right">
                        R {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {volumeTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No volume records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
      }
      case 'revenue': {
        const revenueTransactions = transactions.filter(tx => tx.type !== 'Payout');
        return (
          <>
            <DialogHeader>
              <DialogTitle>Platform Revenue Breakdown</DialogTitle>
              <DialogDescription>
                Estimated 10% revenue share from total volume.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Source Transaction</th>
                    <th className="px-4 py-3 font-medium">Business</th>
                    <th className="px-4 py-3 font-medium text-right">Transaction Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Revenue (10%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revenueTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-600">{tx.id}</td>
                      <td className="px-4 py-3 text-slate-900">{tx.business}</td>
                      <td className="px-4 py-3 text-slate-600 text-right">R {tx.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-green-600 text-right">
                        R {Math.floor(tx.amount * 0.10).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {revenueTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No revenue records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
      }
      case 'payouts': {
        const pendingAffiliates = affiliates.filter(aff => (Number(aff.pending_balance) || 0) > 0);
        return (
          <>
            <DialogHeader>
              <DialogTitle>Pending Payouts</DialogTitle>
              <DialogDescription>
                Affiliates with outstanding balances ready for payout.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Affiliate Name</th>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Bank Details</th>
                    <th className="px-4 py-3 font-medium text-right">Pending Balance</th>
                    <th className="px-4 py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingAffiliates.map((aff) => (
                    <tr key={aff.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{aff.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{aff.code}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {aff.bank_details?.bank_name ? (
                          <span>{aff.bank_details.bank_name} - ...{aff.bank_details.account_number?.slice(-4)}</span>
                        ) : (
                          <span className="text-red-500">Missing Info</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 text-right">
                        R {aff.pending_balance?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => {
                            handleProcessPayout(aff.id);
                            // Keep dialog open or close it? Let's keep it open to process more.
                          }}
                          disabled={processingPayout === aff.id}
                        >
                          {processingPayout === aff.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Pay'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {pendingAffiliates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No pending payouts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
      }
      case 'failed': {
        const failedTx = transactions.filter(tx => tx.status === 'Failed');
        return (
          <>
            <DialogHeader>
              <DialogTitle>Failed Transactions</DialogTitle>
              <DialogDescription>
                Transactions that could not be processed and require attention.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {failedTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-600">{tx.id}</td>
                      <td className="px-4 py-3 text-slate-600">{tx.type}</td>
                      <td className="px-4 py-3 text-slate-600">{tx.date}</td>
                      <td className="px-4 py-3 font-bold text-red-600 text-right">
                        R {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Failed
                        </span>
                      </td>
                    </tr>
                  ))}
                  {failedTx.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No failed transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
      }
      default:
        return null;
    }
  };

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
          <Button variant="outline" className="gap-2" onClick={handleExportReport}>
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button 
            className="bg-cyan-600 text-white hover:bg-cyan-700 gap-2"
            onClick={handleBatchPayout}
            disabled={isProcessingBatch || pendingPayouts <= 0}
          >
            {isProcessingBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Process Payouts
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="p-6 border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-blue-200"
          onClick={() => setSelectedMetric('volume')}
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm">Total Volume</p>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            R {totalVolume.toLocaleString()}
          </h3>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-1" /> +12% this month
          </p>
        </Card>

        <Card 
          className="p-6 border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-green-200"
          onClick={() => setSelectedMetric('revenue')}
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm">Platform Revenue</p>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            R {platformRevenue.toLocaleString()}
          </h3>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-1" /> +8.5% this month
          </p>
        </Card>

        <Card 
          className="p-6 border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-orange-200"
          onClick={() => setSelectedMetric('payouts')}
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm">Pending Payouts</p>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            R {pendingPayouts.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Next batch: Friday 12PM
          </p>
        </Card>

        <Card 
          className="p-6 border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all hover:border-red-200"
          onClick={() => setSelectedMetric('failed')}
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm">Failed Transactions</p>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            R {failedAmount.toLocaleString()}
          </h3>
          <p className="text-xs text-red-600 flex items-center mt-1">
            <ArrowDownLeft className="w-3 h-3 mr-1" /> {failedTransactions.length} requires attention
          </p>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 mb-6 rounded-lg w-full sm:w-auto flex">
          <TabsTrigger value="transactions" className="flex-1 sm:flex-none">Transactions</TabsTrigger>
          <TabsTrigger value="payouts" className="flex-1 sm:flex-none">Payouts</TabsTrigger>
          <TabsTrigger value="affiliates" className="flex-1 sm:flex-none">Affiliates</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 sm:flex-none">Revenue Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates">
          <Card className="border-slate-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Affiliate Management</h3>
                <Button variant="outline" onClick={fetchAffiliates} size="sm">
                   <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Affiliate Name</th>
                      <th className="px-6 py-4 font-medium">Code</th>
                      <th className="px-6 py-4 font-medium">Bank Details</th>
                      <th className="px-6 py-4 font-medium">Biz Referrals</th>
                      <th className="px-6 py-4 font-medium">App Downloads</th>
                      <th className="px-6 py-4 font-medium">Pending Payout</th>
                      <th className="px-6 py-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {affiliates.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No affiliates found.</td>
                        </tr>
                    ) : affiliates.map((aff) => (
                      <tr key={aff.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                            {aff.name}
                            <div className="text-xs text-slate-500">{aff.email}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 bg-slate-100 rounded w-fit px-2 py-1">{aff.code}</td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                            {aff.bank_details?.bank_name ? (
                                <>
                                    <div className="font-bold">{aff.bank_details.bank_name}</div>
                                    <div>{aff.bank_details.account_number}</div>
                                    <div>{aff.bank_details.branch_code}</div>
                                </>
                            ) : (
                                <span className="text-red-500 italic">Missing Details</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-slate-900 text-center font-bold">{aff.total_referrals}</td>
                        <td className="px-6 py-4 text-slate-900 text-center font-bold text-purple-600">{aff.app_downloads || 0}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">R {aff.pending_balance?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4">
                           {aff.pending_balance > 0 ? (
                               <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleProcessPayout(aff.id)}
                                    disabled={processingPayout === aff.id || !aff.bank_details?.bank_name}
                                >
                                    {processingPayout === aff.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now'}
                                </Button>
                           ) : (
                               <span className="text-slate-400 text-xs italic">No pending balance</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </Card>
        </TabsContent>

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
                <BarChart data={chartData}>
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

      {/* Drill Down Modal */}
      <Dialog open={!!selectedMetric} onOpenChange={(open) => !open && setSelectedMetric(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {renderDrillDownContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
