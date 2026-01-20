/**
 * MYVIBES Platform Configuration
 * Central configuration for pricing and other platform settings
 */

export const CONFIG = {
  // Pricing Configuration
  pricing: {
    baseSubscription: 499, // Monthly subscription fee in ZAR
    mlInsights: 149, // ML Insights add-on monthly fee in ZAR (now included in base)
    premiumCarouselMin: 500, // Minimum premium carousel fee
    premiumCarouselMax: 1500, // Maximum premium carousel fee
  },

  // Platform Settings
  platform: {
    name: 'MYVIBES',
    tagline: 'Find your vibe tonight',
    supportEmail: 'vibespotowner@get-digital.co.za',
    supportPhone: '+27 76 205 5155',
    supportHours: 'Mon-Fri 9AM-5PM SAST',
    website: 'www.myvibes.co.za',
  },

  // Market Settings
  market: {
    currency: 'R',
    country: 'South Africa',
    initialCity: 'Johannesburg',
  },

  // Trial Settings
  trial: {
    duration: 60, // Free trial days
    enabled: true,
  },

  // Notification Settings
  notifications: {
    pollingInterval: 30000, // 30 seconds
    soundEnabled: true,
  },

  // Feature Flags
  features: {
    mlInsights: true,
    premiumCarousel: true,
    whatsappIntegration: true,
    offlineMode: true,
    eventReminders: true,
  }
};

// Helper function to format currency
export const formatPrice = (amount: number): string => {
  return `${CONFIG.market.currency}${amount.toLocaleString()}`;
};

// Helper function to get total monthly cost
export const getTotalMonthlyPrice = (includeMLInsights: boolean = false): number => {
  let total = CONFIG.pricing.baseSubscription;
  if (includeMLInsights) {
    total += CONFIG.pricing.mlInsights;
  }
  return total;
};

// Helper function to calculate annual revenue
export const calculateAnnualRevenue = (subscribers: number, mlInsightsPercentage: number = 0.3): number => {
  const baseRevenue = subscribers * CONFIG.pricing.baseSubscription * 12;
  const mlRevenue = subscribers * mlInsightsPercentage * CONFIG.pricing.mlInsights * 12;
  return baseRevenue + mlRevenue;
};

// Helper function to get display prices for marketing
export const getMarketingPrices = () => {
  return {
    base: formatPrice(CONFIG.pricing.baseSubscription),
    mlInsights: formatPrice(CONFIG.pricing.mlInsights),
    total: formatPrice(getTotalMonthlyPrice(true)),
    baseOnly: formatPrice(CONFIG.pricing.baseSubscription),
  };
};