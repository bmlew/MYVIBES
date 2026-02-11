import React, { useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function ClearDataButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearData = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/admin/clear-all-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      setResult(data);
      console.log('Clear data result:', data);

      if (data.success) {
        alert('✅ All data cleared successfully!');
        // Clear all localStorage caches
        localStorage.clear();
        // Reload the page after 1 second with hard refresh
        setTimeout(() => {
          window.location.href = window.location.href;
          window.location.reload();
        }, 1000);
      } else {
        alert(`⚠️ ${data.message}\n\nCheck console for details.`);
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setResult({ error: error.message });
      alert('❌ Failed to clear data. Check console for details.');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
      <h3 className="text-lg font-bold text-red-900 mb-2">🗑️ Clear All Data</h3>
      <p className="text-sm text-red-700 mb-4">
        WARNING: This will permanently delete ALL data from:
      </p>
      <ul className="text-xs text-red-600 mb-4 list-disc list-inside">
        <li>All businesses</li>
        <li>All auth users</li>
        <li>All reviews, specials, events</li>
        <li>All payments and reservations</li>
        <li>All affiliates</li>
        <li>All analytics data</li>
        <li>KV store entries</li>
      </ul>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
        >
          Clear All Data
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-bold text-red-900">
            Are you absolutely sure? This cannot be undone!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClearData}
              disabled={loading}
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Clearing...' : 'Yes, Delete Everything'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-white border border-red-200 rounded-lg">
          <h4 className="font-bold text-sm mb-2">Result:</h4>
          <pre className="text-xs overflow-auto max-h-60 text-gray-700">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}