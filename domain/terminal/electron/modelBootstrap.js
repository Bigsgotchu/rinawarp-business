// electron/modelBootstrap.js
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import fetch from 'node-fetch';

const MODEL_NAME = 'rina';
const OLLAMA_MODEL_DIR = path.join(
  os.homedir(),
  '.ollama',
  'models',
  MODEL_NAME
);
const MODEL_CHECK_PATH = path.join(OLLAMA_MODEL_DIR, MODEL_NAME + '.gguf'); // adjust if needed
const DOWNLOAD_URL = 'https://your‑server.com/models/rina‑latest.gguf'; // your hosted model file

async function downloadModel() {
  console.log('[ModelBootstrap] Downloading Rina model…');
  const res = await fetch(DOWNLOAD_URL);
  if (!res.ok) {
    throw new Error(`Failed to download model: ${res.status}`);
  }
  const fileStream = fs.createWriteStream(MODEL_CHECK_PATH);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
  console.log('[ModelBootstrap] Download complete.');
}

export async function ensureModelInstalled() {
  try {
    if (fs.existsSync(MODEL_CHECK_PATH)) {
      console.log('[ModelBootstrap] Model found: ' + MODEL_CHECK_PATH);
    } else {
      await downloadModel();
    }
    // Optionally run Ollama to register model
    execFileSync(
      'ollama',
      ['run', MODEL_NAME, '--model-dir', OLLAMA_MODEL_DIR],
      { stdio: 'ignore' }
    );
    console.log('[ModelBootstrap] Ollama model ready.');
  } catch (err) {
    console.error('[ModelBootstrap] Error ensuring model:', err);
    throw err;
  }
}
