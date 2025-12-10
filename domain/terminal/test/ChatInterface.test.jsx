import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInterface from '../src/components/ChatInterface.jsx';

// Mock dependencies
vi.mock('../src/components/TerminalComponents.jsx', () => ({
  TerminalHeader: ({ title, subtitle }) => (
    <div>
      {title} - {subtitle}
    </div>
  ),
  TerminalInput: ({ value, onChange, onKeyDown, placeholder }) => (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      data-testid="terminal-input"
    />
  ),
  TerminalButton: ({ children, onClick, disabled, variant }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  LoadingSpinner: ({ size }) => (
    <div data-testid="loading-spinner" data-size={size}>
      Spinner
    </div>
  ),
}));

describe('ChatInterface', () => {
  const mockOnSubmit = vi.fn();
  const mockMessages = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <ChatInterface
        onSubmit={mockOnSubmit}
        isLoading={false}
        messages={mockMessages}
      />
    );
    expect(screen.getByText('AI Chat Interface')).toBeInTheDocument();
    expect(screen.getByText('Select AI Provider')).toBeInTheDocument();
  });

  it('allows provider selection', () => {
    render(
      <ChatInterface
        onSubmit={mockOnSubmit}
        isLoading={false}
        messages={mockMessages}
      />
    );
    const groqButton = screen.getByText('Groq');
    fireEvent.click(groqButton);
    expect(groqButton).toHaveAttribute('data-variant', 'primary');
  });

  it('handles message input and submission', () => {
    render(
      <ChatInterface
        onSubmit={mockOnSubmit}
        isLoading={false}
        messages={mockMessages}
      />
    );
    const input = screen.getByTestId('terminal-input');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('Test message', 'groq');
    expect(input.value).toBe('');
  });

  it('prevents submission when loading', () => {
    render(
      <ChatInterface
        onSubmit={mockOnSubmit}
        isLoading={true}
        messages={mockMessages}
      />
    );
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });

  it('displays quick prompts', () => {
    render(
      <ChatInterface
        onSubmit={mockOnSubmit}
        isLoading={false}
        messages={mockMessages}
      />
    );
    expect(screen.getByText('Help me debug this error')).toBeInTheDocument();
    expect(screen.getByText('Explain this code')).toBeInTheDocument();
  });

  it('sets message from quick prompt', () => {
    render(
      <ChatInterface
        onSubmit={mockOnSubmit}
        isLoading={false}
        messages={mockMessages}
      />
    );
    const promptButton = screen.getByText('Help me debug this error');
    fireEvent.click(promptButton);
    const input = screen.getByTestId('terminal-input');
    expect(input.value).toBe('Help me debug this error');
  });
});
