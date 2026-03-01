import React, { useEffect, useState } from 'react';
import * as api from '@/utils/api';
import { User, Clock, MapPin } from 'lucide-react';

interface RecentCheckInsProps {
  businessId: string;
}

interface CheckIn {
  id: string;
  user_name: string;
  user_avatar?: string;
  timestamp: string;
  location?: { latitude: number; longitude: number };
}

export function RecentCheckIns({ businessId }: RecentCheckInsProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        setLoading(true);
        const data = await api.getRecentCheckIns(businessId);
        setCheckIns(data);
      } catch (error) {
        console.error('Failed to load check-ins', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckIns();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchCheckIns, 30000);
    return () => clearInterval(interval);
  }, [businessId]);

  if (loading && checkIns.length === 0) {
    return <div className="text-sm text-gray-500">Loading check-ins...</div>;
  }

  if (checkIns.length === 0) {
    return <div className="text-sm text-gray-500">No recent check-ins.</div>;
  }

  return (
    <div className="space-y-3">
      {checkIns.map((checkIn) => {
        const time = new Date(checkIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isToday = new Date(checkIn.timestamp).toDateString() === new Date().toDateString();
        const date = isToday ? 'Today' : new Date(checkIn.timestamp).toLocaleDateString();

        return (
          <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                {checkIn.user_avatar ? (
                  <img src={checkIn.user_avatar} alt={checkIn.user_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  checkIn.user_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{checkIn.user_name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {time}
                  </span>
                  {!isToday && <span>• {date}</span>}
                </div>
              </div>
            </div>
            {checkIn.location && (
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Verified
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
