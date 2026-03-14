import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * UpdateNotification Component
 * 
 * A non-intrusive update notification that appears when a new version is available.
 * - Doesn't auto-reload
 * - User can dismiss or update when convenient
 * - Only shows once per version
 * - Stores dismissal in localStorage
 * 
 * Usage:
 * 1. Import this component in CustomerApp.tsx
 * 2. Add it to the render tree: <UpdateNotification currentVersion="2.1.3" />
 * 3. When you deploy a new version, update the currentVersion prop
 */

interface UpdateNotificationProps {
  currentVersion: string;
  /** Optional: Custom update message */
  message?: string;
  /** Optional: Position of the notification */
  position?: 'top' | 'bottom';
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  currentVersion,
  message = 'A new version is available',
  position = 'bottom'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    checkForUpdate();
  }, [currentVersion]);

  const checkForUpdate = () => {
    // Get the deployed version from meta tag
    const metaVersion = document.querySelector('meta[name="app-version"]')?.getAttribute('content');
    
    // Get the last dismissed version
    const dismissedVersion = localStorage.getItem('myvibes_dismissed_update_version');
    
    // Check if service worker has an update waiting
    navigator.serviceWorker?.getRegistration().then(registration => {
      if (registration?.waiting) {
        // There's a service worker waiting to activate
        // Only show if user hasn't dismissed this version
        if (dismissedVersion !== metaVersion) {
          setIsVisible(true);
        }
      }
    });
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Get the service worker registration
      const registration = await navigator.serviceWorker?.getRegistration();
      
      if (registration?.waiting) {
        // Tell the waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Listen for the new service worker to take control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Reload the page to get the new version
          window.location.reload();
        });
      } else {
        // No waiting worker, just reload
        window.location.reload();
      }
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    // Store the dismissed version
    const metaVersion = document.querySelector('meta[name="app-version"]')?.getAttribute('content');
    if (metaVersion) {
      localStorage.setItem('myvibes_dismissed_update_version', metaVersion);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const positionClasses = position === 'top' 
    ? 'top-20 animate-slide-down' 
    : 'bottom-20 animate-slide-up';

  return (
    <div 
      className={`fixed left-1/2 -translate-x-1/2 z-[60] max-w-md w-full px-4 ${positionClasses}`}
      role="alert"
    >
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 border border-white/20">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
          </div>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {message}
          </p>
          <p className="text-xs opacity-90 mt-0.5">
            Tap "Update" to get the latest features
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Dismiss update notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Alternative: Subtle Badge Version
 * 
 * Shows a small badge that doesn't take up much space
 */
export const UpdateBadge: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    navigator.serviceWorker?.getRegistration().then(registration => {
      if (registration?.waiting) {
        setHasUpdate(true);
      }
    });
  }, []);

  if (!hasUpdate) return null;

  return (
    <button
      onClick={onUpdate}
      className="fixed top-4 right-4 z-[60] bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 animate-bounce"
    >
      <RefreshCw className="w-3 h-3" />
      Update Available
    </button>
  );
};
