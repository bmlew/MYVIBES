import React, { useState, useEffect } from 'react';
import { Share2, DollarSign, Users, ChevronLeft, Building, CreditCard, Wallet, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface AffiliatePortalProps {
  onBack?: () => void;
}

interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  bank_details: {
    bank_name: string;
    account_number: string;
    branch_code: string;
  };
  pending_balance: number;
  total_earnings: number;
  paid_earnings: number;
  total_referrals: number;
  app_downloads?: number;
}

interface Commission {
  id: string;
  business_name: string;
  amount: number;
  status: string;
  date: string;
  type: string;
}

export function AffiliatePortal({ onBack }: AffiliatePortalProps) {
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    bank_name: '',
    account_number: '',
    branch_code: ''
  });

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/affiliates/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ email: loginEmail })
      });

      if (!response.ok) throw new Error('Partner not found');

      const data = await response.json();
      setAffiliate(data.affiliate);
      setView('dashboard');
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Login failed. Please check your email or register.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/affiliates/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify(regData)
      });

      if (!response.ok) throw new Error('Registration failed');

      const data = await response.json();
      setAffiliate(data.affiliate);
      setView('dashboard');
      toast.success('Registration successful!');
    } catch (error) {
      toast.error('Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'dashboard' && affiliate) {
    return <AffiliateDashboard affiliate={affiliate} onLogout={() => setView('login')} API_URL={API_URL} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4">
          <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      )}

      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Partner & Influencer Portal</h1>
          <p className="text-slate-500">Earn revenue by referring businesses or promoting the app to your followers.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${view === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            onClick={() => setView('login')}
          >
            Sign In
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${view === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            onClick={() => setView('register')}
          >
            Join Now
          </button>
        </div>

        {view === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <Input 
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <Input 
                value={regData.name}
                onChange={(e) => setRegData({...regData, name: e.target.value})}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <Input 
                type="email"
                value={regData.email}
                onChange={(e) => setRegData({...regData, email: e.target.value})}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <Input 
                value={regData.phone}
                onChange={(e) => setRegData({...regData, phone: e.target.value})}
                placeholder="+27..."
              />
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Bank Details (For Payouts)
              </h3>
              <div className="space-y-3">
                <Input 
                  placeholder="Bank Name" 
                  value={regData.bank_name}
                  onChange={(e) => setRegData({...regData, bank_name: e.target.value})}
                  required
                />
                <Input 
                  placeholder="Account Number" 
                  value={regData.account_number}
                  onChange={(e) => setRegData({...regData, account_number: e.target.value})}
                  required
                />
                <Input 
                  placeholder="Branch Code" 
                  value={regData.branch_code}
                  onChange={(e) => setRegData({...regData, branch_code: e.target.value})}
                  required
                />
              </div>
            </div>

            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Affiliate Account'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function AffiliateDashboard({ affiliate, onLogout, API_URL }: { affiliate: Affiliate, onLogout: () => void, API_URL: string }) {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [copied, setCopied] = useState(false);
  const [bankDetails, setBankDetails] = useState(affiliate.bank_details);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, [affiliate.id]);

  const fetchCommissions = async () => {
    try {
      const response = await fetch(`${API_URL}/affiliates/${affiliate.id}/commissions`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      setCommissions(data.commissions || []);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(affiliate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Affiliate code copied!');
  };

  const saveBankDetails = async () => {
    setSavingBank(true);
    try {
      const response = await fetch(`${API_URL}/affiliates/${affiliate.id}/bank-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify(bankDetails)
      });
      if (!response.ok) throw new Error('Failed to update');
      setIsEditingBank(false);
      toast.success('Bank details updated');
    } catch (error) {
      toast.error('Failed to update bank details');
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Share2 className="w-6 h-6 text-cyan-600" />
            <span className="font-bold text-lg text-slate-900">Affiliate Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {affiliate.name}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>Sign Out</Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-none shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Pending Payout</p>
                <h3 className="text-3xl font-bold mt-1">R {affiliate.pending_balance.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-cyan-100 text-xs">Payouts are processed monthly</p>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Earnings</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-900">R {affiliate.total_earnings.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-slate-500 text-xs">Total paid out: R {affiliate.paid_earnings.toLocaleString()}</p>
          </Card>

          <Card className="p-6">
             <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium">App Downloads</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-900">{affiliate.app_downloads || 0}</h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-slate-500 text-xs">Referral Code: <span className="font-mono font-bold">{affiliate.code}</span></p>
          </Card>

          <Card className="p-6">
             <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium">Biz Referrals</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-900">{affiliate.total_referrals}</h3>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building className="w-6 h-6 text-orange-600" />
              </div>
            </div>
             <div className="flex items-center gap-2 bg-slate-100 p-2 rounded text-sm text-slate-700">
                <span className="font-mono font-bold tracking-widest flex-1">{affiliate.code}</span>
                <button onClick={copyCode} className="hover:text-cyan-600">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
             </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Earnings History */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Earnings History</h3>
                {commissions.length === 0 ? (
                    <Card className="p-8 text-center text-slate-500 border-dashed">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p>No commissions yet. Start referring businesses!</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {commissions.map((comm) => (
                            <Card key={comm.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${comm.type === 'Subscription' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                        <Building className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{comm.business_name}</h4>
                                        <p className="text-xs text-slate-500">{comm.type} • {new Date(comm.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">+ R {comm.amount.toLocaleString()}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${comm.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {comm.status}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Bank Details */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Payout Details</h3>
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-slate-500" />
                            <span className="font-semibold text-slate-700">Bank Account</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-cyan-600"
                            onClick={() => isEditingBank ? saveBankDetails() : setIsEditingBank(true)}
                            disabled={savingBank}
                        >
                            {isEditingBank ? 'Save' : 'Edit'}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs uppercase text-slate-400 font-bold mb-1 block">Bank Name</label>
                            {isEditingBank ? (
                                <Input value={bankDetails.bank_name} onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})} />
                            ) : (
                                <p className="font-medium text-slate-900">{bankDetails.bank_name}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase text-slate-400 font-bold mb-1 block">Account Number</label>
                            {isEditingBank ? (
                                <Input value={bankDetails.account_number} onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})} />
                            ) : (
                                <p className="font-medium text-slate-900">{bankDetails.account_number}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs uppercase text-slate-400 font-bold mb-1 block">Branch Code</label>
                            {isEditingBank ? (
                                <Input value={bankDetails.branch_code} onChange={(e) => setBankDetails({...bankDetails, branch_code: e.target.value})} />
                            ) : (
                                <p className="font-medium text-slate-900">{bankDetails.branch_code}</p>
                            )}
                        </div>
                    </div>
                </Card>
                
                <Card className="p-6 bg-slate-800 text-slate-300">
                    <h4 className="text-white font-bold mb-2">How it works</h4>
                    <ul className="text-sm space-y-2 list-disc list-inside">
                        <li>Share your unique code with businesses.</li>
                        <li>They get a discount (optional) or you get credit.</li>
                        <li>You earn 10% on every monthly subscription payment they make.</li>
                        <li>Payouts are processed at the end of each month.</li>
                    </ul>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
