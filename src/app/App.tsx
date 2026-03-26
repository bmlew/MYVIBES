import React, { useState, useEffect, lazy, Suspense, startTransition } from 'react';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { clearInvalidBusinessCache } from '@/utils/offlineStorage';
import '@/utils/fix-businesses'; // Import fix utilities for browser console
import { ErrorBoundary } from './components/ErrorBoundary';

import { Toaster } from '@/app/components/ui/sonner';

// Lazy load heavy components for better initial load performance with retry logic
// Handle both default and named exports for robustness
const CustomerApp = lazy(() => 
  import('./CustomerApp')
    .then(module => ({ default: module.CustomerApp || module.default }))
    .catch(err => {
      console.error('Error loading CustomerApp:', err);
      // Retry after short delay
      return new Promise(resolve => setTimeout(() => resolve(
        import('./CustomerApp').then(module => ({ default: module.CustomerApp || module.default }))
      ), 1000));
    })
);

const BusinessDashboard = lazy(() => import('./BusinessDashboard').then(m => ({ default: m.BusinessDashboard })));
const BusinessAuth = lazy(() => 
  import('./components/BusinessAuth')
    .then(module => ({ default: module.BusinessAuth || module.default }))
    .catch(err => {
      console.error('Error loading BusinessAuth:', err);
      // Retry after short delay
      return new Promise(resolve => setTimeout(() => resolve(
        import('./components/BusinessAuth').then(module => ({ default: module.BusinessAuth || module.default }))
      ), 1000));
    })
);
const ROICalculator = lazy(() => import('./components/ROICalculator').then(m => ({ default: m.ROICalculator })));
const AdminDashboard = lazy(() => 
  import('./AdminDashboard')
    .then(module => ({ default: module.AdminDashboard || module.default }))
    .catch(err => {
      console.error('Error loading AdminDashboard:', err);
      // Retry after short delay
      return new Promise(resolve => setTimeout(() => resolve(
        import('./AdminDashboard').then(module => ({ default: module.AdminDashboard || module.default }))
      ), 1000));
    })
);
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
  
  if (path === '/business-register' || path === '/business-register/') {
    return 'business-auth';
  }
  if (path === '/download' || path === '/download/') {
    return 'download';
  }
  if (path === '/app' || path === '/app/' || path === '/' || path === '') {
    return 'customer-app';
  }
  if (path.startsWith('/review/')) {
    return 'whatsapp-review';
  }
  
  // Check if business is already authenticated
  const authToken = localStorage.getItem('business_auth_token');
  const storedBusinessName = localStorage.getItem('business_name');
  if (authToken && storedBusinessName) {
    return 'business-dashboard';
  }
  
  return 'landing';
};

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'customer-app' | 'business-dashboard' | 'business-auth' | 'platform-admin' | 'whatsapp-review' | 'faq' | 'popia' | 'disclaimers' | 'affiliate-portal' | 'investor-deck' | 'download'>(getInitialView());
  
  console.log('🟦 Main App component rendered, currentView:', currentView);
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

  // Check if business is already authenticated on mount
  useEffect(() => {
    const authToken = localStorage.getItem('business_auth_token');
    const storedBusinessName = localStorage.getItem('business_name');
    
    if (authToken && storedBusinessName) {
      setCurrentView('business-dashboard');
      localStorage.setItem('business_name', storedBusinessName);
    }
  }, []);

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

      {/* Render the appropriate view */}
      {currentView === 'landing' ? (
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage 
            onTryDemo={() => startTransition(() => setCurrentView('customer-app'))} 
            onRegisterBusiness={() => startTransition(() => setCurrentView('business-auth'))}
            onNavigate={(page) => startTransition(() => setCurrentView(page))}
          />
        </Suspense>
      ) : currentView === 'customer-app' ? (
        <Suspense fallback={<LoadingFallback />}>
          <CustomerApp onExit={() => startTransition(() => setCurrentView('landing'))} />
        </Suspense>
      ) : currentView === 'business-auth' ? (
        <Suspense fallback={<LoadingFallback />}>
          <BusinessAuth 
            onAuthSuccess={handleBusinessAuthSuccess} 
            onBack={() => startTransition(() => setCurrentView('landing'))}
          />
        </Suspense>
      ) : currentView === 'business-dashboard' ? (
        <Suspense fallback={<LoadingFallback />}>
          <BusinessDashboard onLogout={handleBusinessLogout} businessName={localStorage.getItem('business_name') || ''} />
        </Suspense>
      ) : currentView === 'roi' ? (
        <Suspense fallback={<LoadingFallback />}>
          <ROICalculator onBack={() => startTransition(() => setCurrentView('customer-app'))} />
        </Suspense>
      ) : currentView === 'whatsapp-review' ? (
        <Suspense fallback={<LoadingFallback />}>
          <WhatsAppReviewPage 
            businessId={reviewData.businessId || ''}
            customerName={reviewData.customerName}
            customerPhone={reviewData.customerPhone}
          />
        </Suspense>
      ) : currentView === 'faq' ? (
        <Suspense fallback={<LoadingFallback />}>
          <FAQPage onBack={() => startTransition(() => setCurrentView('landing'))} />
        </Suspense>
      ) : currentView === 'popia' ? (
        <Suspense fallback={<LoadingFallback />}>
          <POPIAPage onBack={() => startTransition(() => setCurrentView('landing'))} />
        </Suspense>
      ) : currentView === 'disclaimers' ? (
        <Suspense fallback={<LoadingFallback />}>
          <DisclaimersPage onBack={() => startTransition(() => setCurrentView('landing'))} />
        </Suspense>
      ) : currentView === 'affiliate-portal' ? (
        <Suspense fallback={<LoadingFallback />}>
          <AffiliatePortal onBack={() => startTransition(() => setCurrentView('landing'))} />
        </Suspense>
      ) : currentView === 'investor-deck' ? (
        <Suspense fallback={<LoadingFallback />}>
          <InvestorDeck onBack={() => startTransition(() => setCurrentView('landing'))} />
        </Suspense>
      ) : currentView === 'platform-admin' ? (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard onNavigate={(page) => startTransition(() => setCurrentView(page))} />
          </Suspense>
        </ErrorBoundary>
      ) : currentView === 'download' ? (
        <Suspense fallback={<LoadingFallback />}>
          <DownloadApp />
        </Suspense>
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage 
            onTryDemo={() => startTransition(() => setCurrentView('customer-app'))} 
            onRegisterBusiness={() => startTransition(() => setCurrentView('business-auth'))}
            onNavigate={(page) => startTransition(() => setCurrentView(page))}
          />
        </Suspense>
      )}
    </div>
  );
}