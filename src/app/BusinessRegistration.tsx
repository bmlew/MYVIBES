import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Lock, Globe, Check, User } from 'lucide-react';
import { Button } from './components/ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from "sonner";
import logoImage from 'figma:asset/4703bef6581c776921a3e305e39de2390a36cac5.png';
import { MyVibesLogo } from '@/app/components/MyVibesLogo';

interface BusinessRegistrationProps {
  onBack: () => void;
  onRegistrationComplete: (businessId: string) => void;
}

export function BusinessRegistration({ onBack, onRegistrationComplete }: BusinessRegistrationProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionPrice, setSubscriptionPrice] = useState(299); // Default fallback
  const [currency, setCurrency] = useState('ZAR');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  // Load subscription price from platform config
  useEffect(() => {
    loadSubscriptionPrice();
  }, []);

  const loadSubscriptionPrice = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/config`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.subscription_price) {
        setSubscriptionPrice(data.subscription_price);
        setCurrency(data.currency || 'ZAR');
      }
    } catch (error) {
      console.error('Failed to load subscription price:', error);
      // Keep default value
    }
  };

  // Form data
  const [formData, setFormData] = useState({
    // Business Info
    businessName: '',
    businessType: 'restaurant',
    description: '',
    cuisineTypes: [] as string[],
    ageGroup: 'all-ages',
    
    // Contact Info
    ownerName: '', // Added ownerName
    email: '',
    phone: '',
    website: '',
    
    // Location
    address: '',
    city: '',
    
    // Account
    password: '',
    confirmPassword: '',
    
    // Agreement
    agreedToTerms: false,
    
    affiliateCode: ''
  });

  const cuisineOptions = [
    'African', 'American', 'Asian', 'BBQ', 'Chinese', 'Fast Food',
    'French', 'Grill', 'Indian', 'Italian', 'Japanese', 'Mediterranean',
    'Mexican', 'Seafood', 'Steakhouse', 'Thai', 'Vegetarian', 'Other'
  ];

  const cityOptions = [
    'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleCuisineType = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine]
    }));
  };

  const validateStep1 = () => {
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Business description is required');
      return false;
    }
    if (formData.businessType === 'restaurant' && formData.cuisineTypes.length === 0) {
      setError('Please select at least one cuisine type');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.ownerName.trim()) {
      setError('Owner name is required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.city) {
      setError('City is required');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/business/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          business_name: formData.businessName,
          owner_name: formData.ownerName,
          business_type: formData.businessType,
          description: formData.description,
          cuisine_types: formData.cuisineTypes,
          age_group: formData.ageGroup,
          email: formData.email,
          phone: formData.phone,
          website: formData.website || null,
          address: formData.address,
          city: formData.city,
          password: formData.password,
          affiliate_code: formData.affiliateCode,
          plan: 'standard'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      toast.success('Registration successful!');
      
      // Notify parent
      setTimeout(() => {
        onRegistrationComplete(data.business_id || 'new-business');
      }, 1000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <MyVibesLogo />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Business Info</span>
          </div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Contact & Location</span>
          </div>
          <div className={`w-12 h-1 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm font-medium hidden sm:inline">Account Setup</span>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Join MYVIBE
            </h1>
            <p className="text-gray-600">
              Start connecting with customers today • R{subscriptionPrice}/month
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Business Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="e.g., The Grill House"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Establishment Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'restaurant', icon: '🍽️', label: 'Restaurant' },
                    { value: 'hotel', icon: '🏨', label: 'Hotel' },
                    { value: 'bar', icon: '🍺', label: 'Bar' },
                    { value: 'cafe', icon: '☕', label: 'Café' },
                    { value: 'lounge', icon: '🛋️', label: 'Lounge' },
                    { value: 'fast-food', icon: '🍔', label: 'Fast Food' },
                    { value: 'bakery', icon: '🥖', label: 'Bakery' },
                    { value: 'food-truck', icon: '🚚', label: 'Food Truck' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('businessType', type.value)}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        formData.businessType === type.value
                          ? 'border-purple-600 bg-purple-50 text-purple-600'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="font-medium text-sm">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell customers about your business..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {formData.businessType === 'restaurant' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Types * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cuisineOptions.map((cuisine) => (
                      <button
                        key={cuisine}
                        type="button"
                        onClick={() => toggleCuisineType(cuisine)}
                        className={`px-3 py-2 text-sm border rounded-lg transition-all ${
                          formData.cuisineTypes.includes(cuisine)
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group / Atmosphere *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('ageGroup', 'all-ages')}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      formData.ageGroup === 'all-ages'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-600'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                  >
                    <div className="font-medium">👨‍👩‍👧‍👦 All Ages Welcome</div>
                    <div className="text-xs text-gray-500 mt-1">Family friendly</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('ageGroup', 'family-with-pets')}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      formData.ageGroup === 'family-with-pets'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-600'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                  >
                    <div className="font-medium">🐕 Family + Pets</div>
                    <div className="text-xs text-gray-500 mt-1">Dog friendly</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('ageGroup', 'adults-18+')}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      formData.ageGroup === 'adults-18+'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-600'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                  >
                    <div className="font-medium">🔞 Adults 18+</div>
                    <div className="text-xs text-gray-500 mt-1">Adult environment</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('ageGroup', 'adults-21+')}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      formData.ageGroup === 'adults-21+'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-600'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                  >
                    <div className="font-medium">🍸 Adults 21+</div>
                    <div className="text-xs text-gray-500 mt-1">Bar / Lounge</div>
                  </button>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Contact & Location */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Owner Name *
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Business Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@yourbusiness.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.yourbusiness.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street, Gardens"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a city</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Account Setup */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-lg mb-2">Subscription Plan</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-purple-600">{subscriptionPrice}</span>
                  <span className="text-gray-600">/{currency}</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Upload unlimited menus & specials
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Post daily specials & events
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Analytics & insights dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Featured on the platform
                  </li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affiliate Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.affiliateCode}
                  onChange={(e) => handleInputChange('affiliateCode', e.target.value.toUpperCase())}
                  placeholder="PROMO-CODE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase tracking-widest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreedToTerms}
                  onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-purple-600 hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-600 hover:underline">
                    Privacy Policy
                  </a>
                  . I understand that my subscription will be charged R{subscriptionPrice}/month and can be cancelled at any time.
                </label>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 text-white"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          Already have an account?{' '}
          <button onClick={onBack} className="text-purple-600 hover:underline font-medium">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}