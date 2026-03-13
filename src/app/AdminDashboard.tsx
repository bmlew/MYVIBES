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
  Bell
} from 'lucide-react';
import { motion } from 'motion/react';

// Import New Detailed Components
import { AdminOverview } from './components/admin/AdminOverview';
import { BusinessManagement } from './components/admin/BusinessManagement';
import { FinancialHub } from './components/admin/FinancialHub';
import { GlobalSubscriptions } from './components/admin/GlobalSubscriptions';
import { SocialMediaManager } from './components/admin/SocialMediaManager';
import { UserManagement } from './components/admin/UserManagement';
import logoImage from 'figma:asset/4703bef6581c776921a3e305e39de2390a36cac5.png';
import { MyVibesLogo } from '@/app/components/MyVibesLogo';

interface AdminDashboardProps {
  onNavigate: (view: 'landing' | 'customer-app' | 'business-dashboard' | 'roi' | 'platform-admin') => void;
}

type Tab = 'dashboard' | 'users' | 'businesses' | 'banking' | 'subscriptions' | 'social';

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

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
            onClick={() => onNavigate('landing')}
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
          {activeTab === 'businesses' && <BusinessManagement />}
          {activeTab === 'banking' && <FinancialHub />}
          {activeTab === 'subscriptions' && <GlobalSubscriptions />}
          {activeTab === 'social' && <SocialMediaManager />}
          {activeTab === 'users' && <UserManagement />}
        </main>
      </div>
    </div>
  );
}