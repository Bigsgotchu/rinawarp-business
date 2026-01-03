import { RinaAIRouter } from './ai-router.js';
import { askRinaChat } from './ai.js';

export function initVoiceMode() {
  const hud = document.getElementById("voice-hud");
  const status = document.getElementById("voice-status");

  if (!hud) return;

  hud.classList.remove("hidden");

  let listening = false;

  hud.onclick = async () => {
    if (!listening) {
      status.textContent = "Listening...";
      listening = true;
      await window.RinaVoice.start();
    } else {
      status.textContent = "Stopped";
      listening = false;
      await window.RinaVoice.stop();
    }
  };

  window.RinaVoice.onTranscript(async (spoken) => {
    status.textContent = "Processing: " + spoken;
    await handleCommand(spoken);
  });

  window.RinaVoice.onResponse((r) => {
    status.textContent = "Rina says: " + r;
  });
}

// Natural language → intent detection
async function handleCommand(spoken) {
  // Add noise filtering
  spoken = spoken.trim().replace(/\x00/g, '');

  // Noise classification
  const noiseCheck = await askRinaChat({
    prompt: `Is this likely environmental noise or speech? Answer noise or speech.\nTEXT: "${spoken}"`,
  });
  if (noiseCheck === 'noise') return;

  const intent = await askRinaChat({
    prompt: `
User said: "${spoken}"

Classify this into ONE intent:
- runCommand
- generateCommand
- debugError
- askQuestion
- whatNext
- chat
Return ONLY the intent name.
`,
    context: window.RinaTerminalState
  });

  switch (intent.trim()) {
    case 'runCommand':
      const cmd = spoken.replace(/^run[: ]/i, '').trim();
      return window.RinaTerminal.runCommand(cmd);

    case 'generateCommand': {
      const res = await RinaAIRouter.handleRequest('generateCommand', { goal: spoken });
      return window.RinaTerminal.runCommand(res);
    }

    case 'debugError':
      return window.RinaVoice.speak(await RinaAIRouter.handleRequest('explainError'));

    case 'whatNext':
      return window.RinaVoice.speak(await RinaAIRouter.handleRequest('whatNext', { goal: spoken }));

    case 'askQuestion':
    case 'chat':
    default:
      return window.RinaVoice.speak(await askRinaChat({ prompt: spoken }));
  }
}