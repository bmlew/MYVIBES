/**
 * Version Management Utility
 * 
 * Centralizes version checking and comparison across the app
 */

export const APP_VERSION = '2.1.3';
export const BUILD_TIMESTAMP = '2025-03-13T16:00:00Z';
export const BUILD_ID = 'v2.1.3-build-213';

/**
 * Get the deployed version from the HTML meta tag
 */
export function getDeployedVersion(): string {
  const metaVersion = document.querySelector('meta[name="app-version"]')?.getAttribute('content');
  return metaVersion || APP_VERSION;
}

/**
 * Get the build timestamp from the HTML meta tag
 */
export function getBuildTimestamp(): string {
  const metaTimestamp = document.querySelector('meta[name="build-timestamp"]')?.getAttribute('content');
  return metaTimestamp || BUILD_TIMESTAMP;
}

/**
 * Get the build ID from the HTML meta tag
 */
export function getBuildId(): string {
  const metaBuildId = document.querySelector('meta[name="build-id"]')?.getAttribute('content');
  return metaBuildId || BUILD_ID;
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

/**
 * Check if a new version is available
 */
export async function checkForUpdate(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    return !!registration?.waiting;
  } catch (error) {
    console.error('Error checking for update:', error);
    return false;
  }
}

/**
 * Trigger an update if one is available
 */
export async function triggerUpdate(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for the new service worker to take control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } else {
      // No waiting worker, just check for updates
      await registration?.update();
      window.location.reload();
    }
  } catch (error) {
    console.error('Error triggering update:', error);
    throw error;
  }
}

/**
 * Get all version information
 */
export function getVersionInfo() {
  return {
    version: getDeployedVersion(),
    buildTimestamp: getBuildTimestamp(),
    buildId: getBuildId(),
    timestamp: new Date(getBuildTimestamp()).toLocaleString(),
  };
}

/**
 * Log version information to console
 */
export function logVersionInfo(): void {
  const info = getVersionInfo();
  
  console.log('%c🚀 MYVIBES Version Info', 'color: #06b6d4; font-size: 16px; font-weight: bold;');
  console.log(`Version: ${info.version}`);
  console.log(`Build ID: ${info.buildId}`);
  console.log(`Build Time: ${info.timestamp}`);
  
  // Check for service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration?.active) {
        console.log('✅ Service Worker: Active');
        console.log(`   State: ${registration.active.state}`);
      }
      if (registration?.waiting) {
        console.log('🔄 Update Available: New version waiting');
      }
    });
  }
}

/**
 * Clear version-related cache
 */
export async function clearVersionCache(): Promise<void> {
  try {
    // Clear all caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    
    // Clear localStorage update flags
    localStorage.removeItem('myvibes_dismissed_update_version');
    
    console.log('✅ Version cache cleared');
  } catch (error) {
    console.error('Error clearing version cache:', error);
    throw error;
  }
}
