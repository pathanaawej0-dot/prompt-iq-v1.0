'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Target, Sparkles, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Footer from '../components/Footer';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Enhancement',
      description: 'Transform basic prompts into detailed, effective instructions using advanced AI technology.',
    },
    {
      icon: Target,
      title: 'Better Results',
      description: 'Get more accurate and relevant responses from ChatGPT, Claude, Gemini, and other AI models.',
    },
    {
      icon: Sparkles,
      title: 'Instant Optimization',
      description: 'Enhance your prompts in seconds with our intelligent prompt engineering system.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Creator',
      content: 'Prompt IQ transformed how I work with AI. My content quality improved dramatically!',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Marketing Manager',
      content: 'The enhanced prompts generate much better marketing copy. This tool is a game-changer.',
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'Developer',
      content: 'Perfect for generating better code documentation and technical content.',
      rating: 5,
    },
  ];

  const benefits = [
    'Save hours of prompt engineering',
    'Get better AI responses instantly',
    'Works with all major AI models',
    'No technical knowledge required',
    'Secure and private',
    'Cancel anytime',
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-pink-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Transform Your{' '}
                <span className="gradient-text">AI Prompts</span>
                <br />
                Get Better Results
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Turn basic prompts into detailed, effective instructions that get better results from 
                ChatGPT, Claude, Gemini, and other AI models. No prompt engineering skills required.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link href={user ? '/dashboard' : '/signup'}>
                <Button variant="gradient" size="lg" className="group">
                  {user ? 'Go to Dashboard' : 'Start Free Trial'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-gray-500"
            >
              ✨ 5 free enhancements • No credit card required • Cancel anytime
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              See the Difference
            </h2>
            <p className="text-xl text-gray-600">
              Watch how Prompt IQ transforms basic prompts into powerful instructions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <Card.Header>
                  <Card.Title className="text-red-600">❌ Basic Prompt</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-700 font-mono text-sm">
                      "Write a blog post about productivity"
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Vague, lacks context, produces generic results
                  </p>
                </Card.Content>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-green-200 bg-green-50/50">
                <Card.Header>
                  <Card.Title className="text-green-600">✅ Enhanced Prompt</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="bg-white p-4 rounded-lg mb-4 border border-green-200">
                    <p className="text-gray-700 font-mono text-sm">
                      "Write a comprehensive 1500-word blog post about productivity for remote workers. 
                      Include 5 actionable tips, real-world examples, and a compelling introduction 
                      that hooks the reader. Use a conversational tone and include relevant statistics."
                    </p>
                  </div>
                  <p className="text-green-600 text-sm font-medium">
                    Specific, detailed, produces high-quality results
                  </p>
                </Card.Content>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Prompt IQ?
            </h2>
            <p className="text-xl text-gray-600">
              The smartest way to enhance your AI interactions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover className="text-center h-full">
                  <Card.Content>
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of professionals who are already getting better results from AI
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <Zap className="w-16 h-16 mx-auto mb-6 opacity-80" />
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="text-blue-100 mb-6">
                    Transform your prompts and unlock the full potential of AI
                  </p>
                  <Link href={user ? '/dashboard' : '/signup'}>
                    <Button variant="secondary" size="lg" className="w-full">
                      {user ? 'Go to Dashboard' : 'Start Your Free Trial'}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Loved by Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are saying about Prompt IQ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover className="h-full">
                  <Card.Content>
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Transform Your AI Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of professionals who are already getting better results with Prompt IQ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={user ? '/dashboard' : '/signup'}>
                <Button variant="secondary" size="lg" className="group">
                  {user ? 'Go to Dashboard' : 'Start Free Trial'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              No credit card required • 5 free enhancements • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
