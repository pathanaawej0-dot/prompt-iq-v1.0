'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Zap, Crown, Rocket, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PaymentModal from '../../components/PaymentModal';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, planId: null });
  const { user } = useAuth();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      price: 0,
      credits: 3,
      description: 'Perfect for trying out Prompt IQ',
      features: [
        '3 prompt enhancements',
        'Basic AI optimization',
        'Copy to clipboard',
        'Email support',
      ],
      limitations: [
        'No monthly renewal',
        'Limited to 3 total uses',
      ],
      popular: false,
      buttonText: 'Get Started Free',
      buttonVariant: 'outline',
    },
    {
      id: 'starter',
      name: 'Starter',
      icon: Star,
      price: 99,
      credits: 50,
      description: 'Great for individuals and small projects',
      features: [
        '50 prompt enhancements/month',
        'Advanced AI optimization',
        'Prompt history',
        'Copy to clipboard',
        'Priority email support',
        'Export prompts',
      ],
      popular: true,
      buttonText: 'Subscribe Now - ₹99/month',
      buttonVariant: 'gradient',
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Rocket,
      price: 299,
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
        'Analytics dashboard',
      ],
      popular: false,
      buttonText: 'Subscribe Now - ₹299/month',
      buttonVariant: 'primary',
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      icon: Crown,
      price: 999,
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
        'Dedicated account manager',
      ],
      popular: false,
      buttonText: 'Contact Sales',
      buttonVariant: 'primary',
    },
  ];

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      // Redirect to signup for free plan
      window.location.href = user ? '/dashboard' : '/signup';
      return;
    }

    if (planId === 'ultimate') {
      // Contact sales for ultimate plan
      window.location.href = 'mailto:sales@promptiq.com?subject=Ultimate Plan Inquiry';
      return;
    }

    // For paid plans, open payment modal
    if (!user) {
      window.location.href = '/signup';
      return;
    }

    setPaymentModal({ isOpen: true, planId });
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${price}`;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your AI prompt enhancement needs. 
            Start free and upgrade as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Rocket className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-orange-800">Payments Coming Soon!</h3>
            </div>
            <p className="text-orange-700 mb-4">
              We're finalizing our payment integration. Premium plans will be available very soon!
            </p>
            <div className="text-sm text-orange-600 font-medium">
              🎉 For now, enjoy unlimited free enhancements while we prepare for launch!
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <Card 
                className={`h-full ${
                  plan.popular 
                    ? 'border-blue-200 shadow-lg scale-105' 
                    : 'border-gray-200'
                }`}
              >
                <Card.Content className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                        : 'bg-gray-100'
                    }`}>
                      <plan.icon className={`w-6 h-6 ${
                        plan.popular ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {plan.description}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(
                            billingCycle === 'yearly' && plan.price > 0 
                              ? Math.round(plan.price * 0.8) 
                              : plan.price
                          )}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-600 ml-1">/month</span>
                        )}
                      </div>
                      {billingCycle === 'yearly' && plan.price > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Save ₹{Math.round(plan.price * 0.2 * 12)} per year
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        {plan.credits === 'unlimited' 
                          ? 'Unlimited enhancements' 
                          : `${plan.credits} enhancements${plan.id === 'free' ? ' total' : '/month'}`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations && (
                      <>
                        <hr className="my-4" />
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-start space-x-3">
                            <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                              <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto mt-1"></div>
                            </div>
                            <span className="text-sm text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    variant={plan.buttonVariant}
                    size="lg"
                    className="w-full"
                  >
                    {plan.buttonText}
                  </Button>
                </Card.Content>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens when I run out of credits?
                </h3>
                <p className="text-gray-600">
                  You can upgrade your plan anytime to get more credits. Free users get 3 total credits, 
                  while paid plans renew monthly.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I cancel my subscription anytime?
                </h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll continue to have access 
                  until the end of your billing period.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-600">
                  We offer a 7-day free trial for all paid plans. If you're not satisfied, 
                  contact us within 30 days for a full refund.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Which AI models do you support?
                </h3>
                <p className="text-gray-600">
                  Our enhanced prompts work with all major AI models including ChatGPT, Claude, 
                  Gemini, and others.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is my data secure?
                </h3>
                <p className="text-gray-600">
                  Yes, we use enterprise-grade security and encryption. Your prompts are stored 
                  securely and never shared with third parties.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you offer team plans?
                </h3>
                <p className="text-gray-600">
                  Yes! Contact us for custom team pricing and features including shared workspaces 
                  and centralized billing.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <Card.Content className="p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your AI Experience?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who are already getting better results 
                from AI with enhanced prompts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={user ? '/dashboard' : '/signup'}>
                  <Button variant="secondary" size="lg" className="group">
                    {user ? 'Go to Dashboard' : 'Start Free Trial'}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => window.location.href = 'mailto:support@promptiq.com'}
                >
                  Contact Sales
                </Button>
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, planId: null })}
        planId={paymentModal.planId}
        billingCycle={billingCycle}
      />
    </div>
  );
}
