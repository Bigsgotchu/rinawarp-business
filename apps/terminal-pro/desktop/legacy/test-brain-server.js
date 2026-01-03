const { startBrainServer } = require('./src/brain/server.js');

console.log('Starting RinaWarp Brain Server for testing...');

const brainServer = startBrainServer();

console.log('Brain server started with token:', brainServer.token);

// Keep the process running for testing
console.log('Press Ctrl+C to stop the server');

process.on('SIGINT', () => {
  console.log('\nShutting down brain server...');
  brainServer.stop();
  process.exit(0);
});

// Test endpoints after a short delay
setTimeout(async () => {
  console.log('\nTesting /status endpoint...');
  
  try {
    const response = await fetch('http://127.0.0.1:9337/status', {
      headers: {
        'Authorization': `Bearer ${brainServer.token}`
      }
    });
    
    const data = await response.json();
    console.log('Status response:', data);
  } catch (error) {
    console.error('Status test failed:', error.message);
  }
  
  console.log('\nTesting /plan endpoint...');
  
  try {
    const response = await fetch('http://127.0.0.1:9337/plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${brainServer.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: "Safely refactor auth flow without breaking production",
        context: {
          workspace: "/home/karina/rinawarp-business-dev",
          openFiles: ["auth.js"],
          selection: null,
          gitBranch: "feature/auth",
          editor: "vscode",
          buildChannel: "dev"
        }
      })
    });
    
    const data = await response.json();
    console.log('Plan response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Plan test failed:', error.message);
  }
}, 2000);