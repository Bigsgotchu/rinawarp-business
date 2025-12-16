export {};

declare global {
  interface Window {
    terminal: {
      spawn(req: any): Promise<{ ok: true } | { ok: false; error: string }>;
      write(req: any): Promise<any>;
      resize(req: any): Promise<any>;
      kill(req: any): Promise<any>;
      onData(fn: (p: { id: string; data: string }) => void): () => void;
      onExit(fn: (p: { id: string; code: number; signal?: number }) => void): () => void;
    };
    env?: {
      platform?: string;
      versions?: Record<string, string>;
    };
    bridge?: {
      openExternal(url: string): Promise<void>;
      getAppVersion(): Promise<string>;
      readTextFile(path: string): Promise<string>;
      joinPath(...parts: string[]): Promise<string>;
    };
  }
}
