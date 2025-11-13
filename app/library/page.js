'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Copy, 
  Star, 
  Eye, 
  Sparkles, 
  BookOpen,
  TrendingUp,
  Heart,
  X,
  Zap,
  Folder,
  ArrowLeft,
  Plus,
  MoreVertical,
  Move,
  Edit2,
  Trash2,
  FolderPlus
} from 'lucide-react';
import { updateDoc, doc, deleteDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FolderSelectionModal from '../../components/ui/FolderSelectionModal';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State management
  const [folders, setFolders] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [promptToMove, setPromptToMove] = useState(null);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');

  // Categories based on the API generation
  const categories = [
    'all',
    'Strategy & Planning',
    'Content Creation',
    'Problem Solving',
    'Communication',
    'Productivity & Automation'
  ];

  // Redirect if not authenticated or onboarding not complete
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      // Don't redirect if user exists - let them see library even if not fully onboarded
    }
  }, [user, authLoading, router]);

  // Fetch folders
  const fetchFolders = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch(`/api/library/folders?userId=${user.uid}&token=${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setFolders(data.folders || []);
        
        // Also check for orphaned prompts (prompts without folderId)
        const promptsResponse = await fetch(`/api/library/prompts?userId=${user.uid}&token=${token}&folderId=all`);
        const promptsData = await promptsResponse.json();
        
        const orphanedPrompts = [];
        if (promptsResponse.ok && promptsData.prompts) {
          promptsData.prompts.forEach(prompt => {
            if (!prompt.folderId && !prompt.deleted) {
              orphanedPrompts.push(prompt);
            }
          });
        }
        
        console.log('Orphaned prompts (no folderId):', orphanedPrompts.length);
        
        // If there are orphaned prompts, assign them to Personal folder
        if (orphanedPrompts.length > 0 && data.folders?.length > 0) {
          const personalFolder = data.folders.find(f => f.name === 'Personal');
          if (personalFolder) {
            console.log('Assigning orphaned prompts to Personal folder');
            await assignOrphanedPromptsToPersonal(orphanedPrompts, personalFolder.id);
          }
        }
        
      } else {
        console.error('Folders API error:', data);
        toast.error(data.error || 'Failed to fetch folders');
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  };

  // Assign orphaned prompts to Personal folder
  const assignOrphanedPromptsToPersonal = async (orphanedPrompts, personalFolderId) => {
    try {
      for (const prompt of orphanedPrompts) {
        const promptRef = doc(db, 'users', user.uid, 'library', prompt.id);
        await updateDoc(promptRef, {
          folderId: personalFolderId,
          updatedAt: new Date()
        });
      }
      
      // Update Personal folder count
      const token = await user.getIdToken();
      await fetch('/api/library/folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          token,
          folderId: personalFolderId,
          incrementCount: orphanedPrompts.length
        })
      });
      
      console.log(`Assigned ${orphanedPrompts.length} orphaned prompts to Personal folder`);
    } catch (error) {
      console.error('Error assigning orphaned prompts:', error);
    }
  };

  // Fetch prompts for a specific folder (including default folder with folderId: null)
  const fetchPromptsForFolder = async (folderId) => {
    try {
      setLoading(true);
      console.log('Fetching prompts for folder:', folderId);
      
      const token = await user.getIdToken();
      const folderParam = folderId === null ? 'null' : folderId;
      const response = await fetch(`/api/library/prompts?userId=${user.uid}&token=${token}&folderId=${folderParam}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error fetching prompts:', data);
        toast.error(data.error || 'Failed to fetch prompts');
        return;
      }
      
      let promptsData = data.prompts || [];
      
      // Convert createdAt strings back to Date objects for sorting
      promptsData = promptsData.map(prompt => ({
        ...prompt,
        createdAt: prompt.createdAt ? new Date(prompt.createdAt) : new Date()
      }));

      // Sort by order field for default folder, or by createdAt for others
      if (folderId === null || folderId === 'default') {
        promptsData = promptsData.sort((a, b) => (a.order || 0) - (b.order || 0));
      } else {
        promptsData = promptsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      console.log(`Found ${promptsData.length} prompts for folder ${folderId}`);
      console.log('Prompts data:', promptsData.map(p => ({ id: p.id, title: p.title, folderId: p.folderId })));
      
      setPrompts(promptsData);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  // Copy prompt to clipboard and increment usage
  const handleCopy = async (prompt) => {
    try {
      console.log('Copying prompt:', prompt);
      
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(prompt.prompt);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = prompt.prompt;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      // Increment usage count in Firestore
      if (user?.uid && prompt?.id) {
        const promptRef = doc(db, 'users', user.uid, 'library', prompt.id);
        await updateDoc(promptRef, {
          usageCount: increment(1)
        });
        
        // Update local state
        setPrompts(prev => prev.map(p => 
          p.id === prompt.id ? { ...p, usageCount: (p.usageCount || 0) + 1 } : p
        ));
      }

      toast.success('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Error copying prompt:', error);
      toast.error('Failed to copy prompt. Please try again.');
    }
  };

  // Handle enhance - redirect to dashboard with prompt pre-filled
  const handleEnhance = (prompt) => {
    localStorage.setItem('enhancePrompt', prompt.prompt);
    router.push('/dashboard');
  };

  // Toggle favorite status
  const handleFavorite = async (prompt) => {
    try {
      const promptRef = doc(db, 'users', user.uid, 'library', prompt.id);
      const newFavoriteStatus = !prompt.isFavorite;
      
      await updateDoc(promptRef, {
        isFavorite: newFavoriteStatus
      });
      
      // Update local state
      setPrompts(prev => prev.map(p => 
        p.id === prompt.id ? { ...p, isFavorite: newFavoriteStatus } : p
      ));

      toast.success(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!');
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  // Move prompt to different folder
  const handleMovePrompt = async (targetFolder) => {
    if (!promptToMove || !user?.uid) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/library/move-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          token,
          promptId: promptToMove.id,
          targetFolderId: targetFolder.id,
          sourceType: 'library'
        })
      });

      if (response.ok) {
        // Remove prompt from current view
        setPrompts(prev => prev.filter(p => p.id !== promptToMove.id));
        toast.success(`Moved to "${targetFolder.name}" folder!`);
        
        // Refresh folders to update counts
        fetchFolders();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to move prompt');
      }
    } catch (error) {
      console.error('Error moving prompt:', error);
      toast.error('Failed to move prompt');
    } finally {
      setShowMoveModal(false);
      setPromptToMove(null);
    }
  };

  // Delete folder with confirmation modal
  const handleDeleteFolder = (folder) => {
    if (folder.name === 'Personal') {
      toast.error('Cannot delete Personal folder');
      return;
    }

    // Set folder to delete and show confirmation modal instantly
    setFolderToDelete(folder);
    setShowDeleteFolderModal(true);
  };

  // Confirm delete folder
  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      const token = await user.getIdToken();
      
      // First delete all prompts in the folder
      if (folderToDelete.promptCount > 0) {
        const libraryRef = collection(db, 'users', user.uid, 'library');
        const q = query(libraryRef, where('folderId', '==', folderToDelete.id));
        const querySnapshot = await getDocs(q);
        
        // Delete all prompts in the folder
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      // Then delete the folder
      const response = await fetch(`/api/library/folders?userId=${user.uid}&token=${token}&folderId=${folderToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFolders(prev => prev.filter(f => f.id !== folderToDelete.id));
        toast.success(`Folder "${folderToDelete.name}" and all its prompts deleted successfully!`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    } finally {
      setShowDeleteFolderModal(false);
      setFolderToDelete(null);
    }
  };

  // Delete prompt
  const handleDeletePrompt = async (prompt) => {
    if (!confirm(`Are you sure you want to delete "${prompt.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete the document completely
      const promptRef = doc(db, 'users', user.uid, 'library', prompt.id);
      await deleteDoc(promptRef);

      // Remove from local state
      setPrompts(prev => prev.filter(p => p.id !== prompt.id));
      
      // Update folder count in Firestore
      if (currentFolder) {
        const token = await user.getIdToken();
        const response = await fetch('/api/library/folders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            token,
            folderId: currentFolder.id,
            name: currentFolder.name,
            description: currentFolder.description,
            decrementCount: true
          })
        });

        // Update local folder count
        setFolders(prev => prev.map(f => 
          f.id === currentFolder.id 
            ? { ...f, promptCount: Math.max(0, (f.promptCount || 1) - 1) }
            : f
        ));
      }

      toast.success('Prompt deleted successfully!');
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
    }
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/library/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          token,
          name: newFolderName.trim(),
          description: newFolderDescription.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setFolders(prev => [...prev, data.folder]);
        setNewFolderName('');
        setNewFolderDescription('');
        setShowCreateFolderModal(false);
        toast.success('Folder created successfully!');
      } else {
        toast.error(data.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Filter and sort prompts
  const filteredPrompts = prompts
    .filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.useCase?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'most-used':
          return (b.usageCount || 0) - (a.usageCount || 0);
        case 'favorites':
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  // Folder view (main library page)
  if (!currentFolder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
                Your Prompt Library
              </h1>
              <p className="text-center text-gray-600">Organize your prompts in folders</p>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Organize your prompts in folders for better management
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{folders.length}</h3>
              <p className="text-gray-600">Folders</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {folders.reduce((sum, folder) => sum + (folder.promptCount || 0), 0)}
              </h3>
              <p className="text-gray-600">Total Prompts</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
              <p className="text-gray-600">Favorites</p>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your library...</p>
            </div>
          )}

          {/* Folders Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Default Library Folder (for prompts with folderId: null) */}
              <motion.div
                key="default-library"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card 
                  hover 
                  className="p-6 cursor-pointer transition-all duration-200 hover:shadow-lg group relative border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
                  onClick={(e) => {
                    if (!e.target.closest('button')) {
                      setCurrentFolder({ id: null, name: 'Generated Library', description: 'Your AI-generated personalized prompts' });
                      fetchPromptsForFolder(null);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-600 font-medium">
                        Auto-Generated
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Generated Library
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Your AI-generated personalized prompts
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      From Onboarding
                    </span>
                    <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </div>
                </Card>
              </motion.div>

              {/* Regular Folders */}
              {folders.map((folder, index) => (
                <motion.div
                key={folder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  hover 
                  className="p-6 cursor-pointer transition-all duration-200 hover:shadow-lg group relative"
                  onClick={(e) => {
                    // Only navigate if not clicking on delete button
                    if (!e.target.closest('button')) {
                      setCurrentFolder(folder);
                      fetchPromptsForFolder(folder.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {folder.promptCount || 0} prompts
                      </span>
                      {/* Delete button removed for now */}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {folder.name}
                  </h3>
                  
                  {folder.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {folder.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                    <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </div>
                </Card>
              </motion.div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && folders.length === 0 && (
            <Card className="p-12 text-center">
              <FolderPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No folders yet</h3>
              <p className="text-gray-600 mb-4">
                Complete your onboarding to generate your first prompt library!
              </p>
              <Button onClick={() => router.push('/onboarding')}>
                Complete Onboarding
              </Button>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Prompts view (inside a folder)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentFolder(null)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Folders</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📁 {currentFolder.name}
              </h1>
              <p className="text-gray-600">
                {filteredPrompts.length} prompts
                {currentFolder.description && ` • ${currentFolder.description}`}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-used">Most Used</option>
            <option value="favorites">Favorites</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card hover className="h-full flex flex-col">
                <Card.Content className="p-6 flex-1">
                  {/* Category and Role badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {prompt.category}
                    </span>
                    {prompt.targetRole && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {prompt.targetRole}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {prompt.title}
                  </h3>

                  {/* Use case */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {prompt.useCase}
                  </p>

                  {/* Prompt preview */}
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {prompt.prompt}
                  </p>

                  {/* Usage stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Used {prompt.usageCount || 0} times</span>
                    {prompt.isFavorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                  </div>
                </Card.Content>

                {/* Actions */}
                <Card.Footer className="p-6 pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedPrompt(prompt)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEnhance(prompt)}
                      className="flex-1"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Enhance
                    </Button>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCopy(prompt)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFavorite(prompt)}
                      className={prompt.isFavorite ? 'text-red-600 border-red-200' : ''}
                    >
                      <Star className={`w-4 h-4 ${prompt.isFavorite ? 'fill-current' : ''}`} />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPromptToMove(prompt);
                        setShowMoveModal(true);
                      }}
                    >
                      <Move className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt)}
                      className="text-red-500 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredPrompts.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No prompts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'This folder is empty. Add some prompts to get started!'
              }
            </p>
          </Card>
        )}

        {/* View Prompt Modal */}
        {selectedPrompt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">{selectedPrompt.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPrompt(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Use Case</h4>
                    <p className="text-gray-700">{selectedPrompt.useCase}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Full Prompt</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedPrompt.prompt}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={() => handleCopy(selectedPrompt)}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Prompt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFavorite(selectedPrompt)}
                    className={selectedPrompt.isFavorite ? 'text-red-600 border-red-200' : ''}
                  >
                    <Star className={`w-4 h-4 ${selectedPrompt.isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Move Prompt Modal */}
        <FolderSelectionModal
          isVisible={showMoveModal}
          onClose={() => {
            setShowMoveModal(false);
            setPromptToMove(null);
          }}
          onSelectFolder={handleMovePrompt}
          userId={user?.uid}
          title="Move Prompt"
          description={`Select a folder to move "${promptToMove?.title}"`}
        />

        {/* Modals removed for now - keeping it simple */}
      </div>
    </div>
  );
}
