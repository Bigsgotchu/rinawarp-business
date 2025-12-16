export const DemoMode = (() => {
  let isActive = false;
  let scriptIndex = 0;

  const script = [
    {
      type: 'text',
      delay: 800,
      text: 'Welcome to RinaWarp Terminal Pro — AI-powered terminal for builders.',
    },
    {
      type: 'command',
      delay: 1000,
      text: 'ls -la',
    },
    {
      type: 'aiCommand',
      delay: 1200,
      text: 'explain last error',
    },
    {
      type: 'voiceHint',
      delay: 1500,
      text: '“Hey Rina, fix this broken command.”',
    },
  ];

  function playNextStep() {
    if (!isActive || scriptIndex >= script.length) return;

    const step = script[scriptIndex++];
    setTimeout(async () => {
      if (step.type === 'text') {
        window.RinaTerminalUI?.appendDemoMessage(step.text);
      } else if (step.type === 'command') {
        window.RinaTerminalUI?.runDemoCommand(step.text);
      } else if (step.type === 'aiCommand') {
        window.RinaTerminalUI?.runAIDemoCommand(step.text);
      } else if (step.type === 'voiceHint') {
        window.RinaTerminalUI?.showVoiceHint(step.text);
      }

      playNextStep();
    }, step.delay);
  }

  function start() {
    if (isActive) return;
    isActive = true;
    scriptIndex = 0;
    playNextStep();
  }

  function stop() {
    isActive = false;
  }

  return {
    start,
    stop,
    isActive: () => isActive,
  };
})();
