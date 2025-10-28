'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Zap, Crown, Rocket, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Pricing() {
  const { user } = useAuth();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      price: 0,
      credits: 5,
      description: 'Perfect for trying out Prompt IQ',
      features: [
        '5 enhanced prompts',
        'Basic optimization',
        'Email support',
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
      credits: 30,
      badge: 'Best for Students',
      description: 'Great for students and beginners',
      features: [
        '30 enhanced prompts',
        'Advanced optimization',
        'Priority support',
        '30-day history',
      ],
      popular: false,
      buttonText: 'Subscribe Now - ₹99/month',
      buttonVariant: 'primary',
    },
    {
      id: 'creator',
      name: 'Creator',
      icon: Rocket,
      price: 249,
      credits: 100,
      badge: '🔥 MOST POPULAR',
      description: 'Perfect for freelancers and content creators',
      features: [
        '100 enhanced prompts',
        'Pro optimization',
        '24/7 priority support',
        '90-day history',
        'Custom templates',
        'API access (beta)',
      ],
      popular: true,
      highlight: true,
      buttonText: 'Subscribe Now - ₹249/month',
      buttonVariant: 'gradient',
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      price: 599,
      credits: 300,
      badge: 'Best for Power Users',
      description: 'For professionals and small businesses',
      features: [
        '300 enhanced prompts',
        'Premium optimization',
        'Dedicated support',
        'Unlimited history',
        'Custom template library',
        'Full API access',
        'Team collaboration (3 users)',
      ],
      popular: false,
      buttonText: 'Subscribe Now - ₹599/month',
      buttonVariant: 'primary',
    },
    {
      id: 'business',
      name: 'Business',
      icon: Crown,
      price: 1499,
      credits: 1000,
      badge: 'Best for Teams',
      description: 'For agencies and growing teams',
      features: [
        '1000 enhanced prompts',
        'Enterprise optimization',
        'Priority 24/7 support',
        'Unlimited history',
        'Custom prompt library',
        'Advanced API',
        'Team collaboration (10 users)',
        'Analytics dashboard',
        'White-label option',
      ],
      popular: false,
      buttonText: 'Subscribe Now - ₹1,499/month',
      buttonVariant: 'primary',
    },
  ];

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      // Redirect to signup for free plan
      window.location.href = user ? '/dashboard' : '/signup';
      return;
    }

    // For paid plans, redirect to Razorpay checkout
    if (!user) {
      window.location.href = '/signup';
      return;
    }

    // Redirect to coming soon page
    const selectedPlan = plans.find(p => p.id === planId);
    window.location.href = `/coming-soon?plan=${selectedPlan?.name}`;
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

        </motion.div>


        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-5 gap-6 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <Card 
                className={`h-full transition-all duration-300 ${
                  plan.highlight
                    ? 'border-2 border-gradient-to-r from-orange-400 to-red-400 shadow-2xl scale-105 bg-gradient-to-br from-orange-50 to-red-50'
                    : plan.popular
                    ? 'border-blue-200 shadow-lg'
                    : 'border-gray-200 hover:shadow-md'
                }`}
                style={plan.highlight ? {
                  background: 'linear-gradient(135deg, #fff7ed 0%, #fef2f2 100%)',
                  borderImage: 'linear-gradient(135deg, #fb923c, #ef4444) 1'
                } : {}}
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
                          {formatPrice(plan.price)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-600 ml-1">/month</span>
                        )}
                      </div>
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
                  You can upgrade your plan anytime to get more credits. Free users get 5 credits per month, 
                  while paid plans offer 30-1000 credits monthly.
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

    </div>
  );
}
