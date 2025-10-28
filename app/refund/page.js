'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-sm p-8 lg:p-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Refund Policy
            </h1>
            <p className="text-gray-600 mb-8">
              Last updated: October 27, 2024
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">7-Day Money-Back Guarantee</h3>
                  <p className="text-blue-800">
                    We offer a full refund within 7 days of your subscription purchase if you're not satisfied with our service.
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Refund Eligibility</h2>
                <p className="text-gray-700 mb-4">
                  You are eligible for a full refund if:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>You request a refund within 7 days of your initial subscription purchase</li>
                  <li>You have not exceeded the usage limits of your plan significantly</li>
                  <li>You provide a valid reason for the refund request</li>
                  <li>Your account is in good standing with no violations of our Terms of Service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Non-Refundable Situations</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800">
                        Refunds will not be provided in the following cases:
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Refund requests made after the 7-day window</li>
                  <li>Accounts suspended or terminated for Terms of Service violations</li>
                  <li>Excessive usage beyond reasonable limits for testing purposes</li>
                  <li>Requests made for partial months of service</li>
                  <li>Third-party payment processing fees (these are non-recoverable)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How to Request a Refund</h2>
                <p className="text-gray-700 mb-4">
                  To request a refund, please follow these steps:
                </p>
                <ol className="list-decimal pl-6 text-gray-700 mb-4">
                  <li>Send an email to pathanaawej0@gmail.com with the subject "Refund Request"</li>
                  <li>Include your account email address and subscription details</li>
                  <li>Provide a brief reason for your refund request</li>
                  <li>Include your Razorpay transaction ID if available</li>
                </ol>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700">
                    <strong>Required Information:</strong><br />
                    • Account email address<br />
                    • Subscription plan name<br />
                    • Purchase date<br />
                    • Reason for refund<br />
                    • Razorpay transaction ID
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Processing</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">Processing Timeline</h3>
                      <p className="text-yellow-800">
                        Refunds are processed within 7-10 business days after approval.
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  Once we receive your refund request:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Review:</strong> We'll review your request within 2 business days</li>
                  <li><strong>Approval:</strong> If approved, we'll initiate the refund process</li>
                  <li><strong>Processing:</strong> Refunds are processed through the original payment method</li>
                  <li><strong>Completion:</strong> You'll receive confirmation once the refund is complete</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription Cancellation</h2>
                <p className="text-gray-700 mb-4">
                  Please note the difference between refunds and cancellations:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li><strong>Refund:</strong> Get your money back for the current billing period (within 7 days)</li>
                  <li><strong>Cancellation:</strong> Stop future billing but keep access until the current period ends</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  You can cancel your subscription at any time from your account dashboard. Cancellation stops future charges but doesn't provide a refund for the current period unless requested within the 7-day window.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Method Specific Information</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Razorpay Payments</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Refunds are processed back to your original payment method (card/bank account)</li>
                  <li>Processing time: 3-7 business days</li>
                  <li>You'll receive a confirmation email from Razorpay</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">Other Payment Methods</h3>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Refunds are processed to the original payment method used</li>
                  <li>Credit card refunds may take 5-10 business days to appear on your statement</li>
                  <li>Bank transfer refunds typically take 3-7 business days</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Partial Refunds</h2>
                <p className="text-gray-700 mb-4">
                  In exceptional circumstances, we may offer partial refunds:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Service outages lasting more than 24 hours</li>
                  <li>Significant feature unavailability</li>
                  <li>Technical issues preventing normal service usage</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Partial refunds are calculated based on the duration of service unavailability and are processed using the same timeline as full refunds.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Dispute Resolution</h2>
                <p className="text-gray-700 mb-4">
                  If you're not satisfied with our refund decision:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Contact us at pathanaawej0@gmail.com to discuss your concerns</li>
                  <li>Provide additional information or documentation if available</li>
                  <li>We'll review your case within 3 business days</li>
                  <li>Our decision after review will be final</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  For refund requests or questions about this policy, contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Prompt IQ</strong><br />
                    Ashta, Maharashtra, India<br />
                    Email: pathanaawej0@gmail.com<br />
                    Subject Line: "Refund Request" or "Refund Policy Question"
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Policy Updates</h2>
                <p className="text-gray-700 mb-4">
                  We may update this Refund Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our service after changes constitutes acceptance of the updated policy.
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
