import React, { useState, useEffect } from 'react';
import {
  TerminalHeader,
  TerminalButton,
  TerminalInput,
} from './TerminalComponents';

const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    // AI Provider Settings
    aiProviders: {
      openai: { apiKey: '', enabled: true },
      anthropic: { apiKey: '', enabled: true },
      groq: { apiKey: '', enabled: true },
      ollama: { url: 'http://localhost:11434', enabled: true },
    },

    // Voice Settings
    voice: {
      elevenlabs: { apiKey: '', voiceId: '', enabled: true },
      pushToTalk: { key: 'Space', enabled: true },
      autoSpeak: false,
    },

    // Theme Settings
    theme: {
      current: 'mermaid',
      animations: true,
      glowEffects: true,
    },

    // Workspace Settings
    workspace: {
      paths: ['/home/karina/Documents'],
      autoAnalyze: true,
      excludedDirs: ['node_modules', '.git', 'dist'],
    },

    // Terminal Settings
    terminal: {
      fontSize: 14,
      lineHeight: 1.5,
      autoComplete: true,
      historySize: 1000,
    },
  });

  const [activeTab, setActiveTab] = useState('ai');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'ai', name: 'AI Providers', icon: '🤖' },
    { id: 'voice', name: 'Voice', icon: '🎤' },
    { id: 'theme', name: 'Theme', icon: '🎨' },
    { id: 'workspace', name: 'Workspace', icon: '📁' },
    { id: 'terminal', name: 'Terminal', icon: '💻' },
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleProviderSettingChange = (provider, key, value) => {
    setSettings((prev) => ({
      ...prev,
      aiProviders: {
        ...prev.aiProviders,
        [provider]: {
          ...prev.aiProviders[provider],
          [key]: value,
        },
      },
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to backend
      const response = await fetch('/api/settings/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Show success feedback
        console.log('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `rinawarp-settings-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setSettings(imported);
        } catch (error) {
          console.error('Error importing settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderAIProvidersTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-mermaid-cyan mb-4">
        AI Provider Configuration
      </h3>

      {Object.entries(settings.aiProviders).map(([provider, config]) => (
        <div
          key={provider}
          className="bg-mermaid-ocean/50 rounded-lg p-4 border border-mermaid-cyan/30"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-mermaid-text capitalize">
              {provider}
            </h4>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) =>
                  handleProviderSettingChange(
                    provider,
                    'enabled',
                    e.target.checked
                  )
                }
                className="rounded"
              />
              <span className="text-sm">Enabled</span>
            </label>
          </div>

          <div className="space-y-3">
            {provider !== 'ollama' && (
              <div>
                <label className="block text-sm text-mermaid-text/80 mb-1">
                  API Key
                </label>
                <TerminalInput
                  value={config.apiKey}
                  onChange={(e) =>
                    handleProviderSettingChange(
                      provider,
                      'apiKey',
                      e.target.value
                    )
                  }
                  placeholder={`Enter ${provider} API key`}
                  type="password"
                />
              </div>
            )}

            {provider === 'ollama' && (
              <div>
                <label className="block text-sm text-mermaid-text/80 mb-1">
                  Ollama URL
                </label>
                <TerminalInput
                  value={config.url}
                  onChange={(e) =>
                    handleProviderSettingChange(provider, 'url', e.target.value)
                  }
                  placeholder="http://localhost:11434"
                />
              </div>
            )}

            <TerminalButton
              variant="ghost"
              size="sm"
              onClick={() => {
                /* Test connection */
              }}
            >
              Test Connection
            </TerminalButton>
          </div>
        </div>
      ))}
    </div>
  );

  const renderVoiceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-mermaid-cyan mb-4">
        Voice Synthesis Settings
      </h3>

      <div className="bg-mermaid-ocean/50 rounded-lg p-4 border border-mermaid-cyan/30 space-y-4">
        <div>
          <label className="block text-sm text-mermaid-text/80 mb-1">
            ElevenLabs API Key
          </label>
          <TerminalInput
            value={settings.voice.elevenlabs.apiKey}
            onChange={(e) =>
              handleSettingChange('voice', 'elevenlabs', {
                ...settings.voice.elevenlabs,
                apiKey: e.target.value,
              })
            }
            placeholder="Enter ElevenLabs API key"
            type="password"
          />
        </div>

        <div>
          <label className="block text-sm text-mermaid-text/80 mb-1">
            Voice ID
          </label>
          <TerminalInput
            value={settings.voice.elevenlabs.voiceId}
            onChange={(e) =>
              handleSettingChange('voice', 'elevenlabs', {
                ...settings.voice.elevenlabs,
                voiceId: e.target.value,
              })
            }
            placeholder="Enter voice ID"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-mermaid-text">
            Auto-speak responses
          </span>
          <input
            type="checkbox"
            checked={settings.voice.autoSpeak}
            onChange={(e) =>
              handleSettingChange('voice', 'autoSpeak', e.target.checked)
            }
            className="rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-mermaid-text">Push-to-talk</span>
          <input
            type="checkbox"
            checked={settings.voice.pushToTalk.enabled}
            onChange={(e) =>
              handleSettingChange('voice', 'pushToTalk', {
                ...settings.voice.pushToTalk,
                enabled: e.target.checked,
              })
            }
            className="rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-mermaid-text/80 mb-1">
            Push-to-talk Key
          </label>
          <select
            value={settings.voice.pushToTalk.key}
            onChange={(e) =>
              handleSettingChange('voice', 'pushToTalk', {
                ...settings.voice.pushToTalk,
                key: e.target.value,
              })
            }
            className="bg-mermaid-ocean border border-mermaid-cyan/30 rounded px-3 py-2 text-mermaid-text"
          >
            <option value="Space">Space</option>
            <option value="Control">Control</option>
            <option value="Alt">Alt</option>
            <option value="Shift">Shift</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderThemeTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-mermaid-cyan mb-4">
        Theme Settings
      </h3>

      <div className="bg-mermaid-ocean/50 rounded-lg p-4 border border-mermaid-cyan/30 space-y-4">
        <div>
          <label className="block text-sm text-mermaid-text/80 mb-1">
            Current Theme
          </label>
          <select
            value={settings.theme.current}
            onChange={(e) =>
              handleSettingChange('theme', 'current', e.target.value)
            }
            className="bg-mermaid-ocean border border-mermaid-cyan/30 rounded px-3 py-2 text-mermaid-text"
          >
            <option value="mermaid">Mermaid</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="cyberpunk">Cyberpunk</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-mermaid-text">Enable animations</span>
          <input
            type="checkbox"
            checked={settings.theme.animations}
            onChange={(e) =>
              handleSettingChange('theme', 'animations', e.target.checked)
            }
            className="rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-mermaid-text">Enable glow effects</span>
          <input
            type="checkbox"
            checked={settings.theme.glowEffects}
            onChange={(e) =>
              handleSettingChange('theme', 'glowEffects', e.target.checked)
            }
            className="rounded"
          />
        </div>
      </div>
    </div>
  );

  const renderWorkspaceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-mermaid-cyan mb-4">
        Workspace Configuration
      </h3>

      <div className="bg-mermaid-ocean/50 rounded-lg p-4 border border-mermaid-cyan/30 space-y-4">
        <div>
          <label className="block text-sm text-mermaid-text/80 mb-2">
            Project Paths
          </label>
          <div className="space-y-2">
            {settings.workspace.paths.map((path, index) => (
              <div key={index} className="flex space-x-2">
                <TerminalInput
                  value={path}
                  onChange={(e) => {
                    const newPaths = [...settings.workspace.paths];
                    newPaths[index] = e.target.value;
                    handleSettingChange('workspace', 'paths', newPaths);
                  }}
                  placeholder="/path/to/project"
                />
                <TerminalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPaths = settings.workspace.paths.filter(
                      (_, i) => i !== index
                    );
                    handleSettingChange('workspace', 'paths', newPaths);
                  }}
                >
                  Remove
                </TerminalButton>
              </div>
            ))}
            <TerminalButton
              variant="ghost"
              size="sm"
              onClick={() =>
                handleSettingChange('workspace', 'paths', [
                  ...settings.workspace.paths,
                  '',
                ])
              }
            >
              Add Path
            </TerminalButton>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-mermaid-text">
            Auto-analyze projects
          </span>
          <input
            type="checkbox"
            checked={settings.workspace.autoAnalyze}
            onChange={(e) =>
              handleSettingChange('workspace', 'autoAnalyze', e.target.checked)
            }
            className="rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-mermaid-text/80 mb-1">
            Excluded Directories
          </label>
          <TerminalInput
            value={settings.workspace.excludedDirs.join(', ')}
            onChange={(e) =>
              handleSettingChange(
                'workspace',
                'excludedDirs',
                e.target.value.split(',').map((s) => s.trim())
              )
            }
            placeholder="node_modules, .git, dist"
          />
        </div>
      </div>
    </div>
  );

  const renderTerminalTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-mermaid-cyan mb-4">
        Terminal Preferences
      </h3>

      <div className="bg-mermaid-ocean/50 rounded-lg p-4 border border-mermaid-cyan/30 space-y-4">
        <div>
          <label className="block text-sm text-mermaid-text/80 mb-1">
            Font Size
          </label>
          <input
            type="range"
            min="10"
            max="24"
            value={settings.terminal.fontSize}
            onChange={(e) =>
              handleSettingChange(
                'terminal',
                'fontSize',
                parseInt(e.target.value)
              )
            }
            className="w-full"
          />
          <div className="text-sm text-mermaid-text/60">
            {settings.terminal.fontSize}px
          </div>
        </div>

        <div>
          <label className="block text-sm text-mermaid-text/80 mb-1">
            Line Height
          </label>
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={settings.terminal.lineHeight}
            onChange={(e) =>
              handleSettingChange(
                'terminal',
                'lineHeight',
                parseFloat(e.target.value)
              )
            }
            className="w-full"
          />
          <div className="text-sm text-mermaid-text/60">
            {settings.terminal.lineHeight}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-mermaid-text">Enable autocomplete</span>
          <input
            type="checkbox"
            checked={settings.terminal.autoComplete}
            onChange={(e) =>
              handleSettingChange('terminal', 'autoComplete', e.target.checked)
            }
            className="rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-mermaid-text/80 mb-1">
            Command History Size
          </label>
          <input
            type="number"
            min="100"
            max="5000"
            value={settings.terminal.historySize}
            onChange={(e) =>
              handleSettingChange(
                'terminal',
                'historySize',
                parseInt(e.target.value)
              )
            }
            className="bg-mermaid-ocean border border-mermaid-cyan/30 rounded px-3 py-2 text-mermaid-text w-full"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col p-6">
      <TerminalHeader
        title="Settings"
        subtitle="Configure your RinaWarp Terminal Pro experience"
        className="mb-6"
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-mermaid-ocean/50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-mermaid-cyan text-mermaid-ocean shadow-glow'
                : 'text-mermaid-text/70 hover:text-mermaid-text hover:bg-mermaid-ocean/30'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'ai' && renderAIProvidersTab()}
        {activeTab === 'voice' && renderVoiceTab()}
        {activeTab === 'theme' && renderThemeTab()}
        {activeTab === 'workspace' && renderWorkspaceTab()}
        {activeTab === 'terminal' && renderTerminalTab()}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-mermaid-cyan/30">
        <div className="flex space-x-3">
          <TerminalButton variant="ghost" size="sm" onClick={exportSettings}>
            Export Settings
          </TerminalButton>

          <label>
            <TerminalButton variant="ghost" size="sm" as="span">
              Import Settings
            </TerminalButton>
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
        </div>

        <TerminalButton
          variant="primary"
          size="sm"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </TerminalButton>
      </div>
    </div>
  );
};

export default SettingsPanel;
