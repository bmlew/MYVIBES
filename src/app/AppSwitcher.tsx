import { useState } from 'react';
import App from './App';
import BusinessDashboard from './BusinessDashboard';
import { BusinessRegistration } from './BusinessRegistration';

export default function AppSwitcher() {
  const [mode, setMode] = useState<'customer' | 'business' | 'register'>('customer');

  return (
    <div>
      {/* Mode Switcher - For Demo Purposes */}
      <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setMode('customer')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'customer' 
              ? 'bg-[#3B5166] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📱 Customer App
        </button>
        <button
          onClick={() => setMode('business')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'business' 
              ? 'bg-[#3B5166] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💼 Business Dashboard
        </button>
        <button
          onClick={() => setMode('register')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'register' 
              ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white' 
              : 'bg-gradient-to-r from-orange-100 to-purple-100 text-gray-700 hover:from-orange-200 hover:to-purple-200'
          }`}
        >
          ✨ Register Business
        </button>
      </div>

      {/* Render the appropriate view */}
      {mode === 'customer' && <App />}
      {mode === 'business' && <BusinessDashboard />}
      {mode === 'register' && (
        <BusinessRegistration 
          onBack={() => setMode('customer')}
          onRegistrationComplete={(businessId) => {
            console.log('Registration complete for business:', businessId);
            setMode('business');
          }}
        />
      )}
    </div>
  );
}