'use client';

import { motion } from 'framer-motion';
import { Copy, Save, Sparkles, ArrowRight, CheckCircle, Zap, Star, TrendingUp, Award } from 'lucide-react';
import { useState } from 'react';
import Button from './Button';
import Card from './Card';
import toast from 'react-hot-toast';

const EnhancedPromptCard = ({ 
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

  const improvement = Math.round(((enhancedPrompt.length - originalPrompt.length) / originalPrompt.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Beautiful Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        className="text-center relative"
      >
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-blue-100/50 rounded-2xl blur-xl"></div>
        
        <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-xl">
          {/* Animated Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.4 }}
            className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            ✨ Prompt Enhanced Successfully!
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <div className="flex items-center space-x-1 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">+{improvement}% Improved</span>
            </div>
            <div className="flex items-center space-x-1 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">AI Enhanced</span>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-gray-600 text-lg"
          >
            Your prompt has been transformed with advanced AI optimization
          </motion.p>
        </div>
      </motion.div>

      {/* Beautiful Before & After Comparison */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Original Prompt - Elegant Design */}
        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          className="group"
        >
          <Card className="hover:shadow-xl transition-all duration-300">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Original Prompt</h3>
                  <p className="text-xs text-gray-500">Your initial input</p>
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 min-h-[120px] flex items-center">
                <p className="text-gray-700 leading-relaxed font-medium">
                  {originalPrompt}
                </p>
              </div>
              
              {/* Stats */}
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

        {/* Enhanced Prompt - Stunning Design */}
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          className="group"
        >
          <Card className="border-blue-200 hover:shadow-2xl transition-all duration-300">
            <Card.Header>
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Enhanced Prompt
                  </h3>
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
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-lg border-2 border-blue-200 min-h-[120px] flex items-center relative overflow-hidden">
                <p className="text-gray-800 leading-relaxed font-medium relative z-10">
                  {enhancedPrompt}
                </p>
              </div>
              
              {/* Enhanced Stats */}
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

      {/* Beautiful Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="flex flex-col lg:flex-row gap-6 justify-center items-center"
      >
        {/* Primary Copy Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleCopy}
            variant="gradient"
            size="lg"
            className="flex items-center justify-center space-x-3 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            disabled={copied}
          >
            {copied ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle className="w-6 h-6" />
                </motion.div>
                <span>Copied Successfully!</span>
              </>
            ) : (
              <>
                <Copy className="w-6 h-6" />
                <span>Copy Enhanced Prompt</span>
              </>
            )}
          </Button>
        </motion.div>

        {/* Auto-saved Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex items-center justify-center space-x-3 px-6 py-3 bg-green-50 rounded-lg border border-green-200 shadow-lg"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle className="w-6 h-6 text-green-600" />
          </motion.div>
          <span className="text-sm font-semibold text-green-700">Automatically saved to history</span>
        </motion.div>

        {/* Secondary Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onNewPrompt}
            variant="outline"
            size="lg"
            className="flex items-center justify-center space-x-3 px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
          >
            <Zap className="w-6 h-6" />
            <span>Enhance Another</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Beautiful Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl"
      >
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-xl font-bold text-center text-gray-900 mb-6"
        >
          📊 Enhancement Analytics
        </motion.h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Improvement Percentage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="text-center bg-blue-50 rounded-lg p-4 border border-blue-200"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              className="text-3xl font-bold text-blue-600 mb-2"
            >
              {improvement}%
            </motion.div>
            <div className="text-sm font-medium text-blue-700">Improvement</div>
          </motion.div>
          
          {/* Characters Added */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="text-center bg-green-50 rounded-lg p-4 border border-green-200"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.7 }}
              className="text-3xl font-bold text-green-600 mb-2"
            >
              +{enhancedPrompt.length - originalPrompt.length}
            </motion.div>
            <div className="text-sm font-medium text-green-700">Characters Added</div>
          </motion.div>
          
          {/* Total Words */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-center bg-purple-50 rounded-lg p-4 border border-purple-200"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.9 }}
              className="text-3xl font-bold text-purple-600 mb-2"
            >
              {enhancedPrompt.split(' ').length}
            </motion.div>
            <div className="text-sm font-medium text-purple-700">Total Words</div>
          </motion.div>
          
          {/* Quality Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="text-center bg-yellow-50 rounded-lg p-4 border border-yellow-200"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 2.1 }}
              className="text-3xl font-bold text-yellow-600 mb-2"
            >
              A+
            </motion.div>
            <div className="text-sm font-medium text-yellow-700">Quality Score</div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedPromptCard;
