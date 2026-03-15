/**
 * BusinessAuth Component
 * Handles business authentication (login/register) for the MYVIBES platform
 * @version 2.1.2 - Fixed import paths for production deployment
 */
import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, Building2, MapPin, Mail, Lock, Phone, User, CheckCircle2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface BusinessAuthProps {
  onAuthenticated?: (data: any) => void;
  onAuthSuccess?: (businessId: string, name: string) => void;
  onBack?: () => void;
}

export function BusinessAuth({ onAuthenticated, onAuthSuccess, onBack }: BusinessAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');

  // Auto-fill affiliate code if coming from referral link
  useEffect(() => {
    const prefilledCode = localStorage.getItem('myvibes_affiliate_code_prefill');
    if (prefilledCode) {
      console.log('🎯 Auto-filling affiliate code:', prefilledCode);
      setAffiliateCode(prefilledCode);
      setIsLogin(false); // Switch to registration view
      // Clear the prefill after using it
      localStorage.removeItem('myvibes_affiliate_code_prefill');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/auth/business/signin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success
      if (data.access_token) {
        localStorage.setItem('business_auth_token', data.access_token);
      }
      localStorage.setItem('business_id', data.business_id);
      localStorage.setItem('business_name', data.business.name);
      
      // Force reload to trigger App.tsx effect
      window.location.reload();
      
    } catch (err: any) {
      console.error('❌ Login client-side error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/auth/business/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          business_name: businessName,
          owner_name: ownerName,
          email,
          phone,
          address,
          city,
          postal_code: postalCode,
          password,
          affiliate_code: affiliateCode,
          plan: 'standard' 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle "already registered" gracefully
        if (data.error && data.error.includes('already registered')) {
           console.log('ℹ️ User exists:', data.error);
           throw new Error(data.error);
        }
        console.error('❌ Registration server response:', data);
        throw new Error(data.error || 'Registration failed');
      }

      // Success
      setIsLogin(true);
      setError(null);
      alert('Registration successful! Please sign in.');
      
    } catch (err: any) {
      if (err.message && (err.message.includes('already registered') || err.message.includes('sign in'))) {
         setError('Account already exists. Switching to login...');
         setTimeout(() => {
            setIsLogin(true);
            setError('Please sign in with your password.');
         }, 1500);
      } else {
         console.error('❌ Registration client-side error:', err);
         setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Panel - Hero */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')] opacity-10 bg-cover bg-center" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <Building2 className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold tracking-tight">MYVIBES <span className="text-cyan-400">BUSINESS</span></span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Grow your venue with <span className="text-cyan-400">smart insights.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-md">
            Manage reservations, track analytics, and reach more customers with our all-in-one hospitality platform.
          </p>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-8 mt-12">
          <div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">2.5x</div>
            <div className="text-sm text-gray-400">More Reservations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">15k+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Back to Landing Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome back' : 'Partner with us'}
            </h2>
            <p className="text-gray-500">
              {isLogin 
                ? 'Sign in to access your dashboard' 
                : 'Create your business account in minutes'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleLogin} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                      placeholder="you@business.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white p-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(false); setError(null); }}
                      className="text-cyan-600 font-semibold hover:underline"
                    >
                      Register now
                    </button>
                  </p>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister} 
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="Venue Name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                      placeholder="you@business.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                      placeholder="Create a password"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="082 123 4567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                        placeholder="e.g. Sandton"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                    placeholder="13 Andrew Murray Rd, Bryanston"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                    placeholder="2191"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Code (Optional)</label>
                  <input
                    type="text"
                    value={affiliateCode}
                    onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm uppercase tracking-widest"
                    placeholder="PROMO-CODE"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-600 text-white p-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => { setIsLogin(true); setError(null); }}
                      className="text-cyan-600 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}