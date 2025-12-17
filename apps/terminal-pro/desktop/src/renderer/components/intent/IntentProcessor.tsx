import React from 'react';
import { Intent, ActionProposal, ActionResult } from '../../../shared/types/conversation.types';

interface IntentProcessorProps {
  currentIntent: Intent | null;
  proposals: ActionProposal[];
  isProcessing: boolean;
  onExecuteAction: (actionId: string) => Promise<ActionResult>;
  onBackToConversation: () => void;
}

export const IntentProcessor: React.FC<IntentProcessorProps> = ({
  currentIntent,
  proposals,
  isProcessing,
  onExecuteAction,
  onBackToConversation,
}) => {
  const handleExecuteAction = async (actionId: string) => {
    try {
      await onExecuteAction(actionId);
    } catch (error) {
      console.error('Failed to execute action:', error);
    }
  };

  return (
    <div className="intent-processor">
      <div className="intent-header">
        <button className="back-button" onClick={onBackToConversation}>
          ← Back to Conversation
        </button>
        <h2>Intent Processing</h2>
      </div>

      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <span>Processing your intent...</span>
        </div>
      )}

      {currentIntent && (
        <div className="current-intent">
          <h3>Current Intent</h3>
          <p>{currentIntent.text}</p>
          <div className="intent-confidence">
            Confidence: {Math.round(currentIntent.confidence * 100)}%
          </div>
        </div>
      )}

      {proposals.length > 0 && (
        <div className="action-proposals">
          <h3>Proposed Actions</h3>
          {proposals.map((proposal) => (
            <div key={proposal.id} className="action-proposal">
              <div className="proposal-header">
                <h4>{proposal.title}</h4>
                <span className={`risk-level ${proposal.riskLevel}`}>
                  {proposal.riskLevel.toUpperCase()}
                </span>
              </div>

              <p className="proposal-description">{proposal.description}</p>

              <div className="proposal-consequences">
                <h5>Consequences:</h5>
                <ul>
                  {proposal.consequences.map((consequence, index) => (
                    <li key={index} className={consequence.impact}>
                      {consequence.description}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="proposal-actions">
                <button className="execute-btn" onClick={() => handleExecuteAction(proposal.id)}>
                  Execute Action
                </button>
                <button className="cancel-btn" onClick={() => console.log('Cancel action')}>
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isProcessing && !currentIntent && proposals.length === 0 && (
        <div className="empty-state">
          <p>No active intents. Start a conversation to create intents.</p>
        </div>
      )}
    </div>
  );
};
