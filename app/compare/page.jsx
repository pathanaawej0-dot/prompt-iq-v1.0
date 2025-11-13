'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ComparePage() {
  const { user, getRemainingCredits, updateUserCredits, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [libraryPrompts, setLibraryPrompts] = useState([]);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch library prompts and refresh credits
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        // Refresh user profile to get latest credits
        await refreshUserProfile();
        
        // Fetch library prompts
        const token = await user.getIdToken();
        const response = await fetch(`/api/library/prompts?userId=${user.uid}&token=${token}&folderId=all`);
        const data = await response.json();
        
        if (response.ok) {
          setLibraryPrompts(data.prompts || []);
        } else {
          console.error('Error fetching prompts:', data.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [user, refreshUserProfile]);

  // Toggle prompt selection
  const togglePromptSelection = (promptId) => {
    if (selectedPrompts.includes(promptId)) {
      setSelectedPrompts(selectedPrompts.filter(id => id !== promptId));
    } else {
      if (selectedPrompts.length < 5) {
        setSelectedPrompts([...selectedPrompts, promptId]);
      } else {
        toast.error('Maximum 5 prompts to compare');
      }
    }
  };

  // Compare selected prompts
  const handleCompare = async () => {
    // Clear any previous errors
    setError(null);
    
    if (selectedPrompts.length < 2) {
      setError('Select at least 2 prompts to compare');
      return;
    }

    const remainingCredits = getRemainingCredits();
    console.log('Frontend credits check:', remainingCredits); // Debug log
    
    if (remainingCredits <= 0) {
      toast.error('No credits remaining! Please upgrade your plan.');
      setTimeout(() => router.push('/upgrade'), 2000);
      return;
    }

    try {
      setLoading(true);

      // Get full prompt data
      const promptsToCompare = libraryPrompts.filter(p => 
        selectedPrompts.includes(p.id)
      );

      const token = await user.getIdToken();
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompts: promptsToCompare.map(p => ({
            id: p.id,
            title: p.title || 'Untitled',
            prompt: p.prompt
          }))
        })
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to compare');
      }

      setComparison(data.analysis);
      
      // Update credits
      await updateUserCredits();
      await refreshUserProfile();
      
      toast.success('Prompts compared successfully!');

    } catch (error) {
      console.error('Compare error:', error);
      setLoading(false);
      const errorMessage = error.message || 'Network error';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  const credits = getRemainingCredits();
  console.log('Compare page credits:', credits); // Debug log

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Prompts</h1>
          <p className="text-gray-600 mb-4">
            Select 2-5 prompts to compare and analyze which works best
          </p>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
              <span className="text-sm text-gray-600">Credits:</span>
              <span className="font-semibold text-blue-600">{credits}</span>
            </div>
            <button
              onClick={async () => {
                await refreshUserProfile();
                toast.success('Credits refreshed!');
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Prompt Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Select Prompts ({selectedPrompts.length}/5)
          </h2>

          {libraryPrompts.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p className="mb-4">No prompts in library. Create some first.</p>
              <button
                onClick={() => router.push('/library')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Go to Library
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {libraryPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  onClick={() => togglePromptSelection(prompt.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPrompts.includes(prompt.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedPrompts.includes(prompt.id)}
                      onChange={() => {}}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{prompt.title || 'Untitled'}</p>
                      <p className="text-sm text-gray-600" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {prompt.prompt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleCompare}
            disabled={loading || selectedPrompts.length < 2 || credits < 1}
            className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg"
          >
            {loading ? 'Comparing...' : `Compare Selected Prompts (1 Credit)`}
          </button>
        </div>

        {/* Comparison Results */}
        {comparison && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparison Analysis</h2>

            {/* Overall Recommendation */}
            {comparison.recommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">🏆 Recommendation:</h3>
                <p className="text-blue-800">{comparison.recommendation}</p>
              </div>
            )}

            {/* Individual Scores */}
            <div className="space-y-4">
              {comparison.scores && comparison.scores.map((score, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{score.title}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{score.score}/100</div>
                      <div className="text-xs text-gray-500">{score.efficiency}</div>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Clarity</span>
                        <span className="font-medium">{score.metrics.clarity}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${score.metrics.clarity}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Specificity</span>
                        <span className="font-medium">{score.metrics.specificity}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${score.metrics.specificity}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Completeness</span>
                        <span className="font-medium">{score.metrics.completeness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${score.metrics.completeness}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">{score.analysis}</p>
                </div>
              ))}
            </div>

            {/* Clear Results */}
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  setComparison(null);
                  setSelectedPrompts([]);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
              >
                Compare Different Prompts
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
