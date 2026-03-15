import { useEffect, useState } from 'react';
import { Smartphone, Download, CheckCircle2, Apple, Loader2 } from 'lucide-react';

/**
 * Smart App Download Redirect Page
 * Detects platform (iOS/Android/Desktop) and redirects to appropriate store or PWA
 * Preserves affiliate referral codes across all platforms
 */

export default function DownloadApp() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    // Get referral code from URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    setReferralCode(refCode);

    // Detect platform
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    let detectedPlatform: 'ios' | 'android' | 'desktop' = 'desktop';

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      detectedPlatform = 'ios';
    }
    // Android detection
    else if (/android/i.test(userAgent)) {
      detectedPlatform = 'android';
    }

    setPlatform(detectedPlatform);

    // Auto-redirect after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect(detectedPlatform, refCode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRedirect = (targetPlatform: 'ios' | 'android' | 'desktop', refCode: string | null) => {
    const baseUrl = 'https://myvibes-hazel.vercel.app/app';
    const version = 'v=2.1.1';
    const timestamp = `ts=${Date.now()}`;
    const refParam = refCode ? `&ref=${refCode}` : '';

    switch (targetPlatform) {
      case 'ios':
        // For iOS: Try to open app via universal link, fallback to App Store or PWA
        // If you have an App Store URL, use it here
        const iosAppStoreUrl = null; // 'https://apps.apple.com/app/myvibes/id123456789';
        
        if (iosAppStoreUrl) {
          // Try universal link first (if app is installed)
          window.location.href = `myvibes://app?${version}&${timestamp}${refParam}`;
          
          // Fallback to App Store after delay
          setTimeout(() => {
            window.location.href = iosAppStoreUrl;
          }, 500);
        } else {
          // No App Store listing yet - redirect to PWA
          window.location.href = `${baseUrl}?${version}&${timestamp}${refParam}`;
        }
        break;

      case 'android':
        // For Android: Try to open app via intent, fallback to Google Play or PWA
        const androidPlayStoreUrl = null; // 'https://play.google.com/store/apps/details?id=za.co.myvibes';
        
        if (androidPlayStoreUrl) {
          // Try app intent first (if app is installed)
          window.location.href = `intent://app?${version}&${timestamp}${refParam}#Intent;scheme=myvibes;package=za.co.myvibes;S.browser_fallback_url=${encodeURIComponent(androidPlayStoreUrl)};end`;
        } else {
          // No Play Store listing yet - redirect to PWA
          window.location.href = `${baseUrl}?${version}&${timestamp}${refParam}`;
        }
        break;

      default:
        // Desktop: redirect to PWA
        window.location.href = `${baseUrl}?${version}&${timestamp}${refParam}`;
        break;
    }
  };

  const handleManualRedirect = () => {
    if (platform) {
      setRedirecting(true);
      handleRedirect(platform, referralCode);
    }
  };

  const cancelRedirect = () => {
    setRedirecting(false);
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios':
        return <Apple className="w-16 h-16 text-white" />;
      case 'android':
        return (
          <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z"/>
          </svg>
        );
      default:
        return <Smartphone className="w-16 h-16 text-white" />;
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'ios':
        return 'iOS';
      case 'android':
        return 'Android';
      default:
        return 'Web';
    }
  };

  if (!platform) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold">Detecting your device...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        {/* App Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          {getPlatformIcon()}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to MYVIBES
        </h1>
        
        {/* Referral Badge */}
        {referralCode && (
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-6">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Referral Code: {referralCode}</span>
          </div>
        )}

        {/* Platform Detection */}
        <p className="text-gray-600 mb-6">
          {platform === 'desktop' 
            ? 'Opening MYVIBES Web App...'
            : `Detected: ${getPlatformName()} device`
          }
        </p>

        {/* Countdown or Manual Options */}
        {redirecting ? (
          <>
            <div className="mb-6">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={226}
                    strokeDashoffset={226 * (countdown / 3)}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">{countdown}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>

            <button
              onClick={cancelRedirect}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancel auto-redirect
            </button>
          </>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {/* Primary Download Button */}
              <button
                onClick={handleManualRedirect}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl py-4 px-6 font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <Download className="w-6 h-6" />
                {platform === 'ios' && 'Download for iOS'}
                {platform === 'android' && 'Download for Android'}
                {platform === 'desktop' && 'Open Web App'}
              </button>

              {/* Alternative Options */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">Or choose your platform:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const baseUrl = 'https://myvibes-hazel.vercel.app/app';
                      const refParam = referralCode ? `&ref=${referralCode}` : '';
                      window.location.href = `${baseUrl}?v=2.1.1&ts=${Date.now()}${refParam}`;
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-3 px-4 text-sm font-semibold transition-colors"
                  >
                    <Apple className="w-5 h-5" />
                    iOS
                  </button>
                  <button
                    onClick={() => {
                      const baseUrl = 'https://myvibes-hazel.vercel.app/app';
                      const refParam = referralCode ? `&ref=${referralCode}` : '';
                      window.location.href = `${baseUrl}?v=2.1.1&ts=${Date.now()}${refParam}`;
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-3 px-4 text-sm font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.6,9.48l1.84-3.18c0.16-0.31,0.04-0.69-0.26-0.85c-0.29-0.15-0.65-0.06-0.83,0.22l-1.88,3.24 c-2.86-1.21-6.08-1.21-8.94,0L5.65,5.67c-0.19-0.29-0.58-0.38-0.87-0.2C4.5,5.65,4.41,6.01,4.56,6.3L6.4,9.48 C3.3,11.25,1.28,14.44,1,18h22C22.72,14.44,20.7,11.25,17.6,9.48z M7,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25S8.25,13.31,8.25,14C8.25,14.69,7.69,15.25,7,15.25z M17,15.25c-0.69,0-1.25-0.56-1.25-1.25 c0-0.69,0.56-1.25,1.25-1.25s1.25,0.56,1.25,1.25C18.25,14.69,17.69,15.25,17,15.25z"/>
                    </svg>
                    Android
                  </button>
                </div>
              </div>
            </div>

            {referralCode && (
              <p className="text-xs text-gray-500">
                Your referral code will be automatically applied
              </p>
            )}
          </>
        )}

        {/* Features List */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-left">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            What you'll get:
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>Discover top hospitality venues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
              <span>Earn loyalty points on check-ins</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              <span>Access exclusive deals & specials</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}