import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  mobile: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

export function UserProfileModal({ isOpen, onClose, onSave, initialProfile }: UserProfileModalProps) {
  const [formData, setFormData] = useState<UserProfile>({
    name: initialProfile?.name || '',
    email: initialProfile?.email || '',
    mobile: initialProfile?.mobile || '',
    notificationPreference: initialProfile?.notificationPreference || 'email'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    }
  }, [initialProfile]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation (South African format)
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile/WhatsApp number is required';
    } else {
      const cleanedMobile = formData.mobile.replace(/\s+/g, '');
      if (!/^(\+27|0)[0-9]{9}$/.test(cleanedMobile)) {
        newErrors.mobile = 'Please enter a valid SA mobile number (e.g., 0821234567 or +27821234567)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome to MYVIBES! 👋</h2>
              <p className="text-white/90 text-sm mt-1">
                {initialProfile ? 'Update your profile' : 'Let\'s get you started'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-gray-600 text-sm mb-4">
            No password required - just a few quick details so we can personalize your experience.
          </p>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.name 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-cyan-500'
                }`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-cyan-500'
                }`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Mobile Field */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile / WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.mobile 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-cyan-500'
                }`}
                placeholder="082 123 4567"
              />
            </div>
            {errors.mobile && (
              <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              We'll use this for order updates and special offers
            </p>
          </div>

          {/* Notification Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📬 How would you like to receive confirmations?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, notificationPreference: 'email' }))}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  formData.notificationPreference === 'email'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className={`w-6 h-6 mx-auto mb-2 ${formData.notificationPreference === 'email' ? 'text-orange-600' : 'text-gray-400'}`} />
                <p className="font-semibold text-sm">Email</p>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, notificationPreference: 'whatsapp' }))}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  formData.notificationPreference === 'whatsapp'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone className={`w-6 h-6 mx-auto mb-2 ${formData.notificationPreference === 'whatsapp' ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="font-semibold text-sm">WhatsApp</p>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {initialProfile ? 'Cancel' : 'Skip for now'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              {initialProfile ? 'Update Profile' : 'Get Started'}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center pt-2">
            🔒 Your information is safe and will never be shared with third parties
          </p>
        </form>
      </div>
    </div>
  );
}