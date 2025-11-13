'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Sparkles, BookOpen } from 'lucide-react';
import Button from './Button';
import FolderSelectionModal from './FolderSelectionModal';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function EnhancedPromptOverlay({ 
  isVisible, 
  enhancedPrompt, 
  originalPrompt, 
  onClose, 
  onNewPrompt 
}) {
  const { user } = useAuth();
  const [showAddToLibraryModal, setShowAddToLibraryModal] = useState(false);
  const handleCopy = async (type = 'enhanced') => {
    try {
      const textToCopy = type === 'enhanced' ? enhancedPrompt : originalPrompt;
      
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      toast.success(`${type === 'enhanced' ? 'Enhanced' : 'Original'} prompt copied to clipboard!`);
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy. Please try again.');
    }
  };

  // Add enhanced prompt to library
  const handleAddToLibrary = async (targetFolder) => {
    if (!user?.uid) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/library/move-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          token,
          promptId: 'enhanced-' + Date.now(), // Temporary ID
          targetFolderId: targetFolder.id,
          sourceType: 'enhanced',
          originalPrompt,
          enhancedPrompt,
          title: 'Enhanced Prompt',
          category: 'General',
          useCase: 'Enhanced prompt from dashboard',
          targetRole: 'General'
        })
      });

      if (response.ok) {
        toast.success(`Added to "${targetFolder.name}" folder!`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add to library');
      }
    } catch (error) {
      console.error('Error adding to library:', error);
      toast.error('Failed to add to library');
    } finally {
      setShowAddToLibraryModal(false);
    }
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">✨ Enhanced Prompt Ready!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate()}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Original Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Original Prompt</h4>
                    <Button
                      onClick={() => handleCopy('original')}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {originalPrompt}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {originalPrompt.length} characters
                  </div>
                </div>

                {/* Enhanced Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Enhanced Prompt</h4>
                    <Button
                      onClick={() => handleCopy('enhanced')}
                      variant="gradient"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </Button>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {enhancedPrompt}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {enhancedPrompt.length} characters
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Enhancement Stats</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Original Length:</span>
                      <span className="ml-2 font-medium">{originalPrompt.length} chars</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Enhanced Length:</span>
                      <span className="ml-2 font-medium">{enhancedPrompt.length} chars</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Improvement:</span>
                      <span className="ml-2 font-medium text-green-600">
                        +{Math.round(((enhancedPrompt.length - originalPrompt.length) / originalPrompt.length) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleCopy('enhanced')}
                  variant="gradient"
                  size="lg"
                  className="flex-1 group"
                >
                  <Copy className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Copy Enhanced Prompt
                </Button>
                
                <Button
                  onClick={() => setShowAddToLibraryModal(true)}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Add to Library</span>
                </Button>
                
                <Button
                  onClick={onNewPrompt}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>New Prompt</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Add to Library Modal */}
      <FolderSelectionModal
        isVisible={showAddToLibraryModal}
        onClose={() => setShowAddToLibraryModal(false)}
        onSelectFolder={handleAddToLibrary}
        userId={user?.uid}
        title="Add to Library"
        description="Select a folder to save your enhanced prompt"
      />
    </AnimatePresence>
  );
}
