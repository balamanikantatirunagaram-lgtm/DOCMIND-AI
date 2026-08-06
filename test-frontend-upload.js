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
    form.append('file', fs.createReadStream('backend/package.json'));
    form.append('title', 'test-frontend.json');

    console.log("Uploading...");
    // Simulate what browser does: send formData without explicit Content-Type headers,
    // wait form-data in node requires headers. Let's see if we can do this browser style:
    // actually, node's axios NEEDS headers for form-data, but browser axios doesn't.
    // I already tested this in test-flow.ts.
  } catch (err) {
    console.error(err);
  }
}
test();
