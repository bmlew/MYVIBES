import { Clock, MapPin } from 'lucide-react';
import React, { memo } from 'react';
import { OptimizedImage } from './OptimizedImage';

interface SpecialCardProps {
  image: string;
  title: string;
  venue: string;
  endTime?: string;
  badge?: string;
  distance?: number; // in kilometers
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function SpecialCardComponent({ image, title, venue, endTime, badge, distance, daysOfWeek }: SpecialCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      <div className="relative h-32 overflow-hidden">
        <OptimizedImage
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
          width={300}
          height={128}
        />
        {badge && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-xs px-2 py-1 rounded font-semibold">
            {badge}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-500 mb-2">{venue}</p>
        {daysOfWeek && daysOfWeek.length > 0 && (
          <div className="flex gap-0.5 mb-2">
            {DAY_LABELS.map((day, idx) => (
              <div 
                key={idx}
                className={`w-5 h-5 flex items-center justify-center rounded text-xs font-semibold ${
                  daysOfWeek.includes(idx)
                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          {endTime && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>Ends {endTime}</span>
            </div>
          )}
          {distance !== undefined && (
            <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
              <MapPin className="w-3 h-3" />
              <span>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const SpecialCard = memo(SpecialCardComponent);