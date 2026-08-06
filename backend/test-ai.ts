import { AIService } from './src/services/AIService';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing NVIDIA API with model: nvidia/nemotron-3-super-120b-a12b...');
  
  if (!process.env.NVIDIA_API_KEY || process.env.NVIDIA_API_KEY === 'your_nvidia_api_key_here') {
    console.error('❌ ERROR: NVIDIA_API_KEY is missing or invalid in .env file.');
    console.error('Please paste your real API key in the backend/.env file and try again.');
    process.exit(1);
  }

  const ai = new AIService();
  try {
    const result = await ai.chat([{ role: 'user', content: 'Say "hello world" if you are online.' }]);
    console.log('✅ NVIDIA API Test Successful! Response:');
    console.log(result);
  } catch (err: any) {
    console.error('❌ NVIDIA API Test Failed:', err.message);
  }
}

test();
