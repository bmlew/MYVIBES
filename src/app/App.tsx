import React, { useState, useEffect, lazy, Suspense } from 'react';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { clearInvalidBusinessCache } from '@/utils/offlineStorage';
import '@/utils/fix-businesses'; // Import fix utilities for browser console

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
const BusinessAuth = lazy(() => import('./components/BusinessAuth').then(m => ({ default: m.BusinessAuth })));
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

export default function App() {
  console.log('🟦 Main App component rendered');
  console.log('🔍 Current view will be: landing');
  
  const [currentView, setCurrentView] = useState<'landing' | 'customer-app' | 'business-dashboard' | 'business-auth' | 'platform-admin' | 'whatsapp-review' | 'faq' | 'popia' | 'disclaimers' | 'affiliate-portal' | 'investor-deck'>('landing');
  const [reviewData, setReviewData] = useState<{ businessId?: string; customerName?: string; customerPhone?: string }>({});
  
  // Check if URL is for WhatsApp review
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    // Check for referral code
    const refCode = params.get('ref') || params.get('referral');
    if (refCode) {
      console.log('📢 Referral code detected:', refCode);
      localStorage.setItem('myvibes_referral_code', refCode.toUpperCase());
    }

    // Match /review/:businessId pattern
    const reviewMatch = path.match(/^\/review\/([^/]+)$/);
    if (reviewMatch) {
      const businessId = reviewMatch[1];
      
      // Validate the business ID - reject invalid IDs like business-1, business-2, business-3 (simple sequential IDs only, max 3 digits)
      if (businessId.match(/^business-[1-9]\d{0,2}$/)) {
        console.error(`❌ Invalid business ID in URL: ${businessId}. Redirecting to landing page.`);
        window.history.replaceState({}, '', '/');
        setCurrentView('landing');
        return;
      }
      
      const customerName = params.get('name') || undefined;
      const customerPhone = params.get('phone') || undefined;
      
      setReviewData({ businessId, customerName, customerPhone });
      setCurrentView('whatsapp-review');
      return;
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
    setCurrentView('landing');
  };

  return (
    <div>
      {/* PWA Components */}
      <InstallPrompt />
      <OfflineBanner />
      <Toaster />

      {/* Mode Switcher - Disabled for Production */}
      {false && currentView !== 'landing' && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 flex gap-2 flex-wrap max-w-xs sm:max-w-none">
          <button
            onClick={() => setCurrentView('landing')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'landing' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏠 Landing
          </button>
          <button
            onClick={() => setCurrentView('customer-app')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'customer-app' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📱 Customer
          </button>
          <button
            onClick={() => setCurrentView('business-auth')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'business-auth' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💼 Business
          </button>
          <button
            onClick={() => setCurrentView('roi')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'roi' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📈 ROI
          </button>
          <button
            onClick={() => setCurrentView('platform-admin')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentView === 'platform-admin' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛡️ Admin
          </button>
        </div>
      )}

      {/* Render the appropriate view */}
      {currentView === 'landing' ? (
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage 
            onTryDemo={() => setCurrentView('customer-app')} 
            onRegisterBusiness={() => setCurrentView('business-auth')}
            onNavigate={(page) => setCurrentView(page)}
          />
        </Suspense>
      ) : currentView === 'customer-app' ? (
        <Suspense fallback={<LoadingFallback />}>
          <CustomerApp />
        </Suspense>
      ) : currentView === 'business-auth' ? (
        <Suspense fallback={<LoadingFallback />}>
          <BusinessAuth onAuthSuccess={handleBusinessAuthSuccess} />
        </Suspense>
      ) : currentView === 'business-dashboard' ? (
        <Suspense fallback={<LoadingFallback />}>
          <BusinessDashboard onLogout={handleBusinessLogout} businessName={localStorage.getItem('business_name') || ''} />
        </Suspense>
      ) : currentView === 'roi' ? (
        <Suspense fallback={<LoadingFallback />}>
          <ROICalculator onBack={() => setCurrentView('customer-app')} />
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
          <FAQPage onBack={() => setCurrentView('landing')} />
        </Suspense>
      ) : currentView === 'popia' ? (
        <Suspense fallback={<LoadingFallback />}>
          <POPIAPage onBack={() => setCurrentView('landing')} />
        </Suspense>
      ) : currentView === 'disclaimers' ? (
        <Suspense fallback={<LoadingFallback />}>
          <DisclaimersPage onBack={() => setCurrentView('landing')} />
        </Suspense>
      ) : currentView === 'affiliate-portal' ? (
        <Suspense fallback={<LoadingFallback />}>
          <AffiliatePortal onBack={() => setCurrentView('landing')} />
        </Suspense>
      ) : currentView === 'investor-deck' ? (
        <Suspense fallback={<LoadingFallback />}>
          <InvestorDeck onBack={() => setCurrentView('landing')} />
        </Suspense>
      ) : currentView === 'platform-admin' ? (
        <Suspense fallback={<LoadingFallback />}>
          <AdminDashboard onNavigate={setCurrentView} />
        </Suspense>
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage 
            onTryDemo={() => setCurrentView('customer-app')} 
            onRegisterBusiness={() => setCurrentView('business-auth')}
            onNavigate={(page) => setCurrentView(page)}
          />
        </Suspense>
      )}
    </div>
  );
}