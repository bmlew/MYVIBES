import React, { useState } from 'react';
import { User, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface CustomerAuthProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export function CustomerAuth({ onLoginSuccess }: CustomerAuthProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/auth/customer/continue-guest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.customer, data.token);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="h-40 bg-gradient-to-br from-cyan-500 to-blue-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-50 rotate-12 scale-150 transform origin-bottom-right" />
          <User className="w-16 h-16 mb-2 relative z-10" />
          <h2 className="text-2xl font-bold relative z-10">Welcome to MYVIBES</h2>
          <p className="text-white/80 text-sm relative z-10">Sign in once, vibe forever</p>
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Let's get started</h3>
              <p className="text-gray-500 text-sm mt-1">Enter your name to continue</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                <Input 
                  placeholder="e.g. John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg py-6 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <Button 
                onClick={handleContinue} 
                disabled={loading || !name.trim()}
                className="w-full py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    Continue <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                By continuing, you agree to our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}