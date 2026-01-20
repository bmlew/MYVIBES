import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { User, Mail, Phone, Building2, DollarSign, Users, TrendingUp, Clock, CheckCircle, XCircle, Copy, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface AffiliatePortalProps {
  onBack?: () => void;
}

export function AffiliatePortal({ onBack }: AffiliatePortalProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'dashboard'>('register');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Registration Form
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    experience: ''
  });

  // Login Form
  const [loginData, setLoginData] = useState({
    email: '',
    code: ''
  });

  // Dashboard Data
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);

  useEffect(() => {
    // Check if already logged in
    const storedAffiliateId = localStorage.getItem('affiliate_id');
    if (storedAffiliateId) {
      loadAffiliateDashboard(storedAffiliateId);
    }
  }, []); // Only run once on mount

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.name || !registerData.email || !registerData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/affiliates/register`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registerData)
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Registration successful! Your affiliate code is: ${data.affiliate.code}\n\nYour application is pending approval. You'll be notified once approved.`);
        
        // Reset form
        setRegisterData({
          name: '',
          email: '',
          phone: '',
          company: '',
          website: '',
          experience: ''
        });
        
        // Switch to login tab
        setActiveTab('login');
        setLoginData({ email: registerData.email, code: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.code) {
      alert('Please enter both email and affiliate code');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/affiliates/login`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData)
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('affiliate_id', data.affiliate.id);
        localStorage.setItem('affiliate_code', data.affiliate.code);
        localStorage.setItem('affiliate_name', data.affiliate.name);
        
        setAffiliateData(data.affiliate);
        setActiveTab('dashboard');
        
        // Load commission data
        loadCommissions(data.affiliate.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAffiliateDashboard = async (affiliateId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/affiliates/${affiliateId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAffiliateData(data.affiliate);
        setActiveTab('dashboard');
        loadCommissions(affiliateId);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadCommissions = async (affiliateId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/affiliates/${affiliateId}/commissions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCommissions(data.commissions || []);
      }
    } catch (error) {
      console.error('Error loading commissions:', error);
    }
  };

  const copyAffiliateCode = () => {
    if (affiliateData?.code) {
      navigator.clipboard.writeText(affiliateData.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('affiliate_id');
    localStorage.removeItem('affiliate_code');
    localStorage.removeItem('affiliate_name');
    setAffiliateData(null);
    setCommissions([]);
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-600 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 lg:p-12 text-white flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-12 h-12" />
                <h1 className="text-4xl font-bold">MYVIBE</h1>
              </div>
              <p className="text-xl opacity-90">Affiliate Program</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">10% Recurring Commission</h3>
                  <p className="text-sm opacity-90">Earn R49.90 monthly per business (R499 subscription)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Unlimited Referrals</h3>
                  <p className="text-sm opacity-90">No cap on how many businesses you can refer</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Passive Income</h3>
                  <p className="text-sm opacity-90">Earn monthly as long as businesses stay subscribed</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mt-8">
                <p className="text-sm mb-2 opacity-90">💡 Example Earnings:</p>
                <p className="text-2xl font-bold">10 businesses = R499/month</p>
                <p className="text-2xl font-bold">50 businesses = R2,495/month</p>
                <p className="text-2xl font-bold">100 businesses = R4,990/month</p>
              </div>
            </div>
          </div>

          {/* Right Side - Forms/Dashboard */}
          <div className="p-8 lg:p-12">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>

              {/* Register Tab */}
              <TabsContent value="register">
                <h2 className="text-2xl font-bold mb-2">Become an Affiliate</h2>
                <p className="text-gray-600 mb-6">Join our program and start earning today</p>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        placeholder="+27 11 123 4567"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Company/Organization (Optional)</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="company"
                        placeholder="Your company name"
                        value={registerData.company}
                        onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website/Social Media (Optional)</Label>
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      value={registerData.website}
                      onChange={(e) => setRegisterData({ ...registerData, website: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience">Why do you want to become an affiliate?</Label>
                    <textarea
                      id="experience"
                      placeholder="Tell us about your network and experience..."
                      value={registerData.experience}
                      onChange={(e) => setRegisterData({ ...registerData, experience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent min-h-[100px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Apply to Join'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Applications are typically reviewed within 24-48 hours
                  </p>
                </form>
              </TabsContent>

              {/* Login Tab */}
              <TabsContent value="login">
                <h2 className="text-2xl font-bold mb-2">Affiliate Login</h2>
                <p className="text-gray-600 mb-6">Access your affiliate dashboard</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-code">Affiliate Code</Label>
                    <Input
                      id="login-code"
                      placeholder="e.g., JOHM2026"
                      value={loginData.code}
                      onChange={(e) => setLoginData({ ...loginData, code: e.target.value.toUpperCase() })}
                      className="font-mono"
                      maxLength={10}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Register now
                    </button>
                  </p>
                </form>
              </TabsContent>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard">
                {affiliateData ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Welcome back, {affiliateData.name}!</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            affiliateData.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : affiliateData.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {affiliateData.status === 'approved' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                            {affiliateData.status === 'pending' && <Clock className="w-4 h-4 inline mr-1" />}
                            {affiliateData.status === 'rejected' && <XCircle className="w-4 h-4 inline mr-1" />}
                            {affiliateData.status.charAt(0).toUpperCase() + affiliateData.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleLogout}>
                        Logout
                      </Button>
                    </div>

                    {/* Affiliate Code */}
                    <Card className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
                      <Label className="text-sm text-gray-600 mb-2 block">Your Affiliate Code</Label>
                      <div className="flex items-center gap-3">
                        <code className="text-3xl font-bold font-mono text-blue-600">
                          {affiliateData.code}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyAffiliateCode}
                          className="flex items-center gap-2"
                        >
                          {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedCode ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Share this code with businesses to earn commissions
                      </p>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">Referrals</span>
                        </div>
                        <p className="text-2xl font-bold">{affiliateData.total_referrals || 0}</p>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">Total Earned</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          R{(affiliateData.total_commission_earned || 0).toFixed(2)}
                        </p>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-cyan-600">
                          R{(affiliateData.pending_commission || 0).toFixed(2)}
                        </p>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Paid Out</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          R{(affiliateData.paid_commission || 0).toFixed(2)}
                        </p>
                      </Card>
                    </div>

                    {/* Commission History */}
                    <div>
                      <h3 className="text-lg font-bold mb-4">Commission History</h3>
                      {commissions.length > 0 ? (
                        <div className="space-y-2">
                          {commissions.map((commission, idx) => (
                            <Card key={idx} className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{commission.business_name}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(commission.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600">
                                    R{commission.amount.toFixed(2)}
                                  </p>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    commission.status === 'paid' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {commission.status}
                                  </span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No commissions yet. Start referring businesses!</p>
                        </Card>
                      )}
                    </div>

                    {affiliateData.status === 'pending' && (
                      <Card className="p-4 bg-yellow-50 border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          ⏳ Your application is under review. You'll be able to refer businesses once approved.
                        </p>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Please log in to view your dashboard</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AffiliatePortal;
