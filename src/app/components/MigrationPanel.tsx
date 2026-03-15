import React, { useState } from 'react';
import { Database, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface MigrationStats {
  users: number;
  businesses: number;
  locations: number;
  reservations: number;
  checkIns: number;
  events: number;
  loyaltyTransactions: number;
  achievements: number;
  rewards: number;
  partners: number;
  referralCodes: number;
  referrals: number;
  commissions: number;
  notifications: number;
  specialClicks: number;
}

interface MigrationResult {
  success: boolean;
  message: string;
  stats: MigrationStats;
  errors: string[];
}

export function MigrationPanel() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    if (!confirm('⚠️ This will migrate ALL data from KV store to PostgreSQL tables. Continue?')) {
      return;
    }

    setMigrating(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Starting migration...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/migrate-kv-to-postgres`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Migration failed');
      }

      console.log('✅ Migration completed:', data);
      setResult(data);
      
    } catch (err: any) {
      console.error('❌ Migration error:', err);
      setError(err.message || 'Migration failed');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Database Migration</h3>
          <p className="text-sm text-gray-400">KV Store → PostgreSQL</p>
        </div>
      </div>

      {/* CRITICAL INSTRUCTIONS WARNING */}
      <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-300 font-bold text-lg mb-2">⚠️ CRITICAL: Run Schema First!</h4>
            <p className="text-red-200 text-sm mb-3">
              Before clicking "Run Migration", you MUST create the PostgreSQL tables:
            </p>
            <ol className="text-red-200 text-sm space-y-2 ml-4 list-decimal">
              <li>Open <strong>Supabase Dashboard → SQL Editor</strong></li>
              <li>Click <strong>"New Query"</strong></li>
              <li>Copy contents from <code className="bg-red-950/50 px-2 py-0.5 rounded">/supabase/functions/server/schema.sql</code></li>
              <li>Paste into SQL Editor and click <strong>"Run"</strong></li>
              <li>Wait for "Success" message</li>
              <li>Then return here and click "Run Migration"</li>
            </ol>
            <p className="text-red-300 text-xs mt-3 font-semibold">
              💡 Without running schema.sql first, the migration will fail with "table does not exist" errors.
            </p>
          </div>
        </div>
      </div>

      {/* Migration Info */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
        <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
          <Database className="w-4 h-4" />
          What This Migration Does
        </h4>
        <ul className="text-blue-200 text-sm space-y-1.5 ml-6 list-disc">
          <li>Migrates all customers, businesses, and operational data</li>
          <li>Preserves check-ins, reservations, and loyalty points</li>
          <li>Transfers partner/influencer referral system</li>
          <li>Maintains analytics (special clicks, conversion tracking)</li>
          <li>Creates optimized indexes for 98% faster queries</li>
        </ul>
        <p className="text-blue-300 text-xs mt-3">
          ⏱️ Estimated time: 2-10 minutes depending on data size
        </p>
      </div>

      {/* Run Migration Button */}
      <button
        onClick={runMigration}
        disabled={migrating}
        className={`
          w-full py-4 px-6 rounded-lg font-bold text-lg
          flex items-center justify-center gap-3
          transition-all duration-200
          ${migrating 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          }
          text-white
        `}
      >
        {migrating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Migrating... Please Wait
          </>
        ) : (
          <>
            <ArrowRight className="w-6 h-6" />
            Run Migration Now
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-300 font-bold mb-1">Migration Failed</h4>
              <p className="text-red-200 text-sm">{error}</p>
              {error.includes('does not exist') && (
                <p className="text-red-300 text-xs mt-2 font-semibold">
                  💡 This error means you need to run schema.sql in Supabase SQL Editor first!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Result Display */}
      {result && (
        <div className={`mt-6 p-4 rounded-lg border ${
          result.success 
            ? 'bg-green-900/30 border-green-500' 
            : 'bg-red-900/30 border-red-500'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-bold mb-2 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                {result.success ? '✅ Migration Successful!' : '❌ Migration Failed'}
              </h4>
              <p className={`text-sm mb-4 ${result.success ? 'text-green-200' : 'text-red-200'}`}>
                {result.message}
              </p>

              {/* Migration Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-white/10 rounded p-2">
                  <div className="text-2xl font-bold text-white">{result.stats.users}</div>
                  <div className="text-xs text-gray-300">Users</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-2xl font-bold text-white">{result.stats.businesses}</div>
                  <div className="text-xs text-gray-300">Businesses</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-2xl font-bold text-white">{result.stats.reservations}</div>
                  <div className="text-xs text-gray-300">Reservations</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-2xl font-bold text-white">{result.stats.checkIns}</div>
                  <div className="text-xs text-gray-300">Check-ins</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-2xl font-bold text-white">{result.stats.partners}</div>
                  <div className="text-xs text-gray-300">Partners</div>
                </div>
                <div className="bg-white/10 rounded p-2">
                  <div className="text-2xl font-bold text-white">{result.stats.events}</div>
                  <div className="text-xs text-gray-300">Events</div>
                </div>
              </div>

              {/* Errors */}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                  <h5 className="text-yellow-300 font-semibold text-sm mb-2">
                    ⚠️ Warnings ({result.errors.length})
                  </h5>
                  <div className="max-h-40 overflow-y-auto">
                    {result.errors.slice(0, 10).map((err, i) => (
                      <p key={i} className="text-yellow-200 text-xs mb-1">• {err}</p>
                    ))}
                    {result.errors.length > 10 && (
                      <p className="text-yellow-300 text-xs mt-2">
                        ... and {result.errors.length - 10} more warnings
                      </p>
                    )}
                  </div>
                </div>
              )}

              {result.success && (
                <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded">
                  <p className="text-blue-200 text-sm">
                    <strong>Next Steps:</strong>
                  </p>
                  <ul className="text-blue-200 text-xs mt-2 ml-4 list-disc space-y-1">
                    <li>Verify data in Supabase Dashboard → Table Editor</li>
                    <li>Test app functionality with PostgreSQL backend</li>
                    <li>Monitor Edge Function logs for any issues</li>
                    <li>Keep KV store as backup (don't delete yet)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}