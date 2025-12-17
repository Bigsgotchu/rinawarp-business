import { isFirstRun, markOnboarded, markFirstRun } from './state';
import { defaultTelemetryManager } from '../telemetry/manager';

export type OnboardingStep =
  | { type: 'welcome'; message: string }
  | { type: 'explain'; message: string }
  | { type: 'demo'; message: string; action: string }
  | { type: 'encourage'; message: string }
  | { type: 'complete'; message: string };

export class OnboardingFlow {
  private currentStep = 0;
  private steps: OnboardingStep[] = [];

  constructor() {
    this.initializeSteps();
  }

  /**
   * Start the onboarding flow if it's the first run
   */
  async start(): Promise<OnboardingStep | null> {
    const firstRun = await isFirstRun();

    if (!firstRun) {
      return null;
    }

    await markFirstRun();
    await defaultTelemetryManager.log({ type: 'app:start' });

    return this.getCurrentStep();
  }

  /**
   * Get the current onboarding step
   */
  getCurrentStep(): OnboardingStep | null {
    return this.steps[this.currentStep] || null;
  }

  /**
   * Move to the next step
   */
  async next(): Promise<OnboardingStep | null> {
    this.currentStep++;

    if (this.currentStep >= this.steps.length) {
      await this.complete();
      return null;
    }

    return this.getCurrentStep();
  }

  /**
   * Skip onboarding entirely
   */
  async skip(): Promise<void> {
    await this.complete();
  }

  /**
   * Complete the onboarding process
   */
  private async complete(): Promise<void> {
    await markOnboarded();
    await defaultTelemetryManager.logOnboardingCompleted();
  }

  /**
   * Initialize the onboarding steps
   */
  private initializeSteps(): void {
    this.steps = [
      {
        type: 'welcome',
        message: `Hey — I'm Rina 💖

You don't need to know commands here.
Just tell me what you want to build or fix.

Try something like:
• "Build this"
• "Deploy this"
• "Fix this error"

I'll walk with you — not ahead of you.`,
      },
      {
        type: 'explain',
        message: `Here's how this works:

I can help you with:
✓ Building and testing your projects
✓ Deploying to production safely
✓ Managing files and git
✓ Running commands with confirmation

For risky stuff (like deleting files or deploying), 
I'll always ask first. Your control, your pace.`,
      },
      {
        type: 'demo',
        message: `Want to try a build together?

I'll show you the safe way:
1. I tell you what I'm about to do
2. You can say yes or no
3. I execute with confirmation for risky ops
4. You see the results clearly

Ready to build something?`,
        action: 'Try a build',
      },
      {
        type: 'encourage',
        message: `Perfect! You're in control here.

Some tips as we get started:
• Be specific about what you want
• I'll explain what I'm doing
• Ask me to clarify anything
• No judgment — just helpful guidance

Let's make something great together! 🚀`,
      },
      {
        type: 'complete',
        message: `Welcome aboard! 

You're all set. From now on, just tell me what you need help with and I'll handle the rest.

Ready when you are!`,
      },
    ];
  }
}

/**
 * Check if we should show onboarding
 */
export async function shouldShowOnboarding(): Promise<boolean> {
  return await isFirstRun();
}

/**
 * Create a new onboarding flow instance
 */
export function createOnboardingFlow(): OnboardingFlow {
  return new OnboardingFlow();
}
