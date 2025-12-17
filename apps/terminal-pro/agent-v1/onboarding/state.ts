import fs from 'node:fs/promises';
import path from 'node:path';

const STATE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.rinawarp',
  'state.json',
);

export type OnboardingState = {
  onboarded: boolean;
  firstRunAt?: string;
  completedAt?: string;
  version: string; // Track onboarding version for future updates
};

const DEFAULT_STATE: OnboardingState = {
  onboarded: false,
  version: '1.0.0',
};

export async function getOnboardingState(): Promise<OnboardingState> {
  try {
    const raw = await fs.readFile(STATE_PATH, 'utf8');
    const state = JSON.parse(raw);

    // Validate state structure
    if (typeof state.onboarded !== 'boolean') {
      return DEFAULT_STATE;
    }

    return state;
  } catch {
    return DEFAULT_STATE;
  }
}

export async function isFirstRun(): Promise<boolean> {
  const state = await getOnboardingState();
  return !state.onboarded;
}

export async function markOnboarded(): Promise<void> {
  try {
    const state = await getOnboardingState();

    const updatedState: OnboardingState = {
      ...state,
      onboarded: true,
      completedAt: new Date().toISOString(),
    };

    // Ensure directory exists
    await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });

    await fs.writeFile(STATE_PATH, JSON.stringify(updatedState, null, 2));
  } catch (error) {
    console.error('Failed to mark onboarding as completed:', error);
  }
}

export async function markFirstRun(): Promise<void> {
  try {
    const state = await getOnboardingState();

    if (!state.firstRunAt) {
      const updatedState: OnboardingState = {
        ...state,
        firstRunAt: new Date().toISOString(),
      };

      await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });
      await fs.writeFile(STATE_PATH, JSON.stringify(updatedState, null, 2));
    }
  } catch (error) {
    console.error('Failed to mark first run:', error);
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    const state: OnboardingState = {
      ...DEFAULT_STATE,
      firstRunAt: new Date().toISOString(),
    };

    await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });
    await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to reset onboarding:', error);
  }
}
