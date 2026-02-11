/**
 * Stability Verification Script
 * 
 * Run this in your browser console to check for common loop/stability issues
 * 
 * Usage:
 * 1. Open your MYVIBES app
 * 2. Open Chrome DevTools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter
 * 6. Wait 10 seconds
 * 7. Check the results
 */

(function() {
  console.clear();
  console.log('%c🔍 MYVIBES Stability Verification Script', 'background: #0EA5E9; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('Starting 10-second monitoring period...\n');

  // Tracking variables
  let renderCount = 0;
  let apiCallCount = 0;
  let consoleLogCount = 0;
  const apiCalls = new Map();
  const consoleLogs = [];
  
  // Hook into fetch to track API calls
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    apiCallCount++;
    
    if (apiCalls.has(url)) {
      apiCalls.set(url, apiCalls.get(url) + 1);
    } else {
      apiCalls.set(url, 1);
    }
    
    return originalFetch.apply(this, args);
  };
  
  // Hook into console.log to track logs
  const originalLog = console.log;
  console.log = function(...args) {
    consoleLogCount++;
    const message = args.map(a => typeof a === 'string' ? a : '').join(' ');
    
    if (message.includes('🟣 INITIAL LOCATION') || 
        message.includes('🔍 Fetching business') ||
        message.includes('fetchAffiliates') ||
        message.includes('EFFECT TRIGGERED')) {
      consoleLogs.push({ time: Date.now(), message });
    }
    
    return originalLog.apply(console, args);
  };
  
  // Wait 10 seconds and analyze
  setTimeout(() => {
    // Restore original functions
    window.fetch = originalFetch;
    console.log = originalLog;
    
    console.log('\n%c📊 STABILITY REPORT', 'background: #10B981; color: white; padding: 8px; font-size: 14px; font-weight: bold;');
    console.log('═'.repeat(60));
    
    // Overall health score
    let healthScore = 100;
    const issues = [];
    
    // Check 1: API call frequency
    console.log('\n📡 API Calls:');
    console.log(`   Total: ${apiCallCount} calls in 10 seconds`);
    
    if (apiCallCount > 50) {
      healthScore -= 30;
      issues.push('⚠️ Excessive API calls detected (>50 in 10s)');
      console.log('   %c⚠️ WARNING: Excessive API calls!', 'color: orange; font-weight: bold');
    } else if (apiCallCount > 20) {
      healthScore -= 10;
      issues.push('⚠️ High API call frequency (>20 in 10s)');
      console.log('   %c⚠️ CAUTION: High API call frequency', 'color: orange');
    } else {
      console.log('   %c✅ Normal API activity', 'color: green; font-weight: bold');
    }
    
    // Check repeated calls
    let hasRepeatedCalls = false;
    apiCalls.forEach((count, url) => {
      if (count > 5) {
        hasRepeatedCalls = true;
        const shortUrl = url.length > 60 ? url.substring(0, 60) + '...' : url;
        console.log(`   %c🔁 ${shortUrl} (${count}x)`, 'color: red');
        healthScore -= 10;
        issues.push(`Repeated API call detected: ${count} times`);
      }
    });
    
    // Check 2: Console log frequency (critical loops)
    console.log('\n📝 Critical Console Logs:');
    console.log(`   Total: ${consoleLogs.length} critical logs in 10 seconds`);
    
    if (consoleLogs.length > 10) {
      healthScore -= 30;
      issues.push('⚠️ Infinite loop detected (critical log repeated >10x)');
      console.log('   %c🚨 CRITICAL: Possible infinite loop!', 'color: red; font-weight: bold');
      
      // Show first 5 repeated logs
      const grouped = {};
      consoleLogs.forEach(log => {
        const key = log.message.substring(0, 50);
        grouped[key] = (grouped[key] || 0) + 1;
      });
      
      Object.entries(grouped).slice(0, 5).forEach(([msg, count]) => {
        if (count > 1) {
          console.log(`   🔁 "${msg}..." (${count}x)`);
        }
      });
    } else if (consoleLogs.length > 5) {
      healthScore -= 10;
      issues.push('⚠️ Multiple re-renders detected');
      console.log('   %c⚠️ CAUTION: Multiple re-renders', 'color: orange');
    } else {
      console.log('   %c✅ Normal render cycle', 'color: green; font-weight: bold');
    }
    
    // Check 3: Browser performance
    console.log('\n⚡ Performance:');
    if (performance && performance.memory) {
      const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      console.log(`   Memory: ${memoryMB} MB`);
      
      if (performance.memory.usedJSHeapSize > 100 * 1048576) {
        healthScore -= 10;
        issues.push('⚠️ High memory usage (>100MB)');
        console.log('   %c⚠️ High memory usage', 'color: orange');
      } else {
        console.log('   %c✅ Memory usage normal', 'color: green');
      }
    }
    
    // Final health score
    console.log('\n' + '═'.repeat(60));
    
    if (healthScore >= 90) {
      console.log(`\n%c✅ HEALTH SCORE: ${healthScore}/100 - EXCELLENT`, 'background: #10B981; color: white; padding: 10px; font-size: 14px; font-weight: bold');
      console.log('\n🎉 Your app is stable and performing well!');
      console.log('   • No infinite loops detected');
      console.log('   • API calls are optimized');
      console.log('   • Render cycle is healthy');
    } else if (healthScore >= 70) {
      console.log(`\n%c⚠️ HEALTH SCORE: ${healthScore}/100 - GOOD`, 'background: #F59E0B; color: white; padding: 10px; font-size: 14px; font-weight: bold');
      console.log('\n⚠️ Minor issues detected:');
      issues.forEach(issue => console.log(`   • ${issue}`));
      console.log('\n💡 Recommended: Monitor for patterns and optimize if needed.');
    } else {
      console.log(`\n%c🚨 HEALTH SCORE: ${healthScore}/100 - NEEDS ATTENTION`, 'background: #EF4444; color: white; padding: 10px; font-size: 14px; font-weight: bold');
      console.log('\n🚨 Critical issues detected:');
      issues.forEach(issue => console.log(`   • ${issue}`));
      console.log('\n📚 Next steps:');
      console.log('   1. Check /QUICK_FIX_SUMMARY.md for solutions');
      console.log('   2. Hard refresh the page (Ctrl+Shift+R)');
      console.log('   3. Clear localStorage and try again');
      console.log('   4. Check browser console for error messages');
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('%c📖 For detailed fixes, see /QUICK_FIX_SUMMARY.md', 'color: #0EA5E9; font-weight: bold');
    console.log('');
    
  }, 10000);
  
  console.log('⏱️ Monitoring for 10 seconds...');
  console.log('   (You can navigate through the app during this time)');
  console.log('');
  
})();
