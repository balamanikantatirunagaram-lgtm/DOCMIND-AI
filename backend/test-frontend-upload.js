const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5005/api/auth/login', {
      email: 'admin@docmind.ai',
      password: 'admin'
    });
    const token = loginRes.data.token;
    console.log("Logged in:", token.substring(0, 20) + '...');

    const form = new FormData();
    form.append('file', fs.createReadStream('package.json'));
    form.append('title', 'test-frontend.json');

    console.log("Uploading...");
    const uploadRes = await axios.post('http://localhost:5005/api/documents/upload', form, {
      headers: {
        'Authorization': `Bearer ${token}`
        // Notice NO form.getHeaders() to simulate browser which handles it automatically.
        // Wait, Node axios REQUIRES form.getHeaders().
        // In browser, passing NO headers works.
        // Let's pass the wrong header like the frontend USED to do.
      }
    });
    console.log(uploadRes.status);
  } catch (err) {
    console.error(err.message);
    if(err.response) console.error(err.response.data);
  }
}
test();
