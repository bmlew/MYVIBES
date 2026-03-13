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
    
    // Debug: Check session persistence on load
    const checkSessionPersistence = () => {
      const token = localStorage.getItem('vibespot_session_token');
      const profile = localStorage.getItem('vibespot_customer_profile');
      
      console.log('📱 Session Check on App Load:');
      console.log('  - Token exists:', !!token);
      console.log('  - Profile exists:', !!profile);
      
      if (token && profile) {
        console.log('✅ Session persisted successfully!');
        try {
          const parsedProfile = JSON.parse(profile);
          console.log('  - User:', parsedProfile.username || parsedProfile.name);
        } catch (e) {
          console.error('❌ Corrupt profile data detected!');
        }
      } else {
        console.log('⚠️ No persisted session found');
      }
      
      // Test localStorage availability
      try {
        localStorage.setItem('_test_', 'test');
        localStorage.removeItem('_test_');
        console.log('✅ localStorage is working');
      } catch (e) {
        console.error('❌ localStorage is NOT available!', e);
      }
    };
    
    checkSessionPersistence();
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-simple.js')
        .then(registration => {
          console.log('✅ Service Worker registered successfully!');
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