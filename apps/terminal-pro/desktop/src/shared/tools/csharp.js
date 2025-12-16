// =========================================
// FILE: src/shared/tools/csharp.js
// Planner tool: csharp:script → write .csx and execute via CS-Script
// =========================================
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

function sha1(s) {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function tempCsxPath(key) {
  const dir = path.join(os.tmpdir(), 'rinawarp-csx');
  return { dir, file: path.join(dir, `${key}.csx`) };
}

/**
 * Build a plan (DAG) to run a C# script safely.
 * Returns steps with idempotence keys + capability check.
 */
function planCSharpScript({ code, args = [] }) {
  const key = sha1(code);
  const { dir, file } = tempCsxPath(key);

  return {
    kind: 'plan',
    summary: 'Run C# script with CS-Script',
    steps: [
      {
        id: 'write-csx',
        title: 'Write script file',
        capability: 'csharp',
        idempotenceKey: `csx:write:${key}`,
        action: {
          type: 'node:fs',
          op: 'writeFile',
          mkdir: dir,
          path: file,
          content: code,
        },
      },
      {
        id: 'exec-csx',
        title: 'Execute script',
        dependsOn: ['write-csx'],
        capability: 'csharp',
        idempotenceKey: `csx:exec:${key}:${sha1(args.join('|'))}`,
        action: {
          type: 'exec',
          program: 'dotnet',
          args: [process.env.CSCS_DLL || 'cscs.dll', file, ...args],
          timeoutSec: 60,
          outputCapBytes: 2 * 1024 * 1024,
        },
      },
    ],
  };
}

/**
 * Lightweight intent detector.
 * Triggers when intent starts with "run csharp" or contains ```csharp block.
 */
function detectCSharpIntent(intent) {
  const t = (intent || '').trim();
  if (/^run\s+c(sharp|#)/i.test(t)) return true;
  if (/```csharp[\s\S]*```/i.test(t) || /```cs[\s\S]*```/i.test(t)) return true;
  if (/\.csx\b/i.test(t)) return true;
  return false;
}

/**
 * Extract code from intent.
 * Supports code fences ```csharp ... ``` else uses entire remainder after first line.
 */
function extractCSharp(intent) {
  const m = intent.match(/```(?:csharp|cs)\s*\n([\s\S]*?)```/i);
  if (m) return m[1].trim();
  const lines = intent.split('\n');
  // drop first line like "run csharp ..." and treat rest as code
  if (/^run\s+c(sharp|#)/i.test(lines[0] || '')) {
    return lines.slice(1).join('\n').trim();
  }
  return '';
}

module.exports = { planCSharpScript, detectCSharpIntent, extractCSharp };
