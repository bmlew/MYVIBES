import { MapPin } from 'lucide-react';
import React, { useState, memo } from 'react';
import { OptimizedImage } from './OptimizedImage';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface VenueCardProps {
  image: string;
  name: string;
  logo: string;
  distance?: number; // in kilometers
}

function VenueCardComponent({ image, name, logo, distance }: VenueCardProps) {
  const [logoError, setLogoError] = useState(false);
  
  // Check if logo is a valid URL (including figma:asset, http, https, and data URLs)
  const isValidUrl = logo && 
    logo.trim() !== '' && 
    logo.length > 1 && 
    (logo.startsWith('http://') || 
     logo.startsWith('https://') || 
     logo.startsWith('data:') ||
     logo.startsWith('figma:asset') ||
     logo.startsWith('blob:'));
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      <div className="relative h-24 overflow-hidden">
        <OptimizedImage
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
          width={300}
          height={96}
        />
        {distance !== undefined && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center -mt-1 mb-3">
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-4 border-white overflow-hidden">
          {isValidUrl && !logoError ? (
            <ImageWithFallback
              src={logo} 
              alt={`${name} logo`} 
              className="w-full h-full object-cover" 
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-white text-base leading-none">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </div>
      <h3 className="text-center font-semibold text-sm px-2 pb-3 leading-tight">{name}</h3>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const VenueCard = memo(VenueCardComponent);