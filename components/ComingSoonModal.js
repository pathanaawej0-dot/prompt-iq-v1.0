'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Rocket, Bell, CheckCircle } from 'lucide-react';
import Button from './ui/Button';
import toast from 'react-hot-toast';

const ComingSoonModal = ({ isOpen, onClose, planId, billingCycle = 'monthly' }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const plans = {
    starter: {
      name: 'Starter Plan',
      monthly: 99,
      yearly: 950,
      credits: 50,
      description: 'Perfect for individuals',
    },
    pro: {
      name: 'Pro Plan',
      monthly: 299,
      yearly: 2870,
      credits: 200,
      description: 'Great for professionals',
    },
  };

  const selectedPlan = plans[planId];
  const amount = selectedPlan?.[billingCycle];
  const savings = billingCycle === 'yearly' ? Math.round((selectedPlan.monthly * 12 - selectedPlan.yearly)) : 0;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would normally send to your backend
      // For now, we'll just simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast.success('Thank you! We\'ll notify you when payments are available.');
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setEmail('');
      }, 2000);

    } catch (error) {
      console.error('Email submission error:', error);
      toast.error('Failed to submit email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {isSubmitted ? 'Thank You!' : 'Coming Soon!'}
              </h2>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSubmitted ? (
                // Success State
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    You're on the list!
                  </h3>
                  <p className="text-gray-600">
                    We'll notify you as soon as {selectedPlan.name} is available for purchase.
                  </p>
                </div>
              ) : (
                <>
                  {/* Coming Soon Message */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Rocket className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Payments Coming Soon!
                    </h3>
                    <p className="text-gray-600">
                      We're finalizing our payment integration. Get notified when {selectedPlan.name} is available!
                    </p>
                  </div>

                  {/* Plan Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {selectedPlan.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedPlan.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{amount}
                          <span className="text-sm font-normal text-gray-600">
                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && savings > 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            Save ₹{savings} per year
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Credits</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {selectedPlan.credits}/month
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Collection Form */}
                  <form onSubmit={handleEmailSubmit} className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Get notified when available:
                    </label>
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !email}
                        loading={isSubmitting}
                        variant="gradient"
                        className="px-6"
                      >
                        {isSubmitting ? (
                          'Submitting...'
                        ) : (
                          <>
                            <Bell className="w-4 h-4 mr-2" />
                            Notify Me
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Features Preview */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">What you'll get:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>{selectedPlan.credits} prompt enhancements per month</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>Advanced AI optimization</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>Complete prompt history</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>

                  {/* Current Benefits */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Meanwhile, enjoy unlimited free access!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      During our launch period, all users get unlimited prompt enhancements for free.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonModal;
