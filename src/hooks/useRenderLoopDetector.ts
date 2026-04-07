import { useEffect, useRef } from 'react';

/**
 * Circuit breaker hook to detect and prevent infinite render loops
 * Throws an error if component renders too many times in a short period
 */
export function useRenderLoopDetector(componentName: string, maxRenders: number = 100) {
  const renderCount = useRef(0);
  const firstRenderTime = useRef<number | null>(null);
  const hasThrown = useRef(false);

  // Track render
  renderCount.current += 1;
  
  if (firstRenderTime.current === null) {
    firstRenderTime.current = Date.now();
  }

  const timeSinceFirst = Date.now() - firstRenderTime.current;
  const current = renderCount.current;

  // Reset counter after 5 seconds
  useEffect(() => {
    if (timeSinceFirst > 5000) {
      console.log(`♻️ ${componentName}: Resetting render counter (${current} renders in ${timeSinceFirst}ms)`);
      renderCount.current = 0;
      firstRenderTime.current = Date.now();
    }
  }, [current, timeSinceFirst, componentName]);

  // Detect infinite loop
  if (current > maxRenders && !hasThrown.current) {
    hasThrown.current = true;
    console.error(`🚨 INFINITE LOOP DETECTED in ${componentName}!`);
    console.error(`   ${current} renders in ${timeSinceFirst}ms`);
    console.error('   This is likely caused by:');
    console.error('   - Missing useEffect dependencies');
    console.error('   - State update inside render');
    console.error('   - Unstable object/array references');
    
    throw new Error(
      `Infinite render loop detected in ${componentName}. ` +
      `Component rendered ${current} times in ${timeSinceFirst}ms. ` +
      `Check console for details.`
    );
  }

  // Warning at 50%
  if (current === Math.floor(maxRenders / 2)) {
    console.warn(`⚠️ ${componentName}: High render count (${current}/${maxRenders})`);
  }
}
