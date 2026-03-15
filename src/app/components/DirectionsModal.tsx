import { X, Navigation, MapPin, Car, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface DirectionsModalProps {
  onClose: () => void;
  venueName: string;
  address: string;
}

export function DirectionsModal({ onClose, venueName, address }: DirectionsModalProps) {
  const openGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const openWaze = () => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://waze.com/ul?q=${encodedAddress}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Get Directions</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">{venueName}</h3>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Car className="w-3 h-3" />
                <span>2.5 km</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>8 min drive</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={openGoogleMaps}
              className="w-full bg-[#3B5166] hover:bg-[#2d3f4f] flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Open in Google Maps
            </Button>

            <Button 
              onClick={openWaze}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Open in Waze
            </Button>

            <Button 
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-3 text-xs text-blue-900">
            💡 <strong>Tip:</strong> Call ahead to confirm parking availability
          </div>
        </div>
      </div>
    </div>
  );
}

export default DirectionsModal;
