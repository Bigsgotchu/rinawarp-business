// ============================================================================
// File: src/main/security/approvalStore.ts
// ============================================================================
import crypto from 'node:crypto';

export type ApprovalToken = string;

export type ApprovedCommand = {
  token: ApprovalToken;
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  createdAt: number;
  expiresAt: number;
};

export class ApprovalStore {
  private readonly byToken = new Map<ApprovalToken, ApprovedCommand>();

  public create(
    input: Omit<ApprovedCommand, 'token' | 'createdAt' | 'expiresAt'>,
    ttlMs = 60_000,
  ): ApprovedCommand {
    const now = Date.now();
    const token = crypto.randomUUID();
    const entry: ApprovedCommand = {
      token,
      createdAt: now,
      expiresAt: now + ttlMs,
      ...input,
    };
    this.byToken.set(token, entry);
    return entry;
  }

  public consume(token: ApprovalToken): ApprovedCommand {
    const entry = this.byToken.get(token);
    if (!entry) throw new Error('Invalid approval token');
    this.byToken.delete(token);

    if (Date.now() > entry.expiresAt) throw new Error('Approval token expired');
    return entry;
  }

  public prune(): void {
    const now = Date.now();
    for (const [t, e] of this.byToken.entries()) {
      if (now > e.expiresAt) this.byToken.delete(t);
    }
  }
}
