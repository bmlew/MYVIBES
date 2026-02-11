import React from 'react';

export function WhatsAppReviewPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Leave a Review</h1>
        <p className="text-gray-500 mb-6">Scan the QR code or click the button below to leave a review via WhatsApp.</p>
        <button className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors">
          Open WhatsApp
        </button>
      </div>
    </div>
  );
}
