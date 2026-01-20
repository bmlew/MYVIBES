import React, { useState } from 'react';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { Plus, X } from 'lucide-react';

interface BusinessProfileSettingsProps {
  cuisineTypes: string[];
  ageGroups: string[]; // Changed to array for multiple selection
  onCuisineTypesChange: (cuisines: string[]) => void;
  onAgeGroupsChange: (ageGroups: string[]) => void; // Changed to array
}

export function BusinessProfileSettings({ 
  cuisineTypes, 
  ageGroups, 
  onCuisineTypesChange, 
  onAgeGroupsChange 
}: BusinessProfileSettingsProps) {
  
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCuisine, setCustomCuisine] = useState('');

  // Ensure arrays are never undefined
  const safeAgeGroups = ageGroups || [];
  const safeCuisineTypes = cuisineTypes || [];

  const predefinedCuisines = [
    'Italian', 'Seafood', 'Steakhouse', 'Asian', 'Mexican', 
    'African', 'Chinese', 'Japanese', 'Indian', 'French',
    'Fast Food', 'BBQ', 'Vegetarian', 'Mediterranean', 'Thai'
  ];

  const ageGroupOptions = [
    { 
      value: 'all-ages', 
      icon: '👨‍👩‍👧‍👦', 
      label: 'All Ages Welcome', 
      desc: 'Family friendly environment' 
    },
    { 
      value: 'family-with-pets', 
      icon: '🐕', 
      label: 'Family + Pets', 
      desc: 'Dog friendly establishment' 
    },
    { 
      value: 'adults-18+', 
      icon: '🔞', 
      label: 'Adults 18+', 
      desc: 'Adult environment only' 
    },
    { 
      value: 'adults-21+', 
      icon: '🍸', 
      label: 'Adults 21+', 
      desc: 'Bar / Lounge atmosphere' 
    },
    { 
      value: 'events-held', 
      icon: '🎉', 
      label: 'Events Held', 
      desc: 'Venue for private events & functions' 
    }
  ];

  const toggleCuisine = (cuisine: string) => {
    const updated = safeCuisineTypes.includes(cuisine)
      ? safeCuisineTypes.filter(c => c !== cuisine)
      : [...safeCuisineTypes, cuisine];
    onCuisineTypesChange(updated);
  };

  const toggleAgeGroup = (ageGroup: string) => {
    const updated = safeAgeGroups.includes(ageGroup)
      ? safeAgeGroups.filter(ag => ag !== ageGroup)
      : [...safeAgeGroups, ageGroup];
    onAgeGroupsChange(updated);
  };

  const addCustomCuisine = () => {
    if (customCuisine.trim() && !safeCuisineTypes.includes(customCuisine.trim())) {
      onCuisineTypesChange([...safeCuisineTypes, customCuisine.trim()]);
      setCustomCuisine('');
      setShowCustomInput(false);
    }
  };

  const removeCustomCuisine = (cuisine: string) => {
    onCuisineTypesChange(safeCuisineTypes.filter(c => c !== cuisine));
  };

  // Separate predefined and custom cuisines
  const selectedPredefined = safeCuisineTypes.filter(c => predefinedCuisines.includes(c));
  const customCuisines = safeCuisineTypes.filter(c => !predefinedCuisines.includes(c));

  return (
    <div className="space-y-6">
      {/* Cuisine Types Section */}
      <Card className="p-6 border-2 border-cyan-200 bg-gradient-to-br from-white to-cyan-50">
        <div className="mb-4">
          <Label className="text-lg font-bold text-gray-900 mb-2 block">
            🍽️ Cuisine Types
          </Label>
          <p className="text-sm text-gray-600">
            Select all cuisine types that describe your menu. You can also add custom cuisines!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {predefinedCuisines.map((cuisine) => {
            const isSelected = safeCuisineTypes.includes(cuisine);
            return (
              <button
                key={cuisine}
                type="button"
                onClick={() => toggleCuisine(cuisine)}
                className={`
                  px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all
                  ${isSelected 
                    ? 'border-cyan-600 bg-cyan-600 text-white shadow-md transform scale-105' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-cyan-400 hover:bg-cyan-50'
                  }
                `}
              >
                {isSelected && '✓ '}
                {cuisine}
              </button>
            );
          })}
        </div>

        {/* Add Custom Cuisine */}
        <div className="mt-4">
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-700 bg-white border-2 border-dashed border-cyan-400 rounded-lg hover:bg-cyan-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Custom Cuisine
            </button>
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g., Fusion, Halaal, Vegan..."
                value={customCuisine}
                onChange={(e) => setCustomCuisine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomCuisine();
                  }
                }}
                className="flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={addCustomCuisine}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomCuisine('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Display Custom Cuisines */}
        {customCuisines.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Custom Cuisines:</p>
            <div className="flex flex-wrap gap-2">
              {customCuisines.map((cuisine) => (
                <div
                  key={cuisine}
                  className="flex items-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium"
                >
                  {cuisine}
                  <button
                    type="button"
                    onClick={() => removeCustomCuisine(cuisine)}
                    className="hover:bg-cyan-700 rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Summary */}
        {safeCuisineTypes.length > 0 && (
          <div className="mt-4 p-3 bg-cyan-100 border border-cyan-300 rounded-lg">
            <p className="text-sm font-semibold text-cyan-900">
              Selected ({safeCuisineTypes.length}): {safeCuisineTypes.join(', ')}
            </p>
          </div>
        )}
      </Card>

      {/* Age Group / Atmosphere Section - MULTI-SELECT */}
      <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
        <div className="mb-4">
          <Label className="text-lg font-bold text-gray-900 mb-2 block">
            🎯 Age Group / Atmosphere
          </Label>
          <p className="text-sm text-gray-600">
            Select all options that describe your establishment. You can choose multiple!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ageGroupOptions.map((option) => {
            const isSelected = safeAgeGroups.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleAgeGroup(option.value)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all
                  ${isSelected
                    ? 'border-cyan-600 bg-cyan-50 shadow-lg transform scale-105'
                    : 'border-gray-300 bg-white hover:border-cyan-400 hover:bg-cyan-50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{option.icon}</div>
                  <div className="flex-1">
                    <div className={`font-bold text-base mb-1 ${
                      isSelected ? 'text-cyan-700' : 'text-gray-900'
                    }`}>
                      {option.label}
                      {isSelected && ' ✓'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.desc}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {safeAgeGroups.length > 0 && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">
              Selected ({safeAgeGroups.length}): {safeAgeGroups.map(ag => 
                ageGroupOptions.find(o => o.value === ag)?.label || ag
              ).join(', ')}
            </p>
          </div>
        )}
      </Card>

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>💡 Tip:</strong> These settings appear as badges on your venue profile and help customers 
          filter and find the perfect spot for their needs. Make sure to click <strong>"Save Settings"</strong> at the bottom 
          of the page to save your changes!
        </p>
      </div>
    </div>
  );
}

export default BusinessProfileSettings;