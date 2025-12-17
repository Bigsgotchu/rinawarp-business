import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AgentStatus } from '../../../shared/types/conversation.types';
import { MessageBubble } from './MessageBubble';
import { ConversationHeader } from './ConversationHeader';
import { IntentInput } from './IntentInput';

interface ConversationInterfaceProps {
  messages: ChatMessage[];
  isTyping: boolean;
  agentStatus: AgentStatus;
  onSendMessage: (content: string) => Promise<void>;
  onIntentDetected: (intent: any) => void;
}

export const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  messages,
  isTyping,
  agentStatus,
  onSendMessage,
  onIntentDetected,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const message = inputValue.trim();
    setInputValue('');

    await onSendMessage(message);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="conversation-interface">
      <ConversationHeader agentStatus={agentStatus} messageCount={messages.length} />

      <div className="conversation-messages">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={message.id === messages[messages.length - 1]?.id}
          />
        ))}

        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">Rina is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <IntentInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        disabled={isTyping}
        placeholder="Tell Rina what you want to build or do..."
      />
    </div>
  );
};
