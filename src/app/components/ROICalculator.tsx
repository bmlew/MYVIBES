import React, { useState } from 'react';
import { Slider } from '@/app/components/ui/slider';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Building, Users, Wallet, ArrowRight } from 'lucide-react';

export function ROICalculator({ onStart }: { onStart: () => void }) {
  const [activeTab, setActiveTab] = useState<'affiliate' | 'influencer'>('affiliate');

  // Affiliate State
  const [businessesReferred, setBusinessesReferred] = useState(5);
  const [avgPlan, setAvgPlan] = useState<'standard' | 'premium'>('standard');

  // Influencer State
  const [monthlyDownloads, setMonthlyDownloads] = useState(50);
  const [monthlyBookings, setMonthlyBookings] = useState(10);

  // Constants
  const COMMISSION_RATE = 0.10;
  const PLAN_PRICES = { standard: 499, premium: 999 };
  const CPA_DOWNLOAD = 10; // R10 per verified download
  const CPA_BOOKING = 50;  // R50 per booking

  // Calculations
  const affiliateMonthlyEarnings = businessesReferred * PLAN_PRICES[avgPlan] * COMMISSION_RATE;
  const affiliateYearlyEarnings = affiliateMonthlyEarnings * 12;

  const influencerMonthlyEarnings = (monthlyDownloads * CPA_DOWNLOAD) + (monthlyBookings * CPA_BOOKING);
  const influencerYearlyEarnings = influencerMonthlyEarnings * 12;

  return (
    <section className="py-20 bg-white" id="calculator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider mb-4 border border-green-100">
            Partner Program
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
            Turn your network into net worth.
          </h2>
          <p className="text-lg text-slate-600">
            Whether you refer businesses or drive users, MYVIBES rewards you. Calculate your potential earnings below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Controls */}
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            {/* Tabs */}
            <div className="flex p-1 bg-white rounded-xl mb-8 shadow-sm border border-slate-100">
              <button
                onClick={() => setActiveTab('affiliate')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'affiliate'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4" /> B2B Affiliate
              </button>
              <button
                onClick={() => setActiveTab('influencer')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'influencer'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" /> Influencer
              </button>
            </div>

            {/* Affiliate Controls */}
            {activeTab === 'affiliate' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="font-bold text-slate-700">Businesses Referred</label>
                    <span className="text-cyan-600 font-bold bg-cyan-50 px-3 py-1 rounded-full">{businessesReferred}</span>
                  </div>
                  <Slider
                    defaultValue={[5]}
                    max={100}
                    step={1}
                    value={[businessesReferred]}
                    onValueChange={(val) => setBusinessesReferred(val[0])}
                    className="py-4"
                  />
                  <p className="text-xs text-slate-400 mt-2">Active venues paying monthly subscription</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-4">Average Plan Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setAvgPlan('standard')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        avgPlan === 'standard'
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900">Standard</div>
                      <div className="text-sm text-slate-500">R499/mo</div>
                    </button>
                    <button
                      onClick={() => setAvgPlan('premium')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        avgPlan === 'premium'
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900">Premium</div>
                      <div className="text-sm text-slate-500">R999/mo</div>
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="text-sm text-blue-800 font-medium flex items-start gap-2">
                    <div className="bg-blue-200 p-1 rounded-full mt-0.5"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /></div>
                    You earn 10% recurring commission for the lifetime of every business you refer.
                  </div>
                </div>
              </div>
            )}

            {/* Influencer Controls */}
            {activeTab === 'influencer' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="font-bold text-slate-700">Monthly App Downloads</label>
                    <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full">{monthlyDownloads}</span>
                  </div>
                  <Slider
                    defaultValue={[50]}
                    max={1000}
                    step={10}
                    value={[monthlyDownloads]}
                    onValueChange={(val) => setMonthlyDownloads(val[0])}
                    className="py-4"
                  />
                  <p className="text-xs text-slate-400 mt-2">New users who download via your link (Est. R{CPA_DOWNLOAD}/user)</p>
                </div>

                <div>
                  <div className="flex justify-between mb-4">
                    <label className="font-bold text-slate-700">Monthly Bookings</label>
                    <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full">{monthlyBookings}</span>
                  </div>
                  <Slider
                    defaultValue={[10]}
                    max={200}
                    step={5}
                    value={[monthlyBookings]}
                    onValueChange={(val) => setMonthlyBookings(val[0])}
                    className="py-4"
                  />
                  <p className="text-xs text-slate-400 mt-2">Table reservations driven by your content (Est. R{CPA_BOOKING}/booking)</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <div className="text-sm text-purple-800 font-medium flex items-start gap-2">
                     <div className="bg-purple-200 p-1 rounded-full mt-0.5"><div className="w-1.5 h-1.5 bg-purple-600 rounded-full" /></div>
                    Campaign rates may vary. Join the Partner Portal to see active campaigns.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Card */}
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br rounded-3xl blur-2xl opacity-20 transform translate-y-4 ${
              activeTab === 'affiliate' ? 'from-cyan-500 to-blue-600' : 'from-purple-500 to-pink-600'
            }`} />
            
            <Card className="relative bg-white border-none shadow-2xl rounded-3xl overflow-hidden">
              <div className={`h-2 w-full bg-gradient-to-r ${
                activeTab === 'affiliate' ? 'from-cyan-500 to-blue-600' : 'from-purple-500 to-pink-600'
              }`} />
              
              <div className="p-8 md:p-12 text-center">
                <div className="mb-2 text-slate-500 font-semibold uppercase tracking-wider text-sm">
                  Estimated Monthly Earnings
                </div>
                <div className="text-6xl md:text-7xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  R{(activeTab === 'affiliate' ? affiliateMonthlyEarnings : influencerMonthlyEarnings).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                
                <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold mb-8">
                  + R{(activeTab === 'affiliate' ? affiliateYearlyEarnings : influencerYearlyEarnings).toLocaleString(undefined, { maximumFractionDigits: 0 })} / year
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Payout Frequency</span>
                    <span className="font-bold text-slate-900">Monthly</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-600">Min. Payout Threshold</span>
                    <span className="font-bold text-slate-900">R 500</span>
                  </div>
                  <div className="flex items-center justify-between py-3 mb-8">
                    <span className="text-slate-600">Support</span>
                    <span className="font-bold text-slate-900">Dedicated Manager</span>
                  </div>
                </div>

                <Button 
                  onClick={onStart}
                  className={`w-full py-6 text-lg font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] ${
                    activeTab === 'affiliate' 
                      ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  }`}
                >
                  Start Earning Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <p className="mt-4 text-xs text-slate-400">
                  *Earnings are estimates based on active performance. Terms & conditions apply.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
