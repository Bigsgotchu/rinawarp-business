// ============================================================
// src/lib/shell.js — RinaWarp Renderer Shell Helper
// Simplifies calls to Electron shell executor (run-shell IPC).
// ============================================================

export async function runShell(command) {
  if (!window.electronAPI || !window.electronAPI.runShell) {
    console.error('Electron API not available — cannot run shell command.');
    return { stdout: '', stderr: 'Electron bridge not found.', code: -1 };
  }

  try {
    const result = await window.electronAPI.runShell(command);
    if (result.error) {
      console.error('[Shell Error]', result.error);
      return result;
    }

    // Pretty log formatting
    if (result.stdout) console.log('🟢 Output:\n' + result.stdout.trim());
    if (result.stderr) console.warn('🔴 Error:\n' + result.stderr.trim());

    return result;
  } catch (err) {
    console.error('Shell execution failed:', err);
    return { stdout: '', stderr: err.message, code: 1 };
  }
}

/**
 * Stream-style execution — logs continuously to console or callback
 * @param {string} command
 * @param {(line: string, type: 'stdout' | 'stderr') => void} onData
 */
export function streamShell(command, onData) {
  if (!window.electronAPI || !window.electronAPI.runShell) {
    onData?.('Electron bridge not found.', 'stderr');
    return;
  }

  // For now, we emulate streaming via interval polling (future: WebSocket or SSE)
  runShell(command).then((result) => {
    if (result.stdout) onData(result.stdout, 'stdout');
    if (result.stderr) onData(result.stderr, 'stderr');
  });
}
