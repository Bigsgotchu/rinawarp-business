import { IntentRequest, PlanResponse, PlanStep } from './types.js';

export function handlePlan(res: any, body: IntentRequest): void {
  const { intent, context } = body;

  // Simple, deterministic planning logic for now
  // This builds trust before we add more intelligence
  const plan: PlanResponse = {
    planId: `plan_${Date.now()}`,
    summary: intent,
    risk: determineRisk(context.buildChannel, intent),
    steps: generateSteps(intent, context),
    requiresConfirmation: true,
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
    if (highRiskKeywords.some((keyword) => intentLower.includes(keyword))) {
      return 'HIGH';
    }
    return 'MEDIUM';
  }

  // Dev builds are generally lower risk
  if (highRiskKeywords.some((keyword) => intentLower.includes(keyword))) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function generateSteps(intent: string, context: IntentRequest['context']) {
  const steps: PlanStep[] = [
    { id: '1', type: 'analysis', description: 'Analyze request' },
    { id: '2', type: 'edit', description: 'Propose changes' },
    { id: '3', type: 'validation', description: 'Validate result' },
  ];

  const _mediumRiskKeywords = ['rm -rf', 'sudo', 'curl | sh'];

  function score(_context: unknown) {
    return 0;
  }

  return steps;
}
