import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Eye, EyeOff, Store, Mail, Lock, User, Phone, MapPin, X } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface BusinessAuthProps {
  onAuthSuccess: (businessId: string, businessName: string) => void;
}

export function BusinessAuth({ onAuthSuccess }: BusinessAuthProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Sign In Form
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Register Form
  const [registerData, setRegisterData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    password: '',
    confirmPassword: '',
    affiliate_code: '',
    plan: 'standard' // Add plan field with default
  });

  // Forgot Password Form
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const southAfricanCities = [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Polokwane', 'Nelspruit', 'Kimberley',
    'Rustenburg', 'Pietermaritzburg', 'George', 'Stellenbosch', 'Sandton'
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInData.email || !signInData.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/auth/business/signin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: signInData.email,
            password: signInData.password
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Store auth token and business info
        localStorage.setItem('business_auth_token', data.access_token);
        localStorage.setItem('business_id', data.business.id);
        localStorage.setItem('business_name', data.business.name);
        
        onAuthSuccess(data.business.id, data.business.name);
      } else {
        const error = await response.json();
        alert(error.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!registerData.businessName || !registerData.ownerName || !registerData.email || 
        !registerData.phone || !registerData.address || !registerData.city || 
        !registerData.password || !registerData.confirmPassword) {
      alert('Please fill in all required fields');
      return;
    }

    if (registerData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert('Passwords do not match');
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
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/auth/business/register`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            business_name: registerData.businessName,
            owner_name: registerData.ownerName,
            email: registerData.email,
            phone: registerData.phone,
            address: registerData.address,
            city: registerData.city,
            password: registerData.password,
            affiliate_code: registerData.affiliate_code,
            plan: registerData.plan
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert('Registration successful! You can now sign in.');
        
        // Switch to sign in tab and prefill email
        setActiveTab('signin');
        setSignInData({ email: registerData.email, password: '' });
        
        // Reset register form
        setRegisterData({
          businessName: '',
          ownerName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          password: '',
          confirmPassword: '',
          affiliate_code: '',
          plan: 'standard'
        });
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail) {
      alert('Please enter your email address');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/auth/business/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: forgotEmail })
        }
      );

      if (response.ok) {
        setResetSent(true);
      } else {
        alert('Email not found. Please check and try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-600 to-blue-900 flex items-center justify-center p-4">
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetSent(false);
                setForgotEmail('');
              }}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {!resetSent ? (
              <form onSubmit={handleForgotPassword}>
                <h3 className="text-2xl font-bold mb-2">Forgot Password?</h3>
                <p className="text-gray-600 mb-6">
                  Enter your email and we'll send you instructions to reset your password.
                </p>

                <div className="mb-6">
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Check Your Email</h3>
                <p className="text-gray-600 mb-6">
                  We've sent password reset instructions to <strong>{forgotEmail}</strong>
                </p>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                    setForgotEmail('');
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  Got it
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 lg:p-12 text-white flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Store className="w-12 h-12" />
                <h1 className="text-4xl font-bold">MYVIBES</h1>
              </div>
              <p className="text-xl opacity-90">Business Portal</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Manage Your Business</h3>
                  <p className="text-sm opacity-90">Post specials, events, and manage your menu</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">AI-Powered Analytics</h3>
                  <p className="text-sm opacity-90">Get insights and recommendations</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Reach More Customers</h3>
                  <p className="text-sm opacity-90">Connect with local diners in real-time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="p-8 lg:p-12">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
                <p className="text-gray-600 mb-6">Sign in to your business account</p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
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

              {/* Register Tab */}
              <TabsContent value="register">
                <h2 className="text-2xl font-bold mb-2">Create Account</h2>
                <p className="text-gray-600 mb-6">Get your business on MYVIBES</p>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-name">Business Name *</Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="business-name"
                          placeholder="e.g., The Palms"
                          value={registerData.businessName}
                          onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="owner-name">Owner Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="owner-name"
                          placeholder="John Doe"
                          value={registerData.ownerName}
                          onChange={(e) => setRegisterData({ ...registerData, ownerName: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="register-email"
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
                    <Label htmlFor="address">Business Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <select
                      id="city"
                      value={registerData.city}
                      onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Select a city</option>
                      {southAfricanCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Selection */}
                  <div>
                    <Label className="mb-3 block">Choose Your Plan *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Standard Plan */}
                      <div
                        onClick={() => setRegisterData({ ...registerData, plan: 'standard' })}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          registerData.plan === 'standard'
                            ? 'border-cyan-500 bg-cyan-50 shadow-md'
                            : 'border-gray-200 hover:border-cyan-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg">Standard</h4>
                          {registerData.plan === 'standard' && (
                            <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-cyan-600 mb-2">R499<span className="text-sm text-gray-500">/mo</span></div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>✓ Basic Analytics</li>
                          <li>✓ Menu Management</li>
                          <li>✓ Customer Reviews</li>
                        </ul>
                      </div>

                      {/* Premium Plan */}
                      <div
                        onClick={() => setRegisterData({ ...registerData, plan: 'premium' })}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          registerData.plan === 'premium'
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          POPULAR
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg">Premium</h4>
                          {registerData.plan === 'premium' && (
                            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-purple-600 mb-2">R999<span className="text-sm text-gray-500">/mo</span></div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>✓ AI-Powered Insights</li>
                          <li>✓ Priority Placement</li>
                          <li>✓ Advanced Analytics</li>
                          <li>✓ Everything in Standard</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="register-password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 8 characters"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirm-password">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Affiliate Code (Optional) */}
                  <div>
                    <Label htmlFor="affiliate-code">
                      Affiliate Code <span className="text-gray-500">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                        🎯
                      </span>
                      <Input
                        id="affiliate-code"
                        placeholder="Enter referral code (e.g., JOHM2026)"
                        value={registerData.affiliate_code}
                        onChange={(e) => setRegisterData({ ...registerData, affiliate_code: e.target.value.toUpperCase() })}
                        className="pl-10 font-mono"
                        maxLength={10}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Have an affiliate referral code? Enter it to support your referrer.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Business Account'}
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessAuth;