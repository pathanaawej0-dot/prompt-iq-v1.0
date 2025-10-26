'use client';

import { motion } from 'framer-motion';
import { Zap, Sparkles, Brain, Wand2 } from 'lucide-react';

const EnhancementLoader = ({ originalPrompt }) => {
  const loadingSteps = [
    { icon: Brain, text: 'Analyzing your prompt...', delay: 0 },
    { icon: Sparkles, text: 'Applying AI magic...', delay: 1 },
    { icon: Wand2, text: 'Enhancing structure...', delay: 2 },
    { icon: Zap, text: 'Finalizing enhancement...', delay: 3 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Enhancing Your Prompt
          </h3>
          <p className="text-gray-600 text-sm">
            Our AI is working its magic to improve your prompt
          </p>
        </div>

        {/* Original Prompt Preview */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-3 border">
            <p className="text-xs text-gray-500 mb-1">Original Prompt:</p>
            <p className="text-sm text-gray-800 line-clamp-3">
              {originalPrompt}
            </p>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay * 0.8, duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  delay: step.delay * 0.8,
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
              >
                <step.icon className="w-4 h-4 text-white" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ delay: step.delay * 0.8 }}
                className="text-sm font-medium text-gray-700"
              >
                {step.text}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            This usually takes 3-5 seconds
          </p>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancementLoader;
