const axios = require('axios');

async function test() {
  try {
    const email = 'test_render_' + Date.now() + '@docmind.ai';
    const registerRes = await axios.post('https://docmind-ai-vmtb.onrender.com/api/auth/register', {
      email,
      password: 'password123',
      name: 'Test',
      organizationName: 'Org'
    });
    
    const token = registerRes.data.token;
    
    const chatsRes = await axios.get('https://docmind-ai-vmtb.onrender.com/api/ai/chats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Chats Success:", chatsRes.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
