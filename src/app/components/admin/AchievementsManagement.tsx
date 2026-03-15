import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Flame, Target, Medal, Crown, Zap, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import * as api from '@/utils/api';

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirementType: 'checkins' | 'points';
  requirementValue: number;
  created_at: string;
  updated_at: string;
}

export function AchievementsManagement() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    iconName: 'Target',
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    requirementType: 'checkins' as 'checkins' | 'points',
    requirementValue: 1
  });

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/achievements');
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingAchievement(null);
    setFormData({
      title: '',
      description: '',
      iconName: 'Target',
      rarity: 'common',
      requirementType: 'checkins',
      requirementValue: 1
    });
  };

  const handleEdit = (achievement: Achievement) => {
    setIsCreating(false);
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      iconName: achievement.iconName,
      rarity: achievement.rarity,
      requirementType: achievement.requirementType,
      requirementValue: achievement.requirementValue
    });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        await api.post('/admin/achievements', formData);
        toast.success('Achievement created successfully');
      } else if (editingAchievement) {
        await api.put(`/admin/achievements/${editingAchievement.id}`, formData);
        toast.success('Achievement updated successfully');
      }
      setIsCreating(false);
      setEditingAchievement(null);
      loadAchievements();
    } catch (error) {
      console.error('Failed to save achievement:', error);
      toast.error('Failed to save achievement');
    }
  };

  const handleDelete = async (achievementId: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      await api.del(`/admin/achievements/${achievementId}`);
      toast.success('Achievement deleted successfully');
      loadAchievements();
    } catch (error) {
      console.error('Failed to delete achievement:', error);
      toast.error('Failed to delete achievement');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingAchievement(null);
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Trophy, Star, Award, Flame, Target, Medal, Crown, Zap
    };
    const Icon = icons[iconName] || Trophy;
    return <Icon className="w-6 h-6" />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-slate-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-cyan-600';
      case 'epic': return 'from-purple-500 to-pink-600';
      case 'legendary': return 'from-amber-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-slate-100 text-slate-700';
      case 'rare': return 'bg-blue-100 text-blue-700';
      case 'epic': return 'bg-purple-100 text-purple-700';
      case 'legendary': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Achievements Management</h2>
          <p className="text-gray-600 mt-1">Configure customer achievement milestones</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Achievement
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingAchievement) && (
        <div className="bg-white rounded-2xl border-2 border-purple-200 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {isCreating ? 'Create New Achievement' : 'Edit Achievement'}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="First Steps"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <select
                value={formData.iconName}
                onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Target">Target</option>
                <option value="Star">Star</option>
                <option value="Award">Award</option>
                <option value="Trophy">Trophy</option>
                <option value="Flame">Flame</option>
                <option value="Crown">Crown</option>
                <option value="Medal">Medal</option>
                <option value="Zap">Zap</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={2}
              placeholder="Complete your first check-in"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rarity
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirement Type
              </label>
              <select
                value={formData.requirementType}
                onChange={(e) => setFormData({ ...formData, requirementType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="checkins">Check-ins</option>
                <option value="points">Points</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required {formData.requirementType === 'checkins' ? 'Check-ins' : 'Points'}
              </label>
              <input
                type="number"
                value={formData.requirementValue}
                onChange={(e) => setFormData({ ...formData, requirementValue: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
              />
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

      {/* Achievements List */}
      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-5 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4 mb-3">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getRarityColor(
                  achievement.rarity
                )} text-white shadow-lg`}
              >
                {getIconComponent(achievement.iconName)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{achievement.description}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(achievement)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(achievement.id)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getRarityBadgeColor(achievement.rarity)}`}>
                {achievement.rarity}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                {achievement.requirementValue} {achievement.requirementType}
              </span>
            </div>
          </div>
        ))}
      </div>

      {achievements.length === 0 && !isCreating && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
          <p className="text-gray-500 mb-4">Create your first achievement to get started</p>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Achievement
          </Button>
        </div>
      )}
    </div>
  );
}
