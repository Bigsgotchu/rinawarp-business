import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIntent } from '../../src/renderer/hooks/useIntent';
import { IntentStatus } from '../../src/shared/types/conversation.types';

// Mock electronAPI
const mockIntentProcess = vi.fn();
const mockIntentExecuteAction = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Setup electronAPI mock
  Object.defineProperty(window, 'electronAPI', {
    value: {
      intentProcess: mockIntentProcess,
      intentExecuteAction: mockIntentExecuteAction,
    },
    writable: true,
  });
});

describe('useIntent', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useIntent());

    expect(result.current.currentIntent).toBeNull();
    expect(result.current.proposals).toEqual([]);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.lastResult).toBeNull();
  });

  it('should process intent successfully', async () => {
    const mockProposals = [
      {
        id: '1',
        title: 'Create React App',
        description: 'Set up a new React application',
        confidence: 0.9,
        actions: [],
      },
    ];

    mockIntentProcess.mockResolvedValue({
      proposals: mockProposals,
    });

    const { result } = renderHook(() => useIntent());

    await act(async () => {
      await result.current.processIntent('create a react app');
    });

    expect(mockIntentProcess).toHaveBeenCalledWith({
      text: 'create a react app',
      context: {
        currentDirectory: '/home/user/project',
        openFiles: [],
        recentActions: [],
      },
    });

    expect(result.current.proposals).toEqual(mockProposals);
    expect(result.current.isProcessing).toBe(false);
  });

  it('should handle intent processing error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockIntentProcess.mockRejectedValue(new Error('Processing failed'));

    const { result } = renderHook(() => useIntent());

    await act(async () => {
      await result.current.processIntent('invalid intent');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to process intent:', expect.any(Error));
    expect(result.current.isProcessing).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should execute action successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Action completed successfully',
      changes: ['file1.ts', 'file2.ts'],
      executionTime: 150,
    };

    mockIntentExecuteAction.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useIntent());

    let actionResult;
    await act(async () => {
      actionResult = await result.current.executeAction('action-1');
    });

    expect(mockIntentExecuteAction).toHaveBeenCalledWith({
      actionId: 'action-1',
      mode: 'safe',
    });

    expect(actionResult).toEqual({
      success: true,
      message: 'Action completed successfully',
      changes: ['file1.ts', 'file2.ts'],
      executionTime: 150,
    });

    expect(result.current.lastResult).toEqual(actionResult);
  });

  it('should handle action execution failure', async () => {
    mockIntentExecuteAction.mockRejectedValue(new Error('Action failed'));

    const { result } = renderHook(() => useIntent());

    let actionResult;
    await act(async () => {
      actionResult = await result.current.executeAction('action-1');
    });

    expect(actionResult).toEqual({
      success: false,
      message: 'Action failed: Error: Action failed',
      changes: [],
      executionTime: 0,
    });

    expect(result.current.lastResult).toEqual(actionResult);
  });

  it('should clear intent state', () => {
    const { result } = renderHook(() => useIntent());

    act(() => {
      const testIntent = {
        id: '1',
        text: 'test intent',
        confidence: 0.8,
        entities: [],
        context: {
          currentDirectory: '/home/user',
          openFiles: [],
          recentActions: [],
          userSkillLevel: 'intermediate' as const,
        },
        status: IntentStatus.PENDING,
        createdAt: new Date(),
        sessionId: 'session-1',
      };
      result.current.setCurrentIntent(testIntent);
      result.current.clearIntent();
    });

    expect(result.current.currentIntent).toBeNull();
    expect(result.current.proposals).toEqual([]);
    expect(result.current.lastResult).toBeNull();
  });

  it('should set current intent', () => {
    const { result } = renderHook(() => useIntent());
    const testIntent = {
      id: '1',
      text: 'test intent',
      confidence: 0.8,
      entities: [],
      context: {
        currentDirectory: '/home/user',
        openFiles: [],
        recentActions: [],
        userSkillLevel: 'intermediate' as const,
      },
      status: IntentStatus.PENDING,
      createdAt: new Date(),
      sessionId: 'session-1',
    };

    act(() => {
      result.current.setCurrentIntent(testIntent);
    });

    expect(result.current.currentIntent).toEqual(testIntent);
  });

  it('should set processing state during intent processing', async () => {
    mockIntentProcess.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const { result } = renderHook(() => useIntent());

    act(() => {
      result.current.processIntent('test');
    });

    expect(result.current.isProcessing).toBe(true);

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
  });
});
