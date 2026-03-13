import React, { useEffect } from 'react';
import { CustomerApp } from './CustomerApp';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { Toaster } from '@/app/components/ui/sonner';

/**
 * Customer-only PWA entry point
 * This is the standalone customer app without landing page, business dashboard, etc.
 */
export default function CustomerAppPWA() {
  useEffect(() => {
    console.log('🎯 MYVIBES Customer PWA loaded');
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <>
      {/* PWA Components */}
      <InstallPrompt />
      <OfflineBanner />
      
      {/* Toast Notifications */}
      <Toaster />
      
      {/* Customer App */}
      <CustomerApp />
    </>
  );
}
