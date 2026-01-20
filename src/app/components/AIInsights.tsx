import React from 'react';
import { TrendingUp, TrendingDown, Minus, Lightbulb, Target, Clock, Star } from 'lucide-react';

interface AIInsightsProps {
  insights: {
    best_performing_specials: Array<{
      title: string;
      views: number;
      days_active: number;
      performance_score: number;
    }>;
    optimal_posting_times: {
      best_day: string;
      best_time: string;
      confidence: number;
      reason: string;
    };
    rating_trend: {
      trend: 'improving' | 'declining' | 'stable' | 'neutral';
      message: string;
      change?: string;
    };
    recommended_actions: string[];
  };
}

export function AIInsights({ insights }: AIInsightsProps) {
  const getTrendIcon = () => {
    switch (insights.rating_trend.trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (insights.rating_trend.trend) {
      case 'improving':
        return 'bg-green-50 border-green-200';
      case 'declining':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Recommendations */}
      <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI-Powered Recommendations</h3>
            <p className="text-sm text-gray-600">Based on ML analysis of your performance</p>
          </div>
        </div>
        <div className="space-y-2">
          {insights.recommended_actions.map((action, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-sm flex-1">{action}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimal Posting Times */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold">Optimal Posting Time</h3>
              <p className="text-xs text-gray-600">AI-predicted best engagement window</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Best Day:</span>
              <span className="font-bold text-blue-600">{insights.optimal_posting_times.best_day}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Best Time:</span>
              <span className="font-bold text-blue-600">{insights.optimal_posting_times.best_time}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Confidence:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${insights.optimal_posting_times.confidence}%` }}
                  ></div>
                </div>
                <span className="font-bold text-blue-600">{insights.optimal_posting_times.confidence}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 {insights.optimal_posting_times.reason}
            </p>
          </div>
        </div>

        {/* Rating Trend Analysis */}
        <div className={`rounded-lg p-6 shadow-sm border ${getTrendColor()}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-lg">
              {getTrendIcon()}
            </div>
            <div>
              <h3 className="font-bold">Rating Trend Analysis</h3>
              <p className="text-xs text-gray-600">ML-based customer sentiment tracking</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm text-gray-600">Trend:</span>
              <span className="font-bold capitalize">{insights.rating_trend.trend}</span>
            </div>
            {insights.rating_trend.change && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Change:</span>
                <span className="font-bold">{insights.rating_trend.change} stars</span>
              </div>
            )}
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm">{insights.rating_trend.message}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Best Performing Specials */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Target className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-bold">Top Performing Specials</h3>
            <p className="text-xs text-gray-600">ML-ranked by engagement score</p>
          </div>
        </div>
        <div className="space-y-2">
          {insights.best_performing_specials.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No specials data yet. Create your first special to see AI insights!
            </p>
          ) : (
            insights.best_performing_specials.map((special, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{special.title}</h4>
                    <p className="text-xs text-gray-600">{special.days_active} days active</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-600">{special.views} views</p>
                  <p className="text-xs text-gray-600">Score: {special.performance_score}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
