'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
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
              Terms & Conditions
            </h1>
            <p className="text-gray-600 mb-8">
              Last updated: October 27, 2024
            </p>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using Prompt IQ ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
                <p className="text-gray-700 mb-4">
                  Prompt IQ is an AI-powered prompt enhancement service that helps users optimize their prompts for better results with AI models like ChatGPT, Claude, Gemini, and others. Our service is provided on a subscription basis with various pricing tiers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                <p className="text-gray-700 mb-4">
                  To access certain features of the Service, you must register for an account. You are responsible for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription and Billing</h2>
                <p className="text-gray-700 mb-4">
                  Our service offers various subscription plans ranging from ₹99 to ₹999. By subscribing, you agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Pay all applicable fees and charges</li>
                  <li>Automatic renewal of your subscription unless cancelled</li>
                  <li>Payment processing through Razorpay and other approved methods</li>
                  <li>Price changes with 30 days advance notice</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
                <p className="text-gray-700 mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 mb-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Generate harmful, offensive, or illegal content</li>
                  <li>Attempt to reverse engineer or hack the service</li>
                  <li>Share your account credentials with others</li>
                  <li>Use the service for commercial resale without permission</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
                <p className="text-gray-700 mb-4">
                  The Service and its original content, features, and functionality are owned by Prompt IQ and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
                <p className="text-gray-700 mb-4">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
                <p className="text-gray-700 mb-4">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including but not limited to a breach of the Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimer</h2>
                <p className="text-gray-700 mb-4">
                  The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  In no event shall Prompt IQ, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
                <p className="text-gray-700 mb-4">
                  These Terms shall be interpreted and governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Maharashtra, India.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms & Conditions, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Prompt IQ</strong><br />
                    Ashta, Maharashtra, India<br />
                    Email: pathanaawej0@gmail.com
                  </p>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
