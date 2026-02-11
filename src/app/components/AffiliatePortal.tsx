import React, { useState } from 'react';
import { Share2, DollarSign, Users } from 'lucide-react';

export function AffiliatePortal() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Affiliate Partner Program</h1>
          <p className="text-gray-500">Earn ongoing revenue by referring hospitality businesses to MYVIBES.</p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">Earn Commission</div>
              <div className="text-sm text-gray-500">Get paid for every business that subscribes.</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">Grow Together</div>
              <div className="text-sm text-gray-500">Help local businesses thrive while you earn.</div>
            </div>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <button className="w-full bg-cyan-600 text-white p-3 rounded-lg font-bold hover:bg-cyan-700 transition-colors">
            Apply Now
          </button>
        </form>
      </div>
    </div>
  );
}
