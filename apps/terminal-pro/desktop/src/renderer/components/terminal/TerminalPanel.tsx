import React, { useState } from 'react';

interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  isActive: boolean;
}

interface TerminalPanelProps {
  terminals: TerminalSession[];
  onBackToConversation: () => void;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  terminals,
  onBackToConversation,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTerminal, setActiveTerminal] = useState<string | null>(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <button className="back-button" onClick={onBackToConversation}>
          ← Back to Conversation
        </button>

        <h3>Terminal Output</h3>

        <button className="collapse-button" onClick={toggleCollapse}>
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="terminal-content">
          <div className="terminal-tabs">
            {terminals.map((terminal) => (
              <button
                key={terminal.id}
                className={`terminal-tab ${activeTerminal === terminal.id ? 'active' : ''}`}
                onClick={() => setActiveTerminal(terminal.id)}
              >
                {terminal.name}
                <span
                  className="close-tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle close terminal
                  }}
                >
                  ×
                </span>
              </button>
            ))}

            <button
              className="new-terminal-btn"
              onClick={() => {
                // Handle create new terminal
              }}
            >
              +
            </button>
          </div>

          <div className="terminal-output">
            {activeTerminal ? (
              <div className="terminal-session">
                <div className="terminal-prompt">
                  <span className="prompt-symbol">$</span>
                  <input
                    type="text"
                    className="terminal-input"
                    placeholder="Type a command..."
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <div className="terminal-placeholder">
                <p>Select a terminal session or create a new one</p>
                <button
                  className="create-terminal-btn"
                  onClick={() => {
                    // Handle create terminal
                  }}
                >
                  Create Terminal
                </button>
              </div>
            )}
          </div>

          <div className="terminal-controls">
            <button className="terminal-btn">Clear</button>
            <button className="terminal-btn">Export</button>
            <button className="terminal-btn">Settings</button>
          </div>
        </div>
      )}
    </div>
  );
};
