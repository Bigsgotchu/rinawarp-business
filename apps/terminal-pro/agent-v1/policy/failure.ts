import { wording } from '../ux/wording';

export type FailureCategory =
  | 'permission-denied'
  | 'tool-unavailable'
  | 'command-error'
  | 'partial-execution'
  | 'unknown';

export function categorizeFailure(code?: string): FailureCategory {
  if (!code) return 'unknown';
  if (code.includes('EACCES') || code.includes('PERMISSION')) return 'permission-denied';
  if (code.includes('ToolNotAllowed') || code.includes('NOT_FOUND')) return 'tool-unavailable';
  if (code.includes('EXIT_') || code.includes('CMD_')) return 'command-error';
  return 'unknown';
}

export function failureMessage(args: { whatFailed: string; why?: string; nextOptions: string[] }) {
  return wording.failure(args);
}
