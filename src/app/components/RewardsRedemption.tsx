import React, { useState, useEffect } from 'react';
import { Gift, Coffee, Percent, Star, Sparkles, Lock, CheckCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import * as api from '@/utils/api';

interface RewardsRedemptionProps {
  userPoints: number;
  onRedeem: (rewardId: string, pointsCost: number) => Promise<void>;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: React.ReactNode;
  iconName?: string;
  category: 'discount' | 'freebie' | 'upgrade';
  available: boolean;
}

export function RewardsRedemption({ userPoints, onRedeem }: RewardsRedemptionProps) {
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const data = await api.get('/rewards');
      const configuredRewards = data.rewards || [];

      // Map configured rewards with icons
      const rewardsWithIcons = configuredRewards.map((config: any) => ({
        id: config.id,
        title: config.title,
        description: config.description,
        pointsCost: config.pointsCost,
        icon: getIconComponent(config.iconName),
        iconName: config.iconName,
        category: config.category,
        available: config.available
      }));

      setRewards(rewardsWithIcons);
    } catch (error) {
      console.error('Failed to load rewards:', error);
      // Fallback to default rewards if backend fails
      loadDefaultRewards();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultRewards = () => {
    const defaultRewards: Reward[] = [
      {
        id: 'coffee-free',
        title: 'Free Coffee',
        description: 'Redeem for a complimentary coffee',
        pointsCost: 50,
        icon: <Coffee className="w-6 h-6" />,
        category: 'freebie',
        available: true
      },
      {
        id: 'discount-10',
        title: '10% Off',
        description: 'Get 10% off your total bill',
        pointsCost: 75,
        icon: <Percent className="w-6 h-6" />,
        category: 'discount',
        available: true
      },
      {
        id: 'discount-15',
        title: '15% Off',
        description: 'Get 15% off your total bill',
        pointsCost: 120,
        icon: <Percent className="w-6 h-6" />,
        category: 'discount',
        available: true
      },
      {
        id: 'appetizer-free',
        title: 'Free Appetizer',
        description: 'Get a complimentary appetizer',
        pointsCost: 100,
        icon: <Gift className="w-6 h-6" />,
        category: 'freebie',
        available: true
      },
      {
        id: 'vip-upgrade',
        title: 'VIP Table',
        description: 'Upgrade to VIP seating',
        pointsCost: 200,
        icon: <Star className="w-6 h-6" />,
        category: 'upgrade',
        available: true
      },
      {
        id: 'discount-25',
        title: '25% Off',
        description: 'Get 25% off - Premium reward',
        pointsCost: 250,
        icon: <Sparkles className="w-6 h-6" />,
        category: 'discount',
        available: true
      }
    ];

    setRewards(defaultRewards);
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Coffee, Percent, Gift, Star, Sparkles
    };
    const Icon = icons[iconName] || Gift;
    return <Icon className="w-6 h-6" />;
  };

  const handleRedeem = async (reward: Reward) => {
    if (userPoints < reward.pointsCost) {
      toast.error('Insufficient Points', {
        description: `You need ${reward.pointsCost - userPoints} more points to redeem this reward.`
      });
      return;
    }

    setRedeeming(reward.id);
    try {
      await onRedeem(reward.id, reward.pointsCost);
      toast.success('Reward Redeemed!', {
        description: `${reward.title} has been added to your rewards. Show this at the venue to claim.`
      });
    } catch (error: any) {
      toast.error('Redemption Failed', {
        description: error.message || 'Failed to redeem reward. Please try again.'
      });
    } finally {
      setRedeeming(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount':
        return 'from-green-500 to-emerald-600';
      case 'freebie':
        return 'from-blue-500 to-cyan-600';
      case 'upgrade':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const canAfford = (pointsCost: number) => userPoints >= pointsCost;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Balance - Improved Design */}
      <div className="bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/90 text-sm font-semibold mb-2">Available Points</p>
            <h2 className="text-5xl font-bold mb-1">{userPoints}</h2>
            <p className="text-white/80 text-xs">Keep earning for more rewards!</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <span className="text-5xl">💎</span>
          </div>
        </div>
      </div>

      {/* Info Banner - Redesigned */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-cyan-900 mb-1">How it works:</p>
            <p className="text-sm text-cyan-800">
              Redeem your points for rewards at participating venues. Each check-in earns you <span className="font-bold">10 points!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Rewards Grid - Improved Cards */}
      <div className="grid grid-cols-2 gap-3">
        {rewards.map((reward) => {
          const affordable = canAfford(reward.pointsCost);
          
          return (
            <div
              key={reward.id}
              className={`rounded-2xl p-4 border-2 transition-all ${
                affordable
                  ? 'border-cyan-200 bg-white hover:shadow-xl hover:border-cyan-400 hover:-translate-y-1'
                  : 'border-gray-200 bg-gray-50 opacity-70'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 mx-auto bg-gradient-to-br ${getCategoryColor(
                  reward.category
                )} text-white shadow-lg`}
              >
                {reward.icon}
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 text-center mb-1 text-sm">{reward.title}</h3>
              
              {/* Description */}
              <p className="text-xs text-gray-600 text-center mb-3 line-clamp-2">{reward.description}</p>

              {/* Points Cost */}
              <div className="flex items-center justify-center gap-1 mb-3">
                <span className="text-xl font-bold text-amber-600">
                  {reward.pointsCost}
                </span>
                <span className="text-xs text-gray-600">pts</span>
              </div>

              {/* Redeem Button */}
              <Button
                onClick={() => handleRedeem(reward)}
                disabled={!affordable || redeeming === reward.id}
                className={`w-full ${
                  affordable
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                } text-white text-xs font-bold`}
                size="sm"
              >
                {!affordable ? (
                  <><Lock className="w-3 h-3 mr-1" />Locked</>
                ) : redeeming === reward.id ? (
                  'Redeeming...'
                ) : (
                  'Redeem'
                )}
              </Button>

              {!affordable && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-red-600 font-medium">
                    Need {reward.pointsCost - userPoints} more
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}