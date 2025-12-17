import React, { useState, useEffect } from 'react';
import { TerminalButton } from './TerminalComponents';

const AIConfigPanel = ({ isOpen, onClose, aiSystem }) => {
  const [config, setConfig] = useState(null);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [newProvider, setNewProvider] = useState({ id: '', apiKey: '' });
  const [voiceConfig, setVoiceConfig] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    if (isOpen && aiSystem) {
      setConfig(aiSystem.getAIConfigPanel());
      // Load voice configuration
      fetch('/api/voice/config')
        .then((res) => res.json())
        .then((data) => setVoiceConfig(data))
        .catch((err) => console.error('Failed to load voice config:', err));

      // Load available voices
      fetch('/api/voice/voices')
        .then((res) => res.json())
        .then((data) => setAvailableVoices(data))
        .catch((err) => console.error('Failed to load voices:', err));
    }
  }, [isOpen, aiSystem]);

  const handleModeChange = (mode) => {
    if (aiSystem) {
      aiSystem.setMode(mode);
      setConfig(aiSystem.getAIConfigPanel());
    }
  };

  const handleTestProvider = async (providerKey) => {
    if (!aiSystem) return;

    setTestingProvider(providerKey);
    try {
      const result = await aiSystem.testProvider(providerKey);
      setTestResults((prev) => ({
        ...prev,
        [providerKey]: result,
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [providerKey]: { success: false, error: error.message },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleAddProvider = async () => {
    if (!newProvider.id || !newProvider.apiKey) return;

    try {
      const response = await fetch('/api/ai/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider),
      });

      if (response.ok) {
        setNewProvider({ id: '', apiKey: '' });
        // Refresh config
        setConfig(aiSystem.getAIConfigPanel());
      }
    } catch (error) {
      console.error('Failed to add provider:', error);
    }
  };

  const handleRemoveProvider = async (providerId) => {
    try {
      const response = await fetch(`/api/ai/providers/${providerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh config
        setConfig(aiSystem.getAIConfigPanel());
      }
    } catch (error) {
      console.error('Failed to remove provider:', error);
    }
  };

  const handleUpdateVoiceConfig = async (newConfig) => {
    try {
      const response = await fetch('/api/voice/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (response.ok) {
        setVoiceConfig(newConfig);
      }
    } catch (error) {
      console.error('Failed to update voice config:', error);
    }
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-pink-400">
              🧠 AI Configuration
            </h2>
            <TerminalButton onClick={onClose} variant="ghost" size="sm">
              ✕ Close
            </TerminalButton>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Selection */}
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              Operating Mode
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.availableModes.map((mode) => (
                <div
                  key={mode.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    config.currentMode === mode.id
                      ? 'border-pink-400 bg-pink-400/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handleModeChange(mode.id)}
                >
                  <div className="font-semibold text-white">{mode.name}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {mode.description}
                  </div>
                  {config.currentMode === mode.id && (
                    <div className="text-xs text-pink-400 mt-2">✓ Active</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Provider Status */}
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              AI Providers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(config.providers).map(([key, provider]) => (
                <div
                  key={key}
                  className="p-4 rounded-lg border border-gray-600 bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-white">
                        {provider.name}
                      </div>
                      <div className="text-sm text-gray-400 capitalize">
                        {provider.type}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          provider.health === 'healthy'
                            ? 'bg-green-400'
                            : provider.health === 'degraded'
                              ? 'bg-yellow-400'
                              : provider.health === 'unhealthy'
                                ? 'bg-red-400'
                                : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-xs text-gray-400 capitalize">
                        {provider.health}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mb-3">
                    Available: {provider.available ? '✓' : '✗'} | Rate Limited:{' '}
                    {provider.rateLimited ? 'Yes' : 'No'} | Priority:{' '}
                    {provider.priority}
                  </div>

                  <TerminalButton
                    onClick={() => handleTestProvider(key)}
                    variant="ghost"
                    size="sm"
                    disabled={testingProvider === key || !provider.available}
                    className="w-full"
                  >
                    {testingProvider === key ? 'Testing...' : 'Test Connection'}
                  </TerminalButton>

                  {testResults[key] && (
                    <div
                      className={`mt-2 text-xs p-2 rounded ${
                        testResults[key].success
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {testResults[key].success
                        ? '✓ Connected'
                        : `✗ ${testResults[key].error}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Insights */}
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              Learning Engine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-gray-600 bg-gray-800">
                <div className="text-2xl font-bold text-pink-400">
                  {config.learning.skillLevel}
                </div>
                <div className="text-sm text-gray-400">Skill Level</div>
              </div>
              <div className="p-4 rounded-lg border border-gray-600 bg-gray-800">
                <div className="text-2xl font-bold text-blue-400">
                  {config.learning.totalCommands}
                </div>
                <div className="text-sm text-gray-400">Commands Learned</div>
              </div>
              <div className="p-4 rounded-lg border border-gray-600 bg-gray-800">
                <div className="text-2xl font-bold text-green-400">
                  {config.learning.vocabularySize}
                </div>
                <div className="text-sm text-gray-400">Vocabulary Words</div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg border border-gray-600 bg-gray-800">
              <div className="text-sm text-gray-400 mb-2">Top Commands</div>
              <div className="flex flex-wrap gap-2">
                {config.learning.topCommands.slice(0, 5).map((cmd, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                  >
                    {cmd.command} ({cmd.count})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border border-gray-600 bg-gray-800">
                <div className="text-2xl font-bold text-yellow-400">
                  {config.performance.averageResponseTime}ms
                </div>
                <div className="text-sm text-gray-400">Avg Response Time</div>
              </div>
              <div className="p-4 rounded-lg border border-gray-600 bg-gray-800">
                <div className="text-2xl font-bold text-green-400">
                  {(config.performance.successRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div className="p-4 rounded-lg border border-gray-600 bg-gray-800">
                <div className="text-2xl font-bold text-blue-400">
                  {config.performance.totalRequests}
                </div>
                <div className="text-sm text-gray-400">Total Requests</div>
              </div>
              <div className="p-4 rounded-lg border border-gray-600 bg-gray-800">
                <div className="text-2xl font-bold text-purple-400">
                  {config.learning.predictions.accuracy * 100}%
                </div>
                <div className="text-sm text-gray-400">Prediction Accuracy</div>
              </div>
            </div>
          </div>

          {/* Dynamic Provider Management */}
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              Manage AI Providers
            </h3>
            <div className="p-4 rounded-lg border border-gray-600 bg-gray-800">
              <div className="mb-4">
                <h4 className="text-md font-semibold text-white mb-2">
                  Add New Provider
                </h4>
                <div className="flex gap-2 mb-2">
                  <select
                    value={newProvider.id}
                    onChange={(e) =>
                      setNewProvider((prev) => ({
                        ...prev,
                        id: e.target.value,
                      }))
                    }
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="">Select Provider</option>
                    <option value="openai">OpenAI</option>
                    <option value="groq">Groq</option>
                    <option value="claude">Claude</option>
                    <option value="gemini">Gemini</option>
                    <option value="ollama">Ollama</option>
                  </select>
                  <input
                    type="password"
                    placeholder="API Key"
                    value={newProvider.apiKey}
                    onChange={(e) =>
                      setNewProvider((prev) => ({
                        ...prev,
                        apiKey: e.target.value,
                      }))
                    }
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                  <TerminalButton
                    onClick={handleAddProvider}
                    variant="primary"
                    size="sm"
                  >
                    Add
                  </TerminalButton>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-white mb-2">
                  Remove Providers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(config.providers).map((providerId) => (
                    <div
                      key={providerId}
                      className="flex items-center gap-2 bg-gray-700 p-2 rounded"
                    >
                      <span className="text-white">{providerId}</span>
                      <TerminalButton
                        onClick={() => handleRemoveProvider(providerId)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </TerminalButton>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Voice Configuration */}
          {voiceConfig && (
            <div>
              <h3 className="text-lg font-semibold text-blue-300 mb-3">
                Voice Configuration
              </h3>
              <div className="p-4 rounded-lg border border-gray-600 bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Voice ID
                    </label>
                    <select
                      value={voiceConfig.voiceId}
                      onChange={(e) =>
                        handleUpdateVoiceConfig({
                          ...voiceConfig,
                          voiceId: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      {availableVoices.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Model
                    </label>
                    <select
                      value={voiceConfig.model}
                      onChange={(e) =>
                        handleUpdateVoiceConfig({
                          ...voiceConfig,
                          model: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="eleven_monolingual_v1">
                        Eleven Monolingual v1
                      </option>
                      <option value="eleven_multilingual_v2">
                        Eleven Multilingual v2
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Stability
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voiceConfig.stability}
                      onChange={(e) =>
                        handleUpdateVoiceConfig({
                          ...voiceConfig,
                          stability: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">
                      {voiceConfig.stability}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Similarity Boost
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voiceConfig.similarityBoost}
                      onChange={(e) =>
                        handleUpdateVoiceConfig({
                          ...voiceConfig,
                          similarityBoost: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">
                      {voiceConfig.similarityBoost}
                    </span>
                  </div>
                </div>
                <TerminalButton
                  onClick={() => handleUpdateVoiceConfig(voiceConfig)}
                  variant="primary"
                  size="sm"
                >
                  Save Voice Config
                </TerminalButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIConfigPanel;
