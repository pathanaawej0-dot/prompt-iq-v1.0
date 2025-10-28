'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about Prompt IQ? We're here to help! Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center space-x-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  <span>Send us a Message</span>
                </Card.Title>
                <Card.Description>
                  Fill out the form below and we'll respond within 24 hours
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    {!isSubmitting && <Send className="ml-2 w-5 h-5" />}
                  </Button>
                </form>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Contact Details */}
            <Card>
              <Card.Header>
                <Card.Title>Get in Touch</Card.Title>
                <Card.Description>
                  Multiple ways to reach our support team
                </Card.Description>
              </Card.Header>
              <Card.Content className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <p className="text-gray-600">support@promptiq.com</p>
                    <p className="text-sm text-gray-500">We respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone Support</h3>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM IST</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Office Address</h3>
                    <p className="text-gray-600">
                      Prompt IQ Technologies<br />
                      Mumbai, Maharashtra<br />
                      India - 400001
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Response Time */}
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>Response Times</span>
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">General Inquiries</span>
                  <span className="font-medium text-gray-900">24 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Technical Support</span>
                  <span className="font-medium text-gray-900">12 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Billing Issues</span>
                  <span className="font-medium text-gray-900">6 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Urgent Matters</span>
                  <span className="font-medium text-gray-900">2 hours</span>
                </div>
              </Card.Content>
            </Card>

            {/* FAQ Link */}
            <Card>
              <Card.Content className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quick Answers
                </h3>
                <p className="text-gray-600 mb-4">
                  Check our FAQ section for instant answers to common questions
                </p>
                <Button variant="outline" size="sm">
                  View FAQ
                </Button>
              </Card.Content>
            </Card>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need Immediate Help?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              For urgent technical issues or billing problems, reach out to us directly via email or phone. 
              Our team is committed to providing excellent customer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="lg">
                <Mail className="w-5 h-5 mr-2" />
                Email Support
              </Button>
              <Button variant="outline" size="lg">
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
