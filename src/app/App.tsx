import React, { useState, useEffect, lazy, Suspense, startTransition, useRef } from 'react';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { clearInvalidBusinessCache } from '@/utils/offlineStorage';
import '@/utils/fix-businesses'; // Import fix utilities for browser console
import { ErrorBoundary } from './components/ErrorBoundary';
import { useRenderLoopDetector } from '@/hooks/useRenderLoopDetector';

import { Toaster } from '@/app/components/ui/sonner';

// Lazy load heavy components for better initial load performance
// NOTE: All lazy components must be wrapped in Suspense boundaries
// and state changes that trigger lazy loading must use startTransition()
// to prevent "component suspended while responding to synchronous input" errors
const CustomerApp = lazy(() => import('./CustomerApp'));

const BusinessDashboard = lazy(() => import('./BusinessDashboard').then(m => ({ default: m.BusinessDashboard })));
const BusinessAuth = lazy(() => import('./components/BusinessAuth').then(m => ({ default: m.BusinessAuth })));
const ROICalculator = lazy(() => import('./components/ROICalculator').then(m => ({ default: m.ROICalculator })));
const AdminDashboard = lazy(() => import('./AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const LandingPage = lazy(() => import('./LandingPage'));
const WhatsAppReviewPage = lazy(() => import('./components/WhatsAppReviewPage').then(m => ({ default: m.WhatsAppReviewPage })));
const FAQPage = lazy(() => import('./components/FAQPage').then(m => ({ default: m.FAQPage })));
const POPIAPage = lazy(() => import('./components/POPIAPage').then(m => ({ default: m.POPIAPage })));
const DisclaimersPage = lazy(() => import('./components/DisclaimersPage').then(m => ({ default: m.DisclaimersPage })));
const AffiliatePortal = lazy(() => import('./components/AffiliatePortal').then(m => ({ default: m.AffiliatePortal })));
const InvestorDeck = lazy(() => import('./components/InvestorDeck').then(m => ({ default: m.InvestorDeck })));
const DownloadApp = lazy(() => import('./DownloadApp'));

// Loading fallback component
const LoadingFallback = () => {
  const [showSlowLoading, setShowSlowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowLoading(true);
    }, 5000); // Show message after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading MYVIBES...</p>
        {showSlowLoading && (
          <p className="text-amber-600 text-sm mt-4 animate-pulse">
            This is taking longer than expected. Please check your connection.
          </p>
        )}
      </div>
    </div>
  );
};

type AppMode = 'landing' | 'customer' | 'business' | 'roi' | 'admin';

// Helper function to determine initial view from URL
const getInitialView = (): 'landing' | 'customer-app' | 'business-dashboard' | 'business-auth' | 'platform-admin' | 'whatsapp-review' | 'faq' | 'popia' | 'disclaimers' | 'affiliate-portal' | 'investor-deck' | 'download' => {
  const path = window.location.pathname;
  
  // PRIORITY 1: Check if business is already authenticated (must be before URL checks)
  const authToken = localStorage.getItem('business_auth_token');
  const storedBusinessName = localStorage.getItem('business_name');
  if (authToken && storedBusinessName) {
    console.log('🏢 Business session detected, redirecting to dashboard');
    return 'business-dashboard';
  }
  
  // PRIORITY 2: Check specific URL routes
  if (path === '/business-register' || path === '/business-register/') {
    return 'business-auth';
  }
  if (path === '/download' || path === '/download/') {
    return 'download';
  }
  if (path.startsWith('/review/')) {
    return 'whatsapp-review';
  }
  
  // PRIORITY 3: Default to customer app for root paths
  if (path === '/app' || path === '/app/' || path === '/' || path === '') {
    return 'customer-app';
  }
  
  return 'landing';
};

export default function App() {
  // Circuit breaker: Detect infinite render loops
  useRenderLoopDetector('App', 100);
  
  // Always start with landing to avoid HMR suspense issues
  const [currentView, setCurrentView] = useState<'landing' | 'customer-app' | 'business-dashboard' | 'business-auth' | 'platform-admin' | 'whatsapp-review' | 'faq' | 'popia' | 'disclaimers' | 'affiliate-portal' | 'investor-deck' | 'download'>('landing');
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log(`🟦 Main App render #${renderCountRef.current}, currentView: ${currentView}, showLoading: ${showLoading}`);
  
  const [reviewData, setReviewData] = useState<{ businessId?: string; customerName?: string; customerPhone?: string }>(() => {
    // Initialize review data from URL on mount
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path.startsWith('/review/')) {
      const businessId = path.replace('/review/', '').replace('/', '');
      const customerName = params.get('name') || undefined;
      const customerPhone = params.get('phone') || undefined;
      return { businessId, customerName, customerPhone };
    }
    return {};
  });
  
  // Handle referral codes and affiliate codes on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    
    // Check for referral code
    const refCode = params.get('ref') || params.get('referral');
    if (refCode) {
      console.log('📢 Referral code detected:', refCode);
      localStorage.setItem('myvibes_referral_code', refCode.toUpperCase());
    }

    // Check if URL is /business-register with affiliate code
    if (path === '/business-register' || path === '/business-register/') {
      console.log('🏢 Business registration URL detected');
      if (refCode) {
        console.log('🎯 Affiliate code detected for business registration:', refCode);
        localStorage.setItem('myvibes_affiliate_code_prefill', refCode.toUpperCase());
      }
    }
  }, []);
  
  // Initialize view after mount using startTransition to avoid suspense errors
  // Add delay to let React HMR settle before loading lazy components
  useEffect(() => {
    if (!isInitialized) {
      // Small delay to ensure HMR has completed before loading lazy components
      const timer = setTimeout(() => {
        const initialView = getInitialView();
        console.log('🎬 App initialized, initial view:', initialView);
        
        // Use startTransition to prevent suspense errors on lazy components
        startTransition(() => {
          setShowLoading(false);
          setCurrentView(initialView);
          setIsInitialized(true);
        });
      }, 100); // 100ms delay for HMR to settle
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  // Clear any old business-1 references from localStorage on app load
  useEffect(() => {
    clearInvalidBusinessCache();
    
    // Also check URL for invalid business IDs and clear them
    const currentPath = window.location.pathname;
    if (currentPath.includes('business-1') || currentPath.includes('business-2') || currentPath.includes('business-3')) {
      console.log(`🧹 Clearing invalid URL path: ${currentPath}`);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Note: Business authentication check removed - getInitialView() already handles this
  // to prevent conflicts between URL-based routing and localStorage state

  // Preload heavy components in background
  useEffect(() => {
    const preloadComponents = async () => {
      try {
        // Preload CustomerApp as it's the main destination
        console.log('📦 Preloading CustomerApp...');
        await import('./CustomerApp');
        console.log('✅ CustomerApp preloaded');
      } catch (err) {
        console.warn('⚠️ Failed to preload CustomerApp:', err);
      }
    };
    
    // Start preload after a short delay to prioritize initial render
    const timer = setTimeout(preloadComponents, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleBusinessAuthSuccess = (businessId: string, name: string) => {
    console.log('✅ Business authenticated:', businessId, name);
    localStorage.setItem('business_id', businessId);
    localStorage.setItem('business_name', name);
    setCurrentView('business-dashboard');
  };

  const handleBusinessLogout = () => {
    console.log('🚪 Business logged out');
    localStorage.removeItem('business_auth_token');
    localStorage.removeItem('business_id');
    localStorage.removeItem('business_name');
    localStorage.removeItem('business_settings_cache');
    startTransition(() => setCurrentView('landing'));
  };

  return (
    <div>
      {/* PWA Components */}
      <InstallPrompt />
      <OfflineBanner />
      <Toaster />

      {/* Show loading screen during initialization to prevent HMR suspense issues */}
      {showLoading ? (
        <LoadingFallback />
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          {/* Render the appropriate view */}
          {currentView === 'landing' ? (
            <LandingPage 
              onTryDemo={() => startTransition(() => setCurrentView('customer-app'))} 
              onRegisterBusiness={() => startTransition(() => setCurrentView('business-auth'))}
              onNavigate={(page) => startTransition(() => setCurrentView(page))}
            />
          ) : currentView === 'customer-app' ? (
            <ErrorBoundary>
              <CustomerApp onExit={() => startTransition(() => setCurrentView('landing'))} />
            </ErrorBoundary>
          ) : currentView === 'business-auth' ? (
            <BusinessAuth 
              onAuthSuccess={handleBusinessAuthSuccess} 
              onBack={() => startTransition(() => setCurrentView('landing'))}
            />
          ) : currentView === 'business-dashboard' ? (
            <BusinessDashboard onLogout={handleBusinessLogout} businessName={localStorage.getItem('business_name') || ''} />
          ) : currentView === 'roi' ? (
            <ROICalculator onBack={() => startTransition(() => setCurrentView('customer-app'))} />
          ) : currentView === 'whatsapp-review' ? (
            <WhatsAppReviewPage 
              businessId={reviewData.businessId || ''}
              customerName={reviewData.customerName}
              customerPhone={reviewData.customerPhone}
            />
          ) : currentView === 'faq' ? (
            <FAQPage onBack={() => startTransition(() => setCurrentView('landing'))} />
          ) : currentView === 'popia' ? (
            <POPIAPage onBack={() => startTransition(() => setCurrentView('landing'))} />
          ) : currentView === 'disclaimers' ? (
            <DisclaimersPage onBack={() => startTransition(() => setCurrentView('landing'))} />
          ) : currentView === 'affiliate-portal' ? (
            <AffiliatePortal onBack={() => startTransition(() => setCurrentView('landing'))} />
          ) : currentView === 'investor-deck' ? (
            <InvestorDeck onBack={() => startTransition(() => setCurrentView('landing'))} />
          ) : currentView === 'platform-admin' ? (
            <ErrorBoundary>
              <AdminDashboard onNavigate={(page) => startTransition(() => setCurrentView(page))} />
            </ErrorBoundary>
          ) : currentView === 'download' ? (
            <DownloadApp />
          ) : (
            <LandingPage 
              onTryDemo={() => startTransition(() => setCurrentView('customer-app'))} 
              onRegisterBusiness={() => startTransition(() => setCurrentView('business-auth'))}
              onNavigate={(page) => startTransition(() => setCurrentView(page))}
            />
          )}
        </Suspense>
      )}
    </div>
  );
}