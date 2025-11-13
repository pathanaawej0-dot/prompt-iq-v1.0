'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Plus, Edit2, Trash2, FolderPlus } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import toast from 'react-hot-toast';

export default function FolderSelectionModal({ 
  isVisible, 
  onClose, 
  onSelectFolder,
  userId,
  title = "Select Folder",
  description = "Choose a folder to save your prompt"
}) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');

  // Fetch folders
  const fetchFolders = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      // Get token dynamically from Firebase Auth
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const authToken = await currentUser.getIdToken();
      const response = await fetch(`/api/library/folders?userId=${userId}&token=${authToken}`);
      const data = await response.json();
      
      if (response.ok) {
        setFolders(data.folders || []);
      } else {
        toast.error(data.error || 'Failed to fetch folders');
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchFolders();
    }
  }, [isVisible, userId]);

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      // Get token dynamically
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const authToken = await currentUser.getIdToken();
      const response = await fetch('/api/library/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          token: authToken,
          name: newFolderName,
          description: newFolderDescription
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setFolders(prev => [...prev, data.folder]);
        setNewFolderName('');
        setNewFolderDescription('');
        setShowCreateFolder(false);
        toast.success('Folder created successfully!');
      } else {
        toast.error(data.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Update folder
  const handleUpdateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      // Get token dynamically
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const authToken = await currentUser.getIdToken();
      const response = await fetch('/api/library/folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          token: authToken,
          folderId: editingFolder.id,
          name: newFolderName,
          description: newFolderDescription
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setFolders(prev => prev.map(f => 
          f.id === editingFolder.id 
            ? { ...f, name: newFolderName, description: newFolderDescription }
            : f
        ));
        setEditingFolder(null);
        setNewFolderName('');
        setNewFolderDescription('');
        toast.success('Folder updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update folder');
      }
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folder) => {
    if (folder.promptCount > 0) {
      toast.error('Cannot delete folder with prompts');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      return;
    }

    try {
      // Get token dynamically
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const authToken = await currentUser.getIdToken();
      const response = await fetch(`/api/library/folders?userId=${userId}&token=${authToken}&folderId=${folder.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok) {
        setFolders(prev => prev.filter(f => f.id !== folder.id));
        toast.success('Folder deleted successfully!');
      } else {
        toast.error(data.error || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const startEditing = (folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderDescription(folder.description || '');
    setShowCreateFolder(false);
  };

  const cancelEditing = () => {
    setEditingFolder(null);
    setNewFolderName('');
    setNewFolderDescription('');
  };

  const startCreating = () => {
    setShowCreateFolder(true);
    setEditingFolder(null);
    setNewFolderName('');
    setNewFolderDescription('');
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
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Create/Edit Folder Form */}
              {(showCreateFolder || editingFolder) && (
                <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {editingFolder ? 'Edit Folder' : 'Create New Folder'}
                  </h4>
                  <div className="space-y-3">
                    <Input
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newFolderDescription}
                      onChange={(e) => setNewFolderDescription(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                        size="sm"
                        className="flex-1"
                      >
                        {editingFolder ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={editingFolder ? cancelEditing : () => setShowCreateFolder(false)}
                        size="sm"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Create Folder Button */}
              {!showCreateFolder && !editingFolder && (
                <Button
                  variant="outline"
                  onClick={startCreating}
                  className="w-full mb-4 border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create New Folder
                </Button>
              )}

              {/* Folders List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading folders...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {folders.map((folder) => (
                    <Card
                      key={folder.id}
                      hover
                      className="p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                      onClick={() => onSelectFolder(folder)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Folder className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{folder.name}</h4>
                            <p className="text-sm text-gray-600">
                              {folder.promptCount || 0} prompts
                              {folder.description && ` • ${folder.description}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(folder);
                            }}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {folder.name !== 'Personal' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder);
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
