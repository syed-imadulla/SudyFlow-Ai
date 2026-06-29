import app from './src/app.js';
import http from 'http';

const server = http.createServer(app);

server.listen(5001, async () => {
  try {
    const response = await fetch('http://localhost:5001/api/v1/health');
    const data = await response.json();
    console.log('STATUS:', response.status);
    console.log('HEADERS X-Request-ID:', response.headers.get('x-request-id'));
    console.log('BODY:', JSON.stringify(data, null, 2));
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('Test Failed:', err);
    server.close(() => process.exit(1));
  }
});
