import { useState, useCallback } from 'react';
export const useIntent = () => {
    const [currentIntent, setCurrentIntent] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    // Process natural language into intent
    const processIntent = useCallback(async (text) => {
        setIsProcessing(true);
        try {
            // Send to main process for intent processing
            const response = await window.electronAPI?.intentProcess?.({
                text,
                context: {
                    currentDirectory: '/home/user/project',
                    openFiles: [],
                    recentActions: [],
                },
            });
            if (response?.proposals) {
                setProposals(response.proposals);
            }
        }
        catch (error) {
            console.error('Failed to process intent:', error);
        }
        finally {
            setIsProcessing(false);
        }
    }, []);
    // Execute an action
    const executeAction = useCallback(async (actionId) => {
        try {
            const response = await window.electronAPI?.intentExecuteAction?.({
                actionId,
                mode: 'safe', // Default to safe mode
            });
            const result = {
                success: response?.success || false,
                message: response?.message || 'Action completed',
                changes: response?.changes || [],
                executionTime: response?.executionTime || 0,
            };
            setLastResult(result);
            return result;
        }
        catch (error) {
            const errorResult = {
                success: false,
                message: `Action failed: ${error}`,
                changes: [],
                executionTime: 0,
            };
            setLastResult(errorResult);
            return errorResult;
        }
    }, []);
    // Clear current intent
    const clearIntent = useCallback(() => {
        setCurrentIntent(null);
        setProposals([]);
        setLastResult(null);
    }, []);
    return {
        currentIntent,
        proposals,
        isProcessing,
        lastResult,
        setCurrentIntent,
        processIntent,
        executeAction,
        clearIntent,
    };
};
