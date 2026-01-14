export type AppState = 'draft' | 'preview' | 'awaiting_approval' | 'executing' | 'verifying' | 'done' | 'failed';

export interface SessionModel {
  state: AppState;
  currentPlan?: any;
  approvedHash?: string;
  approvalToken?: string;
  validationErrors?: string[];
}

export function initialSession(): SessionModel {
  return { state: 'draft' };
}