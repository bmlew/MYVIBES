import React, { useState, lazy, Suspense } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Star, 
  Users, 
  ChefHat, 
  TrendingUp, 
  Smartphone, 
  CheckCircle2, 
  Menu, 
  X,
  Instagram,
  Twitter,
  Facebook,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SocialMediaAdsGallery = lazy(() => import('./components/SocialMediaAdsGallery'));

interface LandingPageProps {
  onTryDemo: () => void;
  onRegisterBusiness: () => void;
  onNavigate: (page: 'landing' | 'customer-app' | 'business-dashboard' | 'business-auth' | 'roi' | 'faq' | 'popia' | 'disclaimers' | 'affiliate-portal') => void;
}

export default function LandingPage({ onTryDemo, onRegisterBusiness, onNavigate }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
                MV
              </div>
              <span className="text-xl font-bold tracking-tight">MYVIBES</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => onNavigate('affiliate-portal')} className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors">
                Affiliates
              </button>
              <button onClick={() => onNavigate('faq')} className="text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors">
                FAQ
              </button>
              <button 
                onClick={onRegisterBusiness}
                className="text-sm font-medium text-gray-900 hover:text-cyan-600 transition-colors"
              >
                For Business
              </button>
              <button 
                onClick={onTryDemo}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
              >
                Launch App <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <button onClick={() => { onNavigate('affiliate-portal'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-600 font-medium">
                  Affiliates
                </button>
                <button onClick={() => { onNavigate('faq'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-600 font-medium">
                  FAQ
                </button>
                <button onClick={() => { onRegisterBusiness(); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-900 font-bold">
                  For Business
                </button>
                <button 
                  onClick={() => { onTryDemo(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold mt-4"
                >
                  Launch App
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-50/50 to-transparent -z-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-6 border border-cyan-100">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                Live in South Africa
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Find your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">next vibe.</span>
              </h1>
              <p className="text-xl text-gray-500 mb-8 max-w-lg leading-relaxed">
                Discover the best restaurants, bars, and events near you. Real-time specials, verified reviews, and seamless reservations—all in one app.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onTryDemo}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group"
                >
                  Start Exploring
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onRegisterBusiness}
                  className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Business Partner?
                </button>
              </div>

              <div className="mt-12 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://randomuser.me/api/portraits/thumb/men/${i+20}.jpg`} alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex text-yellow-400">★★★★★</div>
                  <span>Join 15,000+ local foodies</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Image / App Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 mx-auto w-[320px] h-[680px] bg-slate-900 rounded-[3rem] p-4 shadow-2xl shadow-cyan-900/20 border-8 border-slate-900 ring-1 ring-white/10">
                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative">
                  {/* Mock App Header */}
                  <div className="absolute top-0 w-full h-24 bg-gradient-to-r from-cyan-500 to-blue-600 z-10 p-6 pt-8 text-white">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-lg">MYVIBES</div>
                      <div className="w-8 h-8 bg-white/20 rounded-full" />
                    </div>
                  </div>
                  {/* Mock App Content */}
                  <div className="pt-24 px-4 pb-4 h-full overflow-hidden bg-gray-50 flex flex-col gap-4">
                    <div className="flex gap-2 overflow-hidden opacity-50">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-24 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                      ))}
                    </div>
                    {[1,2].map(i => (
                      <div key={i} className="bg-white rounded-2xl p-3 shadow-sm">
                        <div className="h-32 bg-gray-200 rounded-xl mb-3 overflow-hidden">
                           <img 
                             src={i === 1 
                               ? "https://images.unsplash.com/photo-1769955757354-938b69a5c5a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" 
                               : "https://images.unsplash.com/photo-1758176621141-a01052afdb23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"} 
                             className="w-full h-full object-cover"
                             alt="Mock Venue"
                           />
                        </div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-1/2 bg-gray-100 rounded" />
                      </div>
                    ))}
                  </div>
                  {/* Mock App Nav */}
                  <div className="absolute bottom-0 w-full h-20 bg-white border-t border-gray-100 flex justify-around items-center px-6 pb-2">
                    <div className="w-6 h-6 bg-cyan-500 rounded-full" />
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 -right-12 bg-white p-4 rounded-2xl shadow-xl shadow-gray-200/50 z-20 max-w-[200px]"
              >
                <div className="flex gap-3 items-center mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Flash Deal</div>
                    <div className="text-xs text-gray-500">50% Off Cocktails</div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-2/3" />
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-32 -left-12 bg-white p-4 rounded-2xl shadow-xl shadow-gray-200/50 z-20 flex items-center gap-3"
              >
                <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-10 h-10 rounded-full" alt="Reviewer" />
                <div>
                  <div className="flex text-yellow-400 text-xs mb-1">★★★★★</div>
                  <div className="text-xs font-bold">"Best night out ever!"</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Social Ads */}
      <Suspense fallback={null}>
        <SocialMediaAdsGallery />
      </Suspense>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for a perfect night out</h2>
            <p className="text-gray-500 text-lg">Stop searching multiple apps. MYVIBES brings the entire hospitality ecosystem to your fingertips.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Discovery</h3>
              <p className="text-gray-500 leading-relaxed">
                Find venues that match your vibe. Filter by music, crowd, price, and distance in real-time.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Specials</h3>
              <p className="text-gray-500 leading-relaxed">
                Never pay full price again. Access time-limited happy hours and exclusive flash deals near you.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Vibe</h3>
              <p className="text-gray-500 leading-relaxed">
                See where your friends are heading. Share reviews and photos to earn reputation points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section className="py-24 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1745328196225-ed2cf3e51c19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')] bg-cover bg-center opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6 border border-cyan-500/30">
                For Venue Owners
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Fill your seats on demand.</h2>
              <p className="text-xl text-gray-400 mb-8">
                Take control of your foot traffic. Push flash specials during quiet hours, manage reservations effortlessly, and get deep insights into your customers.
              </p>
              
              <div className="space-y-4 mb-10">
                {[
                  'Increase revenue by 30% with smart pricing',
                  'Direct marketing to local customers nearby',
                  'Automated reservation management',
                  'Weekly performance analytics'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-lg">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onRegisterBusiness}
                  className="px-8 py-4 bg-cyan-500 text-white rounded-2xl font-bold text-lg hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Partner with Us
                </button>
                <button 
                  onClick={() => onNavigate('roi')}
                  className="px-8 py-4 bg-transparent border border-gray-600 text-white rounded-2xl font-bold text-lg hover:bg-white/5 transition-all"
                >
                  Calculate ROI
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block">
              {/* Dashboard Preview Mockup */}
              <div className="bg-slate-800 rounded-2xl p-2 border border-slate-700 shadow-2xl">
                 <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative">
                    {/* Mock Dashboard UI */}
                    <div className="absolute top-0 left-0 w-16 h-full bg-slate-800 border-r border-slate-700 p-3 flex flex-col gap-4">
                      <div className="w-10 h-10 bg-cyan-500 rounded-lg" />
                      <div className="w-full h-8 bg-white/10 rounded" />
                      <div className="w-full h-8 bg-white/10 rounded" />
                      <div className="w-full h-8 bg-white/10 rounded" />
                    </div>
                    <div className="ml-16 p-6">
                      <div className="flex justify-between mb-8">
                        <div>
                          <div className="h-4 w-32 bg-white/20 rounded mb-2" />
                          <div className="h-8 w-48 bg-white/10 rounded" />
                        </div>
                        <div className="h-10 w-32 bg-cyan-600 rounded-lg" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-800 p-4 rounded-xl h-32" />
                        <div className="bg-slate-800 p-4 rounded-xl h-32" />
                        <div className="bg-slate-800 p-4 rounded-xl h-32" />
                      </div>
                      <div className="bg-slate-800 rounded-xl h-48 w-full" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <img 
                src="https://images.unsplash.com/photo-1714038918910-daa51af9fccd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" 
                alt="Happy People" 
                className="rounded-[3rem] shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-gray-800 font-medium italic">"Found our new favorite spot in Sandton thanks to MYVIBES. The flash deal was a huge bonus!"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                    <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="User" />
                  </div>
                  <div className="text-sm">
                    <div className="font-bold">Sarah Jenkins</div>
                    <div className="text-gray-500">Food Blogger</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold mb-6">Join South Africa's fastest growing hospitality network.</h2>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-4xl font-bold text-cyan-600 mb-1">15k+</div>
                  <div className="text-gray-500 font-medium">Monthly Users</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-600 mb-1">500+</div>
                  <div className="text-gray-500 font-medium">Partner Venues</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-600 mb-1">50k+</div>
                  <div className="text-gray-500 font-medium">Specials Claimed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-600 mb-1">4.8</div>
                  <div className="text-gray-500 font-medium">App Store Rating</div>
                </div>
              </div>
              <button onClick={onTryDemo} className="text-cyan-600 font-bold text-lg flex items-center gap-2 hover:gap-3 transition-all group">
                Read Success Stories <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-slate-900 text-white py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to find your vibe?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onTryDemo}
              className="px-8 py-4 bg-cyan-500 text-white rounded-2xl font-bold text-lg hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Smartphone className="w-5 h-5" /> Launch Web App
            </button>
            <button className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
               <Download className="w-5 h-5" /> Download for iOS
            </button>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <footer className="bg-slate-950 text-gray-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4 text-white">
                <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center font-bold">MV</div>
                <span className="text-xl font-bold">MYVIBES</span>
              </div>
              <p className="text-sm max-w-xs">
                Connecting people with places. The smartest way to discover and experience South African hospitality.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={onTryDemo} className="hover:text-cyan-400">Customer App</button></li>
                <li><button onClick={onRegisterBusiness} className="hover:text-cyan-400">Business Login</button></li>
                <li><button onClick={() => onNavigate('affiliate-portal')} className="hover:text-cyan-400">Affiliate Program</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('disclaimers')} className="hover:text-cyan-400">Terms of Service</button></li>
                <li><button onClick={() => onNavigate('popia')} className="hover:text-cyan-400">Privacy Policy (POPIA)</button></li>
                <li><button onClick={() => onNavigate('faq')} className="hover:text-cyan-400">Help Center</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs">© 2024 MYVIBES South Africa. All rights reserved.</div>
            <div className="flex gap-4">
              <Instagram className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <Facebook className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
