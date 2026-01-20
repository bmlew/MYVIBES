import { useState } from 'react';
import { X, Calendar, Clock, Users, Phone, Mail, User } from 'lucide-react';
import * as api from '@/utils/api';

interface ReservationModalProps {
  business: any;
  onClose: () => void;
  userProfile?: any;
}

export function ReservationModal({ business, onClose, userProfile }: ReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: userProfile?.name || '',
    customer_email: userProfile?.email || '',
    customer_phone: userProfile?.mobile || userProfile?.phone || '',
    party_size: 2,
    reservation_date: '',
    reservation_time: '',
    special_requests: ''
  });

  // Calculate estimated spend per person based on price range
  const getEstimatedSpendPerPerson = (priceRange: string) => {
    switch(priceRange) {
      case '$': return 150;      // Budget: R100-R200
      case '$$': return 300;     // Moderate: R200-R400
      case '$$$': return 500;    // Upscale: R400-R600
      case '$$$$': return 800;   // Fine Dining: R600-R1000+
      default: return 300;       // Default to moderate
    }
  };

  const pricePerPerson = getEstimatedSpendPerPerson(business.price_range || '$$');
  const estimatedValue = formData.party_size * pricePerPerson;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const preferredChannel = userProfile?.notificationPreference || 'email';
      
      await api.trackReservation({
        business_id: business.id,
        ...formData,
        preferred_channel: preferredChannel
      });
      
      setSubmitted(true);
    } catch (error) {
      alert('Failed to make reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If submitted, show success message
  if (submitted) {
    const preferredMethod = userProfile?.notificationPreference || 'email';
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Reservation Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Your reservation request has been sent to <strong>{business.name}</strong>.
            </p>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-cyan-800">
                📬 You'll receive a confirmation via <strong>{preferredMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}</strong> once the restaurant approves your booking.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Make a Reservation
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
            <p className="font-semibold text-lg">{business.name}</p>
            <p className="text-sm text-gray-600">{business.cuisine_types?.join(', ')}</p>
            <p className="text-xs text-gray-500 mt-1">{business.address}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2 text-cyan-500" />
              Your Name *
            </label>
            <input
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2 text-cyan-500" />
              Email *
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={formData.customer_email}
              onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Phone className="w-4 h-4 inline mr-2 text-cyan-500" />
              Phone *
            </label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={formData.customer_phone}
              onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
              placeholder="+27 82 123 4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Users className="w-4 h-4 inline mr-2 text-cyan-500" />
              Party Size *
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={formData.party_size}
              onChange={(e) => setFormData({...formData, party_size: parseInt(e.target.value)})}
            >
              {[1,2,3,4,5,6,7,8,9,10,12,15,20].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-2 text-cyan-500" />
              Date *
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
              value={formData.reservation_date}
              onChange={(e) => setFormData({...formData, reservation_date: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-2 text-cyan-500" />
              Time *
            </label>
            <input
              type="time"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={formData.reservation_time}
              onChange={(e) => setFormData({...formData, reservation_time: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={3}
              value={formData.special_requests}
              onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
              placeholder="Dietary requirements, seating preferences, special occasions..."
            />
          </div>
          
          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800">
              <strong>Estimated value:</strong> R{estimatedValue.toLocaleString()} 
              <span className="text-xs ml-2">(R{pricePerPerson} avg per person)</span>
            </p>
          </div>
          
          <button
            type="submit" 
            className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Submitting...' : '✓ Confirm Reservation'}
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            You will receive a confirmation email once the restaurant approves your reservation
          </p>
        </form>
      </div>
    </div>
  );
}