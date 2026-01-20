import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft, Search, MessageCircle, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CONFIG, formatPrice } from '@/config/platform';
import { SUBSCRIPTION_CONFIG } from '@/config/subscription';

interface FAQPageProps {
  onBack: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export function FAQPage({ onBack }: FAQPageProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    // General Questions
    {
      category: 'general',
      question: 'What is MYVIBES?',
      answer: 'MYVIBES is a mobile and web platform that connects restaurants and hotels with customers in South Africa. We allow businesses to upload menus, post daily specials, and advertise events, while users can discover nearby dining and entertainment options in real-time using GPS-powered location services.'
    },
    {
      category: 'general',
      question: 'Is MYVIBES free to use?',
      answer: `For customers, MYVIBES is completely free! You can browse venues, view menus, read reviews, get AI recommendations, and save your favorite spots at no cost. For businesses, we offer a freemium model with a ${SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED} monthly subscription that unlocks premium features.`
    },
    {
      category: 'general',
      question: 'Which areas does MYVIBES cover?',
      answer: 'MYVIBES currently operates in South Africa, with plans to expand to other African markets. Our platform uses GPS technology to show you venues near your current location, wherever you are in the country.'
    },
    {
      category: 'general',
      question: 'How do I download the MYVIBES app?',
      answer: 'MYVIBES is a Progressive Web App (PWA), which means you can use it directly from your browser without downloading from an app store. Simply visit our website on your mobile device, and you\'ll be prompted to "Add to Home Screen" for a native app-like experience. This works on both iOS and Android devices.'
    },
    {
      category: 'general',
      question: 'How do I find nearby restaurants and hotels?',
      answer: 'Simply open the MYVIBES app and allow location access when prompted. The app will automatically show you nearby restaurants and hotels based on your GPS location. You can also use the search bar to find specific venues, cuisines, or areas, and apply filters for price range, ratings, and distance.'
    },
    
    // For Customers
    {
      category: 'customers',
      question: 'How do AI recommendations work?',
      answer: 'Our AI recommendation engine analyzes your browsing history, favorite venues, review patterns, time of day, location, and personal preferences to suggest restaurants and specials that match your taste. The more you use MYVIBES, the smarter the recommendations become!'
    },
    {
      category: 'customers',
      question: 'Can I use MYVIBES offline?',
      answer: 'Yes! MYVIBES has offline mode functionality. You can view previously loaded venues, menus, and saved favorites even without an internet connection. However, you\'ll need to be online to see real-time updates, new specials, and submit reviews.'
    },
    {
      category: 'customers',
      question: 'How do I leave a review?',
      answer: 'To leave a review, visit a venue\'s profile page and scroll to the reviews section. Click "Write a Review," rate the venue from 1-5 stars, and share your experience. You can also receive review links via WhatsApp from participating businesses after your visit.'
    },
    {
      category: 'customers',
      question: 'Can I save my favorite venues?',
      answer: 'Absolutely! Click the heart icon on any venue card or detail page to save it to your favorites. You can access all your saved venues from your profile page for quick reference.'
    },
    {
      category: 'customers',
      question: 'Do I need to create an account?',
      answer: 'You can browse venues and view menus without an account. However, creating a free account allows you to save favorites, leave reviews, receive personalized recommendations, and get notifications about specials from your favorite venues.'
    },
    
    // For Businesses
    {
      category: 'business',
      question: 'How much does MYVIBES cost for businesses?',
      answer: `MYVIBES offers a freemium model at ${formatPrice(CONFIG.pricing.baseSubscription)} per month per establishment. This subscription includes unlimited menu uploads, daily specials posting, event advertising, customer reviews management, performance analytics, and premium search placement. We also offer ML Insights as an add-on for ${formatPrice(CONFIG.pricing.mlInsights)}/month for advanced AI-powered business intelligence.`
    },
    {
      category: 'business',
      question: 'What is included in the business subscription?',
      answer: `The ${formatPrice(CONFIG.pricing.baseSubscription)}/month subscription includes: unlimited menu item uploads, daily specials and events posting, customer rating & review management, ML Insights with AI-powered recommendations, basic analytics dashboard, email notifications, premium placement in search results, and 24/7 customer support.`
    },
    {
      category: 'business',
      question: 'How do I register my business?',
      answer: 'Click on "Register Business" from the landing page. You\'ll need to provide your business name, contact information, physical address, business category (restaurant/hotel), opening hours, and upload your logo. Once registered, you can immediately start adding menu items and specials.'
    },
    {
      category: 'business',
      question: 'Can I manage multiple locations?',
      answer: `Yes! Each location requires a separate subscription (${formatPrice(CONFIG.pricing.baseSubscription)}/month per establishment), but you can manage multiple locations from a single account. Each location will have its own menu, specials, and analytics dashboard.`
    },
    {
      category: 'business',
      question: 'How do daily specials work?',
      answer: 'Daily specials are time-sensitive promotional offers you can post to attract customers. You can create one-time specials or set up recurring specials (e.g., "Taco Tuesday") that automatically appear on designated days. Specials appear in customer feeds and search results with highlighted badges.'
    },
    {
      category: 'business',
      question: 'What are ML Insights?',
      answer: 'ML Insights is included in your R499/month subscription at no additional cost. It provides advanced business intelligence including: optimal posting times based on customer engagement patterns, trending menu items analysis, customer behavior predictions, competitive benchmarking, and personalized recommendations to maximize your venue\'s visibility and revenue.'
    },
    {
      category: 'business',
      question: 'How does the WhatsApp integration work?',
      answer: 'After customers visit your venue, you can send them a personalized WhatsApp message with a direct review link. This makes it easy for satisfied customers to leave positive reviews. The integration pre-fills their contact information to streamline the review process.'
    },
    {
      category: 'business',
      question: 'Can I respond to customer reviews?',
      answer: 'Yes! From your business dashboard, you can view all reviews and respond directly to customer feedback. Engaging with reviews shows you care about customer experience and can help build trust with potential customers.'
    },
    {
      category: 'business',
      question: 'How do I upload menu items?',
      answer: 'From your business dashboard, navigate to the "Menu" section and click "Add Item." Upload a photo of the dish, enter the name, description, price, category, and dietary information (vegetarian, vegan, gluten-free, etc.). Our platform optimizes images automatically for fast loading.'
    },
    {
      category: 'business',
      question: 'What is the Premium Carousel feature?',
      answer: 'The Premium Carousel is a marketing feature included in your subscription that showcases your best menu items, current specials, and events in an eye-catching carousel format on your venue profile. This increases engagement and conversions by highlighting your most attractive offerings.'
    },
    
    // Technical Questions
    {
      category: 'technical',
      question: 'What devices are supported?',
      answer: 'MYVIBES works on all modern devices including smartphones (iOS and Android), tablets, and desktop computers. Our responsive design adapts to any screen size. For the best mobile experience, we recommend adding MYVIBES to your home screen as a PWA (Progressive Web App).'
    },
    {
      category: 'technical',
      question: 'Why does MYVIBES need location access?',
      answer: 'Location access allows us to show you restaurants and hotels near your current position, calculate accurate distances, and provide relevant search results. Your location data is only used to enhance your experience and is never shared with third parties without your consent.'
    },
    {
      category: 'technical',
      question: 'Is my data secure?',
      answer: 'Yes! MYVIBES takes data security seriously. We use industry-standard encryption, comply with POPIA (Protection of Personal Information Act) regulations, and never sell your personal information. For more details, please see our Privacy Policy and POPIA Compliance pages.'
    },
    {
      category: 'technical',
      question: 'What browsers are supported?',
      answer: 'MYVIBES works on all modern browsers including Chrome, Safari, Firefox, and Edge. For the best experience, we recommend using the latest version of your preferred browser.'
    },
    
    // Payment & Subscription
    {
      category: 'payment',
      question: 'How do I pay for my business subscription?',
      answer: 'We accept various payment methods including credit/debit cards, and direct bank transfers. Payments are processed securely through our payment provider, Yoco. Your subscription automatically renews monthly unless cancelled.'
    },
    {
      category: 'payment',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your business subscription at any time from your dashboard settings. Your account will remain active until the end of your current billing period, after which you\'ll lose access to premium features. There are no cancellation fees.'
    },
    {
      category: 'payment',
      question: 'Do you offer refunds?',
      answer: 'Subscriptions are billed monthly in advance. If you cancel during your billing period, you\'ll continue to have access until the period ends, but we don\'t offer prorated refunds for partial months. Please see our Terms of Service for complete details.'
    },
    {
      category: 'payment',
      question: 'Is there a free trial?',
      answer: 'Yes! New businesses can try MYVIBES free for 14 days with full access to all premium features. No credit card required to start your trial. After the trial, you\'ll need to subscribe to continue using premium features.'
    },
    
    // Troubleshooting
    {
      category: 'troubleshooting',
      question: 'Why aren\'t my images loading?',
      answer: 'Image loading issues can occur due to slow internet connections or browser cache. Try refreshing the page, clearing your browser cache, or checking your internet connection. For businesses, ensure uploaded images are under 5MB and in supported formats (JPG, PNG, WebP). Our platform automatically optimizes images for better performance.'
    },
    {
      category: 'troubleshooting',
      question: 'My location isn\'t accurate. What should I do?',
      answer: 'Make sure location services are enabled in your browser/device settings and that you\'ve granted MYVIBES permission to access your location. Try refreshing the page or restarting your browser. If using a VPN, try disabling it as it may affect location accuracy.'
    },
    {
      category: 'troubleshooting',
      question: 'I forgot my password. How do I reset it?',
      answer: 'On the login page, click "Forgot Password?" and enter your registered email address. We\'ll send you a password reset link. If you don\'t receive the email, check your spam folder or contact support.'
    },
    {
      category: 'troubleshooting',
      question: 'The app isn\'t working properly. What should I do?',
      answer: 'First, try refreshing the page or restarting your browser. Clear your browser cache and cookies if the issue persists. Make sure you\'re using a supported browser and that it\'s updated to the latest version. If problems continue, contact our support team with details about your device, browser, and the specific issue.'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Questions', icon: '📚' },
    { id: 'general', label: 'General', icon: '❓' },
    { id: 'customers', label: 'For Customers', icon: '👥' },
    { id: 'business', label: 'For Businesses', icon: '💼' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'payment', label: 'Payment & Billing', icon: '💳' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              FAQs
            </h1>
            <div className="w-20" /> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-6">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about MYVIBES. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                Try adjusting your search or category filter
              </p>
            </Card>
          ) : (
            filteredFAQs.map((faq, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {faq.question}
                    </h3>
                    <button className="flex-shrink-0 text-blue-600">
                      {expandedIndex === index ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                  {expandedIndex === index && (
                    <div className="mt-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Contact Support Section */}
        <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              Our support team is here to help! Reach out to us through any of these channels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@myvibes.co.za"
                className="flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </a>
              <a
                href="https://wa.me/27123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
              <a
                href="tel:+27123456789"
                className="flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </a>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
