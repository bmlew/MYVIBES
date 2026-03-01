import React, { useEffect, useState } from 'react';
import * as api from '@/utils/api';
import { Trophy, User, Medal } from 'lucide-react';

interface LeaderboardProps {
  businessId: string;
}

interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  checkin_count: number;
  total_points: number;
  last_checkin: string;
}

export function Leaderboard({ businessId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getLeaderboard(businessId);
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [businessId]);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No check-ins yet. Be the first to claim the throne!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Visitors
        </h3>
        <span className="text-xs text-gray-500">Updated live</span>
      </div>

      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.user_id} 
            className={`flex items-center p-3 rounded-lg border ${
              index === 0 ? 'bg-yellow-50 border-yellow-200' : 
              index === 1 ? 'bg-gray-50 border-gray-200' : 
              index === 2 ? 'bg-orange-50 border-orange-200' : 
              'bg-white border-gray-100'
            }`}
          >
            <div className="flex-shrink-0 w-8 text-center font-bold text-gray-500">
              {index === 0 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> : 
               index === 1 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> : 
               index === 2 ? <Medal className="w-6 h-6 text-orange-400 mx-auto" /> : 
               `#${index + 1}`}
            </div>
            
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold ml-2">
              {entry.user_name.charAt(0).toUpperCase()}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {entry.user_name}
              </p>
              <p className="text-xs text-gray-500">
                {entry.total_points} points
              </p>
            </div>
            
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {entry.checkin_count} visits
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
