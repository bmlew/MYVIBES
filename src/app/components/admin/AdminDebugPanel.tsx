import { useState } from 'react';
import { Bug, RefreshCw, X, Lock, Eye, EyeOff, Info, Download, Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import * as api from '@/utils/api';
import { getVersionInfo, checkForUpdate, triggerUpdate } from '@/utils/version';

/**
 * Admin Debug Panel - Password Protected
 * 
 * Secure access to system debugging, database management, and version control.
 * Requires admin credentials to access sensitive operations.
 */

interface AdminDebugPanelProps {
  businessCount?: number;
  onRefresh?: () => void;
}

// Admin credentials - In production, these should be in environment variables
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'myvibes2025'; // Change this to your secure password

export function AdminDebugPanel({ businessCount = 0, onRefresh }: AdminDebugPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [showPanel, setShowPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [sending, setSending] = useState(false);
  const [seedingManual, setSeedingManual] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      setLoginError('');
      setUsername('');
      setPassword('');
      // Auto-open panel after successful login
      setShowPanel(true);
      fetchDebugInfo();
    } else {
      setLoginError('Invalid credentials. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowPanel(false);
  };

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/debug/list-keys`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data);
      }

      // Check for updates
      const hasUpdate = await checkForUpdate();
      setUpdateAvailable(hasUpdate);
    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await triggerUpdate();
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed. Please try clearing cache manually.');
      setUpdating(false);
    }
  };

  const clearCacheAndRefresh = () => {
    // Clear all VIBESPOT cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vibespot_')) {
        localStorage.removeItem(key);
      }
    });
    
    if (onRefresh) onRefresh();
    alert('Cache cleared! App data refreshed.');
  };

  const forceReseed = async () => {
    if (!confirm('⚠️ WARNING: This will CLEAR ALL existing data and re-seed the database.\n\nThis action cannot be undone. Continue?')) {
      return;
    }

    setReseeding(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/reseed`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Re-seed successful:', result);
        
        // Clear cache and refresh
        clearCacheAndRefresh();
        
        alert('✅ Database re-seeded successfully! Refreshing app...');
      } else if (response.status === 429) {
        const error = await response.json();
        console.warn('⚠️ Seeding already in progress:', error);
        alert('⚠️ Seeding is already in progress. Please wait for it to complete.');
      } else {
        const error = await response.text();
        console.error('❌ Re-seed failed:', error);
        alert('❌ Failed to re-seed database. Check console for details.');
      }
    } catch (error) {
      console.error('Error re-seeding database:', error);
      alert('❌ Error re-seeding database. Check console for details.');
    } finally {
      setReseeding(false);
    }
  };

  const sendEventReminders = async () => {
    setSending(true);
    try {
      const result = await api.sendEventReminders();
      console.log('📬 Event reminders result:', result);
      alert(`✅ Event reminders sent!\n\n${result.reminders_sent} reminders sent for ${result.events_checked} event interests.`);
    } catch (error) {
      console.error('Error sending event reminders:', error);
      alert('❌ Failed to send event reminders. Check console for details.');
    } finally {
      setSending(false);
    }
  };

  const seedSampleContent = async (type: 'menu' | 'specials' | 'bulk_menu' | 'bulk_specials') => {
    const businessId = prompt('Enter Business ID to seed (or leave empty to create a new \"Demo Business\"):', '');
    
    if (businessId === null) return; // Cancelled
    
    setSeedingManual(true);
    try {
       const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/seed-content`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${publicAnonKey}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           type,
           target_business_id: businessId || undefined
         })
       });
       
       const data = await response.json();
       
       if (response.ok) {
         alert(`✅ Success!\n${data.message}\n\nCreated ${data.count} items.`);
         if (onRefresh) onRefresh();
       } else {
         alert(`❌ Error: ${data.error}`);
       }
    } catch (e: any) {
      alert(`❌ Error: ${e.message}`);
    } finally {
      setSeedingManual(false);
    }
  };

  return (
    <>
      {/* Main Access Button */}
      <button
        onClick={() => {
          if (isAuthenticated) {
            setShowPanel(!showPanel);
            if (!showPanel) fetchDebugInfo();
          } else {
            setShowLoginModal(true);
          }
        }}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors shadow-lg"
        title="Admin Debug Panel"
      >
        <Shield className="w-5 h-5" />
        <span className="font-semibold">Debug Panel</span>
        {isAuthenticated && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Unlocked</span>}
      </button>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Admin Authentication</h2>
                  <p className="text-sm text-gray-500">Secure access required</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                  setUsername('');
                  setPassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter admin username"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-colors"
              >
                Authenticate
              </button>

              <p className="text-xs text-gray-500 text-center">
                🔒 This panel contains sensitive system operations. Admin access only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {showPanel && isAuthenticated && (
        <div className="fixed top-24 right-4 z-50 bg-white rounded-2xl shadow-2xl p-6 w-96 max-h-[85vh] overflow-y-auto border-2 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
                <Bug className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Admin Debug Panel</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                title="Lock Panel"
              >
                <Lock className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {/* Version Info Section */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-200">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-cyan-700" />
                <p className="font-semibold text-cyan-900">App Version</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-cyan-700 font-medium">Version:</span>
                  <span className="text-cyan-900 font-semibold">{getVersionInfo().version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-700 font-medium">Build ID:</span>
                  <span className="text-cyan-900 font-mono">{getVersionInfo().buildId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-700 font-medium">Build Time:</span>
                  <span className="text-cyan-900">{getVersionInfo().timestamp}</span>
                </div>
              </div>
              
              {updateAvailable && (
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  {updating ? 'Updating...' : 'Install Update Now'}
                </button>
              )}
              
              {!updateAvailable && !loading && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-cyan-700 bg-cyan-100 py-2 px-3 rounded-lg">
                  ✅ Latest Version Installed
                </div>
              )}
            </div>

            {/* Database Stats */}
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
              <p className="font-semibold text-blue-900 mb-2">App State</p>
              <p className="text-blue-700 text-xs">Loaded: <strong>{businessCount}</strong> businesses</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading database info...</span>
              </div>
            ) : debugInfo ? (
              <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                <p className="font-semibold text-green-900 mb-2">Database</p>
                <div className="space-y-1 text-xs text-green-700">
                  <p>📍 {debugInfo.total_businesses} businesses</p>
                  <p>🎉 {debugInfo.total_specials} specials</p>
                  <p>🎪 {debugInfo.total_events} events</p>
                </div>
                
                {debugInfo.business_ids && debugInfo.business_ids.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold text-gray-700 text-xs mb-2">Business List:</p>
                    <div className="max-h-32 overflow-y-auto bg-white p-2 rounded border border-gray-200 text-xs space-y-2">
                      {debugInfo.business_ids.map((b: any) => (
                        <div key={b.id} className="pb-2 border-b border-gray-100 last:border-0">
                          <p className="font-semibold text-gray-900">{b.name}</p>
                          <p className="text-gray-500 text-[10px] font-mono">{b.id}</p>
                          <p className="text-gray-600">{b.city}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Content Seeding */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-gray-500">Content Seeding</h4>
              <div className="grid grid-cols-2 gap-2">
                 <button
                   onClick={() => seedSampleContent('menu')}
                   disabled={seedingManual}
                   className="bg-purple-100 text-purple-700 py-2 px-2 rounded-lg hover:bg-purple-200 text-xs font-medium disabled:opacity-50"
                 >
                   + 3 Menu Items
                 </button>
                 <button
                   onClick={() => seedSampleContent('bulk_menu')}
                   disabled={seedingManual}
                   className="bg-purple-100 text-purple-700 py-2 px-2 rounded-lg hover:bg-purple-200 text-xs font-medium disabled:opacity-50"
                 >
                   + 20 Menu Items
                 </button>
                 <button
                   onClick={() => seedSampleContent('specials')}
                   disabled={seedingManual}
                   className="bg-orange-100 text-orange-700 py-2 px-2 rounded-lg hover:bg-orange-200 text-xs font-medium disabled:opacity-50"
                 >
                   + 3 Specials
                 </button>
                 <button
                   onClick={() => seedSampleContent('bulk_specials')}
                   disabled={seedingManual}
                   className="bg-orange-100 text-orange-700 py-2 px-2 rounded-lg hover:bg-orange-200 text-xs font-medium disabled:opacity-50"
                 >
                   + 5 Specials
                 </button>
              </div>
            </div>

            {/* Maintenance Operations */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-gray-500">Maintenance</h4>
              
              <button
                onClick={clearCacheAndRefresh}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Cache & Refresh
              </button>
              
              <button
                onClick={fetchDebugInfo}
                className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Reload Debug Info
              </button>
              
              <button
                onClick={sendEventReminders}
                className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Event Reminders'}
              </button>
            </div>

            {/* Dangerous Operations */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <h4 className="font-bold text-xs uppercase text-red-500 flex items-center gap-2">
                ⚠️ Danger Zone
              </h4>
              
              <button
                onClick={forceReseed}
                className="w-full bg-red-500 text-white py-2.5 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                disabled={reseeding}
              >
                {reseeding ? 'Reseeding Database...' : 'Force Reseed Database'}
              </button>
              
              <button
                onClick={async () => {
                   if (confirm('⚠️ Delete all data for support@get-digital.co.za?\n\nThis cannot be undone!')) {
                     try {
                        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/cleanup-digital-user`, {
                          headers: {
                            'Authorization': `Bearer ${publicAnonKey}`
                          }
                        });
                        const data = await res.json();
                        console.log('Cleanup Result:', data);
                        alert(`✅ Cleanup Complete:\n${data.message}\n\nLog:\n${data.debug_log?.join('\n')}`);
                     } catch(e) {
                        alert(`❌ Error: ${e}`);
                     }
                   }
                }}
                className="w-full bg-red-800 text-white py-2.5 px-4 rounded-lg hover:bg-red-900 transition-colors text-sm font-medium"
              >
                Cleanup Digital User
              </button>
            </div>

            <div className="text-xs text-gray-500 border-t pt-3 mt-2">
              <p className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <strong>Secure Mode:</strong> Admin authenticated
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
