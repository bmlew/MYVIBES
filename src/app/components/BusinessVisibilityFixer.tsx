import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

interface DiagnosisResult {
  total_businesses: number;
  visible_in_customer_app: number;
  hidden_businesses: Array<{
    id: string;
    name: string;
    is_active: boolean;
    payment_status?: string;
    subscription_status?: string;
    issues: string[];
  }>;
  issues_found: string[];
}

export function BusinessVisibilityFixer() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  const runDiagnosis = async () => {
    setLoading(true);
    setFixResult(null);
    
    try {
      const response = await fetch(`${API_BASE}/admin/diagnose-businesses`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to diagnose: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDiagnosis(data);
    } catch (error) {
      console.error('Error diagnosing businesses:', error);
      alert(`Error diagnosing businesses: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fixAllBusinesses = async () => {
    if (!confirm('This will make ALL businesses visible in the customer app. Continue?')) {
      return;
    }
    
    setFixing(true);
    setFixResult(null);
    
    try {
      const response = await fetch(`${API_BASE}/admin/fix-all-businesses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fix: ${response.statusText}`);
      }
      
      const result = await response.json();
      setFixResult(`✅ ${result.message}`);
      
      // Re-run diagnosis
      await runDiagnosis();
    } catch (error) {
      console.error('Error fixing businesses:', error);
      alert(`Error fixing businesses: ${error}`);
    } finally {
      setFixing(false);
    }
  };

  const fixSingleBusiness = async (businessId: string, businessName: string) => {
    if (!confirm(`Make "${businessName}" visible in the customer app?`)) {
      return;
    }
    
    setFixing(true);
    
    try {
      const response = await fetch(`${API_BASE}/admin/fix-business-visibility/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fix: ${response.statusText}`);
      }
      
      const result = await response.json();
      setFixResult(`✅ ${result.message}`);
      
      // Re-run diagnosis
      await runDiagnosis();
    } catch (error) {
      console.error('Error fixing business:', error);
      alert(`Error fixing business: ${error}`);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Business Visibility Diagnostic
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Check why businesses aren't showing up in the customer app
          </p>
        </div>
        <button
          onClick={runDiagnosis}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Diagnosing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Run Diagnosis
            </>
          )}
        </button>
      </div>

      {fixResult && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          {fixResult}
        </div>
      )}

      {diagnosis && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{diagnosis.total_businesses}</div>
              <div className="text-sm text-gray-600">Total Businesses</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{diagnosis.visible_in_customer_app}</div>
              <div className="text-sm text-gray-600">Visible</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{diagnosis.hidden_businesses.length}</div>
              <div className="text-sm text-gray-600">Hidden</div>
            </div>
          </div>

          {/* Hidden Businesses */}
          {diagnosis.hidden_businesses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Hidden Businesses</h3>
                <button
                  onClick={fixAllBusinesses}
                  disabled={fixing}
                  className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {fixing ? 'Fixing...' : 'Fix All'}
                </button>
              </div>
              
              <div className="space-y-2">
                {diagnosis.hidden_businesses.map((business) => (
                  <div key={business.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{business.name}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {business.id}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {business.issues.map((issue, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                              <AlertCircle className="w-3 h-3" />
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => fixSingleBusiness(business.id, business.name)}
                        disabled={fixing}
                        className="ml-4 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        Fix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diagnosis.hidden_businesses.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-green-800">
                ✅ All businesses are visible in the customer app!
              </div>
            </div>
          )}
        </div>
      )}

      {!diagnosis && !loading && (
        <div className="text-center py-8 text-gray-500">
          Click "Run Diagnosis" to check business visibility
        </div>
      )}
    </div>
  );
}
