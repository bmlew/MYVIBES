import React, { useEffect, useState } from 'react';
import { Trophy, Star, Award, Flame, Target, Medal, Crown, Zap } from 'lucide-react';

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
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function Achievements({ userId, totalPoints, totalCheckIns = 0 }: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Calculate achievements based on user stats
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
  }, [totalPoints, totalCheckIns, userId]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-amber-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300';
      case 'rare':
        return 'border-blue-400';
      case 'epic':
        return 'border-purple-400';
      case 'legendary':
        return 'border-amber-400';
      default:
        return 'border-gray-300';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900">Achievement Progress</h3>
          <span className="text-sm font-semibold text-cyan-600">
            {unlockedCount}/{achievements.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-lg p-4 border-2 transition-all ${
              achievement.unlocked
                ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white ${getRarityBorder(achievement.rarity)} shadow-lg`
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  achievement.unlocked
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-gray-200'
                }`}
              >
                <div className={achievement.unlocked ? 'text-white' : 'text-gray-400'}>
                  {achievement.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-700'}`}>
                  {achievement.title}
                </h4>
                <p className={`text-sm mb-2 ${achievement.unlocked ? 'text-white/90' : 'text-gray-600'}`}>
                  {achievement.description}
                </p>
                {!achievement.unlocked && achievement.maxProgress && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
                {achievement.unlocked && (
                  <div className="flex items-center gap-1 text-xs text-white/90">
                    <Trophy className="w-3 h-3" />
                    <span className="uppercase font-semibold tracking-wide">
                      {achievement.rarity}
                    </span>
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
