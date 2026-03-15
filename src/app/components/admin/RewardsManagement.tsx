import React, { useState, useEffect } from 'react';
import { Gift, Coffee, Percent, Star, Sparkles, Plus, Edit2, Trash2, Save, X, Building2, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import * as api from '@/utils/api';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'freebie' | 'upgrade';
  iconName: string;
  participatingBusinesses: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
}

interface Business {
  id: string;
  name: string;
  city?: string;
}

export function RewardsManagement() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessSearch, setBusinessSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointsCost: 50,
    category: 'freebie' as 'discount' | 'freebie' | 'upgrade',
    iconName: 'Coffee',
    participatingBusinesses: [] as string[],
    available: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rewardsData, businessesData] = await Promise.all([
        api.get('/admin/rewards'),
        api.get('/admin/businesses')  // Changed from '/businesses' to '/admin/businesses'
      ]);
      setRewards(rewardsData.rewards || []);
      setBusinesses(businessesData.businesses || []);
      console.log('📊 Loaded businesses for rewards:', businessesData.businesses?.length || 0);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingReward(null);
    setFormData({
      title: '',
      description: '',
      pointsCost: 50,
      category: 'freebie',
      iconName: 'Coffee',
      participatingBusinesses: [],
      available: true
    });
  };

  const handleEdit = (reward: Reward) => {
    setIsCreating(false);
    setEditingReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      iconName: reward.iconName,
      participatingBusinesses: reward.participatingBusinesses || [],
      available: reward.available
    });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        await api.post('/admin/rewards', formData);
        toast.success('Reward created successfully');
      } else if (editingReward) {
        await api.put(`/admin/rewards/${editingReward.id}`, formData);
        toast.success('Reward updated successfully');
      }
      setIsCreating(false);
      setEditingReward(null);
      loadData();
    } catch (error) {
      console.error('Failed to save reward:', error);
      toast.error('Failed to save reward');
    }
  };

  const handleDelete = async (rewardId: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    
    try {
      await api.del(`/admin/rewards/${rewardId}`);
      toast.success('Reward deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingReward(null);
  };

  const toggleBusiness = (businessId: string) => {
    setFormData(prev => ({
      ...prev,
      participatingBusinesses: prev.participatingBusinesses.includes(businessId)
        ? prev.participatingBusinesses.filter(id => id !== businessId)
        : [...prev.participatingBusinesses, businessId]
    }));
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Coffee, Percent, Gift, Star, Sparkles
    };
    const Icon = icons[iconName] || Gift;
    return <Icon className="w-6 h-6" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'from-green-500 to-emerald-600';
      case 'freebie': return 'from-blue-500 to-cyan-600';
      case 'upgrade': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Filter businesses based on search query (only when 3+ characters entered)
  const filteredBusinesses = businessSearch.length >= 3
    ? businesses.filter(business => 
        business.name.toLowerCase().includes(businessSearch.toLowerCase()) ||
        business.city?.toLowerCase().includes(businessSearch.toLowerCase())
      )
    : businesses;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rewards Management</h2>
          <p className="text-gray-600 mt-1">Configure customer loyalty rewards</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Reward
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingReward) && (
        <div className="bg-white rounded-2xl border-2 border-cyan-200 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {isCreating ? 'Create New Reward' : 'Edit Reward'}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Free Coffee"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points Cost
              </label>
              <input
                type="number"
                value={formData.pointsCost}
                onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                min="1"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={2}
              placeholder="Redeem for a complimentary coffee"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="freebie">Freebie</option>
                <option value="discount">Discount</option>
                <option value="upgrade">Upgrade</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <select
                value={formData.iconName}
                onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="Coffee">Coffee</option>
                <option value="Percent">Percent</option>
                <option value="Gift">Gift</option>
                <option value="Star">Star</option>
                <option value="Sparkles">Sparkles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.available ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, available: e.target.value === 'active' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Participating Businesses */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Building2 className="w-4 h-4 inline mr-2" />
              Participating Businesses ({formData.participatingBusinesses.length} selected)
            </label>
            
            {/* Search Input */}
            {businesses.length > 0 && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={businessSearch}
                  onChange={(e) => setBusinessSearch(e.target.value)}
                  placeholder="Type 3+ characters to search businesses..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white text-sm"
                />
                {businessSearch.length > 0 && businessSearch.length < 3 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <span className="font-medium">{3 - businessSearch.length} more character{3 - businessSearch.length !== 1 ? 's' : ''}</span> needed to search
                  </p>
                )}
                {businessSearch.length >= 3 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Showing {filteredBusinesses.length} of {businesses.length} businesses
                  </p>
                )}
              </div>
            )}
            
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <div className="max-h-80 overflow-y-auto p-4">
                {businesses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium">No businesses found</p>
                    <p className="text-xs mt-1">Please add businesses first before creating rewards</p>
                  </div>
                ) : filteredBusinesses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium">No matches found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredBusinesses.map((business) => (
                      <label
                        key={business.id}
                        className="flex items-center gap-2 p-2.5 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-cyan-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData.participatingBusinesses.includes(business.id)}
                          onChange={() => toggleBusiness(business.id)}
                          className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-900 font-medium block truncate">
                            {business.name}
                          </span>
                          {business.city && (
                            <span className="text-xs text-gray-500 block">{business.city}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Rewards List */}
      <div className="grid grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white rounded-2xl border-2 border-gray-200 p-5 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getCategoryColor(
                  reward.category
                )} text-white shadow-lg`}
              >
                {getIconComponent(reward.iconName)}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(reward)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-1">{reward.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reward.description}</p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-amber-600">{reward.pointsCost}</span>
                <span className="text-xs text-gray-600">pts</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                reward.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {reward.available ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Building2 className="w-3 h-3" />
                <span>
                  {reward.participatingBusinesses?.length || 0} participating venues
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && !isCreating && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rewards Yet</h3>
          <p className="text-gray-500 mb-4">Create your first reward to get started</p>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Reward
          </Button>
        </div>
      )}
    </div>
  );
}