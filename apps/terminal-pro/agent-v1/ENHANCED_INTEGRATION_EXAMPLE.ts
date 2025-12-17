/**
 * Enhanced Agent Integration Example
 *
 * This shows how to wire the enhanced Agent (v1 + License + Telemetry + Onboarding)
 * into your existing Terminal Pro chat handler.
 */

import { handleEnhancedUserIntent } from '../agent-v1/core/enhanced-agent';
import { defaultTelemetryManager } from '../agent-v1/telemetry/manager';
import { defaultLicenseManager } from '../agent-v1/license/manager';
import { createOnboardingFlow } from '../agent-v1/onboarding/flow';
import { shouldShowOnboarding } from '../agent-v1/onboarding/flow';
import type { ToolContext } from '../agent-v1/core/types';
import type { OnboardingStep } from '../agent-v1/onboarding/flow';

// ============================================================================
// ENHANCED CHAT HANDLER
// ============================================================================

export async function handleEnhancedUserMessage(
  text: string,
  currentProjectPath: string,
  options: {
    requireLicense?: boolean;
    licenseTier?: string;
  } = {},
) {
  // Initialize telemetry session
  await defaultTelemetryManager.logAppStart();

  // Check license if required
  let licenseValid = true;
  if (options.requireLicense) {
    const licenseCheck = await defaultLicenseManager.checkLicense();
    licenseValid = licenseCheck.valid;
  }

  // Create the enhanced agent context
  const agentContext: ToolContext = {
    projectRoot: currentProjectPath,
    env: {
      NODE_ENV: process.env.NODE_ENV,
    },
    log: (msg, data) => {
      console.log('[Agent]', msg, data);
      defaultTelemetryManager.logEvent({
        type: 'error:occurred',
        error: msg,
        context: JSON.stringify(data),
      });
    },
  };

  // Enhanced confirmation resolver with license awareness
  const confirm = async ({ id }: { id: string }): Promise<'yes' | 'no'> => {
    // Log confirmation requests
    await defaultTelemetryManager.logConfirmationRequested(
      'unknown-tool',
      'user-confirmation-required',
    );

    return new Promise((resolve) => {
      openEnhancedConfirmationModal({
        id,
        onConfirm: async () => {
          await defaultTelemetryManager.logConfirmationAccepted('unknown-tool');
          resolve('yes');
        },
        onCancel: async () => {
          await defaultTelemetryManager.logConfirmationRejected('unknown-tool');
          resolve('no');
        },
      });
    });
  };

  // Enhanced event emitter with license, telemetry, and onboarding
  const emit = (event: any) => {
    switch (event.type) {
      case 'assistant:message':
        addChatMessage('rina', event.text);
        break;

      case 'tool:declare':
        addSystemMessage(`Rina is using ${event.toolName}`);
        break;

      case 'tool:output':
        showExpandableOutput(event.output);
        break;

      case 'tool:error':
        addChatMessage('rina', event.message);
        break;

      case 'license:check':
        handleLicenseCheck(event.result);
        break;

      case 'onboarding:step':
        handleOnboardingStep(event.step);
        break;

      case 'feature:restricted':
        handleFeatureRestriction(event.reason);
        break;

      case 'confirm:request':
        openEnhancedConfirmationModal({
          title: event.request.title,
          body: [
            event.request.intentReflection,
            event.request.actionPlain,
            event.request.risk && `⚠ ${event.request.risk}`,
          ].filter(Boolean),
          prompt: event.request.prompt,
        });
        break;
    }
  };

  // Call the enhanced agent
  await handleEnhancedUserIntent({
    text,
    ctx: agentContext,
    confirm,
    emit,
    requireLicense: options.requireLicense,
    licenseTier: options.licenseTier,
  });
}

// ============================================================================
// ENHANCED UI INTEGRATION HELPERS
// ============================================================================

function handleLicenseCheck(result: 'valid' | 'invalid' | 'missing') {
  switch (result) {
    case 'valid':
      addSystemMessage('✅ License verified');
      break;
    case 'invalid':
      addSystemMessage('❌ License invalid');
      break;
    case 'missing':
      addSystemMessage('📄 No license found');
      break;
  }
}

function handleOnboardingStep(step: OnboardingStep) {
  switch (step.type) {
    case 'welcome':
      showOnboardingWelcome(step.message);
      break;
    case 'explain':
      showOnboardingExplain(step.message);
      break;
    case 'demo':
      showOnboardingDemo(step.message, step.action);
      break;
    case 'encourage':
      showOnboardingEncourage(step.message);
      break;
    case 'complete':
      showOnboardingComplete(step.message);
      break;
  }
}

function handleFeatureRestriction(reason: string) {
  addChatMessage('rina', `That feature requires a license upgrade: ${reason}`);
}

// ============================================================================
// ONBOARDING UI COMPONENTS
// ============================================================================

function showOnboardingWelcome(message: string) {
  addChatMessage('rina', message);

  // Show onboarding controls
  showOnboardingControls([
    { text: 'Tell me more', action: 'next' },
    { text: 'Skip intro', action: 'skip' },
  ]);
}

function showOnboardingExplain(message: string) {
  addChatMessage('rina', message);

  showOnboardingControls([
    { text: 'Ready to try it', action: 'next' },
    { text: 'Not now', action: 'skip' },
  ]);
}

function showOnboardingDemo(message: string, action: string) {
  addChatMessage('rina', message);

  showOnboardingControls([
    { text: action, action: 'demo-build' },
    { text: 'Maybe later', action: 'skip' },
  ]);
}

function showOnboardingEncourage(message: string) {
  addChatMessage('rina', message);

  showOnboardingControls([
    { text: "Let's build something!", action: 'complete' },
    { text: 'I need a minute', action: 'skip' },
  ]);
}

function showOnboardingComplete(message: string) {
  addChatMessage('rina', message);
  hideOnboardingControls();
}

// ============================================================================
// LICENSE INTEGRATION
// ============================================================================

export async function installLicenseFromStripe(licenseData: {
  tier: string;
  email: string;
  issuedAt: string;
  expiresAt?: string;
  signature: string;
}) {
  try {
    const validation = await defaultLicenseManager.installLicense(licenseData);

    if (validation.valid) {
      addSystemMessage(`🎉 License installed: ${validation.tier}`);
      await defaultTelemetryManager.logLicenseVerified(validation.tier || 'unknown');
      return true;
    } else {
      addSystemMessage(`❌ License installation failed: ${validation.error}`);
      return false;
    }
  } catch (error) {
    addSystemMessage(`❌ License installation error: ${error.message}`);
    return false;
  }
}

// ============================================================================
// TELEMETRY INTEGRATION
// ============================================================================

export async function exportTelemetryForSupport(): Promise<string> {
  const events = await defaultTelemetryManager.getRecentEvents(1000);
  return JSON.stringify(events, null, 2);
}

export async function clearTelemetryData(): Promise<void> {
  await defaultTelemetryManager.clear();
  addSystemMessage('🗑️ Telemetry data cleared');
}

// ============================================================================
// ONBOARDING INTEGRATION
// ============================================================================

export async function checkAndStartOnboarding(): Promise<boolean> {
  const shouldShow = await shouldShowOnboarding();

  if (shouldShow) {
    const onboardingFlow = createOnboardingFlow();
    const firstStep = await onboardingFlow.start();

    if (firstStep) {
      handleOnboardingStep(firstStep);
      return true;
    }
  }

  return false;
}

// ============================================================================
// ENHANCED UI HELPERS
// ============================================================================

function addChatMessage(sender: string, text: string) {
  console.log(`[Chat] ${sender}: ${text}`);
  // Your existing chat message adding logic
}

function addSystemMessage(text: string) {
  console.log(`[System] ${text}`);
  // Show in your status bar or system messages area
}

function showExpandableOutput(output: any) {
  console.log('[Tool Output]', output);
  // Display in your expandable output panel
}

function openEnhancedConfirmationModal(config: {
  id: string;
  title?: string;
  body?: string[];
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Enhanced modal with license/telemetry awareness
  const modal = document.createElement('div');
  modal.className = 'agent-confirmation-modal enhanced';

  const title = config.title || 'Confirmation';
  const body = config.body?.join('\n\n') || '';

  modal.innerHTML = `
    <div class="modal-content">
      <h3>${title}</h3>
      <div class="modal-body">
        ${body
          .split('\n')
          .map((line) => `<p>${line}</p>`)
          .join('')}
        <p><strong>${config.prompt}</strong></p>
      </div>
      <div class="modal-actions">
        <button class="confirm-btn primary">Yes</button>
        <button class="cancel-btn">No</button>
      </div>
      <div class="modal-footer">
        <small>🔒 Your data stays local • 📊 Usage helps improve Rina</small>
      </div>
    </div>
  `;

  modal.querySelector('.confirm-btn')?.addEventListener('click', () => {
    config.onConfirm();
    document.body.removeChild(modal);
  });

  modal.querySelector('.cancel-btn')?.addEventListener('click', () => {
    config.onCancel();
    document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}

function showOnboardingControls(actions: Array<{ text: string; action: string }>) {
  // Show onboarding action buttons
  const controls = document.createElement('div');
  controls.className = 'onboarding-controls';
  controls.innerHTML = actions
    .map(
      (action) =>
        `<button class="onboarding-btn" data-action="${action.action}">${action.text}</button>`,
    )
    .join('');

  controls.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const action = target.dataset.action;

    switch (action) {
      case 'next':
        // Handle next step
        break;
      case 'skip':
        // Handle skip
        hideOnboardingControls();
        break;
      case 'demo-build':
        // Handle demo build
        addChatMessage('user', 'build');
        hideOnboardingControls();
        break;
      case 'complete':
        // Handle completion
        hideOnboardingControls();
        break;
    }
  });

  document.body.appendChild(controls);
}

function hideOnboardingControls() {
  const controls = document.querySelector('.onboarding-controls');
  if (controls) {
    controls.remove();
  }
}
