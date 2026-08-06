const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  try {
    const email = 'test_render_' + Date.now() + '@docmind.ai';
    console.log("Registering as", email);
    const registerRes = await axios.post('https://docmind-ai-vmtb.onrender.com/api/auth/register', {
      email,
      password: 'password123',
      name: 'Test Render User',
      organizationName: 'Render Org'
    });
    
    const token = registerRes.data.token;
    console.log("Logged in:", token.substring(0, 10) + '...');

    const form = new FormData();
    form.append('file', fs.createReadStream('backend/package.json'));
    form.append('title', 'test-render.json');

    console.log("Uploading...");
    const uploadRes = await axios.post('https://docmind-ai-vmtb.onrender.com/api/documents/upload', form, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      }
    });
    console.log("Upload Success:", uploadRes.status);
  } catch (err) {
    console.error("Error occurred!");
    if(err.response) {
        console.error("Response data:", err.response.data);
    } else {
        console.error(err.message);
    }
  }
}
test();
