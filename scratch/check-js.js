const https = require('https');
const url = 'https://taskflow-inky-theta.vercel.app/assets/index-B7XKjbIX.js';

https.get(url, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', () => {}); // consume
}).on('error', (e) => {
  console.error(e);
});
