// Simple step-based onboarding overlay

const Onboarding = (() => {
  let currentStep = 0;
  let steps = [];
  let rootEl = null;

  function buildSteps() {
    steps = [
      {
        id: 'welcome',
        title: 'Welcome to RinaWarp Terminal Pro',
        body: "I'll walk you through the most powerful parts of this app in under 60 seconds.",
      },
      {
        id: 'terminal',
        title: 'Warp Terminal',
        body: 'This is your AI-enhanced terminal. Every command is tracked, understood, and available for AI help.',
        highlightSelector: '#terminal-shell',
      },
      {
        id: 'palette',
        title: 'Command Palette (Ctrl+Shift+P)',
        body: 'Hit Ctrl+Shift+P anytime to open the command palette. You can launch features, run commands, or trigger AI actions.',
        highlightSelector: '#command-palette',
      },
      {
        id: 'rina',
        title: 'Rina Agent',
        body: 'Use the Rina panel to ask for explanations, generate commands, or debug problems in plain English.',
        highlightSelector: '#rina-panel',
      },
      {
        id: 'voice',
        title: 'Voice Mode',
        body: 'Tap the mic to talk to Rina hands-free. Say things like "fix that error" or "run npm test".',
        highlightSelector: '#voice-hud',
      },
      {
        id: 'done',
        title: "You're Ready",
        body: "You're all set. Use the command palette or Rina Agent anytime you get stuck.",
      },
    ];
  }

  function createRoot() {
    rootEl = document.createElement('div');
    rootEl.id = 'onboarding-overlay';
    rootEl.innerHTML = `
      <div class="onboarding-backdrop"></div>
      <div class="onboarding-tooltip">
        <h2 class="onboarding-title"></h2>
        <p class="onboarding-body"></p>
        <div class="onboarding-actions">
          <button class="onboarding-skip">Skip</button>
          <button class="onboarding-next">Next</button>
        </div>
      </div>
    `;
    document.body.appendChild(rootEl);

    rootEl.querySelector('.onboarding-skip').addEventListener('click', end);
    rootEl.querySelector('.onboarding-next').addEventListener('click', next);
  }

  function applyStep() {
    const step = steps[currentStep];
    if (!step) return end();

    const titleEl = rootEl.querySelector('.onboarding-title');
    const bodyEl = rootEl.querySelector('.onboarding-body');
    const nextBtn = rootEl.querySelector('.onboarding-next');

    titleEl.textContent = step.title;
    bodyEl.textContent = step.body;
    nextBtn.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Next';

    const tooltip = rootEl.querySelector('.onboarding-tooltip');
    tooltip.style.removeProperty('left');
    tooltip.style.removeProperty('top');

    if (step.highlightSelector) {
      const target = document.querySelector(step.highlightSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        tooltip.style.top = `${rect.top + window.scrollY + 16}px`;
        tooltip.style.left = `${rect.left + window.scrollX + 16}px`;
      }
    } else {
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
    }
  }

  function next() {
    currentStep += 1;
    if (currentStep >= steps.length) return end();
    applyStep();
  }

  function end() {
    if (rootEl) rootEl.remove();
    window.RinaConfig?.setConfig?.({ onboardingDone: true }).catch(() => {});
  }

  async function startIfNeeded() {
    try {
      const cfg = await window.RinaConfig?.getConfig?.();
      if (cfg && cfg.onboardingDone) return;
    } catch {
      // ignore
    }

    buildSteps();
    createRoot();
    applyStep();
  }

  return { startIfNeeded };
})();

export default Onboarding;
