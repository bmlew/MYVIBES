/**
 * App Configuration
 * Centralized configuration for URLs and app settings
 */

/**
 * Get the app's base URL
 * In production, this should be your custom domain
 * During development, falls back to current origin
 */
export function getAppUrl(): string {
  // 🔧 TODO: Replace this with your actual production domain
  // Examples:
  // - return 'https://myvibes.co.za';
  // - return 'https://app.myvibes.co.za';
  // - return 'https://www.myvibes.com';
  
  // ✅ PRODUCTION: Set your actual domain here
  const PRODUCTION_URL = 'https://myvibes.co.za'; // 👈 UPDATE THIS
  
  // If production URL is configured, use it
  if (PRODUCTION_URL) {
    return PRODUCTION_URL;
  }
  
  // Otherwise, use current origin (works for local dev and preview)
  return window.location.origin;
}

/**
 * Get the customer app URL
 */
export function getCustomerAppUrl(): string {
  return `${getAppUrl()}/app`;
}

/**
 * Get a referral link for an affiliate code
 */
export function getReferralLink(code: string): string {
  return `${getAppUrl()}/?ref=${code}`;
}

/**
 * Get a business registration referral link for an affiliate code
 */
export function getBusinessReferralLink(code: string): string {
  return `${getAppUrl()}/business-register?ref=${code}`;
}

/**
 * Get a customer app download referral link for an affiliate code
 */
export function getCustomerReferralLink(code: string): string {
  return `${getAppUrl()}/?ref=${code}&type=customer`;
}

/**
 * Get a venue share link
 */
export function getVenueShareUrl(venueId: string, version?: string): string {
  const baseUrl = getAppUrl();
  const timestamp = Date.now();
  const versionParam = version || '2.1.1';
  return `${baseUrl}/app?v=${versionParam}&ts=${timestamp}&venue=${venueId}`;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return !window.location.hostname.includes('figma.site') && 
         !window.location.hostname.includes('localhost');
}

/**
 * App metadata
 */
export const APP_NAME = 'MYVIBES';
export const APP_VERSION = '2.1.1';
export const APP_DESCRIPTION = 'Discover the best hospitality venues and specials in South Africa';