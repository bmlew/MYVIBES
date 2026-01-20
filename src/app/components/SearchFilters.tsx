import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { useState } from 'react';

interface SearchFiltersProps {
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  cuisines: string[];
  priceRange: number[];
  distance: number;
  eventTypes: string[];
  openNow: boolean;
}

export function SearchFilters({ onClose, onApply }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    cuisines: [],
    priceRange: [0, 500],
    distance: 5,
    eventTypes: [],
    openNow: false,
  });

  const cuisineOptions = ['Italian', 'Sushi', 'Burgers', 'Steakhouse', 'Seafood', 'Vegetarian', 'Indian', 'Chinese'];
  const eventTypeOptions = ['Live Music', 'Wine Tasting', 'Happy Hour', 'Brunch', 'Themed Nights'];

  const toggleCuisine = (cuisine: string) => {
    setFilters(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  };

  const toggleEventType = (event: string) => {
    setFilters(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(event)
        ? prev.eventTypes.filter(e => e !== event)
        : [...prev.eventTypes, event]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      cuisines: [],
      priceRange: [0, 500],
      distance: 5,
      eventTypes: [],
      openNow: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Open Now Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Open Now</Label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={filters.openNow}
                onChange={(e) => setFilters({...filters, openNow: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B5166]"></div>
            </label>
          </div>

          {/* Distance */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
            <Label className="text-sm font-semibold mb-3 block flex items-center justify-between">
              <span className="text-gray-900">Distance Radius</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {filters.distance} km
              </span>
            </Label>
            <Slider 
              value={[filters.distance]}
              onValueChange={(val) => setFilters({...filters, distance: val[0]})}
              min={1}
              max={20}
              step={1}
              className="w-full mb-3"
            />
            <div className="flex justify-between text-xs text-gray-600 font-medium">
              <span>📍 1 km (Nearby)</span>
              <span>🌍 20 km (Wide area)</span>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">
              Price Range: R{filters.priceRange[0]} - R{filters.priceRange[1]}
            </Label>
            <Slider 
              value={filters.priceRange}
              onValueChange={(val) => setFilters({...filters, priceRange: val})}
              min={0}
              max={1000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>R0</span>
              <span>R1000+</span>
            </div>
          </div>

          {/* Cuisine Type */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Cuisine Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {cuisineOptions.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    filters.cuisines.includes(cuisine)
                      ? 'bg-[#3B5166] text-white border-[#3B5166]'
                      : 'bg-white border-gray-200 hover:border-[#3B5166]'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Event Types */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Event Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypeOptions.map(event => (
                <button
                  key={event}
                  onClick={() => toggleEventType(event)}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    filters.eventTypes.includes(event)
                      ? 'bg-[#3B5166] text-white border-[#3B5166]'
                      : 'bg-white border-gray-200 hover:border-[#3B5166]'
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 space-y-2">
          <Button 
            onClick={handleApply}
            className="w-full bg-[#3B5166] hover:bg-[#2d3f4f]"
          >
            Apply Filters
          </Button>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="w-full"
          >
            Reset All
          </Button>
        </div>
      </div>
    </div>
  );
}