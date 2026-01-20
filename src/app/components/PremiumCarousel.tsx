import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface Business {
  id: string;
  name: string;
  logo_url?: string;
  city: string;
}

interface PremiumItem {
  id: string;
  business_id: string;
  title: string;
  description: string;
  image_url?: string;
  type: 'special' | 'event';
  business?: Business;
  // Special-specific fields
  discount_percentage?: number;
  time_end?: string;
  days_of_week?: number[];
  // Event-specific fields
  event_date?: string;
  start_time?: string;
}

interface PremiumCarouselProps {
  items: PremiumItem[];
  onItemClick?: (item: PremiumItem) => void;
  autoRotateInterval?: number; // in milliseconds, default 15000 (15 seconds)
}

export const PremiumCarousel: React.FC<PremiumCarouselProps> = ({ 
  items, 
  onItemClick,
  autoRotateInterval = 15000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    if (items.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }
  }, [items.length]);

  const goToPrevious = useCallback(() => {
    if (items.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-rotate effect
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const intervalId = setInterval(() => {
      goToNext();
    }, autoRotateInterval);

    return () => clearInterval(intervalId);
  }, [items.length, isPaused, goToNext, autoRotateInterval]);

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysOfWeekText = (days?: number[]) => {
    if (!days || days.length === 0) return null;
    if (days.length === 7) return 'Every day';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => dayNames[d]).join(', ');
  };

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl shadow-lg cursor-pointer"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onItemClick && onItemClick(currentItem)}
    >
      {/* Main Carousel Content */}
      <div className="relative h-48 md:h-56 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600">
        {/* Background Image with Overlay */}
        {currentItem.image_url && (
          <div className="absolute inset-0">
            <ImageWithFallback
              src={currentItem.image_url}
              alt={currentItem.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/90 via-blue-500/90 to-blue-600/90" />
          </div>
        )}

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between text-white">
          {/* Premium Badge */}
          <div className="flex items-start justify-between">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Premium Feature</span>
            </div>
            
            {/* Type Badge */}
            <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
              {currentItem.type === 'special' ? 'Special Offer' : 'Event'}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-lg">
              {currentItem.title}
            </h3>
            
            {currentItem.description && (
              <p className="text-sm md:text-base opacity-95 line-clamp-2 drop-shadow">
                {currentItem.description}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
              {/* Business Name with Logo */}
              {currentItem.business && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                  {currentItem.business.logo_url && (
                    <ImageWithFallback
                      src={currentItem.business.logo_url}
                      alt={currentItem.business.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  <span className="font-semibold">{currentItem.business.name}</span>
                </div>
              )}

              {/* Location */}
              {currentItem.business?.city && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <MapPin className="w-3 h-3" />
                  <span>{currentItem.business.city}</span>
                </div>
              )}

              {/* Special-specific: Discount */}
              {currentItem.type === 'special' && currentItem.discount_percentage && (
                <div className="bg-green-500/90 px-2 py-1 rounded-lg font-bold">
                  {currentItem.discount_percentage}% OFF
                </div>
              )}

              {/* Special-specific: Days of Week */}
              {currentItem.type === 'special' && currentItem.days_of_week && currentItem.days_of_week.length > 0 && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Calendar className="w-3 h-3" />
                  <span>{getDaysOfWeekText(currentItem.days_of_week)}</span>
                </div>
              )}

              {/* Special-specific: End Time */}
              {currentItem.type === 'special' && currentItem.time_end && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Clock className="w-3 h-3" />
                  <span>Until {currentItem.time_end}</span>
                </div>
              )}

              {/* Event-specific: Date & Time */}
              {currentItem.type === 'event' && currentItem.event_date && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Calendar className="w-3 h-3" />
                  <span>{formatEventDate(currentItem.event_date)}</span>
                </div>
              )}

              {currentItem.type === 'event' && currentItem.start_time && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Clock className="w-3 h-3" />
                  <span>{currentItem.start_time}</span>
                </div>
              )}
            </div>

            {/* Visual Click Indicator */}
            <div className="flex items-center gap-2 text-sm font-semibold mt-2">
              <span className="opacity-90">Tap to view details</span>
              <span className="text-lg">→</span>
            </div>
          </div>
        </div>

        {/* Navigation Arrows (only show if more than 1 item) */}
        {items.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-2 rounded-full transition-all z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-2 rounded-full transition-all z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator (only show if more than 1 item) */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};