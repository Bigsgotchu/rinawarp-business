// TypeScript declarations for Sentry bridge
declare global {
  interface Window {
    sentry?: {
      captureException: (errorLike: unknown) => Promise<void>;
    };
  }
}

export {};
