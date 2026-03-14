import React, { useState } from 'react';
import { User, Sparkles, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import * as api from '@/utils/api';

interface CustomerProfileSetupProps {
  onComplete: (profile: any) => void;
}

export function CustomerProfileSetup({ onComplete }: CustomerProfileSetupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    birthday: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.mobile.trim()) {
      setError('Please enter your mobile number');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Starting profile setup...');

      // 1. Get Authentication Token & Base Profile
      const authResult = await api.continueWithEmail(formData.name, formData.email);
      
      if (!authResult.success || !authResult.token) {
        throw new Error(authResult.error || 'Authentication failed');
      }

      console.log('✅ Auth successful, token received');

      // 2. Update Profile with Mobile & Birthday (since continueWithEmail only sets name/email)
      const fullProfile = {
        ...authResult.customer,
        mobile: formData.mobile,
        birthday: formData.birthday || null,
        // Ensure critical fields are set
        name: formData.name,
        email: formData.email,
        notificationPreference: 'email'
      };

      // Call API to persist full details
      await api.saveCustomerProfile(fullProfile);
      
      console.log('✅ Full profile saved to backend');

      // 3. Save to LocalStorage for persistence
      localStorage.setItem('vibespot_session_token', authResult.token);
      localStorage.setItem('vibespot_customer_profile', JSON.stringify(fullProfile));
      localStorage.setItem('vibespot_customer_logged_in', 'true');

      // 4. Complete
      onComplete(fullProfile);

    } catch (err: any) {
      console.error('❌ Profile setup error:', err);
      
      // Handle specific field errors
      if (err.message && err.message.includes('Email address already registered')) {
        setError('This email is already registered. Please use a different email or sign in.');
      } else if (err.message && err.message.includes('Mobile number already registered')) {
        setError('This mobile number is already registered. Please use a different number.');
      } else {
        setError(err.message || 'Failed to create profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-center text-white flex-shrink-0">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-1">Welcome to MYVIBES!</h2>
          <p className="text-cyan-100 text-sm">Create your profile to start exploring</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-500" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Doe"
              className="w-full"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-500" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
              className="w-full"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-500" />
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              placeholder="082 123 4567"
              className="w-full"
              required
            />
          </div>

          {/* Birthday (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-500" />
              Date of Birth <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <Input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg font-semibold shadow-lg shadow-blue-500/20"
            >
              {loading ? 'Creating Profile...' : 'Start Vibing'}
            </Button>
            <p className="text-center text-xs text-gray-400 mt-4">
              By joining, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}