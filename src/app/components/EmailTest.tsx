import { useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function EmailTest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testEmail = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing email send to:', email);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/test-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ to: email }),
        }
      );

      const data = await response.json();
      console.log('🧪 Test response:', data);
      
      setResult(data);

      if (response.ok) {
        alert('Test email sent! Check your inbox and the browser console for details.');
      } else {
        alert(`Test failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('🧪 Test error:', error);
      setResult({ error: error.message });
      alert(`Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md">
      <h3 className="text-xl font-bold mb-4">Email Configuration Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test the SMTP2GO email integration by sending a test email.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={testEmail}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm font-medium mb-2">Result:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm font-medium text-yellow-900 mb-2">📋 Check Browser Console</p>
        <p className="text-xs text-yellow-800">
          Open the browser console (F12) to see detailed logs including:
        </p>
        <ul className="text-xs text-yellow-800 mt-2 ml-4 list-disc">
          <li>Email preparation data</li>
          <li>SMTP2GO API request/response</li>
          <li>Any error messages or stack traces</li>
        </ul>
      </div>
    </div>
  );
}
