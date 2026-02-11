import { Calendar, MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface EventListItemProps {
  day: string;
  month: string;
  title: string;
  venue: string;
  eventId?: string;
  userId?: string;
  onClick?: () => void;
}

export function EventListItem({ 
  day, 
  month, 
  title, 
  venue, 
  eventId, 
  userId, 
  onClick 
}: EventListItemProps) {
  const [isInterested, setIsInterested] = useState(false);

  return (
    <div 
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Date Badge */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-lg w-12 h-12 flex-shrink-0 shadow-sm">
        <span className="text-lg font-bold leading-none">{day}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide">{month}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{title}</h4>
        <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{venue}</span>
        </div>
      </div>

      {/* Action */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full transition-colors",
          isInterested ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsInterested(!isInterested);
        }}
      >
        <Heart className={cn("w-4 h-4", isInterested && "fill-current")} />
      </Button>
    </div>
  );
}