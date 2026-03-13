import { useEffect, useRef } from 'react';

/**
 * Performance monitoring hook
 * Only logs in development mode
 */
export function usePerformance(componentName: string) {
  const renderCount = useRef(0);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    renderCount.current += 1;
    
    if (isDev && renderCount.current > 1) {
      console.log(`🔄 ${componentName} re-rendered (${renderCount.current} times)`);
    }
  });

  return {
    logAction: (action: string, data?: any) => {
      if (isDev) {
        console.log(`[${componentName}] ${action}`, data || '');
      }
    }
  };
}

/**
 * Conditional console.log that only runs in development
 */
export const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

/**
 * Conditional console.error that always runs
 */
export const devError = (...args: any[]) => {
  console.error(...args);
};
