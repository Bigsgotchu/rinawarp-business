import type { ToolContext } from './types';
import { runTool, type RunnerEvents, type ConfirmResolver } from './toolRunner';
import { wording } from '../ux/wording';
import { defaultTelemetryManager } from '../telemetry/manager';
import { defaultLicenseManager } from '../license/manager';
import { createOnboardingFlow } from '../onboarding/flow';
import type { OnboardingStep } from '../onboarding/flow';

export type EnhancedRunnerEvents =
  | RunnerEvents
  | { type: 'license:check'; result: 'valid' | 'invalid' | 'missing' }
  | { type: 'onboarding:step'; step: OnboardingStep }
  | { type: 'telemetry:event'; event: any }
  | { type: 'feature:restricted'; reason: string }
  | { type: 'assistant:message'; text: string };

export type ConfirmResolverEnhanced = (req: { id: string }) => Promise<'yes' | 'no'>;

export async function handleEnhancedUserIntent(params: {
  text: string;
  ctx: ToolContext;
  confirm: ConfirmResolverEnhanced;
  emit: (e: EnhancedRunnerEvents) => void;
  requireLicense?: boolean;
  licenseTier?: string;
}) {
  const raw = params.text.trim();

  // Log intent received
  await defaultTelemetryManager.logIntentReceived(raw);

  // Check license if required
  if (params.requireLicense) {
    const licenseCheck = await defaultLicenseManager.checkLicense();

    if (!licenseCheck.valid) {
      params.emit({
        type: 'license:check',
        result: licenseCheck.error?.includes('No license') ? 'missing' : 'invalid',
      });

      params.emit({
        type: 'assistant:message',
        text: 'I need a valid license to help with that. Would you like to get one?',
      });
      return;
    } else {
      params.emit({ type: 'license:check', result: 'valid' });
      await defaultTelemetryManager.logLicenseVerified(licenseCheck.tier || 'unknown');
    }
  }

  // v1: tiny intent classifier (replace with your LLM later)
  const isDeploy = /deploy|release|push live|production/i.test(raw);
  const isBuild = /build|compile|bundle/i.test(raw);
  const isOnboarding = /help|getting started|how to|first time/i.test(raw);

  // Active listening + de-escalation (contract)
  if (/fucking|bullshit|tired|hate|stuck|going in circles/i.test(raw)) {
    params.emit({ type: 'assistant:message', text: wording.deEscalate() });
    await defaultTelemetryManager.logError('user-frustration', raw);
  }

  // Handle onboarding requests
  if (isOnboarding) {
    const onboardingFlow = createOnboardingFlow();
    const firstStep = await onboardingFlow.start();

    if (firstStep) {
      params.emit({ type: 'onboarding:step', step: firstStep });
      return;
    }
  }

  if (isDeploy) {
    // Check if user has deploy permission
    if (params.requireLicense) {
      const hasAccess = await defaultLicenseManager.hasFeatureAccess('pro');
      if (!hasAccess) {
        params.emit({
          type: 'feature:restricted',
          reason: 'Deploy requires Pro license or higher',
        });
        params.emit({
          type: 'assistant:message',
          text: 'Deploying to production requires a Pro license or higher. Would you like to upgrade?',
        });
        return;
      }
    }

    params.emit({ type: 'assistant:message', text: "Got it. I'll propose a safe deploy plan." });

    // Plan proposal (v1: static plan)
    params.emit({
      type: 'assistant:message',
      text: ['Plan:', '1) Build + tests', '2) Deploy to production', '3) Quick health check'].join(
        '\n',
      ),
    });

    // Step 1: build
    await runTool({
      toolName: 'build.run',
      input: { cmd: 'npm run build' },
      ctx: params.ctx,
      why: 'Build the project to ensure artifacts are current.',
      intent: 'build your project',
      actionPlain: 'Run `npm run build` in the project directory.',
      tone: 'fast',
      confirm: params.confirm,
      emit: params.emit,
    });

    // Step 2: deploy (explicit confirm required)
    await defaultTelemetryManager.logConfirmationRequested('deploy.prod', 'high-impact operation');

    await runTool({
      toolName: 'deploy.prod',
      input: { cmd: './deploy-final.sh' },
      ctx: params.ctx,
      why: 'Deploy the built artifacts to production.',
      intent: 'deploy to production',
      actionPlain: 'Run the production deploy script (`./deploy-final.sh`).',
      risk: 'This will update the live production site.',
      tone: 'supportive',
      confirm: params.confirm,
      emit: params.emit,
    });

    params.emit({
      type: 'assistant:message',
      text: 'Done. Want me to run a quick health check next, or are we good to ship?',
    });

    return;
  }

  if (isBuild) {
    await runTool({
      toolName: 'build.run',
      input: { cmd: 'npm run build' },
      ctx: params.ctx,
      why: 'Build your project.',
      intent: 'build your project',
      actionPlain: 'Run `npm run build`.',
      tone: 'playful',
      confirm: params.confirm,
      emit: params.emit,
    });
    params.emit({ type: 'assistant:message', text: 'Build finished. Want tests next?' });
    return;
  }

  // Enhanced response with feature gating awareness
  if (params.requireLicense) {
    const currentTier = await defaultLicenseManager.getCurrentTier();
    if (currentTier) {
      params.emit({
        type: 'assistant:message',
        text: `Tell me the goal (deploy, fix an error, set up backend, make production-ready) and I'll propose the safest next steps. ${getLicenseMessage(currentTier)}`,
      });
    } else {
      params.emit({
        type: 'assistant:message',
        text: "Tell me the goal (deploy, fix an error, set up backend, make production-ready) and I'll propose the safest next steps. Some features may require a license.",
      });
    }
  } else {
    params.emit({
      type: 'assistant:message',
      text: "Tell me the goal (deploy, fix an error, set up backend, make production-ready) and I'll propose the safest next steps.",
    });
  }
}

function getLicenseMessage(tier: string): string {
  const messages = {
    starter: "You're on Starter - some advanced features need upgrading.",
    creator: "You're on Creator - looking good!",
    pro: "You're on Pro - you've got the good stuff!",
    pioneer: "You're a Pioneer - thanks for being early!",
    founder: "You're a Founder - this is why we built this!",
    enterprise: "Enterprise user - you've got the keys to the kingdom!",
  };

  return messages[tier as keyof typeof messages] || '';
}
