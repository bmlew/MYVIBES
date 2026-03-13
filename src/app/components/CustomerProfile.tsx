import { useState, useEffect } from 'react';
import { User, Mail, Phone, ArrowLeft, Check, Calendar, Heart, MapPin, Hash, LogOut, Trophy, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Achievements } from './Achievements';
import { RewardsRedemption } from './RewardsRedemption';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import * as api from '@/utils/api';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  mobile: string;
  city?: string;
  birthday?: string;
  preferences?: string[];
  notificationPreference?: 'email' | 'whatsapp';
  loyalty_points?: number;
}

interface CustomerProfileProps {
  user: UserProfile;
  onBack: () => void;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
  onLogout: () => void;
  onOpenAffiliate: () => void;
}

export function CustomerProfile({ user, onBack, onUpdate, onLogout, onOpenAffiliate }: CustomerProfileProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync formData when user prop changes, but ONLY if not editing to avoid overwriting user input
  useEffect(() => {
    if (!isEditing) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-cyan-100 text-sm mt-1">Manage your vibe identity</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onLogout}
              className="bg-white/10 hover:bg-white/20 text-white border-0"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700 animate-in slide-in-from-top-2">
            <Check className="w-5 h-5" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {/* Loyalty Points Card */}
        <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">Your Points</p>
              <h3 className="text-4xl font-bold">{user.loyalty_points || 0}</h3>
              <p className="text-amber-100 text-xs mt-1">Check in to earn more!</p>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-5xl">🏆</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full bg-white mx-auto flex items-center justify-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 shadow-xl mb-4">
                {formData.name ? formData.name.charAt(0).toUpperCase() : <User />}
              </div>
              <h2 className="text-white text-xl font-bold">{formData.name}</h2>
              <p className="text-cyan-100 text-sm">@{user.username}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Username (Read Only) */}
              <div className="col-span-full">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Username
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-500 font-mono text-sm border border-gray-100">
                  @{user.username}
                </div>
              </div>

              {/* Name */}
              <div className="col-span-full">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div 
                    onClick={() => setIsEditing(true)}
                    className="p-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-100 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    {formData.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="name@example.com"
                  />
                ) : (
                  <div 
                    onClick={() => setIsEditing(true)}
                    className="p-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-100 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    {formData.email || <span className="text-gray-400 italic">Add email</span>}
                  </div>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Mobile
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={formData.mobile || ''}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="+27..."
                  />
                ) : (
                  <div 
                    onClick={() => setIsEditing(true)}
                    className="p-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-100 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    {formData.mobile || <span className="text-gray-400 italic">Add mobile</span>}
                  </div>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  City
                </label>
                {isEditing ? (
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g. Johannesburg"
                  />
                ) : (
                  <div 
                    onClick={() => setIsEditing(true)}
                    className="p-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-100 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    {formData.city || 'Johannesburg'}
                  </div>
                )}
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Birthday
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.birthday || ''}
                    onChange={(e) => handleChange('birthday', e.target.value)}
                  />
                ) : (
                  <div 
                    onClick={() => setIsEditing(true)}
                    className="p-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-100 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    {formData.birthday || <span className="text-gray-400 italic">Add birthday</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6">
              {isEditing ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white h-12 text-lg shadow-lg shadow-cyan-500/20"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(user);
                    }}
                    variant="outline"
                    className="h-12 px-6"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 text-lg shadow-lg"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Gamification Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-none bg-gray-100 p-1">
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="rewards" className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Rewards
              </TabsTrigger>
            </TabsList>
            <TabsContent value="achievements" className="p-6">
              <Achievements 
                userId={user.id} 
                totalPoints={user.loyalty_points || 0}
                totalCheckIns={Math.floor((user.loyalty_points || 0) / 10)}
              />
            </TabsContent>
            <TabsContent value="rewards" className="p-6">
              <RewardsRedemption 
                userPoints={user.loyalty_points || 0}
                onRedeem={async (rewardId, pointsCost) => {
                  // Call API to redeem reward
                  console.log(`Redeeming ${rewardId} for ${pointsCost} points`);
                  // TODO: Implement actual redemption API call
                  // For now, just update the local points
                  await onUpdate({
                    ...user,
                    loyalty_points: (user.loyalty_points || 0) - pointsCost
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Complete your profile
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            Adding more details helps us recommend the best vibes for you!
          </p>
          <ul className="text-sm text-blue-700 space-y-1 ml-1">
            <li>• Add your birthday for special treats</li>
            <li>• Add mobile number for reservations</li>
          </ul>
        </div>

        {/* Affiliate Portal Button */}
        <div className="mt-6">
          <Button 
            onClick={onOpenAffiliate}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 py-6 h-auto"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Partner / Influencer Portal</div>
                <div className="text-xs text-purple-100 opacity-90">Earn cash by referring friends & businesses</div>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
