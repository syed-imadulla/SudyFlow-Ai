import http from 'http';

http.get('http://localhost:5000/api/v1/health', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Health check response:', data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
