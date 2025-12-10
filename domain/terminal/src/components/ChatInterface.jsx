import React, { useState, useRef, useEffect } from 'react';
import {
  TerminalHeader,
  TerminalInput,
  TerminalButton,
  LoadingSpinner,
} from './TerminalComponents';

const ChatInterface = ({ onSubmit, isLoading, messages }) => {
  const [message, setMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('groq');
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const providers = [
    { id: 'groq', name: 'Groq', icon: '⚡', description: 'Fast inference' },
    { id: 'openai', name: 'OpenAI', icon: '🧠', description: 'GPT models' },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: '🔒',
      description: 'Claude models',
    },
    { id: 'ollama', name: 'Ollama', icon: '🏠', description: 'Local models' },
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      provider: selectedProvider,
      timestamp: new Date(),
      type: 'user',
    };

    setChatHistory((prev) => [...prev, newMessage]);
    onSubmit(message, selectedProvider);
    setMessage('');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      <TerminalHeader
        title="AI Chat Interface"
        subtitle="Chat with AI assistants using various providers"
        className="mb-6"
      />

      {/* Provider Selection */}
      <div className="mb-6">
        <h3 className="text-mermaid-cyan font-semibold mb-3">
          Select AI Provider
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {providers.map((provider) => (
            <TerminalButton
              key={provider.id}
              variant={selectedProvider === provider.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedProvider(provider.id)}
              className="flex flex-col items-center p-4 h-auto"
            >
              <span className="text-2xl mb-1">{provider.icon}</span>
              <span className="font-semibold">{provider.name}</span>
              <span className="text-xs opacity-80">{provider.description}</span>
            </TerminalButton>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-mermaid-ocean/80 backdrop-blur-md border border-mermaid-cyan/30 rounded-xl p-4 mb-4 overflow-y-auto">
        {chatHistory.length === 0 ? (
          <div className="text-mermaid-text/60 text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <div>Start a conversation with your AI assistant!</div>
            <div className="text-sm mt-2">
              Choose a provider above and type your message below.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-mermaid-cyan text-mermaid-ocean'
                      : 'bg-mermaid-chrome/80 text-mermaid-text border border-mermaid-cyan/30'
                  }`}
                >
                  <div className="text-sm">{msg.content}</div>
                  <div className={'text-xs mt-1 opacity-70'}>
                    {msg.type === 'user' ? 'You' : provider.name} •{' '}
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator for current response */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-mermaid-chrome/80 text-mermaid-text border border-mermaid-cyan/30 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="relative">
        <TerminalInput
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSubmit(e);
            }
          }}
          placeholder={`Message ${providers.find((p) => p.id === selectedProvider)?.name}... (Enter to send, Shift+Enter for new line)`}
        />

        {/* Send button */}
        <TerminalButton
          type="submit"
          variant="primary"
          size="sm"
          disabled={!message.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Send'}
        </TerminalButton>
      </form>

      {/* Quick prompts */}
      <div className="mt-4">
        <div className="text-sm text-mermaid-text/60 mb-2">Quick prompts:</div>
        <div className="flex flex-wrap gap-2">
          {[
            'Help me debug this error',
            'Explain this code',
            'Write a function for...',
            'How do I optimize this?',
          ].map((prompt, index) => (
            <button
              key={index}
              onClick={() => setMessage(prompt)}
              className="px-3 py-1 bg-mermaid-chrome/50 hover:bg-mermaid-cyan/20 text-mermaid-text rounded-full text-sm transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
