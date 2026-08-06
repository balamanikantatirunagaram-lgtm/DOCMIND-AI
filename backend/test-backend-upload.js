const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  try {
    const email = 'test' + Date.now() + '@docmind.ai';
    console.log("Registering as", email);
    const registerRes = await axios.post('http://localhost:5005/api/auth/register', {
      email,
      password: 'password123',
      name: "Test User", organizationName: "Test Org"
    });
    
    const token = registerRes.data.token;
    console.log("Logged in:", token.substring(0, 10) + '...');

    const form = new FormData();
    form.append('file', fs.createReadStream('backend/package.json'));
    form.append('title', 'test-upload.json');

    console.log("Uploading...");
    const uploadRes = await axios.post('http://localhost:5005/api/documents/upload', form, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      }
    });
    console.log("Upload Success:", uploadRes.status);

    const chatRes = await axios.post('http://localhost:5005/api/ai/chat', {
        message: 'Hello'
    }, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Chat Success:", chatRes.status);
    
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
