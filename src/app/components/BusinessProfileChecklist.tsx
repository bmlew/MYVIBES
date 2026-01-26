import { Check, X, AlertCircle } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  cover_image_url?: string;
  logo_url?: string;
  business_type?: string;
  cuisine_types?: string[];
  price_range: string;
  opening_hours?: Record<string, string>;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface Special {
  id: string;
  title: string;
  description: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
}

interface ChecklistItem {
  label: string;
  status: 'complete' | 'incomplete' | 'warning';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface BusinessProfileChecklistProps {
  business: Business;
  menuItems: MenuItem[];
  specials: Special[];
  events: Event[];
  onClose: () => void;
}

export function BusinessProfileChecklist({ 
  business, 
  menuItems, 
  specials, 
  events, 
  onClose 
}: BusinessProfileChecklistProps) {
  
  const checklistItems: ChecklistItem[] = [
    // High Priority - Essential for Professional Display
    {
      label: 'Business Logo',
      status: business.logo_url ? 'complete' : 'incomplete',
      description: business.logo_url 
        ? 'Professional logo uploaded ✓' 
        : 'Upload a high-quality logo (recommended: 200x200px, transparent PNG)',
      priority: 'high'
    },
    {
      label: 'Cover Image',
      status: business.cover_image_url ? 'complete' : 'incomplete',
      description: business.cover_image_url 
        ? 'Cover image set ✓' 
        : 'Add an attractive cover photo (recommended: 1200x600px)',
      priority: 'high'
    },
    {
      label: 'Business Description',
      status: business.description && business.description.length > 50 ? 'complete' : 
              business.description ? 'warning' : 'incomplete',
      description: business.description && business.description.length > 50
        ? `Description is complete (${business.description.length} characters) ✓`
        : business.description 
        ? 'Description is too short - aim for at least 50 characters'
        : 'Add a detailed description of your restaurant',
      priority: 'high'
    },
    {
      label: 'GPS Coordinates',
      status: (business.latitude && business.longitude && 
               business.latitude !== 0 && business.longitude !== 0) ? 'complete' : 'incomplete',
      description: (business.latitude && business.longitude && 
                   business.latitude !== 0 && business.longitude !== 0)
        ? `Location set: ${business.latitude.toFixed(4)}, ${business.longitude.toFixed(4)} ✓`
        : 'Set accurate GPS coordinates using the "Get Coordinates" button in Settings',
      priority: 'high'
    },
    
    // Medium Priority - Important for Customer Experience
    {
      label: 'Establishment Type',
      status: business.business_type ? 'complete' : 'incomplete',
      description: business.business_type
        ? `Type: ${business.business_type.charAt(0).toUpperCase() + business.business_type.slice(1).replace('-', ' ')} ✓`
        : 'Select your establishment type in Settings',
      priority: 'medium'
    },
    {
      label: 'Menu Items',
      status: menuItems.length >= 5 ? 'complete' : 
              menuItems.length > 0 ? 'warning' : 'incomplete',
      description: menuItems.length >= 5 
        ? `${menuItems.length} menu items added ✓`
        : menuItems.length > 0
        ? `Only ${menuItems.length} menu items - add at least 5 for better display`
        : 'Add your menu items (minimum 5 recommended)',
      priority: 'medium'
    },
    {
      label: 'Cuisine Types',
      status: business.cuisine_types && business.cuisine_types.length > 0 ? 'complete' : 'incomplete',
      description: business.cuisine_types && business.cuisine_types.length > 0
        ? `${business.cuisine_types.join(', ')} ✓`
        : 'Select cuisine types to help customers find you',
      priority: 'medium'
    },
    {
      label: 'Opening Hours',
      status: business.opening_hours && Object.keys(business.opening_hours).length >= 7 ? 'complete' : 
              business.opening_hours && Object.keys(business.opening_hours).length > 0 ? 'warning' : 'incomplete',
      description: business.opening_hours && Object.keys(business.opening_hours).length >= 7
        ? 'All opening hours set ✓'
        : business.opening_hours && Object.keys(business.opening_hours).length > 0
        ? 'Some opening hours missing - complete all days'
        : 'Add your opening hours for each day',
      priority: 'medium'
    },
    {
      label: 'Contact Information',
      status: (business.phone && business.email) ? 'complete' : 
              (business.phone || business.email) ? 'warning' : 'incomplete',
      description: (business.phone && business.email)
        ? 'Phone and email provided ✓'
        : (business.phone || business.email)
        ? 'Add both phone and email for best results'
        : 'Add contact details (phone, email, website)',
      priority: 'medium'
    },
    
    // Low Priority - Nice to Have
    {
      label: 'Daily Specials',
      status: specials.length > 0 ? 'complete' : 'incomplete',
      description: specials.length > 0
        ? `${specials.length} specials posted ✓`
        : 'Post daily specials to attract more customers',
      priority: 'low'
    },
    {
      label: 'Events',
      status: events.length > 0 ? 'complete' : 'incomplete',
      description: events.length > 0
        ? `${events.length} events posted ✓`
        : 'Advertise upcoming events to boost engagement',
      priority: 'low'
    },
    {
      label: 'Website Link',
      status: business.website ? 'complete' : 'incomplete',
      description: business.website 
        ? `${business.website} ✓`
        : 'Add your website URL for more information',
      priority: 'low'
    },
  ];

  const highPriority = checklistItems.filter(item => item.priority === 'high');
  const mediumPriority = checklistItems.filter(item => item.priority === 'medium');
  const lowPriority = checklistItems.filter(item => item.priority === 'low');

  const completionScore = Math.round(
    (checklistItems.filter(item => item.status === 'complete').length / checklistItems.length) * 100
  );

  const getStatusIcon = (status: 'complete' | 'incomplete' | 'warning') => {
    switch (status) {
      case 'complete':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'incomplete':
        return <X className="w-5 h-5 text-red-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Business Profile Quality</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Score Circle */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreColor(completionScore)} flex items-center justify-center`}>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{completionScore}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-1">{business.name}</h3>
              <p className="text-sm opacity-90">
                {completionScore >= 80 
                  ? '🎉 Excellent! Your profile looks professional'
                  : completionScore >= 60
                  ? '👍 Good progress! A few improvements will make it shine'
                  : '📝 Let\'s complete your profile for better visibility'}
              </p>
            </div>
          </div>
        </div>

        {/* Checklist Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* High Priority */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">!</span>
              Essential (High Priority)
            </h3>
            <div className="space-y-3">
              {highPriority.map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    item.status === 'complete' 
                      ? 'border-green-200 bg-green-50' 
                      : item.status === 'warning'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{item.label}</h4>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medium Priority */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">!</span>
              Important (Medium Priority)
            </h3>
            <div className="space-y-3">
              {mediumPriority.map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    item.status === 'complete' 
                      ? 'border-green-200 bg-green-50' 
                      : item.status === 'warning'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{item.label}</h4>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Priority */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">i</span>
              Nice to Have (Low Priority)
            </h3>
            <div className="space-y-3">
              {lowPriority.map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    item.status === 'complete' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{item.label}</h4>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-bold mb-3 text-purple-900">💡 Pro Tips for Professional Display</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Images:</strong> Use high-quality photos (1MB+) that showcase your restaurant's ambiance and food</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Logo:</strong> Upload a transparent PNG with your brand colors for a professional look</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Description:</strong> Tell your story! Mention signature dishes, ambiance, and what makes you unique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Menu:</strong> Keep prices updated and add appetizing descriptions for each dish</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Specials:</strong> Post daily specials to keep customers engaged and coming back</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Events:</strong> Advertise live music, theme nights, or special occasions to boost visibility</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all"
          >
            Got It! Let's Improve My Profile
          </button>
        </div>
      </div>
    </div>
  );
}
