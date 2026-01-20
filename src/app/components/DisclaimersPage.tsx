import { ArrowLeft, Shield, AlertTriangle, FileText, Scale, Lock, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { SUBSCRIPTION_CONFIG } from '@/config/subscription';

interface DisclaimersPageProps {
  onBack: () => void;
}

export function DisclaimersPage({ onBack }: DisclaimersPageProps) {
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
              Terms & Disclaimers
            </h1>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Terms of Service & Disclaimers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Important legal information about using the VIBESPOT platform
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: January 16, 2026
          </div>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 p-6 bg-yellow-50 border-2 border-yellow-300">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Please Read Carefully
              </h3>
              <p className="text-gray-700">
                By accessing or using VIBESPOT, you agree to be bound by these Terms of Service and all applicable disclaimers. If you do not agree with any part of these terms, you must not use our platform.
              </p>
            </div>
          </div>
        </Card>

        {/* Main Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Acceptance of Terms */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Acceptance of Terms
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>These Terms of Service ("Terms") constitute a legally binding agreement between you and VIBESPOT (Pty) Ltd ("VIBESPOT", "we", "us", or "our") regarding your use of the VIBESPOT platform, website, mobile application, and related services (collectively, the "Service").</p>
              
              <p>By creating an account, accessing the platform, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our POPIA Compliance Policy and all other policies referenced herein.</p>
              
              <p className="font-semibold">You must be at least 18 years old to use VIBESPOT. By using our Service, you represent and warrant that you are of legal age.</p>
            </div>
          </Card>

          {/* Section 2: Service Description */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Service Description
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>VIBESPOT is a platform that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Connects restaurants and hotels with customers</li>
                <li>Allows businesses to upload menus, post specials, and advertise events</li>
                <li>Enables users to discover nearby dining and entertainment options</li>
                <li>Provides AI-powered recommendations and business analytics</li>
                <li>Facilitates customer reviews and ratings</li>
              </ul>
              
              <p className="font-semibold mt-4">VIBESPOT is an information and marketing platform. We are not a restaurant, hotel, food delivery service, booking agent, or payment processor for venues. We facilitate connections between businesses and customers but do not control the quality, safety, legality, or availability of venues, menu items, or services advertised on our platform.</p>
            </div>
          </Card>

          {/* Section 3: User Accounts */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  3. User Accounts and Responsibilities
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3.1 Account Creation</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You must notify us immediately of any unauthorized access or security breach</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3.2 Account Types</h4>
                <p className="mb-2"><strong>Customer Accounts:</strong> Free accounts for discovering venues and leaving reviews</p>
                <p><strong>Business Accounts:</strong> Subscription-based accounts ({SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED}/month) for restaurants and hotels to manage their presence on VIBESPOT</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3.3 Prohibited Conduct</h4>
                <p className="mb-2">You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violate any laws or regulations</li>
                  <li>Impersonate any person or entity</li>
                  <li>Post false, misleading, or fraudulent content</li>
                  <li>Submit fake reviews or manipulate ratings</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Upload malicious code or viruses</li>
                  <li>Scrape, data mine, or use automated tools without permission</li>
                  <li>Interfere with the proper functioning of the platform</li>
                  <li>Violate intellectual property rights</li>
                  <li>Use the platform for spam or unauthorized advertising</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Section 4: Content and Intellectual Property */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Content and Intellectual Property
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4.1 User-Generated Content</h4>
                <p className="mb-2">By posting content on VIBESPOT (reviews, photos, menu items, etc.), you:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Grant VIBESPOT a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content</li>
                  <li>Represent that you own or have rights to the content</li>
                  <li>Agree that your content may remain visible even after account deletion (in anonymized form)</li>
                  <li>Acknowledge that we may remove any content that violates these Terms</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4.2 VIBESPOT Intellectual Property</h4>
                <p>All platform design, logos, trademarks, code, algorithms, and proprietary technology are owned by VIBESPOT. You may not copy, modify, distribute, or create derivative works without written permission.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">4.3 Third-Party Content</h4>
                <p>Menu items, business descriptions, photos, and other venue information are provided by businesses. VIBESPOT does not verify the accuracy of this content and is not responsible for errors, omissions, or misrepresentations.</p>
              </div>
            </div>
          </Card>

          {/* Section 5: Business Subscriptions */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Business Subscriptions and Payments
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5.1 Subscription Terms</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Pricing:</strong> {SUBSCRIPTION_CONFIG.MONTHLY_PRICE_FORMATTED} per month per establishment</li>
                  <li><strong>ML Insights Add-on:</strong> {SUBSCRIPTION_CONFIG.ML_INSIGHTS_PRICE_FORMATTED} per month (optional)</li>
                  <li><strong>Billing:</strong> Subscriptions are billed monthly in advance</li>
                  <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled</li>
                  <li><strong>Free Trial:</strong> 14 days (new businesses only, no credit card required)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5.2 Payment Terms</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All prices are in South African Rand (ZAR) and include applicable VAT</li>
                  <li>Payments are processed through Yoco (our secure payment provider)</li>
                  <li>You authorize us to charge your payment method on file</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5.3 Cancellation and Refunds</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You may cancel your subscription at any time from your dashboard</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>No refunds for partial months or unused subscription time</li>
                  <li>We reserve the right to suspend or terminate accounts for Terms violations</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">5.4 Price Changes</h4>
                <p>VIBESPOT reserves the right to modify subscription prices. Existing subscribers will be notified at least 30 days before price changes take effect. Continued use after price changes constitutes acceptance.</p>
              </div>
            </div>
          </Card>

          {/* Section 6: Reviews and Ratings */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Reviews and Ratings Disclaimer
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="font-semibold">Customer reviews and ratings on VIBESPOT represent the subjective opinions of individual users and do not reflect the views of VIBESPOT.</p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">6.1 Review Guidelines</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Reviews must be based on genuine personal experiences</li>
                  <li>Reviews must not contain false, defamatory, or offensive content</li>
                  <li>Reviews must not include personal information about staff or other customers</li>
                  <li>Businesses may not post fake reviews or incentivize positive reviews</li>
                  <li>VIBESPOT reserves the right to remove reviews that violate guidelines</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">6.2 No Verification</h4>
                <p>VIBESPOT does not verify that reviewers have actually visited the venues they review. While we have measures to detect fraudulent reviews, we cannot guarantee the authenticity or accuracy of all reviews.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">6.3 Business Responses</h4>
                <p>Businesses may respond to reviews. Responses represent the business's perspective and do not constitute endorsement by VIBESPOT.</p>
              </div>
            </div>
          </Card>

          {/* Section 7: Disclaimers of Warranties */}
          <Card className="p-6 border-2 border-red-300 bg-red-50">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  7. DISCLAIMERS OF WARRANTIES
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="font-semibold uppercase text-red-900">
                VIBESPOT IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
              
              <div className="space-y-3">
                <p><strong>We specifically disclaim:</strong></p>
                
                <div className="border-l-4 border-red-500 pl-4 space-y-2">
                  <p><strong>Accuracy:</strong> We do not warrant that venue information, menus, prices, hours, or availability are accurate, complete, or up-to-date.</p>
                  
                  <p><strong>Quality:</strong> We make no representations about the quality, safety, legality, or suitability of venues, food, or services listed on VIBESPOT.</p>
                  
                  <p><strong>Availability:</strong> We do not guarantee uninterrupted or error-free service. The platform may experience downtime, bugs, or technical issues.</p>
                  
                  <p><strong>Location Services:</strong> GPS and location data may not always be accurate. We are not responsible for incorrect directions or distances.</p>
                  
                  <p><strong>Third-Party Services:</strong> We are not responsible for the availability, accuracy, or performance of third-party services (Google Maps, payment processors, etc.).</p>
                  
                  <p><strong>AI Recommendations:</strong> Our AI-powered recommendations are automated suggestions based on algorithms. They may not always be accurate or suitable for your preferences.</p>
                  
                  <p><strong>Business Analytics:</strong> ML Insights and analytics are provided for informational purposes only and should not be considered professional business advice.</p>
                </div>
              </div>

              <p className="mt-4 font-semibold text-red-900">
                YOU USE VIBESPOT AT YOUR OWN RISK. WE ARE NOT RESPONSIBLE FOR ANY FOOD POISONING, ALLERGIC REACTIONS, PROPERTY DAMAGE, PERSONAL INJURY, OR ANY OTHER HARM RESULTING FROM YOUR USE OF VENUES FOUND ON OUR PLATFORM.
              </p>
            </div>
          </Card>

          {/* Section 8: Limitation of Liability */}
          <Card className="p-6 border-2 border-orange-300 bg-orange-50">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  8. LIMITATION OF LIABILITY
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="font-semibold uppercase text-orange-900">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, VIBESPOT AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR:
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Damages resulting from use or inability to use the platform</li>
                <li>Damages from reliance on information provided by VIBESPOT or users</li>
                <li>Damages from interactions with businesses listed on VIBESPOT</li>
                <li>Damages from unauthorized access to your account or data</li>
                <li>Damages from viruses, malware, or other harmful code</li>
              </ul>

              <p className="mt-4 font-semibold">
                IN NO EVENT SHALL VIBESPOT'S TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO VIBESPOT IN THE 12 MONTHS PRIOR TO THE EVENT GIVING RISE TO LIABILITY (OR R100 IF YOU HAVE NOT MADE ANY PAYMENTS).
              </p>

              <p className="mt-4 text-sm">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.
              </p>
            </div>
          </Card>

          {/* Section 9: Indemnification */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Indemnification
                </h3>
              </div>
            </div>

            <div className="text-gray-700">
              <p>You agree to indemnify, defend, and hold harmless VIBESPOT and its officers, directors, employees, agents, and affiliates from any claims, losses, damages, liabilities, costs, and expenses (including reasonable attorney fees) arising from:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Your use or misuse of the platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any laws or regulations</li>
                <li>Your content or conduct on the platform</li>
                <li>Your infringement of any intellectual property or other rights</li>
                <li>Any false or misleading information you provide</li>
              </ul>
            </div>
          </Card>

          {/* Section 10: Third-Party Links */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Third-Party Services and Links
                </h3>
              </div>
            </div>

            <div className="text-gray-700">
              <p>VIBESPOT may contain links to third-party websites, services, or content (e.g., Google Maps, social media, business websites). We do not control, endorse, or assume responsibility for third-party content or services. Your interactions with third parties are solely between you and them.</p>
              
              <p className="mt-4 font-semibold">
                Use of third-party services is at your own risk and subject to their respective terms and privacy policies.
              </p>
            </div>
          </Card>

          {/* Section 11: Termination */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Termination
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">11.1 By You</h4>
                <p>You may terminate your account at any time from your settings. Business subscriptions will remain active until the end of the current billing period.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">11.2 By VIBESPOT</h4>
                <p>We reserve the right to suspend or terminate your account at any time, with or without notice, for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Non-payment of subscription fees</li>
                  <li>Abuse of the platform or other users</li>
                  <li>Any reason at our sole discretion</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">11.3 Effect of Termination</h4>
                <p>Upon termination, your right to use VIBESPOT immediately ceases. Your content may be deleted (subject to legal retention requirements). Termination does not relieve you of obligations incurred before termination.</p>
              </div>
            </div>
          </Card>

          {/* Section 12: Governing Law */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  12. Governing Law and Dispute Resolution
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>These Terms are governed by the laws of the Republic of South Africa. Any disputes arising from these Terms or your use of VIBESPOT shall be subject to the exclusive jurisdiction of the courts of South Africa.</p>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Dispute Resolution Process</h4>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li><strong>Informal Resolution:</strong> Contact us at legal@vibespot.co.za to attempt to resolve disputes informally</li>
                  <li><strong>Mediation:</strong> If informal resolution fails, disputes may be submitted to mediation</li>
                  <li><strong>Litigation:</strong> As a last resort, disputes will be resolved in South African courts</li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Section 13: General Provisions */}
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  13. General Provisions
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">13.1 Changes to Terms</h4>
                <p>We may modify these Terms at any time. Material changes will be communicated via email or platform notice. Continued use after changes constitutes acceptance.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">13.2 Severability</h4>
                <p>If any provision of these Terms is found invalid or unenforceable, the remaining provisions will remain in full force and effect.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">13.3 Entire Agreement</h4>
                <p>These Terms, together with our POPIA Compliance Policy and other referenced policies, constitute the entire agreement between you and VIBESPOT.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">13.4 No Waiver</h4>
                <p>Our failure to enforce any right or provision does not constitute a waiver of that right or provision.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">13.5 Assignment</h4>
                <p>You may not assign these Terms without our written consent. We may assign these Terms to any affiliate or successor.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">13.6 Contact Information</h4>
                <p>For questions about these Terms, contact us at:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Email: legal@vibespot.co.za</li>
                  <li>Phone: +27 123 456 789</li>
                  <li>Address: VIBESPOT (Pty) Ltd, [Physical Address], South Africa</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Acknowledgment Section */}
          <Card className="p-6 bg-gradient-to-r from-orange-500 to-purple-600 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                By Using VIBESPOT, You Acknowledge:
              </h3>
              <div className="space-y-2 text-white/90 text-left max-w-2xl mx-auto">
                <p>✓ You have read and understood these Terms of Service</p>
                <p>✓ You agree to comply with all terms and disclaimers</p>
                <p>✓ You understand the limitations of liability and disclaimers of warranties</p>
                <p>✓ You acknowledge that VIBESPOT is a platform connecting businesses and customers, not a restaurant or service provider</p>
                <p>✓ You use VIBESPOT at your own risk</p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-white/80">
                  If you do not agree with these terms, please discontinue use of VIBESPOT immediately.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}