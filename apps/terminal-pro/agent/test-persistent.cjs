const { fork } = require('child_process');
const path = require('path');

console.log('🧠 Testing Rina Agent Persistent Memory System\n');

// Start the persistent agent
const agent = fork('./dist/index.js', [], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
});

let testsCompleted = 0;
const totalTests = 8;

function checkComplete() {
  testsCompleted++;
  if (testsCompleted >= totalTests) {
    console.log('\n✅ All tests completed! Shutting down...');
    setTimeout(() => {
      agent.kill();
      process.exit(0);
    }, 1000);
  }
}

agent.stdout.on('data', (data) => {
  console.log(`[Agent] ${data.toString().trim()}`);
});

agent.stderr.on('data', (data) => {
  console.error(`[Agent Error] ${data.toString().trim()}`);
});

agent.on('message', (msg) => {
  console.log(`\n📨 Received: ${msg.type}`);

  if (msg.tools) {
    console.log(`   Available tools: ${msg.tools.join(', ')}`);
    checkComplete();
  }

  if (msg.result) {
    console.log(`   Result:`, JSON.stringify(msg.result, null, 2));
    checkComplete();
  }

  if (msg.text) {
    console.log(`   Response: ${msg.text}`);
    checkComplete();
  }

  if (msg.error) {
    console.error(`   ❌ Error: ${msg.error}`);
    checkComplete();
  }

  if (msg.version === 'persistent') {
    console.log('   ✅ Agent is running persistent memory version');
    checkComplete();
  }
});

// Test sequence
setTimeout(() => {
  console.log('\n🔧 Test 1: Wait for agent ready and check version');
}, 500);

setTimeout(() => {
  console.log('\n💾 Test 2: Store a value in persistent memory');
  agent.send({
    type: 'agent:tool:run',
    requestId: 'test-1',
    tool: 'memory:put',
    args: { key: 'user_preference:theme', value: 'dark' },
    convoId: 'test-convo',
  });
}, 1500);

setTimeout(() => {
  console.log('\n🔍 Test 3: Retrieve the stored value');
  agent.send({
    type: 'agent:tool:run',
    requestId: 'test-2',
    tool: 'memory:get',
    args: { key: 'user_preference:theme' },
    convoId: 'test-convo',
  });
}, 3000);

setTimeout(() => {
  console.log('\n💬 Test 4: Start a conversation with memory context');
  agent.send({
    type: 'agent:chat',
    convoId: 'test-convo',
    text: 'Hello! Can you check my memory for the theme setting?',
  });
}, 4500);

setTimeout(() => {
  console.log('\n🔧 Test 5: Direct shell command execution');
  agent.send({
    type: 'agent:tool:run',
    requestId: 'test-3',
    tool: 'shell.run',
    args: { command: 'pwd' },
    convoId: 'test-convo',
  });
}, 6500);

setTimeout(() => {
  console.log('\n📊 Test 6: Get system info');
  agent.send({
    type: 'agent:tool:run',
    requestId: 'test-4',
    tool: 'system.info',
    args: {},
    convoId: 'test-convo',
  });
}, 8500);

setTimeout(() => {
  console.log('\n📝 Test 7: Check recent conversation messages');
  agent.send({
    type: 'agent:tool:run',
    requestId: 'test-5',
    tool: 'memory:recent',
    args: { convoId: 'test-convo', limit: 5 },
    convoId: 'test-convo',
  });
}, 10500);

setTimeout(() => {
  console.log('\n💬 Test 8: Test enhanced chat with memory awareness');
  agent.send({
    type: 'agent:chat',
    convoId: 'test-convo-2',
    text: 'Show me what memory tools are available',
  });
}, 12500);
