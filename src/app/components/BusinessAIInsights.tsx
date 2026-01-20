import { Sparkles, TrendingUp, Clock, Calendar, Target, Lightbulb, BarChart2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export function BusinessAIInsights() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing'>('overview');

  // Mock AI insights - in production, fetch from backend
  const insights = {
    best_performing_specials: [
      { title: 'Happy Hour - 50% Off', views: 1245, days_active: 7, performance_score: 178 },
      { title: 'Lunch Special R99', views: 980, days_active: 14, performance_score: 70 },
      { title: 'Weekend Brunch', views: 756, days_active: 8, performance_score: 95 },
    ],
    optimal_posting_times: {
      best_day: 'Friday',
      best_time: '17:00 - 19:00',
      confidence: 85,
      reason: 'Based on 60% higher engagement during this time window'
    },
    rating_trend: {
      trend: 'improving',
      message: 'Customer satisfaction is improving',
      change: '+0.3'
    },
    recommended_actions: [
      'Post 2 more specials this week - businesses with 3+ active specials see 45% more bookings',
      'Post a weekend special - optimal engagement window is Friday 5-7 PM',
      'Happy Hour specials posted on Thursdays get 62% more views',
      'Respond to recent reviews to improve engagement by 30%'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-orange-500 to-purple-500 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI-Powered Insights</h2>
          <p className="text-sm text-gray-600">Data-driven recommendations for your business</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-900">ML Confidence</h3>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{insights.optimal_posting_times.confidence}%</p>
          <p className="text-xs text-blue-700 mt-1">High accuracy predictions</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-900">Rating Trend</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{insights.rating_trend.change}</p>
          <p className="text-xs text-green-700 mt-1">{insights.rating_trend.message}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-purple-900">Best Time</h3>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-purple-900">{insights.optimal_posting_times.best_time}</p>
          <p className="text-xs text-purple-700 mt-1">{insights.optimal_posting_times.best_day}s</p>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-lg">AI Recommendations</h3>
          <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-700">
            Updated 2 hours ago
          </Badge>
        </div>
        
        <div className="space-y-3">
          {insights.recommended_actions.map((action, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border border-orange-100">
              <div className="p-1.5 bg-white rounded-full mt-0.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{action}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Performing Specials */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-[#3B5166]" />
          <h3 className="font-bold text-lg">Top Performing Specials</h3>
        </div>
        
        <div className="space-y-3">
          {insights.best_performing_specials.map((special, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                    ${idx === 1 ? 'bg-gray-300 text-gray-700' : ''}
                    ${idx === 2 ? 'bg-orange-400 text-orange-900' : ''}
                  `}>
                    {idx + 1}
                  </div>
                  <h4 className="font-semibold text-sm">{special.title}</h4>
                </div>
                <Badge variant="outline" className="text-xs">
                  Score: {special.performance_score}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600 ml-8">
                <span>{special.views} views</span>
                <span>•</span>
                <span>{special.days_active} days active</span>
                <span>•</span>
                <span className="text-green-600 font-semibold">{Math.round(special.views / special.days_active)} views/day</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimal Posting Strategy */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Optimal Posting Strategy</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-700">Best Days</h4>
            <div className="space-y-2">
              {['Friday', 'Thursday', 'Saturday'].map((day, idx) => (
                <div key={day} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-yellow-500' : 'bg-orange-500'}`}></div>
                  <span className="text-sm">{day}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {idx === 0 ? '85%' : idx === 1 ? '72%' : '68%'} engagement
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-700">Best Times</h4>
            <div className="space-y-2">
              {[
                { time: '17:00 - 19:00', label: 'Happy Hour Peak' },
                { time: '12:00 - 14:00', label: 'Lunch Rush' },
                { time: '19:00 - 21:00', label: 'Dinner Prime' }
              ].map((slot, idx) => (
                <div key={slot.time} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-yellow-500' : 'bg-orange-500'}`}></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{slot.time}</span>
                    <span className="text-xs text-gray-500 ml-2">({slot.label})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-sm text-gray-700">
            <strong>Pro Tip:</strong> {insights.optimal_posting_times.reason}
          </p>
        </div>
      </Card>

      {/* ML Prediction Explanation */}
      <Card className="p-6 bg-gray-50 border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[#3B5166]" />
          <h3 className="font-bold text-sm">How AI Recommendations Work</h3>
        </div>
        
        <p className="text-xs text-gray-600 leading-relaxed">
          Our machine learning algorithms analyze over 10,000+ restaurant data points including posting times, 
          customer engagement patterns, day-of-week preferences, seasonal trends, and competitive benchmarks 
          to provide personalized recommendations. The system continuously learns from your specific performance 
          metrics to improve accuracy over time.
        </p>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">Time-of-Day Analysis</Badge>
          <Badge variant="outline" className="text-xs">Seasonal Patterns</Badge>
          <Badge variant="outline" className="text-xs">User Behavior</Badge>
          <Badge variant="outline" className="text-xs">Competitive Intelligence</Badge>
        </div>
      </Card>
    </div>
  );
}