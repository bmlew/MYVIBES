import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  MapPin, Star, Calendar, TrendingUp, Users, Zap, 
  Smartphone, Globe, Award, ChevronRight, Menu, X,
  Check, ArrowRight, Sparkles, Target, BarChart3, Heart, Play, Presentation
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { PitchDeck } from '@/app/components/PitchDeck';
import { SocialMediaAdsGallery } from '@/app/components/SocialMediaAdsGallery';
import { CONFIG, formatPrice } from '@/config/platform';

interface LandingPageProps {
  onTryDemo?: () => void;
  onRegisterBusiness?: () => void;
  onNavigate?: (page: 'faq' | 'popia' | 'disclaimers' | 'affiliate-portal') => void;
}

export default function LandingPage({ onTryDemo, onRegisterBusiness, onNavigate }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  // Show demo switcher button
  const handleDemoAccess = () => {
    // You can customize this to switch to the customer app
    window.dispatchEvent(new CustomEvent('switchToCustomerApp'));
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for fixed header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false); // Close mobile menu after clicking
    }
  };

  useEffect(() => {
    // Prevent scroll when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const features = [
    {
      icon: MapPin,
      title: "Location-Based Discovery",
      description: "Find the best restaurants and hotels near you in real-time with GPS-powered search"
    },
    {
      icon: Calendar,
      title: "Daily Specials & Events",
      description: "Never miss out on special offers, events, and exclusive deals at your favorite spots"
    },
    {
      icon: Star,
      title: "AI-Powered Recommendations",
      description: "Get personalized suggestions based on your preferences, time, and location"
    },
    {
      icon: TrendingUp,
      title: "Business Insights",
      description: "Data-driven analytics to help businesses optimize posting times and engagement"
    },
    {
      icon: Users,
      title: "Ratings & Reviews",
      description: "Authentic customer feedback with 5-star ratings and helpful voting system"
    },
    {
      icon: Zap,
      title: "Real-Time Updates",
      description: "Instant notifications for new specials, events, and menu items from followed venues"
    }
  ];

  const pricingFeatures = [
    "Upload unlimited menu items",
    "Post daily specials & events",
    "Customer rating & review management",
    "AI-powered business insights",
    "Performance analytics dashboard",
    "Premium placement in search results",
    "Email & push notifications",
    "24/7 customer support"
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "500+", label: "Partner Venues" },
    { value: "50K+", label: "Reviews Posted" },
    { value: "4.8★", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header 
        className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-sm border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-2 sm:gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                MYVIBES
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => scrollToSection('features')}
                className="px-4 py-2 text-gray-700 hover:text-cyan-600 transition-colors font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="px-4 py-2 text-gray-700 hover:text-cyan-600 transition-colors font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="px-4 py-2 text-gray-700 hover:text-cyan-600 transition-colors font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                How It Works
              </button>
              <Button 
                onClick={onRegisterBusiness}
                className="ml-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-md hover:shadow-xl transition-all px-6 cursor-pointer"
              >
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-40"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <nav className="flex flex-col p-4 gap-4">
              <button 
                type="button"
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-cyan-500 transition-colors font-medium py-2 text-left cursor-pointer bg-transparent border-none"
              >
                Features
              </button>
              <button 
                type="button"
                onClick={() => scrollToSection('pricing')}
                className="text-gray-700 hover:text-cyan-500 transition-colors font-medium py-2 text-left cursor-pointer bg-transparent border-none"
              >
                Pricing
              </button>
              <button 
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 hover:text-cyan-500 transition-colors font-medium py-2 text-left cursor-pointer bg-transparent border-none"
              >
                How It Works
              </button>
              <Button 
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRegisterBusiness?.();
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white w-full cursor-pointer"
              >
                Get Started
              </Button>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-28 pb-12 sm:pb-16 px-4 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 opacity-50" />
        <motion.div 
          className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-tr from-purple-400 to-orange-600 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full mb-4 sm:mb-6">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm font-medium bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    Now Live in South Africa
                  </span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  Discover Amazing
                  <span className="block bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                    Dining Experiences
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                  Connect with the best restaurants and hotels near you. Get real-time specials, 
                  exclusive events, and AI-powered recommendations tailored just for you.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 hover:shadow-2xl transition-all group">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Download App
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 hover:border-cyan-500 hover:text-cyan-500 transition-all" onClick={onRegisterBusiness}>
                    <Users className="w-5 h-5 mr-2" />
                    For Businesses
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Phone Mockup */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative mx-auto max-w-sm lg:max-w-md">
                {/* Floating Cards */}
                <motion.div 
                  className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-2xl p-4 z-20"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">4.9 Rating</p>
                      <p className="text-sm text-gray-500">Top Rated</p>
                    </div>
                  </div>
                </motion.div>

                {/* App Preview Badge */}
                <motion.div 
                  className="absolute top-8 -right-8 z-20"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold text-sm whitespace-nowrap">PWA Ready</span>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-2xl p-4 z-20"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">50% Off</p>
                      <p className="text-sm text-gray-500">Today's Special</p>
                    </div>
                  </div>
                </motion.div>

                {/* Phone Frame */}
                <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[3rem] p-1 shadow-2xl">
                  <div className="bg-white rounded-[2.75rem] overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1760888549280-4aef010720bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjByZXN0YXVyYW50fGVufDF8fHx8MTc2ODQ1OTQ0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="MYVIBES Customer App Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-16 sm:mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Social Proof Images */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 sm:mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1721993745778-b6730e1768a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwZW5qb3lpbmclMjBkaW5uZXJ8ZW58MXx8fHwxNzY4NDU5MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Friends dining together"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold text-sm sm:text-base">Discover Together</p>
              </div>
            </div>
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1601118964938-228a89955311?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBkaW5pbmclMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NjgzNjMwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Happy people at restaurant"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold text-sm sm:text-base">Create Memories</p>
              </div>
            </div>
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1613274554329-70f997f5789f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzY4NDU4MDY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Group of friends eating"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white font-semibold text-sm sm:text-base">Share Experiences</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to connect food lovers with amazing venues
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-cyan-200 group h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How MYVIBE Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and unlock a world of dining possibilities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-12">
            {/* Image on left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1"
            >
              <img 
                src="https://images.unsplash.com/photo-1743793055775-3c07ab847ad0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZWxlZ2FudCUyMGF0bW9zcGhlcmV8ZW58MXx8fHwxNzY4NDU5MzA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Elegant restaurant dining"
                className="w-full h-[400px] object-cover rounded-3xl shadow-2xl"
              />
            </motion.div>

            {/* For Customers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 md:order-2"
            >
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-6 sm:p-8 lg:p-10 h-full">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">For Customers</h3>
                </div>
                
                <div className="space-y-6">
                  {[
                    { step: "1", title: "Download & Sign Up", desc: "Get the app and create your free account in seconds" },
                    { step: "2", title: "Discover Nearby Venues", desc: "Browse restaurants and hotels near you with real-time updates" },
                    { step: "3", title: "Get Recommendations", desc: "Receive personalized AI-powered suggestions based on your taste" },
                    { step: "4", title: "Enjoy & Review", desc: "Visit amazing places and share your experience with the community" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-gray-600 text-sm sm:text-base">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* For Businesses */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 sm:p-8 lg:p-10 h-full">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">For Businesses</h3>
                </div>
                
                <div className="space-y-6">
                  {[
                    { step: "1", title: "Create Your Profile", desc: "Set up your business in minutes with photos and details" },
                    { step: "2", title: "Upload Menu & Specials", desc: "Share your offerings and daily promotions with customers" },
                    { step: "3", title: "Engage Customers", desc: "Post events, respond to reviews, and build your community" },
                    { step: "4", title: "Grow Your Business", desc: "Use AI insights to optimize and attract more customers" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-gray-600 text-sm sm:text-base">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Image on right */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidXNpbmVzcyUyMGFuYWx5dGljc3xlbnwxfHx8fDE3Njg0NTkzMDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Business dashboard analytics"
                className="w-full h-[400px] object-cover rounded-3xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media Ads Gallery */}
      <SocialMediaAdsGallery />

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Free for customers. Affordable for businesses.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Customer Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6 sm:p-8 lg:p-10 border-2 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-8 h-8 text-cyan-500" />
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">For Customers</h3>
                </div>
                
                <div className="mb-6 sm:mb-8">
                  <div className="text-5xl sm:text-6xl font-bold text-gray-900 mb-2">FREE</div>
                  <p className="text-gray-600">Forever. No credit card required.</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited venue discovery",
                    "Real-time specials & events",
                    "AI-powered recommendations",
                    "Ratings & reviews",
                    "Location-based search",
                    "Favorite venues tracking",
                    "Push notifications"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg">
                  Download Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </motion.div>

            {/* Business Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6 sm:p-8 lg:p-10 border-2 border-cyan-500 relative overflow-hidden h-full">
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">For Businesses</h3>
                </div>
                
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                      {formatPrice(CONFIG.pricing.baseSubscription)}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600 mt-2">Everything you need to grow</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {pricingFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-xl text-white py-6 text-lg transition-all">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-900 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Ready to Discover Your Next
              <br className="hidden sm:block" />
              Favorite Spot?
            </h2>
            <p className="text-lg sm:text-xl text-white mb-8 sm:mb-10 max-w-2xl mx-auto drop-shadow-md">
              Join thousands of food lovers and hundreds of businesses already using MYVIBES
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all group font-semibold">
                <Smartphone className="w-5 h-5 mr-2" />
                Download App
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 transition-all font-semibold shadow-lg">
                <Target className="w-5 h-5 mr-2" />
                List Your Business
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
            {/* Logo & Description */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">MYVIBE</span>
              </div>
              <p className="text-gray-400">
                Connecting food lovers with amazing dining experiences across South Africa.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('pricing')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onRegisterBusiness}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    For Businesses
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li>
                  <button 
                    onClick={() => onNavigate?.('affiliate-portal' as any)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    💰 Affiliate Program
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => onNavigate?.('faq')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    FAQs
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate?.('popia')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    Privacy Policy (POPIA)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate?.('disclaimers')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    Terms & Disclaimers
                  </button>
                </li>
                <li><a href="mailto:support@vibespot.co.za" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 MYVIBE. All rights reserved. Made with ❤️ in South Africa</p>
          </div>
        </div>
      </footer>

      {/* Floating Demo Button */}
      {onTryDemo && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5, type: "spring" }}
        >
          <Button
            size="lg"
            onClick={onTryDemo}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl hover:shadow-3xl transition-all group rounded-full px-6 py-6"
          >
            <Play className="w-5 h-5 mr-2" />
            Try Live Demo
            <motion.div
              className="ml-2"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </Button>
        </motion.div>
      )}

      {/* Floating Investor Deck Button */}
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
      >
        <Button
          size="lg"
          onClick={() => setShowPitchDeck(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl hover:shadow-3xl transition-all group rounded-full px-6 py-6"
        >
          <Presentation className="w-5 h-5 mr-2" />
          Investor Deck
          <motion.div
            className="ml-2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Pitch Deck Modal */}
      {showPitchDeck && <PitchDeck onClose={() => setShowPitchDeck(false)} />}
    </div>
  );
}