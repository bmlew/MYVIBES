import React, { useEffect, useState } from 'react';
import { Trophy, Star, Award, Flame, Target, Medal, Crown, Zap, Sparkles } from 'lucide-react';
import * as api from '@/utils/api';

interface AchievementsProps {
  userId: string;
  totalPoints: number;
  totalCheckIns?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconName?: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function Achievements({ userId, totalPoints, totalCheckIns = 0 }: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [totalPoints, totalCheckIns, userId]);

  const loadAchievements = async () => {
    try {
      const data = await api.get('/achievements');
      const configuredAchievements = data.achievements || [];

      // Map configured achievements with user progress
      const achievementsWithProgress = configuredAchievements.map((config: any) => {
        const currentValue = config.requirementType === 'checkins' ? totalCheckIns : totalPoints;
        const unlocked = currentValue >= config.requirementValue;
        
        return {
          id: config.id,
          title: config.title,
          description: config.description,
          icon: getIconComponent(config.iconName),
          iconName: config.iconName,
          unlocked,
          progress: Math.min(currentValue, config.requirementValue),
          maxProgress: config.requirementValue,
          rarity: config.rarity
        };
      });

      setAchievements(achievementsWithProgress);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      // Fallback to default achievements if backend fails
      loadDefaultAchievements();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultAchievements = () => {
    // Default achievements as fallback
    const achievementList: Achievement[] = [
      {
        id: 'first-checkin',
        title: 'First Steps',
        description: 'Complete your first check-in',
        icon: <Target className="w-6 h-6" />,
        unlocked: totalCheckIns >= 1,
        progress: Math.min(totalCheckIns, 1),
        maxProgress: 1,
        rarity: 'common'
      },
      {
        id: 'social-butterfly',
        title: 'Social Butterfly',
        description: 'Check in to 5 different venues',
        icon: <Star className="w-6 h-6" />,
        unlocked: totalCheckIns >= 5,
        progress: Math.min(totalCheckIns, 5),
        maxProgress: 5,
        rarity: 'common'
      },
      {
        id: 'explorer',
        title: 'Explorer',
        description: 'Check in to 10 different venues',
        icon: <Award className="w-6 h-6" />,
        unlocked: totalCheckIns >= 10,
        progress: Math.min(totalCheckIns, 10),
        maxProgress: 10,
        rarity: 'rare'
      },
      {
        id: 'points-collector',
        title: 'Points Collector',
        description: 'Earn 100 loyalty points',
        icon: <Trophy className="w-6 h-6" />,
        unlocked: totalPoints >= 100,
        progress: Math.min(totalPoints, 100),
        maxProgress: 100,
        rarity: 'rare'
      },
      {
        id: 'on-fire',
        title: 'On Fire',
        description: 'Check in to 25 venues',
        icon: <Flame className="w-6 h-6" />,
        unlocked: totalCheckIns >= 25,
        progress: Math.min(totalCheckIns, 25),
        maxProgress: 25,
        rarity: 'epic'
      },
      {
        id: 'vip',
        title: 'VIP Status',
        description: 'Earn 500 loyalty points',
        icon: <Crown className="w-6 h-6" />,
        unlocked: totalPoints >= 500,
        progress: Math.min(totalPoints, 500),
        maxProgress: 500,
        rarity: 'epic'
      },
      {
        id: 'legend',
        title: 'Living Legend',
        description: 'Check in to 50 venues',
        icon: <Medal className="w-6 h-6" />,
        unlocked: totalCheckIns >= 50,
        progress: Math.min(totalCheckIns, 50),
        maxProgress: 50,
        rarity: 'legendary'
      },
      {
        id: 'points-master',
        title: 'Points Master',
        description: 'Earn 1000 loyalty points',
        icon: <Zap className="w-6 h-6" />,
        unlocked: totalPoints >= 1000,
        progress: Math.min(totalPoints, 1000),
        maxProgress: 1000,
        rarity: 'legendary'
      }
    ];

    setAchievements(achievementList);
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
      case 'common':
        return 'from-slate-500 to-gray-600';
      case 'rare':
        return 'from-blue-500 to-cyan-600';
      case 'epic':
        return 'from-purple-500 to-pink-600';
      case 'legendary':
        return 'from-amber-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-slate-50 to-gray-50';
      case 'rare':
        return 'from-blue-50 to-cyan-50';
      case 'epic':
        return 'from-purple-50 to-pink-50';
      case 'legendary':
        return 'from-amber-50 to-orange-50';
      default:
        return 'from-gray-50 to-gray-50';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercentage = achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary - Redesigned */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Your Achievements
            </h3>
            <p className="text-white/90 text-sm">
              {unlockedCount} of {achievements.length} unlocked
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-2 text-right">
          <span className="text-white font-bold text-lg">{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {/* Achievements Grid - Redesigned */}
      <div className="grid grid-cols-1 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-2xl p-5 border-2 transition-all ${
              achievement.unlocked
                ? `bg-gradient-to-br ${getRarityBgColor(achievement.rarity)} border-transparent shadow-lg hover:shadow-xl`
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white`
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className={`font-bold text-base mb-1 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <div className={`ml-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white shadow-md`}>
                      {achievement.rarity}
                    </div>
                  )}
                </div>
                {!achievement.unlocked && achievement.maxProgress && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
                {achievement.unlocked && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <Trophy className="w-3 h-3" />
                      Unlocked
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}