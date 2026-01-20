import React, { memo, useState, useEffect } from 'react';
import { ChevronRight, Star, Check } from "lucide-react";
import * as api from '@/utils/api';

interface EventListItemProps {
  day: string;
  month: string;
  title: string;
  venue?: string;
  eventId?: string;
  userId?: string;
  onClick?: () => void;
}

function EventListItemComponent({ day, month, title, venue, eventId, userId, onClick }: EventListItemProps) {
  const [interestStatus, setInterestStatus] = useState<'none' | 'interested' | 'going'>('none');
  const [loading, setLoading] = useState(false);

  // Load saved interest status on mount (without alerts)
  useEffect(() => {
    if (eventId && userId) {
      loadInterestStatus();
    }
  }, [eventId, userId]);

  const loadInterestStatus = async () => {
    if (!eventId || !userId) return;
    
    try {
      const result = await api.checkEventInterest(eventId, userId);
      if (result.interested && result.status) {
        setInterestStatus(result.status as 'interested' | 'going');
        console.log(`✅ Loaded interest status for ${eventId}: ${result.status}`);
      }
    } catch (error) {
      console.error('Failed to load interest status:', error);
    }
  };

  const handleInterestClick = async (e: React.MouseEvent, status: 'interested' | 'going') => {
    e.stopPropagation();
    
    if (!eventId || !userId) {
      alert('Please log in to mark interest in events');
      return;
    }

    setLoading(true);
    
    try {
      if (interestStatus === status) {
        // Remove interest
        await api.removeEventInterest(eventId, userId);
        setInterestStatus('none');
      } else {
        // Mark interest
        await api.markEventInterest(eventId, userId, status);
        setInterestStatus(status);
        
        // Show success feedback
        const message = status === 'going' 
          ? '✅ You\'re going! Check notifications for details.'
          : '⭐ Marked as interested! Check notifications for details.';
        
        // Create a temporary toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
        
        // Trigger event for parent to refresh notifications
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }
    } catch (error) {
      console.error('Failed to update interest:', error);
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg z-50';
      toast.textContent = '❌ Failed to mark interest. Please try again.';
      document.body.appendChild(toast);
      
      setTimeout(() => document.body.removeChild(toast), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors -mx-4 px-4"
    >
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg w-12 h-12 flex-shrink-0">
        <div className="text-lg font-bold leading-none">{day}</div>
        <div className="text-xs uppercase">{month}</div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm mb-0.5">{title}</h4>
        {venue && <p className="text-xs text-gray-500">{venue}</p>}
        
        {/* Interest Buttons */}
        {eventId && userId && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={(e) => handleInterestClick(e, 'interested')}
              disabled={loading}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                interestStatus === 'interested'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star className={`w-3 h-3 ${interestStatus === 'interested' ? 'fill-current' : ''}`} />
              {interestStatus === 'interested' ? 'Interested' : 'Interest'}
            </button>
            <button
              onClick={(e) => handleInterestClick(e, 'going')}
              disabled={loading}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                interestStatus === 'going'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Check className="w-3 h-3" />
              {interestStatus === 'going' ? 'Going' : 'Going'}
            </button>
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const EventListItem = memo(EventListItemComponent);