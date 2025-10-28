'use client';

import { motion } from 'framer-motion';
import { Truck, Clock, Globe, Shield, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function ShippingPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about our digital service delivery and subscription management policies
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Digital Service Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <Card.Content className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Digital Service Delivery
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      Prompt IQ is a digital service platform. All our services are delivered electronically 
                      through our web application. There are no physical products to ship or deliver.
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Service Activation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span>Service Activation</span>
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Free Plan</h3>
                    <p className="text-gray-600 text-sm">
                      Activated immediately upon account registration. No payment required.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Paid Plans</h3>
                    <p className="text-gray-600 text-sm">
                      Activated within 5 minutes of successful payment confirmation.
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Instant Access</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Once your payment is processed, you'll have immediate access to all premium features 
                    associated with your subscription plan.
                  </p>
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Subscription Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <span>Subscription Management</span>
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Plan Changes</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      You can upgrade or downgrade your subscription plan at any time through your account dashboard.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Upgrades take effect immediately</li>
                      <li>• Downgrades take effect at the next billing cycle</li>
                      <li>• Pro-rated billing applies for mid-cycle changes</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cancellation</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      You can cancel your subscription at any time. Your service will continue until the end of your current billing period.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• No cancellation fees</li>
                      <li>• Access continues until period ends</li>
                      <li>• Automatic downgrade to free plan</li>
                    </ul>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Service Availability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center space-x-2">
                  <Truck className="w-6 h-6 text-orange-600" />
                  <span>Service Availability</span>
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Geographic Coverage</h3>
                    <p className="text-gray-600 text-sm">
                      Our services are available globally, 24/7, accessible from any device with an internet connection.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Service Uptime</h3>
                    <p className="text-gray-600 text-sm">
                      We maintain 99.9% uptime with redundant servers and continuous monitoring.
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">System Maintenance</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Scheduled maintenance is performed during low-traffic hours (2-4 AM IST) 
                    and users are notified 24 hours in advance.
                  </p>
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Support & Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center space-x-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <span>Service Issues & Support</span>
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Technical Issues</h3>
                    <p className="text-gray-600 text-sm">
                      If you experience any technical difficulties accessing our services, 
                      please contact our support team immediately.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Service Credits</h3>
                    <p className="text-gray-600 text-sm">
                      In case of extended service outages (&gt;4 hours), we may provide service credits 
                      or extend your subscription period at our discretion.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
                    <p className="text-gray-600 text-sm">
                      Email: support@promptiq.com<br />
                      Phone: +91 98765 43210<br />
                      Response time: Within 24 hours
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Policy Updates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <Card.Content className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Policy Updates
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This shipping and delivery policy may be updated from time to time. 
                  Any changes will be posted on this page and users will be notified via email 
                  for significant changes. The policy was last updated on October 28, 2025.
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    For questions about this policy, please contact us at legal@promptiq.com
                  </p>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
