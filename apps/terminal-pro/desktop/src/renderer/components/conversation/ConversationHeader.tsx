import React from 'react';
import { AgentStatus } from '../../../shared/types/conversation.types';

interface ConversationHeaderProps {
  agentStatus: AgentStatus;
  messageCount: number;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  agentStatus,
  messageCount,
}) => {
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
    <div className="conversation-header">
      <div>
        <h2 className="conversation-title">Chat with Rina</h2>
        <p className="conversation-subtitle">Your AI coding assistant</p>
      </div>

      <div className="header-stats">
        <div className="agent-status">
          <div className="status-dot" style={{ backgroundColor: getStatusColor(agentStatus) }} />
          <span>{getStatusText(agentStatus)}</span>
        </div>
        <div className="message-count">{messageCount} messages</div>
      </div>
    </div>
  );
};
