import { describe, it, expect } from 'vitest';
import {
  AppVersionReq,
  AppVersionRes,
  OpenExternalReq,
  RunTaskReq,
  RunTaskRes,
} from '../../../packages/shared/src/ipc/schemas';

describe('ipc schemas', () => {
  it('validates app version', () => {
    expect(AppVersionReq.parse({})).toEqual({});
    expect(AppVersionRes.parse({ version: '1.2.3' }).version).toBe('1.2.3');
  });

  it('rejects invalid URL in open external', () => {
    expect(() => OpenExternalReq.parse({ url: 'nope' })).toThrow();
  });

  it('run task discriminated union', () => {
    const ok = RunTaskRes.parse({ ok: true, result: { a: 1 } });
    expect(ok.ok).toBe(true);
    const bad = RunTaskRes.safeParse({ ok: false, error: 'x' });
    expect(bad.success).toBe(true);
  });

  it('run task request must include id', () => {
    expect(() => RunTaskReq.parse({})).toThrow();
  });
});
