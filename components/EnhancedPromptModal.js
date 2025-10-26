'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Sparkles, ArrowRight, CheckCircle, Zap, Star, TrendingUp, Award } from 'lucide-react';
import { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import toast from 'react-hot-toast';

const EnhancedPromptModal = ({ 
  isOpen,
  onClose,
  originalPrompt, 
  enhancedPrompt, 
  onNewPrompt
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(enhancedPrompt);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = enhancedPrompt;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopied(true);
      toast.success('Enhanced prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleNewPrompt = () => {
    onNewPrompt();
    onClose();
  };

  const improvement = originalPrompt && enhancedPrompt 
    ? Math.round(((enhancedPrompt.length - originalPrompt.length) / originalPrompt.length) * 100)
    : 0;

  // Safety check to prevent reference errors
  if (!originalPrompt || !enhancedPrompt) {
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">✨ Prompt Enhanced Successfully!</h2>
                    <p className="text-sm text-gray-600">Your AI-optimized prompt is ready</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Success Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex items-center justify-center space-x-4"
              >
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">+{improvement}% Improved</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">AI Enhanced</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Auto-saved</span>
                </div>
              </motion.div>

              {/* Before & After Comparison */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Original Prompt */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Card className="h-full">
                    <Card.Header>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">1</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Original Prompt</h3>
                          <p className="text-xs text-gray-500">Your initial input</p>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Content>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[200px]">
                        <p className="text-gray-700 leading-relaxed">
                          {originalPrompt}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {originalPrompt.length} characters
                        </span>
                        <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {originalPrompt.split(' ').length} words
                        </span>
                      </div>
                    </Card.Content>
                  </Card>
                </motion.div>

                {/* Enhanced Prompt */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Card className="h-full border-blue-200">
                    <Card.Header>
                      <div className="flex items-center space-x-3">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                        >
                          <Sparkles className="w-4 h-4 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Enhanced Prompt</h3>
                          <p className="text-xs text-blue-600">AI-optimized version</p>
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="ml-auto"
                        >
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        </motion.div>
                      </div>
                    </Card.Header>
                    <Card.Content>
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200 min-h-[200px]">
                        <p className="text-gray-800 leading-relaxed">
                          {enhancedPrompt}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                          {enhancedPrompt.length} characters
                        </span>
                        <span className="text-purple-600 bg-purple-100 px-3 py-1 rounded-full font-medium">
                          {enhancedPrompt.split(' ').length} words
                        </span>
                        <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                          +{improvement}% better
                        </span>
                      </div>
                    </Card.Content>
                  </Card>
                </motion.div>
              </div>

              {/* Analytics Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-center text-gray-900 mb-6">
                  📊 Enhancement Analytics
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{improvement}%</div>
                    <div className="text-xs font-medium text-blue-700">Improvement</div>
                  </div>
                  
                  <div className="text-center bg-white rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      +{enhancedPrompt.length - originalPrompt.length}
                    </div>
                    <div className="text-xs font-medium text-green-700">Characters Added</div>
                  </div>
                  
                  <div className="text-center bg-white rounded-lg p-4 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {enhancedPrompt.split(' ').length}
                    </div>
                    <div className="text-xs font-medium text-purple-700">Total Words</div>
                  </div>
                  
                  <div className="text-center bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">A+</div>
                    <div className="text-xs font-medium text-yellow-700">Quality Score</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Primary Copy Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleCopy}
                    variant="gradient"
                    size="lg"
                    className="flex items-center justify-center space-x-3 px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Copied Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Enhanced Prompt</span>
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Secondary Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleNewPrompt}
                    variant="outline"
                    size="lg"
                    className="flex items-center space-x-2 px-6 py-3"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Enhance Another</span>
                  </Button>
                  
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="lg"
                    className="px-6 py-3"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedPromptModal;
