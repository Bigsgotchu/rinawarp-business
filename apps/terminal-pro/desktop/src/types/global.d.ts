// Typings for the preload Sentry bridge
declare global {
  interface Window {
    sentry?: {
      captureException: (err: unknown) => Promise<void>;
    };
  }
}

export {};
