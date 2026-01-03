// ============================================================================
// File: src/main/security/approvalStore.ts
// ============================================================================
import crypto from 'node:crypto';
export class ApprovalStore {
    byToken = new Map();
    create(input, ttlMs = 60_000) {
        const now = Date.now();
        const token = crypto.randomUUID();
        const entry = {
            token,
            createdAt: now,
            expiresAt: now + ttlMs,
            ...input,
        };
        this.byToken.set(token, entry);
        return entry;
    }
    consume(token) {
        const entry = this.byToken.get(token);
        if (!entry)
            throw new Error('Invalid approval token');
        this.byToken.delete(token);
        if (Date.now() > entry.expiresAt)
            throw new Error('Approval token expired');
        return entry;
    }
    prune() {
        const now = Date.now();
        for (const [t, e] of this.byToken.entries()) {
            if (now > e.expiresAt)
                this.byToken.delete(t);
        }
    }
}
