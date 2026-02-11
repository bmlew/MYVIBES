import React from 'react';

export function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <details className="bg-white p-6 rounded-xl border border-gray-100 group">
          <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
            How do I list my business?
            <span className="transform group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="mt-4 text-gray-600">
            You can sign up as a business partner by clicking "For Business" on our homepage.
          </p>
        </details>
        {/* Add more FAQs as needed */}
      </div>
    </div>
  );
}
