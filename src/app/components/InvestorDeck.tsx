import React, { useRef } from 'react';
import { 
  Download, 
  Printer, 
  ChevronLeft, 
  MapPin, 
  Users, 
  Trophy, 
  Smartphone, 
  BarChart3, 
  Server, 
  Rocket,
  Target,
  Shield,
  Zap
} from 'lucide-react';
import pptxgen from 'pptxgenjs';

interface InvestorDeckProps {
  onBack: () => void;
}

export function InvestorDeck({ onBack }: InvestorDeckProps) {
  const deckRef = useRef<HTMLDivElement>(null);

  const generatePowerPoint = () => {
    try {
      const pres = new pptxgen();
      
      // Slide 1: Title
      let slide = pres.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addText('MYVIBES', { x: 1, y: 1.5, w: '80%', fontSize: 48, bold: true, color: '00A3BF' });
      slide.addText('Investment Prospectus', { x: 1, y: 2.5, w: '80%', fontSize: 24, color: '333333' });
      slide.addText('Connecting People to Places Through Gamified Hospitality', { x: 1, y: 3, w: '80%', fontSize: 18, color: '666666' });
      slide.addText(new Date().getFullYear().toString(), { x: 1, y: 5, w: '20%', fontSize: 12, color: '999999' });

      // Slide 2: Executive Summary
      slide = pres.addSlide();
      slide.addText('Executive Summary', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: '00A3BF' });
      slide.addText('MYVIBES is a next-generation hospitality platform bridging the gap between venue discovery and customer retention.', { x: 0.5, y: 1.5, w: '90%', fontSize: 14, color: '333333' });
      slide.addText([
        { text: '• Real-time engagement mechanics turning visitors into advocates', options: { breakLine: true } },
        { text: '• Proprietary "Check-In" economy validating user presence', options: { breakLine: true } },
        { text: '• Zero-friction "Dual-Session" onboarding technology', options: { breakLine: true } }
      ], { x: 0.5, y: 2.5, w: '90%', fontSize: 14, color: '333333', bullet: true });

      // Slide 3: The Problem
      slide = pres.addSlide();
      slide.addText('The Problem', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: '00A3BF' });
      slide.addText('For Customers:', { x: 0.5, y: 1.5, w: '40%', fontSize: 16, bold: true, color: '333333' });
      slide.addText('Static directories lack "vibe" context. Loyalty programs are boring and fragmented.', { x: 0.5, y: 2, w: '40%', fontSize: 12, color: '666666' });
      slide.addText('For Venues:', { x: 5, y: 1.5, w: '40%', fontSize: 16, bold: true, color: '333333' });
      slide.addText('No real-time data on who is on-site. Hard to retain VIPs without expensive CRM.', { x: 5, y: 2, w: '40%', fontSize: 12, color: '666666' });

      // Slide 4: The Solution
      slide = pres.addSlide();
      slide.addText('The Solution: MYVIBES', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: '00A3BF' });
      slide.addText('Proprietary Check-In System:', { x: 0.5, y: 1.5, w: '90%', fontSize: 16, bold: true, color: '333333' });
      slide.addText('Users check in to earn points, validating location and engagement.', { x: 0.5, y: 2, w: '90%', fontSize: 12, color: '666666' });
      slide.addText('Dynamic Leaderboards:', { x: 0.5, y: 2.5, w: '90%', fontSize: 16, bold: true, color: '333333' });
      slide.addText('Social competition drives repeat visits.', { x: 0.5, y: 3, w: '90%', fontSize: 12, color: '666666' });
      slide.addText('Smart Data Capture:', { x: 0.5, y: 3.5, w: '90%', fontSize: 16, bold: true, color: '333333' });
      slide.addText('Frictionless onboarding capturing high-value user data.', { x: 0.5, y: 4, w: '90%', fontSize: 12, color: '666666' });

      // Slide 5: System Features
      slide = pres.addSlide();
      slide.addText('System Features', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: '00A3BF' });
      slide.addText([
        { text: 'Customer Experience:', options: { fontSize: 16, bold: true, color: '333333', breakLine: true } },
        { text: '- Dual-Session Auth & Smart Onboarding', options: { fontSize: 12, color: '666666', breakLine: true } },
        { text: '- Vibe-Based Venue Discovery', options: { fontSize: 12, color: '666666', breakLine: true } },
        { text: '- Gamified Loyalty Points & Leaderboards', options: { fontSize: 12, color: '666666', breakLine: true } },
        { text: 'Business Intelligence:', options: { fontSize: 16, bold: true, color: '333333', breakLine: true } },
        { text: '- Real-Time Live Traffic Feed', options: { fontSize: 12, color: '666666', breakLine: true } },
        { text: '- Customer CRM & Insights', options: { fontSize: 12, color: '666666', breakLine: true } },
        { text: '- Venue Profile Management', options: { fontSize: 12, color: '666666', breakLine: true } }
      ], { x: 0.5, y: 1.5, w: '90%' });

      // Slide 6: Technical Stack
      slide = pres.addSlide();
      slide.addText('Technical Infrastructure', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: '00A3BF' });
      slide.addText([
        { text: 'Frontend: React, Tailwind CSS, Lucide Icons', options: { breakLine: true } },
        { text: 'Backend: Supabase (PostgreSQL), Edge Functions', options: { breakLine: true } },
        { text: 'Security: Row Level Security (RLS), Secure Auth', options: { breakLine: true } },
        { text: 'Performance: Edge Computing, Optimistic UI', options: { breakLine: true } }
      ], { x: 0.5, y: 1.5, w: '90%', fontSize: 14, color: '333333', bullet: true });

      // Slide 7: Roadmap
      slide = pres.addSlide();
      slide.addText('Roadmap & Ask', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: '00A3BF' });
      slide.addText('Q3 2024: Reward Redemption Marketplace', { x: 0.5, y: 1.5, w: '90%', fontSize: 14, color: '333333' });
      slide.addText('Q4 2024: "Vibe Alerts" Push Notifications', { x: 0.5, y: 2, w: '90%', fontSize: 14, color: '333333' });
      slide.addText('Q1 2025: POS Integration', { x: 0.5, y: 2.5, w: '90%', fontSize: 14, color: '333333' });
      slide.addText('We are seeking seed investment to scale acquisition and product development.', { x: 0.5, y: 4, w: '90%', fontSize: 16, bold: true, color: '00A3BF' });

      pres.writeFile({ fileName: 'MYVIBES_Investor_Prospectus.pptx' });
    } catch (error) {
      console.error('Failed to generate PowerPoint:', error);
      alert('Failed to generate PowerPoint. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar for actions */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b z-50 px-6 py-4 flex justify-between items-center print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to App
        </button>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            <Printer className="w-4 h-4" />
            Save as PDF
          </button>
          <button 
            onClick={generatePowerPoint}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg shadow-blue-500/20"
          >
            <Download className="w-4 h-4" />
            Download PPTX
          </button>
        </div>
      </div>

      {/* Main Content - Designed to look like slides */}
      <div className="max-w-4xl mx-auto pt-24 pb-20 px-8 print:pt-0 print:px-0 print:mx-0 print:max-w-none">
        
        {/* Cover Slide */}
        <div className="min-h-[60vh] flex flex-col justify-center border-b pb-12 mb-12 print:min-h-screen print:border-none print:mb-0 page-break">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            MYVIBES
          </h1>
          <h2 className="text-3xl font-light text-gray-600 mb-6">Investment Prospectus</h2>
          <p className="text-xl text-gray-500 max-w-2xl">
            Connecting People to Places Through Gamified Hospitality
          </p>
          <div className="mt-12 text-sm text-gray-400 font-medium tracking-widest uppercase">
            {new Date().getFullYear()} Confidential
          </div>
        </div>

        {/* Executive Summary */}
        <section className="mb-20 print:mb-0 print:min-h-screen page-break">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8 text-cyan-600" />
            <h2 className="text-3xl font-bold text-gray-900">Executive Summary</h2>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            MYVIBES is a next-generation hospitality platform that bridges the gap between venue discovery and customer retention. Unlike static directory apps, MYVIBES utilizes <strong className="text-cyan-700">real-time engagement mechanics</strong> and <strong className="text-cyan-700">gamification</strong> to turn passive visitors into loyal advocates.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <Zap className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Check-In Economy</h3>
              <p className="text-gray-500 text-sm">Validating user location and engagement through points.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <Trophy className="w-8 h-8 text-yellow-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Social Competition</h3>
              <p className="text-gray-500 text-sm">Leaderboards driving repeat visits and social proof.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <Users className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Smart Onboarding</h3>
              <p className="text-gray-500 text-sm">Frictionless data capture for high-value user profiles.</p>
            </div>
          </div>
        </section>

        {/* The Problem & Solution */}
        <section className="mb-20 print:mb-0 print:min-h-screen page-break">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <AlertIcon className="w-8 h-8 text-red-500" />
                <h2 className="text-3xl font-bold text-gray-900">The Problem</h2>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                  <h3 className="text-xl font-bold text-red-800 mb-2">For Customers</h3>
                  <p className="text-red-700">Discovering "the right vibe" is hard. Loyalty programs are boring, fragmented, and card-based.</p>
                </div>
                <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                  <h3 className="text-xl font-bold text-red-800 mb-2">For Venues</h3>
                  <p className="text-red-700">Lack of real-time on-site data. Struggle to identify VIPs without expensive CRM software.</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <CheckIcon className="w-8 h-8 text-green-500" />
                <h2 className="text-3xl font-bold text-gray-900">The Solution</h2>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                  <h3 className="text-xl font-bold text-green-800 mb-2">Gamified Discovery</h3>
                  <p className="text-green-700">Users check in to earn points. Leaderboards create social stakes for attendance.</p>
                </div>
                <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                  <h3 className="text-xl font-bold text-green-800 mb-2">Live Business Intel</h3>
                  <p className="text-green-700">Real-time dashboards showing who is on-site, with actionable customer profiles.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Features */}
        <section className="mb-20 print:mb-0 print:min-h-screen page-break">
          <div className="flex items-center gap-3 mb-8">
            <Smartphone className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-900">System Features</h2>
          </div>
          
          <div className="grid gap-8">
            <div className="border-l-4 border-cyan-500 pl-6">
              <h3 className="text-2xl font-bold mb-4 text-cyan-900">Customer Experience (Frontend)</h3>
              <ul className="space-y-3">
                <FeatureItem title="Smart Onboarding" desc="Dual-session auth with seamless guest-to-registered conversion." />
                <FeatureItem title="Venue Discovery" desc="Vibe-based filtering and geolocation integration." />
                <FeatureItem title="Gamification Engine" desc="Secure check-ins, loyalty points, and real-time leaderboards." />
                <FeatureItem title="Social Proof" desc="Live activity tickers driving FOMO (Fear Of Missing Out)." />
              </ul>
            </div>

            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Business Intelligence</h3>
              <ul className="space-y-3">
                <FeatureItem title="Real-Time Analytics" desc="Live traffic feed of customer check-ins as they happen." />
                <FeatureItem title="Customer CRM" desc="Access to profiles (Name, Mobile, Birthday) for targeted marketing." />
                <FeatureItem title="VIP Identification" desc="Leaderboard tracking to reward top spenders and visitors." />
              </ul>
            </div>
          </div>
        </section>

        {/* Tech Stack & Roadmap */}
        <section className="print:min-h-screen page-break">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Server className="w-8 h-8 text-gray-700" />
                <h2 className="text-2xl font-bold text-gray-900">Technology</h2>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span><strong>Frontend:</strong> React, Tailwind CSS</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span><strong>Backend:</strong> Supabase (PostgreSQL)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span><strong>Compute:</strong> Edge Functions (Serverless)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span><strong>Security:</strong> Row Level Security (RLS)</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-8 h-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Revenue Model</h2>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span><strong>SaaS Subscription:</strong> Monthly venue fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span><strong>Premium Listings:</strong> Featured venue spots</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span><strong>Data Monetization:</strong> Aggregated trends</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Future Roadmap</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left mt-8">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-cyan-400 font-bold mb-1">Q3 2024</div>
                <div className="font-semibold">Rewards Marketplace</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-cyan-400 font-bold mb-1">Q4 2024</div>
                <div className="font-semibold">"Vibe Alerts" Push</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-cyan-400 font-bold mb-1">Q1 2025</div>
                <div className="font-semibold">POS Integration</div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { break-after: page; min-h: 100vh; padding: 40px; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:pt-0 { padding-top: 0 !important; }
          .print\\:min-h-screen { min-height: 100vh !important; }
        }
      `}</style>
    </div>
  );
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
      <div>
        <strong className="block text-gray-900 font-semibold">{title}</strong>
        <span className="text-gray-600">{desc}</span>
      </div>
    </li>
  );
}

// Helper icons
function AlertIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function CheckIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
