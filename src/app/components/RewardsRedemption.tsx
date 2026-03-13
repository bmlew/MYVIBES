import React, { useState, useEffect } from 'react';
import { Gift, Coffee, Percent, Star, Sparkles, Lock, CheckCircle } from 'lucide-react';
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
  category: 'discount' | 'freebie' | 'upgrade';
  available: boolean;
}

export function RewardsRedemption({ userPoints, onRedeem }: RewardsRedemptionProps) {
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const rewards: Reward[] = [
    {
      id: 'coffee-free',
      title: 'Free Coffee',
      description: 'Redeem for a complimentary coffee at participating venues',
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
      description: 'Get a complimentary appetizer of your choice',
      pointsCost: 100,
      icon: <Gift className="w-6 h-6" />,
      category: 'freebie',
      available: true
    },
    {
      id: 'vip-upgrade',
      title: 'VIP Table Upgrade',
      description: 'Upgrade to VIP seating at your next reservation',
      pointsCost: 200,
      icon: <Star className="w-6 h-6" />,
      category: 'upgrade',
      available: true
    },
    {
      id: 'discount-25',
      title: '25% Off',
      description: 'Get 25% off your total bill - Premium reward',
      pointsCost: 250,
      icon: <Sparkles className="w-6 h-6" />,
      category: 'discount',
      available: true
    }
  ];

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
        return 'from-green-400 to-emerald-600';
      case 'freebie':
        return 'from-blue-400 to-cyan-600';
      case 'upgrade':
        return 'from-purple-400 to-pink-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const canAfford = (pointsCost: number) => userPoints >= pointsCost;

  return (
    <div className="space-y-4">
      {/* Points Balance */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-sm font-medium mb-1">Available Points</p>
            <h2 className="text-4xl font-bold">{userPoints}</h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-4xl">💎</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <p className="text-sm text-cyan-900">
          <strong>How it works:</strong> Redeem your points for rewards at participating venues. 
          Each check-in earns you 10 points!
        </p>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const affordable = canAfford(reward.pointsCost);
          
          return (
            <div
              key={reward.id}
              className={`rounded-xl p-5 border-2 transition-all ${
                affordable
                  ? 'border-cyan-200 bg-white hover:shadow-lg hover:border-cyan-400'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${getCategoryColor(
                    reward.category
                  )} text-white shadow-lg`}
                >
                  {reward.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1">{reward.title}</h3>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-amber-600">
                    {reward.pointsCost}
                  </span>
                  <span className="text-sm text-gray-600">points</span>
                </div>
                <Button
                  onClick={() => handleRedeem(reward)}
                  disabled={!affordable || redeeming === reward.id}
                  className={`${
                    affordable
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  } text-white`}
                  size="sm"
                >
                  {!affordable ? (
                    <>
                      <Lock className="w-4 h-4 mr-1" />
                      Locked
                    </>
                  ) : redeeming === reward.id ? (
                    'Redeeming...'
                  ) : (
                    'Redeem'
                  )}
                </Button>
              </div>

              {!affordable && (
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                  <span>Need {reward.pointsCost - userPoints} more points</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
