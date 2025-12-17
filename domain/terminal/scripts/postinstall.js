// scripts/postinstall.js
import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const MODEL_NAME = 'rina';
const MODEL_PATH = path.join(
  os.homedir(),
  '.ollama',
  'models',
  'model',
  MODEL_NAME
);
const DOWNLOAD_URL = 'https://rinawarptech.com/models/rina.gguf'; // ✅ Replace if hosted elsewhere

// Check if model exists
function modelExists() {
  try {
    return fs.existsSync(MODEL_PATH);
  } catch (err) {
    console.error('❌ Error checking model:', err);
    return false;
  }
}

// Download and import with ollama
function downloadModel() {
  console.log(`📦 Downloading Rina model from: ${DOWNLOAD_URL}`);
  exec(
    `curl -L ${DOWNLOAD_URL} | ollama import ${MODEL_NAME}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Failed to download or import Rina model:', stderr);
      } else {
        console.log('✅ Rina model installed successfully!');
      }
    }
  );
}

// Run once during postinstall
if (!modelExists()) {
  downloadModel();
} else {
  console.log('✅ Rina model already installed.');
}
