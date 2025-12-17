import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/auth';
import { FaBrain, FaSearch, FaTag, FaCopy, FaPaperPlane, FaFilter } from 'react-icons/fa';

const AIMemory = ({ teamId }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [memoryTypeFilter, setMemoryTypeFilter] = useState('all');
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const authToken = getToken();

  useEffect(() => {
    if (!teamId) return;

    const fetchMemories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/team/search-memory?teamId=${teamId}&query=${encodeURIComponent(searchQuery)}&type=${memoryTypeFilter}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch AI memories');
        }

        const data = await response.json();
        setMemories(data.memories || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching AI memories:', err);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to avoid rapid firing
    const timer = setTimeout(fetchMemories, 300);
    return () => clearTimeout(timer);
  }, [teamId, searchQuery, memoryTypeFilter, authToken]);

  const filteredMemories = memories.filter(memory =>
    memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (memory.tags && memory.tags.some(tag =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleCopyToClipboard = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    });
  };

  const handleSendToRina = (content) => {
    // This would integrate with the desktop app
    console.log('Send to Rina:', content);
    alert('This would open Rina in Terminal Pro with the selected memory');
  };

  if (loading && memories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading AI memories: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Team AI Memory</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search AI memory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mermid-500 focus:border-mermid-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={memoryTypeFilter}
              onChange={(e) => setMemoryTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mermid-500 focus:border-mermid-500 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="note">Notes</option>
              <option value="fix">Fixes</option>
              <option value="snippet">Snippets</option>
              <option value="command">Commands</option>
            </select>
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="space-y-4">
          {filteredMemories.length > 0 ? (
            filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedMemory(memory)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <FaBrain className="text-mermid-600" />
                    <span className="font-medium text-gray-900">
                      {memory.content.split('\n')[0].substring(0, 50)}{memory.content.length > 50 ? '...' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(memory.created_at)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {memory.tags && memory.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-mermid-100 text-mermid-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-gray-600">
                  <p>{memory.content.substring(0, 100)}{memory.content.length > 100 ? '...' : ''}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaBrain className="mx-auto text-4xl text-mermid-300 mb-4" />
              <p>No AI memories found</p>
              <p className="text-sm mt-1">Team AI memories will appear here as they're created</p>
            </div>
          )}
        </div>
      </div>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Memory Details</h3>
              <button
                onClick={() => setSelectedMemory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaBrain className="text-mermid-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-900">{selectedMemory.memory_type}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaClock className="text-mermid-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedMemory.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaTag className="text-mermid-600 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMemory.tags && selectedMemory.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-mermid-100 text-mermid-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">Content</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                    {selectedMemory.content}
                  </pre>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleCopyToClipboard(selectedMemory.content)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  <FaCopy className="inline mr-2" />
                  Copy to Clipboard
                </button>

                <button
                  onClick={() => handleSendToRina(selectedMemory.content)}
                  className="flex-1 bg-mermid-600 hover:bg-mermid-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  <FaPaperPlane className="inline mr-2" />
                  Send to Rina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Success Toast */}
      {showCopySuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <FaCopy className="inline mr-2" />
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default AIMemory;