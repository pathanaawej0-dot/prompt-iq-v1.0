'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, planId, billingCycle = 'monthly' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { user, updateUserCredits } = useAuth();

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    if (isOpen && !razorpayLoaded) {
      loadRazorpay();
    }
  }, [isOpen, razorpayLoaded]);

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

  const handlePayment = async () => {
    if (!user || !razorpayLoaded || !selectedPlan) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      // Get Firebase token
      const token = await user.getIdToken();

      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Prompt IQ',
        description: `${selectedPlan.name} - ${billingCycle} subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: user.displayName || user.email?.split('@')[0] || '',
          email: user.email,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planDetails: orderData.planDetails,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            // Update user credits in context
            await updateUserCredits(selectedPlan.credits);

            toast.success('Payment successful! Your subscription is now active.');
            onClose();
            
            // Refresh the page to update UI
            window.location.reload();

          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
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
                Complete Your Purchase
              </h2>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Plan Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedPlan.name}
                </h3>
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

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
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
                  {planId === 'pro' && (
                    <>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>API access</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>Analytics dashboard</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Security badges */}
              <div className="flex items-center justify-center space-x-6 mb-6 py-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>SSL Encrypted</span>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !razorpayLoaded}
                loading={isProcessing}
                variant="gradient"
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  'Processing...'
                ) : !razorpayLoaded ? (
                  'Loading Payment...'
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ₹{amount} Securely
                  </>
                )}
              </Button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center mt-4">
                By proceeding, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                . You can cancel anytime.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
