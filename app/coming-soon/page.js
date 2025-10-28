'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Rocket, Mail, Clock, Star } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function ComingSoon() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan') || 'Premium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </button>

          {/* Main Content */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <Rocket className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            >
              Payment Integration Coming Soon! 🚀
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              We're putting the finishing touches on our secure payment system. 
              The <span className="font-semibold text-blue-600">{planName} Plan</span> will be available very soon!
            </motion.p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="text-center p-6 h-full">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Launch Timeline
                </h3>
                <p className="text-gray-600">
                  Payment system will be live within 24-48 hours. We're ensuring maximum security for your transactions.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="text-center p-6 h-full">
                <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Early Access
                </h3>
                <p className="text-gray-600">
                  Be among the first to upgrade! Contact us for priority access and special launch discounts.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="text-center p-6 h-full">
                <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get Notified
                </h3>
                <p className="text-gray-600">
                  We'll notify you the moment payments go live. Plus, get exclusive early-bird pricing!
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Want Immediate Access?
              </h2>
              <p className="text-blue-100 mb-6">
                For urgent upgrades or enterprise needs, reach out directly:
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Email:</p>
                  <a 
                    href="mailto:pathanaawej0@gmail.com?subject=Prompt IQ - Early Access Request"
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    pathanaawej0@gmail.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold">Subject:</p>
                  <p className="text-blue-200">"{planName} Plan - Early Access Request"</p>
                </div>
              </div>
              
              <div className="mt-6 space-x-4">
                <Button
                  onClick={() => window.location.href = 'mailto:pathanaawej0@gmail.com?subject=Prompt IQ - Early Access Request'}
                  variant="outline"
                  className="bg-white text-blue-600 border-white hover:bg-blue-50"
                >
                  Contact for Early Access
                </Button>
                <Button
                  onClick={() => router.push('/pricing')}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  View All Plans
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500">
              Thank you for your patience as we build something amazing! 🙏
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
