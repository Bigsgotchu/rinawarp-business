import React from 'react';
import { ChatMessage, MessageType } from '../../../shared/types/conversation.types';

interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast = false }) => {
  const isUser = message.type === MessageType.USER;
  const isAgent = message.type === MessageType.AGENT;
  const isSystem = message.type === MessageType.SYSTEM;

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`message-bubble-container ${isUser ? 'user' : 'agent'} ${isLast ? 'last' : ''}`}
    >
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'agent-bubble'}`}>
        <div className="message-content">{message.content}</div>

        {message.metadata && (
          <div className="message-metadata">
            {message.metadata.processingTime && (
              <span className="processing-time">{message.metadata.processingTime}ms</span>
            )}
            {message.metadata.confidence && (
              <span className="confidence">
                {Math.round(message.metadata.confidence * 100)}% confident
              </span>
            )}
          </div>
        )}
      </div>

      <div className="message-footer">
        <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>

        {isAgent && (
          <div className="message-actions">
            <button className="action-btn" title="Copy message">
              📋
            </button>
            <button className="action-btn" title="Regenerate response">
              🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
