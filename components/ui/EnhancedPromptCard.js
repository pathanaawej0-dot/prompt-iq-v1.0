'use client';

import { motion } from 'framer-motion';
import { Copy, Save, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Button from './Button';
import Card from './Card';
import toast from 'react-hot-toast';

const EnhancedPromptCard = ({ 
  originalPrompt, 
  enhancedPrompt, 
  onSaveToHistory, 
  onNewPrompt,
  isSaving = false 
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Prompt Enhanced Successfully! 🎉
        </h2>
        <p className="text-gray-600">
          Your prompt has been improved by <span className="font-semibold text-green-600">+{improvement}%</span>
        </p>
      </motion.div>

      {/* Before & After Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Prompt */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Original Prompt
              </h3>
            </Card.Header>
            <Card.Content>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {originalPrompt}
                </p>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {originalPrompt.length} characters
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Enhanced Prompt */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                Enhanced Prompt
              </h3>
            </Card.Header>
            <Card.Content>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {enhancedPrompt}
                </p>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {enhancedPrompt.length} characters
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          onClick={handleCopy}
          variant="gradient"
          size="lg"
          className="flex items-center justify-center space-x-2"
          disabled={copied}
        >
          {copied ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>Copy Enhanced Prompt</span>
            </>
          )}
        </Button>

        <Button
          onClick={onSaveToHistory}
          variant="outline"
          size="lg"
          className="flex items-center justify-center space-x-2"
          disabled={isSaving}
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? 'Saving...' : 'Save to History'}</span>
        </Button>

        <Button
          onClick={onNewPrompt}
          variant="ghost"
          size="lg"
          className="flex items-center justify-center space-x-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>Enhance Another</span>
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-gray-50 rounded-lg p-4"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{improvement}%</div>
            <div className="text-xs text-gray-600">Improvement</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              +{enhancedPrompt.length - originalPrompt.length}
            </div>
            <div className="text-xs text-gray-600">Characters Added</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {enhancedPrompt.split(' ').length}
            </div>
            <div className="text-xs text-gray-600">Words</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedPromptCard;
