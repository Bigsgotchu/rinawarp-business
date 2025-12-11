// Unified AI Router
import {
  explainLastError,
  suggestNextCommands,
  askRinaChat,
  askAboutOutput,
  debugSession
} from './ai.js';

import { agentDebug } from "./agent-debug.js";

export class RinaAIRouter {
  static async handleRequest(type, payload = {}) {
    const state = window.RinaTerminalState || {};

    const context = {
      lastCommand: state.lastCommand,
      lastOutput: state.lastOutput,
      history: state.history,
      cwd: state.cwd,
      shell: state.shell,
      ...payload
    };

    agentDebug.log("📨 Request:", type, JSON.stringify(context));

    try {
      let result;
      switch (type) {
        case 'explainError':
          result = await explainLastError(context);
          break;

        case 'fixCommand':
          result = await askRinaChat({
            prompt: `Fix this broken command: ${state.lastCommand}\nError:\n${state.lastOutput}`,
            context
          });
          break;

        case 'generateCommand':
          result = await askRinaChat({
            prompt: `Generate a valid terminal command for this request:\n"${payload.goal}"`,
            context
          });
          break;

        case 'whatNext':
          result = await suggestNextCommands({
            goal: payload.goal || 'continue the current workflow',
            ...context
          });
          break;

        case 'debugSession':
          result = await debugSession(context);
          break;

        case 'askAboutOutput':
          result = await askAboutOutput(context);
          break;

        default:
          result = await askRinaChat({ prompt: payload.prompt, context });
      }

      if (!result.ok) {
        agentDebug.log("❌ ERROR:", result.status, result.error || "Unknown error");
      } else {
        agentDebug.log("📩 Response:", JSON.stringify(result.data).slice(0, 300));
      }

      return result;
    } catch (error) {
      agentDebug.log("💥 Router ERROR:", error.message || String(error));
      return {
        ok: false,
        error: "AI Router error",
        details: error.message || String(error)
      };
    }
  }
}