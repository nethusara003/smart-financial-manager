const http = require('http');

// Replace with a valid token from your localStorage
const token = 'YOUR_TOKEN_HERE'; // Get this from browser localStorage.getItem('token')

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/financial-health/score?months=1',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on(' end', () => {
    console.log('RESPONSE BODY:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
