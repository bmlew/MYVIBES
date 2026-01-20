import { useState, useEffect } from 'react';
import { User, Mail, Phone, ArrowLeft, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CustomerProfileProps {
  onBack: () => void;
}

interface CustomerData {
  name: string;
  email: string;
  mobile: string;
}

export function CustomerProfile({ onBack }: CustomerProfileProps) {
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    mobile: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load customer data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('vibespot_customer_profile');
    if (savedData) {
      setCustomerData(JSON.parse(savedData));
    }
  }, []);

  const handleSave = () => {
    // Validate
    if (!customerData.name.trim() || !customerData.email.trim() || !customerData.mobile.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Mobile validation (South African format)
    const mobileRegex = /^(\+27|0)[0-9]{9}$/;
    if (!mobileRegex.test(customerData.mobile.replace(/\s/g, ''))) {
      alert('Please enter a valid South African mobile number (e.g., 0821234567 or +27821234567)');
      return;
    }

    // Save to localStorage
    localStorage.setItem('vibespot_customer_profile', JSON.stringify(customerData));
    localStorage.setItem('vibespot_customer_logged_in', 'true');
    
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-orange-100 text-sm mt-1">Manage your personal information</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-white mx-auto flex items-center justify-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">
              {customerData.name ? customerData.name.charAt(0).toUpperCase() : <User className="w-12 h-12 text-orange-500" />}
            </div>
            <h2 className="text-white text-xl font-bold mt-4">
              {customerData.name || 'Complete Your Profile'}
            </h2>
          </div>

          {/* Profile Form */}
          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                  {customerData.name || 'Not set'}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                  {customerData.email || 'Not set'}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Mobile Number
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={customerData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  placeholder="0821234567 or +27821234567"
                  className="w-full"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                  {customerData.mobile || 'Not set'}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      // Reload from localStorage
                      const savedData = localStorage.getItem('vibespot_customer_profile');
                      if (savedData) {
                        setCustomerData(JSON.parse(savedData));
                      }
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Why do we need this information?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your name and email help us personalize your experience</li>
            <li>• We use your mobile number for reservation confirmations</li>
            <li>• Your information is kept secure and never shared</li>
            <li>• You can update your details anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
