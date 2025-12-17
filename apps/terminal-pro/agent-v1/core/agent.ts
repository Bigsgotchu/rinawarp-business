import type { ToolContext } from './types';
import { runTool, type RunnerEvents, type ConfirmResolver } from './toolRunner';
import { wording } from '../ux/wording';

export async function handleUserIntent(params: {
  text: string;
  ctx: ToolContext;
  confirm: ConfirmResolver;
  emit: (e: RunnerEvents | { type: 'assistant:message'; text: string }) => void;
}) {
  const raw = params.text.trim();

  // v1: tiny intent classifier (replace with your LLM later)
  const isDeploy = /deploy|release|push live|production/i.test(raw);
  const isBuild = /build|compile|bundle/i.test(raw);

  // Active listening + de-escalation (contract)
  if (/fucking|bullshit|tired|hate|stuck|going in circles/i.test(raw)) {
    params.emit({ type: 'assistant:message', text: wording.deEscalate() });
  }

  if (isDeploy) {
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

  params.emit({
    type: 'assistant:message',
    text: "Tell me the goal (deploy, fix an error, set up backend, make production-ready) and I'll propose the safest next steps.",
  });
}
