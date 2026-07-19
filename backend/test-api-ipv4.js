import http from 'http';

http.get('http://127.0.0.1:5000/api/v1/planner/events?limit=2', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
