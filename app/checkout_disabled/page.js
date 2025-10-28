'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, CreditCard, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const plans = {
    starter: {
      id: 'starter',
      name: 'Starter',
      price: 99,
      credits: 30,
      description: 'Great for students and beginners',
      features: [
        '30 enhanced prompts per month',
        'Advanced optimization',
        'Priority support',
        '30-day history',
      ],
    },
    creator: {
      id: 'creator',
      name: 'Creator',
      price: 249,
      credits: 100,
      description: 'Perfect for freelancers and content creators',
      features: [
        '100 enhanced prompts per month',
        'Pro optimization',
        '24/7 priority support',
        '90-day history',
        'Custom templates',
        'API access (beta)',
      ],
      popular: true,
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 599,
      credits: 300,
      description: 'For professionals and small businesses',
      features: [
        '300 enhanced prompts per month',
        'Premium optimization',
        'Dedicated support',
        'Unlimited history',
        'Custom template library',
        'Full API access',
        'Team collaboration (3 users)',
      ],
    },
    business: {
      id: 'business',
      name: 'Business',
      price: 1499,
      credits: 1000,
      description: 'For agencies and growing teams',
      features: [
        '1000 enhanced prompts per month',
        'Enterprise optimization',
        'Priority 24/7 support',
        'Unlimited history',
        'Custom prompt library',
        'Advanced API',
        'Team collaboration (10 users)',
        'Analytics dashboard',
        'White-label option',
      ],
    },
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const planId = searchParams.get('plan');
    if (planId && plans[planId]) {
      setSelectedPlan(plans[planId]);
    } else {
      router.push('/pricing');
    }
  }, [user, searchParams, router]);

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;

    // Temporary demo mode - remove this when you get test keys
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      alert(`🚀 Payment Demo Mode\n\nPlan: ${selectedPlan.name}\nAmount: ₹${selectedPlan.price}\n\nTo enable real payments:\n1. Get Razorpay test keys\n2. Add to .env.local\n3. Restart server`);
      return;
    }

    setLoading(true);
    try {
      // Create Razorpay order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: selectedPlan.price * 100, // Convert to paise
          currency: 'INR',
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Prompt IQ',
        description: `${selectedPlan.name} Plan Subscription`,
        order_id: orderData.id,
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selectedPlan.id,
              userId: user.uid,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyResponse.ok && verifyData.success) {
            // Payment successful
            router.push('/dashboard?payment=success');
          } else {
            // Payment verification failed
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.displayName || user.email,
          email: user.email,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </button>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Complete Your Subscription
            </h1>
            <p className="text-gray-600">
              You're just one step away from unlocking the full power of Prompt IQ
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className={`${selectedPlan.popular ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50' : ''}`}>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <Card.Title className="text-2xl">
                      {selectedPlan.name} Plan
                    </Card.Title>
                    {selectedPlan.popular && (
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        🔥 MOST POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{selectedPlan.description}</p>
                </Card.Header>
                <Card.Content>
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">₹{selectedPlan.price}</span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPlan.credits} enhanced prompts per month
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">What's included:</h4>
                    {selectedPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            </motion.div>

            {/* Payment Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Details
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">{selectedPlan.name} Plan (Monthly)</span>
                        <span className="font-medium">₹{selectedPlan.price}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">₹0</span>
                      </div>
                      <hr className="my-3" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-xl">₹{selectedPlan.price}</span>
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Secure Payment</p>
                        <p className="text-sm text-blue-700">
                          Your payment is processed securely by Razorpay with 256-bit SSL encryption.
                        </p>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                      onClick={handlePayment}
                      disabled={loading}
                      variant="gradient"
                      size="lg"
                      className="w-full"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Zap className="w-5 h-5 mr-2" />
                          Pay ₹{selectedPlan.price} & Start Now
                        </div>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                      You can cancel your subscription at any time.
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
