// Logger utility

export function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  console[level](`[${new Date().toISOString()}] ${message}`);
}
