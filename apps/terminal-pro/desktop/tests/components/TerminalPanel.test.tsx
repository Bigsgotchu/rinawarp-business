import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalPanel } from '../../src/renderer/components/terminal/TerminalPanel';

describe('TerminalPanel', () => {
  const mockTerminals = [
    { id: '1', name: 'Terminal 1', cwd: '/home/user', isActive: true },
    { id: '2', name: 'Terminal 2', cwd: '/home/user/project', isActive: false },
  ];

  const mockOnBackToConversation = vi.fn();

  const defaultProps = {
    terminals: mockTerminals,
    onBackToConversation: mockOnBackToConversation,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders terminal panel with header', () => {
    render(<TerminalPanel {...defaultProps} />);

    expect(screen.getByText('Terminal Output')).toBeInTheDocument();
    expect(screen.getByText('← Back to Conversation')).toBeInTheDocument();
  });

  it('renders terminal tabs', () => {
    render(<TerminalPanel {...defaultProps} />);

    expect(screen.getByText('Terminal 1')).toBeInTheDocument();
    expect(screen.getByText('Terminal 2')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('shows placeholder when no terminal is active', () => {
    render(<TerminalPanel {...defaultProps} />);

    expect(screen.getByText('Select a terminal session or create a new one')).toBeInTheDocument();
    expect(screen.getByText('Create Terminal')).toBeInTheDocument();
  });

  it('shows terminal input when terminal is selected', () => {
    render(<TerminalPanel {...defaultProps} />);

    const terminalTab = screen.getByText('Terminal 1');
    fireEvent.click(terminalTab);

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('calls onBackToConversation when back button is clicked', () => {
    render(<TerminalPanel {...defaultProps} />);

    const backButton = screen.getByText('← Back to Conversation');
    fireEvent.click(backButton);

    expect(mockOnBackToConversation).toHaveBeenCalledTimes(1);
  });

  it('toggles collapse state when collapse button is clicked', () => {
    render(<TerminalPanel {...defaultProps} />);

    const collapseButton = screen.getByText('▼');
    expect(collapseButton).toBeInTheDocument();

    // Initially expanded
    expect(screen.getByText('Terminal 1')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(collapseButton);
    expect(screen.getByText('▶')).toBeInTheDocument();

    // Content should be hidden
    expect(screen.queryByText('Terminal 1')).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(screen.getByText('▶'));
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.getByText('Terminal 1')).toBeInTheDocument();
  });

  it('renders terminal controls', () => {
    render(<TerminalPanel {...defaultProps} />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('handles terminal tab selection', () => {
    render(<TerminalPanel {...defaultProps} />);

    const terminal1Tab = screen.getByText('Terminal 1');
    const terminal2Tab = screen.getByText('Terminal 2');

    // Initially no active terminal
    expect(terminal1Tab).not.toHaveClass('active');
    expect(terminal2Tab).not.toHaveClass('active');

    // Click terminal 1
    fireEvent.click(terminal1Tab);
    expect(terminal1Tab).toHaveClass('active');
    expect(terminal2Tab).not.toHaveClass('active');

    // Click terminal 2
    fireEvent.click(terminal2Tab);
    expect(terminal1Tab).not.toHaveClass('active');
    expect(terminal2Tab).toHaveClass('active');
  });

  it('renders with empty terminals array', () => {
    render(<TerminalPanel terminals={[]} onBackToConversation={mockOnBackToConversation} />);

    expect(screen.getByText('Terminal Output')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('Select a terminal session or create a new one')).toBeInTheDocument();
  });

  it('renders close buttons for terminal tabs', () => {
    render(<TerminalPanel {...defaultProps} />);

    const closeButtons = screen.getAllByText('×');
    expect(closeButtons).toHaveLength(2); // One for each terminal
  });
});
