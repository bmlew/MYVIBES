import React, { useState, useEffect } from 'react';
import { User, ArrowRight, Loader2, AlertCircle, Check, Phone, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkMobile, loginCustomerByMobile, registerCustomer, recoverUsername } from '@/utils/api';

interface CustomerAuthScreenProps {
  onAuthenticated: (userProfile: any, token: string) => void;
}

export function CustomerAuthScreen({ onAuthenticated }: CustomerAuthScreenProps) {
  const [step, setStep] = useState<'mobile' | 'register' | 'recovery'>('mobile');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);

  // Auto-fill affiliate code from referral link when component loads
  useEffect(() => {
    const referralCode = localStorage.getItem('myvibes_referral_code');
    if (referralCode) {
      setAffiliateCode(referralCode.toUpperCase());
      console.log('🎁 Auto-filled affiliate code from referral link:', referralCode);
    }
  }, []);

  const validateMobile = (val: string) => /^[0-9]{10}$/.test(val);

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim()) {
      setError('Mobile number is required');
      return;
    }
    if (!validateMobile(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const exists = await checkMobile(mobile);
      
      if (exists) {
        // Login immediately
        const result = await loginCustomerByMobile(mobile);
        if (result.success && result.customer) {
          // Save to localStorage
          localStorage.setItem('vibespot_customer_profile', JSON.stringify(result.customer));
          localStorage.setItem('vibespot_session_token', result.token);
          
          onAuthenticated(result.customer, result.token);
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        // New user - proceed to registration step
        setStep('register');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    // Removed affiliate code validation - it's now optional

    setLoading(true);
    setError(null);

    try {
      // Generate a username from mobile number
      const username = `user${mobile}`;
      
      // Pass empty string if no affiliate code provided
      const result = await registerCustomer(username, name, mobile, affiliateCode || '');
      if (result.success && result.customer) {
        // Save to localStorage
        localStorage.setItem('vibespot_customer_profile', JSON.stringify(result.customer));
        localStorage.setItem('vibespot_session_token', result.token);
        
        onAuthenticated(result.customer, result.token);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Valid email required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await recoverUsername(email);
      setRecoverySent(true);
      setTimeout(() => {
        setStep('mobile');
        setRecoverySent(false);
        setEmail('');
      }, 3000);
    } catch (err) {
      setError('Recovery failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-8 text-center text-white relative">
          <div className="absolute inset-0 bg-white/5" />
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Phone className="w-16 h-16 mx-auto mb-4 stroke-[1.5]" />
            <h1 className="text-2xl font-bold mb-1">Welcome to MYVIBES</h1>
            <p className="text-cyan-100 text-sm">Your gateway to the best spots</p>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'mobile' && (
              <motion.div 
                key="mobile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Sign In</h2>
                  <p className="text-gray-500 text-sm">Enter your mobile number to continue</p>
                </div>

                <form onSubmit={handleMobileSubmit} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Mobile Number
                      </label>
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value.replace(/[^0-9]/g, ''));
                        setError(null);
                      }}
                      placeholder="0821234567"
                      maxLength={10}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none transition-colors font-medium text-lg"
                      autoFocus
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-[10px] text-gray-400">
                        10-digit mobile number
                      </p>
                      <button 
                        type="button"
                        onClick={() => setStep('recovery')}
                        className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                      >
                        Need help?
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Continue <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'register' && (
              <motion.div 
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Create Account</h2>
                  <p className="text-gray-500 text-sm">Complete your registration</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-400 font-medium">Mobile</div>
                      <div className="font-bold text-blue-900">{mobile}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError(null);
                      }}
                      placeholder="e.g. John Doe"
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none transition-colors font-medium text-lg"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Affiliate Code <span className="text-gray-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={affiliateCode}
                        onChange={(e) => {
                          setAffiliateCode(e.target.value.toUpperCase());
                          setError(null);
                        }}
                        placeholder="e.g. ABC123"
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none transition-colors font-medium text-lg uppercase"
                      />
                      {affiliateCode && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      <Users className="w-3 h-3 inline mr-1" />
                      Have an affiliate code? Enter it here to earn bonus rewards
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('mobile')}
                      className="flex-1 py-4 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] bg-gradient-to-r from-cyan-400 to-blue-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Join MYVIBES
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'recovery' && (
              <motion.div 
                key="recovery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {recoverySent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Check your email</h3>
                    <p className="text-gray-500 text-sm">
                      If an account exists with that email, we've sent your username.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot Username?</h2>
                      <p className="text-gray-500 text-sm">Enter your email to recover it</p>
                    </div>

                    <form onSubmit={handleRecovery} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-cyan-500 focus:ring-0 outline-none transition-colors font-medium text-lg"
                          autoFocus
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStep('mobile')}
                          className="flex-1 py-4 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-[2] bg-gradient-to-r from-cyan-400 to-blue-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            'Recover'
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}