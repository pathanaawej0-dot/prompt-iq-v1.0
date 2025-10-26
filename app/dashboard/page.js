'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, Clock, ArrowRight, Sparkles, AlertCircle, CreditCard, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EnhancementLoader from '../../components/ui/EnhancementLoader';
import EnhancedPromptCard from '../../components/ui/EnhancedPromptCard';
import FeedbackModal from '../../components/FeedbackModal';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  const { user, userProfile, loading, updateUserCredits } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleEnhancePrompt = async () => {
    if (!originalPrompt.trim()) {
      return;
    }

    if (originalPrompt.length > 2000) {
      toast.error('Prompt is too long. Please keep it under 2000 characters.');
      return;
    }

    // Check credits for non-ultimate users
    if (userProfile?.subscriptionTier !== 'ultimate' && userProfile?.credits <= 0) {
      toast.error('You have no credits left. Please upgrade your plan.');
      return;
    }

    setIsEnhancing(true);
    setError('');
    setShowResult(false);

    try {
      // Get Firebase token
      const token = await user.getIdToken();

      // Call enhance API
      const enhanceResponse = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalPrompt: originalPrompt.trim(),
        }),
      });

      const enhanceData = await enhanceResponse.json();

      if (!enhanceResponse.ok) {
        throw new Error(enhanceData.error || 'Failed to enhance prompt');
      }

      // Update local state immediately
      setEnhancedPrompt(enhanceData.enhancedPrompt);
      setShowResult(true);

      // Update user credits if provided in response
      if (enhanceData.creditsRemaining !== undefined) {
        updateUserCredits(enhanceData.creditsRemaining);
      }

      toast.success('Prompt enhanced and saved to history!');

    } catch (error) {
      console.error('Enhancement error:', error);
      const errorMessage = error.message || 'Failed to enhance prompt. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  };


  const handleNewPrompt = () => {
    setOriginalPrompt('');
    setEnhancedPrompt('');
    setShowResult(false);
    setError('');
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

  const canEnhance = userProfile?.subscriptionTier === 'ultimate' || (userProfile?.credits > 0);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Transform your basic prompts into powerful AI instructions
          </p>
          
          {/* Credits Display */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {userProfile?.subscriptionTier === 'ultimate' 
                ? 'Unlimited credits' 
                : `${userProfile?.credits || 0} credits remaining`
              }
            </span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>Enter Your Prompt</span>
                </Card.Title>
                <Card.Description>
                  Type your basic prompt below and we'll enhance it for better AI results
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <textarea
                    value={originalPrompt}
                    onChange={(e) => setOriginalPrompt(e.target.value)}
                    placeholder="Example: Write a blog post about productivity..."
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    disabled={isEnhancing}
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {originalPrompt.length}/2000 characters
                    </span>
                    
                    {!canEnhance && (
                      <div className="flex items-center space-x-2 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">No credits remaining</span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleEnhancePrompt}
                      disabled={!originalPrompt.trim() || isEnhancing || !canEnhance}
                      loading={isEnhancing}
                      variant="gradient"
                      size="lg"
                      className="flex-1 group"
                    >
                      {isEnhancing ? 'Enhancing...' : 'Enhance My Prompt'}
                      {!isEnhancing && <Zap className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />}
                    </Button>
                    
                    {!canEnhance && (
                      <Button
                        onClick={() => router.push('/pricing')}
                        variant="outline"
                        size="lg"
                        className="flex items-center space-x-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Upgrade Plan</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Result Section */}
          <AnimatePresence>
            {showResult && enhancedPrompt && (
              <EnhancedPromptCard
                originalPrompt={originalPrompt}
                enhancedPrompt={enhancedPrompt}
                onNewPrompt={handleNewPrompt}
              />
            )}
          </AnimatePresence>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <Card.Header>
                <Card.Title>💡 Pro Tips</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Be Specific</h4>
                    <p className="text-sm text-gray-600">
                      Include context, desired format, and target audience in your original prompt
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Set Clear Goals</h4>
                    <p className="text-sm text-gray-600">
                      Mention what you want to achieve with the AI-generated content
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Use Examples</h4>
                    <p className="text-sm text-gray-600">
                      Reference styles, formats, or examples you'd like the AI to follow
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Iterate</h4>
                    <p className="text-sm text-gray-600">
                      Try different variations and refine based on the results you get
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Beautiful Loading Screen */}
      {isEnhancing && (
        <EnhancementLoader originalPrompt={originalPrompt} />
      )}

      {/* Floating Feedback Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group"
          title="Share Feedback"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </motion.div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}
