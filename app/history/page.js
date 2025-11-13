'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { History, Copy, Clock, Search, Filter, ArrowRight, Trash2, Eye, X, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FolderSelectionModal from '../../components/ui/FolderSelectionModal';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sourceFilter, setSourceFilter] = useState('all'); // Add source filter
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [viewModal, setViewModal] = useState(null);
  const [showAddToLibraryModal, setShowAddToLibraryModal] = useState(false);
  const [promptToAdd, setPromptToAdd] = useState(null);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch history from Neon API
  const fetchHistory = async () => {
    if (!user) {
      console.log('❌ No user found, skipping history fetch');
      setLoading(false);
      return;
    }
    
    try {
      console.log('✅ User found:', user.uid);
      console.log('🔍 Fetching prompts from Neon API for user:', user.uid);
      
      const token = await user.getIdToken();
      const response = await fetch('/api/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Total prompts loaded from Neon:', data.history.length);
        setPrompts(data.history);
      } else {
        console.error('Failed to fetch history:', response.status);
        toast.error('Failed to load prompt history');
      }
    } catch (error) {
      console.error('🚨 NEON API ERROR:', error);
      toast.error('Failed to load prompt history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Filter and sort prompts
  useEffect(() => {
    let filtered = [...prompts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(prompt =>
        (prompt.originalPrompt?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prompt.enhancedPrompt?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prompt.prompt?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prompt.result?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(prompt => prompt.source === sourceFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp?.toDate() - a.timestamp?.toDate();
        case 'oldest':
          return a.timestamp?.toDate() - b.timestamp?.toDate();
        case 'longest':
          return (b.enhancedPrompt?.length || 0) - (a.enhancedPrompt?.length || 0);
        case 'shortest':
          return (a.enhancedPrompt?.length || 0) - (b.enhancedPrompt?.length || 0);
        default:
          return 0;
      }
    });

    setFilteredPrompts(filtered);
  }, [prompts, searchTerm, sortBy, sourceFilter]);

  const handleCopyPrompt = async (prompt, type = 'enhanced') => {
    try {
      let textToCopy;
      let successMessage;
      
      switch(type) {
        case 'enhanced':
          textToCopy = prompt.enhancedPrompt || prompt.prompt || '';
          successMessage = 'Enhanced prompt copied to clipboard!';
          break;
        case 'original':
          textToCopy = prompt.originalPrompt || prompt.prompt || '';
          successMessage = 'Original prompt copied to clipboard!';
          break;
        case 'result':
          textToCopy = prompt.result || prompt.aiResponse || '';
          successMessage = 'AI response copied to clipboard!';
          break;
        default:
          textToCopy = prompt.enhancedPrompt || prompt.prompt || '';
          successMessage = 'Enhanced prompt copied to clipboard!';
      }
      
      await navigator.clipboard.writeText(textToCopy);
      toast.success(successMessage);
    } catch (error) {
      console.error('Copy error:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success(successMessage);
      } catch (fallbackError) {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  // Add prompt to library
  const handleAddToLibrary = async (targetFolder) => {
    if (!promptToAdd || !user?.uid) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/library/move-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          token,
          promptId: promptToAdd.id,
          targetFolderId: targetFolder.id,
          sourceType: 'history'
        })
      });

      if (response.ok) {
        toast.success(`Added to "${targetFolder.name}" folder!`);
      } else {
        const data = await response.json();
        console.error('Add to library error:', data);
        
        if (data.availableIds) {
          console.log('Available history IDs:', data.availableIds);
          console.log('Requested ID:', data.requestedId);
        }
        
        toast.error(data.error || 'Failed to add to library');
      }
    } catch (error) {
      console.error('Error adding to library:', error);
      toast.error('Failed to add to library');
    } finally {
      setShowAddToLibraryModal(false);
      setPromptToAdd(null);
    }
  };

  const handleViewPrompt = (prompt) => {
    setViewModal(prompt);
  };

  const handleDeletePrompt = async (promptId) => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/history?id=${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Prompt deleted successfully');
        // Refresh the history
        fetchHistory();
      } else {
        toast.error('Failed to delete prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <History className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Prompt History
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            View and manage all your enhanced prompts
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <Card.Content className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search your prompts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Sources</option>
                    <option value="playground">Playground</option>
                    <option value="dashboard">Dashboard</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="longest">Longest Enhanced</option>
                    <option value="shortest">Shortest Enhanced</option>
                  </select>
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Results Count */}
        {prompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
          >
            <p className="text-sm text-gray-600">
              Showing {filteredPrompts.length} of {prompts.length} prompts
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </motion.div>
        )}

        {/* Prompts List */}
        <div className="space-y-6">
          {filteredPrompts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="text-center py-12">
                <Card.Content>
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'No matching prompts found' : 'No prompts yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms or filters'
                      : 'Start enhancing prompts to see them appear here'
                    }
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => router.push('/dashboard')}
                      variant="gradient"
                      className="group"
                    >
                      Enhance Your First Prompt
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </Card.Content>
              </Card>
            </motion.div>
          ) : (
            filteredPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card hover className="overflow-hidden">
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(prompt.timestamp)}
                        </span>
                        {prompt.source && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            prompt.source === 'playground' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {prompt.source === 'playground' ? 'Playground' : 'Dashboard'}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card.Header>
                  
                  <Card.Content>
                    <div className="space-y-4">
                      {/* Original Prompt */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Original Prompt</h4>
                          <div className="flex items-center space-x-1">
                            <Button
                              onClick={() => handleViewPrompt(prompt)}
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700"
                              title="View full prompt"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleCopyPrompt(prompt, 'original')}
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-700"
                              title="Copy original prompt"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                console.log('Adding original prompt to library:', prompt);
                                setPromptToAdd(prompt);
                                setShowAddToLibraryModal(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-green-500 hover:text-green-700"
                              title="Add to library"
                            >
                              <BookOpen className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {prompt.originalPrompt}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Prompt */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-blue-700">Enhanced Prompt</h4>
                          <div className="flex items-center space-x-1">
                            <Button
                              onClick={() => handleViewPrompt(prompt)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="View full prompt"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleCopyPrompt(prompt, 'enhanced')}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Copy enhanced prompt"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                console.log('Adding enhanced prompt to library:', prompt);
                                setPromptToAdd(prompt);
                                setShowAddToLibraryModal(true);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Add to library"
                            >
                              <BookOpen className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-800 line-clamp-4">
                            {prompt.enhancedPrompt || prompt.prompt || 'No enhanced prompt available'}
                          </p>
                        </div>
                      </div>

                      {/* AI Response (for playground entries) */}
                      {prompt.source === 'playground' && prompt.aiResponse && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-green-700">AI Response</h4>
                            <div className="flex items-center space-x-1">
                              <Button
                                onClick={() => handleCopyPrompt(prompt, 'aiResponse')}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Copy AI response"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-800 line-clamp-4">
                              {prompt.aiResponse}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      {prompt.originalPrompt && prompt.enhancedPrompt && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Original: {prompt.originalPrompt?.length || 0} chars</span>
                            <span>Enhanced: {prompt.enhancedPrompt?.length || 0} chars</span>
                            {prompt.originalPrompt?.length > 0 && (
                              <span className="text-green-600">
                                +{Math.round(((prompt.enhancedPrompt?.length - prompt.originalPrompt?.length) / prompt.originalPrompt?.length) * 100)}% improvement
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Load More (if needed in future) */}
        {filteredPrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-sm text-gray-500">
              Showing all {filteredPrompts.length} prompts
            </p>
          </motion.div>
        )}
      </div>

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Full Prompt View</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(viewModal.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setViewModal(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Original Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Original Prompt</h4>
                    <Button
                      onClick={() => handleCopyPrompt(viewModal, 'original')}
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
                      {viewModal.originalPrompt}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {viewModal.originalPrompt.length} characters
                  </div>
                </div>

                {/* Enhanced Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Enhanced Prompt</h4>
                    <Button
                      onClick={() => handleCopyPrompt(viewModal, 'enhanced')}
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
                      {viewModal.enhancedPrompt || viewModal.prompt || 'No enhanced prompt available'}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {(viewModal.enhancedPrompt || viewModal.prompt || '').length} characters
                  </div>
                </div>

                {/* Stats */}
                {viewModal.originalPrompt && viewModal.enhancedPrompt && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Enhancement Stats</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Original Length:</span>
                        <span className="ml-2 font-medium">{viewModal.originalPrompt?.length || 0} chars</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Enhanced Length:</span>
                        <span className="ml-2 font-medium">{viewModal.enhancedPrompt?.length || 0} chars</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Improvement:</span>
                        <span className="ml-2 font-medium text-green-600">
                          +{Math.round((((viewModal.enhancedPrompt?.length || 0) - (viewModal.originalPrompt?.length || 0)) / (viewModal.originalPrompt?.length || 1)) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add to Library Modal */}
      <FolderSelectionModal
        isVisible={showAddToLibraryModal}
        onClose={() => {
          setShowAddToLibraryModal(false);
          setPromptToAdd(null);
        }}
        onSelectFolder={handleAddToLibrary}
        userId={user?.uid}
        title="Add to Library"
        description={`Select a folder to save "${promptToAdd?.title || 'this prompt'}"`}
      />
    </div>
  );
}
