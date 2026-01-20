import { X, Phone, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface PhoneModalProps {
  onClose: () => void;
  phoneNumber: string;
  venueName: string;
}

export function PhoneModal({ onClose, phoneNumber, venueName }: PhoneModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Contact {venueName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 mb-1">{phoneNumber}</div>
            <p className="text-sm text-gray-600">Phone Number</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleCall}
              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </Button>

            <Button 
              onClick={handleCopy}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Number
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
