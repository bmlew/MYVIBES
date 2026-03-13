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
  Download,
  Sparkles,
  Music,
  Calendar,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MyVibesLogo, MyVibesIcon } from './components/MyVibesLogo';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

const SocialMediaAdsGallery = lazy(() => import('./components/SocialMediaAdsGallery'));

// Rebuild trigger comment

import { ROICalculator } from './components/ROICalculator';

// Hero images
const heroBackgroundImage = "https://images.unsplash.com/photo-1763054761579-a5392d7186ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920";
const newHeroImage = "https://images.unsplash.com/photo-1758426637742-80bd0f983611?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

interface LandingPageProps {
  onTryDemo: () => void;
  onRegisterBusiness: () => void;
  onNavigate: (page: 'landing' | 'customer-app' | 'business-dashboard' | 'business-auth' | 'roi' | 'faq' | 'popia' | 'disclaimers' | 'affiliate-portal' | 'investor-deck') => void;
}

export default function LandingPage({ onTryDemo, onRegisterBusiness, onNavigate }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  console.log('🎨 LandingPage rendered');

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <MyVibesIcon size={48} />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => onNavigate('investor-deck')} className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors">
                Investors
              </button>
              <button onClick={() => onNavigate('affiliate-portal')} className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors">
                Affiliates
              </button>
              <button onClick={() => onNavigate('faq')} className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors">
                FAQ
              </button>
              <button 
                onClick={onRegisterBusiness}
                className="text-sm font-medium text-white hover:text-cyan-400 transition-colors"
              >
                For Business
              </button>
              <button 
                onClick={onTryDemo}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                Launch App <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:bg-slate-800 rounded-lg transition-colors"
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
              className="md:hidden bg-slate-900 border-t border-cyan-500/10 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <button onClick={() => { onNavigate('investor-deck'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-400 font-medium">
                  Investors
                </button>
                <button onClick={() => { onNavigate('affiliate-portal'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-400 font-medium">
                  Affiliates
                </button>
                <button onClick={() => { onNavigate('faq'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-gray-400 font-medium">
                  FAQ
                </button>
                <button onClick={() => { onRegisterBusiness(); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-white font-bold">
                  For Business
                </button>
                <button 
                  onClick={() => { onTryDemo(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold mt-4"
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
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <img 
            src={heroBackgroundImage}
            alt="Vibrant nightlife" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/60" />
        </div>
        
        {/* Animated Background Gradient Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-full blur-3xl -z-5"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/30 to-pink-500/30 rounded-full blur-3xl -z-5"
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/50 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * 800 
            }}
            animate={{ 
              y: [null, Math.random() * 800],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6 border border-cyan-500/30"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Live in South Africa
              </motion.div>
              
              <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6">
                Find your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse">
                  next vibe.
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
                Discover the best restaurants, bars, and events near you. 
                <span className="text-cyan-400 font-semibold"> Real-time specials</span>, verified reviews, and seamless reservations—all in one app.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTryDemo}
                  className="px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Exploring
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRegisterBusiness}
                  className="px-8 py-5 bg-slate-800/50 text-white border-2 border-cyan-500/30 rounded-2xl font-bold text-lg hover:border-cyan-500 hover:bg-slate-800 transition-all backdrop-blur-sm flex items-center justify-center"
                >
                  Business Partner?
                </motion.button>
              </div>

              {/* Social Proof with Animation */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-6 text-sm"
              >
                <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(i => (
                    <motion.img 
                      key={i} 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + (i * 0.1) }}
                      src={`https://randomuser.me/api/portraits/thumb/${i % 2 === 0 ? 'men' : 'women'}/${i+20}.jpg`} 
                      alt="User" 
                      className="w-12 h-12 rounded-full border-3 border-slate-950"
                    />
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex text-yellow-400 text-lg mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <span className="text-gray-400 font-medium">Join <span className="text-cyan-400 font-bold">15,000+</span> local foodies</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual - Lifestyle Collage */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Main Vibrant Hero Image */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-cyan-500/30 border-4 border-cyan-500/30"
              >
                <img 
                  src={newHeroImage}
                  alt="MYVIBES Experience" 
                  className="w-full h-auto object-cover"
                />
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                
                {/* Large MYVIBES Logo Overlay */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute bottom-8 left-8 right-8"
                >
                  <MyVibesLogo variant="white" className="justify-center lg:justify-start scale-150" />
                </motion.div>
              </motion.div>
              
              {/* Floating Info Cards */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -left-8 bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-2xl shadow-2xl shadow-green-500/30 z-20 backdrop-blur-sm border border-green-400/30"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">Flash Deal!</div>
                    <div className="text-sm text-green-100">2-for-1 Cocktails</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -right-6 bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-2xl shadow-2xl shadow-purple-500/30 z-20 backdrop-blur-sm border border-purple-400/30"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Music className="w-5 h-5 text-white" />
                  <div className="text-white font-bold">Live Tonight</div>
                </div>
                <div className="text-sm text-purple-100">Jazz & Wine @ 8PM</div>
              </motion.div>

              <motion.div 
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -left-12 bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-full shadow-2xl shadow-cyan-500/30 z-20 border-2 border-cyan-400/30"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vibe Categories - NEW SECTION */}
      <section className="py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
              Whatever Your Vibe
            </h2>
            <p className="text-gray-400 text-lg">Find the perfect spot for every mood</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Music, label: 'Live Music', color: 'from-purple-500 to-pink-500', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop' },
              { icon: ChefHat, label: 'Fine Dining', color: 'from-orange-500 to-red-500', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' },
              { icon: Users, label: 'Social Spots', color: 'from-cyan-500 to-blue-500', image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=300&fit=crop' },
              { icon: Calendar, label: 'Events', color: 'from-green-500 to-emerald-500', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop' },
            ].map((vibe, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="relative group cursor-pointer rounded-3xl overflow-hidden aspect-[4/5]"
              >
                <img src={vibe.image} alt={vibe.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-t ${vibe.color} opacity-30 group-hover:opacity-50 transition-opacity`} />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <vibe.icon className="w-8 h-8 text-white mb-3" />
                  <div className="text-white font-bold text-xl">{vibe.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Social Ads */}
      <Suspense fallback={null}>
        <SocialMediaAdsGallery />
      </Suspense>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-4"
            >
              Everything you need for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">perfect night out</span>
            </motion.h2>
            <p className="text-gray-400 text-lg">Stop searching multiple apps. MYVIBES brings the entire hospitality ecosystem to your fingertips.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: 'Smart Discovery', desc: 'Find venues that match your vibe. Filter by music, crowd, price, and distance in real-time.', color: 'cyan' },
              { icon: TrendingUp, title: 'Live Specials', desc: 'Never pay full price again. Access time-limited happy hours and exclusive flash deals near you.', color: 'purple' },
              { icon: Users, title: 'Community Vibe', desc: 'See where your friends are heading. Share reviews and photos to earn reputation points.', color: 'pink' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-3xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all backdrop-blur-sm group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 text-${feature.color}-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
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
                  onClick={() => {
                    const el = document.getElementById('calculator');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
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

      {/* ROI Calculator Section */}
      <ROICalculator onStart={() => onNavigate('affiliate-portal')} />

      {/* Social Proof */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1 relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1714038918910-daa51af9fccd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" 
                alt="Happy People" 
                className="rounded-[3rem] shadow-2xl shadow-cyan-500/10"
              />
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-8 -right-8 bg-slate-800 p-6 rounded-2xl shadow-2xl border border-cyan-500/20 max-w-xs backdrop-blur-sm"
              >
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-white font-medium italic mb-3">
                  "Found our new favorite spot in Sandton thanks to MYVIBES. The flash deal was a huge bonus!"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-cyan-500/20">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                    <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="User" />
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-white">Sarah Jenkins</div>
                    <div className="text-gray-400">Food Blogger</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Join South Africa's fastest growing 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"> hospitality network</span>.
              </h2>
              <div className="grid grid-cols-2 gap-8 mb-8">
                {[
                  { value: '15k+', label: 'Monthly Users' },
                  { value: '500+', label: 'Partner Venues' },
                  { value: '50k+', label: 'Specials Claimed' },
                  { value: '4.8', label: 'App Store Rating' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
              <motion.button 
                onClick={onTryDemo}
                whileHover={{ x: 10 }}
                className="text-cyan-400 font-bold text-lg flex items-center gap-2 hover:gap-4 transition-all group"
              >
                Read Success Stories 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white py-24 border-t border-cyan-500/10 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Ready to find <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">your vibe</span>?
          </motion.h2>
          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of South Africans discovering amazing experiences every day
          </p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.button 
              onClick={onTryDemo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 group"
            >
              <Smartphone className="w-6 h-6" /> 
              Launch Web App
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-slate-800/50 border-2 border-cyan-500/30 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 hover:border-cyan-500 transition-all backdrop-blur-sm flex items-center justify-center gap-3"
            >
              <Download className="w-6 h-6" /> 
              Download for iOS
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}