#!/usr/bin/env node

/**
 * Test script to verify Rina AI Integration
 */

// Test the Rina AI Integration
async function testRinaIntegration() {
  console.log('🧪 Testing Rina AI Integration...\n');

  try {
    // Import our Rina integration
    const RinaAIIntegration = (await import('./src/ai/rina-ai-integration.js'))
      .default;

    console.log('✅ Successfully imported RinaAIIntegration');

    // Create an instance
    const rinaAI = new RinaAIIntegration();
    console.log('✅ Successfully created Rina instance');

    // Wait a moment for initialization
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test basic chat
    console.log('\n🗨️  Testing basic chat...');
    const response1 = await rinaAI.chat('Hello Rina!');
    console.log(`💖 Rina Response: ${response1.message}`);
    console.log(`😊 Mood: ${response1.mood} | Energy: ${response1.energy}/10`);

    // Test with different messages
    console.log('\n🗨️  Testing with a technical question...');
    const response2 = await rinaAI.chat('Help me with git commands');
    console.log(`💖 Rina Response: ${response2.message}`);

    // Test connection
    console.log('\n🔌 Testing connection...');
    const connectionTest = await rinaAI.testConnection();
    if (connectionTest.success) {
      console.log('✅ Rina connection test passed!');
    } else {
      console.log('❌ Connection test failed:', connectionTest.error);
    }

    // Get status
    console.log('\n📊 Getting Rina status...');
    const status = rinaAI.getRinaStatus();
    console.log('Status:', JSON.stringify(status, null, 2));

    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testRinaIntegration()
  .then(() => {
    console.log('\n✨ Test script finished');
  })
  .catch((error) => {
    console.error('💥 Test script error:', error);
  });
