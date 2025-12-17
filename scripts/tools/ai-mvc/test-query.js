// test-query.js
import { queryModel } from './src/ai/advanced-ai-manager.js';

(async () => {
  try {
    const out = await queryModel('Hello RinaWarp!');
    console.log('Response:', out); // out will be the AI response string
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
