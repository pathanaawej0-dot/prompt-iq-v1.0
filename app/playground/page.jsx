'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// Removed Firestore imports - now using Neon API
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PlaygroundPage() {
  const { user, getRemainingCredits, updateUserCredits, refreshUserProfile } = useAuth();
  const router = useRouter();
  
  // State for desktop side-by-side view
  const [isDesktop, setIsDesktop] = useState(true);
  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' or 'test' on mobile
  
  // Left chat (prompt generation)
  const [leftInput, setLeftInput] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [leftLoading, setLeftLoading] = useState(false);
  
  // Right chat (prompt testing)
  const [rightInput, setRightInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [rightLoading, setRightLoading] = useState(false);
  
  // Global state
  const [error, setError] = useState(null);
  const [folders, setFolders] = useState([]);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [libraryItems, setLibraryItems] = useState([]);


  // Check desktop/mobile
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Fetch folders for save modal
  useEffect(() => {
    if (!user || !showSaveModal) return;
    
    const fetchFolders = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/library/folders?userId=${user.uid}&token=${token}`);
        const data = await response.json();
        if (response.ok) {
          setFolders(data.folders || []);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };
    
    fetchFolders();
  }, [user, showSaveModal]);

  // Generate optimized prompt (LEFT SIDE)
  const handleGeneratePrompt = async () => {
    if (!leftInput.trim()) {
      setError('Please enter a prompt');
      return;
    }


    const remainingCredits = getRemainingCredits();
    if (remainingCredits <= 0) {
      toast.error('No credits remaining! Please upgrade your plan.');
      setTimeout(() => router.push('/upgrade'), 2000);
      return;
    }

    try {
      setLeftLoading(true);
      setError(null);

      const token = await user.getIdToken();
      const requestBody = {
        userQuery: leftInput.trim(),
        mode: 'generate' // Just generate, don't execute
      };
      
      console.log('Sending generate request:', requestBody); // Debug log
      console.log('Query length:', requestBody.userQuery.length); // Debug log
      
      const response = await fetch('/api/playground', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      setLeftLoading(false);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      setGeneratedPrompt(data.optimizedPrompt);
      setRightInput(data.optimizedPrompt); // Auto-fill right side
      
      // Update credits
      await updateUserCredits();
      await refreshUserProfile();
      
      // Auto-save to history via Neon API (already handled by playground API)

      toast.success('Prompt generated successfully!');

    } catch (error) {
      console.error('Generate error:', error);
      setLeftLoading(false);
      const errorMessage = error.message || 'Network error';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Test prompt (RIGHT SIDE)
  const handleTestPrompt = async () => {
    if (!rightInput.trim()) {
      setError('Please enter a prompt to test');
      return;
    }


    const remainingCredits = getRemainingCredits();
    if (remainingCredits <= 0) {
      toast.error('No credits remaining! Please upgrade your plan.');
      setTimeout(() => router.push('/upgrade'), 2000);
      return;
    }

    try {
      setRightLoading(true);
      setError(null);

      const token = await user.getIdToken();
      const requestBody = {
        userQuery: rightInput.trim(),
        mode: 'test' // Execute and return result
      };
      
      console.log('Sending test request:', requestBody); // Debug log
      console.log('Query length:', requestBody.userQuery.length); // Debug log
      
      const response = await fetch('/api/playground', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      setRightLoading(false);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test');
      }

      console.log('Test API response:', data); // Debug log
      setTestResult(data.result);
      
      // Update credits
      await updateUserCredits();
      await refreshUserProfile();

      // Auto-save to history via Neon API (already handled by playground API)

      toast.success('Prompt tested successfully!');

    } catch (error) {
      console.error('Test error:', error);
      setRightLoading(false);
      const errorMessage = error.message || 'Network error';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Load from library/history
  const handleLoadFromLibrary = async () => {
    try {
      const token = await user.getIdToken();
      
      // Fetch recent library items
      const libraryResponse = await fetch(`/api/library/prompts?userId=${user.uid}&token=${token}&folderId=all`);
      const libraryData = await libraryResponse.json();
      
      // Fetch recent history via Neon API
      const historyResponse = await fetch('/api/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const historyItems = historyResponse.ok ? await historyResponse.json() : [];

      const libraryPrompts = (libraryData.prompts || []).map(item => ({
        ...item,
        type: 'library',
        title: item.title || 'Untitled'
      }));

      setLibraryItems([...libraryPrompts, ...historyItems]);
      setShowLibraryModal(true);
      
    } catch (error) {
      console.error('Error loading from library:', error);
      toast.error('Failed to load items');
    }
  };

  // Copy to clipboard
  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  // Save to library
  const handleSaveToLibrary = async (folderId) => {
    if (!generatedPrompt) {
      setError('No prompt to save');
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/library/prompts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: leftInput.substring(0, 50) + '...',
          prompt: generatedPrompt,
          folderId: folderId || null,
          category: 'Playground',
          source: 'playground',
          usageCount: 0,
          isFavorite: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to library');
      }
      
      toast.success('Saved to library!');
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving:', error);
      setError('Failed to save');
      toast.error('Failed to save to library');
    }
  };

  // Load item from library/history
  const handleLoadItem = (item) => {
    setRightInput(item.prompt);
    setShowLibraryModal(false);
    toast.success('Loaded successfully!');
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  const credits = getRemainingCredits();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop View */}
      {isDesktop ? (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white border-b p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Playground</h1>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Generate and test prompts side-by-side</p>
                <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">Credits:</span>
                  <span className="font-bold text-blue-600">{credits}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full max-w-7xl mx-auto">
              {/* LEFT SIDE - Generate Prompt */}
              <div className="w-1/2 border-r flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Prompt</h2>
                  
                  {/* Input */}
                  <div className="mb-4">
                    <textarea
                      value={leftInput}
                      onChange={(e) => setLeftInput(e.target.value)}
                      placeholder="Enter your idea..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                      disabled={leftLoading}
                    />
                    <div className="text-xs mt-1 text-gray-500">
                      {leftInput.length} characters
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
                      {error}
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={handleGeneratePrompt}
                    disabled={leftLoading || !leftInput.trim() || credits < 1}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg mb-6"
                  >
                    {leftLoading ? 'Generating...' : 'Generate Optimized Prompt'}
                  </button>

                  {/* Generated Prompt */}
                  {generatedPrompt && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Your Optimized Prompt:</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">
                          {generatedPrompt}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(generatedPrompt, 'Prompt')}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => setShowSaveModal(true)}
                          className="flex-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm rounded"
                        >
                          Save to Library
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* DIVIDER */}
              <div className="w-0.5 bg-gray-200"></div>

              {/* RIGHT SIDE - Test Prompt */}
              <div className="w-1/2 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Test Prompt</h2>
                    <button
                      onClick={handleLoadFromLibrary}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                      title="Load from library or history"
                    >
                      Load
                    </button>
                  </div>

                  {/* Test Input */}
                  <div className="mb-4">
                    <textarea
                      value={rightInput}
                      onChange={(e) => setRightInput(e.target.value)}
                      placeholder="Enter prompt to test..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={6}
                      disabled={rightLoading}
                    />
                    <div className="text-xs mt-1 text-gray-500">
                      {rightInput.length} characters
                    </div>
                  </div>

                  {/* Test Button */}
                  <button
                    onClick={handleTestPrompt}
                    disabled={rightLoading || !rightInput.trim() || credits < 1}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg mb-6"
                  >
                    {rightLoading ? 'Testing...' : 'Test Prompt'}
                  </button>

                  {/* Test Result */}
                  {testResult && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Result:</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">
                          {testResult}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(testResult, 'Result')}
                        className="w-full mt-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded"
                      >
                        Copy Result
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MOBILE VIEW - TABS */
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white border-b p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Playground</h1>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Generate and test</p>
              <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded">
                <span className="text-xs text-gray-600">Credits:</span>
                <span className="font-bold text-blue-600 text-sm">{credits}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b flex">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 py-3 text-center font-medium border-b-2 ${
                activeTab === 'prompt'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`flex-1 py-3 text-center font-medium border-b-2 ${
                activeTab === 'test'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Test
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'prompt' ? (
              <div>
                <textarea
                  value={leftInput}
                  onChange={(e) => setLeftInput(e.target.value)}
                  placeholder="Enter your idea..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                  rows={5}
                />
                <button
                  onClick={handleGeneratePrompt}
                  disabled={leftLoading || !leftInput.trim()}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg mb-3"
                >
                  {leftLoading ? 'Generating...' : 'Generate'}
                </button>
                {generatedPrompt && (
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{generatedPrompt}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(generatedPrompt, 'Prompt')}
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex gap-2 mb-3">
                  <textarea
                    value={rightInput}
                    onChange={(e) => setRightInput(e.target.value)}
                    placeholder="Enter prompt to test..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={5}
                  />
                  <button
                    onClick={handleLoadFromLibrary}
                    className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs self-start"
                    title="Load"
                  >
                    Load
                  </button>
                </div>
                <button
                  onClick={handleTestPrompt}
                  disabled={rightLoading || !rightInput.trim()}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium rounded-lg mb-3"
                >
                  {rightLoading ? 'Testing...' : 'Test'}
                </button>
                {testResult && (
                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-48 overflow-y-auto mb-2">
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{testResult}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(testResult, 'Result')}
                      className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Library Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Load from Library & History</h3>
                <button
                  onClick={() => setShowLibraryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {libraryItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items found</p>
                ) : (
                  libraryItems.map((item, index) => (
                    <button
                      key={`${item.type}-${item.id}-${index}`}
                      onClick={() => handleLoadItem(item)}
                      className="w-full text-left p-4 border border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 truncate">
                          {item.title}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          item.type === 'library' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.prompt}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Save to Library</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              <button
                onClick={() => handleSaveToLibrary(null)}
                className="w-full text-left px-4 py-3 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Default Folder
              </button>
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleSaveToLibrary(folder.id)}
                  className="w-full text-left px-4 py-3 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {folder.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSaveModal(false)}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
