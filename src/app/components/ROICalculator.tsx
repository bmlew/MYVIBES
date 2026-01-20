import { useState } from 'react';
import { TrendingUp, DollarSign, Users, Calendar, AlertCircle, CheckCircle, ArrowLeft, Download, FileText, Printer } from 'lucide-react';
import { CONFIG } from '@/config/platform';

interface ROICalculatorProps {
  onBack: () => void;
}

export function ROICalculator({ onBack }: ROICalculatorProps) {
  const [monthlySubscriptionFee, setMonthlySubscriptionFee] = useState(499);
  const [targetSubscribers, setTargetSubscribers] = useState(200);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState(10);
  const [initialInvestment, setInitialInvestment] = useState(0); // Platform setup costs - default 0
  const [discountMonths, setDiscountMonths] = useState(0); // Number of months with promotional discount
  const [discountPercentage, setDiscountPercentage] = useState(50); // Discount percentage (default 50%)

  const costs = {
    hosting: 2500, // AWS/Google Cloud
    development: 15000, // 1 developer part-time
    marketing: 10000, // Digital ads, social media
    support: 5000, // Customer support
    infrastructure: 3000, // SMS, Maps API, Firebase, etc.
    admin: 2500, // General admin costs
  };

  const totalMonthlyCosts = Object.values(costs).reduce((a, b) => a + b, 0);
  
  // Break-even calculation
  const breakEvenSubscribers = Math.ceil(totalMonthlyCosts / monthlySubscriptionFee);
  
  // Revenue calculations
  const monthlyRevenue = targetSubscribers * monthlySubscriptionFee;
  const monthlyProfit = monthlyRevenue - totalMonthlyCosts;
  const profitMargin = totalMonthlyCosts > 0 ? ((monthlyProfit / monthlyRevenue) * 100) : 0;
  
  // Annual projections
  const annualRevenue = monthlyRevenue * 12;
  const annualCosts = totalMonthlyCosts * 12;
  const annualProfit = annualRevenue - annualCosts;
  
  // ROI calculation (assuming initial investment)
  const monthsToBreakEven = monthlyProfit > 0 ? Math.ceil(initialInvestment / monthlyProfit) : 0;
  const roi = initialInvestment > 0 ? ((annualProfit / initialInvestment) * 100) : 0;
  
  // Growth projection
  const calculateGrowthProjection = () => {
    const projections = [];
    let subscribers = targetSubscribers;
    let cumulativeProfit = -initialInvestment;
    
    for (let month = 1; month <= 24; month++) {
      const revenue = subscribers * monthlySubscriptionFee;
      const profit = revenue - totalMonthlyCosts;
      cumulativeProfit += profit;
      
      projections.push({
        month,
        subscribers: Math.round(subscribers),
        revenue,
        profit,
        cumulativeProfit,
      });
      
      subscribers *= (1 + monthlyGrowthRate / 100);
    }
    
    return projections;
  };
  
  const projections = calculateGrowthProjection();
  const breakEvenMonth = projections.find(p => p.cumulativeProfit >= 0);

  // Export functions
  const exportToCSV = () => {
    const csvContent = [
      // Header
      ['MYVIBES ROI Calculator Export'],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [],
      ['Input Parameters'],
      ['Monthly Subscription Fee', `R${monthlySubscriptionFee}`],
      ['Current Subscribers', targetSubscribers],
      ['Monthly Growth Rate', `${monthlyGrowthRate}%`],
      [],
      ['Key Metrics'],
      ['Break-Even Subscribers', breakEvenSubscribers],
      ['Monthly Profit', `R${monthlyProfit.toLocaleString()}`],
      ['Annual ROI', `${roi.toFixed(1)}%`],
      ['Payback Period (months)', breakEvenMonth ? breakEvenMonth.month : '24+'],
      [],
      ['Cost Breakdown'],
      ['Hosting', `R${costs.hosting}`],
      ['Development', `R${costs.development}`],
      ['Marketing', `R${costs.marketing}`],
      ['Support', `R${costs.support}`],
      ['Infrastructure', `R${costs.infrastructure}`],
      ['Admin', `R${costs.admin}`],
      ['Total Monthly Costs', `R${totalMonthlyCosts}`],
      [],
      ['24-Month Projection'],
      ['Month', 'Subscribers', 'Revenue', 'Costs', 'Profit', 'Cumulative Profit'],
      ...projections.map(p => [
        p.month,
        p.subscribers,
        `R${p.revenue.toFixed(0)}`,
        `R${totalMonthlyCosts}`,
        `R${p.profit.toFixed(0)}`,
        `R${p.cumulativeProfit.toFixed(0)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MYVIBES_ROI_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      inputs: {
        monthlySubscriptionFee,
        targetSubscribers,
        monthlyGrowthRate,
      },
      keyMetrics: {
        breakEvenSubscribers,
        monthlyProfit,
        annualROI: parseFloat(roi.toFixed(1)),
        paybackPeriodMonths: breakEvenMonth ? breakEvenMonth.month : 24,
      },
      costBreakdown: {
        ...costs,
        total: totalMonthlyCosts,
      },
      projections: projections.map(p => ({
        month: p.month,
        subscribers: p.subscribers,
        revenue: parseFloat(p.revenue.toFixed(2)),
        costs: totalMonthlyCosts,
        profit: parseFloat(p.profit.toFixed(2)),
        cumulativeProfit: parseFloat(p.cumulativeProfit.toFixed(2)),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MYVIBES_ROI_Analysis_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF6B35] to-[#8B5CF6] text-white p-6">
        <button 
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white/90 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold mb-2">MYVIBES ROI Calculator</h1>
        <p className="text-sm opacity-90">Financial Analysis for R{monthlySubscriptionFee}/month Subscription Model</p>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Input Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Adjust Your Variables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Subscription Fee (ZAR)</label>
              <input
                type="number"
                value={monthlySubscriptionFee}
                onChange={(e) => setMonthlySubscriptionFee(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Current Subscribers</label>
              <input
                type="number"
                value={targetSubscribers}
                onChange={(e) => setTargetSubscribers(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Growth Rate (%)</label>
              <input
                type="number"
                value={monthlyGrowthRate}
                onChange={(e) => setMonthlyGrowthRate(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Initial Setup Cost (ZAR)
                <span className="text-xs text-gray-500 ml-1">(optional)</span>
              </label>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Promotional Discount Months
                <span className="text-xs text-gray-500 ml-1">(0-12)</span>
              </label>
              <input
                type="number"
                min="0"
                max="12"
                value={discountMonths}
                onChange={(e) => setDiscountMonths(Math.min(12, Math.max(0, Number(e.target.value))))}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Percentage (%)
                <span className="text-xs text-gray-500 ml-1">(1-100)</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Math.min(100, Math.max(1, Number(e.target.value))))}
                placeholder="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              />
            </div>
          </div>
          {initialInvestment > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Initial Investment:</strong> R{initialInvestment.toLocaleString()} will be subtracted from Month 1 cumulative profit. This represents one-time setup costs like development, branding, or infrastructure.
              </p>
            </div>
          )}
          {discountMonths > 0 && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                🎉 <strong>Promotional Pricing:</strong> First {discountMonths} month{discountMonths > 1 ? 's' : ''} at {discountPercentage}% off (R{Math.round(monthlySubscriptionFee * (1 - discountPercentage / 100))}/month), then regular price (R{monthlySubscriptionFee}/month). 
                Total savings: <strong>R{Math.round(monthlySubscriptionFee * (discountPercentage / 100) * discountMonths * targetSubscribers).toLocaleString()}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600">Break-Even Point</div>
            </div>
            <div className="text-2xl font-bold">{breakEvenSubscribers}</div>
            <div className="text-xs text-gray-500 mt-1">subscribers needed</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Monthly Profit</div>
            </div>
            <div className={`text-2xl font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R{monthlyProfit.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">at {targetSubscribers} subscribers</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-sm text-gray-600">Annual ROI</div>
            </div>
            <div className="text-2xl font-bold">{roi.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">on R150k investment</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-sm text-gray-600">Payback Period</div>
            </div>
            <div className="text-2xl font-bold">
              {breakEvenMonth ? breakEvenMonth.month : '24+'}
            </div>
            <div className="text-xs text-gray-500 mt-1">months to ROI</div>
          </div>
        </div>

        {/* Status Alert */}
        <div className={`rounded-lg p-4 mb-6 ${targetSubscribers >= breakEvenSubscribers ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-start gap-3">
            {targetSubscribers >= breakEvenSubscribers ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className={`font-semibold mb-1 ${targetSubscribers >= breakEvenSubscribers ? 'text-green-900' : 'text-orange-900'}`}>
                {targetSubscribers >= breakEvenSubscribers 
                  ? '✅ Profitable!'
                  : `⚠️ Need ${breakEvenSubscribers - targetSubscribers} more subscribers to break even`
                }
              </div>
              <div className={`text-sm ${targetSubscribers >= breakEvenSubscribers ? 'text-green-700' : 'text-orange-700'}`}>
                {targetSubscribers >= breakEvenSubscribers
                  ? `You're making R${monthlyProfit.toLocaleString()}/month profit with a ${profitMargin.toFixed(1)}% margin.`
                  : `Currently operating at a loss of R${Math.abs(monthlyProfit).toLocaleString()}/month.`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Monthly Cost Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(costs).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#8B5CF6]"></div>
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                  <span className="font-semibold">R{value.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold">Total Monthly Costs</span>
                <span className="font-bold text-lg">R{totalMonthlyCosts.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Revenue Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Subscription Fee</span>
                <span className="font-semibold">R{monthlySubscriptionFee}/month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Subscribers</span>
                <span className="font-semibold">{targetSubscribers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Revenue</span>
                <span className="font-semibold">R{monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm">Monthly Costs</span>
                <span className="font-semibold text-red-600">-R{totalMonthlyCosts.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold">Net Profit</span>
                <span className={`font-bold text-lg ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R{monthlyProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 24-Month Growth Projection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">24-Month Growth Projection ({monthlyGrowthRate}% monthly growth)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Month</th>
                  <th className="text-right py-2 px-3">Subscribers</th>
                  <th className="text-right py-2 px-3">Revenue</th>
                  <th className="text-right py-2 px-3">Costs</th>
                  <th className="text-right py-2 px-3">Profit</th>
                  <th className="text-right py-2 px-3">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((p) => (
                  <tr key={p.month} className={`border-b ${p.cumulativeProfit >= 0 && projections[p.month - 2]?.cumulativeProfit < 0 ? 'bg-green-50 font-semibold' : ''}`}>
                    <td className="py-2 px-3">
                      {p.month}
                      {p.cumulativeProfit >= 0 && projections[p.month - 2]?.cumulativeProfit < 0 && (
                        <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded">BREAK-EVEN</span>
                      )}
                    </td>
                    <td className="text-right py-2 px-3">{p.subscribers}</td>
                    <td className="text-right py-2 px-3">R{p.revenue.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}</td>
                    <td className="text-right py-2 px-3">R{totalMonthlyCosts.toLocaleString()}</td>
                    <td className={`text-right py-2 px-3 ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R{p.profit.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                    </td>
                    <td className={`text-right py-2 px-3 font-semibold ${p.cumulativeProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R{p.cumulativeProfit.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#8B5CF6] rounded-lg p-6 mt-6 text-white">
          <h2 className="text-lg font-bold mb-4">📊 Key Business Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">South African Market Opportunity:</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• 10,000+ restaurants in Gauteng alone</li>
                <li>• Growing digital adoption in hospitality</li>
                <li>• Limited local competition in this space</li>
                <li>• Average restaurant spends R500-2000/month on marketing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Value Proposition:</h3>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• R250/month = 83 cents per day</li>
                <li>• Need just 1-2 extra customers/month to ROI</li>
                <li>• Replaces expensive print/social media ads</li>
                <li>• Real-time menu updates & specials promotion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Export and Print Buttons */}
        <div className="mt-6 flex flex-wrap gap-4 no-print">
          <button
            onClick={exportToCSV}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export to CSV</span>
          </button>
          <button
            onClick={exportToJSON}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Export to JSON</span>
          </button>
          <button
            onClick={printReport}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Printer className="w-5 h-5" />
            <span>Print Report</span>
          </button>
        </div>

        {/* Export Info Card */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 no-print">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Export Your Financial Analysis</h3>
              <p className="text-sm text-blue-700">
                <strong>CSV:</strong> Import into Excel or Google Sheets for custom analysis.{' '}
                <strong>JSON:</strong> Use with web apps or APIs for automation.{' '}
                <strong>Print:</strong> Save as PDF or print for presentations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}