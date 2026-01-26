import { useState } from 'react';
import { Bug, RefreshCw, X, Bell } from 'lucide-react';
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
        <div className="fixed top-32 right-4 z-50 bg-white rounded-lg shadow-2xl p-4 w-80 max-h-96 overflow-y-auto border-2 border-gray-300">
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
                          <p className="font-semibold">{b.name}</p>
                          <p className="text-gray-600">{b.city}</p>
                          <p className="text-gray-500 text-xs">
                            {b.latitude?.toFixed(4)}, {b.longitude?.toFixed(4)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
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
            </div>

            <div className="text-xs text-gray-500 border-t pt-2">
              <p><strong>Tip:</strong> If your restaurant isn't showing, try "Clear Cache & Refresh"</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}