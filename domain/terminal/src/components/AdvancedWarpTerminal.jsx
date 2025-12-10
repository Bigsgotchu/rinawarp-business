// Advanced Warp-Style Terminal with Command Blocks and Enhanced Features
// Full Warp Terminal emulation with RinaWarp's mermaid theme

import React, { useState, useEffect, useRef } from 'react';

export function AdvancedWarpTerminal({
  onCommand,
  logs = [],
  placeholder = 'Ask Rina anything or run a command...',
  className = '',
}) {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [commandBlocks, setCommandBlocks] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef(null);
  const logsRef = useRef(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs, commandBlocks]);

  // Command suggestions based on input
  useEffect(() => {
    if (input.trim()) {
      const suggestions = [
        {
          command: 'help me with git',
          description: 'Get git command assistance',
          category: 'git',
          confidence: 9,
        },
        {
          command: 'explain this code',
          description: 'Code explanation and review',
          category: 'code',
          confidence: 8,
        },
        {
          command: 'create a new project',
          description: 'Start a new development project',
          category: 'project',
          confidence: 7,
        },
        {
          command: 'debug this error',
          description: 'Help debug and fix errors',
          category: 'debug',
          confidence: 9,
        },
        {
          command: 'optimize performance',
          description: 'Performance optimization tips',
          category: 'performance',
          confidence: 6,
        },
        {
          command: 'deploy to production',
          description: 'Deployment assistance',
          category: 'deploy',
          confidence: 7,
        },
        {
          command: '!ai-providers',
          description: 'Show available AI providers',
          category: 'ai',
          confidence: 10,
        },
        {
          command: '!monitor',
          description: 'Show system monitoring',
          category: 'system',
          confidence: 8,
        },
        {
          command: '!stats',
          description: 'Display system statistics',
          category: 'system',
          confidence: 9,
        },
        {
          command: '!clear',
          description: 'Clear terminal output',
          category: 'terminal',
          confidence: 10,
        },
        {
          command: 'ls -la',
          description: 'List directory contents',
          category: 'filesystem',
          confidence: 8,
        },
        {
          command: 'cd ~',
          description: 'Change to home directory',
          category: 'filesystem',
          confidence: 9,
        },
        {
          command: 'git status',
          description: 'Check git repository status',
          category: 'git',
          confidence: 9,
        },
        {
          command: 'npm install',
          description: 'Install npm dependencies',
          category: 'node',
          confidence: 8,
        },
        {
          command: 'docker ps',
          description: 'List running containers',
          category: 'docker',
          confidence: 7,
        },
      ]
        .filter(
          (s) =>
            s.command.toLowerCase().includes(input.toLowerCase()) ||
            s.description.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 6);

      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showSuggestions && selectedSuggestion >= 0) {
        // Use selected suggestion
        const suggestion = suggestions[selectedSuggestion];
        setInput(suggestion.command);
        setShowSuggestions(false);
        setSelectedSuggestion(0);
        return;
      }

      // Execute command
      if (input.trim()) {
        executeCommand(input);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(0);
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestion((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Tab' && showSuggestions) {
      e.preventDefault();
      if (suggestions.length > 0) {
        const suggestion = suggestions[selectedSuggestion];
        setInput(suggestion.command);
        setShowSuggestions(false);
        setSelectedSuggestion(0);
      }
    }
  };

  const executeCommand = async (command) => {
    // Create command block
    const blockId = Date.now();
    const newBlock = {
      id: blockId,
      command,
      output: [],
      status: 'running',
      startTime: Date.now(),
    };

    setCommandBlocks((prev) => [...prev, newBlock]);
    setCurrentBlock(newBlock);
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    setInput('');
    setIsExecuting(true);

    // Simulate command execution
    setTimeout(() => {
      setIsExecuting(false);
      setCommandBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? { ...block, status: 'completed', endTime: Date.now() }
            : block
        )
      );
      setCurrentBlock(null);
    }, 1000);

    // Call the actual command handler
    onCommand(command);
  };

  const handleSuggestionClick = (index) => {
    const suggestion = suggestions[index];
    setInput(suggestion.command);
    setShowSuggestions(false);
    setSelectedSuggestion(0);
    inputRef.current?.focus();
  };

  const getStatusIcon = (status) => {
    switch (status) {
    case 'running':
      return '⏳';
    case 'completed':
      return '✅';
    case 'error':
      return '❌';
    default:
      return '⏳';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
    case 'git':
      return '📝';
    case 'code':
      return '💻';
    case 'project':
      return '📁';
    case 'debug':
      return '🐛';
    case 'performance':
      return '⚡';
    case 'deploy':
      return '🚀';
    case 'ai':
      return '🤖';
    case 'system':
      return '📊';
    case 'terminal':
      return '💻';
    case 'filesystem':
      return '📂';
    case 'node':
      return '🟢';
    case 'docker':
      return '🐳';
    default:
      return '⚡';
    }
  };

  return (
    <div className={`advanced-warp-terminal ${className}`}>
      {/* Terminal Header - Warp Style */}
      <div className="warp-header">
        <div className="warp-tabs">
          <div className="warp-tab active">
            <span className="warp-tab-icon">🧜‍♀️</span>
            <span className="warp-tab-title">RinaWarp</span>
            <span className="warp-tab-close">×</span>
          </div>
          <div className="warp-tab">
            <span className="warp-tab-icon">📊</span>
            <span className="warp-tab-title">Dashboard</span>
            <span className="warp-tab-close">×</span>
          </div>
          <div className="warp-tab-add">+</div>
        </div>

        <div className="warp-controls">
          <div className="warp-control-group">
            <button className="warp-control-btn" title="Split Pane">
              ⊞
            </button>
            <button className="warp-control-btn" title="New Tab">
              +
            </button>
            <button className="warp-control-btn" title="Settings">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="warp-content">
        {/* Command Blocks */}
        {commandBlocks.map((block) => (
          <div key={block.id} className="warp-command-block">
            <div className="warp-command-header">
              <div className="warp-command-prompt">
                <span className="warp-prompt-user">rinawarp</span>
                <span className="warp-prompt-separator">@</span>
                <span className="warp-prompt-host">macos</span>
                <span className="warp-prompt-path">~</span>
                <span className="warp-prompt-symbol">$</span>
              </div>
              <div className="warp-command-text">{block.command}</div>
              <div className="warp-command-status">
                {getStatusIcon(block.status)}
              </div>
            </div>

            {block.status === 'running' && (
              <div className="warp-command-output">
                <div className="warp-loading">
                  <div className="warp-spinner"></div>
                  <span>Executing command...</span>
                </div>
              </div>
            )}

            {block.status === 'completed' && (
              <div className="warp-command-output">
                <div className="warp-output-line">
                  Command completed successfully
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Current Command Input */}
        <div className="warp-command-block current">
          <div className="warp-command-header">
            <div className="warp-command-prompt">
              <span className="warp-prompt-user">rinawarp</span>
              <span className="warp-prompt-separator">@</span>
              <span className="warp-prompt-host">macos</span>
              <span className="warp-prompt-path">~</span>
              <span className="warp-prompt-symbol">$</span>
            </div>

            <div className="warp-command-input-container">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="warp-command-input"
                placeholder={placeholder}
                autoFocus
                disabled={isExecuting}
              />

              {/* Command Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="warp-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`warp-suggestion ${index === selectedSuggestion ? 'selected' : ''}`}
                      onClick={() => handleSuggestionClick(index)}
                    >
                      <div className="warp-suggestion-header">
                        <span className="warp-suggestion-icon">
                          {getCategoryIcon(suggestion.category)}
                        </span>
                        <span className="warp-suggestion-command">
                          {suggestion.command}
                        </span>
                        <span className="warp-suggestion-confidence">
                          {suggestion.confidence}/10
                        </span>
                      </div>
                      <div className="warp-suggestion-description">
                        {suggestion.description}
                      </div>
                      <div className="warp-suggestion-category">
                        {suggestion.category}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logs Display */}
        {logs.length > 0 && (
          <div className="warp-logs" ref={logsRef}>
            {logs.map((log, index) => (
              <div key={index} className="warp-log-line">
                <span className="warp-log-content">{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="warp-footer">
        <div className="warp-status-bar">
          <div className="warp-status-item">
            <span className="warp-status-icon">🤖</span>
            <span className="warp-status-text">AI Ready</span>
          </div>
          <div className="warp-status-item">
            <span className="warp-status-icon">🌊</span>
            <span className="warp-status-text">Mermaid Theme</span>
          </div>
          <div className="warp-status-item">
            <span className="warp-status-icon">⚡</span>
            <span className="warp-status-text">Hybrid Mode</span>
          </div>
          <div className="warp-status-item">
            <span className="warp-status-icon">📊</span>
            <span className="warp-status-text">
              {commandBlocks.length} Commands
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .advanced-warp-terminal {
          background: linear-gradient(
            135deg,
            #001122 0%,
            #002244 50%,
            #003366 100%
          );
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 0 30px rgba(0, 212, 255, 0.3),
            inset 0 0 30px rgba(0, 212, 255, 0.1);
          border: 2px solid #00d4ff;
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .advanced-warp-terminal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at 30% 20%,
            rgba(79, 195, 247, 0.1) 0%,
            transparent 50%
          );
          pointer-events: none;
          z-index: 1;
        }

        .warp-header {
          background: rgba(0, 17, 34, 0.9);
          border-bottom: 1px solid rgba(0, 212, 255, 0.3);
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 2;
        }

        .warp-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .warp-tab {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 8px 8px 0 0;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #b3e5fc;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .warp-tab.active {
          background: linear-gradient(135deg, #00d4ff, #ff6b9d);
          color: #001122;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
        }

        .warp-tab:hover:not(.active) {
          background: rgba(0, 212, 255, 0.2);
          transform: translateY(-1px);
        }

        .warp-tab-icon {
          font-size: 16px;
        }

        .warp-tab-title {
          font-weight: 500;
        }

        .warp-tab-close {
          margin-left: 4px;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .warp-tab:hover .warp-tab-close {
          opacity: 1;
        }

        .warp-tab-add {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 6px;
          padding: 6px 8px;
          color: #00ff88;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .warp-tab-add:hover {
          background: rgba(0, 255, 136, 0.2);
          transform: scale(1.1);
        }

        .warp-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .warp-control-group {
          display: flex;
          gap: 4px;
        }

        .warp-control-btn {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 6px;
          padding: 6px 8px;
          color: #b3e5fc;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .warp-control-btn:hover {
          background: rgba(0, 212, 255, 0.2);
          transform: translateY(-1px);
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }

        .warp-content {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          position: relative;
          z-index: 2;
        }

        .warp-command-block {
          background: rgba(0, 17, 34, 0.8);
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-radius: 12px;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
          box-shadow:
            0 0 20px rgba(0, 212, 255, 0.2),
            inset 0 0 20px rgba(0, 212, 255, 0.1);
          position: relative;
          transition: all 0.3s ease;
        }

        .warp-command-block.current {
          border-color: #00ff88;
          box-shadow:
            0 0 25px rgba(0, 255, 136, 0.3),
            inset 0 0 25px rgba(0, 255, 136, 0.1);
        }

        .warp-command-block:hover {
          transform: translateY(-2px);
          box-shadow:
            0 0 30px rgba(0, 212, 255, 0.3),
            inset 0 0 30px rgba(0, 212, 255, 0.2);
        }

        .warp-command-header {
          display: flex;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        .warp-command-prompt {
          display: flex;
          align-items: center;
          margin-right: 16px;
          font-size: 14px;
        }

        .warp-prompt-user {
          color: #ff6b9d;
          font-weight: bold;
          text-shadow: 0 0 5px #ff6b9d;
        }

        .warp-prompt-separator {
          color: #b3e5fc;
          margin: 0 4px;
        }

        .warp-prompt-host {
          color: #00ff88;
          font-weight: bold;
          text-shadow: 0 0 5px #00ff88;
        }

        .warp-prompt-path {
          color: #ffd700;
          margin-left: 4px;
          text-shadow: 0 0 5px #ffd700;
        }

        .warp-prompt-symbol {
          color: #00d4ff;
          margin-left: 4px;
          font-weight: bold;
          text-shadow: 0 0 5px #00d4ff;
        }

        .warp-command-text {
          flex: 1;
          color: #e0f7ff;
          font-size: 14px;
          text-shadow: 0 0 5px #00d4ff;
        }

        .warp-command-status {
          color: #00ff88;
          font-size: 16px;
          margin-left: 8px;
        }

        .warp-command-input-container {
          flex: 1;
          position: relative;
        }

        .warp-command-input {
          background: transparent;
          border: none;
          outline: none;
          color: #e0f7ff;
          font-size: 14px;
          width: 100%;
          text-shadow: 0 0 5px #00d4ff;
        }

        .warp-command-input::placeholder {
          color: rgba(224, 247, 255, 0.6);
          text-shadow: 0 0 3px #00d4ff;
        }

        .warp-command-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .warp-command-output {
          padding: 16px;
          color: #b3e5fc;
          font-size: 14px;
        }

        .warp-loading {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .warp-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-top: 2px solid #00d4ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .warp-output-line {
          color: #e0f7ff;
          margin-bottom: 4px;
        }

        .warp-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(0, 17, 34, 0.95);
          border: 2px solid #00ff88;
          border-radius: 8px;
          margin-top: 4px;
          backdrop-filter: blur(15px);
          box-shadow:
            0 0 25px rgba(0, 255, 136, 0.4),
            inset 0 0 25px rgba(0, 255, 136, 0.1);
          z-index: 10;
          max-height: 300px;
          overflow-y: auto;
        }

        .warp-suggestion {
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 6px;
          margin: 2px;
        }

        .warp-suggestion:hover {
          background: rgba(0, 255, 136, 0.2);
          transform: translateX(5px);
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        }

        .warp-suggestion.selected {
          background: linear-gradient(45deg, #00ff88, #00d4ff);
          color: #001122;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
          transform: scale(1.02);
        }

        .warp-suggestion-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .warp-suggestion-icon {
          font-size: 16px;
        }

        .warp-suggestion-command {
          font-weight: bold;
          color: #e0f7ff;
          flex: 1;
        }

        .warp-suggestion.selected .warp-suggestion-command {
          color: #001122;
        }

        .warp-suggestion-confidence {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
        }

        .warp-suggestion.selected .warp-suggestion-confidence {
          background: rgba(0, 0, 0, 0.2);
          color: #001122;
        }

        .warp-suggestion-description {
          font-size: 12px;
          color: #b3e5fc;
          margin-bottom: 2px;
        }

        .warp-suggestion.selected .warp-suggestion-description {
          color: #001122;
        }

        .warp-suggestion-category {
          font-size: 11px;
          color: #81d4fa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .warp-suggestion.selected .warp-suggestion-category {
          color: #001122;
        }

        .warp-logs {
          margin-top: 16px;
          max-height: 200px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #00d4ff rgba(0, 17, 34, 0.5);
        }

        .warp-logs::-webkit-scrollbar {
          width: 8px;
        }

        .warp-logs::-webkit-scrollbar-track {
          background: rgba(0, 17, 34, 0.5);
          border-radius: 4px;
        }

        .warp-logs::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00d4ff, #00ff88);
          border-radius: 4px;
          box-shadow: 0 0 5px #00d4ff;
        }

        .warp-log-line {
          color: #e0f7ff;
          margin-bottom: 4px;
          font-size: 14px;
          line-height: 1.5;
        }

        .warp-footer {
          background: rgba(0, 17, 34, 0.9);
          border-top: 1px solid rgba(0, 212, 255, 0.3);
          padding: 8px 16px;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 2;
        }

        .warp-status-bar {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .warp-status-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #b3e5fc;
          font-size: 12px;
        }

        .warp-status-icon {
          font-size: 14px;
        }

        .warp-status-text {
          font-weight: 500;
        }

        /* Floating bubbles animation */
        .advanced-warp-terminal::after {
          content: '🫧';
          position: absolute;
          top: 20px;
          left: 10%;
          font-size: 20px;
          animation: float 15s infinite ease-in-out;
          opacity: 0.6;
          z-index: 1;
        }

        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
          100% {
            transform: translateY(0px) rotate(360deg);
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .warp-header {
            padding: 6px 12px;
          }

          .warp-tab {
            padding: 4px 8px;
            font-size: 12px;
          }

          .warp-content {
            padding: 12px;
          }

          .warp-command-block {
            margin-bottom: 12px;
          }

          .warp-command-header {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdvancedWarpTerminal;
