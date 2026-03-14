import { useState, useEffect } from 'react';
import { 
  Settings, 
  DollarSign, 
  Mail, 
  Code, 
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Bell,
  CreditCard,
  Info,
  Trash2,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import * as api from '@/utils/api';
import { AdminDebugPanel } from './AdminDebugPanel';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface PlatformSettingsConfig {
  // Subscription Pricing
  subscriptionPrice: number;
  
  // Version Info
  appVersion: string;
  buildNumber: string;
  
  // ✨ Partner/Influencer Rewards Configuration
  rewards?: {
    customer_download_bounty: number;
    customer_checkin_threshold: number;
    customer_checkin_reward: number;
    business_subscription_commission_percentage: number;
    business_recurring_commission: boolean;
    partner_visit_bonus_points: number;
    checkin_points: number;
    checkin_cooldown_hours: number;
  };
  
  // Email Settings
  subscriptionRenewalEmail: {
    enabled: boolean;
    subject: string;
    body: string;
    daysBeforeRenewal: number;
  };
  
  subscriptionExpiryEmail: {
    enabled: boolean;
    subject: string;
    body: string;
  };
  
  welcomeEmail: {
    enabled: boolean;
    subject: string;
    body: string;
  };
  
  paymentFailedEmail: {
    enabled: boolean;
    subject: string;
    body: string;
  };
  
  // Business Contact
  supportEmail: string;
  billingEmail: string;
}

const DEFAULT_CONFIG: PlatformSettingsConfig = {
  subscriptionPrice: 499,
  appVersion: '2.1.3',
  buildNumber: '20250313',
  rewards: {
    customer_download_bounty: 20,
    customer_checkin_threshold: 100,
    customer_checkin_reward: 200,
    business_subscription_commission_percentage: 15,
    business_recurring_commission: true,
    partner_visit_bonus_points: 50,
    checkin_points: 10,
    checkin_cooldown_hours: 1
  },
  subscriptionRenewalEmail: {
    enabled: true,
    subject: 'MYVIBES Subscription Renewal Reminder',
    body: `Hi {{business_name}},

This is a friendly reminder that your MYVIBES subscription will renew in {{days_remaining}} days.

Plan: {{plan_type}}
Amount: R{{amount}}
Renewal Date: {{renewal_date}}

Your subscription includes:
✅ Premium listing on MYVIBES
✅ AI-powered insights & analytics
✅ Event & special management
✅ Table reservation system
✅ Customer engagement tools

If you have any questions or need to update your payment details, please contact us.

Thank you for being part of MYVIBES!

Best regards,
The MYVIBES Team`,
    daysBeforeRenewal: 7
  },
  subscriptionExpiryEmail: {
    enabled: true,
    subject: 'MYVIBES Subscription Expired - Action Required',
    body: `Hi {{business_name}},

Your MYVIBES subscription has expired.

Your business listing is currently inactive and will not be visible to customers until your subscription is renewed.

To reactivate your subscription:
1. Log in to your MYVIBES dashboard
2. Navigate to Settings → Subscription
3. Update your payment details and renew

We'd love to continue helping you grow your business!

For assistance, contact: support@myvibes.co.za

Best regards,
The MYVIBES Team`
  },
  welcomeEmail: {
    enabled: true,
    subject: 'Welcome to MYVIBES! 🎉',
    body: `Hi {{business_name}},

Welcome to MYVIBES! We're thrilled to have you on board.

Your subscription is now active:
Plan: {{plan_type}}
Amount: R{{amount}}/month

Getting Started:
1. Complete your business profile
2. Upload photos and menus
3. Create your first special or event
4. Start accepting table reservations

Need help? Our team is here for you:
📧 support@myvibes.co.za
📱 Check out our Business Guide

Let's make some magic happen! ✨

Best regards,
The MYVIBES Team`
  },
  paymentFailedEmail: {
    enabled: true,
    subject: 'MYVIBES Payment Failed - Update Required',
    body: `Hi {{business_name}},

We attempted to process your MYVIBES subscription payment but it was unsuccessful.

Plan: {{plan_type}}
Amount: R{{amount}}

To avoid service interruption:
1. Log in to your dashboard
2. Update your payment method
3. Retry payment

Your listing will remain active for 3 days while we attempt to process payment.

For assistance: billing@myvibes.co.za

Best regards,
The MYVIBES Team`
  },
  supportEmail: 'support@myvibes.co.za',
  billingEmail: 'billing@myvibes.co.za'
};

export function PlatformSettings() {
  const [config, setConfig] = useState<PlatformSettingsConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/settings');
      
      if (response.config) {
        setConfig({ ...DEFAULT_CONFIG, ...response.config });
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings. Using defaults.');
      // Use defaults if loading fails
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSaveSuccess(false);

      await api.post('/settings', { config });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setResetting(true);
      setConfig(DEFAULT_CONFIG);
      setResetting(false);
    }
  };

  const handleResetSystem = async () => {
    if (!window.confirm("⚠️ DANGER: This will DELETE ALL DATA from the system. This action cannot be undone.\n\nType 'DELETE ALL DATA' in the next prompt to confirm.")) {
      return;
    }
    
    const confirmation = window.prompt("Type 'DELETE ALL DATA' to confirm:");
    if (confirmation !== 'DELETE ALL DATA') {
      toast.error('Reset cancelled - confirmation text did not match');
      return;
    }
    
    try {
      setResetting(true);
      const response = await fetch(`${API_URL}/admin/reset-database`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to reset system');
      
      const data = await response.json();
      toast.success(data.message || 'System reset successfully');
    } catch (err) {
      console.error('Error resetting system:', err);
      toast.error('Failed to reset system');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Settings className="w-7 h-7 text-cyan-600" />
            Platform Settings & Configuration
          </h2>
          <p className="text-slate-600 mt-1">
            Configure subscription pricing, versioning, and email notifications
          </p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-gradient-to-r from-cyan-500 to-blue-600"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Settings saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">{error}</span>
        </div>
      )}

      {/* Subscription Pricing */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-cyan-600" />
          Subscription Pricing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Monthly Subscription Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R</span>
              <input
                type="number"
                value={config.subscriptionPrice}
                onChange={(e) => setConfig({ ...config, subscriptionPrice: parseInt(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                min="0"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Current: R{config.subscriptionPrice}/month</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changing prices will only affect new subscriptions. Existing subscriptions will maintain their current pricing until renewal.
            </p>
          </div>
        </div>
      </Card>

      {/* ✨ Partner/Influencer Rewards Configuration */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Partner & Influencer Rewards
        </h3>
        
        <div className="space-y-6">
          {/* Customer Referral Rewards */}
          <div className="border-b pb-6">
            <h4 className="font-semibold text-lg mb-4 text-slate-800">Customer Referral Rewards</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Download Bounty (Immediate)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R</span>
                  <input
                    type="number"
                    value={config.rewards?.customer_download_bounty || 20}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      rewards: { 
                        ...config.rewards!, 
                        customer_download_bounty: parseInt(e.target.value) || 0 
                      } 
                    })}
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Paid when customer downloads app</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Check-in Threshold
                </label>
                <input
                  type="number"
                  value={config.rewards?.customer_checkin_threshold || 100}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    rewards: { 
                      ...config.rewards!, 
                      customer_checkin_threshold: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                />
                <p className="text-xs text-slate-500 mt-1">Check-ins needed for reward</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Threshold Reward
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R</span>
                  <input
                    type="number"
                    value={config.rewards?.customer_checkin_reward || 200}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      rewards: { 
                        ...config.rewards!, 
                        customer_checkin_reward: parseInt(e.target.value) || 0 
                      } 
                    })}
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Paid when threshold reached</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Example:</strong> Every {config.rewards?.customer_checkin_threshold || 100} check-ins by a referred customer = R{config.rewards?.customer_checkin_reward || 200} for partner
              </p>
            </div>
          </div>

          {/* Business Referral Rewards */}
          <div className="border-b pb-6">
            <h4 className="font-semibold text-lg mb-4 text-slate-800">Business Subscription Commissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Commission Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.rewards?.business_subscription_commission_percentage || 15}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      rewards: { 
                        ...config.rewards!, 
                        business_subscription_commission_percentage: parseInt(e.target.value) || 0 
                      } 
                    })}
                    className="w-full pr-8 pl-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">% of subscription payment</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Recurring Commission
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.rewards?.business_recurring_commission || false}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      rewards: { 
                        ...config.rewards!, 
                        business_recurring_commission: e.target.checked 
                      } 
                    })}
                    className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-slate-700">Pay partner on every subscription payment</span>
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  {config.rewards?.business_recurring_commission 
                    ? "✅ Partners earn commission every month" 
                    : "❌ Partners only earn on first payment"}
                </p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> Business pays R499/month × {config.rewards?.business_subscription_commission_percentage || 15}% = 
                R{Math.round((499 * (config.rewards?.business_subscription_commission_percentage || 15)) / 100)} per payment
                {config.rewards?.business_recurring_commission && <strong> (every month!)</strong>}
              </p>
            </div>
          </div>

          {/* Partner Engagement Bonuses */}
          <div className="border-b pb-6">
            <h4 className="font-semibold text-lg mb-4 text-slate-800">Partner Engagement Bonuses</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Partner Visit Bonus
                </label>
                <input
                  type="number"
                  value={config.rewards?.partner_visit_bonus_points || 50}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    rewards: { 
                      ...config.rewards!, 
                      partner_visit_bonus_points: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                />
                <p className="text-xs text-slate-500 mt-1">Extra points when partner visits their referred business</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Regular Check-in Points
                </label>
                <input
                  type="number"
                  value={config.rewards?.checkin_points || 10}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    rewards: { 
                      ...config.rewards!, 
                      checkin_points: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                />
                <p className="text-xs text-slate-500 mt-1">Points for any check-in</p>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-slate-800">General Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Check-in Cooldown (hours)
                </label>
                <input
                  type="number"
                  value={config.rewards?.checkin_cooldown_hours || 1}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    rewards: { 
                      ...config.rewards!, 
                      checkin_cooldown_hours: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
                <p className="text-xs text-slate-500 mt-1">Time before next check-in allowed</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Version Information */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-600" />
          Version & Build Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              App Version
            </label>
            <input
              type="text"
              value={config.appVersion}
              onChange={(e) => setConfig({ ...config, appVersion: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 2.1.3"
            />
            <p className="text-xs text-slate-500 mt-1">Semantic versioning (MAJOR.MINOR.PATCH)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Build Number
            </label>
            <input
              type="text"
              value={config.buildNumber}
              onChange={(e) => setConfig({ ...config, buildNumber: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 20250313"
            />
            <p className="text-xs text-slate-500 mt-1">Build identifier (usually date: YYYYMMDD)</p>
          </div>
        </div>
      </Card>

      {/* Contact Settings */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-600" />
          Business Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={config.supportEmail}
              onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="support@myvibes.co.za"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Billing Email
            </label>
            <input
              type="email"
              value={config.billingEmail}
              onChange={(e) => setConfig({ ...config, billingEmail: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="billing@myvibes.co.za"
            />
          </div>
        </div>
      </Card>

      {/* Email Templates */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-600" />
          Email Notification Templates
        </h3>

        <div className="space-y-6">
          {/* Subscription Renewal Email */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900">Subscription Renewal Reminder</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.subscriptionRenewalEmail.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    subscriptionRenewalEmail: {
                      ...config.subscriptionRenewalEmail,
                      enabled: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-sm font-medium text-slate-700">Enabled</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Days Before Renewal
                </label>
                <input
                  type="number"
                  value={config.subscriptionRenewalEmail.daysBeforeRenewal}
                  onChange={(e) => setConfig({
                    ...config,
                    subscriptionRenewalEmail: {
                      ...config.subscriptionRenewalEmail,
                      daysBeforeRenewal: parseInt(e.target.value) || 7
                    }
                  })}
                  className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  min="1"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={config.subscriptionRenewalEmail.subject}
                  onChange={(e) => setConfig({
                    ...config,
                    subscriptionRenewalEmail: {
                      ...config.subscriptionRenewalEmail,
                      subject: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={config.subscriptionRenewalEmail.body}
                  onChange={(e) => setConfig({
                    ...config,
                    subscriptionRenewalEmail: {
                      ...config.subscriptionRenewalEmail,
                      body: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  rows={10}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available variables: {'{'}{'{'} business_name {'}'}{'}'}, {'{'}{'{'} days_remaining {'}'}{'}'}, {'{'}{'{'} plan_type {'}'}{'}'}, {'{'}{'{'} amount {'}'}{'}'}, {'{'}{'{'} renewal_date {'}'}{'}'}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Expiry Email */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900">Subscription Expired</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.subscriptionExpiryEmail.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    subscriptionExpiryEmail: {
                      ...config.subscriptionExpiryEmail,
                      enabled: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-sm font-medium text-slate-700">Enabled</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={config.subscriptionExpiryEmail.subject}
                  onChange={(e) => setConfig({
                    ...config,
                    subscriptionExpiryEmail: {
                      ...config.subscriptionExpiryEmail,
                      subject: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={config.subscriptionExpiryEmail.body}
                  onChange={(e) => setConfig({
                    ...config,
                    subscriptionExpiryEmail: {
                      ...config.subscriptionExpiryEmail,
                      body: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  rows={10}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available variables: {'{'}{'{'} business_name {'}'}{'}'}
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Email */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900">Welcome Email (New Subscriptions)</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.welcomeEmail.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    welcomeEmail: {
                      ...config.welcomeEmail,
                      enabled: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-sm font-medium text-slate-700">Enabled</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={config.welcomeEmail.subject}
                  onChange={(e) => setConfig({
                    ...config,
                    welcomeEmail: {
                      ...config.welcomeEmail,
                      subject: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={config.welcomeEmail.body}
                  onChange={(e) => setConfig({
                    ...config,
                    welcomeEmail: {
                      ...config.welcomeEmail,
                      body: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  rows={10}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available variables: {'{'}{'{'} business_name {'}'}{'}'}, {'{'}{'{'} plan_type {'}'}{'}'}, {'{'}{'{'} amount {'}'}{'}'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Failed Email */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900">Payment Failed Notification</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.paymentFailedEmail.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    paymentFailedEmail: {
                      ...config.paymentFailedEmail,
                      enabled: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-sm font-medium text-slate-700">Enabled</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={config.paymentFailedEmail.subject}
                  onChange={(e) => setConfig({
                    ...config,
                    paymentFailedEmail: {
                      ...config.paymentFailedEmail,
                      subject: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={config.paymentFailedEmail.body}
                  onChange={(e) => setConfig({
                    ...config,
                    paymentFailedEmail: {
                      ...config.paymentFailedEmail,
                      body: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  rows={10}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available variables: {'{'}{'{'} business_name {'}'}{'}'}, {'{'}{'{'} plan_type {'}'}{'}'}, {'{'}{'{'} amount {'}'}{'}'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button (sticky at bottom) */}
      <div className="sticky bottom-6 bg-white border border-slate-200 rounded-lg shadow-lg p-4 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Remember to save your changes before leaving this page
        </p>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-gradient-to-r from-cyan-500 to-blue-600"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save All Settings
        </Button>
      </div>

      {/* Danger Zone - Reset System */}
      <Card className="p-6 border-2 border-red-200 bg-red-50/30">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>

        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 mb-2">Reset Entire System</h4>
              <p className="text-sm text-slate-600 mb-1">
                This will permanently delete ALL data from the database including:
              </p>
              <ul className="text-sm text-slate-600 list-disc list-inside space-y-1 ml-2">
                <li>All businesses and their profiles</li>
                <li>All customer accounts and check-ins</li>
                <li>All reservations and bookings</li>
                <li>All transactions and payment records</li>
                <li>All platform settings and configurations</li>
              </ul>
              <p className="text-sm text-red-600 font-semibold mt-3">
                ⚠️ This action cannot be undone. Use only for testing or complete system reset.
              </p>
            </div>
            <Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700 text-white gap-2 flex-shrink-0"
              onClick={handleResetSystem}
              disabled={resetting}
            >
              {resetting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Reset System
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Admin Debug Panel - Only visible in Settings */}
      <AdminDebugPanel />
    </div>
  );
}