#!/usr/bin/env node

import readline from 'readline';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/ai/query';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '🧠 Rina > ',
});

console.log('🧠 Rina Terminal Assistant\nType your prompt or "exit"\n');
rl.prompt();

rl.on('line', async (line) => {
  const input = line.trim();
  if (input.toLowerCase() === 'exit') {
    rl.close();
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();
    console.log(`\n🪄 ${data.response}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  rl.prompt();
}).on('close', () => {
  console.log('👋 Goodbye!');
  process.exit(0);
});
