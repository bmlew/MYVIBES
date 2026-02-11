import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Users, ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

export function ROICalculator({ onBack }: { onBack?: () => void }) {
  const [seats, setSeats] = useState(40);
  const [avgSpend, setAvgSpend] = useState(250);
  const [occupancy, setOccupancy] = useState(40); // %
  const [turnover, setTurnover] = useState(1.5); // turns per table

  // Calculations
  const dailyRevenue = seats * (occupancy / 100) * turnover * avgSpend;
  const monthlyRevenue = dailyRevenue * 26; // 26 days open
  
  // MYVIBES Impact (Conservative estimates)
  // +15% occupancy (better visibility)
  // +10% turnover (pre-ordering/reservations)
  const newOccupancy = Math.min(100, occupancy * 1.15); 
  const newTurnover = turnover * 1.10;
  
  const newDailyRevenue = seats * (newOccupancy / 100) * newTurnover * avgSpend;
  const newMonthlyRevenue = newDailyRevenue * 26;
  
  const increase = newMonthlyRevenue - monthlyRevenue;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-8 h-8 text-cyan-600" />
              ROI Calculator
            </h1>
            <p className="text-gray-500">See how much more you could earn with MYVIBES</p>
          </div>
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-semibold mb-4">Your Current Numbers</h2>
            
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Total Seats</span>
                <span className="text-cyan-600 font-bold">{seats}</span>
              </label>
              <input 
                type="range" min="10" max="500" step="5"
                value={seats} onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full accent-cyan-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Average Spend (R)</span>
                <span className="text-cyan-600 font-bold">R{avgSpend}</span>
              </label>
              <input 
                type="range" min="50" max="2000" step="50"
                value={avgSpend} onChange={(e) => setAvgSpend(Number(e.target.value))}
                className="w-full accent-cyan-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Occupancy Rate (%)</span>
                <span className="text-cyan-600 font-bold">{occupancy}%</span>
              </label>
              <input 
                type="range" min="10" max="100" step="5"
                value={occupancy} onChange={(e) => setOccupancy(Number(e.target.value))}
                className="w-full accent-cyan-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Table Turns (Daily)</span>
                <span className="text-cyan-600 font-bold">{turnover}x</span>
              </label>
              <input 
                type="range" min="0.5" max="5" step="0.5"
                value={turnover} onChange={(e) => setTurnover(Number(e.target.value))}
                className="w-full accent-cyan-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 text-cyan-400 mb-2 font-medium">
                <TrendingUp className="w-5 h-5" /> Potential Monthly Increase
              </div>
              <div className="text-5xl font-bold mb-2">
                +R{increase.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-gray-400 text-sm">
                Based on a conservative 15% increase in occupancy and optimized table turnover.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Projected Annual Revenue</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Current</span>
                    <span className="font-medium">R{(monthlyRevenue * 12).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-cyan-600 font-bold">With MYVIBES</span>
                    <span className="font-bold text-cyan-600">R{(newMonthlyRevenue * 12).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: `${(newMonthlyRevenue / monthlyRevenue) * 100}%` }}
                      className="h-full bg-cyan-500 rounded-full" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.href = '/?mode=business-auth'}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
