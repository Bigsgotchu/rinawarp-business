export type RinaHealth = {
  ok: boolean;
  status: 'healthy' | 'degraded' | 'down';
  detail?: string;
};

export type RinaRoundTripResult =
  | { ok: true; text: string; latencyMs: number }
  | { ok: false; error: string; latencyMs: number };

export interface RinaClient {
  health(): Promise<RinaHealth>;
  roundTrip(input: { prompt: string; timeoutMs: number }): Promise<RinaRoundTripResult>;
  close?(): Promise<void> | void;
}
