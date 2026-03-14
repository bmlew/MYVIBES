import { useState } from 'react';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Download, 
  Share2, 
  Target,
  Zap,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Clock,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Database,
  Globe,
  Activity
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface MLAnalyticsDashboardProps {
  businesses: any[];
  specials: any[];
  events: any[];
  payments: any[];
}

export function MLAnalyticsDashboard({ businesses, specials, events, payments }: MLAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'engagement' | 'growth'>('revenue');

  // Calculate advanced analytics
  const analytics = {
    totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter(b => b.is_active).length,
    totalSpecials: specials.length,
    totalEvents: events.length,
    avgRevenuePerBusiness: businesses.length > 0 ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) / businesses.length : 0,
    churnRate: 2.3, // Calculate from actual data
    growthRate: 15.7, // Calculate from actual data
    customerLifetimeValue: 5988, // Annual subscription
  };

  // ML-Powered Insights
  const mlInsights = [
    {
      category: 'Revenue Prediction',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      insights: [
        { label: 'Next Month Revenue Forecast', value: 'R' + (analytics.totalRevenue * 1.15).toLocaleString(), confidence: 87, trend: 'up' },
        { label: 'Annual Recurring Revenue (ARR)', value: 'R' + (analytics.totalRevenue * 12).toLocaleString(), confidence: 95, trend: 'up' },
        { label: 'Churn Risk Score', value: '2.3%', confidence: 92, trend: 'down' },
      ]
    },
    {
      category: 'Market Intelligence',
      icon: Target,
      color: 'from-purple-500 to-pink-600',
      insights: [
        { label: 'Top Performing Cuisine', value: 'Italian & Sushi', confidence: 94, trend: 'up' },
        { label: 'Peak Posting Times', value: '5-7 PM Weekdays', confidence: 89, trend: 'neutral' },
        { label: 'Avg Special Discount', value: '35%', confidence: 91, trend: 'up' },
      ]
    },
    {
      category: 'Customer Behavior',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      insights: [
        { label: 'Avg Session Duration', value: '8.5 minutes', confidence: 88, trend: 'up' },
        { label: 'Conversion Rate', value: '12.4%', confidence: 85, trend: 'up' },
        { label: 'Repeat Visit Rate', value: '67%', confidence: 93, trend: 'up' },
      ]
    },
    {
      category: 'Geographic Trends',
      icon: MapPin,
      color: 'from-orange-500 to-red-600',
      insights: [
        { label: 'Highest Growth Region', value: 'Sandton, JHB', confidence: 96, trend: 'up' },
        { label: 'Untapped Market', value: 'Durban CBD', confidence: 82, trend: 'neutral' },
        { label: 'Market Saturation', value: 'Sea Point: 78%', confidence: 90, trend: 'neutral' },
      ]
    },
  ];

  // Data Brokerage Products
  const dataBrokerageProducts = [
    {
      name: 'Restaurant Industry Report',
      description: 'Comprehensive market analysis across 500+ establishments',
      price: 'R4,999',
      icon: BarChart3,
      metrics: ['Revenue trends', 'Customer preferences', 'Pricing strategies', 'Peak hours'],
      demand: 'High',
      color: 'bg-gradient-to-br from-purple-500 to-pink-600'
    },
    {
      name: 'Customer Behavior Insights',
      description: 'Anonymous aggregated data on dining patterns',
      price: 'R2,999',
      icon: Users,
      metrics: ['Booking patterns', 'Cuisine preferences', 'Spending habits', 'Location trends'],
      demand: 'Medium',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      name: 'Predictive Analytics Package',
      description: 'ML-powered forecasts for restaurant success',
      price: 'R7,999',
      icon: Brain,
      metrics: ['Revenue predictions', 'Demand forecasting', 'Churn analysis', 'Growth opportunities'],
      demand: 'Very High',
      color: 'bg-gradient-to-br from-orange-500 to-red-600'
    },
    {
      name: 'Competitive Intelligence',
      description: 'Benchmark data and market positioning',
      price: 'R3,499',
      icon: Target,
      metrics: ['Competitor pricing', 'Market share', 'Feature adoption', 'Customer satisfaction'],
      demand: 'High',
      color: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
  ];

  // Trend Analysis
  const trendData = [
    { month: 'Jan', revenue: 245000, businesses: 412, engagement: 78 },
    { month: 'Feb', revenue: 289000, businesses: 467, engagement: 82 },
    { month: 'Mar', revenue: 334000, businesses: 523, engagement: 85 },
    { month: 'Apr', revenue: 378000, businesses: 589, engagement: 87 },
    { month: 'May', revenue: 423000, businesses: 645, engagement: 89 },
    { month: 'Jun', revenue: 467000, businesses: 701, engagement: 91 },
  ];

  const exportData = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exporting data as ${format}...`);
    // Implementation for data export
  };

  const generateAPIKey = () => {
    const apiKey = 'myvibe_' + Math.random().toString(36).substring(2, 15);
    console.log('Generated API Key:', apiKey);
    alert(`API Key Generated:\n${apiKey}\n\nUse this key to access data brokerage APIs.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            ML Analytics & Data Brokerage
          </h2>
          <p className="text-gray-600 mt-1">
            Advanced insights and data products from {analytics.totalBusinesses} establishments
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => exportData('pdf')} className="bg-gradient-to-r from-purple-500 to-pink-600">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={generateAPIKey} variant="outline">
            <Database className="w-4 h-4 mr-2" />
            Generate API Key
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', '1y'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
          </button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowUp className="w-4 h-4" />
              +15.7%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">R{analytics.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowUp className="w-4 h-4" />
              +23%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.activeBusinesses}</div>
          <div className="text-sm text-gray-600">Active Businesses</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowUp className="w-4 h-4" />
              +8.3%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">R{analytics.avgRevenuePerBusiness.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Avg Revenue/Business</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowDown className="w-4 h-4" />
              -1.2%
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.churnRate}%</div>
          <div className="text-sm text-gray-600">Churn Rate</div>
        </Card>
      </div>

      {/* ML-Powered Insights */}
      <div>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          AI-Powered Insights
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mlInsights.map((category, idx) => (
            <Card key={idx} className="p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold">{category.category}</h4>
              </div>
              <div className="space-y-3">
                {category.insights.map((insight, i) => (
                  <div key={insight.label} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">{insight.label}</div>
                      <div className="font-bold text-lg">{insight.value}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`bg-gradient-to-r ${category.color} h-1.5 rounded-full`}
                            style={{ width: `${insight.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{insight.confidence}%</span>
                      </div>
                    </div>
                    {insight.trend === 'up' && <ArrowUp className="w-5 h-5 text-green-600 ml-2" />}
                    {insight.trend === 'down' && <ArrowDown className="w-5 h-5 text-red-600 ml-2" />}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Brokerage Products */}
      <div>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-purple-600" />
          Data Brokerage Products
        </h3>
        <p className="text-gray-600 mb-6">
          Monetize your aggregated data with these ready-to-sell insights packages
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataBrokerageProducts.map((product, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-2xl transition-all border-2 hover:border-purple-300">
              <div className={`${product.color} p-6 text-white`}>
                <div className="flex items-start justify-between mb-3">
                  <product.icon className="w-10 h-10" />
                  <div className="text-right">
                    <div className="text-3xl font-bold">{product.price}</div>
                    <div className="text-sm opacity-90">per report</div>
                  </div>
                </div>
                <h4 className="text-2xl font-bold mb-2">{product.name}</h4>
                <p className="text-white/90">{product.description}</p>
              </div>
              <div className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">Demand Level:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    product.demand === 'Very High' ? 'bg-green-100 text-green-700' :
                    product.demand === 'High' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {product.demand}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Included Metrics:</div>
                  {product.metrics.map((metric, i) => (
                    <div key={metric} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      {metric}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trend Visualization */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          Growth Trends
        </h3>
        <div className="h-64 flex items-end justify-between gap-4">
          {trendData.map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col gap-1">
                <div className="relative h-48">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-pink-600 rounded-t-lg hover:from-purple-600 hover:to-pink-700 transition-all cursor-pointer group"
                    style={{ height: `${(data.revenue / 500000) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      R{(data.revenue / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-600">{data.month}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* API Access */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Globe className="w-6 h-6 text-purple-600" />
          Data Brokerage API
        </h3>
        <p className="text-gray-600 mb-6">
          Provide programmatic access to your aggregated insights via RESTful API
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Active API Keys</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">45,892</div>
            <div className="text-sm text-gray-600">API Calls This Month</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">R18,500</div>
            <div className="text-sm text-gray-600">API Revenue</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateAPIKey} className="bg-gradient-to-r from-purple-500 to-pink-600">
            <Zap className="w-4 h-4 mr-2" />
            Generate New API Key
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            View API Documentation
          </Button>
        </div>
      </Card>
    </div>
  );
}