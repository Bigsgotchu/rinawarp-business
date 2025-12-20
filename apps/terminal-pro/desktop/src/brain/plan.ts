import { IntentRequest, PlanResponse } from './types';

export function handlePlan(res: any, body: IntentRequest): void {
  const { intent, context } = body;

  // Simple, deterministic planning logic for now
  // This builds trust before we add more intelligence
  const plan: PlanResponse = {
    planId: `plan_${Date.now()}`,
    summary: intent,
    risk: determineRisk(context.buildChannel, intent),
    steps: generateSteps(intent, context),
    requiresConfirmation: true
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(plan));
}

function determineRisk(buildChannel: string, intent: string): 'LOW' | 'MEDIUM' | 'HIGH' {
  // Simple risk assessment based on keywords and build channel
  const highRiskKeywords = ['delete', 'remove', 'drop', 'deploy', 'production'];
  const mediumRiskKeywords = ['refactor', 'change', 'update', 'modify'];
  
  const intentLower = intent.toLowerCase();
  
  // Production builds are automatically higher risk
  if (buildChannel === 'stable') {
    if (highRiskKeywords.some(keyword => intentLower.includes(keyword))) {
      return 'HIGH';
    }
    return 'MEDIUM';
  }
  
  // Dev builds are generally lower risk
  if (highRiskKeywords.some(keyword => intentLower.includes(keyword))) {
    return 'MEDIUM';
  }
  
  return 'LOW';
}

function generateSteps(intent: string, context: IntentRequest['context']) {
  const intentLower = intent.toLowerCase();
  const steps = [];
  
  // Always start with analysis
  steps.push({
    id: 's1',
    type: 'analysis' as const,
    description: 'Review current implementation and requirements'
  });
  
  // Add steps based on intent keywords
  if (intentLower.includes('refactor') || intentLower.includes('change')) {
    steps.push({
      id: 's2',
      type: 'edit' as const,
      description: 'Apply changes behind safe boundaries'
    });
  }
  
  if (intentLower.includes('auth') || intentLower.includes('security')) {
    steps.push({
      id: 's3',
      type: 'validation' as const,
      description: 'Run security validation tests'
    });
  }
  
  // Always end with validation
  steps.push({
    id: steps.length + 1,
    type: 'validation' as const,
    description: 'Run smoke tests and validate functionality'
  });
  
  return steps;
}