// Test the agent's responsiveness with the new Ollama integration
const testPrompt = "Hello, can you help me with a simple ls command?";

async function testAgent() {
  console.log("🧪 Testing Rina Agent responsiveness...");
  console.log("📝 Test prompt:", testPrompt);
  
  try {
    // Import the new Ollama function
    const { callOllama } = await import('./llm/ollama.js');
    
    console.log("⏱️  Starting request...");
    const startTime = Date.now();
    
    const response = await callOllama(testPrompt);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log("✅ Response received!");
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log("🤖 Response:", response);
    
    if (duration < 5000) {
      console.log("🎉 SUCCESS: Agent is responsive and fast!");
    } else {
      console.log("⚠️  Note: Response took longer than expected, but didn't timeout");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAgent();
