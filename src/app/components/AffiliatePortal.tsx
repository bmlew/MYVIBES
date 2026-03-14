import React, { useState, useEffect } from 'react';
import { Share2, DollarSign, Users, ChevronLeft, Building, CreditCard, Wallet, Copy, Check, Bell, MapPin, LogOut, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getReferralLink, getBusinessReferralLink, getCustomerReferralLink } from '/src/config/app';

interface AffiliatePortalProps {
  onBack?: () => void;
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
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

export function AffiliatePortal({ onBack, user }: AffiliatePortalProps) {
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
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

  const getAuthHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    // Authorization: Always Supabase JWT (User or Anon)
    let authBearer = `Bearer ${publicAnonKey}`;
    try {
      const stored = localStorage.getItem(`sb-${projectId}-auth-token`);
      if (stored) {
        const session = JSON.parse(stored);
        if (session.access_token) authBearer = `Bearer ${session.access_token}`;
      }
    } catch (e) {}
    headers['Authorization'] = authBearer;

    // Custom Partner Token
    const localToken = localStorage.getItem('vibespot_session_token');
    if (localToken) {
        headers['X-Session-Token'] = localToken;
    }
    
    return headers;
  };

  const handleAutoJoin = async () => {
    console.log("👆 'Enter Partner Portal' clicked", user);

    if (!user?.email) {
      toast.error("Email address missing. Please complete your details.");
      setRegData({
          ...regData,
          name: user?.name || '',
          phone: user?.phone || ''
      });
      setView('register');
      return;
    }
    
    setLoading(true);

    try {
      // 1. Try to login first (check if affiliate exists)
      console.log("🔍 Checking for existing affiliate account...");
      const headers = getAuthHeaders();
      const loginResponse = await fetch(`${API_URL}/partners/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: user.email })
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        console.log("✅ Partner found:", data.affiliate);
        setAffiliate(data.affiliate);
        
        // Save token if new session
        if (data.token) {
             localStorage.setItem('vibespot_session_token', data.token);
             setSessionToken(data.token);
             console.log('🔑 Saved new session token:', data.token);
        }
        
        setView('dashboard');
        toast.success('Welcome back to your partner dashboard!');
        return;
      }

      // 2. If not found, register automatically
      console.log("📝 Creating new partner account...");
      
      const partnerName = user.name || user.email.split('@')[0];
      
      const registerResponse = await fetch(`${API_URL}/partners/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: partnerName,
          email: user.email,
          phone: user.phone || '',
          bank_name: '', // User can add later
          account_number: '',
          branch_code: ''
        })
      });

      if (registerResponse.ok) {
        const data = await registerResponse.json();
        console.log("🎉 Partner created:", data.affiliate);
        setAffiliate(data.affiliate);
        
        // Save token if new session
        if (data.token) {
             localStorage.setItem('vibespot_session_token', data.token);
             setSessionToken(data.token);
             console.log('🔑 Saved new session token:', data.token);
        }
        
        setView('dashboard');
        toast.success('Partner account created successfully!');
      } else {
        const errorData = await registerResponse.json();
        console.warn("⚠️ Automatic registration failed:", errorData);
        throw new Error(errorData.error || 'Automatic registration failed');
      }

    } catch (error) {
      console.error('❌ Auto-join error:', error);
      toast.info("Please verify your details to continue.");
      // Pre-fill manual form on error
       setRegData({
            ...regData,
            name: user.name,
            email: user.email,
            phone: user.phone || ''
        });
        setView('register');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/partners/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: loginEmail })
      });

      if (!response.ok) throw new Error('Partner not found');

      const data = await response.json();
      setAffiliate(data.affiliate);
      
      // Save token if new session
      if (data.token) {
           localStorage.setItem('vibespot_session_token', data.token);
           setSessionToken(data.token);
           console.log('🔑 Saved new session token:', data.token);
      }
        
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
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/partners/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify(regData)
      });

      if (!response.ok) throw new Error('Registration failed');

      const data = await response.json();
      setAffiliate(data.affiliate);
      
      // Save token if new session
      if (data.token) {
           localStorage.setItem('vibespot_session_token', data.token);
           setSessionToken(data.token);
           console.log('🔑 Saved new session token:', data.token);
      }
      
      setView('dashboard');
      toast.success('Registration successful!');
    } catch (error) {
      toast.error('Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'dashboard' && affiliate) {
    return <AffiliateDashboard affiliate={affiliate} onLogout={() => setView('login')} onBack={onBack} API_URL={API_URL} sessionToken={sessionToken} />;
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

        {user ? (
          <div className="text-center space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="text-lg font-bold text-slate-900">Continue as {user.name}</h3>
              <p className="text-slate-500 text-sm mb-6">{user.email}</p>
              
              <Button 
                onClick={handleAutoJoin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-6 text-lg shadow-lg shadow-cyan-500/20"
              >
                {loading ? 'Accessing Portal...' : 'Enter Partner Portal'}
              </Button>
              <p className="text-xs text-slate-400 mt-4">
                By entering, you agree to our affiliate terms and conditions.
              </p>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

function AffiliateDashboard({ affiliate, onLogout, onBack, API_URL, sessionToken }: { affiliate: Affiliate, onLogout: () => void, onBack?: () => void, API_URL: string, sessionToken: string | null }) {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [copied, setCopied] = useState(false);
  const [bankDetails, setBankDetails] = useState(affiliate.bank_details);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  const getAuthHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    // Authorization: Always Supabase JWT (User or Anon)
    let authBearer = `Bearer ${publicAnonKey}`;
    try {
      const stored = localStorage.getItem(`sb-${projectId}-auth-token`);
      if (stored) {
        const session = JSON.parse(stored);
        if (session.access_token) authBearer = `Bearer ${session.access_token}`;
      }
    } catch (e) {}
    headers['Authorization'] = authBearer;

    // Custom Partner Token
    // Prioritize the prop passed from parent (sessionToken), then local storage
    const customToken = sessionToken || localStorage.getItem('vibespot_session_token');
    if (customToken) {
        headers['X-Session-Token'] = customToken;
    }
    
    return headers;
  };

  useEffect(() => {
    fetchCommissions();
  }, [affiliate.id]);

  const fetchCommissions = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/partners/${affiliate.id}/commissions`, {
        headers
      });
      
      if (!response.ok) {
        // Silently handle if endpoint doesn't exist yet
        if (response.status === 404) {
          console.log('Commissions endpoint not available yet');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCommissions(data.commissions || []);
    } catch (error) {
      console.log('Affiliates endpoint not available (404)');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackErr) {
        console.error('Failed to copy:', err);
        return false;
      }
    }
  };

  const copyCode = async () => {
    const success = await copyToClipboard(affiliate.code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Affiliate code copied!');
    } else {
      toast.error('Failed to copy code');
    }
  };

  const saveBankDetails = async () => {
    setSavingBank(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/partners/${affiliate.id}/bank-details`, {
        method: 'PUT',
        headers,
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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-2 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex justify-between items-center mb-6">
            {onBack && (
                <Button variant="ghost" onClick={onBack} size="sm" className="flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                </Button>
            )}
            <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-cyan-600" />
                <h2 className="text-lg font-bold text-slate-900">Affiliate Portal</h2>
            </div>
            <div className="w-16" /> {/* Spacer for alignment */}
        </div>
        
        <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                {affiliate.name.charAt(0).toUpperCase()}
             </div>
             <div>
                 <div className="text-xs text-slate-500">Welcome,</div>
                 <div className="font-semibold text-slate-900 leading-tight">{affiliate.name}</div>
             </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Horizontal Scroll Stats */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory flex gap-4 scrollbar-hide">
          {/* Card 1: Pending Payout */}
          <div className="snap-center shrink-0 w-[140px] h-[240px] bg-gradient-to-b from-[#00A3FF] to-[#0066FF] rounded-[32px] p-5 flex flex-col justify-between text-white relative shadow-lg shadow-blue-200">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
             <div>
                <p className="text-xs font-medium text-blue-100 leading-tight mb-1">Pending<br/>Payout</p>
                <h3 className="text-2xl font-bold tracking-tight">R {affiliate.pending_balance.toLocaleString()}</h3>
             </div>
             <div className="text-[10px] leading-tight text-blue-100 opacity-80">
                Payouts are processed monthly
             </div>
          </div>

          {/* Card 2: Total Earnings */}
          <div className="snap-center shrink-0 w-[140px] h-[240px] bg-white rounded-[32px] p-5 flex flex-col justify-between text-slate-900 shadow-sm border border-slate-100">
             <div>
                <p className="text-xs font-medium text-slate-500 leading-tight mb-1">Total<br/>Earnings</p>
                <h3 className="text-2xl font-bold tracking-tight">R {affiliate.total_earnings.toLocaleString()}</h3>
             </div>
             <div className="text-[10px] leading-tight text-slate-400">
                Total paid out:<br/>R {affiliate.paid_earnings.toLocaleString()}
             </div>
          </div>

          {/* Card 3: Customer Referrals */}
          <div className="snap-center shrink-0 w-[140px] h-[240px] bg-white rounded-[32px] p-5 flex flex-col justify-between text-slate-900 shadow-sm border border-slate-100">
             <div>
                <p className="text-xs font-medium text-slate-500 leading-tight mb-1">Customer<br/>Referrals</p>
                <h3 className="text-2xl font-bold tracking-tight">{affiliate.total_customer_referrals || 0}</h3>
             </div>
             <div>
                 <div className="text-[10px] text-slate-400 mb-1">App Downloads:</div>
                 <div className="text-lg font-bold text-green-600">{affiliate.app_downloads || 0}</div>
             </div>
          </div>

           {/* Card 4: Business Referrals */}
           <div className="snap-center shrink-0 w-[140px] h-[240px] bg-white rounded-[32px] p-5 flex flex-col justify-between text-slate-900 shadow-sm border border-slate-100">
             <div>
                <p className="text-xs font-medium text-slate-500 leading-tight mb-1">Business<br/>Referrals</p>
                <h3 className="text-2xl font-bold tracking-tight">{affiliate.total_business_referrals || 0}</h3>
             </div>
              <div>
                 <div className="text-[10px] text-slate-400 mb-1">Your Universal Code:</div>
                 <button 
                   onClick={copyCode}
                   className="text-xs font-mono font-bold bg-cyan-100 px-2 py-1 rounded flex items-center gap-1 text-cyan-700 hover:bg-cyan-200 w-full justify-between"
                 >
                     {affiliate.code}
                     {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                 </button>
             </div>
          </div>
        </div>

        {/* Promote & Earn: Two Referral Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Business Referral Card */}
          <div className="bg-gradient-to-br from-[#0EA5E9] to-[#0066FF] rounded-[32px] p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
             
             <h3 className="text-xl font-bold mb-2 relative z-10 flex items-center gap-2">
               <Building className="w-6 h-6" />
               Business Referrals
             </h3>
             <p className="text-sm text-blue-100 mb-6 relative z-10">
                Send this link to business owners. It takes them directly to the business registration page with your affiliate code pre-filled. Earn <strong className="text-white">commission on their subscription</strong>!
             </p>

             <div className="flex flex-col gap-3 relative z-10">
                 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                     <p className="text-[10px] uppercase tracking-wider text-blue-200 mb-1">Business Registration Link</p>
                     <p className="font-mono font-bold text-sm break-all">{getBusinessReferralLink(affiliate.code)}</p>
                 </div>
                 <Button 
                    onClick={async () => {
                        const link = getBusinessReferralLink(affiliate.code);
                        const success = await copyToClipboard(link);
                        if (success) {
                          toast.success('Business referral link copied!');
                        }
                    }}
                    className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl px-6 font-bold shadow-sm h-auto py-3 w-full"
                 >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Business Link
                  </Button>
             </div>

             <div className="mt-4 relative z-10">
                <p className="text-xs text-blue-100 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
                    Business clicks → Registration page opens → Code auto-fills → You earn!
                </p>
             </div>
          </div>

          {/* Customer App Download Card */}
          <div className="bg-gradient-to-r from-[#D946EF] to-[#EC4899] rounded-[32px] p-6 text-white shadow-lg shadow-pink-200 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
             
             <h3 className="text-xl font-bold mb-2 relative z-10 flex items-center gap-2">
               <Smartphone className="w-6 h-6" />
               Customer App Downloads
             </h3>
             <p className="text-sm text-pink-100 mb-6 relative z-10">
                Share on social media. When customers download the app and create an account, you earn <strong className="text-white">R20</strong> per signup + <strong className="text-white">R200</strong> every 100 check-ins!
             </p>

             <div className="flex flex-col gap-3 relative z-10">
                 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                     <p className="text-[10px] uppercase tracking-wider text-pink-200 mb-1">Customer App Download Link</p>
                     <p className="font-mono font-bold text-sm break-all">{getCustomerReferralLink(affiliate.code)}</p>
                 </div>
                 <Button 
                    onClick={async () => {
                        const link = getCustomerReferralLink(affiliate.code);
                        const success = await copyToClipboard(link);
                        if (success) {
                          toast.success('Customer referral link copied!');
                        }
                    }}
                    className="bg-white text-pink-600 hover:bg-pink-50 rounded-xl px-6 font-bold shadow-sm h-auto py-3 w-full"
                 >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Customer Link
                  </Button>
             </div>

             <div className="mt-4 relative z-10">
                <p className="text-xs text-pink-100 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
                    Customers click → Download app → Create account → You get credited!
                </p>
             </div>
          </div>

        </div>

        {/* Bottom Split Section */}
        <div className="grid grid-cols-2 gap-4">
            
            {/* Left: Earnings Empty State / List */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100 flex flex-col items-center text-center justify-center min-h-[300px]">
                {commissions.length === 0 ? (
                    <>
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <DollarSign className="w-6 h-6 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">No earnings yet</h4>
                        <p className="text-xs text-slate-500 leading-relaxed px-1">
                            Start referring businesses to see your commissions appear here.
                        </p>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col justify-start">
                         <h4 className="text-sm font-bold text-slate-900 mb-4 text-left">Recent Activity</h4>
                         <div className="space-y-3 overflow-y-auto max-h-[250px] -mr-2 pr-2">
                             {commissions.map((comm) => (
                                 <div key={comm.id} className="text-left bg-slate-50 p-3 rounded-xl">
                                     <div className="text-xs font-bold text-slate-900 truncate">{comm.business_name}</div>
                                     <div className="flex justify-between items-center mt-1">
                                         <span className="text-[10px] text-slate-500">{new Date(comm.date).toLocaleDateString()}</span>
                                         <span className="text-xs font-bold text-green-600">+R{comm.amount}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
            </div>

            {/* Right: Bank Account Card */}
            <div className="bg-[#0F172A] rounded-[32px] p-6 flex flex-col text-white relative overflow-hidden min-h-[300px]">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                 
                 <div className="relative z-10 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-1">
                             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-2">
                                <CreditCard className="w-4 h-4 text-white/70" />
                             </div>
                             <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Linked<br/>Account</span>
                        </div>
                        {isEditingBank && (
                            <button onClick={() => setIsEditingBank(false)} className="text-[10px] text-white/60 underline">Cancel</button>
                        )}
                     </div>

                     {isEditingBank ? (
                        <div className="space-y-3 mt-auto">
                            <Input 
                                placeholder="Bank" 
                                className="bg-white/10 border-transparent text-white text-xs h-8 px-2 placeholder:text-white/30"
                                value={bankDetails.bank_name}
                                onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
                            />
                             <Input 
                                placeholder="Acc #" 
                                className="bg-white/10 border-transparent text-white text-xs h-8 px-2 placeholder:text-white/30"
                                value={bankDetails.account_number}
                                onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})}
                            />
                             <Input 
                                placeholder="Branch" 
                                className="bg-white/10 border-transparent text-white text-xs h-8 px-2 placeholder:text-white/30"
                                value={bankDetails.branch_code}
                                onChange={(e) => setBankDetails({...bankDetails, branch_code: e.target.value})}
                            />
                            <Button size="sm" onClick={saveBankDetails} disabled={savingBank} className="w-full bg-cyan-500 hover:bg-cyan-400 h-8 text-xs">
                                {savingBank ? 'Saving...' : 'Save Details'}
                            </Button>
                        </div>
                     ) : (
                         <div className="mt-auto flex flex-col gap-4">
                            {bankDetails.bank_name ? (
                                <>
                                    <div>
                                        <div className="text-[10px] text-white/40 uppercase mb-1">Bank</div>
                                        <div className="font-bold text-lg leading-none">{bankDetails.bank_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-white/40 uppercase mb-1">Account</div>
                                        <div className="font-mono text-sm tracking-wider opacity-80">
                                            •••• {bankDetails.account_number.slice(-4)}
                                        </div>
                                    </div>
                                     <Button 
                                        variant="outline" 
                                        onClick={() => setIsEditingBank(true)}
                                        className="w-full border-white/20 text-white bg-transparent hover:bg-white/10 text-xs h-8"
                                    >
                                        Edit Details
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h4 className="text-xl font-bold leading-tight">No Bank<br/>Linked</h4>
                                    <p className="text-[10px] text-white/50 leading-relaxed">
                                        Link your bank account to receive payouts.
                                    </p>
                                    <Button 
                                        onClick={() => setIsEditingBank(true)}
                                        className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs h-9 rounded-xl"
                                    >
                                        Link Account
                                    </Button>
                                </>
                            )}
                         </div>
                     )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}