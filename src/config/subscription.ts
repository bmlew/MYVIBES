/**
 * MYVIBE Subscription Configuration
 * 
 * Central configuration for all subscription-related pricing.
 * Update these values to change prices across the entire application.
 */

export const SUBSCRIPTION_CONFIG = {
  // Base subscription prices (in ZAR)
  MONTHLY_PRICE: 499,
  ML_INSIGHTS_PRICE: 149,
  
  // Formatted display strings (pre-computed to avoid getter issues)
  MONTHLY_PRICE_FORMATTED: 'R499',
  ML_INSIGHTS_PRICE_FORMATTED: 'R149',
  
  // Annual calculations (pre-computed)
  ANNUAL_PRICE: 5988, // 499 * 12
  ANNUAL_PRICE_FORMATTED: 'R5,988',
  
  // ML Insights annual (pre-computed)
  ML_INSIGHTS_ANNUAL: 1788, // 149 * 12
  ML_INSIGHTS_ANNUAL_FORMATTED: 'R1,788',
  
  // Feature names
  PLAN_NAME: 'MYVIBE Business',
  ML_INSIGHTS_NAME: 'ML Insights Included',
} as const;

export default SUBSCRIPTION_CONFIG;
