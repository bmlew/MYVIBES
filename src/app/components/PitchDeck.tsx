import { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, X, Download, Share2, Play, Pause,
  TrendingUp, Users, DollarSign, Target, Zap, CheckCircle2, 
  Star, MapPin, Calendar, BarChart3, Smartphone, Globe, Award, Heart, Clock, MessageSquare, Bell, Sparkles, Brain, Trophy, Rocket
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { SUBSCRIPTION_CONFIG } from '@/config/subscription';

interface PitchDeckProps {
  onClose: () => void;
}

export function PitchDeck({ onClose }: PitchDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: Title
    {
      type: 'title',
      content: (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-orange-500 via-purple-600 to-pink-600 text-white p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MapPin className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4">MYVIBES</h1>
          <p className="text-3xl mb-8 opacity-90">Connecting Venues with Customers in Real-Time</p>
          <p className="text-xl opacity-80 mb-12">Investor Pitch Deck - 2026</p>
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">{SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED}</div>
              <div className="text-sm opacity-80">Monthly Subscription</div>
            </div>
            <div className="w-px bg-white/30"></div>
            <div>
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-sm opacity-80">Target Users Y1</div>
            </div>
            <div className="w-px bg-white/30"></div>
            <div>
              <div className="text-4xl font-bold">SA</div>
              <div className="text-sm opacity-80">Initial Market</div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: The Problem
    {
      type: 'content',
      title: 'The Problem',
      content: (
        <div className="space-y-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-red-900 mb-4">Traditional Marketing is Broken</h3>
            <div className="space-y-4 text-lg text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-3xl">😔</span>
                <div>
                  <p className="font-semibold">Restaurants lose 30-40% of potential customers</p>
                  <p className="text-sm text-gray-600">Empty tables during slow hours despite having great specials</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">💸</span>
                <div>
                  <p className="font-semibold">R15,000+ monthly on ineffective traditional ads</p>
                  <p className="text-sm text-gray-600">Print, radio, static social media with no real-time engagement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">📱</span>
                <div>
                  <p className="font-semibold">Customers can't find real-time specials & events</p>
                  <p className="text-sm text-gray-600">Google Maps shows static info, Instagram posts get buried</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-3xl">⏰</span>
                <div>
                  <p className="font-semibold">No dynamic pricing or last-minute promotions</p>
                  <p className="text-sm text-gray-600">Can't quickly fill tables or boost slow nights</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg">
            <p className="text-xl text-gray-700 italic">"I have 15 empty tables and a 2-for-1 special tonight, but no way to reach customers right now." - Restaurant Owner</p>
          </div>
        </div>
      )
    },

    // Slide 3: The Solution
    {
      type: 'content',
      title: 'The Solution: MYVIBES Platform',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white p-6 rounded-lg mb-6">
            <h3 className="text-2xl font-bold mb-2">Real-Time Marketplace for Dining & Entertainment</h3>
            <p className="text-lg opacity-90">Connect restaurants & hotels with customers instantly through location-based, real-time specials and events</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
              <Smartphone className="w-10 h-10 text-blue-600 mb-3" />
              <h4 className="font-bold text-lg mb-2">For Customers</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Discover nearby venues in real-time</li>
                <li>✓ See today's specials & events</li>
                <li>✓ Get AI-powered recommendations</li>
                <li>✓ Instant notifications for favorites</li>
                <li>✓ Read authentic reviews</li>
                <li>✓ Works offline (PWA)</li>
              </ul>
            </div>

            <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
              <BarChart3 className="w-10 h-10 text-green-600 mb-3" />
              <h4 className="font-bold text-lg mb-2">For Businesses</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Post specials in seconds</li>
                <li>✓ Reach customers instantly</li>
                <li>✓ Track performance analytics</li>
                <li>✓ AI insights & recommendations</li>
                <li>✓ Dynamic pricing suggestions</li>
                <li>✓ Premium marketing carousel</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-5 rounded-lg">
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Key Differentiators
            </h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-3 rounded">
                <div className="font-semibold text-purple-700">Real-Time Updates</div>
                <div className="text-gray-600">Instant specials & events</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="font-semibold text-purple-700">AI/ML Powered</div>
                <div className="text-gray-600">Smart recommendations</div>
              </div>
              <div className="bg-white p-3 rounded">
                <div className="font-semibold text-purple-700">Location-Based</div>
                <div className="text-gray-600">Nearby discovery</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: Market Opportunity
    {
      type: 'content',
      title: 'Market Opportunity',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <Globe className="w-12 h-12 mb-3" />
              <div className="text-3xl font-bold mb-1">R85B</div>
              <div className="text-sm opacity-90">SA Restaurant Market (2025)</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
              <Target className="w-12 h-12 mb-3" />
              <div className="text-3xl font-bold mb-1">25,000+</div>
              <div className="text-sm opacity-90">Restaurants in SA</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
              <Users className="w-12 h-12 mb-3" />
              <div className="text-3xl font-bold mb-1">8.5M</div>
              <div className="text-sm opacity-90">Dining-Out Consumers</div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-bold text-xl mb-4">Target Market: South Africa (Initial)</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded">
                <span className="font-semibold">Primary: Johannesburg & Cape Town</span>
                <span className="text-purple-600 font-bold">12,000+ restaurants</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded">
                <span className="font-semibold">Secondary: Durban, Pretoria</span>
                <span className="text-purple-600 font-bold">8,000+ restaurants</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded">
                <span className="font-semibold">Tertiary: Other Major Cities</span>
                <span className="text-purple-600 font-bold">5,000+ restaurants</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <h5 className="font-bold mb-2">Expansion Plan</h5>
              <div className="text-sm space-y-1 text-gray-700">
                <div>🇿🇦 Year 1: South Africa</div>
                <div>🌍 Year 2: Nigeria, Kenya</div>
                <div>🌍 Year 3: Pan-African</div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h5 className="font-bold mb-2">Revenue Potential</h5>
              <div className="text-sm space-y-1 text-gray-700">
                <div>💰 1,000 subs = R3.6M/year</div>
                <div>💰 5,000 subs = R18M/year</div>
                <div>💰 10,000 subs = R36M/year</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: Business Model
    {
      type: 'content',
      title: 'Revenue Model',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Freemium SaaS Model</h3>
            <p className="text-lg opacity-90">Recurring revenue from business subscriptions + premium features</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold">Complete Subscription</h4>
                <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-2 rounded-full">
                  <span className="text-2xl font-bold">{SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED}</span>/mo
                </div>
              </div>
              <p className="text-sm text-purple-600 font-semibold mb-4">Includes ML Insights - Everything You Need!</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Unlimited menu uploads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Daily specials & events posting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Customer reviews management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Advanced analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Premium search placement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>WhatsApp integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Notification system</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Event management & reminders</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold">ML Insights Included ✨</h4>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-lg font-bold">No Extra Cost</span>
                </div>
              </div>
              <p className="text-sm mb-4 opacity-90">AI-Powered Features at No Additional Charge:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>AI-powered pricing recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Optimal posting time suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Predictive demand analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Competitor benchmarking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>External data integration (sports, weather)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>One-click price implementation</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-500">
            <h5 className="font-bold text-lg mb-3">What's Included in {SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED}/month</h5>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="font-semibold text-purple-800">Premium Carousel</div>
                <div className="text-gray-600">Featured placement included</div>
              </div>
              <div>
                <div className="font-semibold text-purple-800">ML Insights</div>
                <div className="text-gray-600">AI-powered analytics included</div>
              </div>
              <div>
                <div className="font-semibold text-purple-800">All Features</div>
                <div className="text-gray-600">No hidden fees or upsells</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-500">
            <h5 className="font-bold text-lg mb-3">Future Revenue Opportunities</h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-semibold text-yellow-800">Enterprise Plans</div>
                <div className="text-gray-600">Multi-location chains: Custom pricing</div>
              </div>
              <div>
                <div className="font-semibold text-yellow-800">Commission Model</div>
                <div className="text-gray-600">Future: 5% on bookings/reservations</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6: Technology Stack
    {
      type: 'content',
      title: 'Technology & Features',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <div className="font-bold">PWA App</div>
              <div className="text-sm text-gray-600">Offline-first, installable</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <Brain className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <div className="font-bold">AI/ML Engine</div>
              <div className="text-sm text-gray-600">Smart recommendations</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Zap className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <div className="font-bold">Real-Time</div>
              <div className="text-sm text-gray-600">Instant updates</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border-2 border-purple-200 rounded-lg p-5">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Core Features Built
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Business registration & auth</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Customer profiles & favorites</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Real-time specials & events</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Notification system with sound</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Rating & review system</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>AI recommendations engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>ML Insights & price optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Event reminders with interest tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Analytics dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>WhatsApp integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Offline mode (PWA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Premium carousel marketing</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-purple-50 p-5 rounded-lg">
              <h4 className="font-bold text-lg mb-3">Advanced ML Capabilities</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-purple-700 mb-1">Phase 1 (Active)</div>
                  <div className="text-gray-700">Sports events, weather, historical patterns</div>
                  <div className="text-green-600 font-semibold">+25% accuracy</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-700 mb-1">Phase 2 (Ready)</div>
                  <div className="text-gray-700">Yelp + Google Maps integration</div>
                  <div className="text-green-600 font-semibold">+50% accuracy</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-700 mb-1">Phase 3 (Ready)</div>
                  <div className="text-gray-700">OpenAI + premium APIs</div>
                  <div className="text-green-600 font-semibold">+75% accuracy</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-700 mb-1">Smart Pricing</div>
                  <div className="text-gray-700">One-click AI price implementation</div>
                  <div className="text-green-600 font-semibold">Live tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: Competitive Advantage
    {
      type: 'content',
      title: 'Competitive Advantage',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Why MYVIBES Wins</h3>
            <p className="text-lg opacity-90">Purpose-built for real-time discovery with AI-powered insights</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left font-semibold">Feature</th>
                  <th className="p-4 text-center font-semibold bg-gradient-to-r from-orange-500 to-purple-600 text-white">MYVIBES</th>
                  <th className="p-4 text-center font-semibold">Google Maps</th>
                  <th className="p-4 text-center font-semibold">Instagram</th>
                  <th className="p-4 text-center font-semibold">OpenTable</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-4">Real-time specials</td>
                  <td className="p-4 text-center bg-green-50">✅ Yes</td>
                  <td className="p-4 text-center">❌ No</td>
                  <td className="p-4 text-center text-yellow-600">⚠️ Manual</td>
                  <td className="p-4 text-center">❌ No</td>
                </tr>
                <tr>
                  <td className="p-4">Location-based discovery</td>
                  <td className="p-4 text-center bg-green-50">✅ Yes</td>
                  <td className="p-4 text-center">✅ Yes</td>
                  <td className="p-4 text-center">❌ No</td>
                  <td className="p-4 text-center">✅ Yes</td>
                </tr>
                <tr>
                  <td className="p-4">AI recommendations</td>
                  <td className="p-4 text-center bg-green-50">✅ Advanced ML</td>
                  <td className="p-4 text-center text-yellow-600">⚠️ Basic</td>
                  <td className="p-4 text-center">❌ No</td>
                  <td className="p-4 text-center">❌ No</td>
                </tr>
                <tr>
                  <td className="p-4">Instant notifications</td>
                  <td className="p-4 text-center bg-green-50">✅ Yes</td>
                  <td className="p-4 text-center">❌ No</td>
                  <td className="p-4 text-center">✅ Yes</td>
                  <td className="p-4 text-center">❌ No</td>
                </tr>
                <tr>
                  <td className="p-4">Business analytics</td>
                  <td className="p-4 text-center bg-green-50">✅ Full Suite</td>
                  <td className="p-4 text-center text-yellow-600">⚠️ Limited</td>
                  <td className="p-4 text-center text-yellow-600">⚠️ Basic</td>
                  <td className="p-4 text-center">✅ Yes</td>
                </tr>
                <tr>
                  <td className="p-4">Dynamic pricing AI</td>
                  <td className="p-4 text-center bg-green-50">✅ Yes</td>
                  <td className="p-4 text-center">❌ No</td>
                  <td className="p-4 text-center">❌ No</td>
                  <td className="p-4 text-center">❌ No</td>
                </tr>
                <tr>
                  <td className="p-4">Event management</td>
                  <td className="p-4 text-center bg-green-50">✅ Full</td>
                  <td className="p-4 text-center text-yellow-600">⚠️ Basic</td>
                  <td className="p-4 text-center text-yellow-600">⚠️ Manual</td>
                  <td className="p-4 text-center">❌ No</td>
                </tr>
                <tr>
                  <td className="p-4">Cost for business</td>
                  <td className="p-4 text-center bg-green-50">{SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED}/mo</td>
                  <td className="p-4 text-center">Free (limited)</td>
                  <td className="p-4 text-center">Free (ads extra)</td>
                  <td className="p-4 text-center">$$$</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <Trophy className="w-8 h-8 text-blue-600 mb-2" />
              <div className="font-bold mb-1">First-Mover</div>
              <div className="text-sm text-gray-700">Only real-time platform in SA</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <Brain className="w-8 h-8 text-purple-600 mb-2" />
              <div className="font-bold mb-1">AI Moat</div>
              <div className="text-sm text-gray-700">Proprietary ML models</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <Zap className="w-8 h-8 text-green-600 mb-2" />
              <div className="font-bold mb-1">Network Effect</div>
              <div className="text-sm text-gray-700">More venues = More users</div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 8: Financial Projections
    {
      type: 'content',
      title: 'Financial Projections (3 Years)',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg">
              <div className="text-sm opacity-90 mb-1">Year 1 Revenue</div>
              <div className="text-4xl font-bold">R3.6M</div>
              <div className="text-sm opacity-90 mt-2">1,000 subscribers</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg">
              <div className="text-sm opacity-90 mb-1">Year 2 Revenue</div>
              <div className="text-4xl font-bold">R18M</div>
              <div className="text-sm opacity-90 mt-2">5,000 subscribers</div>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-lg">
              <div className="text-sm opacity-90 mb-1">Year 3 Revenue</div>
              <div className="text-4xl font-bold">R36M</div>
              <div className="text-sm opacity-90 mt-2">10,000 subscribers</div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h4 className="font-bold text-xl mb-4">Year 1 Revenue Breakdown (All-Inclusive Model)</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-purple-50 rounded">
                <div>
                  <div className="font-semibold">Complete Subscriptions (1,000 × {SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED})</div>
                  <div className="text-sm text-gray-600">Includes: ML Insights, Premium Carousel, All Features</div>
                </div>
                <span className="text-green-600 font-bold text-lg">R5,988,000</span>
              </div>
              <div className="border-t-2 border-purple-300 pt-3 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded">
                <div>
                  <div className="font-bold text-xl">Total Year 1 Revenue</div>
                  <div className="text-sm text-gray-600">Simple, transparent pricing</div>
                </div>
                <span className="text-2xl font-bold text-green-600">R5,988,000</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-700"><strong>Note:</strong> With our all-inclusive R499/month model, we've simplified revenue projections. No complex upsells or add-ons - just one straightforward subscription that includes everything businesses need.</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-bold text-xl mb-4">Operating Costs (Monthly)</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Hosting & Infrastructure</span>
                <span className="font-semibold">R2,500</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Development Team</span>
                <span className="font-semibold">R15,000</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Marketing & Sales</span>
                <span className="font-semibold">R10,000</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Customer Support</span>
                <span className="font-semibold">R5,000</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>External APIs & Services</span>
                <span className="font-semibold">R3,000</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Admin & Operations</span>
                <span className="font-semibold">R2,500</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between items-center">
              <span className="font-bold">Monthly Operating Cost</span>
              <span className="font-bold text-xl text-red-600">R38,000</span>
            </div>
            <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
              <span>Annual Operating Cost</span>
              <span className="font-semibold">R456,000</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-lg">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-sm opacity-90 mb-1">Year 1 Net Profit</div>
                <div className="text-4xl font-bold">R3.9M</div>
                <div className="text-sm opacity-90 mt-1">89% margin</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Break-Even Point</div>
                <div className="text-4xl font-bold">128</div>
                <div className="text-sm opacity-90 mt-1">subscribers (Month 3)</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 9: Go-to-Market Strategy
    {
      type: 'content',
      title: 'Go-to-Market Strategy',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">3-Phase Launch Plan</h3>
            <p className="text-lg opacity-90">Focused expansion with proven traction before scaling</p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                <h4 className="text-xl font-bold">Phase 1: Pilot (Months 1-3)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-2">Target</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• 50 restaurants in Sandton</li>
                    <li>• 2,000 active users</li>
                    <li>• Prove product-market fit</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-2">Tactics</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Direct sales to restaurants</li>
                    <li>• Influencer partnerships</li>
                    <li>• Local Facebook ads</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                <h4 className="text-xl font-bold">Phase 2: City Expansion (Months 4-9)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-2">Target</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• 500 venues (JHB + CPT)</li>
                    <li>• 25,000 active users</li>
                    <li>• R149K MRR</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-2">Tactics</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Sales team (3 people)</li>
                    <li>• Radio & podcast ads</li>
                    <li>• Restaurant associations</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                <h4 className="text-xl font-bold">Phase 3: National Scale (Months 10-12)</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-2">Target</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• 1,000+ venues nationwide</li>
                    <li>• 100,000 active users</li>
                    <li>• R299K MRR</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-2">Tactics</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• National PR campaign</li>
                    <li>• Partnership with delivery apps</li>
                    <li>• TV advertising</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-bold text-lg mb-3">Customer Acquisition Strategy</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-yellow-800 mb-2">For Businesses (B2B)</div>
                <ul className="space-y-1 text-gray-700">
                  <li>✓ Free 30-day trial</li>
                  <li>✓ Direct sales team</li>
                  <li>✓ Restaurant industry events</li>
                  <li>✓ Referral program (R500 credit)</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-yellow-800 mb-2">For Consumers (B2C)</div>
                <ul className="space-y-1 text-gray-700">
                  <li>✓ Organic (venue listings)</li>
                  <li>✓ Social media marketing</li>
                  <li>✓ App Store optimization</li>
                  <li>✓ Viral sharing features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 10: Investment
    {
      type: 'content',
      title: 'Investment Options & ROI',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg text-center">
             <h3 className="text-2xl font-bold">Two Distinct Paths to Market Dominance</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Option A: R1.5M */}
            <div className="border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded">OPTION A</span>
                  <span className="text-gray-500 text-xs">Lean Growth</span>
                </div>
                <h4 className="text-3xl font-bold text-blue-700">R1.5M</h4>
                <p className="text-sm text-gray-600">13% Equity @ R10M Val</p>
              </div>
              <div className="p-4 space-y-4">
                 <div>
                   <h5 className="font-bold text-sm text-gray-700 mb-2">Use of Funds</h5>
                   <div className="h-2 flex rounded-full overflow-hidden mb-1">
                     <div className="w-1/2 bg-blue-500"></div>
                     <div className="w-1/3 bg-green-500"></div>
                     <div className="w-1/6 bg-gray-400"></div>
                   </div>
                   <div className="flex text-[10px] justify-between text-gray-500">
                     <span>Prod (50%)</span>
                     <span>Sales (30%)</span>
                     <span>Ops (20%)</span>
                   </div>
                 </div>

                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                     <span className="text-gray-600">Focus</span>
                     <span className="font-semibold">Gauteng Only</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                     <span className="text-gray-600">12-Mo Target</span>
                     <span className="font-semibold">500 Venues</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                     <span className="text-gray-600">Proj. Revenue</span>
                     <span className="font-semibold">R3M Annual</span>
                   </div>
                 </div>

                 <div className="bg-blue-50 p-3 rounded text-center">
                   <div className="text-xs text-blue-600 font-bold uppercase mb-1">3-Year ROI Potential</div>
                   <div className="text-2xl font-bold text-blue-800">5x - 7x</div>
                   <div className="text-[10px] text-blue-600">~R15M Valuation Exit</div>
                 </div>
              </div>
            </div>

            {/* Option B: R2.5M */}
            <div className="border-2 border-purple-200 rounded-xl overflow-hidden shadow-md transform scale-105">
              <div className="bg-purple-50 p-4 border-b border-purple-100 relative">
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl">RECOMMENDED</div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded">OPTION B</span>
                  <span className="text-gray-500 text-xs">Accelerated Scale</span>
                </div>
                <h4 className="text-3xl font-bold text-purple-700">R2.5M</h4>
                <p className="text-sm text-gray-600">20% Equity @ R10M Val</p>
              </div>
              <div className="p-4 space-y-4">
                 <div>
                   <h5 className="font-bold text-sm text-gray-700 mb-2">Use of Funds</h5>
                   <div className="h-2 flex rounded-full overflow-hidden mb-1">
                     <div className="w-1/3 bg-blue-500"></div>
                     <div className="w-1/2 bg-green-500"></div>
                     <div className="w-1/6 bg-gray-400"></div>
                   </div>
                   <div className="flex text-[10px] justify-between text-gray-500">
                     <span>Prod (30%)</span>
                     <span>Sales (50%)</span>
                     <span>Ops (20%)</span>
                   </div>
                 </div>

                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                     <span className="text-gray-600">Focus</span>
                     <span className="font-semibold">National (JHB/CPT/DBN)</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                     <span className="text-gray-600">12-Mo Target</span>
                     <span className="font-semibold">1,000+ Venues</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                     <span className="text-gray-600">Proj. Revenue</span>
                     <span className="font-semibold">R6M+ Annual</span>
                   </div>
                 </div>

                 <div className="bg-purple-50 p-3 rounded text-center">
                   <div className="text-xs text-purple-600 font-bold uppercase mb-1">3-Year ROI Potential</div>
                   <div className="text-2xl font-bold text-purple-800">10x - 15x</div>
                   <div className="text-[10px] text-purple-600">~R50M Valuation Exit</div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-center text-sm text-gray-600">
             <span className="font-semibold text-gray-900">Why R2.5M?</span> The additional R1M unlocks the <strong>Cape Town & Durban</strong> markets immediately, doubling the addressable market and securing a nationwide network effect moat.
          </div>
        </div>
      )
    },

    // Slide 11: Contact/Thank You
    {
      type: 'title',
      content: (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MapPin className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4">Thank You</h1>
          <p className="text-2xl mb-12 opacity-90">Let's revolutionize dining discovery together</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl">
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            <div className="space-y-4 text-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  📧
                </div>
                <div>
                  <div className="text-sm opacity-80">Email</div>
                  <div className="font-semibold">bernadette@get-digital.co.za</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  📱
                </div>
                <div>
                  <div className="text-sm opacity-80">Phone</div>
                  <div className="font-semibold">+27 76 205 5155</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  🌐
                </div>
                <div>
                  <div className="text-sm opacity-80">Website</div>
                  <div className="font-semibold">www.myvibes.co.za</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl font-semibold mb-2">Ready to Schedule a Demo?</p>
            <p className="opacity-80">Let us show you the platform in action</p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handlePowerPointDownload = async () => {
    try {
      const pptxgen = (await import("pptxgenjs")).default;
      const pres = new pptxgen();

      // Theme Colors
      const ORANGE = "F97316";
      const PURPLE = "9333EA";
      const BLUE = "3B82F6";
      const GREEN = "22C55E";
      const WHITE = "FFFFFF";
      const DARK_GRAY = "1F2937";
      const PINK = "EC4899";

      // Common Layouts
      pres.layout = "LAYOUT_16x9";

      // 1. Title Slide
      let slide = pres.addSlide();
      slide.background = { color: DARK_GRAY };
      slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: ORANGE, transparency: 15 } }); 
      
      slide.addText("MYVIBES", {
        x: 1, y: 2, w: "80%", h: 1.5,
        fontSize: 60, color: WHITE, bold: true, align: "center"
      });
      slide.addText("Connecting Venues with Customers in Real-Time", {
        x: 1, y: 3.5, w: "80%", h: 1,
        fontSize: 24, color: WHITE, align: "center"
      });
      slide.addText("Investor Pitch Deck - 2026", {
        x: 1, y: 4.5, w: "80%", h: 0.5,
        fontSize: 18, color: WHITE, align: "center"
      });
      
      slide.addText(SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED + "\nMonthly Subscription", {
        x: 1, y: 6, w: 3, h: 1,
        fontSize: 20, color: WHITE, align: "center", bold: true
      });
      slide.addText("10K+\nTarget Users Y1", {
        x: 4.5, y: 6, w: 3, h: 1,
        fontSize: 20, color: WHITE, align: "center", bold: true
      });
      slide.addText("SA\nInitial Market", {
        x: 8, y: 6, w: 3, h: 1,
        fontSize: 20, color: WHITE, align: "center", bold: true
      });

      // 2. The Problem
      slide = pres.addSlide();
      slide.background = { color: WHITE };
      slide.addText("The Problem", { x: 0.5, y: 0.5, fontSize: 32, color: ORANGE, bold: true });
      
      const problems = [
        { title: "Traditional Marketing is Broken", desc: "Restaurants lose 30-40% of potential customers" },
        { title: "Ineffective Ads", desc: "R15,000+ monthly on static media" },
        { title: "Discovery Friction", desc: "Customers can't find real-time specials" },
        { title: "No Dynamic Pricing", desc: "Can't quickly boost slow nights" }
      ];
      
      problems.forEach((p, i) => {
        let yPos = 1.5 + (i * 1.2);
        slide.addShape(pres.ShapeType.rect, { x: 0.5, y: yPos, w: 9, h: 1, fill: { color: "FFF1F2" }, line: { color: "E11D48", width: 3 } }); 
        slide.addText(p.title, { x: 0.7, y: yPos + 0.1, fontSize: 18, bold: true, color: "881337" });
        slide.addText(p.desc, { x: 0.7, y: yPos + 0.5, fontSize: 14, color: DARK_GRAY });
      });

      // 3. The Solution
      slide = pres.addSlide();
      slide.addText("The Solution: MYVIBES Platform", { x: 0.5, y: 0.5, fontSize: 32, color: PURPLE, bold: true });
      slide.addText("Real-Time Marketplace for Dining & Entertainment", { x: 0.5, y: 1.2, fontSize: 18, color: DARK_GRAY });
      
      slide.addShape(pres.ShapeType.rect, { x: 0.5, y: 2, w: 4.5, h: 4, fill: { color: "EFF6FF" }, line: { color: BLUE, width: 2 } });
      slide.addText("For Customers", { x: 0.7, y: 2.2, fontSize: 20, bold: true, color: BLUE });
      slide.addText(
        "✓ Discover nearby venues\n✓ Real-time specials\n✓ AI recommendations\n✓ Notifications\n✓ Works offline (PWA)",
        { x: 0.7, y: 2.8, w: 4, h: 3, fontSize: 14, color: DARK_GRAY, bullet: true }
      );
      
      slide.addShape(pres.ShapeType.rect, { x: 5.5, y: 2, w: 4.5, h: 4, fill: { color: "F0FDF4" }, line: { color: GREEN, width: 2 } });
      slide.addText("For Businesses", { x: 5.7, y: 2.2, fontSize: 20, bold: true, color: GREEN });
      slide.addText(
        "✓ Post specials instantly\n✓ Reach customers\n✓ Analytics dashboard\n✓ AI insights\n✓ Dynamic pricing",
        { x: 5.7, y: 2.8, w: 4, h: 3, fontSize: 14, color: DARK_GRAY, bullet: true }
      );

      // 4. Market Opportunity
      slide = pres.addSlide();
      slide.addText("Market Opportunity", { x: 0.5, y: 0.5, fontSize: 32, color: ORANGE, bold: true });
      
      slide.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 3, h: 2, fill: { color: BLUE } });
      slide.addText("R85B", { x: 0.5, y: 1.8, w: 3, fontSize: 40, color: WHITE, align: "center", bold: true });
      slide.addText("SA Restaurant Market", { x: 0.5, y: 2.8, w: 3, fontSize: 14, color: WHITE, align: "center" });

      slide.addShape(pres.ShapeType.rect, { x: 4, y: 1.5, w: 3, h: 2, fill: { color: GREEN } });
      slide.addText("25,000+", { x: 4, y: 1.8, w: 3, fontSize: 40, color: WHITE, align: "center", bold: true });
      slide.addText("Restaurants in SA", { x: 4, y: 2.8, w: 3, fontSize: 14, color: WHITE, align: "center" });
      
      slide.addShape(pres.ShapeType.rect, { x: 7.5, y: 1.5, w: 3, h: 2, fill: { color: PURPLE } });
      slide.addText("8.5M", { x: 7.5, y: 1.8, w: 3, fontSize: 40, color: WHITE, align: "center", bold: true });
      slide.addText("Dining-Out Consumers", { x: 7.5, y: 2.8, w: 3, fontSize: 14, color: WHITE, align: "center" });
      
      slide.addText("Expansion Plan:", { x: 0.5, y: 4, fontSize: 18, bold: true });
      slide.addText("Year 1: South Africa\nYear 2: Nigeria, Kenya\nYear 3: Pan-African", { x: 0.5, y: 4.5, fontSize: 14, bullet: true });

      // 5. Revenue Model
      slide = pres.addSlide();
      slide.addText("Revenue Model", { x: 0.5, y: 0.5, fontSize: 32, color: GREEN, bold: true });
      
      slide.addShape(pres.ShapeType.rect, { x: 1, y: 1.5, w: 8, h: 1.5, fill: { color: "FFFFFF" }, line: { color: ORANGE, width: 2 } });
      slide.addText("Complete Subscription", { x: 1.5, y: 1.8, fontSize: 24, bold: true });
      slide.addText(SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED + "/month", { x: 6, y: 1.8, fontSize: 24, bold: true, color: PURPLE });
      
      slide.addText("Includes ML Insights - Everything You Need!", { x: 1.5, y: 2.5, fontSize: 14, color: PURPLE, italic: true });
      
      slide.addText(
        "✓ Unlimited menu uploads\n✓ Daily specials posting\n✓ Analytics dashboard\n✓ WhatsApp integration\n✓ AI Pricing Recommendations\n✓ Predictive Demand Analytics",
        { x: 1, y: 3.5, w: 8, h: 3, fontSize: 16, bullet: true }
      );

      // 6. Technology
      slide = pres.addSlide();
      slide.addText("Technology & Features", { x: 0.5, y: 0.5, fontSize: 32, color: BLUE, bold: true });
      
      slide.addText("Tech Stack", { x: 0.5, y: 1.5, fontSize: 20, bold: true });
      slide.addText("PWA App (Offline-first) • AI/ML Engine • Real-Time Database", { x: 0.5, y: 2, fontSize: 16 });
      
      slide.addText("Advanced ML Capabilities", { x: 0.5, y: 3, fontSize: 20, bold: true });
      slide.addText("Phase 1: Sports, Weather, History (+25% accuracy)\nPhase 2: Yelp/Google Integration (+50% accuracy)\nPhase 3: OpenAI + Premium APIs", { x: 0.5, y: 3.5, w: 9, h: 2, fontSize: 16, bullet: true });

      // 7. Competitive Advantage
      slide = pres.addSlide();
      slide.addText("Competitive Advantage", { x: 0.5, y: 0.5, fontSize: 32, color: PINK, bold: true });
      
      const headers = ["Feature", "MYVIBES", "Google Maps", "Instagram"];
      const rows = [
        ["Real-time specials", "✅ Yes", "❌ No", "⚠️ Manual"],
        ["AI Recommendations", "✅ Advanced", "⚠️ Basic", "❌ No"],
        ["Business Analytics", "✅ Full Suite", "⚠️ Limited", "⚠️ Basic"],
        ["Dynamic Pricing", "✅ Yes", "❌ No", "❌ No"],
        ["Cost", SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED + "/mo", "Free", "Free (Ads)"]
      ];
      
      slide.addTable([headers, ...rows], {
        x: 0.5, y: 1.5, w: 9,
        colW: [2.5, 2.5, 2, 2],
        fill: { color: "FFFFFF" },
        border: { pt: 1, color: "CCCCCC" },
        align: "center",
        valign: "middle",
        autoPage: false,
        fontFace: "Arial"
      });

      // 8. Financials
      slide = pres.addSlide();
      slide.addText("Financial Projections", { x: 0.5, y: 0.5, fontSize: 32, color: GREEN, bold: true });
      
      slide.addText("Year 1: R5.9M Revenue (1,000 subs)", { x: 0.5, y: 2, fontSize: 24, color: GREEN });
      slide.addText("Year 2: R29.9M Revenue (5,000 subs)", { x: 0.5, y: 3, fontSize: 24, color: BLUE });
      slide.addText("Year 3: R59.9M Revenue (10,000 subs)", { x: 0.5, y: 4, fontSize: 24, color: PURPLE });
      
      slide.addText("Year 1 Net Profit: R5.5M (92% margin)", { x: 0.5, y: 5.5, fontSize: 20, bold: true });

      // 9. Go-To-Market
      slide = pres.addSlide();
      slide.addText("Go-To-Market Strategy", { x: 0.5, y: 0.5, fontSize: 32, color: ORANGE, bold: true });
      
      slide.addText("Phase 1: Pilot (Months 1-3)", { x: 0.5, y: 1.5, fontSize: 20, bold: true, color: BLUE });
      slide.addText("50 restaurants, Sandton. Direct sales.", { x: 1, y: 2, fontSize: 16 });
      
      slide.addText("Phase 2: City Expansion (Months 4-9)", { x: 0.5, y: 3, fontSize: 20, bold: true, color: PURPLE });
      slide.addText("500 venues (JHB+CPT). Sales team, Radio ads.", { x: 1, y: 3.5, fontSize: 16 });
      
      slide.addText("Phase 3: National Scale", { x: 0.5, y: 4.5, fontSize: 20, bold: true, color: GREEN });
      slide.addText("1,000+ venues. National PR, TV.", { x: 1, y: 5, fontSize: 16 });

      // 10. Investment
      slide = pres.addSlide();
      slide.addText("Investment Options & ROI", { x: 0.5, y: 0.5, fontSize: 32, color: PURPLE, bold: true });
      
      // Option A: R1.5M
      slide.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.5, w: 4.25, h: 4, fill: { color: "EFF6FF" }, line: { color: BLUE, width: 2 } });
      slide.addText("OPTION A: R1.5M", { x: 0.7, y: 1.8, fontSize: 18, bold: true, color: BLUE });
      slide.addText("Lean Growth • 13% Equity", { x: 0.7, y: 2.2, fontSize: 14, color: DARK_GRAY });
      slide.addText("• Focus: Gauteng Only\n• 12-Mo Target: 500 Venues\n• Revenue: R3M Annual", { x: 0.7, y: 2.8, w: 3.8, h: 1.5, fontSize: 14, color: DARK_GRAY, bullet: true });
      slide.addText("ROI: 5x - 7x (3 Years)", { x: 0.7, y: 4.8, fontSize: 18, bold: true, color: BLUE });

      // Option B: R2.5M
      slide.addShape(pres.ShapeType.rect, { x: 5.25, y: 1.5, w: 4.25, h: 4, fill: { color: "FAF5FF" }, line: { color: PURPLE, width: 3 } });
      slide.addText("OPTION B: R2.5M (Recommended)", { x: 5.45, y: 1.8, fontSize: 18, bold: true, color: PURPLE });
      slide.addText("Accelerated Scale • 20% Equity", { x: 5.45, y: 2.2, fontSize: 14, color: DARK_GRAY });
      slide.addText("• Focus: National (JHB+CPT)\n• 12-Mo Target: 1,000+ Venues\n• Revenue: R6M Annual", { x: 5.45, y: 2.8, w: 3.8, h: 1.5, fontSize: 14, color: DARK_GRAY, bullet: true });
      slide.addText("ROI: 10x - 15x (3 Years)", { x: 5.45, y: 4.8, fontSize: 18, bold: true, color: PURPLE });


      // 11. Contact
      slide = pres.addSlide();
      slide.background = { color: DARK_GRAY };
      slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: PURPLE, transparency: 20 } });
      
      slide.addText("Thank You", { x: 0.5, y: 2, w: 9, fontSize: 50, color: WHITE, align: "center", bold: true });
      slide.addText("bernadette@get-digital.co.za", { x: 0.5, y: 3.5, w: 9, fontSize: 24, color: WHITE, align: "center" });
      slide.addText("+27 76 205 5155", { x: 0.5, y: 4.2, w: 9, fontSize: 24, color: WHITE, align: "center" });
      slide.addText("www.myvibes.co.za", { x: 0.5, y: 4.9, w: 9, fontSize: 24, color: WHITE, align: "center" });


      // Save
      await pres.writeFile({ fileName: "MYVIBES_Investor_Deck.pptx" });
      
    } catch (error) {
      console.error("PPTX Generation Error:", error);
      alert("Failed to generate PowerPoint. Please try again.");
    }
  };

  const handleMarkdownDownload = () => {
    const markdownContent = `# MYVIBES - Investor Pitch Deck
## Connecting Venues with Customers in Real-Time

---

## SLIDE 1: TITLE SLIDE

# MYVIBES

**Connecting Venues with Customers in Real-Time**

*Investor Pitch Deck - 2026*

### Key Metrics:
- **R499** Monthly Subscription
- **10,000+** Target Users Year 1
- **South Africa** Initial Market

---

## SLIDE 2: THE PROBLEM

### Traditional Marketing is Broken

😔 **Restaurants lose 30-40% of potential customers**
- Empty tables during slow hours despite having great specials

💸 **R15,000+ monthly on ineffective traditional ads**
- Print, radio, static social media with no real-time engagement

📱 **Customers can't find real-time specials & events**
- Google Maps shows static info, Instagram posts get buried

⏰ **No dynamic pricing or last-minute promotions**
- Can't quickly fill tables or boost slow nights

> *"I have 15 empty tables and a 2-for-1 special tonight, but no way to reach customers right now."*
> — Restaurant Owner

---

## SLIDE 3: THE SOLUTION

### MYVIBES Platform: Real-Time Marketplace for Dining & Entertainment

Connect restaurants & hotels with customers instantly through location-based, real-time specials and events

#### For Customers:
✓ Discover nearby venues in real-time
✓ See today's specials & events
✓ Get AI-powered recommendations
✓ Instant notifications for favorites
✓ Read authentic reviews
✓ Works offline (PWA)

#### For Businesses:
✓ Post specials in seconds
✓ Reach customers instantly
✓ Track performance analytics
✓ AI insights & recommendations
✓ Dynamic pricing suggestions
✓ Premium marketing carousel

### Key Differentiators:
- **Real-Time Updates** - Instant specials & events
- **AI/ML Powered** - Smart recommendations
- **Location-Based** - Nearby discovery

---

## SLIDE 4: MARKET OPPORTUNITY

### South African Market (Initial Focus)

| Metric | Value |
|--------|-------|
| **SA Restaurant Market (2025)** | R85 Billion |
| **Restaurants in SA** | 25,000+ |
| **Dining-Out Consumers** | 8.5 Million |

### Target Market Breakdown:

**Primary Markets:**
- Johannesburg & Cape Town: **12,000+ restaurants**

**Secondary Markets:**
- Durban, Pretoria: **8,000+ restaurants**

**Tertiary Markets:**
- Other Major Cities: **5,000+ restaurants**

### Expansion Plan:
- 🇿🇦 **Year 1:** South Africa
- 🌍 **Year 2:** Nigeria, Kenya
- 🌍 **Year 3:** Pan-African

### Revenue Potential:
- 💰 **1,000 subscribers** = R5.9M/year
- 💰 **5,000 subscribers** = R29.9M/year
- 💰 **10,000 subscribers** = R59.9M/year

---

## SLIDE 5: REVENUE MODEL

### Freemium SaaS Model
Recurring revenue from business subscriptions + premium features

### Complete Subscription - R499/month

**Includes ML Insights - Everything You Need!**

✅ Unlimited menu uploads
✅ Daily specials & events posting
✅ Customer reviews management
✅ Advanced analytics dashboard
✅ Premium search placement
✅ WhatsApp integration
✅ Notification system
✅ Event management & reminders

### ML Insights Included ✨
**No Extra Cost - AI-Powered Features:**

✅ AI-powered pricing recommendations
✅ Optimal posting time suggestions
✅ Predictive demand analytics
✅ Competitor benchmarking
✅ External data integration (sports, weather)
✅ One-click price implementation

### What's Included in R499/month:
- **Premium Carousel** - Featured placement included
- **ML Insights** - AI-powered analytics included
- **All Features** - No hidden fees or upsells

### Future Revenue Opportunities:
- **Enterprise Plans** - Multi-location chains: Custom pricing
- **Commission Model** - Future: 5% on bookings/reservations

---

## SLIDE 6: TECHNOLOGY & FEATURES

### Technology Stack:
- **PWA App** - Offline-first, installable
- **AI/ML Engine** - Smart recommendations
- **Real-Time** - Instant updates

### Core Features Built:

✅ Business registration & auth
✅ Customer profiles & favorites
✅ Real-time specials & events
✅ Notification system with sound
✅ Rating & review system
✅ AI recommendations engine
✅ ML Insights & price optimization
✅ Event reminders with interest tracking
✅ Analytics dashboard
✅ WhatsApp integration
✅ Offline mode (PWA)
✅ Premium carousel marketing

### Advanced ML Capabilities:

**Phase 1 (Active):**
- Sports events, weather, historical patterns
- +25% accuracy

**Phase 2 (Ready):**
- Yelp + Google Maps integration
- +50% accuracy

**Phase 3 (Ready):**
- OpenAI + premium APIs
- +75% accuracy

**Smart Pricing:**
- One-click AI price implementation
- Live tracking

---

## SLIDE 7: COMPETITIVE ADVANTAGE

### Why MYVIBES Wins
Purpose-built for real-time discovery with AI-powered insights

| Feature | MYVIBES | Google Maps | Instagram | OpenTable |
|---------|----------|-------------|-----------|-----------|
| **Real-time specials** | ✅ Yes | ❌ No | ⚠️ Manual | ❌ No |
| **Location-based discovery** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **AI recommendations** | ✅ Advanced ML | ⚠️ Basic | ❌ No | ❌ No |
| **Instant notifications** | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Business analytics** | ✅ Full Suite | ⚠️ Limited | ⚠️ Basic | ✅ Yes |
| **Dynamic pricing AI** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Event management** | ✅ Full | ⚠️ Basic | ⚠️ Manual | ❌ No |
| **Cost for business** | **R499/mo** | Free (limited) | Free (ads extra) | $$$ |

### Our Competitive Moat:

🏆 **First-Mover Advantage**
- Only real-time platform in SA

🧠 **AI Moat**
- Proprietary ML models

⚡ **Network Effect**
- More venues = More users

---

## SLIDE 8: FINANCIAL PROJECTIONS

### 3-Year Revenue Forecast:

| Year | Revenue | Subscribers |
|------|---------|-------------|
| **Year 1** | R5.9M | 1,000 |
| **Year 2** | R29.9M | 5,000 |
| **Year 3** | R59.9M | 10,000 |

### Year 1 Revenue Breakdown (All-Inclusive Model):

**Complete Subscriptions (1,000 × R499)**
- Includes: ML Insights, Premium Carousel, All Features
- **R5,988,000**

**Total Year 1 Revenue: R5,988,000**

*Note: With our all-inclusive R499/month model, we've simplified revenue projections. No complex upsells or add-ons - just one straightforward subscription that includes everything businesses need.*

### Operating Costs (Monthly):

| Expense | Amount |
|---------|--------|
| Hosting & Infrastructure | R2,500 |
| Development Team | R15,000 |
| Marketing & Sales | R10,000 |
| Customer Support | R5,000 |
| External APIs & Services | R3,000 |
| Admin & Operations | R2,500 |
| **Total Monthly** | **R38,000** |
| **Annual Operating Cost** | **R456,000** |

### Year 1 Financials:
- **Year 1 Revenue:** R5,988,000
- **Operating Costs:** R456,000
- **Net Profit:** R5,532,000
- **Profit Margin:** 92%
- **Break-Even Point:** 77 subscribers (Month 2-3)

---

## SLIDE 9: GO-TO-MARKET STRATEGY

### 3-Phase Launch Plan

### Phase 1: Pilot (Months 1-3)

**Target:**
- 50 restaurants in Sandton
- 2,000 active users
- Prove product-market fit

**Tactics:**
- Direct sales to restaurants
- Influencer partnerships
- Local Facebook ads

---

### Phase 2: City Expansion (Months 4-9)

**Target:**
- 500 venues (JHB + CPT)
- 25,000 active users
- R249K MRR

**Tactics:**
- Sales team (3 people)
- Radio & podcast ads
- Restaurant associations

---

### Phase 3: National Scale (Months 10-12)

**Target:**
- 1,000+ venues nationwide
- 100,000 active users
- R499K MRR

**Tactics:**
- National PR campaign
- Partnership with delivery apps
- TV advertising

---

### Customer Acquisition Strategy:

**For Businesses (B2B):**
✓ Free 30-day trial
✓ Direct sales team
✓ Restaurant industry events
✓ Referral program (R500 credit)

**For Consumers (B2C):**
✓ Organic (venue listings)
✓ Social media marketing
✓ App Store optimization
✓ Viral sharing features

---

## SLIDE 10: INVESTMENT OPPORTUNITY

# Investment Options & ROI

**Two Distinct Paths to Market Dominance**

### OPTION A: R1.5M (Lean Growth)
- **13% Equity @ R10M Valuation**
- **Focus:** Gauteng Only
- **12-Mo Target:** 500 Venues
- **Proj. Revenue:** R3M Annual
- **3-Year ROI:** 5x - 7x (~R15M Exit)

### OPTION B: R2.5M (Recommended - Accelerated Scale)
- **20% Equity @ R10M Valuation**
- **Focus:** National (JHB + CPT + DBN)
- **12-Mo Target:** 1,000+ Venues
- **Proj. Revenue:** R6M+ Annual
- **3-Year ROI:** 10x - 15x (~R50M Exit)

---

### Why R2.5M?
The additional R1M unlocks the **Cape Town & Durban** markets immediately, doubling the addressable market and securing a nationwide network effect moat.

---

## SLIDE 11: CONTACT & THANK YOU

# Thank You

**Let's revolutionize dining discovery together**

---

### Contact Information:

📧 **Email:** bernadette@get-digital.co.za
📱 **Phone:** +27 76 205 5155
🌐 **Website:** www.myvibes.co.za

---

**Ready to Schedule a Demo?**
Let us show you the platform in action
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MYVIBES_Investor_Deck.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">MYVIBES Investor Pitch</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Slide {currentSlide + 1} of {slides.length}
          </span>
          <button
            onClick={handlePowerPointDownload}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors mr-2"
            title="Download PowerPoint Presentation"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 overflow-hidden bg-white">
        {slides[currentSlide].type === 'content' ? (
          <div className="h-full overflow-y-auto p-12">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              {slides[currentSlide].title}
            </h2>
            {slides[currentSlide].content}
          </div>
        ) : (
          slides[currentSlide].content
        )}
      </div>

      {/* Navigation */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
        <Button
          onClick={prevSlide}
          variant="outline"
          className="text-white border-gray-700 hover:bg-gray-800"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {/* Slide Dots */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-gradient-to-r from-orange-500 to-purple-600'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextSlide}
          className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
          disabled={currentSlide === slides.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
