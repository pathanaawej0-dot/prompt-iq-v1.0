'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket, ArrowRight, Star, Mail, Gift, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { getApiEndpoint } from '../../lib/api-config';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function UpgradePage() {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 399,
      discountedPrice: 359,
      period: 'month',
      credits: 30,
      badge: 'Best for Students',
      description: 'Great for students and beginners',
      features: [
        '30 enhanced prompts/month',
        'Advanced optimization',
        'Priority support',
        '30-day history'
      ],
      icon: Star,
      color: 'blue',
      popular: false
    },
    {
      id: 'creator',
      name: 'Creator',
      price: 799,
      discountedPrice: 719,
      period: 'month',
      credits: 100,
      badge: '🔥 MOST POPULAR',
      description: 'Perfect for freelancers and content creators',
      features: [
        '100 enhanced prompts/month',
        'Pro optimization',
        '24/7 priority support',
        '90-day history',
        'Custom templates',
        'API access (beta)'
      ],
      icon: Rocket,
      color: 'orange',
      popular: true,
      highlight: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 1599,
      discountedPrice: 1439,
      period: 'month',
      credits: 300,
      badge: 'Best for Power Users',
      description: 'For professionals and small businesses',
      features: [
        '300 enhanced prompts/month',
        'Premium optimization',
        'Dedicated support',
        'Unlimited history',
        'Custom template library',
        'Full API access',
        'Team collaboration (3 users)'
      ],
      icon: Crown,
      color: 'green',
      popular: false
    },
    {
      id: 'business',
      name: 'Business',
      price: 3999,
      discountedPrice: 3599,
      period: 'month',
      credits: 1000,
      badge: 'Best for Teams',
      description: 'For agencies and growing teams',
      features: [
        '1000 enhanced prompts/month',
        'Enterprise optimization',
        'Priority 24/7 support',
        'Unlimited history',
        'Custom prompt library',
        'Advanced API',
        'Team collaboration (10 users)',
        'Analytics dashboard',
        'White-label option'
      ],
      icon: Crown,
      color: 'purple',
      popular: false
    }
  ];

  // Get current plan
  const currentPlan = userProfile?.subscription?.planId || 'free';

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    // Send email to pathanaawej0@gmail.com
    try {
      const response = await fetch('/api/send-discount-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: email,
          userName: user?.displayName || user?.email || 'User',
          notificationEmail: 'pathanaawej0@gmail.com'
        }),
      });
      
      if (response.ok) {
        setEmailSubmitted(true);
        setShowDiscount(true);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // Still show discount even if email fails
      setEmailSubmitted(true);
      setShowDiscount(true);
    }
  };

  const handleUpgrade = async (planId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get user token
      const token = await user.getIdToken();
      
      // Create Razorpay order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId,
          userId: user.uid
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Initialize Razorpay checkout
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Prompt IQ',
        description: `${data.plan.name} Plan - ${data.plan.description}`,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch(getApiEndpoint('PAYMENT_VERIFY'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.uid
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              // Refresh user profile to get updated credits
              await refreshUserProfile();
              
              alert(`🎉 Payment Successful!\n\nPlan: ${verifyData.subscription.planName}\nCredits: ${verifyData.subscription.credits}\n\nYour subscription is now active!`);
              
              // Navigate to dashboard to show updated credits
              router.push('/dashboard');
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert(`Payment verification failed: ${error.message}`);
          }
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
            <Star className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Upgrade Your Account</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Upgrade now and get instant access to advanced features. Start enhancing your prompts today!
          </p>

          {/* Current Plan Status */}
          <div className="mb-8 inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
            <Zap className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Current Plan: <span className="capitalize font-bold">{currentPlan}</span>
            </span>
          </div>

          {/* Discount Email Collection */}
          {!emailSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto mb-12"
            >
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <Card.Content className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      🎉 Get 10% OFF Your First Subscription!
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Enter your email to unlock exclusive launch discount
                    </p>
                  </div>
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email for 10% discount"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button type="submit" variant="gradient" size="lg" className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Unlock 10% Discount
                    </Button>
                  </form>
                </Card.Content>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto mb-12"
            >
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-300">
                <Card.Content className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    🎉 Discount Activated!
                  </h3>
                  <p className="text-green-700 text-sm mb-4">
                    10% OFF applied to all plans below. We've notified our team about your interest!
                  </p>
                  <div className="bg-green-200 rounded-lg p-3">
                    <p className="text-green-800 font-mono text-sm">
                      Discount Code: <strong>LAUNCH10</strong>
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto px-4">
          {/* First Row - Starter and Creator */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {plans.slice(0, 2).map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <Card className={`h-full relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                      {plan.badge}
                    </div>
                  )}
                  <Card.Content className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline">
                          {showDiscount ? (
                            <>
                              <span className="text-3xl font-bold text-gray-900">₹{plan.discountedPrice}</span>
                              <span className="text-lg text-gray-400 line-through ml-2">₹{plan.price}</span>
                            </>
                          ) : (
                            <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                          )}
                          <span className="text-gray-500 ml-2">/{plan.period}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{plan.credits} prompts/month</p>
                      </div>

                      <div className="space-y-3 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        variant={plan.popular ? "gradient" : "outline"}
                        size="lg"
                        className="w-full"
                        disabled={currentPlan === plan.id || isLoading}
                        loading={isLoading}
                      >
                        {currentPlan === plan.id ? (
                          <span className="flex items-center justify-center">
                            <Check className="w-4 h-4 mr-2" />
                            Current Plan
                          </span>
                        ) : isLoading ? (
                          <span>Processing Payment...</span>
                        ) : (
                          <span>Pay ₹{showDiscount ? plan.discountedPrice : plan.price}</span>
                        )}
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Second Row - Pro and Business */}
          <div className="grid lg:grid-cols-2 gap-8">
            {plans.slice(2).map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index + 2) * 0.1 }}
                className="relative"
              >
                <Card className={`h-full relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                      {plan.badge}
                    </div>
                  )}
                  <Card.Content className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline">
                          {showDiscount ? (
                            <>
                              <span className="text-3xl font-bold text-gray-900">₹{plan.discountedPrice}</span>
                              <span className="text-lg text-gray-400 line-through ml-2">₹{plan.price}</span>
                            </>
                          ) : (
                            <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                          )}
                          <span className="text-gray-500 ml-2">/{plan.period}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{plan.credits} prompts/month</p>
                      </div>

                      <div className="space-y-3 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        variant={plan.popular ? "gradient" : "outline"}
                        size="lg"
                        className="w-full"
                        disabled={currentPlan === plan.id || isLoading}
                        loading={isLoading}
                      >
                        {currentPlan === plan.id ? (
                          <span className="flex items-center justify-center">
                            <Check className="w-4 h-4 mr-2" />
                            Current Plan
                          </span>
                        ) : isLoading ? (
                          <span>Processing Payment...</span>
                        ) : (
                          <span>Pay ₹{showDiscount ? plan.discountedPrice : plan.price}</span>
                        )}
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why Choose Prompt IQ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Enhancement</h3>
              <p className="text-gray-600">Transform your prompts in seconds with AI-powered optimization.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Results</h3>
              <p className="text-gray-600">Get better responses from ChatGPT, Claude, and other AI models.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Quality</h3>
              <p className="text-gray-600">Enterprise-grade prompt engineering made simple.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
