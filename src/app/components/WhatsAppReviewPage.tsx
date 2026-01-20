import { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { publicAnonKey, projectId } from '/utils/supabase/info';

interface Business {
  id: string;
  name: string;
  logo_url?: string;
  cover_image_url?: string;
}

interface WhatsAppReviewPageProps {
  businessId: string;
  customerName?: string;
  customerPhone?: string;
}

export function WhatsAppReviewPage({ businessId, customerName, customerPhone }: WhatsAppReviewPageProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState(customerName || '');
  const [phone, setPhone] = useState(customerPhone || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      // Validate business ID before making API call
      if (!businessId || businessId.match(/^business-[1-9]\d{0,2}$/)) {
        console.error(`❌ Invalid business ID: ${businessId}`);
        setError(`Business not found. The link you followed may be invalid.`);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/businesses/${businessId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Business not found');
        }
        
        const data = await response.json();
        setBusiness(data.business);
      } catch (err) {
        console.error('Error fetching business:', err);
        setError('Unable to load business information. The link you followed may be invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  const handleSubmit = async () => {
    if (!userRating || !comment.trim() || !name.trim()) {
      setError('Please provide a rating, comment, and your name');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            business_id: businessId,
            user_name: name,
            rating: userRating,
            comment,
            user_phone: phone || null
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = (hoverRating || userRating) >= starValue;
      
      return (
        <Star
          key={index}
          className={`w-10 h-10 ${
            isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          } cursor-pointer transition-all hover:scale-110`}
          onClick={() => setUserRating(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your review has been submitted successfully. We appreciate your feedback!
          </p>
          {business && (
            <div className="flex items-center justify-center gap-3 mb-6">
              {business.logo_url && (
                <img 
                  src={business.logo_url} 
                  alt={business.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <p className="text-lg font-semibold">{business.name}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            You can close this window now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Header with business info */}
        {business && (
          <div className="relative h-32 bg-gradient-to-r from-orange-500 to-purple-600">
            {business.cover_image_url && (
              <img 
                src={business.cover_image_url} 
                alt={business.name}
                className="w-full h-full object-cover opacity-50"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                {business.logo_url && (
                  <img 
                    src={business.logo_url} 
                    alt={business.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-4 border-white shadow-lg"
                  />
                )}
                <h1 className="text-2xl font-bold">{business.name}</h1>
              </div>
            </div>
          </div>
        )}

        {/* Review form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Share Your Experience</h2>
          <p className="text-gray-600 text-center mb-6">
            We'd love to hear about your visit!
          </p>

          <div className="space-y-6">
            {/* Name input */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>

            {/* Phone input (optional) */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +27 82 123 4567"
                className="w-full"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-3 text-center">
                Rate Your Experience *
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {renderStars()}
              </div>
              {userRating > 0 && (
                <p className="text-center text-sm text-gray-600">
                  {userRating === 5 && '⭐ Excellent!'}
                  {userRating === 4 && '👍 Great!'}
                  {userRating === 3 && '😊 Good'}
                  {userRating === 2 && '😐 Fair'}
                  {userRating === 1 && '😞 Poor'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Review *</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience... What did you enjoy? Any suggestions?"
                rows={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !userRating || !comment.trim() || !name.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white py-6 text-lg font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}