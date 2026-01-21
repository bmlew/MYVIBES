import { useState } from 'react';
import { User, Mail, Phone, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CustomerProfileSetupProps {
  onComplete: () => void;
}

export function CustomerProfileSetup({ onComplete }: CustomerProfileSetupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    notificationPreference: 'email' as 'email' | 'whatsapp'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 Customer Profile Setup - Form submitted with data:', formData);

    // Validate
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      console.error('❌ Validation failed: Empty fields');
      alert('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.error('❌ Validation failed: Invalid email');
      alert('Please enter a valid email address');
      return;
    }

    // Mobile validation (South African format)
    const cleanedMobile = formData.mobile.replace(/\s/g, '');
    const mobileRegex = /^(\+27|0)[0-9]{9}$/;
    console.log('📱 Mobile validation - Original:', formData.mobile, 'Cleaned:', cleanedMobile);
    
    if (!mobileRegex.test(cleanedMobile)) {
      console.error('❌ Validation failed: Invalid mobile number format');
      alert('Please enter a valid South African mobile number (e.g., 0821234567 or +27821234567)');
      return;
    }

    console.log('✅ All validations passed');

    // Save to localStorage
    try {
      localStorage.setItem('vibespot_customer_profile', JSON.stringify(formData));
      localStorage.setItem('vibespot_customer_logged_in', 'true');
      console.log('💾 Profile saved to localStorage:', formData);
      console.log('💾 Login flag set:', localStorage.getItem('vibespot_customer_logged_in'));
      
      // Verify it was saved
      const savedProfile = localStorage.getItem('vibespot_customer_profile');
      console.log('✅ Verification - Profile in localStorage:', savedProfile);
      
      onComplete();
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white flex-shrink-0">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-1">Welcome to MYVIBES!</h2>
          <p className="text-cyan-100 text-xs">Let's set up your profile to get started</p>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-500" />
              Full Name
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
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-500" />
              Email Address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john.doe@example.com"
              className="w-full"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-500" />
              Mobile Number
            </label>
            <Input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              placeholder="0821234567"
              className="w-full"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: 0821234567 or +27821234567</p>
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
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className={`w-6 h-6 mx-auto mb-2 ${formData.notificationPreference === 'email' ? 'text-cyan-600' : 'text-gray-400'}`} />
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

          {/* Info */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
            <p className="text-xs text-cyan-800">
              <strong>One-time setup:</strong> This information will be saved and you'll stay logged in. 
              You can update your details anytime in your profile.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg font-semibold"
          >
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  );
}