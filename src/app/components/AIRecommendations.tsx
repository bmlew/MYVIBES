import { Sparkles, TrendingUp, Clock, Calendar, Users } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import * as api from '@/utils/api';

interface AIRecommendationsProps {
  userLocation?: { lat: number; lng: number };
  currentTime?: Date;
  onVenueClick?: (venueId: string) => void;
}

interface Recommendation {
  id: string;
  type: 'special' | 'venue' | 'event';
  title: string;
  venue: string;
  reason: string;
  confidence: number;
  image: string;
  tags: string[];
}

export function AIRecommendations({ userLocation, currentTime = new Date(), onVenueClick }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch AI recommendations from backend
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const recs = await api.getRecommendations(
          userLocation?.lat,
          userLocation?.lng
        );
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching AI recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userLocation?.lat, userLocation?.lng]); // Use primitive values instead of object

  const getCurrentTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'dinner';
    return 'late-night';
  };

  const getDayType = () => {
    const day = currentTime.getDay();
    return day === 0 || day === 6 ? 'weekend' : 'weekday';
  };

  const timeOfDay = getCurrentTimeOfDay();
  const dayType = getDayType();

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-purple-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">AI Recommendations</h3>
            <p className="text-xs text-gray-600">Loading personalized suggestions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* AI Insights Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-purple-500 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-base">AI Recommendations</h3>
          <p className="text-xs text-gray-600">
            Personalized for {timeOfDay} • {dayType}
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-2">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onVenueClick?.(rec.id)}>
            <div className="flex gap-3 p-3">
              {/* Image */}
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={rec.image} 
                  alt={rec.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm line-clamp-1">{rec.title}</h4>
                    <p className="text-xs text-gray-600 mb-1">{rec.venue}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-semibold text-green-600">{rec.confidence}%</span>
                  </div>
                </div>

                {/* AI Reason */}
                <div className="flex items-start gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-700 line-clamp-2">{rec.reason}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {rec.tags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary"
                      className="text-xs px-2 py-0 bg-purple-100 text-purple-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}