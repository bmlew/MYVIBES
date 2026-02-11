import { useState } from 'react';
import { User, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CustomerProfileSetupProps {
  onComplete: (profile: any) => void;
}

export function CustomerProfileSetup({ onComplete }: CustomerProfileSetupProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 Customer Profile Setup - Form submitted with data:', { name });

    // Validate Name only
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    const profile = {
      name,
      id: `guest-${Date.now()}`, // Generate a temporary ID
      username: name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
      // Default empty values for compatibility
      email: '',
      mobile: '',
      notificationPreference: 'email'
    };

    // Save to localStorage
    try {
      localStorage.setItem('vibespot_customer_profile', JSON.stringify(profile));
      localStorage.setItem('vibespot_customer_logged_in', 'true');
      console.log('💾 Profile saved to localStorage:', profile);
      
      onComplete(profile);
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-center text-white flex-shrink-0 rounded-t-2xl">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold mb-1">Welcome to MYVIBES!</h2>
          <p className="text-cyan-100 text-xs">Enter your name to start exploring</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-500" />
              Full Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full"
              required
              autoFocus
            />
          </div>

          {/* Info */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
            <p className="text-xs text-cyan-800">
              <strong>Quick Access:</strong> You can add more details later in your profile.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-4 text-lg font-semibold"
          >
            Start Vibing
          </Button>
        </form>
      </div>
    </div>
  );
}