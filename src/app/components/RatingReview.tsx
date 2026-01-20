import { useState, useEffect, useRef } from 'react';
import { Star, ThumbsUp, Flag, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import * as api from '@/utils/api';

interface Review {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  images?: string[];
  source?: string;
  business_reply?: string;
  business_reply_date?: string;
}

interface RatingReviewProps {
  businessId: string;
}

export function RatingReview({ 
  businessId, 
}: RatingReviewProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await api.getReviews(businessId);
        setReviews(response.reviews);
        setAverageRating(response.averageRating);
        setTotalReviews(response.totalReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [businessId]);

  useEffect(() => {
    if (showReviewForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showReviewForm]);

  const handleSubmitReview = async () => {
    if (userRating > 0 && comment.trim()) {
      try {
        console.log('📝 Submitting review:', { businessId, userRating, comment });
        const result = await api.submitReview(businessId, userRating, comment);
        console.log('✅ Review submitted successfully:', result);
        
        setUserRating(0);
        setComment('');
        setShowReviewForm(false);
        
        // Refresh reviews
        setLoading(true);
        try {
          const response = await api.getReviews(businessId);
          setReviews(response.reviews);
          setAverageRating(response.averageRating);
          setTotalReviews(response.totalReviews);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
      }
    } else {
      console.warn('⚠️ Cannot submit review - missing rating or comment');
      if (userRating === 0) {
        alert('Please select a rating');
      } else if (!comment.trim()) {
        alert('Please write a comment');
      }
    }
  };

  const handleReportReview = (review: Review) => {
    const subject = encodeURIComponent(`Review Report - ${review.user_name}`);
    const body = encodeURIComponent(
      `I would like to report the following review:\n\n` +
      `Reviewer: ${review.user_name}\n` +
      `Rating: ${review.rating} stars\n` +
      `Date: ${new Date(review.created_at).toLocaleDateString('en-ZA')}\n` +
      `Comment: ${review.comment}\n\n` +
      `Reason for reporting:\n` +
      `[Please describe why you are reporting this review]\n\n` +
      `Business ID: ${businessId}\n` +
      `Review ID: ${review.id}`
    );
    
    window.location.href = `mailto:vibespotowner@get-digital.co.za?subject=${subject}&body=${body}`;
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = interactive 
        ? (hoverRating || userRating) >= starValue
        : rating >= starValue;
      
      return (
        <Star
          key={index}
          className={`w-6 h-6 ${ // Made slightly larger for better clickability
            isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer transition-all hover:scale-110' : ''}`}
          onClick={() => {
            if (interactive) {
              setUserRating(starValue);
            }
          }}
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      );
    });
  };

  const ratingDistribution = [
    { stars: 5, count: 180, percentage: 73 },
    { stars: 4, count: 45, percentage: 18 },
    { stars: 3, count: 12, percentage: 5 },
    { stars: 2, count: 5, percentage: 2 },
    { stars: 1, count: 3, percentage: 2 },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Overall Rating Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl font-bold">{averageRating}</span>
              <div className="flex">{renderStars(averageRating)}</div>
            </div>
            <p className="text-sm text-gray-600">{totalReviews} reviews</p>
          </div>
          
          <Button 
            onClick={() => {
              setShowReviewForm(!showReviewForm);
            }}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
            type="button"
          >
            {showReviewForm ? 'Close Review Form' : 'Write Review'}
          </Button>
        </div>

        {/* Rating Distribution */}
        <div className="mt-6 space-y-2">
          {ratingDistribution.map((dist) => (
            <div key={dist.stars} className="flex items-center gap-3">
              <span className="text-sm w-8">{dist.stars}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${dist.percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{dist.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm" ref={formRef}>
          <h3 className="font-bold text-lg mb-4">Write Your Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <div className="flex gap-1 items-center">
              {renderStars(userRating, true)}
              {userRating > 0 && (
                <span className="ml-2 text-sm text-gray-600">({userRating} star{userRating !== 1 ? 's' : ''})</span>
              )}
            </div>
            {userRating === 0 && (
              <p className="text-xs text-orange-600 mt-1">Please select a rating to continue</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="w-full"
            />
            {userRating > 0 && !comment.trim() && (
              <p className="text-xs text-orange-600 mt-1">Please write a review to continue</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSubmitReview}
              className="bg-[#3B5166] hover:bg-[#2d3f4f] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={userRating === 0 || !comment.trim()}
            >
              Submit Review
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowReviewForm(false);
                setUserRating(0);
                setComment('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Customer Reviews</h3>
        
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-[#3B5166] text-white">
                      {review.user_name.split(' ').filter(n => n).slice(0, 2).reduce((acc, n) => acc + n[0], '')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{review.user_name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('en-ZA', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <button className="flex items-center gap-1 hover:text-[#3B5166]">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful ({review.helpful_count})</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-[#3B5166]" onClick={() => handleReportReview(review)}>
                        <Flag className="w-4 h-4" />
                        <span>Report</span>
                      </button>
                    </div>

                    {/* Business Reply */}
                    {review.business_reply && (
                      <div className="mt-4 ml-4 pl-4 border-l-2 border-orange-500 bg-orange-50 p-3 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">R</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">Response from Restaurant</p>
                            {review.business_reply_date && (
                              <p className="text-xs text-gray-500">
                                {new Date(review.business_reply_date).toLocaleDateString('en-ZA', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{review.business_reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}