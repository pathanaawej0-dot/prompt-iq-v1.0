'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket, ArrowRight, Star, Mail, Gift, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function UpgradePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);

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
      price: 99,
      discountedPrice: 89,
      period: 'month',
      credits: 50,
      description: 'Great for individuals and small projects',
      features: [
        '50 prompt enhancements/month',
        'Advanced AI optimization',
        'Prompt history',
        'Copy to clipboard',
        'Priority email support',
        'Export prompts'
      ],
      icon: Star,
      color: 'blue',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 299,
      discountedPrice: 269,
      period: 'month',
      credits: 200,
      description: 'Perfect for professionals and teams',
      features: [
        '200 prompt enhancements/month',
        'Premium AI optimization',
        'Advanced prompt history',
        'Bulk operations',
        'API access',
        'Priority support',
        'Custom templates',
        'Analytics dashboard'
      ],
      icon: Rocket,
      color: 'green',
      popular: true
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: 999,
      discountedPrice: 899,
      period: 'month',
      credits: 'unlimited',
      description: 'For power users and enterprises',
      features: [
        'Unlimited prompt enhancements',
        'Enterprise AI optimization',
        'Complete prompt history',
        'Bulk operations',
        'Full API access',
        '24/7 priority support',
        'Custom templates',
        'Advanced analytics',
        'White-label options',
        'Dedicated account manager'
      ],
      icon: Crown,
      color: 'purple',
      popular: false
    }
  ];

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

  const handleUpgrade = (planId) => {
    // Show coming soon message with contact info
    alert(`Payment integration coming soon! 🚀\n\nFor immediate upgrade, please contact:\npathanaawej0@gmail.com\n\nMention your plan: ${plans.find(p => p.id === planId)?.name}\nYour discount code: LAUNCH10`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const currentPlan = userProfile?.subscriptionTier || 'free';

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Upgrade now and get instant access to advanced features. Payment integration coming soon!
          </p>

          {/* Current Plan Status */}
          <div className="mb-8 inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
            <Zap className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Current Plan: <span className="capitalize font-bold">{currentPlan}</span>
              {userProfile?.credits !== undefined && currentPlan === 'free' && (
                <span className="ml-2 text-blue-600">({userProfile.credits} credits left)</span>
              )}
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
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <Card className={`h-full ${plan.popular ? 'border-green-200 shadow-lg' : ''}`}>
                <Card.Content className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${
                      plan.color === 'blue' 
                        ? 'from-blue-500 to-blue-600' 
                        : plan.color === 'green'
                        ? 'from-green-500 to-green-600'
                        : 'from-purple-500 to-purple-600'
                    } rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="flex items-baseline justify-center">
                      {showDiscount ? (
                        <div className="text-center">
                          <div className="flex items-baseline justify-center mb-1">
                            <span className="text-2xl text-gray-400 line-through mr-2">₹{plan.price}</span>
                            <span className="text-4xl font-bold text-green-600">₹{plan.discountedPrice}</span>
                            <span className="text-gray-500 ml-1">/{plan.period}</span>
                          </div>
                          <div className="inline-flex items-center px-2 py-1 bg-green-100 rounded-full">
                            <span className="text-xs font-medium text-green-800">10% OFF Applied!</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                          <span className="text-gray-500 ml-1">/{plan.period}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className={`w-5 h-5 ${
                          plan.color === 'blue' 
                            ? 'text-blue-600' 
                            : plan.color === 'green'
                            ? 'text-green-600'
                            : 'text-purple-600'
                        } flex-shrink-0 mt-0.5`} />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    variant={plan.popular ? "gradient" : "outline"}
                    size="lg"
                    className="w-full group"
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? (
                      'Current Plan'
                    ) : (
                      <>
                        {showDiscount ? (
                          <>Contact for ₹{plan.discountedPrice}/month</>
                        ) : (
                          <>Contact for ₹{plan.price}/month</>
                        )}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </Card.Content>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why Upgrade to Premium?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlimited Power</h3>
              <p className="text-gray-600">
                No more credit limits. Enhance as many prompts as you need.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Priority Processing</h3>
              <p className="text-gray-600">
                Get your enhanced prompts faster with priority AI processing.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Features</h3>
              <p className="text-gray-600">
                Access to premium templates, analytics, and team collaboration.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Ready to Upgrade? Contact Us!
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Payment integration is coming soon! For immediate upgrade and to secure your discount, 
              contact us directly. We'll get you set up within 24 hours.
            </p>
            
            <div className="bg-white rounded-xl p-6 max-w-md mx-auto shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">pathanaawej0@gmail.com</span>
                </div>
                {showDiscount && (
                  <div className="bg-green-100 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Your Discount Code:</strong> LAUNCH10 (10% OFF)
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  Mention your preferred plan and discount code in your email
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              30-Day Money Back Guarantee
            </h3>
            <p className="text-gray-600 text-sm">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
