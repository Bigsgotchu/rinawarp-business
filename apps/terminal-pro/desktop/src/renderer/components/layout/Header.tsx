import React from 'react';
import { AgentStatus } from '../../../shared/types/conversation.types';

interface HeaderProps {
  agentStatus: AgentStatus;
  currentView: 'conversation' | 'intent' | 'terminal';
  onViewChange: (view: 'conversation' | 'intent' | 'terminal') => void;
}

export const Header: React.FC<HeaderProps> = ({ agentStatus, currentView, onViewChange }) => {
  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.CONNECTED:
        return '#10b981';
      case AgentStatus.ERROR:
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.CONNECTED:
        return 'Connected';
      case AgentStatus.ERROR:
        return 'Disconnected';
      default:
        return 'Connecting...';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">RinaWarp</h1>
        <span className="app-subtitle">Terminal Pro</span>
      </div>

      <div className="header-center">
        <nav className="view-navigation">
          <button
            className={`nav-button ${currentView === 'conversation' ? 'active' : ''}`}
            onClick={() => onViewChange('conversation')}
          >
            💬 Conversation
          </button>
          <button
            className={`nav-button ${currentView === 'intent' ? 'active' : ''}`}
            onClick={() => onViewChange('intent')}
          >
            🎯 Intent
          </button>
          <button
            className={`nav-button ${currentView === 'terminal' ? 'active' : ''}`}
            onClick={() => onViewChange('terminal')}
          >
            💻 Terminal
          </button>
        </nav>
      </div>

      <div className="header-right">
        <div className="agent-status">
          <div
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(agentStatus) }}
          />
          <span className="status-text">{getStatusText(agentStatus)}</span>
        </div>

        <div className="header-actions">
          <button className="header-button" title="Settings">
            ⚙️
          </button>
          <button className="header-button" title="Help">
            ❓
          </button>
        </div>
      </div>
    </header>
  );
};
