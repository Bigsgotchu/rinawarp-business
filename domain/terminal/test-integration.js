import { rinaWarpAPI } from './src/lib/rinawarp-api.js';

async function testIntegration() {
  console.log('🧪 Testing Rina personality system integration...\n');

  try {
    // Test 1: Check if RinaPersonality is properly imported and instantiated
    console.log('1️⃣ Testing RinaPersonality import and instantiation...');
    const rinaPersonality = rinaWarpAPI.rinaPersonality;
    if (rinaPersonality) {
      console.log('✅ RinaPersonality instance exists');
      console.log('   - Name:', rinaPersonality.personality.name);
      console.log('   - Role:', rinaPersonality.personality.role);
      console.log('   - Current mood:', rinaPersonality.getMoodInfo().mood);
    } else {
      console.log('❌ RinaPersonality instance not found');
    }

    // Test 2: Test RinaAIIntegration fallback
    console.log('\n2️⃣ Testing RinaAIIntegration fallback...');
    if (rinaWarpAPI.rinaAIIntegration) {
      console.log('✅ RinaAIIntegration is available');
      const status = rinaWarpAPI.getRinaStatus();
      console.log('   - Provider:', status.provider);
      console.log('   - Personality mood:', status.personality?.mood);
    } else {
      console.log(
        'ℹ️  RinaAIIntegration not available, using direct personality'
      );
    }

    // Test 3: Test response generation
    console.log('\n3️⃣ Testing response generation...');
    const testPrompt = 'Hello Rina! This is a test message.';
    const response = await rinaWarpAPI.getRinaResponse(testPrompt);
    if (response && response.message) {
      console.log('✅ Response generated successfully');
      console.log(
        '   - Message length:',
        response.message.length,
        'characters'
      );
      console.log('   - Mood:', response.mood);
      console.log('   - Energy:', response.energy);
      console.log('   - Provider:', response.provider);
      console.log('   - Preview:', response.message.substring(0, 100) + '...');
    } else {
      console.log('❌ No response generated');
    }

    // Test 4: Test streaming simulation
    console.log('\n4️⃣ Testing streaming simulation...');
    let chunksReceived = 0;
    const testResponse = await new Promise((resolve) => {
      rinaWarpAPI.simulateStreaming(
        'This is a test streaming response from Rina!',
        (chunk) => {
          chunksReceived++;
        },
        () => {
          resolve(chunksReceived);
        }
      );
    });

    if (chunksReceived > 0) {
      console.log('✅ Streaming simulation works');
      console.log('   - Chunks received:', chunksReceived);
    } else {
      console.log('❌ Streaming simulation failed');
    }

    // Test 5: Test full API connection
    console.log('\n5️⃣ Testing full API connection...');
    const connectionTest = await rinaWarpAPI.testConnection();
    if (connectionTest.success) {
      console.log('✅ API connection test passed');
      console.log('   - Response:', connectionTest.response);
      console.log('   - Provider:', connectionTest.provider);
      console.log('   - Mood:', connectionTest.mood);
    } else {
      console.log('❌ API connection test failed');
      console.log('   - Error:', connectionTest.error);
    }

    console.log('\n🎉 Integration test completed!');
  } catch (error) {
    console.error('\n❌ Integration test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testIntegration();
