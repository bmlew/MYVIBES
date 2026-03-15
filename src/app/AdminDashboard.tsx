import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Star, 
  ArrowRight, 
  ChevronDown,
  Menu,
  X,
  MapPin,
  Calendar,
  Activity,
  Award,
  LayoutDashboard,
  Building2,
  CreditCard,
  Repeat,
  Share2,
  Settings,
  LogOut,
  Bell,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
  Link2,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';

// Import New Detailed Components
import { AdminOverview } from './components/admin/AdminOverview';
import { BusinessManagement } from './components/admin/BusinessManagement';
import { FinancialHub } from './components/admin/FinancialHub';
import { GlobalSubscriptions } from './components/admin/GlobalSubscriptions';
import { SocialMediaManager } from './components/admin/SocialMediaManager';
import { UserManagement } from './components/admin/UserManagement';
import { MyVibesLogo } from '@/app/components/MyVibesLogo';
import { PlatformSettings } from './components/admin/PlatformSettings';
import { AnalyticsDashboard } from './components/admin/AnalyticsDashboard';
import { AffiliateManagement } from './components/admin/AffiliateManagement';
import { DataSeeder } from '@/app/components/debug/DataSeeder';

interface AdminDashboardProps {
  onNavigate: (view: 'landing' | 'customer-app' | 'business-dashboard' | 'roi' | 'platform-admin') => void;
}

type Tab = 'dashboard' | 'users' | 'businesses' | 'banking' | 'subscriptions' | 'social' | 'settings' | 'analytics' | 'affiliates' | 'debug';

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'myvibes2025';

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Invalid username or password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    onNavigate('landing');
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <MyVibesLogo variant="white" />
            <h1 className="text-2xl font-bold text-white mt-6">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-2">Secure access required</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mx-auto mb-6">
              <Lock className="w-8 h-8 text-cyan-600" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 text-center mb-6">Sign In</h2>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-12"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </form>

            {/* Back to Landing */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={() => onNavigate('landing')}
                className="w-full text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                ← Back to Landing Page
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              🔒 This area is restricted to authorized administrators only
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Authenticated - show admin dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col fixed h-full z-20"
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <MyVibesLogo variant="white" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-2">Overview</div>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'dashboard' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'analytics' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" /> Analytics
          </button>
          
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-6">Management</div>
          
          <button 
            onClick={() => setActiveTab('businesses')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'businesses' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-5 h-5" /> Businesses
          </button>

          <button 
            onClick={() => setActiveTab('banking')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'banking' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-5 h-5" /> Banking
          </button>

          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'subscriptions' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Repeat className="w-5 h-5" /> Subscriptions
          </button>

          <button 
            onClick={() => setActiveTab('social')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'social' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-5 h-5" /> Social Media
          </button>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-6">User Data</div>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'users' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-5 h-5" /> Users
          </button>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-6">System</div>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'settings' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-6">Affiliates</div>
          
          <button 
            onClick={() => setActiveTab('affiliates')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'affiliates' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-5 h-5" /> Affiliates
          </button>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-6">Debug</div>
          
          <button 
            onClick={() => setActiveTab('debug')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'debug' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Link2 className="w-5 h-5" /> Data Seeder
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="font-bold text-xs">AD</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate">Admin User</div>
              <div className="text-xs text-slate-500 truncate">super@myvibes.co.za</div>
            </div>
            <Settings className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
          >
            <LogOut className="w-3 h-3" /> Exit Admin
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-900 capitalize flex items-center gap-2">
            {activeTab === 'dashboard' ? 'Platform Overview' : 
             activeTab === 'social' ? 'Social Media Manager' :
             activeTab === 'banking' ? 'Financial Hub' :
             activeTab + ' Management'}
          </h1>

          <div className="flex items-center gap-4">
             {/* View Switcher */}
             <div className="bg-white border border-slate-200 rounded-lg p-1 flex shadow-sm">
                <button 
                  onClick={() => onNavigate('landing')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors"
                >
                  🏠 Landing
                </button>
                <button 
                  onClick={() => onNavigate('customer-app')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors"
                >
                  📱 Customer
                </button>
                <button 
                  onClick={() => onNavigate('business-dashboard')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors"
                >
                  💼 Business
                </button>
                <button 
                  className="px-3 py-1.5 text-xs font-bold text-white bg-cyan-500 rounded-md shadow-sm"
                >
                  🛡️ Admin
                </button>
             </div>

             <div className="h-6 w-px bg-slate-200 mx-2" />

             <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <AdminOverview />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'businesses' && <BusinessManagement />}
          {activeTab === 'banking' && <FinancialHub />}
          {activeTab === 'subscriptions' && <GlobalSubscriptions />}
          {activeTab === 'social' && <SocialMediaManager />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'settings' && <PlatformSettings />}
          {activeTab === 'affiliates' && <AffiliateManagement />}
          {activeTab === 'debug' && <DataSeeder />}
        </main>
      </div>
    </div>
  );
}

export { AdminDashboard };