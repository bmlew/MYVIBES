import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { setupNetworkListeners, isOnline } from '@/utils/pwa';

/**
 * Offline Banner Component
 * Shows when the device loses internet connection
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(!isOnline());
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const cleanup = setupNetworkListeners(
      () => {
        setOffline(false);
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      },
      () => {
        setOffline(true);
        setShowReconnected(false);
      }
    );

    return cleanup;
  }, []);

  if (showReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white py-2 px-4 text-center animate-slide-down">
        <div className="flex items-center justify-center gap-2">
          <Wifi className="w-5 h-5" />
          <span className="font-medium">Back online!</span>
        </div>
      </div>
    );
  }

  if (!offline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white py-2 px-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-5 h-5" />
        <span className="font-medium">You're offline</span>
        <span className="text-sm opacity-90">- Some features may be limited</span>
      </div>
    </div>
  );
}
