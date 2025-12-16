#!/usr/bin/env node

// Test script for Rina Agent integration
const { fork } = require('child_process');
const path = require('path');

console.log('[RinaAgent Test] Starting agent integration test...');

// Test 1: Agent spawns successfully
function testAgentSpawn() {
  return new Promise((resolve, reject) => {
    console.log('\n=== Test 1: Agent Spawn ===');

    const agent = fork(path.join(__dirname, 'agent/index.js'), [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    let readyReceived = false;

    agent.on('message', (msg) => {
      console.log('[Agent] Message:', msg.type, msg);

      if (msg.type === 'agent:ready') {
        readyReceived = true;
        console.log('✅ Agent spawned successfully with PID:', msg.pid);
        agent.kill();
        resolve();
      } else if (msg.type === 'agent:heartbeat') {
        console.log('✅ Heartbeat received:', msg.ts, msg.memory);
      } else if (msg.type === 'agent:warn') {
        console.log('⚠️  Agent warning:', msg.message);
      }
    });

    agent.on('exit', (code) => {
      if (!readyReceived) {
        reject(new Error('Agent exited before sending ready message'));
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!readyReceived) {
        agent.kill();
        reject(new Error('Agent ready timeout'));
      }
    }, 5000);
  });
}

// Test 2: Message handling
function testMessageHandling() {
  return new Promise((resolve, reject) => {
    console.log('\n=== Test 2: Message Handling ===');

    const agent = fork(path.join(__dirname, 'agent/index.js'), [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    let readyReceived = false;

    agent.on('message', (msg) => {
      console.log('[Agent] Message:', msg.type, msg);

      if (msg.type === 'agent:ready') {
        readyReceived = true;

        // Send a test message
        setTimeout(() => {
          agent.send({
            type: 'shell:run',
            command: "echo 'Hello from agent!'",
            cwd: process.cwd(),
          });
        }, 100);
      } else if (msg.type === 'shell:stdout') {
        console.log('✅ Shell stdout:', msg.data.trim());
        agent.kill();
        resolve();
      } else if (msg.type === 'agent:warn') {
        console.log('⚠️  Agent warning:', msg.message);
      }
    });

    agent.on('exit', (code) => {
      if (!readyReceived) {
        reject(new Error('Agent exited before sending ready message'));
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!readyReceived) {
        agent.kill();
        reject(new Error('Agent ready timeout'));
      }
    }, 5000);
  });
}

// Run all tests
async function runTests() {
  try {
    await testAgentSpawn();
    await testMessageHandling();

    console.log('\n🎉 All tests passed! Agent integration is working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
