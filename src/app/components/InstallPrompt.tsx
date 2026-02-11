import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { showInstallPrompt, isAppInstalled, setupInstallPrompt } from '@/utils/pwa';

/**
 * Install Prompt Component for PWA
 * Shows a banner prompting users to install the MYVIBES app
 */
export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Set up install prompt listener
    setupInstallPrompt();

    // Check if app is already installed
    if (isAppInstalled()) {
      setShowPrompt(false);
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissal < 7) {
        return;
      }
    }

    // Listen for install availability
    const handleInstallAvailable = () => {
      setShowPrompt(true);
    };

    const handleInstalled = () => {
      setShowPrompt(false);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const accepted = await showInstallPrompt();
    
    if (accepted) {
      setShowPrompt(false);
    } else {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <div className="bg-gradient-to-r from-[#FF6B35] to-[#8B5CF6] p-4 rounded-lg shadow-2xl text-white">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-3 pr-8">
          <div className="bg-white/20 p-2 rounded-lg">
            <Download className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Install MYVIBES</h3>
            <p className="text-sm text-white/90 mb-3">
              Get the full app experience! Install MYVIBES for faster access, offline support, and push notifications.
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-white text-[#FF6B35] hover:bg-white/90 font-semibold"
                size="sm"
              >
                {isInstalling ? 'Installing...' : 'Install App'}
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="text-white hover:bg-white/20"
                size="sm"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}