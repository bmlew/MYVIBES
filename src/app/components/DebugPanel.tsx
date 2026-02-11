import { useState } from 'react';
import { Bug, RefreshCw, X, Bell, Database } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import * as api from '@/utils/api';

interface DebugPanelProps {
  businessCount: number;
  onRefresh: () => void;
}

export function DebugPanel({ businessCount, onRefresh }: DebugPanelProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [sending, setSending] = useState(false);
  const [seedingManual, setSeedingManual] = useState(false);

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
    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCacheAndRefresh = () => {
    // Clear all VIBESPOT cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vibespot_')) {
        localStorage.removeItem(key);
      }
    });
    
    onRefresh();
    setShowPanel(false);
    alert('Cache cleared! App will now reload fresh data.');
  };

  const forceReseed = async () => {
    if (!confirm('This will clear ALL existing data and re-seed the database with fresh data and new logos. Continue?')) {
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
        
        alert('Database re-seeded successfully with new logos! Refreshing app...');
      } else if (response.status === 429) {
        const error = await response.json();
        console.warn('⚠️ Seeding already in progress:', error);
        alert('Seeding is already in progress. Please wait for it to complete.');
      } else {
        const error = await response.text();
        console.error('❌ Re-seed failed:', error);
        alert('Failed to re-seed database. Check console for details.');
      }
    } catch (error) {
      console.error('Error re-seeding database:', error);
      alert('Error re-seeding database. Check console for details.');
    } finally {
      setReseeding(false);
    }
  };

  const sendEventReminders = async () => {
    setSending(true);
    try {
      const result = await api.sendEventReminders();
      console.log('📬 Event reminders result:', result);
      alert(`Event reminders sent! ${result.reminders_sent} reminders sent for ${result.events_checked} event interests.`);
    } catch (error) {
      console.error('Error sending event reminders:', error);
      alert('Failed to send event reminders. Check console for details.');
    } finally {
      setSending(false);
    }
  };

  const seedSampleContent = async (type: 'menu' | 'specials' | 'bulk_menu' | 'bulk_specials') => {
    // Prompt for Business ID (or use a default one for demo)
    const businessId = prompt('Enter Business ID to seed (or leave empty to create a new "Demo Business"):', '');
    
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
         onRefresh(); // Refresh app to show new data
       } else {
         alert(`❌ Error: ${data.error}`);
       }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setSeedingManual(false);
    }
  };

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => {
          setShowPanel(!showPanel);
          if (!showPanel) fetchDebugInfo();
        }}
        className="fixed top-20 right-4 z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>

      {/* Debug Panel */}
      {showPanel && (
        <div className="fixed top-32 right-4 z-50 bg-white rounded-lg shadow-2xl p-4 w-80 max-h-[80vh] overflow-y-auto border-2 border-gray-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Debug Info
            </h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <p className="font-semibold text-blue-900">Loaded in App:</p>
              <p className="text-blue-700">{businessCount} businesses</p>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading database info...</p>
            ) : debugInfo ? (
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <p className="font-semibold text-green-900">In Database:</p>
                <p className="text-green-700">{debugInfo.total_businesses} businesses</p>
                <p className="text-green-700">{debugInfo.total_specials} specials</p>
                <p className="text-green-700">{debugInfo.total_events} events</p>
                
                {debugInfo.business_ids && debugInfo.business_ids.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold text-gray-700 text-xs mb-1">Business List:</p>
                    <div className="max-h-40 overflow-y-auto bg-white p-2 rounded border border-gray-200 text-xs">
                      {debugInfo.business_ids.map((b: any) => (
                        <div key={b.id} className="py-1 border-b border-gray-100 last:border-0">
                          <p className="font-semibold">{b.name} <span className="text-gray-400 font-normal">({b.id})</span></p>
                          <p className="text-gray-600">{b.city}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-xs uppercase text-gray-500 mt-2">Content Seeding</h4>
              <div className="grid grid-cols-2 gap-2">
                 <button
                   onClick={() => seedSampleContent('menu')}
                   disabled={seedingManual}
                   className="bg-purple-100 text-purple-700 py-2 px-2 rounded hover:bg-purple-200 text-xs font-medium"
                 >
                   + 3 Manual Menu
                 </button>
                 <button
                   onClick={() => seedSampleContent('bulk_menu')}
                   disabled={seedingManual}
                   className="bg-purple-100 text-purple-700 py-2 px-2 rounded hover:bg-purple-200 text-xs font-medium"
                 >
                   + 20 Bulk Menu
                 </button>
                 <button
                   onClick={() => seedSampleContent('specials')}
                   disabled={seedingManual}
                   className="bg-orange-100 text-orange-700 py-2 px-2 rounded hover:bg-orange-200 text-xs font-medium"
                 >
                   + 3 Manual Specials
                 </button>
                 <button
                   onClick={() => seedSampleContent('bulk_specials')}
                   disabled={seedingManual}
                   className="bg-orange-100 text-orange-700 py-2 px-2 rounded hover:bg-orange-200 text-xs font-medium"
                 >
                   + 5 Bulk Specials
                 </button>
              </div>

              <h4 className="font-bold text-xs uppercase text-gray-500 mt-2">Maintenance</h4>
              <button
                onClick={clearCacheAndRefresh}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-purple-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Cache & Refresh
              </button>
              
              <button
                onClick={fetchDebugInfo}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reload Debug Info
              </button>
              
              <button
                onClick={forceReseed}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                disabled={reseeding}
              >
                {reseeding ? 'Reseeding...' : 'Force Reseed'}
              </button>
              
              <button
                onClick={sendEventReminders}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Event Reminders'}
              </button>
              
              <button
                onClick={async () => {
                   if (confirm('Delete all data for support@get-digital.co.za?')) {
                     try {
                        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/cleanup-digital-user`, {
                          headers: {
                            'Authorization': `Bearer ${publicAnonKey}`
                          }
                        });
                        const data = await res.json();
                        console.log('Nuke Result:', data);
                        alert(`Cleanup Complete:\n${data.message}\n\nLog:\n${data.debug_log?.join('\n')}`);
                     } catch(e) {
                        alert(e);
                     }
                   }
                }}
                className="bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-900 transition-colors"
              >
                Nuke Digital User
              </button>
            </div>

            <div className="text-xs text-gray-500 border-t pt-2">
              <p><strong>Tip:</strong> Use "Clear Cache" if content doesn't update immediately.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}