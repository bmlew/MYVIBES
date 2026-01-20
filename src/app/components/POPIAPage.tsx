import { ArrowLeft, Shield, Lock, Eye, UserCheck, Database, FileText, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

interface POPIAPageProps {
  onBack: () => void;
}

export function POPIAPage({ onBack }: POPIAPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              POPIA Compliance
            </h1>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Privacy & Data Protection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            MYVIBES is committed to protecting your personal information in compliance with the Protection of Personal Information Act (POPIA) of South Africa.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: January 16, 2026
          </div>
        </div>

        {/* Quick Overview */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-purple-50 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Our Commitment to You
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>We collect only the information necessary to provide our services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>Your data is never sold to third parties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>You have full control over your personal information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>We use industry-standard security measures to protect your data</span>
            </li>
          </ul>
        </Card>

        {/* Main Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Information We Collect */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Information We Collect
                </h3>
              </div>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1.1 Personal Information (Customers)</h4>
                <p className="mb-2">When you create a customer account, we collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and email address</li>
                  <li>Phone number (optional, for WhatsApp review links)</li>
                  <li>Location data (with your permission, for nearby venue discovery)</li>
                  <li>Profile photo (optional)</li>
                  <li>Dietary preferences and restrictions</li>
                  <li>Favorite venues and saved searches</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1.2 Business Information</h4>
                <p className="mb-2">When you register a business, we collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Business name, address, and contact information</li>
                  <li>Business owner/manager name and email</li>
                  <li>Business registration number (if applicable)</li>
                  <li>Banking details for subscription payments</li>
                  <li>Menu items, photos, and descriptions</li>
                  <li>Business operating hours and categories</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1.3 Usage Data</h4>
                <p className="mb-2">We automatically collect certain information when you use MYVIBES:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information (type, operating system, browser)</li>
                  <li>IP address and general location data</li>
                  <li>Pages visited and features used</li>
                  <li>Search queries and filter preferences</li>
                  <li>Time spent on pages and interaction patterns</li>
                  <li>Reviews and ratings submitted</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Section 2: How We Use Your Information */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  2. How We Use Your Information
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>We use your personal information for the following purposes:</p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2.1 Service Delivery</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Show you nearby restaurants and hotels based on your location</li>
                  <li>Provide personalized AI-powered recommendations</li>
                  <li>Enable you to save favorites and leave reviews</li>
                  <li>Process business subscriptions and payments</li>
                  <li>Allow businesses to manage their profiles, menus, and specials</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2.2 Communication</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Send you important account updates and service notifications</li>
                  <li>Notify you about specials from your favorite venues (if enabled)</li>
                  <li>Respond to your support requests and inquiries</li>
                  <li>Send subscription renewal reminders to businesses</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2.3 Platform Improvement</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Analyze usage patterns to improve our services</li>
                  <li>Train and improve our AI recommendation algorithms</li>
                  <li>Identify and fix technical issues</li>
                  <li>Develop new features based on user behavior</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2.4 Business Analytics</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide businesses with anonymized insights about customer behavior</li>
                  <li>Generate ML Insights reports for subscribed businesses</li>
                  <li>Create aggregated market trends and statistics</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Section 3: Legal Basis for Processing */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Legal Basis for Processing (POPIA Compliance)
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>Under POPIA, we process your personal information based on:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Consent:</strong> You have given explicit consent for us to collect and process your data (e.g., creating an account, enabling location services)</li>
                <li><strong>Contract:</strong> Processing is necessary to fulfill our service agreement with you (e.g., providing the platform, processing subscriptions)</li>
                <li><strong>Legitimate Interest:</strong> We have a legitimate interest in improving our services and preventing fraud</li>
                <li><strong>Legal Obligation:</strong> We may process data to comply with South African legal requirements</li>
              </ul>
            </div>
          </Card>

          {/* Section 4: Data Sharing */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Data Sharing and Disclosure
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="font-semibold text-gray-900">We do NOT sell your personal information to third parties.</p>
              
              <p>We may share your information in the following limited circumstances:</p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4.1 Service Providers</h4>
                <p className="mb-2">We work with trusted third-party service providers who help us operate MYVIBES:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Supabase:</strong> Database and authentication services (data stored in secure cloud infrastructure)</li>
                  <li><strong>Yoco:</strong> Payment processing for business subscriptions</li>
                  <li><strong>Google Maps API:</strong> Geocoding and location services</li>
                  <li><strong>WhatsApp Business API:</strong> Review link delivery (only if you opt-in)</li>
                </ul>
                <p className="mt-2 text-sm">All service providers are contractually obligated to protect your data and may only use it to provide services to MYVIBES.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4.2 Public Information</h4>
                <p>The following information is publicly visible on MYVIBES:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Business profiles (name, address, menus, photos, hours)</li>
                  <li>Customer reviews and ratings (with your chosen display name)</li>
                  <li>Specials and events posted by businesses</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4.3 Legal Requirements</h4>
                <p>We may disclose your information if required by law, court order, or government regulation, or to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Comply with legal processes</li>
                  <li>Protect our rights and property</li>
                  <li>Prevent fraud or illegal activity</li>
                  <li>Protect the safety of our users</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Section 5: Data Security */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Data Security
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>We implement robust security measures to protect your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data transmitted to and from MYVIBES is encrypted using HTTPS/TLS</li>
                <li><strong>Secure Storage:</strong> Personal data is stored in encrypted databases with access controls</li>
                <li><strong>Authentication:</strong> User accounts are protected with secure password hashing and optional two-factor authentication</li>
                <li><strong>Access Controls:</strong> Only authorized personnel have access to personal information, on a need-to-know basis</li>
                <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
                <li><strong>Incident Response:</strong> We have procedures in place to detect, respond to, and notify users of any data breaches</li>
              </ul>
              <p className="mt-4 text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 inline mr-2" />
                While we take extensive measures to protect your data, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your login credentials confidential.
              </p>
            </div>
          </Card>

          {/* Section 6: Your Rights */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Your Rights Under POPIA
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>Under POPIA, you have the following rights regarding your personal information:</p>
              
              <div className="space-y-3">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Right to Access</h4>
                  <p className="text-sm">You can request a copy of all personal information we hold about you.</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Right to Correction</h4>
                  <p className="text-sm">You can request that we correct any inaccurate or incomplete personal information.</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Right to Deletion</h4>
                  <p className="text-sm">You can request deletion of your personal information (subject to legal retention requirements).</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Right to Object</h4>
                  <p className="text-sm">You can object to certain types of processing, such as direct marketing communications.</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Right to Data Portability</h4>
                  <p className="text-sm">You can request your data in a structured, commonly used format to transfer to another service.</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Right to Withdraw Consent</h4>
                  <p className="text-sm">You can withdraw consent for data processing at any time (may affect service availability).</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Right to Complain</h4>
                  <p className="text-sm">You can lodge a complaint with the Information Regulator of South Africa if you believe we've violated your privacy rights.</p>
                </div>
              </div>

              <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2">How to Exercise Your Rights:</p>
                <p className="text-sm mb-2">To exercise any of these rights, please contact our Data Protection Officer:</p>
                <ul className="text-sm space-y-1">
                  <li>Email: <a href="mailto:privacy@myvibe.co.za" className="text-purple-600 hover:underline">privacy@myvibe.co.za</a></li>
                  <li>Address: MYVIBES Data Protection Officer, [Physical Address]</li>
                </ul>
                <p className="text-sm mt-2">We will respond to your request within 30 days as required by POPIA.</p>
              </div>
            </div>
          </Card>

          {/* Section 7: Data Retention */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Data Retention
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>We retain your personal information only as long as necessary:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Active Accounts:</strong> Personal data is retained while your account is active</li>
                <li><strong>Deleted Accounts:</strong> When you delete your account, personal data is removed within 30 days (excluding legal retention requirements)</li>
                <li><strong>Business Records:</strong> Business transaction records may be retained for 7 years for tax and accounting purposes</li>
                <li><strong>Reviews:</strong> Published reviews may remain visible after account deletion (anonymized) to maintain platform integrity</li>
                <li><strong>Analytics Data:</strong> Anonymized usage data may be retained indefinitely for platform improvement</li>
              </ul>
            </div>
          </Card>

          {/* Section 8: Children's Privacy */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Children's Privacy
                </h3>
              </div>
            </div>

            <div className="text-gray-700">
              <p>MYVIBES is not intended for users under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete such information immediately. If you believe a child has provided us with personal information, please contact us at <a href="mailto:privacy@myvibes.co.za" className="text-purple-600 hover:underline">privacy@myvibes.co.za</a>.</p>
            </div>
          </Card>

          {/* Section 9: International Data Transfers */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  9. International Data Transfers
                </h3>
              </div>
            </div>

            <div className="text-gray-700">
              <p className="mb-4">MYVIBES primarily operates in South Africa. However, some of our service providers may store or process data outside of South Africa. When we transfer data internationally, we ensure:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The recipient country has adequate data protection laws recognized by South African authorities</li>
                <li>Appropriate contractual safeguards are in place (e.g., Standard Contractual Clauses)</li>
                <li>Data is encrypted during transfer and at rest</li>
                <li>Service providers comply with POPIA-equivalent standards</li>
              </ul>
            </div>
          </Card>

          {/* Section 10: Cookies and Tracking */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Cookies and Tracking Technologies
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>MYVIBES uses cookies and similar tracking technologies to enhance your experience:</p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
                <p className="text-sm">Required for the platform to function (e.g., authentication, session management). These cannot be disabled.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Functional Cookies</h4>
                <p className="text-sm">Remember your preferences (e.g., location settings, saved favorites). You can disable these in your browser settings.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                <p className="text-sm">Help us understand how users interact with MYVIBES to improve our services. Data is anonymized where possible.</p>
              </div>
              
              <p className="text-sm mt-4">You can control cookie settings in your browser. Note that disabling certain cookies may limit platform functionality.</p>
            </div>
          </Card>

          {/* Section 11: Changes to This Policy */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Changes to This Policy
                </h3>
              </div>
            </div>

            <div className="text-gray-700">
              <p>We may update this POPIA Compliance Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Notify you via email (if you have an account)</li>
                <li>Display a prominent notice on the platform</li>
                <li>Update the "Last updated" date at the top of this policy</li>
              </ul>
              <p className="mt-4">We encourage you to review this policy periodically. Your continued use of MYVIBES after changes constitutes acceptance of the updated policy.</p>
            </div>
          </Card>

          {/* Contact Section */}
          <Card className="p-6 bg-gradient-to-r from-orange-500 to-purple-600 text-white">
            <div className="flex items-start gap-4 mb-4">
              <Mail className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">
                  Contact Our Data Protection Officer
                </h3>
                <p className="mb-4 text-white/90">
                  If you have questions, concerns, or requests regarding your personal information or this POPIA Compliance Policy:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> <a href="mailto:privacy@myvibe.co.za" className="underline hover:text-white/80">privacy@myvibe.co.za</a></p>
                  <p><strong>Phone:</strong> +27 123 456 789</p>
                  <p><strong>Postal Address:</strong><br />MYVIBES Data Protection Officer<br />[Physical Address]<br />South Africa</p>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm text-white/90 mb-2">
                    <strong>Information Regulator (South Africa):</strong>
                  </p>
                  <p className="text-sm text-white/80">
                    If you believe we have not adequately addressed your privacy concerns, you may lodge a complaint with:
                  </p>
                  <p className="text-sm mt-2">
                    The Information Regulator<br />
                    Email: <a href="mailto:inforeg@justice.gov.za" className="underline">inforeg@justice.gov.za</a><br />
                    Website: <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer" className="underline">www.justice.gov.za/inforeg</a>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}